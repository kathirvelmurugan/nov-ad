import express from 'express';
import pool from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

const remainingUsersByRole = async () => {
  const { rows } = await pool.query(
    'SELECT role_code, COUNT(*)::int AS count FROM platform_users GROUP BY role_code ORDER BY role_code'
  );
  return rows;
};

router.post('/clean-slate', requireAuth, requireRole('AD'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM audit_logs');
    await client.query('DELETE FROM clinical_cases');
    await client.query('DELETE FROM tenants');

    // Preserve every super-admin account (role-based, not a hardcoded phone
    // number) and delete all other platform users.
    await client.query(`DELETE FROM platform_users WHERE role_code <> 'AD'`);

    // Drop sessions that now point at removed users; admin sessions survive.
    await client.query('DELETE FROM sessions WHERE user_id NOT IN (SELECT id FROM platform_users)');

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Clean slate executed. Super admin accounts preserved, all other data cleared.',
      meta: {
        preserved_roles: ['AD'],
        remaining_users_by_role: await remainingUsersByRole(),
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[AdminRouter] clean-slate error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to execute clean slate operation.',
      error: error.message
    });
  } finally {
    client.release();
  }
});

router.post('/purge-patients-and-cases', requireAuth, requireRole('AD'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM clinical_cases');
    await client.query(`DELETE FROM platform_users WHERE role_code = 'P'`);
    await client.query('DELETE FROM sessions WHERE user_id NOT IN (SELECT id FROM platform_users)');

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Patients and clinical cases purged successfully. Staff and doctor accounts preserved.',
      meta: {
        remaining_users_by_role: await remainingUsersByRole(),
        purged_entities: ['clinical_cases', 'patient_users'],
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[AdminRouter] purge-patients-and-cases error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to purge patients and cases.',
      error: error.message
    });
  } finally {
    client.release();
  }
});

export default router;