import { Router } from 'express';
import pool from '../db.js';
import { memoryUsers } from '../store.js';
import { issueSession, requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const normalizePhone = (raw) => {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('966')) {
    return `+${digits}`;
  }
  if (digits.startsWith('05')) {
    return `+966${digits.slice(1)}`;
  }
  if (digits.startsWith('5') && digits.length === 9) {
    return `+966${digits}`;
  }
  if (digits.startsWith('91')) {
    return `+${digits}`;
  }
  return raw;
};

// Mirrors src/utils/phoneValidation.ts — storage is normalised, but malformed input is rejected.
const PHONE_RE = /^\+9665\d{8}$|^\+91[6-9]\d{9}$/;
const PIN_RE = /^\d{4,6}$/;

// Legacy rows may hold "+966 50 000 0099" or "0500000099"; compare on digits only.
const digitsOf = (value) => String(value ?? '').replace(/\D/g, '');
const samePhone = (stored, normalized, raw) =>
  stored === normalized || stored === raw || digitsOf(stored) === digitsOf(normalized);

const invalidPhone = (res) =>
  res.status(400).json({
    success: false,
    error: 'INVALID_PHONE',
    message: 'Phone must be a valid Saudi (+966 5XXXXXXXX) or Indian (+91 6-9XXXXXXXXX) mobile number.',
  });

const invalidPin = (res) =>
  res.status(400).json({
    success: false,
    error: 'INVALID_PIN',
    message: 'PIN must be 4 to 6 digits.',
  });

router.post('/login', async (req, res) => {
  const { phone, pin } = req.body || {};
  if (!phone || !pin) {
    return res.status(400).json({ success: false, error: 'phone and pin are required' });
  }
  const normalizedPhone = normalizePhone(phone);
  if (!PHONE_RE.test(normalizedPhone)) return invalidPhone(res);
  const normalizedDigits = digitsOf(normalizedPhone);
  try {
    const { rows } = await pool.query(
      `SELECT * FROM platform_users
        WHERE (phone = $1 OR phone = $2 OR regexp_replace(phone, '\\D', '', 'g') = $3)
          AND pin = $4 AND (status = 'active' OR status IS NULL) LIMIT 1`,
      [normalizedPhone, phone, normalizedDigits, String(pin)]
    );
    if (rows.length > 0) {
      const user = rows[0];
      const session = await issueSession(user);
      return res.json({
        success: true,
        data: {
          id: user.id,
          fullName: user.full_name,
          fullNameAr: user.full_name_ar,
          phone: user.phone,
          roleCode: user.role_code,
          hospitalId: user.hospital_id,
          department: user.department,
          status: user.status || 'active',
          token: session.token,
          expiresAt: session.expiresAt,
        }
      });
    }
  } catch (err) {
    console.error('[users/login] DB check error:', err.message);
  }
  const memUser = memoryUsers.find(
    (u) => samePhone(u.phone, normalizedPhone, phone) && String(u.pin) === String(pin)
  );
  if (memUser) {
    const session = await issueSession(memUser);
    const { pin, ...safeUser } = memUser;
    return res.json({ success: true, data: { ...safeUser, token: session.token, expiresAt: session.expiresAt } });
  }
  return res.status(401).json({ success: false, error: 'Invalid phone or PIN' });
});

// POST /api/users/lookup — existence check, no rows returned, no pins exposed
router.post('/lookup', async (req, res) => {
  const { phone } = req.body || {};
  if (!phone) {
    return res.status(400).json({ success: false, error: 'phone is required' });
  }
  const normalizedPhone = normalizePhone(phone);
  try {
    const { rows } = await pool.query(
      `SELECT id, role_code, has_custom_pin FROM platform_users
        WHERE (phone = $1 OR phone = $2 OR regexp_replace(phone, '\\D', '', 'g') = $3)
          AND (status = 'active' OR status IS NULL) LIMIT 1`,
      [normalizedPhone, phone, digitsOf(normalizedPhone)]
    );
    if (rows.length > 0) {
      return res.json({ success: true, exists: true, requiresPin: Boolean(rows[0].has_custom_pin), requiresAccessCode: !Boolean(rows[0].has_custom_pin) });
    }
    // Check memory fallback
    const memUser = memoryUsers.find((u) => samePhone(u.phone, normalizedPhone, phone));
    if (memUser) {
      return res.json({ success: true, exists: true, requiresPin: Boolean(memUser.hasCustomPin), requiresAccessCode: !Boolean(memUser.hasCustomPin) });
    }
    return res.json({ success: true, exists: false, requiresPin: false, requiresAccessCode: false });
  } catch (err) {
    console.error('[users/lookup] DB error:', err.message);
    const memUser = memoryUsers.find((u) => samePhone(u.phone, normalizedPhone, phone));
    if (memUser) {
      return res.json({ success: true, exists: true, requiresPin: Boolean(memUser.hasCustomPin), requiresAccessCode: !Boolean(memUser.hasCustomPin) });
    }
    return res.json({ success: true, exists: false, requiresPin: false, requiresAccessCode: false });
  }
});

