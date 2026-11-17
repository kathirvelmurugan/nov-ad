import { Router } from 'express';
import pool from '../db.js';
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
    return res.status(401).json({ success: false, error: 'Invalid phone or PIN' });
  } catch (err) {
    // No in-memory accounts: a database outage must never turn into a second
    // credential store that drifts from the real one.
    console.error('[users/login] DB error:', err.message);
    return res.status(503).json({
      success: false,
      error: 'AUTH_UNAVAILABLE',
      message: 'Sign-in is temporarily unavailable. Please retry.',
    });
  }
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
    return res.json({ success: true, exists: false, requiresPin: false, requiresAccessCode: false });
  } catch (err) {
    console.error('[users/lookup] DB error:', err.message);
    return res.status(503).json({
      success: false,
      error: 'AUTH_UNAVAILABLE',
      message: 'Account lookup is temporarily unavailable. Please retry.',
    });
  }
});

router.get('/', requireAuth, requireRole('AD', 'HA'), async (req, res) => {
  const isHospitalAdmin = req.auth.role === 'HA';
  if (isHospitalAdmin && !req.auth.hospitalId) {
    return res.status(403).json({ error: 'NO_TENANT', message: 'Hospital admin session has no tenant binding' });
  }
  try {
    const { rows } = await pool.query(
      isHospitalAdmin
        ? 'SELECT * FROM platform_users WHERE hospital_id = $1 ORDER BY created_at DESC'
        : 'SELECT * FROM platform_users ORDER BY created_at DESC',
      isHospitalAdmin ? [req.auth.hospitalId] : []
    );
    const mapped = rows.map((row) => ({
      id: row.id,
      staffCode: row.staff_code || row.id,
      fullName: row.full_name,
      fullNameAr: row.full_name_ar,
      phone: row.phone,
      roleCode: row.role_code,
      hospitalId: row.hospital_id,
      pin: row.pin || null,
      hasCustomPin: Boolean(row.has_custom_pin || row.pin),
      // The UI must mirror the DB row, not assume 'active': a status that only
      // ever lived in localStorage silently reverted on next load.
      status: row.status || 'active',
      createdAt: row.created_at,
    }));
    return res.json(mapped);
  } catch (err) {
    console.error('[users] GET error:', err.message);
    return res.status(500).json({ error: 'USERS_UNAVAILABLE', message: 'Staff directory could not be loaded' });
  }
});

// Public patient self-registration: an unseen phone becomes a patient row with
// the PIN its owner chose. This endpoint must never rewrite an existing PIN or
// touch a staff account — otherwise knowing a phone number would be enough to
// take that account over.
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
    const existing = await pool.query(
      `SELECT id, role_code, has_custom_pin FROM platform_users
        WHERE phone = $1 OR regexp_replace(phone, '\\D', '', 'g') = $2 LIMIT 1`,
      [normalizedPhone, normalizedDigits]
    );

    if (existing.rowCount > 0) {
      const row = existing.rows[0];
      if (row.role_code !== 'P') {
        return res.status(403).json({
          success: false,
          error: 'STAFF_PIN_PROTECTED',
          message: 'Staff PINs are issued by an administrator, not through public registration.',
        });
      }
      if (row.has_custom_pin) {
        return res.status(409).json({
          success: false,
          error: 'PIN_ALREADY_SET',
          message: 'This account already has a PIN. Sign in with it instead.',
        });
      }
      await pool.query(
        'UPDATE platform_users SET pin = $1, has_custom_pin = TRUE WHERE id = $2',
        [String(pin), row.id]
      );
      return res.json({ success: true, phone: normalizedPhone });
    }

    await pool.query(
      `INSERT INTO platform_users (id, full_name, phone, role_code, pin, has_custom_pin)
       VALUES ('patient-' || replace(gen_random_uuid()::text, '-', ''), $1, $2, 'P', $3, TRUE)`,
      ['Patient', normalizedPhone, String(pin)]
    );
  } catch (err) {
    // A PIN accepted only in RAM would break on restart and strand the patient.
    console.error('[users] pin update postgres error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'PIN_NOT_SAVED',
      message: 'PIN could not be saved. Nothing was changed.',
    });
  }

  return res.json({ success: true, phone: normalizedPhone });
});

