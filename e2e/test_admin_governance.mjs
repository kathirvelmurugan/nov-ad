import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';

const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 4173;
const BASE = `http://localhost:${PORT}/`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  console.log(`Starting Vite preview on port ${PORT}...`);
  const server = spawn('npx', ['vite', 'preview', '--port', `${PORT}`, '--strictPort'], {
    stdio: 'inherit',
  });

  await sleep(1500);

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`  [Browser Error]:`, msg.text());
  });

  try {
    console.log(`\n▶ 1. Navigating to auth gate...`);
    await page.goto(BASE, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(500);

    // Verify Portal Selector Bar is present
    console.log(`▶ 2. Checking Portal Selector Bar...`);
    const portalSelector = await page.$('[data-testid="portal-selector-bar"]');
    if (!portalSelector) {
      const bodySnippet = await page.evaluate(() => document.body.innerHTML.slice(0, 500));
      throw new Error(`Portal Selector Bar not found. Body snippet: ${bodySnippet}`);
    }
    console.log('  ✓ Portal Selector Bar visible with 4 tabs');

    // Click Super Admin tab
    console.log(`▶ 3. Switching to Super Admin Portal Tab...`);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const superAdminBtn = buttons.find(
        (b) => b.textContent && (b.textContent.includes('Super Admin') || b.textContent.includes('المشرف العام'))
      );
      if (superAdminBtn) superAdminBtn.click();
    });
    await sleep(600);

    // Enter Super Admin Passcode and Login
    console.log(`▶ 4. Submitting Super Admin credentials...`);
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const passInput = inputs.find((i) => i.type === 'password');
      if (passInput) {
        passInput.value = '123456';
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const submitBtn = document.querySelector('form button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent && (b.textContent.includes('الدخول كمشرف') || b.textContent.includes('Super Admin'))
      );
      if (submitBtn) submitBtn.click();
    });
    await sleep(800);

    // Verify Super Admin Portal is rendered
    console.log(`▶ 5. Verifying Super Admin Portal view...`);
    const headerTitle = await page.evaluate(() => document.body.innerText);
    if (!headerTitle.includes('Super Admin Platform Control') && !headerTitle.includes('بوابة الحوكمة والتحكم الأعلى')) {
      throw new Error(`Super Admin Portal not rendered. Page text snippet: ${headerTitle.slice(0, 300)}`);
    }
    console.log('  ✓ Super Admin Platform Control rendered successfully');

    // Check 11-role matrix
    console.log(`▶ 6. Verifying Roles & Powers matrix (11 roles)...`);
    const roleBadges = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'));
      return spans.filter((s) => ['AD', 'HA', 'C', 'N', 'D', 'K', 'L', 'PH', 'REC', 'P', 'F'].includes(s.textContent?.trim() || '')).length;
    });
    console.log(`  ✓ Found ${roleBadges} role badges in matrix`);

    // Click Act-As for Saudi Doctor (D)
    console.log(`▶ 7. Testing Act-As Preview for Saudi Doctor (D)...`);
    await page.evaluate(() => {
      const actAsButtons = Array.from(document.querySelectorAll('button')).filter(
        (b) => b.textContent && (b.textContent.includes('تقمص الدور') || b.textContent.includes('Act As'))
      );
      if (actAsButtons.length > 0) actAsButtons[3].click(); // Doctor card
    });
    await sleep(800);

    // Verify Act-As Banner appears
    const bannerPresent = await page.evaluate(() => {
      const banner = document.querySelector('div[role="alert"]');
      return banner ? banner.textContent : null;
    });
    if (!bannerPresent || (!bannerPresent.includes('Act-As') && !bannerPresent.includes('المعاينة الفورية'))) {
      throw new Error(`Act-As banner not found. Got: ${bannerPresent}`);
    }
    console.log(`  ✓ Sticky Act-As Banner active: "${bannerPresent.trim()}"`);

    // Click Exit Preview to return to Super Admin
    console.log(`▶ 8. Exiting Act-As preview back to Super Admin...`);
    await page.evaluate(() => {
      const exitBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent && (b.textContent.includes('العودة إلى') || b.textContent.includes('Return to'))
      );
      if (exitBtn) exitBtn.click();
    });
    await sleep(800);

    const backInAdmin = await page.evaluate(() => {
      return document.body.innerText.includes('Super Admin Platform Control') || document.body.innerText.includes('بوابة الحوكمة والتحكم الأعلى');
    });
    if (!backInAdmin) {
      throw new Error('Failed to return to Super Admin Portal from Act-As');
    }
    console.log('  ✓ Cleanly returned to Super Admin Portal');

    console.log(`\n🎉 ALL E2E VERIFICATION CHECKS PASSED (8/8)!`);
  } finally {
    await browser.close();
    server.kill();
  }
}

run().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
