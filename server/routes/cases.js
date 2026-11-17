import express from 'express';
import pool from '../db.js';
import { STAGE_ORDER } from '../store.js';
import { issueSession, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// National IDs are persisted masked (10******** or 1089****10); full 10-digit values are also accepted.
const MASKED_NATIONAL_ID_RE = /^\d{2}[\d*]{8}$/;
const digitCount = (value) => String(value ?? '').replace(/\D/g, '').length;

// GET /api/cases — Role & Identity Scoped (auth required)
router.get('/', requireAuth, async (req, res) => {
  // Scoped from req.auth (set by middleware); ignore untrusted headers entirely.
  const role = req.auth.role || 'GUEST';
  const userId = req.auth.userId || '';
  const tenantId = req.auth.hospitalId || '';

  try {
    let query = 'SELECT case_data FROM clinical_cases WHERE 1=1';
    const params = [];

    if (role === 'P' && userId) {
      // Scoped: patient can only see their own cases (matched by patientPhone in case_data).
      // Compare the 9-digit national suffix so "0555987654", "+966555987654" and stored
      // variants all resolve to the same person.
      const phoneRef = req.auth.phone || userId;
      params.push(phoneRef);
      query += ` AND (case_data->>'patientPhone' = $${params.length} OR right(regexp_replace(case_data->>'patientPhone', '\\D', '', 'g'), 9) = right(regexp_replace($${params.length}, '\\D', '', 'g'), 9))`;
    } else if (role === 'D' && tenantId) {
      params.push(tenantId);
      query += ` AND (case_data->'treatingDoctor'->>'hospitalId' = $${params.length} OR case_data->'treatingDoctor'->>'hospital' ILIKE '%' || $${params.length} || '%')`;
    }

    query += ' ORDER BY updated_at DESC';
    const { rows } = await pool.query(query, params);
    return res.json({ success: true, data: rows.map((r) => r.case_data) });
  } catch (err) {
    console.error('[cases] GET error:', err.message);
    return res.status(500).json({ success: false, error: 'CASES_UNAVAILABLE', message: 'Cases could not be loaded' });
  }
});

function generateAstTimestamps() {
  const now = new Date();
  const astOffset = 3 * 60 * 60 * 1000;
  const astTime = new Date(now.getTime() + astOffset + (now.getTimezoneOffset() * 60000));
  
  const hours = astTime.getHours();
  const minutes = astTime.getMinutes().toString().padStart(2, '0');
  const periodEn = hours >= 12 ? 'PM' : 'AM';
  const periodAr = hours >= 12 ? 'م' : 'ص';
  const displayHours = hours % 12 || 12;

  return {
    isoUtc: now.toISOString(),
    formattedTimeAr: `${displayHours.toString().padStart(2, '0')}:${minutes} ${periodAr}`,
    formattedTimeEn: `${displayHours.toString().padStart(2, '0')}:${minutes} ${periodEn} AST`,
  };
}

function mapStageToMilestoneInfo(stage, role, customActorName) {
  switch (stage) {
    case 'INTAKE_RECEIVED':
      return {
        actionCode: 'M01',
        actorRole: 'P',
        actorName: customActorName || null,
        actorRoleTitleAr: 'المريض',
        actorRoleTitleEn: 'Patient',
        actionSummaryAr: 'تم تسجيل الحالة والموافقة على سياسة الخصوصية',
        actionSummaryEn: 'Case registered with MOH consent verified',
        isMilestone: true,
      };
    case 'NURSE_CHECK':
      return {
        actionCode: 'M02',
        actorRole: 'N',
        actorName: customActorName || null,
        actorRoleTitleAr: 'ممرضة ألو للفرز',
        actorRoleTitleEn: 'ALO Nurse',
        actionSummaryAr: 'تم الفرز السريري ومراجعة المؤشرات الحيوية',
        actionSummaryEn: 'Clinical triage completed and vitals reviewed',
        isMilestone: true,
      };
    case 'DOCTOR_REVIEW':
      return {
        actionCode: 'M03',
        actorRole: 'D',
        actorName: customActorName || null,
        actorRoleTitleAr: 'الطبيب السعودي المعالج',
        actorRoleTitleEn: 'Saudi Treating Doctor',
        actionSummaryAr: 'تمت الموافقة الطبية واعتماد طلب الاستشارة الدولية',
        actionSummaryEn: 'Medical referral endorsed for cross-border consultation',
        isMilestone: true,
      };
    case 'AWAITING_PAYMENT':
    case 'WITH_CONSULTANT':
      return {
        actionCode: 'M04',
        actorRole: 'C',
        actorName: customActorName || null,
        actorRoleTitleAr: 'منسق رعاية ألو',
        actorRoleTitleEn: 'ALO Coordinator',
        actionSummaryAr: 'تم التحقق من السداد وتوليد رابط الاستشاري الدولي',
        actionSummaryEn: 'Payment verified and consultant magic link dispatched',
        isMilestone: true,
      };
    case 'OPINION_READY':
    case 'PARTNER_SERVICES':
    case 'CLOSED':
      return {
        actionCode: 'M05',
        actorRole: 'K',
        actorName: customActorName || null,
        actorRoleTitleAr: 'الاستشاري الدولي',
        actorRoleTitleEn: 'International Consultant',
        actionSummaryAr: 'تم إصدار واعتماد تقرير الرأي الطبي الثاني',
        actionSummaryEn: 'Second opinion clinical report released and certified',
        isMilestone: true,
      };
    default:
      return null;
  }
}

// P patient write guard: assert patientPhone matches the authenticated user
function patientOwnsCase(req, caseData) {
  if (req.auth?.role !== 'P') return true;
  const authPhone = req.auth.phone || req.auth.userId || '';
  if (!authPhone) return false;
  const casePhone = (caseData.patientPhone || '').replace(/\D/g, '');
  const authDigits = authPhone.replace(/\D/g, '');
  return casePhone.slice(-9) === authDigits.slice(-9);
}

// POST /api/cases — auth required; P may only write own cases
router.post('/', requireAuth, async (req, res) => {
  const c = req.body;
  if (!c || !c.id || c.id === 'draft-intake') {
    return res.status(400).json({ error: 'Valid case ID required' });
  }

  // Lenient guard: tolerates dashes/spaces around the number, rejects garbage before it hits the DB.
  if (c.patientPhone && (digitCount(c.patientPhone) < 9 || digitCount(c.patientPhone) > 13)) {
    return res.status(400).json({ error: 'INVALID_PHONE', message: 'patientPhone must contain 9-13 digits.' });
  }
  if (c.nationalIdMasked && !MASKED_NATIONAL_ID_RE.test(String(c.nationalIdMasked))) {
    return res.status(400).json({
      error: 'INVALID_NATIONAL_ID',
      message: 'nationalIdMasked must be a 10-character masked or 10-digit National ID.',
    });
  }

  // P-scope: patient must only write their own cases
  if (!patientOwnsCase(req, c)) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Patient may only write cases whose patientPhone matches their own.',
    });
  }

  const hasSymptoms =
    (c.symptoms && String(c.symptoms).trim().length > 0) ||
    (c.symptomsAr && String(c.symptomsAr).trim().length > 0) ||
    (c.symptomsEn && String(c.symptomsEn).trim().length > 0);

  if ((!c.stage || c.stage <= 1) && !hasSymptoms) {
    return res.status(400).json({ error: 'Cannot register empty case before explicit nurse submission' });
  }

  // Regression Guard: prevent backward stage transitions without admin override.
  // A guard that cannot read the current stage must not silently allow the write.
  let currentStageInDb = null;
  let caseExistsInDb = false;
  try {
    const { rows } = await pool.query('SELECT current_stage FROM clinical_cases WHERE id = $1', [c.id]);
    caseExistsInDb = rows.length > 0;
    if (caseExistsInDb) currentStageInDb = rows[0].current_stage;

    if (currentStageInDb && c.currentStage && c.currentStage !== currentStageInDb) {
      const currentOrder = STAGE_ORDER[currentStageInDb] || 0;
      const targetOrder = STAGE_ORDER[c.currentStage] || 0;
      if (targetOrder < currentOrder && !req.body.override_regression) {
        return res.status(409).json({
          error: `Stage regression denied. Cannot move case from "${currentStageInDb}" (stage ${currentOrder}) back to "${c.currentStage}" (stage ${targetOrder}). Use admin force-stage override if intentional.`,
          currentStage: currentStageInDb,
          requestedStage: c.currentStage,
        });
      }
    }
  } catch (guardErr) {
    console.error('[cases] stage guard error:', guardErr.message);
    return res.status(503).json({
      error: 'CASE_GUARD_UNAVAILABLE',
      message: 'Case state could not be verified. Nothing was saved.',
    });
  }

  // Payment gate mirror of the client rule: once an invoice has been issued, the
  // post-payment stages cannot be entered until the invoice is actually paid.
  const GATED_STAGES = ['WITH_CONSULTANT', 'OPINION_READY', 'PARTNER_SERVICES', 'FOLLOW_UP_21_DAYS', 'CLOSED'];
  const isPaid = Boolean(c.pricing && c.pricing.paid) || c.paymentDetails?.status === 'completed';
  if (c.invoiceIssued && !isPaid && GATED_STAGES.includes(c.currentStage)) {
    return res.status(402).json({
      error: 'PAYMENT_GATE_REQUIRED',
      message: `Cannot enter ${c.currentStage} while the issued invoice is unpaid.`,
      currentStage: c.currentStage,
    });
  }

  // Ensure timeline exists
  if (!Array.isArray(c.timeline)) {
    c.timeline = [];
  }

  const isNewCase = !caseExistsInDb;
  const stageChanged = currentStageInDb && c.currentStage && c.currentStage !== currentStageInDb;

  if (isNewCase && c.timeline.length === 0) {
    const timeInfo = generateAstTimestamps();
    const milestoneInfo = mapStageToMilestoneInfo('INTAKE_RECEIVED', req.auth?.role, c.patientName);
    if (milestoneInfo) {
      c.timeline.push({
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        caseId: c.id,
        timestamp: timeInfo.isoUtc,
        formattedTimeAr: timeInfo.formattedTimeAr,
        formattedTimeEn: timeInfo.formattedTimeEn,
        stage: 'INTAKE_RECEIVED',
        ...milestoneInfo,
      });
    }
  } else if (stageChanged) {
    const timeInfo = generateAstTimestamps();
    const actorName = req.auth?.userId || '';
    const milestoneInfo = mapStageToMilestoneInfo(c.currentStage, req.auth?.role, actorName);
    if (milestoneInfo) {
      c.timeline.push({
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        caseId: c.id,
        timestamp: timeInfo.isoUtc,
        formattedTimeAr: timeInfo.formattedTimeAr,
        formattedTimeEn: timeInfo.formattedTimeEn,
        stage: c.currentStage,
        ...milestoneInfo,
      });
    }
  }

  try {
    await pool.query(
      `INSERT INTO clinical_cases (id, case_number, current_stage, stage, patient_name, patient_name_ar, patient_name_en, national_id_masked, consultation_type, case_data, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (id) DO UPDATE SET 
         current_stage = EXCLUDED.current_stage, 
         stage = EXCLUDED.stage, 
         patient_name = EXCLUDED.patient_name,
         patient_name_ar = EXCLUDED.patient_name_ar,
         patient_name_en = EXCLUDED.patient_name_en,
         national_id_masked = EXCLUDED.national_id_masked,
         consultation_type = EXCLUDED.consultation_type,
         case_data = EXCLUDED.case_data, 
         updated_at = NOW()`,
      [
        c.id,
        c.caseNumber || '',
        c.currentStage || 'INTAKE_RECEIVED',
        c.stage || 1,
        c.patientName || '',
        c.patientNameAr || '',
        c.patientNameEn || '',
        c.nationalIdMasked || '',
        c.consultationType || 'written',
        JSON.stringify(c),
      ]
    );
  } catch (err) {
    // A case that only exists in RAM vanishes on restart while the UI reports
    // success. Surface the failure instead.
    console.error('[cases] POST save error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'CASE_NOT_SAVED',
      message: 'Case could not be saved. Nothing was persisted.',
    });
  }

  return res.json({ success: true, data: c });
});

