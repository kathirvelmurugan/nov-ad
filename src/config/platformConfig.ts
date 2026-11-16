import defaults from '../../config/platform.defaults.json';
import type { PaymentMethodId } from '../types';
import { serviceById } from './services';

/**
 * Platform configuration — the single runtime source for every value that is
 * commercially or operationally tunable: prices, VAT, payment rails, service
 * tiers, SLA windows and clinical catalogue lists.
 *
 * `config/platform.defaults.json` is the default document (shared with the
 * server, which seeds and persists it). `setPlatformConfig()` replaces the
 * active document once `/api/settings/public` resolves; every selector below
 * reads the active document, so nothing needs a re-render contract change.
 *
 * Never hardcode a price, a VAT rate, a rail list or a case prefix anywhere
 * else — add a selector here instead.
 */

export type ConsultationType = 'written' | 'video' | 'voice';

export interface CurrencyConfig {
  code: string;
  symbolEn: string;
  symbolAr: string;
  vatPercent: number;
  taxInclusive: boolean;
}

export interface TierConfig {
  id: number;
  consultationType: ConsultationType;
  tierNameEn: string;
  tierNameAr: string;
  /** VAT-inclusive amount actually charged. */
  totalSar: number;
}

export interface InstallmentPlanConfig {
  provider: string;
  labelEn: string;
  labelAr: string;
  installments: number;
  interestFree: boolean;
}

export interface PaymentRailConfig {
  id: PaymentMethodId;
  labelEn: string;
  labelAr: string;
  subLabelEn: string;
  subLabelAr: string;
  enabled: boolean;
  requiresInstallments: boolean;
}

export interface PolicyConfig {
  followUpDays: number;
  slaHours: Record<string, number>;
}

export interface ServiceOverride {
  enabled: boolean;
  priceTierId: number | null;
  titleAr?: string;
  titleEn?: string;
  turnaroundAr?: string;
  turnaroundEn?: string;
}

export interface CatalogConfig {
  specialties: string[];
  labTests: string[];
  medications: string[];
}

export interface PlatformConfig {
  schemaVersion: number;
  currency: CurrencyConfig;
  pricing: {
    tiers: TierConfig[];
    installmentPlan: InstallmentPlanConfig;
    invoicePrefix: string;
    casePrefix: string;
  };
  payment: { rails: PaymentRailConfig[] };
  policy: PolicyConfig;
  services: Record<string, ServiceOverride>;
  catalogs: CatalogConfig;
}

/** The compiled-in defaults. Identical to `config/platform.defaults.json`. */
export const DEFAULT_PLATFORM_CONFIG = defaults as unknown as PlatformConfig;

let activeConfig: PlatformConfig = DEFAULT_PLATFORM_CONFIG;

export const getPlatformConfig = (): PlatformConfig => activeConfig;

/**
 * Merge a (possibly partial) settings document over the defaults. Called by the
 * config provider after `/api/settings/public`; passing nothing restores the
 * defaults, which is also what happens when the API is unreachable.
 */
export const setPlatformConfig = (incoming?: Partial<PlatformConfig> | null): void => {
  if (!incoming) {
    activeConfig = DEFAULT_PLATFORM_CONFIG;
    return;
  }
  const base = DEFAULT_PLATFORM_CONFIG;
  activeConfig = {
    ...base,
    ...incoming,
    currency: { ...base.currency, ...(incoming.currency || {}) },
    pricing: {
      ...base.pricing,
      ...(incoming.pricing || {}),
      tiers:
        incoming.pricing?.tiers && incoming.pricing.tiers.length > 0
          ? incoming.pricing.tiers
          : base.pricing.tiers,
      installmentPlan: {
        ...base.pricing.installmentPlan,
        ...(incoming.pricing?.installmentPlan || {}),
      },
    },
    payment: {
      rails:
        incoming.payment?.rails && incoming.payment.rails.length > 0
          ? incoming.payment.rails
          : base.payment.rails,
    },
    policy: {
      ...base.policy,
      ...(incoming.policy || {}),
      slaHours: { ...base.policy.slaHours, ...(incoming.policy?.slaHours || {}) },
    },
    services: { ...base.services, ...(incoming.services || {}) },
    catalogs: { ...base.catalogs, ...(incoming.catalogs || {}) },
  };
};

// ── Currency & VAT ───────────────────────────────────────────────────────────

export const vatPercent = (): number => activeConfig.currency.vatPercent;

export const currencySymbol = (lang: 'ar' | 'en' = 'en'): string =>
  lang === 'ar' ? activeConfig.currency.symbolAr : activeConfig.currency.symbolEn;

/** Locale-formatted amount with 2 decimals, e.g. `150.00`. */
export const formatSar = (amount: number, lang: 'ar' | 'en' = 'en'): string =>
  new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

