import { chromium } from 'playwright';

const LIVE_URL = 'https://ad.howtostart.in/feature-sarat/';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function loginUser(page, phone, pin = '1234') {
  await sleep(1000);

  const phoneInput = page.locator('input[type="tel"]').first();
  if (!(await phoneInput.isVisible())) {
    const loginBtn = page.locator('button:has-text("Login"), button:has-text("تسجيل الدخول")').first();
    if (await loginBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loginBtn.click();
      await sleep(600);
    }
  }

  if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log(`   Entering phone: ${phone}`);
    await phoneInput.fill(phone);
    await sleep(400);

    const submitPhoneBtn = page.locator('form button[type="submit"]').first();
    await submitPhoneBtn.click();
    await sleep(1200);

    // Check if 4-digit PIN screen
    const pinInputs = page.locator('input[type="password"]');
    if (await pinInputs.first().isVisible({ timeout: 2500 }).catch(() => false)) {
      console.log(`   Entering 4-digit PIN: ${pin}`);
      for (let i = 0; i < 4; i++) {
        await pinInputs.nth(i).fill(pin[i]);
        await sleep(100);
      }
      await sleep(300);
      const submitPinBtn = page.locator('form button[type="submit"]').last();
      await submitPinBtn.click();
      await sleep(1500);
    } else {
      // First-time OTP screen (6 digits)
      const otpInputs = page.locator('input[inputmode="numeric"], input[aria-label*="OTP digit"]');
      if (await otpInputs.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('   Entering 6-digit OTP: 123456');
        const otpCode = '123456';
        for (let i = 0; i < 6; i++) {
          await otpInputs.nth(i).fill(otpCode[i]);
          await sleep(80);
        }
        await sleep(400);
        const submitOtpBtn = page.locator('form button[type="submit"]').last();
        await submitOtpBtn.click();
        await sleep(1500);

        // Check if Set PIN screen follows
        const setupPinInputs = page.locator('input[type="password"]');
        if (await setupPinInputs.first().isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log('   Setting PIN to 1234...');
          for (let i = 0; i < 4; i++) {
            await setupPinInputs.nth(i).fill(pin[i]);
            await sleep(100);
          }
          await sleep(300);
          const submitSetupBtn = page.locator('form button[type="submit"]').last();
          await submitSetupBtn.click();
          await sleep(1500);
        }
      }
    }
  }
}

async function startVisibleCenterMac() {
  console.log('🚀 Launching VISIBLE browsers on Center Mac...');

  // Window 1: Patient (Left Half)
  const browserPatient = await chromium.launch({
    headless: false,
    args: [
      '--window-position=0,0',
      '--window-size=740,960',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });
  const contextPatient = await browserPatient.newContext({
    viewport: { width: 720, height: 860 },
    permissions: ['camera', 'microphone'],
  });
  const pagePatient = await contextPatient.newPage();
  await pagePatient.goto(`${LIVE_URL}?portal=patient`, { waitUntil: 'domcontentloaded' });
  await loginUser(pagePatient, '+966501234567', '1234');
  console.log('✅ Patient Portal Visible & Logged In');

  // Window 2: Super Admin (Right Half)
  const browserAdmin = await chromium.launch({
    headless: false,
    args: [
      '--window-position=740,0',
      '--window-size=740,960',
    ],
  });
  const contextAdmin = await browserAdmin.newContext({
    viewport: { width: 720, height: 860 },
  });
  const pageAdmin = await contextAdmin.newPage();
  await pageAdmin.goto(`${LIVE_URL}?portal=superadmin`, { waitUntil: 'domcontentloaded' });
  await loginUser(pageAdmin, '+966500000001', '1234');
  console.log('✅ Super Admin Portal Visible & Logged In');

  // Keep open
  await new Promise(() => {});
}

startVisibleCenterMac().catch((e) => console.error('Launch error:', e));