router.get('/', requireAuth, requireRole('AD'), async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM platform_users ORDER BY created_at DESC');
    const mapped = rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      phone: row.phone,
      roleCode: row.role_code,
      pin: row.pin || null,
      hasCustomPin: Boolean(row.has_custom_pin || row.pin),
      createdAt: row.created_at,
    }));
    return res.json(mapped);
  } catch (err) {
    console.error('[users] postgres fallback to memory:', err.message);
    return res.json([...memoryUsers]);
  }
});

router.post('/pin', async (req, res) => {
  const { phone, pin } = req.body || {};

  if (!phone || !pin) {
    return res.status(400).json({ error: 'phone and pin are required' });
  }

  const normalizedPhone = normalizePhone(phone);
  if (!PHONE_RE.test(normalizedPhone)) return invalidPhone(res);
  if (!PIN_RE.test(String(pin))) return invalidPin(res);

  const normalizedDigits = digitsOf(normalizedPhone);
  try {
    const updateRes = await pool.query(
      `UPDATE platform_users SET pin = $1, has_custom_pin = TRUE
        WHERE phone = $2 OR regexp_replace(phone, '\\D', '', 'g') = $3 RETURNING id`,
      [String(pin), normalizedPhone, normalizedDigits]
    );
    if (updateRes.rowCount === 0) {
      await pool.query(
        `INSERT INTO platform_users (full_name, phone, role_code, pin, has_custom_pin)
         VALUES ($1, $2, 'P', $3, TRUE)
         ON CONFLICT (phone) DO UPDATE SET pin = EXCLUDED.pin, has_custom_pin = TRUE`,
        ['Patient', normalizedPhone, String(pin)]
      );
    }
  } catch (err) {
    console.error('[users] pin update postgres error:', err.message);
  }

  const memIdx = memoryUsers.findIndex((u) => samePhone(u.phone, normalizedPhone, phone));
  if (memIdx !== -1) {
    memoryUsers[memIdx] = { ...memoryUsers[memIdx], pin: String(pin), hasCustomPin: true, phone: normalizedPhone };
  } else {
    memoryUsers.push({
      id: `patient-${Date.now()}`,
      fullName: 'Patient',
      phone: normalizedPhone,
      roleCode: 'P',
      pin: String(pin),
      hasCustomPin: true,
      createdAt: new Date().toISOString()
    });
  }

  return res.json({ success: true, phone: normalizedPhone });
});

router.post('/', requireAuth, requireRole('AD'), async (req, res) => {
  const { fullName, phone, roleCode, pin } = req.body || {};

  if (!fullName || !phone || !roleCode) {
    return res.status(400).json({ error: 'fullName, phone, and roleCode are required' });
  }

  const normalizedPhone = normalizePhone(phone);
  if (!PHONE_RE.test(normalizedPhone)) return invalidPhone(res);
  if (pin && !PIN_RE.test(String(pin))) return invalidPin(res);

  const payload = {
    fullName: String(fullName).trim(),
    phone: normalizedPhone,
    roleCode: String(roleCode).trim(),
    pin: pin ? String(pin) : null,
  };

  try {
    const { rows } = await pool.query(
      `INSERT INTO platform_users (full_name, phone, role_code, pin)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (phone) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         role_code = EXCLUDED.role_code,
         pin = COALESCE(EXCLUDED.pin, platform_users.pin)
       RETURNING id, full_name AS "fullName", phone, role_code AS "roleCode", pin, created_at AS "createdAt"`,
      [payload.fullName, payload.phone, payload.roleCode, payload.pin]
    );

    const existingMemIdx = memoryUsers.findIndex((u) => u.phone === payload.phone);
    if (existingMemIdx !== -1) {
      memoryUsers[existingMemIdx] = { ...memoryUsers[existingMemIdx], ...payload, id: rows[0].id };
    } else {
      memoryUsers.push({ ...payload, id: rows[0].id, createdAt: rows[0].createdAt });
    }

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[users] upsert postgres error, falling back to memory:', err.message);

    const existingMemIdx = memoryUsers.findIndex((u) => u.phone === payload.phone);
    if (existingMemIdx !== -1) {
      memoryUsers[existingMemIdx] = { ...memoryUsers[existingMemIdx], ...payload };
      return res.json(memoryUsers[existingMemIdx]);
    }

    const newEntry = {
      ...payload,
      id: memoryUsers.length > 0 ? Math.max(...memoryUsers.map((u) => Number(u.id) || 0)) + 1 : 1,
      createdAt: new Date().toISOString(),
    };
    memoryUsers.push(newEntry);
    return res.status(201).json(newEntry);
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'id is required' });
  }

  try {
    await pool.query('DELETE FROM platform_users WHERE id = $1', [id]);
  } catch (err) {
    console.error('[users] delete postgres error:', err.message);
  }

  const memIdx = memoryUsers.findIndex((u) => String(u.id) === String(id));
  if (memIdx !== -1) {
    memoryUsers.splice(memIdx, 1);
  }

  return res.json({ success: true, deletedId: id });
});

export default router;