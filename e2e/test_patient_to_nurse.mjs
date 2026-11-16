// =============================================================================
// Linear test: Patient creates case → Nurse triages
// One persona at a time, one browser window. Simple and visible.
// =============================================================================
import { launchBrowser, createIsolatedContext } from './helpers/browser-setup.mjs';
import { loginPersona } from './helpers/auth.mjs';
import { check, sleep, ensureEnglish, ART, resetFailures, failures } from './helpers/ui-helpers.mjs';
import * as stage1 from './stages/stage-1-patient-intake.mjs';
import * as stage2 from './stages/stage-2-nurse-triage.mjs';

resetFailures();

console.log('========================================================');
console.log('  PATIENT → NURSE FLOW (Linear, one at a time)');
console.log('========================================================\n');

const browser = await launchBrowser();

// ═══════════════════════════════════════════════════════════════
// STEP 1: Patient logs in and creates a new case
// ═══════════════════════════════════════════════════════════════
console.log('\n--- STEP 1: PATIENT ---');
const patientCtx = await createIsolatedContext(browser);
const patientPage = await patientCtx.newPage();

await loginPersona(patientPage, '+966500000099', 'Patient (P14)');

console.log('\n  Creating new case...');
const result1 = await stage1.run(patientPage, {});
console.log(`  Case created: ${result1.caseNumber || 'unknown'}`);

await patientCtx.close();

// ═══════════════════════════════════════════════════════════════
// STEP 2: Nurse logs in and triages the case
// ═══════════════════════════════════════════════════════════════
console.log('\n--- STEP 2: NURSE ---');
const nurseCtx = await createIsolatedContext(browser);
const nursePage = await nurseCtx.newPage();

await loginPersona(nursePage, '+966500000004', 'Nurse (N07)');

console.log('\n  Triaging case...');
await stage2.run(nursePage, { caseNumber: result1.caseNumber });

await nurseCtx.close();

// ═══════════════════════════════════════════════════════════════
console.log('\n========================================================');
console.log(failures === 0
  ? '  PATIENT → NURSE FLOW: PASS'
  : `  PATIENT → NURSE FLOW: FAIL (${failures} failures)`);
console.log('========================================================');

await sleep(2000);
await browser.close();
process.exit(failures === 0 ? 0 : 1);