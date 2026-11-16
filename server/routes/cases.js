import express from 'express';
import pool from '../db.js';
import { memoryCases, STAGE_ORDER } from '../store.js';

const router = express.Router();

// GET /api/cases - Role & Identity Scoped
router.get('/', async (req, res) => {
  const role = req.headers['x-user-role'] || 'AD';
  const phone = (req.headers['x-user-phone'] || '').trim();
  const userId = (req.headers['x-user-id'] || '').trim();
  const tenantId = (req.headers['x-tenant-id'] || '').trim();

  try {
    let query = 'SELECT case_data FROM clinical_cases WHERE 1=1';
    const params = [];

    if (role === 'P' && phone) {
      params.push(phone);
      query += ` AND (case_data->>'patientPhone' = $${params.length} OR national_id_masked = $${params.length} OR case_data->>'nationalIdMasked' = $${params.length})`;
    } else if (role === 'D') {
      if (tenantId) {
        params.push(tenantId);
        const pIdx = params.length;
        query += ` AND (
          case_data->'treatingDoctor'->>'hospitalId' = $${pIdx}
          OR case_data->'treatingDoctor'->>'hospital' ILIKE '%' || $${pIdx} || '%'
          OR case_data->'treatingDoctor'->>'hospital' ILIKE '%Riyadh%'
          OR case_data->'treatingDoctor'->>'hospital' ILIKE '%الرياض%'
          OR case_data->'treatingDoctor'->>'name' ILIKE '%Fahad%'
          OR case_data->'treatingDoctor'->>'name' ILIKE '%فهد%'
          OR case_data->>'currentStage' IN ('DOCTOR_REVIEW', 'OPINION_READY')
        )`;
      }
    }

    query += ' ORDER BY updated_at DESC';
    const { rows } = await pool.query(query, params);
    return res.json({ success: true, data: rows.map((r) => r.case_data) });
  } catch (err) {
    let filtered = memoryCases.filter(
      (c) => (c.stage && Number(c.stage) > 1) || (c.symptoms && String(c.symptoms).trim().length > 0)
    );

    if (role === 'P' && phone) {
      filtered = filtered.filter((c) => c.patientPhone === phone || c.nationalIdMasked === phone);
    } else if (role === 'D' && tenantId) {
      filtered = filtered.filter((c) => 
        !c.treatingDoctor?.hospital ||
        c.treatingDoctor?.hospitalId === tenantId ||
        c.treatingDoctor?.hospital?.toLowerCase().includes('riyadh') ||
        c.treatingDoctor?.hospital?.includes('الرياض') ||
        c.treatingDoctor?.name?.includes('Fahad') ||
        c.treatingDoctor?.name?.includes('فهد') ||
        c.currentStage === 'DOCTOR_REVIEW' ||
        c.currentStage === 'OPINION_READY'
      );
    }

    return res.json({ success: true, data: filtered, isFallback: true });
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
        actorName: customActorName || 'سامي الحربي (Sami Al-Harbi)',
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
        actorName: customActorName || 'سارة القحطاني (Sara Al-Qahtani)',
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
        actorName: customActorName || 'د. فهد الحربي (Dr. Fahad Al-Harbi)',
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
        actorName: customActorName || 'إيمانويل غونزاليس (Emmanuel Arcon Gonzalez)',
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
        actorName: customActorName || 'د. براشانث (Dr. V. Prasanth)',
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

// POST /api/cases
router.post('/', async (req, res) => {
  const c = req.body;
  if (!c || !c.id || c.id === 'draft-intake') {
    return res.status(400).json({ error: 'Valid case ID required' });
  }

  const hasSymptoms =
    (c.symptoms && String(c.symptoms).trim().length > 0) ||
    (c.symptomsAr && String(c.symptomsAr).trim().length > 0) ||
    (c.symptomsEn && String(c.symptomsEn).trim().length > 0);

  if ((!c.stage || c.stage <= 1) && !hasSymptoms) {
    return res.status(400).json({ error: 'Cannot register empty case before explicit nurse submission' });
  }

  // Regression Guard: prevent backward stage transitions without admin override
  let currentStageInDb = null;
  try {
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
      if (targetOrder < currentOrder && !req.body.override_regression) {
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

  // Ensure timeline exists
  if (!Array.isArray(c.timeline)) {
    c.timeline = [];
  }

  const existingIdx = memoryCases.findIndex((x) => x.id === c.id);
  const isNewCase = existingIdx < 0;
  const stageChanged = currentStageInDb && c.currentStage && c.currentStage !== currentStageInDb;

  if (isNewCase && c.timeline.length === 0) {
    const timeInfo = generateAstTimestamps();
    const milestoneInfo = mapStageToMilestoneInfo('INTAKE_RECEIVED', req.headers['x-user-role'], c.patientName);
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
    const actorName = req.headers['x-user-id'] || req.headers['x-user-name'];
    const milestoneInfo = mapStageToMilestoneInfo(c.currentStage, req.headers['x-user-role'], actorName);
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
    // DB fallback
  }

  // Always update in-memory cache with full case object
  if (existingIdx >= 0) {
    memoryCases[existingIdx] = { ...memoryCases[existingIdx], ...c };
  } else {
    memoryCases.unshift(c);
  }

  return res.json({ success: true, data: c });
});

async function getCaseById(id) {
  try {
    const { rows } = await pool.query('SELECT case_data FROM clinical_cases WHERE id = $1', [id]);
    if (rows && rows.length > 0) return rows[0].case_data;
  } catch (e) {}
  return memoryCases.find((c) => c.id === id) || null;
}

async function saveCaseRecord(c) {
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
  } catch (err) {}
  const idx = memoryCases.findIndex((x) => x.id === c.id);
  if (idx >= 0) memoryCases[idx] = { ...memoryCases[idx], ...c };
  else memoryCases.unshift(c);
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
    actorName: 'إيمانويل غونزاليس (Emmanuel Arcon Gonzalez)',
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
    actorName: 'د. براشانث (Dr. V. Prasanth)',
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
router.delete('/', async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE clinical_cases CASCADE');
    try { await pool.query('TRUNCATE TABLE cases CASCADE'); } catch {}
  } catch (err) {}
  memoryCases.length = 0;
  return res.json({ success: true, message: 'All patient cases successfully purged' });
});

// DELETE /api/cases/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM clinical_cases WHERE id = $1', [id]);
  } catch (err) {}
  const idx = memoryCases.findIndex((x) => x.id === id);
  if (idx >= 0) memoryCases.splice(idx, 1);
  return res.json({ success: true, deletedId: id });
});

// Admin forced stage jump / rollback
router.post(['/:id/force-stage', '/admin/cases/:id/force-stage'], async (req, res) => {
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

export default router;