// Authenticated self-service PIN change. The current PIN is required so a
// stolen token alone cannot lock the real owner out.
router.post('/me/pin', requireAuth, async (req, res) => {
  const { currentPin, newPin } = req.body || {};
  if (!currentPin || !newPin) {
    return res.status(400).json({ error: 'currentPin and newPin are required' });
  }
  if (!PIN_RE.test(String(newPin))) return invalidPin(res);
  try {
    const { rowCount } = await pool.query(
      'UPDATE platform_users SET pin = $1, has_custom_pin = TRUE WHERE id = $2 AND pin = $3',
      [String(newPin), req.auth.userId, String(currentPin)]
    );
    if (rowCount === 0) {
      return res.status(401).json({ error: 'INVALID_PIN', message: 'Current PIN is incorrect.' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[users] self-service pin error:', err.message);
    return res.status(500).json({ error: 'PIN_NOT_SAVED', message: 'PIN could not be saved.' });
  }
});

// Staff enrollment is a staff-only operation: free-text role codes are rejected,
// so a typo can never produce an account that RBAC cannot route. Hospital Admins
// may enroll clinical staff into their own tenant only.
const STAFF_ROLE_CODES = ['AD', 'HA', 'C', 'N', 'D', 'K', 'L', 'PH', 'REC'];
const TENANT_ROLE_CODES = ['D', 'N', 'L', 'PH', 'REC'];

router.post('/', requireAuth, requireRole('AD', 'HA'), async (req, res) => {
  const { fullName, fullNameAr, phone, roleCode, pin, hospitalId, staffCode, department, scfhsLicense } = req.body || {};

  if (!fullName || !phone || !roleCode) {
    return res.status(400).json({ error: 'fullName, phone, and roleCode are required' });
  }

  const normalizedPhone = normalizePhone(phone);
  if (!PHONE_RE.test(normalizedPhone)) return invalidPhone(res);
  if (pin && !PIN_RE.test(String(pin))) return invalidPin(res);

  const requestedRole = String(roleCode).trim().toUpperCase();
  if (!STAFF_ROLE_CODES.includes(requestedRole)) {
    return res.status(400).json({ error: 'INVALID_ROLE', message: `Role ${requestedRole} is not a staff role` });
  }

  // No shared/default PIN. When the administrator does not type one, the server
  // mints a random PIN and returns it exactly once so it can be handed over.
  const pinWasProvided = Boolean(pin);
  const initialPin = pin ? String(pin) : String(Math.floor(1000 + Math.random() * 9000));

  const actorIsHospitalAdmin = req.auth.role === 'HA';
  if (actorIsHospitalAdmin && !TENANT_ROLE_CODES.includes(requestedRole)) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Hospital admins may only enroll clinical staff (D, N, L, PH, REC) for their own hospital',
    });
  }

  const tenantId = actorIsHospitalAdmin
    ? req.auth.hospitalId
    : (hospitalId ? String(hospitalId) : null);
  if (actorIsHospitalAdmin && !tenantId) {
    return res.status(403).json({ error: 'NO_TENANT', message: 'Hospital admin session has no tenant binding' });
  }

  const payload = {
    fullName: String(fullName).trim(),
    fullNameAr: fullNameAr ? String(fullNameAr).trim() : null,
    phone: normalizedPhone,
    roleCode: requestedRole,
    pin: initialPin,
    hospitalId: tenantId,
    staffCode: staffCode ? String(staffCode).trim().slice(0, 50) : null,
    department: department ? String(department).trim().slice(0, 100) : null,
    scfhsLicense: scfhsLicense ? String(scfhsLicense).trim().slice(0, 50) : null,
  };

  try {
    const { rows } = await pool.query(
      `INSERT INTO platform_users
         (id, staff_code, full_name, full_name_ar, phone, role_code, pin, has_custom_pin, hospital_id, status, department, scfhs_license)
       VALUES
         ('staff-' || replace(gen_random_uuid()::text, '-', ''), $1, $2, $3, $4, $5, $6, $8, $7, 'active', $9, $10)
       ON CONFLICT (phone) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         full_name_ar = COALESCE(EXCLUDED.full_name_ar, platform_users.full_name_ar),
         role_code = EXCLUDED.role_code,
         staff_code = COALESCE(EXCLUDED.staff_code, platform_users.staff_code),
         pin = COALESCE(EXCLUDED.pin, platform_users.pin),
         has_custom_pin = platform_users.has_custom_pin OR EXCLUDED.has_custom_pin,
         hospital_id = COALESCE(EXCLUDED.hospital_id, platform_users.hospital_id),
         department = COALESCE(EXCLUDED.department, platform_users.department),
         scfhs_license = COALESCE(EXCLUDED.scfhs_license, platform_users.scfhs_license)
       RETURNING id, staff_code AS "staffCode", full_name AS "fullName", full_name_ar AS "fullNameAr",
                 phone, role_code AS "roleCode", hospital_id AS "hospitalId",
                 has_custom_pin AS "hasCustomPin", created_at AS "createdAt"`,
      [payload.staffCode, payload.fullName, payload.fullNameAr, payload.phone, payload.roleCode, payload.pin, payload.hospitalId, pinWasProvided, payload.department, payload.scfhsLicense]
    );

    // The PIN is returned exactly once and only when the server generated it;
    // it is never stored in the response body of any read endpoint.
    return res.status(201).json({ ...rows[0], ...(pinWasProvided ? {} : { initialPin }) });
  } catch (err) {
    // Staff enrollment must fail loudly: a memory-only account cannot log in after
    // a restart and would hide the real database error from the operator.
    console.error('[users] enroll postgres error:', err.message);
    return res.status(500).json({
      error: 'ENROLL_FAILED',
      message: 'Staff account could not be persisted. Nothing was created.',
    });
  }
});

