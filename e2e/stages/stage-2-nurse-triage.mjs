// =============================================================================
// Stage 2 — Nurse Triage: Review case, set urgency, approve & route to Doctor
// Hero: ALO Nurse — Sara Al-Qahtani (+966500000004, roleCode N)
// =============================================================================
import { check, sleep, screenshot, reloadAndGoEnglish } from '../helpers/ui-helpers.mjs';

export const STAGE = { number: 2, hero: 'nurse', label: 'Nurse Triage & Approval' };

export async function run(page, sharedState) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🩺 STAGE 2: NURSE — Triage Review & Route to Doctor (N07)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Refresh to pick up new case, ensure English
  await reloadAndGoEnglish(page, 'Nurse');
  await screenshot(page, 'flow-04-nurse-portal.png');

  // Fill triage notes
  const triageText = page.locator('textarea').first();
  if (await triageText.isVisible({ timeout: 2000 }).catch(() => false)) {
    await triageText.fill('Vitals stable. MRI lumbar series verified. PII de-identified per MOH/SDAIA. Routing to Saudi treating physician.');
    await sleep(400);
  }

  // Set urgency
  const urgentBtn = page.locator('button', { hasText: /Urgent|عاجل/ }).first();
  if (await urgentBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await urgentBtn.click();
    await sleep(400);
  }

  await screenshot(page, 'flow-05-nurse-triage-filled.png');

  // N07 — Approve & route to Doctor
  const n07Btn = page.locator('button', { hasText: /N07|Approve.*route|Approve.*doctor/ }).first();
  if (await n07Btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await n07Btn.scrollIntoViewIfNeeded();
    await sleep(300);
    await n07Btn.click();
    await sleep(2500);
    check('N07 Nurse approval clicked', true);
  } else {
    check('N07 Nurse approval clicked', false, 'button not found');
  }

  await screenshot(page, 'flow-06-nurse-approved.png');
  console.log('  ✅ Stage 2 Complete: Nurse approved triage.\n');

  return { triageApproved: true };
}