async function getCaseById(id) {
  const { rows } = await pool.query('SELECT case_data FROM clinical_cases WHERE id = $1', [id]);
  return rows.length > 0 ? rows[0].case_data : null;
}

async function saveCaseRecord(c) {
  await pool.query(
    `INSERT INTO clinical_cases (id, case_number, current_stage, stage, patient_name, patient_name_ar, patient_name_en, national_id_masked, consultation_type, case_data, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
     ON CONFLICT (id) DO UPDATE SET 
       current_stage = EXCLUDED.current_stage, 
       stage = EXCLUDED.stage, 
       patient_name = EXCLUDED.patient_name,
       patient_name_ar = EXCLUDED.patient_name_ar,
       patient_name_en = EXCLUDED.patient_name_en,
       national_id_masked = EXCLUDED.national_id_masked,
       consultation_type = EXCLUDED.consultation_type,
       case_data = EXCLUDED.case_data, 
       updated_at = NOW()`,
    [
      c.id,
      c.caseNumber || '',
      c.currentStage || 'INTAKE_RECEIVED',
      c.stage || 1,
      c.patientName || '',
      c.patientNameAr || '',
      c.patientNameEn || '',
      c.nationalIdMasked || '',
      c.consultationType || 'written',
      JSON.stringify(c),
    ]
  );
}

