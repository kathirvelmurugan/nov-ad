import express from 'express';
import crypto from 'crypto';
import pool from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Mirrors server/routes/users.js: storage is normalised, malformed input is rejected.
const PHONE_RE = /^\+9665\d{8}$|^\+91[6-9]\d{9}$/;

const normalizePhone = (raw) => {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('966')) return `+${digits}`;
  if (digits.startsWith('05')) return `+966${digits.slice(1)}`;
  if (digits.startsWith('5') && digits.length === 9) return `+966${digits}`;
  if (digits.startsWith('91')) return `+${digits}`;
  return String(raw).trim();
};

// Legacy rows may hold "+966 50 000 0099"; compare on digits only.
const digitsOf = (value) => String(value ?? '').replace(/\D/g, '');

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

// Onboarding a hospital and onboarding its administrator are ONE operation.
//
// This endpoint used to write hospital_admin_name / hospital_admin_phone as free
// text and create no platform_users row. The administrator's first sign-in then
// found no account, fell through to the public patient endpoint, and the platform
// registered the medical-centre admin as role 'P'. Every downstream symptom —
// "admin sees the patient portal", "no HA exists", "doctors cannot be created" —
// started here. The account is now created (or promoted) in the same transaction.
router.post('/', requireAuth, requireRole('AD'), async (req, res) => {
  const { id, nameEn, nameAr, city, mciLicenseNumber, status, hospitalAdminName, hospitalAdminPhone } = req.body || {};

  const clean = (v) => (typeof v === 'string' ? v.trim() : '');
  const nameEnValue = clean(nameEn);
  const nameArValue = clean(nameAr);
  const cityValue = clean(city);
  const adminNameValue = clean(hospitalAdminName);
  const adminPhoneValue = normalizePhone(clean(hospitalAdminPhone));

  // tenants.name_en / name_ar / city are NOT NULL: reject instead of inventing values.
  if (!nameEnValue || !nameArValue || !cityValue) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_TENANT',
      message: 'nameEn, nameAr and city are required fields.'
    });
  }

  // A tenant without an identified administrator is exactly the broken state this
  // endpoint used to produce: reject instead of inventing a name or a phone.
  if (!adminNameValue || !adminPhoneValue) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_TENANT_ADMIN',
      message: 'hospitalAdminName and hospitalAdminPhone are required: the administrator account is created together with the hospital.'
    });
  }
  if (!PHONE_RE.test(adminPhoneValue)) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_PHONE',
      message: 'Admin phone must be a valid Saudi (+966 5XXXXXXXX) or Indian (+91 6-9XXXXXXXXX) mobile number.'
    });
  }

  const tenantId = id ? String(id) : crypto.randomUUID();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO tenants (id, name_en, name_ar, city, mci_license_number, status, hospital_admin_name, hospital_admin_phone, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (id) DO UPDATE SET
         name_en = EXCLUDED.name_en,
         name_ar = EXCLUDED.name_ar,
         city = EXCLUDED.city,
         mci_license_number = EXCLUDED.mci_license_number,
         status = EXCLUDED.status,
         hospital_admin_name = EXCLUDED.hospital_admin_name,
         hospital_admin_phone = EXCLUDED.hospital_admin_phone`,
      [
        tenantId,
        nameEnValue,
        nameArValue,
        cityValue,
        clean(mciLicenseNumber) || null,
        clean(status) || 'active',
        adminNameValue,
        adminPhoneValue,
      ]
    );

    // Resolve the administrator identity by digits, because phone is UNIQUE:
    // a number that already signed in as a patient is promoted in place, and a
    // number that is already staff is never silently converted into an HA.
    const found = await client.query(
      `SELECT id, role_code, hospital_id, (pin IS NOT NULL) AS has_pin FROM platform_users
        WHERE phone = $1 OR regexp_replace(phone, '\\D', '', 'g') = $2
        ORDER BY (phone = $1) DESC
        LIMIT 1
        FOR UPDATE`,
      [adminPhoneValue, digitsOf(adminPhoneValue)]
    );

    let adminAccount;
    if (found.rowCount > 0) {
      const existing = found.rows[0];
      const existingRole = String(existing.role_code || '').toUpperCase();

      if (existingRole !== 'P' && existingRole !== 'HA') {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          error: 'PHONE_IS_STAFF',
          message: `This number already belongs to a '${existingRole}' staff account. Use a different administrator number, or change that account's role first.`
        });
      }

      // Never let one hospital silently take over another hospital's admin.
      if (existingRole === 'HA' && existing.hospital_id && String(existing.hospital_id) !== tenantId) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          error: 'ADMIN_BOUND_ELSEWHERE',
          message: 'This number is already the administrator of another hospital. Use a different number for this tenant.'
        });
      }

      if (existingRole === 'P') {
        // Promotion keeps the PIN this person already set for themselves: it is
        // theirs, and rotating it here would lock them out of the very fix that
        // gives them the hospital portal.
        await client.query(
          `UPDATE platform_users
              SET role_code = 'HA', full_name = $1, phone = $2, hospital_id = $3,
                  status = 'active', has_custom_pin = (pin IS NOT NULL),
                  activated_at = COALESCE(activated_at, NOW())
            WHERE id = $4`,
          [adminNameValue, adminPhoneValue, tenantId, existing.id]
        );
        adminAccount = { id: existing.id, phone: adminPhoneValue, created: false, promotedFromPatient: true, initialPin: null };
      } else {
        await client.query(
          `UPDATE platform_users SET full_name = $1, hospital_id = $2, status = 'active' WHERE id = $3`,
          [adminNameValue, tenantId, existing.id]
        );
        adminAccount = { id: existing.id, phone: adminPhoneValue, created: false, promotedFromPatient: false, initialPin: null };
      }

      // A role/tenant change must take effect now: an existing session still
      // carries the old role_code and hospital_id and would keep the old portal.
      await client.query('UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [existing.id]);
    } else {
      const initialPin = String(crypto.randomInt(1000, 10000));
      const inserted = await client.query(
        `INSERT INTO platform_users (id, full_name, phone, role_code, pin, has_custom_pin, hospital_id, status, activated_at)
         VALUES ('staff-' || replace(gen_random_uuid()::text, '-', ''), $1, $2, 'HA', $3, TRUE, $4, 'active', NOW())
         RETURNING id`,
        [adminNameValue, adminPhoneValue, initialPin, tenantId]
      );
      adminAccount = { id: inserted.rows[0].id, phone: adminPhoneValue, created: true, promotedFromPatient: false, initialPin };
    }

    // Keep the cached doctor count truthful: it is derived from enrolled doctors,
    // never from a hand-typed number.
    await client.query(
      `UPDATE tenants t SET doctor_count = (
         SELECT COUNT(*) FROM platform_users u
          WHERE u.role_code = 'D' AND u.hospital_id = t.id AND (u.status = 'active' OR u.status IS NULL)
       ) WHERE t.id = $1`,
      [tenantId]
    );

    await client.query('COMMIT');

    const refreshed = await pool.query('SELECT * FROM tenants WHERE id = $1', [tenantId]);
    return res.status(201).json({ success: true, data: refreshed.rows[0], adminAccount });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[tenants] POST error:', error.message);
    return res.status(500).json({ success: false, error: 'TENANT_SAVE_FAILED', message: 'Tenant could not be persisted. Nothing was created.' });
  } finally {
    client.release();
  }
});

router.patch('/:id/status', requireAuth, requireRole('AD'), async (req, res) => {
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

router.delete('/:id', requireAuth, requireRole('AD'), async (req, res) => {
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