import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, initDatabase } from './db.js';
import { initStorage, saveFile, getFile } from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── In-Memory In-Process Fallback Store ──────────────────────────────────────
let memoryTenants = [];
let memoryUsers = [
  {
    id: 'staff-ad-01',
    staffCode: '00001',
    fullName: 'Adrian Lewis',
    fullNameAr: 'المشرف العام أدريان لويس',
    roleCode: 'AD',
    phone: '+966500000001',
    pin: '1234',
    hasCustomPin: true,
    department: 'Platform Operations',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
];
let memoryCases = [];
let memoryAudit = [];

const apiRouter = express.Router();

// ── API Routes: Tenants (Hospitals) ───────────────────────────────────────────
apiRouter.get('/tenants', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tenants ORDER BY created_at DESC');
    const mapped = rows.map((r) => ({
      id: r.id,
      nameEn: r.name_en,
      nameAr: r.name_ar,
      city: r.city,
      mciLicenseNumber: r.mci_license_number,
      status: r.status,
      hospitalAdminName: r.hospital_admin_name,
      hospitalAdminPhone: r.hospital_admin_phone,
      doctorCount: r.doctor_count,
      createdAt: r.created_at,
    }));
    return res.json({ success: true, data: mapped });
  } catch (err) {
    return res.json({ success: true, data: memoryTenants, isFallback: true });
  }
});

