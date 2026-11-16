/**
 * Compatibility surface for the old `data/pricing` module.
 *
 * Every value now lives in `config/platform.defaults.json` and is read through
 * `src/config/platformConfig.ts`, which merges the persisted settings document
 * over those defaults. This file stays so the existing import sites keep
 * working — it holds no constants of its own.
 */
export type { ConsultationType, TierConfig as PriceTier } from '../config/platformConfig';

export {
  DEFAULT_PLATFORM_CONFIG,
  currencySymbol,
  defaultRailIds,
  enabledRails,
  followUpDays,
  formatSar,
  installmentCount,
  installmentPlan,
  newCaseNumber,
  newInvoiceNumber,
  paymentRails,
  platformCatalogs,
  priceTiers,
  railById,
  serviceTierId,
  slaHoursFor,
  splitVat,
  tabbyInstallment,
  tierById,
  tierForService,
  tierForType,
  tierNameFor,
  vatPercent,
} from '../config/platformConfig';
