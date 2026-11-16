// =============================================================================
// Stage 4 — Coordinator Payment Gate: Verify payment, dispatch to consultant
// Hero: ALO Coordinator — Emmanuel Gonzalez (+966500000003, roleCode C)
// =============================================================================
import { check, sleep, screenshot, reloadAndGoEnglish } from '../helpers/ui-helpers.mjs';

export const STAGE = { number: 4, hero: 'coordinator', label: 'Coordinator Payment Gate' };

export async function run(page, sharedState) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💰 STAGE 4: COORDINATOR — Payment Gate & ZATCA Invoice (C07)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await reloadAndGoEnglish(page, 'Coordinator');
  await screenshot(page, 'flow-09-coordinator-portal.png');

  // Payment gate button — try multiple known labels
  let payClicked = false;
  const paySelectors = [
    'button:has-text("Verify Payment")',
    'button:has-text("Tokenize")',
    'button:has-text("Dispatch")',
    'button:has-text("C05")',
    'button:has-text("C07")',
    'button:has-text("Issue Invoice")',
  ];
  for (const sel of paySelectors) {
    const btn = page.locator(sel).first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.scrollIntoViewIfNeeded();
      await sleep(300);
      await btn.click();
      await sleep(2500);
      payClicked = true;
      console.log(`  Clicked: ${sel}`);
      break;
    }
  }
  if (!payClicked) {
    const txt = await page.evaluate(() => document.body.innerText);
    console.log(`  Page text (first 500): ${txt.substring(0, 500)}`);
  }
  check('Coordinator payment gate clicked', payClicked);

  await screenshot(page, 'flow-10-coordinator-payment.png');
  console.log('  ✅ Stage 4 Complete: Payment gated.\n');

  return { paymentGated: payClicked };
}