// Dedicated transition endpoints
router.post('/:id/pay', async (req, res) => {
  const { id } = req.params;
  const currentCase = await getCaseById(id);
  if (!currentCase) return res.status(404).json({ error: 'Case not found' });

  currentCase.pricing = { ...(currentCase.pricing || {}), paid: true, paidAt: new Date().toISOString() };
  if (req.body?.method) {
    currentCase.paymentDetails = { ...(currentCase.paymentDetails || {}), ...req.body };
  }
  await saveCaseRecord(currentCase);
  return res.json({ success: true, data: currentCase });
});

router.post('/:id/verify-payment', async (req, res) => {
  const { id } = req.params;
  const currentCase = await getCaseById(id);
  if (!currentCase) return res.status(404).json({ error: 'Case not found' });

  currentCase.currentStage = 'WITH_CONSULTANT';
  currentCase.stage = 5;
  if (!Array.isArray(currentCase.timeline)) currentCase.timeline = [];
  const timeInfo = generateAstTimestamps();
  currentCase.timeline.push({
    id: `evt-${Date.now()}`,
    caseId: id,
    timestamp: timeInfo.isoUtc,
    formattedTimeAr: timeInfo.formattedTimeAr,
    formattedTimeEn: timeInfo.formattedTimeEn,
    stage: 'WITH_CONSULTANT',
    actionCode: 'M04',
    actorRole: 'C',
    actorName: req.auth?.userId || null,
    actionSummaryAr: 'تم التحقق من السداد وتوليد رابط الاستشاري الدولي',
    actionSummaryEn: 'Payment verified and consultant magic link dispatched',
    isMilestone: true,
  });

  await saveCaseRecord(currentCase);
  return res.json({ success: true, data: currentCase });
});