// GET /api/users/doctors?hospitalId=... — public, sanitized directory used by the
// patient intake picker. Deliberately NOT /api/users: a patient must never download
// the full staff list (phones, pins, other roles). Active treating doctors only.
router.get('/doctors', async (req, res) => {
  const hospitalId = req.query.hospitalId ? String(req.query.hospitalId) : null;
  try {
    const { rows } = await pool.query(
      `SELECT id, full_name, full_name_ar, hospital_id, department, scfhs_license
         FROM platform_users
        WHERE role_code = 'D'
          AND (status = 'active' OR status IS NULL)
          ${hospitalId ? 'AND hospital_id = $1' : ''}
        ORDER BY full_name ASC`,
      hospitalId ? [hospitalId] : []
    );
    return res.json(rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      fullNameAr: row.full_name_ar,
      hospitalId: row.hospital_id,
      department: row.department,
      scfhsLicense: row.scfhs_license,
    })));
  } catch (err) {
    console.error('[users/doctors] DB error:', err.message);
    return res.status(500).json({ error: 'DOCTORS_UNAVAILABLE', message: 'Doctor directory could not be loaded' });
  }
});

// Staff lifecycle (status / removal) follows the same authority model as enrollment:
// AD may manage any staff row, HA only clinical staff inside its own tenant.
// Patient accounts are never managed through this staff endpoint — the earlier
// mis-created record stays a patient and cannot be removed here.
const loadManageableStaff = async (id, auth) => {
  const { rows } = await pool.query(
    'SELECT id, role_code, hospital_id, status, full_name, staff_code FROM platform_users WHERE id = $1',
    [id]
  );
  if (rows.length === 0) return { error: 'NOT_FOUND' };
  const row = rows[0];
  const role = String(row.role_code || '').toUpperCase();
  if (!STAFF_ROLE_CODES.includes(role)) return { error: 'NOT_STAFF_ACCOUNT' };
  if (auth.role === 'HA') {
    if (!TENANT_ROLE_CODES.includes(role)) return { error: 'FORBIDDEN' };
    if (!auth.hospitalId || row.hospital_id !== auth.hospitalId) return { error: 'FORBIDDEN' };
  }
  return { row };
};

const sendManageError = (res, error) => {
  if (error === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND', message: 'Staff account not found' });
  if (error === 'NOT_STAFF_ACCOUNT') {
    return res.status(400).json({
      error: 'NOT_STAFF_ACCOUNT',
      message: 'Patient accounts are not managed from staff administration',
    });
  }
  return res.status(403).json({ error: 'FORBIDDEN', message: 'You are not permitted to manage this staff account' });
};

// PATCH /api/users/:id/status — the ONLY way staff activation changes: still persisted
// to platform_users.status so login (which filters on it) honours the deactivation.
router.patch('/:id/status', requireAuth, requireRole('AD', 'HA'), async (req, res) => {
  const { id } = req.params;
  const status = String(req.body?.status || '').toLowerCase();
  if (status !== 'active' && status !== 'inactive') {
    return res.status(400).json({ error: 'INVALID_STATUS', message: "status must be 'active' or 'inactive'" });
  }
  if (String(req.auth.userId) === String(id)) {
    return res.status(400).json({ error: 'CANNOT_CHANGE_OWN_STATUS', message: 'You cannot change the status of your own account' });
  }
  try {
    const managed = await loadManageableStaff(id, req.auth);
    if (managed.error) return sendManageError(res, managed.error);
    const { rows } = await pool.query(
      `UPDATE platform_users SET status = $1 WHERE id = $2
       RETURNING id, staff_code AS "staffCode", full_name AS "fullName", role_code AS "roleCode",
                 hospital_id AS "hospitalId", status`,
      [status, id]
    );
    if (status === 'inactive') {
      // Revoke live tokens: deactivation must end access now, not at token expiry.
      await pool.query('UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [id]);
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error('[users] status update postgres error:', err.message);
    return res.status(500).json({ error: 'STATUS_UPDATE_FAILED', message: 'Status could not be persisted. Nothing changed.' });
  }
});

router.delete('/:id', requireAuth, requireRole('AD', 'HA'), async (req, res) => {
  const { id } = req.params;
  if (String(req.auth.userId) === String(id)) {
    return res.status(400).json({ error: 'CANNOT_DELETE_SELF', message: 'You cannot delete your own account' });
  }
  try {
    const managed = await loadManageableStaff(id, req.auth);
    if (managed.error) return sendManageError(res, managed.error);
    await pool.query('DELETE FROM platform_users WHERE id = $1', [id]);
    // A deleted account must lose access immediately, not when the token expires.
    await pool.query('UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [id]);
    return res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('[users] delete postgres error:', err.message);
    return res.status(500).json({ error: 'DELETE_FAILED', message: 'Staff account could not be deleted. Nothing changed.' });
  }
});

export default router;