// =============================================================================
// Stage 5 — Consultant Opinion: Review case, submit specialist opinion → K06
// Hero: Indian Consultant — Dr. Rajesh Kumar (+919876543211, roleCode K)
// =============================================================================
import { check, sleep, screenshot, reloadAndGoEnglish } from '../helpers/ui-helpers.mjs';

export const STAGE = { number: 5, hero: 'consultant', label: 'Consultant Specialist Opinion' };

export async function run(page, sharedState) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 STAGE 5: CONSULTANT — Submit Specialist Opinion (K06)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await reloadAndGoEnglish(page, 'Consultant');
  await screenshot(page, 'flow-11-consultant-portal.png');

  // First — click on the pending case to open detail view
  const pendingCase = page.locator('text=Pending My Review').first();
  if (await pendingCase.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('  Opening pending case from review list...');
    const caseCard = page.locator('[class*="case"], [class*="card"], [class*="row"]')
      .filter({ hasText: /ALO-/ }).first();
    if (await caseCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await caseCard.click();
      await sleep(2000);
    } else {
      await pendingCase.click();
      await sleep(2000);
    }
  }

  // K06 — Submit Opinion — try multiple selectors
  let opinionClicked = false;
  const opinionSelectors = [
    'button:has-text("Submit Formal Opinion")',
    'button:has-text("Submit Written Opinion")',
    'button:has-text("K06")',
    'button:has-text("Submit Opinion")',
    'button:has-text("اعتماد الرأي")',
  ];
  for (const sel of opinionSelectors) {
    const btn = page.locator(sel).first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.scrollIntoViewIfNeeded();
      await sleep(300);
      await btn.click();
      await sleep(2500);
      opinionClicked = true;
      console.log(`  Clicked: ${sel}`);
      break;
    }
  }
  if (!opinionClicked) {
    const txt = await page.evaluate(() => document.body.innerText);
    console.log(`  Page text (first 500): ${txt.substring(0, 500)}`);
  }
  check('K06 Consultant opinion submitted', opinionClicked);

  await screenshot(page, 'flow-12-consultant-opinion.png');
  console.log('  ✅ Stage 5 Complete: Specialist opinion submitted.\n');

  return { opinionSubmitted: opinionClicked };
}