router.post('/:id/opinion', async (req, res) => {
  const { id } = req.params;
  const currentCase = await getCaseById(id);
  if (!currentCase) return res.status(404).json({ error: 'Case not found' });

  const { opinion, answers } = req.body || {};
  if (opinion) currentCase.consultantOpinion = opinion;
  if (answers) currentCase.consultantAnswers = answers;
  currentCase.currentStage = 'OPINION_READY';
  currentCase.stage = 6;
  if (!Array.isArray(currentCase.timeline)) currentCase.timeline = [];
  const timeInfo = generateAstTimestamps();
  currentCase.timeline.push({
    id: `evt-${Date.now()}`,
    caseId: id,
    timestamp: timeInfo.isoUtc,
    formattedTimeAr: timeInfo.formattedTimeAr,
    formattedTimeEn: timeInfo.formattedTimeEn,
    stage: 'OPINION_READY',
    actionCode: 'M05',
    actorRole: 'K',
    actorName: (currentCase.consultant && currentCase.consultant.name) ? currentCase.consultant.name : 'الاستشاري الدولي (International Consultant)',
    actionSummaryAr: 'تم إصدار واعتماد تقرير الرأي الطبي الثاني',
    actionSummaryEn: 'Second opinion clinical report released and certified',
    isMilestone: true,
  });

  await saveCaseRecord(currentCase);
  return res.json({ success: true, data: currentCase });
});

router.post('/:id/close', async (req, res) => {
  const { id } = req.params;
  const currentCase = await getCaseById(id);
  if (!currentCase) return res.status(404).json({ error: 'Case not found' });

  currentCase.status = 'closed';
  currentCase.currentStage = 'CLOSED';
  currentCase.stage = 9;
  currentCase.reportsReleased = true;
  currentCase.closedAt = new Date().toISOString();

  await saveCaseRecord(currentCase);
  return res.json({ success: true, data: currentCase });
});

// DELETE /api/cases (Purge all)
// Wiping clinical records is destructive and irreversible. It is reserved for the
// Super Admin and must never be reachable without a live, verified session.
const requireSuperAdmin = (req, res, next) => {
  if (!req.auth || req.auth.role !== 'AD') {
    return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Only the Super Admin may remove clinical cases.' });
  }
  next();
};

// A consultant magic link is a temporary credential: validation and session
// issuing must honour the same expiry window, or an old link stays valid forever.
const isMagicLinkExpired = (caseData) => {
  const linkExpiry = caseData?.consultantToken?.expiresAt;
  return Boolean(linkExpiry) && new Date(linkExpiry).getTime() < Date.now();
};

