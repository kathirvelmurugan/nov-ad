import { Router } from 'express';
import pool from '../db.js';
import { memoryAudit } from '../store.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200'
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Audit GET fallback triggered:', error.message);
    const fallbackLogs = [...memoryAudit]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 200);
    return res.status(200).json(fallbackLogs);
  }
});

router.post('/', async (req, res) => {
  const { actionType, details } = req.body;

  if (!actionType || typeof actionType !== 'string' || actionType.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'actionType is required and must be a non-empty string.'
    });
  }

  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const timestamp = new Date().toISOString();

  const logEntry = {
    actionType: actionType.trim(),
    details: details || null,
    ip,
    timestamp
  };

  try {
    await pool.query(
      'INSERT INTO audit_logs (action_type, details, ip, timestamp) VALUES ($1, $2, $3, $4)',
      [logEntry.actionType, logEntry.details, logEntry.ip, logEntry.timestamp]
    );
    return res.status(201).json({ success: true, data: logEntry });
  } catch (error) {
    console.error('Audit POST fallback triggered:', error.message);
    memoryAudit.push(logEntry);
    return res.status(201).json({ success: true, data: logEntry, fallback: true });
  }
});

export default router;