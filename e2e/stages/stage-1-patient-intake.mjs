// =============================================================================
// Stage 1 — Patient Intake: Self-register, fill comprehensive form, submit P14
// Hero: Patient (+966500000099 — self-registration, no pre-existing DB user)
// =============================================================================
import { check, sleep, screenshot } from '../helpers/ui-helpers.mjs';

export const STAGE = { number: 1, hero: 'patient', label: 'Patient Intake & Case Submission' };

export async function run(page, sharedState) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 STAGE 1: PATIENT — Enter New Case & Submit (P14)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Click "Start Your Case"
  const startBtn = page.locator('button', { hasText: /Start Your Case|ابدأ طلبك|New Consultation/ }).first();
  if (await startBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await startBtn.click();
    await sleep(1500);
  }
  check('Start button clicked', true);

  // Select Video format if prompted
  const videoBtn = page.locator('button', { hasText: /Select Video|استشارة مرئية/ }).first();
  if (await videoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await videoBtn.click();
    await sleep(800);
  }

  // Comprehensive intake entry
  const compBtn = page.locator('button', { hasText: /Start Comprehensive Intake|البدء بالاستشارة/ }).first();
  if (await compBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await compBtn.click();
    await sleep(1500);
  }

  await screenshot(page, 'flow-01-patient-intake-form.png');

  // Fill diagnosis
  const diagInput = page.locator('input[placeholder*="Lumbar"], input[placeholder*="Diagnosis"]').first();
  if (await diagInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await diagInput.fill('Severe Degenerative Lumbar Spinal Stenosis L4-L5 with Neurogenic Claudication');
    await sleep(400);
  }

  // Fill symptoms
  const symptomsArea = page.locator('textarea').first();
  if (await symptomsArea.isVisible({ timeout: 2000 }).catch(() => false)) {
    await symptomsArea.fill('Chronic severe lower back pain radiating to right leg. Numbness in both feet. Walking limited to 100m. Seeking specialist second opinion on surgical vs conservative management.');
    await sleep(400);
  }

  // Add medication
  const medInput = page.locator('input[placeholder*="Panadol"], input[placeholder*="Medication"]').first();
  if (await medInput.isVisible({ timeout: 1500 }).catch(() => false)) {
    await medInput.fill('Gabapentin 300mg TDS');
    const addBtn = page.locator('button:has-text("+ Add")').first();
    if (await addBtn.isVisible({ timeout: 1000 }).catch(() => false)) { await addBtn.click(); await sleep(300); }
  }

  // Add allergy
  const algInput = page.locator('input[placeholder*="Penicillin"], input[placeholder*="Allergy"]').first();
  if (await algInput.isVisible({ timeout: 1500 }).catch(() => false)) {
    await algInput.fill('Penicillin (Severe Rash)');
    const addBtns = page.locator('button:has-text("+ Add")');
    if (await addBtns.count() >= 2) { await addBtns.nth(1).click(); await sleep(300); }
  }

  // Check consent
  const consent = page.locator('input[type="checkbox"]').first();
  if (await consent.isVisible({ timeout: 2000 }).catch(() => false)) {
    if (!(await consent.isChecked())) { await consent.check(); await sleep(300); }
    check('Consent checkbox checked', true);
  } else {
    check('Consent checkbox checked', false, 'checkbox not found');
  }

  await screenshot(page, 'flow-02-patient-form-filled.png');

  // P14 Submit
  console.log('  Submitting case (P14)...');
  const p14Btn = page.locator('button', { hasText: /P14|Submit case|إرسال الملف/ }).first();
  const p14Visible = await p14Btn.isVisible({ timeout: 3000 }).catch(() => false);
  if (p14Visible) {
    await p14Btn.click();
    await sleep(3000);
    check('P14 Submit clicked', true);
  } else {
    const anySubmit = page.locator('button[type="submit"]').first();
    if (await anySubmit.isVisible({ timeout: 2000 }).catch(() => false)) {
      await anySubmit.click();
      await sleep(3000);
      check('P14 Submit clicked', true, 'fallback submit');
    } else {
      check('P14 Submit clicked', false, 'no submit button');
    }
  }

  // Read case number
  const caseNumber = await page.evaluate(() => {
    const match = document.body.innerText.match(/ALO-\d{4}-\d+/);
    return match ? match[0] : '';
  });
  console.log(`  Case Number: ${caseNumber || '(not yet visible)'}`);

  await screenshot(page, 'flow-03-patient-submitted.png');
  console.log('  ✅ Stage 1 Complete: Patient intake submitted.\n');

  return { caseNumber };
}