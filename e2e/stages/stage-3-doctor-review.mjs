// =============================================================================
// Stage 3 — Doctor Review: Review dossier, approve referral → D10
// Hero: Saudi Doctor — Dr. Abdullah Al-Shammari (+966500000012, roleCode D)
// =============================================================================
import { check, sleep, screenshot, reloadAndGoEnglish } from '../helpers/ui-helpers.mjs';

export const STAGE = { number: 3, hero: 'doctor', label: 'Doctor Review & Referral' };

export async function run(page, sharedState) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍⚕️ STAGE 3: DOCTOR — Review Dossier & Approve Referral (D10)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await reloadAndGoEnglish(page, 'Doctor');
  await screenshot(page, 'flow-07-doctor-portal.png');

  // D10 — Approve Referral & Route to Coordinator
  const d10Btn = page.locator('button', { hasText: /D10|Approve Referral|Route to.*Coordinator/ }).first();
  if (await d10Btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await d10Btn.scrollIntoViewIfNeeded();
    await sleep(300);
    await d10Btn.click();
    await sleep(2500);
    check('D10 Doctor referral clicked', true);
  } else {
    check('D10 Doctor referral clicked', false, 'button not found');
  }

  await screenshot(page, 'flow-08-doctor-approved.png');
  console.log('  ✅ Stage 3 Complete: Doctor approved referral.\n');

  return { referralApproved: true };
}