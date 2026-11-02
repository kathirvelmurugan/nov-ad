# ALO DOCTOR (v2.4 Saudi Edition) — Payment Gateway Specification

**Document Version:** 1.0 (Phase 1 Baseline)  
**Applicable Scope:** ALO DOCTOR Platform In-App Second Opinion Services Only  
**Target Repository:** `kathirvelmurugan/nov-ad`

---

## 1. Provider Decisions

### Primary Provider: Tap Payments (Kingdom of Saudi Arabia)
- **Supported Payment Rails:** mada (debit), Apple Pay, STC Pay, Visa, Mastercard, American Express.
- **Developer Documentation:** [https://developers.tap.company/docs/overview](https://developers.tap.company/docs/overview)
- **API Reference:** [https://developers.tap.company/reference](https://developers.tap.company/reference)

### Secondary Backup Provider: Moyasar
- **Developer Documentation:** [https://docs.moyasar.com/](https://docs.moyasar.com/)

---

## 2. Core Architectural & Security Rules

1. **Zero Cardholder Data on Server (PCI-DSS Level 1 Compliance):**
   - The application strictly uses **Tap Hosted Redirect Checkout** / Tap iOS/Web SDK.
   - Raw card numbers, expiry dates, and CVVs never touch or transit through ALO DOCTOR servers.

2. **Server-Side Secret Key Isolation:**
   - Client applications only hold the `TAP_PUBLIC_KEY`.
   - `TAP_SECRET_KEY` remains strictly server-side inside VPS / Coolify environment variables.

3. **Webhook as the Single Source of Truth:**
   - Client redirect URLs (`redirect.url`) are used solely for visual UX feedback.
   - Case stage transition from Stage 4 (Payment) to Stage 5 (Consultant Assignment) is triggered **only upon receiving a cryptographically verified webhook event** (`charge.captured`).

4. **Relational Charge Tracking:**
   - Every transaction stores the Tap Charge ID (`chg_...`) against the canonical case number (`ALO-YYYY-NNNN`).
   - Format: `charges` table links `charge_id`, `case_id`, `patient_id`, `amount`, `vat_amount`, and `status`.

5. **API-Driven Refunds:**
   - Refunds for cancellations or SLA breaches must execute via Tap Refund API (`POST /v2/refunds`) tied to the original `charge_id`.

6. **Strict In-App Service Scope (Phase 1):**
   - **Collected in-app:** ALO DOCTOR medical second opinion service fees (Tiers 1, 2, 3) + 15% ZATCA VAT.
   - **NOT collected in-app:** Any subsequent hospital admissions, surgical interventions, physical therapy, or partner clinic visits. All hospital and surgical fees are paid directly at the treating hospital facility in Saudi Arabia or India.

---

## 3. Tier Pricing & ZATCA 15% VAT Matrix (Phase 1)

| Tier | Service Description | Base Fee (SAR) | 15% ZATCA VAT (SAR) | Total Invoiced (SAR) | Tabby 4x Split (SAR/mo) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | Written Second Opinion Report | SAR 1,200 | SAR 180 | **SAR 1,380** | SAR 345.00 / month |
| **Tier 2** | Written Report + 30-min Video Telehealth *(Most Popular)* | SAR 2,500 | SAR 375 | **SAR 2,875** | SAR 718.75 / month |
| **Tier 3** | Multidisciplinary Tumor Board / Complex Surgical Panel | SAR 4,500 | SAR 675 | **SAR 5,175** | SAR 1,293.75 / month |

---

## 4. Development & Testing Strategy

- **Phase 1 Flow Testing Mode:**
  - An interactive **Instant Payment Simulator** (`VITE_PAYMENT_MODE=simulator`) is active on screen `P21`.
  - Generates realistic Tap Charge IDs (`chg_tap_ksa_test_...`), displays compliant ZATCA Phase-2 QR invoices, and triggers WhatsApp Template `W07` (Payment Confirmation & Receipt).
- **Production Switchover Mode:**
  - Setting `VITE_PAYMENT_MODE=tap_live` and supplying `TAP_SECRET_KEY` redirects directly to Tap's live checkout page.
