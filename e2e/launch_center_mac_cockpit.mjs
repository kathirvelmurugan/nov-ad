import { chromium } from 'playwright';

const LIVE_URL = 'https://ad.howtostart.in/feature-sarat/';

async function loginUser(page, phone, pin = '1234') {
  await page.waitForTimeout(1000);

  const phoneInput = page.locator('input[type="tel"]').first();
  if (!(await phoneInput.isVisible())) {
    const loginBtn = page.locator('button:has-text("Login"), button:has-text("تسجيل الدخول")').first();
    if (await loginBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await loginBtn.click();
      await page.waitForTimeout(600);
    }
  }

  if (await phoneInput.isVisible({ timeout: 4000 }).catch(() => false)) {
    await phoneInput.fill(phone);
    await page.waitForTimeout(400);

    const submitPhoneBtn = page.locator('form button[type="submit"]').first();
    await submitPhoneBtn.click();
    await page.waitForTimeout(1000);

    const pinInputs = page.locator('input[type="password"]');
    if (await pinInputs.first().isVisible({ timeout: 4000 }).catch(() => false)) {
      for (let i = 0; i < 4; i++) {
        await pinInputs.nth(i).fill(pin[i]);
        await page.waitForTimeout(150);
      }
      await page.waitForTimeout(400);

      const submitPinBtn = page.locator('form button[type="submit"]').last();
      await submitPinBtn.click();
      await page.waitForTimeout(1500);
    }
  }
}

async function launchCenterMacCockpit() {
  console.log('🚀 Launching Center Mac Dual-Window Cockpit...');

  // Window 1: Left Half (Patient Portal - Video Call Participant)
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
  });
  const pagePatient = await contextPatient.newPage();
  console.log('   Opening Patient Portal on Left Half...');
  await pagePatient.goto(`${LIVE_URL}?portal=patient`, { waitUntil: 'domcontentloaded' });
  await loginUser(pagePatient, '+966501234567', '1234');
  console.log('   ✅ Patient Portal Logged In (Sami Al-Harbi)');

  // Window 2: Right Half (Super Admin Cockpit)
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
  console.log('   Opening Super Admin Portal on Right Half...');
  await pageAdmin.goto(`${LIVE_URL}?portal=superadmin`, { waitUntil: 'domcontentloaded' });
  await loginUser(pageAdmin, '+966500000001', '1234');
  console.log('   ✅ Super Admin Portal Logged In (Adrian Lewis)');

  console.log('\n🎉 Center Mac is 100% active and running. Both windows kept open indefinitely.');
  // Keep alive
  await new Promise(() => {});
}

launchCenterMacCockpit().catch((err) => {
  console.error('Launch error:', err);
});