apiRouter.post('/tenants', async (req, res) => {
  const t = req.body;
  if (!t.nameEn || !t.nameAr) return res.status(400).json({ error: 'Names required' });
  const id = t.id || `hosp-${t.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
  const tenant = {
    id,
    nameEn: t.nameEn,
    nameAr: t.nameAr,
    city: t.city || 'الرياض',
    mciLicenseNumber: t.mciLicenseNumber || `MCI-SA-${Date.now().toString().slice(-6)}`,
    status: t.status || 'active',
    hospitalAdminName: t.hospitalAdminName || 'Dr. Hospital Admin',
    hospitalAdminPhone: t.hospitalAdminPhone || '+966504444444',
    doctorCount: t.doctorCount || 1,
    createdAt: new Date().toISOString(),
  };

  try {
    await pool.query(
      `INSERT INTO tenants (id, name_en, name_ar, city, mci_license_number, status, hospital_admin_name, hospital_admin_phone, doctor_count, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, status = EXCLUDED.status`,
      [tenant.id, tenant.nameEn, tenant.nameAr, tenant.city, tenant.mciLicenseNumber, tenant.status, tenant.hospitalAdminName, tenant.hospitalAdminPhone, tenant.doctorCount, tenant.createdAt]
    );
  } catch (err) {
    memoryTenants = [tenant, ...memoryTenants.filter((x) => x.id !== tenant.id)];
  }
  return res.json({ success: true, data: tenant });
});

apiRouter.delete('/tenants/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tenants WHERE id = $1', [id]);
  } catch (err) {
    memoryTenants = memoryTenants.filter((x) => x.id !== id);
  }
  return res.json({ success: true, deletedId: id });
});

// ── API Routes: Platform Staff & Doctors ─────────────────────────────────────
apiRouter.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM platform_users ORDER BY created_at DESC');
    const mapped = rows.map((r) => ({
      id: r.id,
      staffCode: r.staff_code,
      fullName: r.full_name,
      fullNameAr: r.full_name_ar,
      roleCode: r.role_code,
      phone: r.phone,
      pin: r.pin,
      hospitalId: r.hospital_id,
      department: r.department,
      status: r.status,
      hasCustomPin: !!r.has_custom_pin,
      createdAt: r.created_at,
    }));
    return res.json({ success: true, data: mapped });
  } catch (err) {
    return res.json({ success: true, data: memoryUsers, isFallback: true });
  }
});

apiRouter.post('/users/pin', async (req, res) => {
  const { phone, pin } = req.body;
  if (!phone || !pin) return res.status(400).json({ error: 'Missing phone or pin' });
  const clean = phone.replace(/\D/g, '');
  const p1 = '+' + clean;
  const p2 = clean.startsWith('966') ? '0' + clean.slice(3) : '0' + clean;
  const p3 = clean.startsWith('966') ? clean : '966' + clean;

  try {
    await pool.query(
      `UPDATE platform_users 
       SET pin = $1, has_custom_pin = TRUE 
       WHERE phone = $2 
          OR phone = $3 
          OR phone = $4 
          OR phone = $5 
          OR REPLACE(REPLACE(phone, '+', ''), ' ', '') = $6`,
      [pin, phone, p1, p2, p3, clean]
    );
  } catch (err) {
    console.error('Error updating user pin:', err);
  }

  // Update in-memory fallback
  const match = memoryUsers.find(
    (m) => m.phone === phone || m.phone?.replace(/\D/g, '') === clean
  );
  if (match) {
    match.pin = pin;
    match.hasCustomPin = true;
  }

  return res.json({ success: true, phone, hasCustomPin: true });
});

apiRouter.post('/users', async (req, res) => {
  const u = req.body;
  if (!u.fullName || !u.phone || !u.roleCode) return res.status(400).json({ error: 'Missing required staff fields' });
  const hasCustomPin = u.hasCustomPin !== undefined ? !!u.hasCustomPin : false;
  const user = {
    id: u.id || `staff-${Date.now().toString().slice(-6)}`,
    staffCode: u.staffCode || Date.now().toString().slice(-5),
    fullName: u.fullName,
    fullNameAr: u.fullNameAr || u.fullName,
    roleCode: u.roleCode,
    phone: u.phone,
    pin: u.pin || '1234',
    hospitalId: u.hospitalId || null,
    department: u.department || 'Clinical',
    status: u.status || 'active',
    hasCustomPin,
    createdAt: new Date().toISOString(),
  };

  try {
    await pool.query(
      `INSERT INTO platform_users (id, staff_code, full_name, full_name_ar, role_code, phone, pin, hospital_id, department, status, has_custom_pin, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, status = EXCLUDED.status, has_custom_pin = EXCLUDED.has_custom_pin`,
      [user.id, user.staffCode, user.fullName, user.fullNameAr, user.roleCode, user.phone, user.pin, user.hospitalId, user.department, user.status, hasCustomPin, user.createdAt]
    );
  } catch (err) {
    memoryUsers = [user, ...memoryUsers.filter((x) => x.id !== user.id)];
  }
  return res.json({ success: true, data: user });
});

apiRouter.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM platform_users WHERE id = $1', [id]);
  } catch (err) {
    memoryUsers = memoryUsers.filter((x) => x.id !== id);
  }
  return res.json({ success: true, deletedId: id });
});

// ── Clean-Slate Purge Endpoint ───────────────────────────────────────────────
apiRouter.post('/admin/clean-slate', async (req, res) => {
  try {
    // 1. Wipe tenants
    await pool.query('TRUNCATE TABLE tenants CASCADE');
    // 2. Wipe cases & audit
    try { await pool.query('TRUNCATE TABLE clinical_cases CASCADE'); } catch {}
    try { await pool.query('TRUNCATE TABLE cases CASCADE'); } catch {}
    try { await pool.query('TRUNCATE TABLE audit_logs CASCADE'); } catch {}
    try { await pool.query('ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS has_custom_pin BOOLEAN DEFAULT FALSE;'); } catch {}
    // 3. Remove all users except Super Admin
    await pool.query("DELETE FROM platform_users WHERE role_code != 'AD'");
    // 4. Ensure Super Admin Adrian Lewis exists with active PIN
    await pool.query(`
      INSERT INTO platform_users (id, staff_code, full_name, full_name_ar, role_code, phone, pin, department, status, has_custom_pin, created_at)
      VALUES ('staff-ad-01', '00001', 'Adrian Lewis', 'المشرف العام أدريان لويس', 'AD', '+966500000001', '1234', 'Platform Operations', 'active', TRUE, NOW())
      ON CONFLICT (id) DO UPDATE SET has_custom_pin = TRUE
    `);
    memoryTenants = [];
    memoryCases = [];
    memoryAudit = [];
    memoryUsers = [
      {
        id: 'staff-ad-01',
        staffCode: '00001',
        fullName: 'Adrian Lewis',
        fullNameAr: 'المشرف العام أدريان لويس',
        roleCode: 'AD',
        phone: '+966500000001',
        pin: '1234',
        hasCustomPin: true,
        department: 'Platform Operations',
        status: 'active',
        createdAt: new Date().toISOString(),
      }
    ];
    return res.json({ success: true, message: 'Database successfully purged to clean-slate state (Super Admin only).' });
  } catch (err) {
    console.error('Clean-slate purge failed:', err);
    memoryTenants = [];
    return res.status(500).json({ error: 'Failed to purge database', details: String(err) });
  }
});

// ── API Routes: Cases ────────────────────────────────────────────────────────
apiRouter.get('/cases', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT case_data FROM clinical_cases 
      WHERE (case_data->>'stage')::int > 1 OR (case_data->>'symptoms') IS NOT NULL AND length(trim(case_data->>'symptoms')) > 0
      ORDER BY updated_at DESC
    `);
    return res.json({ success: true, data: rows.map((r) => r.case_data) });
  } catch (err) {
    const filtered = memoryCases.filter((c) => (c.stage && c.stage > 1) || (c.symptoms && c.symptoms.trim().length > 0));
    return res.json({ success: true, data: filtered, isFallback: true });
  }
});

