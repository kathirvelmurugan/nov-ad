import express from 'express';
import pool from '../db.js';
import { memoryCases, STAGE_ORDER } from '../store.js';

const router = express.Router();

// GET /api/cases
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT case_data FROM clinical_cases 
      WHERE (case_data->>'stage')::int > 1 OR (case_data->>'symptoms') IS NOT NULL AND length(trim(case_data->>'symptoms')) > 0
      ORDER BY updated_at DESC
    `);
    return res.json({ success: true, data: rows.map((r) => r.case_data) });
  } catch (err) {
    const filtered = memoryCases.filter(
      (c) => (c.stage && Number(c.stage) > 1) || (c.symptoms && String(c.symptoms).trim().length > 0)
    );
    return res.json({ success: true, data: filtered, isFallback: true });
  }
});

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

  try {
    await pool.query(
      `INSERT INTO clinical_cases (id, case_number, current_stage, stage, patient_name, patient_name_ar, patient_name_en, national_id_masked, consultation_type, case_data, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (id) DO UPDATE SET current_stage = EXCLUDED.current_stage, stage = EXCLUDED.stage, case_data = EXCLUDED.case_data, updated_at = NOW()`,
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
  const existingIdx = memoryCases.findIndex((x) => x.id === c.id);
  if (existingIdx >= 0) {
    memoryCases[existingIdx] = { ...memoryCases[existingIdx], ...c };
  } else {
    memoryCases.unshift(c);
  }

  return res.json({ success: true, data: c });
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
