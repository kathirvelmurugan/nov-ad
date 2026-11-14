import express from 'express';
import pool from '../db.js';
import { memoryCases, STAGE_ORDER } from '../store.js';

const router = express.Router();

const ADMIN_OVERRIDE_TOKEN = 'ALO-ADMIN-OVERRIDE-2026';

function getStageIndex(stage) {
  const idx = STAGE_ORDER.indexOf(stage);
  return idx === -1 ? -1 : idx;
}

router.get('/', async (req, res) => {
  try {
    let rows;
    try {
      const result = await pool.query(
        `SELECT * FROM clinical_cases WHERE stage > 1 OR (symptoms IS NOT NULL AND symptoms != '' AND symptoms != '[]')`
      );
      rows = result.rows;
    } catch (dbErr) {
      rows = memoryCases.filter((c) => {
        const hasSymptoms = c.symptoms && (Array.isArray(c.symptoms) ? c.symptoms.length > 0 : String(c.symptoms).trim().length > 0);
        const stageNum = typeof c.stage === 'string' ? parseInt(c.stage, 10) : c.stage;
        return (typeof stageNum === 'number' && stageNum > 1) || hasSymptoms;
      });
    }
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, stage, symptoms, override_regression } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Case ID is required.' });
    }

    const parsedSymptoms = Array.isArray(symptoms)
      ? symptoms
      : typeof symptoms === 'string' && symptoms.trim() !== ''
        ? symptoms.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    const stageNum = typeof stage === 'string' ? parseInt(stage, 10) : stage;
    const stageStr = STAGE_ORDER[stageNum] || String(stage);

    if ((stageNum === 1 || stageStr === STAGE_ORDER[0]) && parsedSymptoms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Symptoms cannot be empty before stage 1 registration.'
      });
    }

    let existingCase = null;
    let useDb = true;

    try {
      const check = await pool.query('SELECT * FROM clinical_cases WHERE id = $1', [id]);
      if (check.rows.length > 0) {
        existingCase = check.rows[0];
      }
    } catch (dbErr) {
      useDb = false;
      existingCase = memoryCases.find((c) => c.id === id) || null;
    }

    if (existingCase) {
      const currentStageVal = existingCase.stage;
      const currentIdx = getStageIndex(currentStageVal);
      const targetIdx = getStageIndex(stageStr);

      if (currentIdx !== -1 && targetIdx !== -1 && targetIdx < currentIdx) {
        if (!override_regression) {
          return res.status(409).json({
            success: false,
            error: 'Regression guard triggered. Stage backsliding is not permitted without explicit override flag.',
            current_stage: currentStageVal,
            requested_stage: stageStr
          });
        }
      }
    }

    const payload = {
      id,
      stage: stageStr,
      symptoms: parsedSymptoms,
      updated_at: new Date().toISOString()
    };

    if (useDb) {
      try {
        await pool.query(
          `INSERT INTO clinical_cases (id, stage, symptoms, updated_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE SET
             stage = EXCLUDED.stage,
             symptoms = EXCLUDED.symptoms,
             updated_at = EXCLUDED.updated_at`,
          [id, stageStr, JSON.stringify(parsedSymptoms), payload.updated_at]
        );
      } catch (upsertErr) {
        useDb = false;
      }
    }

    if (!useDb) {
      const memIdx = memoryCases.findIndex((c) => c.id === id);
      if (memIdx > -1) {
        memoryCases[memIdx] = { ...memoryCases[memIdx], ...payload };
      } else {
        memoryCases.push({ ...payload, created_at: payload.updated_at });
      }
    }

    res.json({ success: true, data: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    let dbCleared = false;
    try {
      await pool.query('TRUNCATE TABLE clinical_cases RESTART IDENTITY CASCADE');
      dbCleared = true;
    } catch (dbErr) {
      // fallback handled below
    }

    if (!dbCleared) {
      try {
        await pool.query('DELETE FROM clinical_cases');
      } catch (delErr) {
        // ignore if DB unavailable
      }
    }

    memoryCases.length = 0;

    res.json({ success: true, message: 'All clinical cases have been deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    try {
      await pool.query('DELETE FROM clinical_cases WHERE id = $1', [id]);
    } catch (dbErr) {
      // fallback to memory
    }

    const memIdx = memoryCases.findIndex((c) => c.id === id);
    if (memIdx > -1) {
      memoryCases.splice(memIdx, 1);
    }

    res.json({ success: true, message: `Case ${id} deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/admin/cases/:id/force-stage', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'];

    if (adminToken !== ADMIN_OVERRIDE_TOKEN) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. Invalid or missing administrative override token.'
      });
    }

    const { id } = req.params;
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({ success: false, error: 'Target stage is required.' });
    }

    const stageStr = STAGE_ORDER.includes(stage) ? stage : String(stage);
    const now = new Date().toISOString();

    let updated = false;

    try {
      const result = await pool.query(
        'UPDATE clinical_cases SET stage = $1, updated_at = $2 WHERE id = $3 RETURNING *',
        [stageStr, now, id]
      );
      if (result.rows.length > 0) {
        updated = true;
        return res.json({ success: true, data: result.rows[0], forced: true });
      }
    } catch (dbErr) {
      // fallback to memory
    }

    if (!updated) {
      const memCase = memoryCases.find((c) => c.id === id);
      if (memCase) {
        memCase.stage = stageStr;
        memCase.updated_at = now;
        return res.json({ success: true, data: memCase, forced: true });
      }
    }

    res.status(404).json({ success: false, error: `Case ${id} not found.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;