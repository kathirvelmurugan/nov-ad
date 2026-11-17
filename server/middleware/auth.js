import crypto from 'node:crypto';
import pool from '../db.js';

const SESSION_TTL_HOURS = 12;

/**
 * Issue a new session for a user. Inserts into the `sessions` table and
 * returns the token + expiry that the client must store.
 */
export async function issueSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString();

  // A token that is not persisted can never authenticate (requireAuth reads the
  // sessions table). Fail loudly instead of handing the client a dead token.
  await pool.query(
    `INSERT INTO sessions (token, user_id, role_code, hospital_id, phone, issued_at, expires_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
    [
      token,
      user.id,
      user.roleCode || user.role_code,
      user.hospitalId || user.hospital_id || null,
      user.phone || null,
      expiresAt,
    ]
  );

  return { token, expiresAt };
}

/**
 * Express middleware — parses `Authorization: Bearer <token>`, validates
 * the session, and sets `req.auth = { userId, role, hospitalId }`.
 * Sends 401 on missing/invalid/expired/revoked token.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing or malformed Authorization header' });
  }
  const token = parts[1];

  pool.query(
    `SELECT s.user_id, s.role_code, s.hospital_id, s.phone, s.expires_at, s.revoked_at,
            u.id AS account_id, u.status AS account_status
     FROM sessions s
     LEFT JOIN platform_users u ON u.id = s.user_id
     WHERE s.token = $1`,
    [token]
  )
    .then(({ rows }) => {
      if (!rows.length) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid session token' });
      }
      const sess = rows[0];
      if (sess.revoked_at) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Session revoked' });
      }
      if (new Date(sess.expires_at) < new Date()) {
        return res.status(401).json({ error: 'SESSION_EXPIRED', message: 'Session expired. Please log in again.' });
      }
      // Consultant magic-link sessions are case-scoped guests: they have no
      // platform_users row by design. Every other session must still map to a
      // live, active account — a deleted or deactivated user loses access at
      // that moment, not when the token happens to expire.
      const isMagicGuest = String(sess.user_id).startsWith('magic-');
      if (!isMagicGuest) {
        if (!sess.account_id) {
          return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Account no longer exists' });
        }
        if (sess.account_status && sess.account_status !== 'active') {
          return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Account is not active' });
        }
      }
      req.auth = {
        userId: sess.user_id,
        role: sess.role_code,
        hospitalId: sess.hospital_id,
        phone: sess.phone || null,
      };
      next();
    })
    .catch((err) => {
      // Fail closed: a session store failure must never authenticate the request.
      console.error('[auth] session lookup failed:', err.message);
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Session validation failed' });
    });
}

/**
 * Express middleware factory — requires one of the given roles.
 * Must follow `requireAuth` in the middleware chain.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
    }
    if (req.auth.degraded) {
      return res.status(503).json({ error: 'SERVICE_DEGRADED', message: 'Authentication service unavailable' });
    }
    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: `Role ${req.auth.role} is not permitted for this resource` });
    }
    next();
  };
}

export { SESSION_TTL_HOURS };