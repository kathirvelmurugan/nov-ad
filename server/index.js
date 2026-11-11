import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── In-Memory In-Process Fallback Store (Syncs across all network clients if DB is provisioning) ──
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
    department: 'Platform Operations',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
];
let memoryCases = [];

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
      createdAt: r.created_at,
    }));
    return res.json({ success: true, data: mapped });
  } catch (err) {
    return res.json({ success: true, data: memoryUsers, isFallback: true });
  }
});

apiRouter.post('/users', async (req, res) => {
  const u = req.body;
  if (!u.fullName || !u.phone || !u.roleCode) return res.status(400).json({ error: 'Missing required staff fields' });
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
    createdAt: new Date().toISOString(),
  };

  try {
    await pool.query(
      `INSERT INTO platform_users (id, staff_code, full_name, full_name_ar, role_code, phone, pin, hospital_id, department, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, status = EXCLUDED.status`,
      [user.id, user.staffCode, user.fullName, user.fullNameAr, user.roleCode, user.phone, user.pin, user.hospitalId, user.department, user.status, user.createdAt]
    );
  } catch (err) {
    memoryUsers = [user, ...memoryUsers.filter((x) => x.id !== user.id)];
  }
  return res.json({ success: true, data: user });
});

// ── API Routes: Cases ────────────────────────────────────────────────────────
apiRouter.get('/cases', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT case_data FROM clinical_cases ORDER BY updated_at DESC');
    return res.json({ success: true, data: rows.map((r) => r.case_data) });
  } catch (err) {
    return res.json({ success: true, data: memoryCases, isFallback: true });
  }
});

apiRouter.post('/cases', async (req, res) => {
  const c = req.body;
  if (!c.id) return res.status(400).json({ error: 'Case ID required' });
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

// Mount API router for both direct /api and prefixed /:prefix/api (e.g. /feature-sarat/api)
app.use('/api', apiRouter);
app.use('/:prefix/api', apiRouter);

// ── Static Files Serving (Production Mode) ──────────────────────────────────
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.use('/:prefix', express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── Server Start ─────────────────────────────────────────────────────────────
initDatabase().finally(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ALO DOCTOR Unified Backend Server running on port ${PORT}`);
  });
});