/**
 * Split a VAT-inclusive amount into base + VAT so the invoice always balances
 * (base + vat === total). The only place VAT arithmetic may live.
 */
export const splitVat = (
  totalSar: number
): { baseSar: number; vatSar: number; totalSar: number } => {
  const total = Math.round((Number(totalSar) || 0) * 100) / 100;
  const rate = 1 + vatPercent() / 100;
  const base = Math.round((total / rate) * 100) / 100;
  return {
    baseSar: base,
    vatSar: Math.round((total - base) * 100) / 100,
    totalSar: total,
  };
};

// ── Pricing tiers & services ─────────────────────────────────────────────────

export const priceTiers = (): TierConfig[] => activeConfig.pricing.tiers;

export const tierById = (id?: number): TierConfig => {
  const tiers = activeConfig.pricing.tiers;
  return tiers.find((tier) => tier.id === id) || tiers[0];
};

/** Tier assignment for a catalogue service, honouring settings overrides. */
export const serviceTierId = (serviceId?: string): number | null => {
  const override = activeConfig.services[serviceId || ''];
  if (override) return override.priceTierId;
  return serviceById(serviceId).priceTierId;
};

export const tierForService = (serviceId?: string): TierConfig | null => {
  const id = serviceTierId(serviceId);
  return id === null ? null : tierById(id);
};

export const tierForType = (type: ConsultationType): TierConfig => {
  const explicit = activeConfig.pricing.tiers.find((tier) => tier.consultationType === type);
  if (explicit) return explicit;
  const fallback = activeConfig.pricing.tiers.find((tier) => tier.consultationType === 'video');
  return fallback || activeConfig.pricing.tiers[0];
};

/** A tier with its VAT split derived — the shape invoices store. */
export interface PricedTier extends TierConfig {
  baseSar: number;
  vatSar: number;
}

/** Attach the derived base/VAT pair to any tier. */
export const withVat = (tier: TierConfig): PricedTier => ({
  ...tier,
  ...splitVat(tier.totalSar),
});

export const priceTier = (id?: number): PricedTier => withVat(tierById(id));

export const priceTierForType = (type: ConsultationType): PricedTier =>
  withVat(tierForType(type));

export const priceTierForService = (serviceId?: string): PricedTier | null => {
  const tier = tierForService(serviceId);
  return tier ? withVat(tier) : null;
};

export const tierNameFor = (tier: TierConfig, isAr: boolean): string =>
  `${isAr ? tier.tierNameAr : tier.tierNameEn} (Tier ${tier.id})`;

// ── Installments ─────────────────────────────────────────────────────────────

export const installmentPlan = (): InstallmentPlanConfig => activeConfig.pricing.installmentPlan;

export const installmentCount = (): number =>
  Math.max(1, activeConfig.pricing.installmentPlan.installments);

export const tabbyInstallment = (totalSar: number): number =>
  Number(((Number(totalSar) || 0) / installmentCount()).toFixed(2));

// ── Payment rails ────────────────────────────────────────────────────────────

export const paymentRails = (): PaymentRailConfig[] => activeConfig.payment.rails;

export const enabledRails = (): PaymentRailConfig[] =>
  activeConfig.payment.rails.filter((rail) => rail.enabled);

/** Rail ids offered by default when no invoice has assigned a subset yet. */
export const defaultRailIds = (): PaymentMethodId[] =>
  enabledRails().map((rail) => rail.id);

export const railById = (id: PaymentMethodId): PaymentRailConfig | undefined =>
  activeConfig.payment.rails.find((rail) => rail.id === id);

// ── Policy ───────────────────────────────────────────────────────────────────

export const followUpDays = (): number => activeConfig.policy.followUpDays;

export const slaHoursFor = (stage?: string): number =>
  (stage && activeConfig.policy.slaHours[stage]) || 0;

// ── Identifiers ──────────────────────────────────────────────────────────────

let invoiceSequence = 0;

/** ZATCA invoice reference; unique per issuing call within a session. */
export const newInvoiceNumber = (year: number = new Date().getFullYear()): string => {
  invoiceSequence = (invoiceSequence + 1) % 1000;
  const suffix = String(invoiceSequence).padStart(3, '0');
  return `${activeConfig.pricing.invoicePrefix}-${year}-${Date.now().toString().slice(-7)}${suffix}`;
};

/** Case reference, e.g. `ALO-2026-4821`. Prefix comes from settings. */
export const newCaseNumber = (prefix?: string): string => {
  const p = prefix || activeConfig.pricing.casePrefix;
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${p}-${new Date().getFullYear()}-${n}`;
};

// ── Catalogues ───────────────────────────────────────────────────────────────

export const platformCatalogs = (): CatalogConfig => activeConfig.catalogs;

export const isServiceEnabled = (serviceId: string): boolean =>
  activeConfig.services[serviceId]?.enabled ?? true;
