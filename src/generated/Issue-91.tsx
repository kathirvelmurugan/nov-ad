import { Router } from 'express';
import pool from '../db.js';
import { memoryUsers } from '../store.js';

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
  return raw;
};

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM platform_users ORDER BY created_at DESC');
    const mapped = rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      phone: row.phone,
      roleCode: row.role_code,
      pin: row.pin || null,
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

  try {
    await pool.query(
      'UPDATE platform_users SET pin = $1 WHERE phone = $2',
      [String(pin), normalizedPhone]
    );
  } catch (err) {
    console.error('[users] pin update postgres error:', err.message);
  }

  const memIdx = memoryUsers.findIndex(
    (u) => u.phone === normalizedPhone || u.phone === phone
  );
  if (memIdx !== -1) {
    memoryUsers[memIdx] = { ...memoryUsers[memIdx], pin: String(pin), phone: normalizedPhone };
  }

  return res.json({ success: true, phone: normalizedPhone });
});

router.post('/', async (req, res) => {
  const { fullName, phone, roleCode, pin } = req.body || {};

  if (!fullName || !phone || !roleCode) {
    return res.status(400).json({ error: 'fullName, phone, and roleCode are required' });
  }

  const normalizedPhone = normalizePhone(phone);
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