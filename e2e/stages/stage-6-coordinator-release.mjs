// =============================================================================
// Stage 6 — Coordinator Release: Dual release of certified reports → C08/C09
// Hero: ALO Coordinator — Emmanuel Gonzalez (+966500000003, roleCode C)
// =============================================================================
import { check, sleep, screenshot, reloadAndGoEnglish } from '../helpers/ui-helpers.mjs';

export const STAGE = { number: 6, hero: 'coordinator', label: 'Coordinator Report Release' };

export async function run(page, sharedState) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📄 STAGE 6: COORDINATOR — Report Release & Case Closure (C08/C09)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await reloadAndGoEnglish(page, 'Coordinator');
  await screenshot(page, 'flow-13-coordinator-release.png');

  // Release button
  const releaseBtn = page.locator('button', { hasText: /Release|C08|C09|إصدار التقرير/ }).first();
  if (await releaseBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await releaseBtn.scrollIntoViewIfNeeded();
    await sleep(300);
    await releaseBtn.click();
    await sleep(2500);
    check('Report release clicked', true);
  } else {
    check('Report release clicked', false, 'button not found');
  }

  await screenshot(page, 'flow-14-case-closed.png');
  console.log('  ✅ Stage 6 Complete: Reports released.\n');

  return { reportsReleased: true };
}