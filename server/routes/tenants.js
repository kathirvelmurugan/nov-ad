import express from 'express';
import crypto from 'crypto';
import pool from '../db.js';

const router = express.Router();

// Postgres is the single source of truth: no memory mirrors. A database failure
// is surfaced as a 500 so the client can show an honest error instead of stale
// or fabricated tenant records.
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tenants ORDER BY created_at DESC');
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('[tenants] GET error:', error.message);
    return res.status(500).json({ success: false, error: 'TENANTS_UNAVAILABLE', message: 'Tenant directory could not be loaded' });
  }
});

router.post('/', async (req, res) => {
  const { id, nameEn, nameAr, city, mciLicenseNumber, status, hospitalAdminName, hospitalAdminPhone, doctorCount } = req.body || {};

  const clean = (v) => (typeof v === 'string' ? v.trim() : '');
  const nameEnValue = clean(nameEn);
  const nameArValue = clean(nameAr);
  const cityValue = clean(city);

  // tenants.name_en / name_ar / city are NOT NULL: reject instead of inventing values.
  if (!nameEnValue || !nameArValue || !cityValue) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_TENANT',
      message: 'nameEn, nameAr and city are required fields.'
    });
  }

  const tenantId = id ? String(id) : crypto.randomUUID();

  try {
    const query = `
      INSERT INTO tenants (id, name_en, name_ar, city, mci_license_number, status, hospital_admin_name, hospital_admin_phone, doctor_count, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name_en = EXCLUDED.name_en,
        name_ar = EXCLUDED.name_ar,
        city = EXCLUDED.city,
        mci_license_number = EXCLUDED.mci_license_number,
        status = EXCLUDED.status,
        hospital_admin_name = EXCLUDED.hospital_admin_name,
        hospital_admin_phone = EXCLUDED.hospital_admin_phone,
        doctor_count = EXCLUDED.doctor_count
      RETURNING *;
    `;

    const values = [
      tenantId,
      nameEnValue,
      nameArValue,
      cityValue,
      clean(mciLicenseNumber) || null,
      clean(status) || 'active',
      clean(hospitalAdminName) || null,
      clean(hospitalAdminPhone) || null,
      Number.isFinite(Number(doctorCount)) ? Number(doctorCount) : 0
    ];

    const result = await pool.query(query, values);

    // Keep the cached doctor count truthful: it is derived from enrolled doctors,
    // never from a hand-typed number.
    await pool.query(
      `UPDATE tenants t SET doctor_count = (
         SELECT COUNT(*) FROM platform_users u
          WHERE u.role_code = 'D' AND u.hospital_id = t.id AND (u.status = 'active' OR u.status IS NULL)
       ) WHERE t.id = $1`,
      [tenantId]
    );
    const refreshed = await pool.query('SELECT * FROM tenants WHERE id = $1', [tenantId]);

    return res.status(201).json({ success: true, data: refreshed.rows[0] || result.rows[0] });
  } catch (error) {
    console.error('[tenants] POST error:', error.message);
    return res.status(500).json({ success: false, error: 'TENANT_SAVE_FAILED', message: 'Tenant could not be persisted. Nothing was created.' });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const status = String((req.body || {}).status || '').toLowerCase();
  if (!['active', 'pending', 'suspended'].includes(status)) {
    return res.status(400).json({ success: false, error: 'INVALID_STATUS', message: "status must be 'active', 'pending' or 'suspended'" });
  }

  try {
    const result = await pool.query('UPDATE tenants SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('[tenants] PATCH status error:', error.message);
    return res.status(500).json({ success: false, error: 'TENANT_STATUS_FAILED', message: 'Tenant status could not be persisted. Nothing changed.' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM tenants WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }
    return res.status(200).json({ success: true, message: 'Tenant deleted successfully.' });
  } catch (error) {
    console.error('[tenants] DELETE error:', error.message);
    return res.status(500).json({ success: false, error: 'TENANT_DELETE_FAILED', message: 'Tenant could not be deleted. Nothing changed.' });
  }
});

export default router;