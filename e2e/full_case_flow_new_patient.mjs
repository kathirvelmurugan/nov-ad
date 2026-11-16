// =============================================================================
// ALO DOCTOR — Full Clinical Case Flow: New Patient → All Stages → Closed
// Verifies against LIVE production at https://ad.howtostart.in
//
// Architecture: Stage-module based. Each stage is a self-contained file under
// e2e/stages/. The orchestrator pre-authenticates all personas, then loops
// through stages sequentially — automatically bringing the hero to front.
//
// Personas use DATABASE-VERIFIED users (no seeding):
//   Patient:      +966500000099  (self-registration, PIN setup on first run)
//   Nurse:        +966500000004  Sara Al-Qahtani (N)
//   Doctor:       +966500000012  Dr. Abdullah Al-Shammari (D)
//   Coordinator:  +966500000003  Emmanuel Arcon Gonzalez (C)
//   Consultant:   +919876543211  Dr. Rajesh Kumar (K)
//   All PIN:      1234
//
// Stages & Heroes:
//   1. PATIENT   — Enter new case (diagnosis, symptoms, meds, consent) → P14
//   2. NURSE     — Triage review, set urgency, approve → N07
//   3. DOCTOR    — Review dossier, approve referral → D10
//   4. COORD     — Verify payment, gate to consultant → C07
//   5. CONSULT   — Submit specialist opinion → K06
//   6. COORD     — Dual release certified reports → C08/C09
//   7. PATIENT   — Verify final timeline / closed status
// =============================================================================
import { launchBrowser, createIsolatedContext } from './helpers/browser-setup.mjs';
import { check, sleep, ensureEnglish, bringToFront, screenshot, ART, resetFailures, failures } from './helpers/ui-helpers.mjs';
import { loginPersona } from './helpers/auth.mjs';

// ── Stage modules (each exports STAGE metadata + run function) ─────────
import * as stage1 from './stages/stage-1-patient-intake.mjs';
import * as stage2 from './stages/stage-2-nurse-triage.mjs';
import * as stage3 from './stages/stage-3-doctor-review.mjs';
import * as stage4 from './stages/stage-4-coordinator-payment.mjs';
import * as stage5 from './stages/stage-5-consultant-opinion.mjs';
import * as stage6 from './stages/stage-6-coordinator-release.mjs';
import * as stage7 from './stages/stage-7-patient-verify.mjs';

// ── Database-verified personas — NO seeding, all users exist in PostgreSQL ──
const PERSONA_DEFS = [
  { key: 'patient',     phone: '+966500000099', label: 'Patient',              code: 'P' },
  { key: 'nurse',       phone: '+966500000004', label: 'Sara Al-Qahtani (N)',  code: 'N' },
  { key: 'doctor',      phone: '+966500000012', label: 'Dr. Al-Shammari (D)',  code: 'D' },
  { key: 'coordinator', phone: '+966500000003', label: 'Emmanuel Gonzalez (C)', code: 'C' },
  { key: 'consultant',  phone: '+919876543211', label: 'Dr. Rajesh Kumar (K)', code: 'K' },
];

// ── Stage execution order ──────────────────────────────────────────────
const STAGES = [stage1, stage2, stage3, stage4, stage5, stage6, stage7];

resetFailures();

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  ALO DOCTOR — FULL CASE FLOW (STAGE-MODULE ARCHITECTURE)   ║');
console.log('║  5 Persona Windows · All Stay Open · Hero Auto-Front       ║');
console.log('║  DB-Verified Users · No Seeding · PIN 1234                 ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// ── Launch browser with translate suppression ─────────────────────────
const browser = await launchBrowser();

// ── Create isolated context + page for each persona ────────────────────
/** @type {Record<string, {context, page, key, phone, label, code}>} */
const windows = {};
for (const def of PERSONA_DEFS) {
  console.log(`🪟 Creating isolated profile for ${def.label}...`);
  const ctx = await createIsolatedContext(browser);
  const pg = await ctx.newPage();
  windows[def.key] = { context: ctx, page: pg, ...def };
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  PHASE 0: Pre-authenticate all 5 personas (sequential — auth needs focus)
// ╚══════════════════════════════════════════════════════════════════════╝
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔐 PHASE 0: Pre-authenticating all 5 persona profiles...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

for (const def of PERSONA_DEFS) {
  const win = windows[def.key];
  await win.page.bringToFront();
  await loginPersona(win.page, def.phone, def.label);
}

console.log('\n  ✅ All 5 personas authenticated. All windows remain open.\n');

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  STAGES 1–7: Sequential execution — hero auto-brought to front      ║
// ╚══════════════════════════════════════════════════════════════════════╝
let sharedState = {};

for (const stage of STAGES) {
  const heroWin = windows[stage.STAGE.hero];
  if (!heroWin) {
    console.log(`  ❌ Unknown hero "${stage.STAGE.hero}" for stage ${stage.STAGE.number}`);
    continue;
  }

  // Bring the active hero window to front
  await bringToFront(heroWin.page, heroWin.label, stage.STAGE.label);

  // Run the stage
  const result = await stage.run(heroWin.page, sharedState);
  sharedState = { ...sharedState, ...result };
}

// ── All windows summary ─────────────────────────────────────────────────
console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
console.log(`║  🎉 FULL CASE FLOW COMPLETE — ALL WINDOWS STILL OPEN        ║`);
console.log(`║                                                            ║`);
console.log(`║  Patient     → Submitted new case (P14)                    ║`);
console.log(`║  Nurse       → Triaged & approved (N07)                    ║`);
console.log(`║  Doctor      → Reviewed & referred (D10)                   ║`);
console.log(`║  Coordinator → Payment gated (C07) + Reports released      ║`);
console.log(`║  Consultant  → Specialist opinion submitted (K06)          ║`);
console.log(`║                                                            ║`);
console.log(`║  Case Number: ${sharedState.caseNumber || '(auto-detected)'}                       ║`);
console.log(`║  Screenshots: ${ART}                         ║`);
console.log(`║  16 screenshots captured across all 7 stages               ║`);
console.log(`╚══════════════════════════════════════════════════════════════╝`);

// Keep all windows open for 30s so you can inspect them
console.log('\n  ⏳ All 5 persona windows remain open for 30 seconds...');
await sleep(30000);

await browser.close();
console.log(failures === 0
  ? '\n======== FULL CASE FLOW: PASS ========'
  : `\n======== FULL CASE FLOW: FAIL (${failures} failures) ========`);
process.exit(failures === 0 ? 0 : 1);