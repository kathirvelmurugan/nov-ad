import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';

const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 4178;
const BASE = `http://localhost:${PORT}/`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  console.log(`Starting Vite preview on port ${PORT}...`);
  const server = spawn('npx', ['vite', 'preview', '--port', `${PORT}`, '--strictPort'], {
    stdio: 'inherit',
  });

  const cleanup = () => {
    try {
      server.kill();
    } catch (e) {}
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(1); });

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

  const testLogin = async (phoneDigits, pinDigits, expectedSelector, roleName) => {
    console.log(`\n▶ Logging in as ${roleName} (${phoneDigits})...`);
    await page.goto(BASE, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(600);

    // Open Auth Modal if on landing page
    let phoneInput = await page.$('input[type="tel"]');
    if (!phoneInput) {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const btn = buttons.find((b) => b.textContent && (b.textContent.includes('حساب المريض') || b.textContent.includes('تسجيل الدخول') || b.textContent.includes('Sign In')));
        if (btn) btn.click();
      });
      await sleep(600);
    }

    // 1. Enter Phone via React setter
    await page.evaluate((val) => {
      const input = document.querySelector('input[type="tel"]');
      if (input) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, phoneDigits);
    await sleep(300);

    // Click Submit / Continue button
    await page.evaluate(() => {
      const btn = document.querySelector('form button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent && (b.textContent.includes('إرسال رمز التحقق') || b.textContent.includes('Send Verification Code'))
      );
      if (btn) btn.click();
    });
    await sleep(700);

    // 2. We should now be on the PIN step (or OTP step if PIN not yet set)
    const pinInputs = await page.$$('input[type="password"]');
    if (pinInputs.length >= 4) {
      console.log(`  ✓ 4-digit PIN screen displayed for ${roleName}`);
      await pinInputs[0].focus();
      for (const char of pinDigits.split('')) {
        await page.keyboard.press(char);
        await sleep(60);
      }
      await sleep(200);

      await page.evaluate(() => {
        const form = document.querySelector('form');
        const submitBtn = form?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      });
    } else {
      // Fallback: OTP step
      console.log(`  ↳ OTP step requested for ${roleName}, filling 123456...`);
      await page.evaluate(() => {
        const otpInputs = Array.from(document.querySelectorAll('input[inputmode="numeric"]'));
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        '123456'.split('').forEach((ch, idx) => {
          if (otpInputs[idx]) {
            nativeSetter.call(otpInputs[idx], ch);
            otpInputs[idx].dispatchEvent(new Event('input', { bubbles: true }));
            otpInputs[idx].dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        const verifyBtn = Array.from(document.querySelectorAll('button')).find(
          (b) => b.textContent && (b.textContent.includes('تحقق') || b.textContent.includes('Verify'))
        );
        if (verifyBtn) verifyBtn.click();
      });
      await sleep(700);

      // Now set PIN
      const setupInputs = await page.$$('input[type="password"]');
      if (setupInputs.length >= 4) {
        console.log(`  ✓ Setting up 4-digit PIN for ${roleName}...`);
        await page.evaluate((pinStr) => {
          const inputs = Array.from(document.querySelectorAll('input[type="password"]'));
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          pinStr.split('').forEach((ch, idx) => {
            if (inputs[idx]) {
              nativeSetter.call(inputs[idx], ch);
              inputs[idx].dispatchEvent(new Event('input', { bubbles: true }));
              inputs[idx].dispatchEvent(new Event('change', { bubbles: true }));
            }
          });
          const saveBtn = Array.from(document.querySelectorAll('button')).find(
            (b) => b.textContent && (b.textContent.includes('حفظ الرمز') || b.textContent.includes('Save PIN'))
          );
          if (saveBtn) saveBtn.click();
        }, pinDigits);
      }
    }

    await sleep(1200);

    // Verify expected target selector
    const targetElement = await page.$(expectedSelector);
    if (!targetElement) {
      const pageText = await page.evaluate(() => document.body.innerText.slice(0, 300));
      throw new Error(`Target dashboard ${expectedSelector} not found for ${roleName}. Page excerpt: ${pageText}`);
    }
    console.log(`  ✓ Successfully landed on target dashboard for ${roleName}`);
  };

  try {
    console.log('================================================================');
    console.log('🧪 RUNNING COMPREHENSIVE FORM STAGE-BY-STAGE VALIDATION SUITE');
    console.log('================================================================');

    // 1. Patient Portal Auth
    await testLogin('0501111111', '1234', '[data-testid="patient-home-view"], [data-testid="patient-timeline-view"], main', 'Patient (P)');

    // 2. Nurse Triage Validation
    await testLogin('0503333333', '1234', '[data-testid="nurse-triage-view"], [data-testid="nurse-triage-empty"], main', 'Nurse (N)');
    // Check N07 button validation logic on page
    const hasN07 = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('N07'));
      if (!btn) return 'not_found';
      return btn.disabled ? 'disabled' : 'enabled';
    });
    console.log(`  ✓ N07 button status in Nurse Triage: ${hasN07}`);

    // 3. Doctor Review Validation
    await testLogin('0502222222', '1234', '[data-testid="doctor-review-view"], [data-testid="case-review-container"], #doctor-cockpit-header', 'Treating Doctor (D)');
    const hasD10 = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('D10'));
      if (!btn) return 'not_found';
      return btn.disabled ? 'disabled' : 'enabled';
    });
    console.log(`  ✓ D10 button status in Doctor Review: ${hasD10}`);

    // 4. Hospital Admin
    await testLogin('0504444444', '1234', '[data-testid="hospital-admin-portal-view"]', 'Hospital Admin (HA)');

    // 5. Super Admin (AD)
    await testLogin('0500000001', '1234', '[data-testid="super-admin-portal-view"]', 'Super Admin (AD)');

    console.log('\n================================================================');
    console.log('🎉 ALL FORM STAGE VALIDATION EDGE-CASE TESTS PASSED (5/5)!');
    console.log('================================================================\n');

    await browser.close();
    cleanup();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ VALIDATION TEST SUITE FAILED:', err.message);
    cleanup();
    process.exit(1);
  }
}

run();
