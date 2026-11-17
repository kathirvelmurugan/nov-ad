import crypto from 'crypto';
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

// The shared first-login code is data, not a constant. It lives in the single
// platform_auth row so it can be rotated or removed with one UPDATE and no
// redeploy. A missing row, a blank value or a malformed value disables it
// entirely — deliberately no hardcoded fallback, because a fallback would be a
// permanent universal password sitting in the source tree.
const readBootstrapCode = async () => {
  try {
    const { rows } = await pool.query('SELECT bootstrap_access_code FROM platform_auth WHERE id = 1');
    const code = rows.length ? String(rows[0].bootstrap_access_code || '').trim() : '';
    return PIN_RE.test(code) ? code : null;
  } catch (err) {
    // Fail closed: an unreadable switch must never become an open door.
    console.error('[users] bootstrap code unavailable:', err.message);
    return null;
  }
};

// One response shape for both login paths, so a caller never has to guess which
// fields exist. Everything here is read from the row, not assembled from config.
const buildSessionPayload = async (user, extra = {}) => {
  const session = await issueSession(user);
  return {
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
      ...extra,
    },
  };
};

router.post('/login', async (req, res) => {
  const { phone, pin } = req.body || {};
  if (!phone || !pin) {
    return res.status(400).json({ success: false, error: 'phone and pin are required' });
  }
  const normalizedPhone = normalizePhone(phone);
  if (!PHONE_RE.test(normalizedPhone)) return invalidPhone(res);
  const normalizedDigits = digitsOf(normalizedPhone);
  try {
    // 1. A normal credential. Only an activated account authenticates with a PIN:
    //    a pending account holds no PIN at all, so this branch can never be a way
    //    into an account that has not completed its first login.
    const { rows } = await pool.query(
      `SELECT * FROM platform_users
        WHERE (phone = $1 OR phone = $2 OR regexp_replace(phone, '\\D', '', 'g') = $3)
          AND pin = $4 AND activated_at IS NOT NULL
          AND (status = 'active' OR status IS NULL) LIMIT 1`,
      [normalizedPhone, phone, normalizedDigits, String(pin)]
    );
    if (rows.length > 0) {
      return res.json(await buildSessionPayload(rows[0]));
    }

    // 2. First login. The submitted value is an activation code, not a PIN: the
    //    account's own code (issued once at enrolment) or the shared switch row.
    //    Either way the session it issues exists only to set a real PIN.
    const pending = await pool.query(
      `SELECT * FROM platform_users
        WHERE (phone = $1 OR phone = $2 OR regexp_replace(phone, '\\D', '', 'g') = $3)
          AND activated_at IS NULL
          AND (pin IS NULL OR pin = '')
          AND (status = 'active' OR status IS NULL) LIMIT 1`,
      [normalizedPhone, phone, normalizedDigits]
    );
    if (pending.rows.length > 0) {
      const row = pending.rows[0];
      const submitted = String(pin);
      const ownValid =
        Boolean(row.activation_code) &&
        (!row.activation_expires_at || new Date(row.activation_expires_at).getTime() > Date.now()) &&
        submitted === String(row.activation_code);
      const shared = ownValid ? null : await readBootstrapCode();
      if (ownValid || (shared && submitted === shared)) {
        return res.json(await buildSessionPayload(row, { mustSetPin: true }));
      }
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
      `SELECT id, role_code, (pin IS NOT NULL) AS has_pin, activated_at FROM platform_users
        WHERE (phone = $1 OR phone = $2 OR regexp_replace(phone, '\\D', '', 'g') = $3)
          AND (status = 'active' OR status IS NULL) LIMIT 1`,
      [normalizedPhone, phone, digitsOf(normalizedPhone)]
    );
    if (rows.length > 0) {
      // The gate must know WHAT KIND of account this is. Without it, a staff
      // member was sent to patient self-registration whenever the PIN flag was
      // false, and the public endpoint then refused them with 403 — a dead end
      // with no field to type the PIN they were given.
      const roleCode = String(rows[0].role_code || '').toUpperCase();
      return res.json({
        success: true,
        exists: true,
        accountType: roleCode === 'P' ? 'patient' : 'staff',
        roleCode,
        requiresPin: Boolean(rows[0].has_pin) || !rows[0].activated_at,
        requiresAccessCode: false,
      });
    }
    return res.json({ success: true, exists: false, accountType: 'unknown', requiresPin: false, requiresAccessCode: false });
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
      // The credential is never serialised. The directory only needs to say whether
      // a PIN exists; the value is issued once on enrol/reset and is otherwise
      // unreadable by anyone, including the Super Admin.
      hasCustomPin: Boolean(row.has_custom_pin || row.pin),
      // Whether the person has ever completed a first login. Read from the row so
      // the directory reflects the database instead of assuming every account
      // that exists is usable.
      pendingActivation: !row.activated_at,
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

    // Hard guard against the identity defect this endpoint caused: a hospital
    // administrator's phone is written to the tenant row before any staff
    // account exists, so their first sign-in used to create them as a patient.
    const tenantAdmin = await pool.query(
      `SELECT 1 FROM tenants
        WHERE regexp_replace(COALESCE(hospital_admin_phone, ''), '\\D', '', 'g') = $1
        LIMIT 1`,
      [normalizedDigits]
    );
    if (tenantAdmin.rowCount > 0) {
      return res.status(409).json({
        success: false,
        error: 'TENANT_ADMIN_PHONE',
        message: 'This number is registered as a hospital administrator. The platform administrator creates that staff account and issues its PIN.',
      });
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

// POST /api/users/activate — completes a first login. The caller already proved
// an activation code at /login and holds the session that proved it; this swaps
// that session for a PIN only they know. `activated_at IS NULL` inside the
// UPDATE is what makes it safe: two parallel attempts cannot both win, and the
// shared code stops working for this account the instant it is used.
router.post('/activate', requireAuth, async (req, res) => {
  const { code, newPin } = req.body || {};
  if (!code || !newPin) {
    return res.status(400).json({ error: 'code and newPin are required' });
  }
  if (!PIN_RE.test(String(newPin))) return invalidPin(res);
  try {
    const { rows } = await pool.query(
      'SELECT id, activation_code, activation_expires_at, activated_at FROM platform_users WHERE id = $1',
      [req.auth.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Account not found' });
    }
    const row = rows[0];
    if (row.activated_at) {
      return res.status(409).json({ error: 'ALREADY_ACTIVATED', message: 'This account already has a PIN.' });
    }
    const expired = row.activation_expires_at && new Date(row.activation_expires_at).getTime() <= Date.now();
    const ownValid = Boolean(row.activation_code) && !expired && String(code) === String(row.activation_code);
    const shared = ownValid ? null : await readBootstrapCode();
    if (!ownValid && !(shared && String(code) === shared)) {
      return res.status(401).json({ error: 'INVALID_ACTIVATION_CODE', message: 'Activation code is not valid.' });
    }
    const updated = await pool.query(
      `UPDATE platform_users
          SET pin = $1, has_custom_pin = TRUE, activated_at = NOW(),
              activation_code = NULL, activation_expires_at = NULL
        WHERE id = $2 AND activated_at IS NULL
        RETURNING id`,
      [String(newPin), req.auth.userId]
    );
    if (updated.rowCount === 0) {
      return res.status(409).json({ error: 'ALREADY_ACTIVATED', message: 'This account already has a PIN.' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[users] activate postgres error:', err.message);
    return res.status(500).json({ error: 'ACTIVATION_FAILED', message: 'PIN could not be saved. Nothing changed.' });
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

  // A new staff member does not start with a working PIN. They start with a
  // one-time activation code — the one the administrator typed, or a minted
  // 6-digit value — and use it exactly once. The PIN they keep afterwards is
  // chosen by them at that moment, never by whoever created the account.
  // crypto.randomInt, not Math.random: this is a credential that is never stored
  // in readable form once it leaves this response.
  const activationCode = pin ? String(pin) : String(crypto.randomInt(100000, 1000000));

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
    hospitalId: tenantId,
    staffCode: staffCode ? String(staffCode).trim().slice(0, 50) : null,
    department: department ? String(department).trim().slice(0, 100) : null,
    scfhsLicense: scfhsLicense ? String(scfhsLicense).trim().slice(0, 50) : null,
  };

  try {
    const { rows } = await pool.query(
      `INSERT INTO platform_users
         (id, staff_code, full_name, full_name_ar, phone, role_code, pin, has_custom_pin,
          hospital_id, status, department, scfhs_license,
          activated_at, activation_code, activation_expires_at)
       VALUES
         ('staff-' || replace(gen_random_uuid()::text, '-', ''), $1, $2, $3, $4, $5,
          NULL, FALSE, $6, 'active', $7, $8,
          NULL, $9, NOW() + INTERVAL '14 days')
       ON CONFLICT (phone) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         full_name_ar = COALESCE(EXCLUDED.full_name_ar, platform_users.full_name_ar),
         role_code = EXCLUDED.role_code,
         staff_code = COALESCE(EXCLUDED.staff_code, platform_users.staff_code),
         hospital_id = COALESCE(EXCLUDED.hospital_id, platform_users.hospital_id),
         department = COALESCE(EXCLUDED.department, platform_users.department),
         scfhs_license = COALESCE(EXCLUDED.scfhs_license, platform_users.scfhs_license),
         -- Re-enrolling must never wipe a PIN its owner already chose, and must
         -- never re-open an activated account to a first-login code.
         activation_code = CASE WHEN platform_users.activated_at IS NULL THEN EXCLUDED.activation_code ELSE platform_users.activation_code END,
         activation_expires_at = CASE WHEN platform_users.activated_at IS NULL THEN EXCLUDED.activation_expires_at ELSE platform_users.activation_expires_at END
       RETURNING id, staff_code AS "staffCode", full_name AS "fullName", full_name_ar AS "fullNameAr",
                 phone, role_code AS "roleCode", hospital_id AS "hospitalId",
                 has_custom_pin AS "hasCustomPin", (activated_at IS NOT NULL) AS "activated",
                 created_at AS "createdAt"`,
      [payload.staffCode, payload.fullName, payload.fullNameAr, payload.phone, payload.roleCode, payload.hospitalId, payload.department, payload.scfhsLicense, activationCode]
    );

    const created = rows[0];
    // The activation code is returned exactly once, and only while the account is
    // still pending. A re-enrolled, already-activated account keeps the PIN its
    // owner chose and never receives a new one here.
    return res.status(201).json({
      ...created,
      ...(created.activated ? {} : { initialPin: activationCode, mustSetPin: true }),
    });
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

// GET /api/users/doctors?hospitalId=...&role=D|K — public, sanitized directory used
// by the patient intake picker and by the treating doctor's consultant picker.
// Deliberately NOT /api/users: a caller must never download the full staff list
// (phones, pins, other roles). Active accounts only.
//
// The role is whitelisted because this route is unauthenticated: it must never
// become a way to enumerate administrators or coordinators.
const DIRECTORY_ROLES = ['D', 'K'];
router.get('/doctors', async (req, res) => {
  const hospitalId = req.query.hospitalId ? String(req.query.hospitalId) : null;
  const requestedRole = String(req.query.role || 'D').toUpperCase();
  if (!DIRECTORY_ROLES.includes(requestedRole)) {
    return res.status(400).json({ error: 'INVALID_ROLE', message: 'role must be D or K' });
  }
  try {
    const params = [requestedRole];
    let where = `WHERE role_code = $1 AND (status = 'active' OR status IS NULL)`;
    if (hospitalId) {
      params.push(hospitalId);
      where += ` AND hospital_id = $${params.length}`;
    }
    const { rows } = await pool.query(
      `SELECT id, full_name, full_name_ar, hospital_id, department, scfhs_license
         FROM platform_users
         ${where}
        ORDER BY full_name ASC`,
      params
    );
    return res.json(rows.map((row) => ({
      id: row.id,
      roleCode: requestedRole,
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

// POST /api/users/:id/reset-pin — the only way to recover a PIN nobody can read
// (enrollment mints one and returns it once). Existing sessions are revoked: the
// credential they were issued for no longer exists.
router.post('/:id/reset-pin', requireAuth, requireRole('AD', 'HA'), async (req, res) => {
  const { id } = req.params;
  if (String(req.auth.userId) === String(id)) {
    return res.status(400).json({
      error: 'CANNOT_RESET_OWN_PIN',
      message: 'Change your own PIN from your profile, supplying the current one.',
    });
  }
  try {
    const managed = await loadManageableStaff(id, req.auth);
    if (managed.error) return sendManageError(res, managed.error);
    const newPin = String(crypto.randomInt(1000, 10000));
    const { rows } = await pool.query(
      `UPDATE platform_users
          SET pin = $1, has_custom_pin = TRUE,
              activated_at = COALESCE(activated_at, NOW()),
              activation_code = NULL, activation_expires_at = NULL
        WHERE id = $2
       RETURNING id, full_name AS "fullName", role_code AS "roleCode"`,
      [newPin, id]
    );
    await pool.query('UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [id]);
    // Returned once. It is never included in any read endpoint.
    return res.json({ success: true, ...rows[0], pin: newPin });
  } catch (err) {
    console.error('[users] reset pin postgres error:', err.message);
    return res.status(500).json({ error: 'PIN_RESET_FAILED', message: 'PIN could not be reset. Nothing changed.' });
  }
});

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