// ── Stage Progression Hierarchy ─────────────────────────────────────────────
const STAGE_ORDER = {
  INTAKE_RECEIVED: 1,
  NURSE_CHECK: 2,
  DOCTOR_REVIEW: 3,
  AWAITING_PAYMENT: 4,
  WITH_CONSULTANT: 5,
  OPINION_READY: 6,
  PARTNER_SERVICES: 7,
  FOLLOW_UP_21_DAYS: 8,
  CLOSED: 9,
};

apiRouter.post('/cases', async (req, res) => {
  const c = req.body;
  if (!c.id || c.id === 'draft-intake') return res.status(400).json({ error: 'Valid case ID required' });
  const hasSymptoms = (c.symptoms && c.symptoms.trim().length > 0) || (c.symptomsAr && c.symptomsAr.trim().length > 0) || (c.symptomsEn && c.symptomsEn.trim().length > 0);
  if ((!c.stage || c.stage <= 1) && !hasSymptoms) {
    return res.status(400).json({ error: 'Cannot register empty case before explicit nurse submission' });
  }

  // Regression Guard: prevent backward stage transitions without admin override
  try {
    let currentStageInDb = null;
    const { rows } = await pool.query('SELECT current_stage FROM clinical_cases WHERE id = $1', [c.id]);
    if (rows && rows.length > 0) {
      currentStageInDb = rows[0].current_stage;
    } else {
      const memCase = memoryCases.find((x) => x.id === c.id);
      if (memCase) currentStageInDb = memCase.currentStage;
    }

    if (currentStageInDb && c.currentStage && c.currentStage !== currentStageInDb) {
      const currentOrder = STAGE_ORDER[currentStageInDb] || 0;
      const targetOrder = STAGE_ORDER[c.currentStage] || 0;
      if (targetOrder < currentOrder) {
        return res.status(409).json({
          error: `Stage regression denied. Cannot move case from "${currentStageInDb}" (stage ${currentOrder}) back to "${c.currentStage}" (stage ${targetOrder}). Use admin force-stage override if intentional.`,
          currentStage: currentStageInDb,
          requestedStage: c.currentStage,
        });
      }
    }
  } catch (guardErr) {
    // Non-blocking fallback
  }
  try {
    await pool.query(
      `INSERT INTO clinical_cases (id, case_number, current_stage, stage, patient_name, patient_name_ar, patient_name_en, national_id_masked, consultation_type, case_data, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (id) DO UPDATE SET current_stage = EXCLUDED.current_stage, stage = EXCLUDED.stage, case_data = EXCLUDED.case_data, updated_at = NOW()`,
      [c.id, c.caseNumber || '', c.currentStage || 'INTAKE_RECEIVED', c.stage || 1, c.patientName || '', c.patientNameAr || '', c.patientNameEn || '', c.nationalIdMasked || '', c.consultationType || 'written', JSON.stringify(c)]
    );
  } catch (err) {
    memoryCases = [c, ...memoryCases.filter((x) => x.id !== c.id)];
  }
  return res.json({ success: true, data: c });
});

apiRouter.delete('/cases', async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE clinical_cases CASCADE');
    try { await pool.query('TRUNCATE TABLE cases CASCADE'); } catch {}
  } catch (err) {}
  memoryCases = [];
  return res.json({ success: true, message: 'All patient cases successfully purged' });
});

apiRouter.delete('/cases/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM clinical_cases WHERE id = $1', [id]);
  } catch (err) {
    memoryCases = memoryCases.filter((x) => x.id !== id);
  }
  return res.json({ success: true, deletedId: id });
});

