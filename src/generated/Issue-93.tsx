import express from 'express';
import pool from '../db.js';
import { resetInMemoryStore, updateInMemoryStore } from '../store.js';

const router = express.Router();

router.post('/clean-slate', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM audit_logs');
    await client.query('DELETE FROM clinical_cases');
    await client.query('DELETE FROM tenants');
    await client.query('DELETE FROM platform_users');

    await client.query(
      `INSERT INTO platform_users (user_id, full_name, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, true, NOW(), NOW())`,
      ['staff-ad-01', 'Adrian Lewis', 'AD']
    );

    await client.query('COMMIT');

    resetInMemoryStore();

    return res.status(200).json({
      success: true,
      message: 'Clean slate executed successfully. Platform reset to Super Admin only.',
      meta: {
        super_admin_id: 'staff-ad-01',
        super_admin_name: 'Adrian Lewis',
        super_admin_role: 'AD'
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[AdminRouter] clean-slate error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to execute clean slate operation.',
      error: error.message
    });
  } finally {
    client.release();
  }
});

router.post('/purge-patients-and-cases', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM clinical_cases');

    await client.query(
      `DELETE FROM platform_users WHERE role NOT IN ('AD', 'STAFF', 'DOCTOR')`
    );

    await client.query('COMMIT');

    const { rows: remainingUsers } = await pool.query(
      'SELECT user_id, full_name, role, is_active FROM platform_users ORDER BY role ASC, user_id ASC'
    );

    const { rows: activeTenants } = await pool.query(
      'SELECT tenant_id, name, status FROM tenants WHERE status = $1',
      ['active']
    );

    updateInMemoryStore({
      users: remainingUsers,
      tenants: activeTenants,
      cases: [],
      lastPurgeTimestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Patients and clinical cases purged successfully. Staff and doctor accounts preserved.',
      meta: {
        remaining_user_count: remainingUsers.length,
        preserved_roles: ['AD', 'STAFF', 'DOCTOR'],
        purged_entities: ['clinical_cases', 'patient_users']
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[AdminRouter] purge-patients-and-cases error:', error);
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