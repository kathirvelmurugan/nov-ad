import { Router } from 'express';
import crypto from 'node:crypto';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200'
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('[audit] GET error:', error.message);
    return res.status(500).json({ error: 'AUDIT_UNAVAILABLE', message: 'Audit log could not be loaded' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { actionType, target, details } = req.body || {};

  if (!actionType || typeof actionType !== 'string' || actionType.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'actionType is required and must be a non-empty string.'
    });
  }

  // Actor identity comes from the session, never from the request body: an audit
  // trail that the caller can sign on someone else's behalf is worthless.
  const logEntry = {
    id: `audit-${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    actorName: req.auth.userId,
    actorRole: req.auth.role,
    hospitalId: req.auth.hospitalId || null,
    actionType: actionType.trim(),
    target: target ? String(target) : '',
    details: details ? String(details) : null,
    ipAddress: req.ip || req.socket?.remoteAddress || null,
  };

  try {
    await pool.query(
      `INSERT INTO audit_logs (id, timestamp, actor_name, actor_role, hospital_id, action_type, target, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        logEntry.id,
        logEntry.timestamp,
        logEntry.actorName,
        logEntry.actorRole,
        logEntry.hospitalId,
        logEntry.actionType,
        logEntry.target,
        logEntry.details,
        logEntry.ipAddress,
      ]
    );
    return res.status(201).json({ success: true, data: logEntry });
  } catch (error) {
    // Audit writes must fail loudly: a log line kept only in memory disappears
    // on restart and silently breaks the audit trail.
    console.error('[audit] POST error:', error.message);
    return res.status(500).json({ success: false, error: 'AUDIT_SAVE_FAILED', message: 'Audit entry could not be persisted. Nothing was written.' });
  }
});

export default router;