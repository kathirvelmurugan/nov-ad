// =============================================================================
// Stage 7 — Patient Final Verification: Check timeline, closed status, reports
// Hero: Patient (+966500000099 — self-registered)
// =============================================================================
import { check, sleep, screenshot, reloadAndGoEnglish } from '../helpers/ui-helpers.mjs';

export const STAGE = { number: 7, hero: 'patient', label: 'Patient Final Verification' };

export async function run(page, sharedState) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 STAGE 7: PATIENT — Verify Final Timeline & Closed Status');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await reloadAndGoEnglish(page, 'Patient');
  await screenshot(page, 'flow-15-patient-final.png');

  // Scroll to top then full-page capture
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(400);
  await screenshot(page, 'flow-16-fullpage-final.png', true);

  // Final state check
  const finalText = await page.evaluate(() => document.body.innerText);
  console.log(`\n  Final page: ${finalText.length} chars`);
  const hasClosed = /closed|مغلق/i.test(finalText);
  const hasReport = /report|pdf|تقرير/i.test(finalText);
  console.log(`  Case closed indicator: ${hasClosed}`);
  console.log(`  Report reference: ${hasReport}`);

  check('Case shows closed status', hasClosed);
  check('Report reference visible', hasReport);
  console.log('  ✅ Stage 7 Complete: Patient final audit.\n');

  return { verified: true, hasClosed, hasReport };
}