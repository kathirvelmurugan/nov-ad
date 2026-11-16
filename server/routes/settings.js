import { Router } from 'express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateConfig } from '../../config/validatePlatformConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

/** Read the canonical default config. */
function loadDefaults() {
  const p = join(__dirname, '../../config/platform.defaults.json');
  return JSON.parse(readFileSync(p, 'utf-8'));
}

/**
 * Seed the platform_settings row 1 on boot when absent.
 * Called once after DB init.
 */
export async function seedSettings() {
  try {
    const { rows } = await pool.query('SELECT version FROM platform_settings WHERE id = 1');
    if (!rows.length) {
      const defaults = loadDefaults();
      await pool.query(
        `INSERT INTO platform_settings (id, config, version, updated_at)
         VALUES (1, $1, 1, NOW())`,
        [JSON.stringify(defaults)]
      );
      console.log('✅ platform_settings seeded with defaults (version 1).');
    }
  } catch (err) {
    console.warn('⚠️ settings seed failed (degraded — will serve defaults):', err.message);
  }
}

/**
 * GET /api/settings/public
 * No auth. Returns currency, pricing, enabled rails, enabled services.
 * Cache-Control: public, max-age=60.
 */
router.get('/public', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT config FROM platform_settings WHERE id = 1');
    const cfg = rows.length ? rows[0].config : loadDefaults();
    const pub = {
      currency: cfg.currency,
      pricing: cfg.pricing,
      payment: { rails: (cfg.payment?.rails || []).filter(r => r.enabled !== false) },
      services: Object.fromEntries(
        Object.entries(cfg.services || {}).filter(([, v]) => v.enabled !== false)
      ),
    };
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.json({ success: true, data: pub });
  } catch (err) {
    console.error('[settings/public] error:', err.message);
    const defaults = loadDefaults();
    const pub = { currency: defaults.currency, pricing: defaults.pricing, payment: defaults.payment, services: defaults.services };
    return res.json({ success: true, data: pub, degraded: true });
  }
});

/**
 * GET /api/settings — AD only. Full config + version.
 */
router.get('/', requireAuth, requireRole('AD'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT config, version FROM platform_settings WHERE id = 1');
    const cfg = rows.length ? rows[0].config : loadDefaults();
    const version = rows.length ? rows[0].version : 1;
    return res.json({ success: true, data: { config: cfg, version } });
  } catch (err) {
    console.error('[settings] GET error:', err.message);
    const defaults = loadDefaults();
    return res.json({ success: true, data: { config: defaults, version: 1 }, degraded: true });
  }
});

/**
 * PUT /api/settings — AD only. Atomic write with version check (409 on conflict).
 */
router.put('/', requireAuth, requireRole('AD'), async (req, res) => {
  const { config, version } = req.body || {};
  if (!config) {
    return res.status(400).json({ success: false, error: 'config is required' });
  }

  const validation = validateConfig(config);
  if (!validation.ok) {
    return res.status(400).json({ success: false, error: 'VALIDATION_FAILED', details: validation.errors });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Optimistic lock: reject if the version in the DB differs from the client's expected version.
    const { rows } = await client.query('SELECT version FROM platform_settings WHERE id = 1 FOR UPDATE');
    const dbVersion = rows.length ? rows[0].version : 0;

    if (version != null && dbVersion !== version) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        error: 'VERSION_CONFLICT',
        message: `Settings were changed by another user (DB version ${dbVersion}, you sent ${version}). Please reload.`,
        dbVersion,
      });
    }

    const newVersion = dbVersion + 1;
    const changedBy = req.auth?.userId || 'system';

    await client.query(
      `UPDATE platform_settings SET config = $1, version = $2, updated_at = NOW(), updated_by = $3 WHERE id = 1`,
      [JSON.stringify(config), newVersion, changedBy]
    );

    await client.query(
      `INSERT INTO platform_settings_history (version, config, changed_by)
       VALUES ($1, $2, $3)`,
      [newVersion, JSON.stringify(config), changedBy]
    );

    // Audit log
    const topLevelKeys = Object.keys(config).join(', ');
    await client.query(
      `INSERT INTO audit_logs (id, actor_name, actor_role, action_type, target, details, ip_address)
       VALUES ($1, $2, 'AD', 'SETTINGS_UPDATED', 'platform_settings', $3, $4)`,
      [`audit-${Date.now()}`, changedBy, `Updated keys: ${topLevelKeys}`, req.ip || 'unknown']
    );

    await client.query('COMMIT');
    return res.json({ success: true, data: { version: newVersion } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[settings] PUT error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to save settings', details: err.message });
  } finally {
    client.release();
  }
});

export default router;