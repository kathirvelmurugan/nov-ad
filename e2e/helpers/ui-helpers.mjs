// =============================================================================
// Shared UI helpers — use in any E2E test
// =============================================================================
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ART = path.join(__dirname, '..', '..', 'e2e_screenshots');

// ── Track failures ─────────────────────────────────────────────────────
export let failures = 0;
export function resetFailures() { failures = 0; }

export function check(label, ok, extra = '') {
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${label}${extra ? ' :: ' + extra : ''}`);
  if (!ok) failures++;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Dismiss any open error dialog overlay ──────────────────────────────
export async function dismissErrorDialog(page) {
  await page.keyboard.press('Escape');
  await sleep(400);
  await page.evaluate(() => {
    document.querySelectorAll('[role="alertdialog"]').forEach((el) => el.remove());
    document.querySelectorAll('.fixed.inset-0.z-50').forEach((o) => o.remove());
  });
  await sleep(300);
}

// ── Switch page to English & confirm ───────────────────────────────────
// The language toggle (🌐 globe icon, "English (EN)" or "العربية (AR)")
// lives in the persona switcher bar at the top of the page.
// It may take a moment to render after login — wait for it.
export async function ensureEnglish(page, label = '') {
  const prefix = label ? `[${label}] ` : '';

  // Wait for the persona bar to fully render (contains the language toggle)
  await sleep(1500);

  // Method 1: title-based toggle (most reliable, has title="Switch Interface to English")
  const enToggle = page.locator('button[title="Switch Interface to English"]');
  try {
    await enToggle.first().waitFor({ state: 'visible', timeout: 5000 });
    await enToggle.first().click();
    await sleep(1500);
    console.log(`  🌐 ${prefix}Switched to English (globe toggle)`);
  } catch {
    // Method 2: text-based toggle — button containing "English" or "EN"
    const enTextBtn = page.locator('button', { hasText: /English.*EN|^EN$/ }).first();
    if (await enTextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await enTextBtn.click();
      await sleep(1500);
      console.log(`  🌐 ${prefix}Switched to English (text button)`);
    } else {
      // Method 3: any button with Globe icon + short text
      const globeBtn = page.locator('button:has(svg)').filter({ hasText: /EN|English|AR|العربية/ }).first();
      if (await globeBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await globeBtn.click();
        await sleep(1500);
        console.log(`  🌐 ${prefix}Switched to English (globe icon)`);
      }
    }
  }

  // Verify it switched
  const bodyAfter = await page.evaluate(() => document.body.innerText);
  const isEnglish = /Latest Activity|All Cases|Master Clinical|Track Cases|Log Out/i.test(bodyAfter);
  if (!isEnglish && label) {
    console.log(`  ⚠ ${prefix}English switch may not have taken effect`);
  }

  // Nuke any surviving translate bar
  await page.evaluate(() => {
    document.querySelectorAll(
      '.goog-te-banner-frame, .goog-te-balloon-frame, .goog-te-menu-frame,' +
      ' iframe[id*="google"], iframe[src*="translate"],' +
      ' [id*="translate"], [class*="translate"], [id*="gt-"]'
    ).forEach((el) => el.remove());
  });
}

// ── Bring a persona window to front ────────────────────────────────────
export async function bringToFront(page, personaLabel, stageLabel) {
  console.log(`\n▶ BRINGING TO FRONT: [${personaLabel}] — ${stageLabel}`);
  await page.bringToFront();
  await sleep(600);
}

// ── Reload + ensure English (standard pattern for each stage) ──────────
export async function reloadAndGoEnglish(page, label) {
  await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
  await sleep(1500);
  await ensureEnglish(page, label);
  await sleep(500);
}

// ── Screenshot helper ───────────────────────────────────────────────────
export async function screenshot(page, name, fullPage = false) {
  const filePath = path.join(ART, name);
  await page.screenshot({ path: filePath, fullPage });
  console.log(`  📸 ${name}`);
}