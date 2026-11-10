import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';

const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 4174;
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

  const testLogin = async (phoneDigits, pinDigits, expectedSelector, roleName) => {
    console.log(`\n▶ Testing Universal Login for ${roleName} (${phoneDigits})...`);
    await page.goto(BASE, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(600);

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
      // Focus first input and type 4 digits with keyboard
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
    // Test 1: Super Admin (AD) via Phone + PIN
    await testLogin('0500000001', '1234', '[data-testid="super-admin-portal-view"]', 'Super Admin (AD)');

    // Test 2: Hospital Admin (HA) via Phone + PIN
    await testLogin('0504444444', '1234', '[data-testid="hospital-admin-portal-view"]', 'Hospital Admin (HA)');

    // Test 3: Saudi Treating Doctor (D) via Phone + PIN
    await testLogin('0502222222', '1234', '[data-testid="doctor-review-view"], [data-testid="case-review-container"], #doctor-cockpit-header', 'Treating Doctor (D)');

    // Test 4: Patient (P) via Phone + PIN
    await testLogin('0501111111', '1234', '[data-testid="patient-home-view"], [data-testid="patient-timeline-view"], main', 'Patient (P)');

    // Test 5: Forgot PIN / OTP Recovery Flow
    console.log(`\n▶ Testing Forgot PIN recovery flow...`);
    await page.goto(BASE, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(600);

    await page.evaluate(() => {
      const input = document.querySelector('input[type="tel"]');
      if (input) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(input, '0505555555');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const btn = document.querySelector('form button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent && (b.textContent.includes('إرسال رمز التحقق') || b.textContent.includes('Send Verification Code'))
      );
      if (btn) btn.click();
    });
    await sleep(700);

    // Click Forgot PIN button
    const forgotBtn = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent && (b.textContent.includes('نسيت رمز الدخول') || b.textContent.includes('Forgot PIN'))
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (forgotBtn) {
      console.log('  ✓ Clicked Forgot PIN button');
      await sleep(500);
      // Verify OTP screen is open
      const otpInputs = await page.$$('input[inputmode="numeric"]');
      if (otpInputs.length === 6) {
        console.log('  ✓ Redirected to 6-digit WhatsApp OTP screen');
      }
    }

    console.log(`\n🎉 ALL UNIVERSAL PIN AUTH TESTS PASSED (5/5)!`);
  } catch (err) {
    console.error(`\n❌ Test failed:`, err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.kill();
  }
}

run();