// Admin override endpoint for intentional stage rollback
apiRouter.post('/admin/cases/:id/force-stage', async (req, res) => {
  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== 'ALO-ADMIN-OVERRIDE-2026') {
    return res.status(403).json({ error: 'Admin token required' });
  }
  const { targetStage } = req.body;
  if (!STAGE_ORDER[targetStage]) {
    return res.status(400).json({ error: `Unknown stage: ${targetStage}` });
  }
  const targetStageNum = STAGE_ORDER[targetStage];
  try {
    await pool.query(
      `UPDATE clinical_cases 
       SET current_stage = $1, stage = $2, 
           case_data = jsonb_set(jsonb_set(case_data, '{currentStage}', to_jsonb($1::text)), '{stage}', to_jsonb($2::int)),
           updated_at = NOW() 
       WHERE id = $3`,
      [targetStage, targetStageNum, req.params.id]
    );
  } catch (err) {
    const memIdx = memoryCases.findIndex((c) => c.id === req.params.id);
    if (memIdx !== -1) {
      memoryCases[memIdx].currentStage = targetStage;
      memoryCases[memIdx].stage = targetStageNum;
    }
  }
  return res.json({ success: true, id: req.params.id, targetStage, stage: targetStageNum });
});

// ── API Routes: Audit Logs ───────────────────────────────────────────────────
apiRouter.get('/audit', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200');
    const mapped = rows.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      actorName: r.actor_name,
      actorRole: r.actor_role,
      hospitalId: r.hospital_id,
      actionType: r.action_type,
      target: r.target,
      details: r.details,
      ipAddress: r.ip_address,
    }));
    return res.json({ success: true, data: mapped });
  } catch (err) {
    return res.json({ success: true, data: memoryAudit, isFallback: true });
  }
});

apiRouter.post('/audit', async (req, res) => {
  const a = req.body;
  if (!a.actionType) return res.status(400).json({ error: 'Action type required' });
  const entry = {
    id: a.id || `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: a.timestamp || new Date().toISOString(),
    actorName: a.actorName || 'System',
    actorRole: a.actorRole || 'AD',
    hospitalId: a.hospitalId || null,
    actionType: a.actionType,
    target: a.target || '',
    details: a.details || '',
    ipAddress: req.ip || '',
  };
  try {
    await pool.query(
      `INSERT INTO audit_logs (id, timestamp, actor_name, actor_role, hospital_id, action_type, target, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [entry.id, entry.timestamp, entry.actorName, entry.actorRole, entry.hospitalId, entry.actionType, entry.target, entry.details, entry.ipAddress]
    );
  } catch (err) {
    memoryAudit = [entry, ...memoryAudit.slice(0, 99)];
  }
  return res.json({ success: true, data: entry });
});

// ── API Routes: Storage & File Uploads (MinIO S3) ─────────────────────────────
apiRouter.post('/upload', async (req, res) => {
  try {
    const { fileName, fileType, fileData } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'fileName and fileData required' });
    }
    const cleanBase64 = fileData.replace(/^data:.*,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const safeKey = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const result = await saveFile(safeKey, buffer, fileType || 'application/octet-stream');
    return res.json({
      success: true,
      key: safeKey,
      url: `/api/storage/${safeKey}`,
      storage: result.storage,
      size: `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

apiRouter.get('/storage/:key', async (req, res) => {
  try {
    const file = await getFile(req.params.key);
    if (!file) return res.status(404).send('File not found');
    res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
    if (typeof file.stream.pipe === 'function') {
      file.stream.pipe(res);
    } else {
      const chunks = [];
      for await (const chunk of file.stream) chunks.push(chunk);
      res.send(Buffer.concat(chunks));
    }
  } catch (err) {
    res.status(500).send('Storage retrieval error: ' + err.message);
  }
});

// Mount API router for both direct /api and prefixed /:prefix/api (e.g. /feature-sarat/api)
app.use('/api', apiRouter);
app.use('/:prefix/api', apiRouter);

// ── Static Files Serving (Production Mode) with Cache-Busting ──────────────
const distPath = path.join(__dirname, '../dist');

// Safety: Ensure index.html and root navigation are never cached by proxy/browser
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html') || !req.path.includes('.')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

app.use(express.static(distPath));
app.use('/:prefix', express.static(distPath));
app.use((req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── Server Start ─────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ALO DOCTOR Unified Backend Server running on port ${PORT}`);
  initDatabase().catch((e) => console.warn('Database init warning:', e.message));
  initStorage().catch((e) => console.warn('Storage init warning:', e.message));
});
