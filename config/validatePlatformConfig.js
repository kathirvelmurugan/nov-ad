/**
 * Shared config validator — plain JS, no dependencies.
 * Used by both server (PUT /api/settings) and client (settings tab).
 *
 * validateConfig(cfg) → { ok: boolean, errors: string[] }
 */

const PREFIX_RE = /^[A-Z]{2,6}$/;
const VALID_CONSULTATION_TYPES = ['written', 'video', 'voice', 'none'];
const VALID_RAIL_IDS = ['mada', 'applepay', 'visa', 'tabby'];
const VALID_SERVICE_IDS = [
  'second-opinion', 'video-consultation', 'voice-consultation',
  'lab-tests', 'pharmacy', 'hospital-services', 'other-services',
];

function isNonNegInt(v) {
  return Number.isFinite(v) && v >= 0 && Number.isInteger(v);
}

function isPosInt(v) {
  return Number.isFinite(v) && v > 0 && Number.isInteger(v);
}

export function validateConfig(cfg) {
  const errors = [];

  if (!cfg || typeof cfg !== 'object') {
    return { ok: false, errors: ['Config must be an object.'] };
  }

  // ── Currency ────────────────────────────────────────────────────────────
  const ccy = cfg.currency;
  if (ccy) {
    if (typeof ccy.code !== 'string' || ccy.code.length < 2) errors.push('currency.code must be a string (≥ 2 chars)');
    if (ccy.vatPercent != null && (!Number.isFinite(ccy.vatPercent) || ccy.vatPercent < 0 || ccy.vatPercent > 100)) {
      errors.push('currency.vatPercent must be 0–100');
    }
    if (ccy.taxInclusive != null && typeof ccy.taxInclusive !== 'boolean') {
      errors.push('currency.taxInclusive must be boolean');
    }
  }

  // ── Pricing ─────────────────────────────────────────────────────────────
  const pricing = cfg.pricing;
  if (pricing) {
    if (Array.isArray(pricing.tiers)) {
      const tierIds = new Set();
      for (const t of pricing.tiers) {
        if (!t.id) errors.push('pricing.tiers[*].id is required');
        if (tierIds.has(t.id)) errors.push(`Duplicate tier id: ${t.id}`);
        tierIds.add(t.id);
        if (!isPosInt(t.totalSar)) errors.push(`pricing.tiers[${t.id}].totalSar must be > 0`);
        if (t.consultationType && !VALID_CONSULTATION_TYPES.includes(t.consultationType)) {
          errors.push(`pricing.tiers[${t.id}].consultationType must be one of: ${VALID_CONSULTATION_TYPES.join(', ')}`);
        }
      }
    }
    if (pricing.installmentPlan) {
      const ip = pricing.installmentPlan;
      if (ip.installments != null && (!Number.isInteger(ip.installments) || ip.installments < 2 || ip.installments > 12)) {
        errors.push('pricing.installmentPlan.installments must be 2–12');
      }
    }
    if (pricing.invoicePrefix != null && !PREFIX_RE.test(pricing.invoicePrefix)) {
      errors.push('pricing.invoicePrefix must be 2–6 uppercase letters');
    }
    if (pricing.casePrefix != null && !PREFIX_RE.test(pricing.casePrefix)) {
      errors.push('pricing.casePrefix must be 2–6 uppercase letters');
    }
  }

  // ── Payment rails ───────────────────────────────────────────────────────
  const rails = cfg.payment?.rails;
  if (Array.isArray(rails)) {
    const railIds = new Set();
    for (const r of rails) {
      if (!r.id || !VALID_RAIL_IDS.includes(r.id)) errors.push(`Invalid rail id: ${r.id}`);
      if (railIds.has(r.id)) errors.push(`Duplicate rail id: ${r.id}`);
      railIds.add(r.id);
    }
  }

  // ── Policy ──────────────────────────────────────────────────────────────
  const policy = cfg.policy;
  if (policy) {
    if (policy.followUpDays != null && (!Number.isInteger(policy.followUpDays) || policy.followUpDays < 1 || policy.followUpDays > 365)) {
      errors.push('policy.followUpDays must be 1–365');
    }
    if (policy.slaHours && typeof policy.slaHours === 'object') {
      for (const [key, val] of Object.entries(policy.slaHours)) {
        if (!isPosInt(val)) {
          errors.push(`policy.slaHours.${key} must be a positive integer (got ${val})`);
        }
      }
    }
  }

  // ── Services ────────────────────────────────────────────────────────────
  const services = cfg.services;
  if (services && typeof services === 'object') {
    for (const key of Object.keys(services)) {
      if (!VALID_SERVICE_IDS.includes(key)) {
        errors.push(`Unknown service id: ${key}`);
      }
    }
  }

  // ── Unknown top-level keys ──────────────────────────────────────────────
  const KNOWN_KEYS = new Set([
    'schemaVersion', 'currency', 'pricing', 'payment', 'policy', 'services', 'catalogs',
  ]);
  for (const key of Object.keys(cfg)) {
    if (!KNOWN_KEYS.has(key)) {
      errors.push(`Unknown top-level key: ${key}`);
    }
  }

  return { ok: errors.length === 0, errors };
}