router.delete('/', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE clinical_cases CASCADE');
    // Consultant sessions named after a case cannot outlive the case itself.
    await pool.query("UPDATE sessions SET revoked_at = NOW() WHERE user_id LIKE 'magic-%' AND revoked_at IS NULL");
  } catch (err) {
    console.error('[cases] purge error:', err.message);
    return res.status(500).json({ success: false, error: 'PURGE_FAILED', message: 'Cases could not be purged.' });
  }
  return res.json({ success: true, message: 'All patient cases successfully purged' });
});

// DELETE /api/cases/:id
router.delete('/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM clinical_cases WHERE id = $1', [id]);
    // Deleting the case must also end the consultant's guest session for it.
    await pool.query('UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [`magic-${id}`]);
  } catch (err) {
    console.error('[cases] delete error:', err.message);
    return res.status(500).json({ success: false, error: 'DELETE_FAILED', message: 'Case could not be deleted.' });
  }
  return res.json({ success: true, deletedId: id });
});

// GET /api/cases/:id/magic — validate magic link token (public, no auth)
router.get('/:id/magic', async (req, res) => {
  const { id } = req.params;
  const token = req.query.token || '';
  if (!token) {
    return res.status(400).json({ success: false, error: 'token query param is required' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT case_data FROM clinical_cases WHERE id = $1 AND case_data->'consultantToken'->>'token' = $2 LIMIT 1`,
      [id, token]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, error: 'Invalid or expired magic link' });
    }
    const c = rows[0].case_data;
    if (isMagicLinkExpired(c)) {
      return res.status(410).json({ success: false, error: 'MAGIC_LINK_EXPIRED', message: 'This magic link has expired' });
    }
    return res.json({ success: true, data: { caseId: c.id, caseNumber: c.caseNumber, patientName: c.patientName, currentStage: c.currentStage } });
  } catch (err) {
    console.error('[cases/magic] error:', err.message);
    return res.status(500).json({ success: false, error: 'MAGIC_LINK_UNAVAILABLE', message: 'This link could not be verified. Please retry.' });
  }
});

// POST /api/cases/:id/magic-session — a valid magic-link token issues a REAL
// server session, so the consultant portal authenticates like every other role
// instead of running on an identity the client invented from the URL.
router.post('/:id/magic-session', async (req, res) => {
  const { id } = req.params;
  const token = String((req.body || {}).token || '');
  if (!token) {
    return res.status(400).json({ success: false, error: 'TOKEN_REQUIRED', message: 'token is required' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT case_data FROM clinical_cases WHERE id = $1 AND case_data->'consultantToken'->>'token' = $2 LIMIT 1`,
      [id, token]
    );
    if (!rows.length) {
      return res.status(401).json({ success: false, error: 'INVALID_MAGIC_LINK', message: 'Invalid or expired magic link' });
    }
    const c = rows[0].case_data;
    if (isMagicLinkExpired(c)) {
      return res.status(410).json({ success: false, error: 'MAGIC_LINK_EXPIRED', message: 'This magic link has expired' });
    }

    const session = await issueSession({ id: `magic-${id}`, roleCode: 'K', hospitalId: null, phone: null });
    return res.json({
      success: true,
      data: {
        ...session,
        caseId: c.id,
        caseNumber: c.caseNumber,
        patientName: c.patientName,
        currentStage: c.currentStage,
      },
    });
  } catch (err) {
    console.error('[cases/magic-session] error:', err.message);
    return res.status(500).json({ success: false, error: 'MAGIC_LINK_UNAVAILABLE', message: 'This link could not be verified. Please retry.' });
  }
});

// Admin forced stage jump / rollback. The override secret must be configured:
// a hardcoded fallback would let anyone holding the bundle force stage changes.
router.post(['/:id/force-stage', '/admin/cases/:id/force-stage'], async (req, res) => {
  const expectedAdminToken = process.env.ADMIN_OVERRIDE_TOKEN;
  if (!expectedAdminToken) {
    return res.status(503).json({ error: 'ADMIN_OVERRIDE_DISABLED', message: 'Stage override is not configured on this server' });
  }
  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== expectedAdminToken) {
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
    console.error('[cases] force-stage error:', err.message);
    return res.status(500).json({ error: 'FORCE_STAGE_FAILED', message: 'Stage override could not be persisted.' });
  }
  return res.json({ success: true, id: req.params.id, targetStage, stage: targetStageNum });
});

export default router;
