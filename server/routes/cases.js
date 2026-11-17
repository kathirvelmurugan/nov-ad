import express from 'express';
import pool from '../db.js';
import { STAGE_ORDER } from '../store.js';
import { issueSession, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// National IDs are persisted masked (10******** or 1089****10); full 10-digit values are also accepted.
const MASKED_NATIONAL_ID_RE = /^\d{2}[\d*]{8}$/;
const digitCount = (value) => String(value ?? '').replace(/\D/g, '').length;

// Every save posts the whole case document, so an actor who loaded the case before
// the Saudi doctor wrote the focus questions erased them on their next save - which
// is why the referral kept reaching the consultant with an empty question set after
// it had visibly been captured. These fields are written by one actor and read by
// another, so a save may never blank content it did not author.
const isEmptyText = (value) => typeof value !== 'string' || value.trim().length === 0;
const keepWritten = (incoming, stored) => (isEmptyText(incoming) ? stored : incoming);

const mergeTriple = (incoming, stored) => {
  const next = Array.isArray(incoming) ? incoming : [];
  const previous = Array.isArray(stored) ? stored : [];
  return [0, 1, 2].map((index) => {
    const kept = keepWritten(next[index], previous[index]);
    return typeof kept === 'string' ? kept : '';
  });
};

/**
 * Merges a save with what is already stored so captured clinical content survives.
 * The top-level `focusQuestions` mirror is rebuilt from the doctor's fields on every
 * write, so legacy readers (dossier, drill-down, WhatsApp relay) cannot go stale.
 */
function preserveCapturedContent(stored, incoming) {
  const previous = stored && typeof stored === 'object' ? stored : {};
  const priorDoctor = previous.treatingDoctor && typeof previous.treatingDoctor === 'object' ? previous.treatingDoctor : {};
  const doctor = { ...(incoming.treatingDoctor || {}) };

  // Patient identity is captured once and must not be lost by a stale snapshot.
  ['patientName', 'patientNameAr', 'patientNameEn', 'patientPhone', 'nationalIdMasked'].forEach((key) => {
    incoming[key] = keepWritten(incoming[key], previous[key]);
  });

  doctor.focusQuestions = mergeTriple(doctor.focusQuestions, priorDoctor.focusQuestions);
  doctor.focusQuestionsEn = mergeTriple(doctor.focusQuestionsEn, priorDoctor.focusQuestionsEn);

  // A client that only knows the legacy top-level field still contributes its text.
  const legacyTop = mergeTriple(incoming.focusQuestions, previous.focusQuestions);
  for (let index = 0; index < 3; index += 1) {
    if (!doctor.focusQuestions[index] && !doctor.focusQuestionsEn[index] && legacyTop[index]) {
      doctor.focusQuestions[index] = legacyTop[index];
    }
  }

  incoming.treatingDoctor = doctor;
  // Derived, never authoritative: one copy that every legacy reader can trust.
  incoming.focusQuestions = [0, 1, 2].map(
    (index) => doctor.focusQuestions[index] || doctor.focusQuestionsEn[index] || ''
  );

  incoming.consultantOpinion = keepWritten(incoming.consultantOpinion, previous.consultantOpinion);
  const answers = mergeTriple(incoming.consultantAnswers, previous.consultantAnswers);
  if (Array.isArray(incoming.consultantAnswers) || answers.some(Boolean)) {
    incoming.consultantAnswers = answers;
  }
}

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
    } else if (role === 'D' && userId) {
      // Ownership is an account-id join, nothing else. The previous filter compared
      // a tenant UUID against the doctor's hospital *display name*, so a doctor
      // bound to a tenant matched no case at all and an unbound one matched every
      // case. treatingDoctor.id is written by the nurse assignment and is the only
      // durable link between a case and the doctor who owns it.
      params.push(userId);
      query += ` AND case_data->'treatingDoctor'->>'id' = $${params.length}`;
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

/**
 * A milestone records an act, not the stage a case happens to land in. The nurse
 * moving a case into DOCTOR_REVIEW completes triage (M02); the treating doctor's
 * endorsement is what moves it to AWAITING_PAYMENT (M03); financial clearance is
 * what dispatches it to the consultant (M04). Deriving the code from the target
 * stage alone stamped a doctor endorsement - attributed to the nurse - every time
 * she forwarded a case, and "payment verified" the moment a doctor approved.
 */
function mapStageToMilestoneInfo(stage, facts = {}) {
  const actor = facts.actorName || null;
  switch (stage) {
    case 'INTAKE_RECEIVED':
      return {
        actionCode: 'M01',
        actorRole: 'P',
        actorName: actor,
        actorRoleTitleAr: 'المريض',
        actorRoleTitleEn: 'Patient',
        actionSummaryAr: 'تم تسجيل الحالة والموافقة على سياسة الخصوصية',
        actionSummaryEn: 'Case registered with MOH consent verified',
        isMilestone: true,
      };
    case 'DOCTOR_REVIEW':
      // Triage complete: the nurse handed a triaged case to the treating doctor.
      return {
        actionCode: 'M02',
        actorRole: 'N',
        actorName: actor,
        actorRoleTitleAr: 'ممرضة ألو للفرز',
        actorRoleTitleEn: 'ALO Nurse',
        actionSummaryAr: 'تم الفرز السريري ومراجعة المؤشرات الحيوية',
        actionSummaryEn: 'Clinical triage completed and vitals reviewed',
        isMilestone: true,
      };
    case 'AWAITING_PAYMENT':
      // Only a write that actually endorses the referral earns M03.
      if (facts.referralApproved !== true) return null;
      return {
        actionCode: 'M03',
        actorRole: 'D',
        actorName: facts.treatingDoctorName || actor,
        actorRoleTitleAr: 'الطبيب السعودي المعالج',
        actorRoleTitleEn: 'Saudi Treating Doctor',
        actionSummaryAr: 'تمت الموافقة الطبية واعتماد طلب الاستشارة الدولية',
        actionSummaryEn: 'Medical referral endorsed for cross-border consultation',
        isMilestone: true,
      };
    case 'WITH_CONSULTANT':
      return {
        actionCode: 'M04',
        actorRole: 'C',
        actorName: actor,
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
        actorName: actor,
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

/** The session carries the account id; the timeline needs the human's name. */
async function resolveActorName(req) {
  const userId = req.auth && req.auth.userId;
  if (!userId) return null;
  try {
    const { rows } = await pool.query('SELECT full_name FROM platform_users WHERE id = $1', [userId]);
    return rows.length ? rows[0].full_name : null;
  } catch (err) {
    console.error('[cases] actor lookup failed:', err.message);
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
  let storedCaseData = null;
  try {
    const { rows } = await pool.query('SELECT current_stage, case_data FROM clinical_cases WHERE id = $1', [c.id]);
    caseExistsInDb = rows.length > 0;
    if (caseExistsInDb) {
      currentStageInDb = rows[0].current_stage;
      storedCaseData = rows[0].case_data;
    }

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

  // Applied before anything is derived from the payload, so validation, timeline
  // milestones and the stored columns all see the preserved content.
  if (caseExistsInDb) preserveCapturedContent(storedCaseData, c);

  // Payment gate mirror of the client rule: the invoice is checked exactly once, at
  // the cut-point where the case leaves the patient/payment phase and is dispatched
  // to the consultant. Later stages inherit that clearance - re-checking it at the
  // 21-day follow-up or closure rejected cases whose money was already collected.
  const GATED_STAGES = ['WITH_CONSULTANT'];
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
    const milestoneInfo = mapStageToMilestoneInfo('INTAKE_RECEIVED', { actorName: c.patientName });
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
    const milestoneInfo = mapStageToMilestoneInfo(c.currentStage, {
      actorName: await resolveActorName(req),
      referralApproved: c.referralApproved === true,
      treatingDoctorName: c.treatingDoctor && c.treatingDoctor.name,
    });
    // The client records the same milestone in the very write that changes the
    // stage; appending a second copy here is what duplicated events on every move.
    const alreadyRecorded =
      Boolean(milestoneInfo) && c.timeline.some((e) => e && e.actionCode === milestoneInfo.actionCode);
    if (milestoneInfo && !alreadyRecorded) {
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
  // This endpoint is the verification act itself, so it owns the flag. Leaving it to
  // the caller's fire-and-forget save produced dispatched cases that still claimed
  // the payment was unverified, which then blocked the follow-up stage.
  currentCase.paymentVerified = true;
  currentCase.metadata = {
    ...(currentCase.metadata || {}),
    paymentVerified: true,
    consultantLinkSent: true,
  };
  if (!Array.isArray(currentCase.timeline)) currentCase.timeline = [];
  const timeInfo = generateAstTimestamps();
  const dispatchRecorded = currentCase.timeline.some((e) => e && e.actionCode === 'M04');
  if (!dispatchRecorded) {
    currentCase.timeline.push({
      id: `evt-${Date.now()}`,
      caseId: id,
      timestamp: timeInfo.isoUtc,
      formattedTimeAr: timeInfo.formattedTimeAr,
      formattedTimeEn: timeInfo.formattedTimeEn,
      stage: 'WITH_CONSULTANT',
      actionCode: 'M04',
      actorRole: 'C',
      actorName: await resolveActorName(req),
      actionSummaryAr: 'تم التحقق من السداد وتوليد رابط الاستشاري الدولي',
      actionSummaryEn: 'Payment verified and consultant magic link dispatched',
      isMilestone: true,
    });
  }

  await saveCaseRecord(currentCase);
  return res.json({ success: true, data: currentCase });
});

// A clinical opinion may only be filed by a signed-in account, only for a case that
// is actually with the consultant, and only with the same minimums the form enforces.
// Without this, any caller could stamp an opinion - and the answers to the treating
// doctor's questions - onto a case without a human writing them.
router.post('/:id/opinion', requireAuth, async (req, res) => {
  const { id } = req.params;
  const currentCase = await getCaseById(id);
  if (!currentCase) return res.status(404).json({ error: 'Case not found' });

  const opinion = typeof req.body?.opinion === 'string' ? req.body.opinion.trim() : '';
  const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
  const answersValid =
    answers.length === 3 && answers.every((a) => typeof a === 'string' && a.trim().length >= 15);
  if (opinion.length < 50 || !answersValid) {
    return res.status(400).json({
      error: 'INCOMPLETE_OPINION',
      message:
        'A clinical opinion needs at least 50 characters and a direct answer of at least 15 characters to each of the three focus questions.',
    });
  }

  const dispatched =
    currentCase.currentStage === 'WITH_CONSULTANT' ||
    currentCase.consultantAccepted ||
    Boolean(currentCase.metadata?.dispatchedToConsultantAt);
  if (!dispatched) {
    return res.status(409).json({
      error: 'CASE_NOT_WITH_CONSULTANT',
      message: 'The case has not been dispatched to a consultant.',
    });
  }

  currentCase.consultantOpinion = opinion;
  currentCase.consultantAnswers = answers.map((a) => a.trim());
  currentCase.secondOpinionSubmitted = true;
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
