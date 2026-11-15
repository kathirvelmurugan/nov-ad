import { chromium } from 'playwright';

const LIVE_URL = 'https://ad.howtostart.in/feature-sarat/';

async function launchVisibleCockpit() {
  console.log('🚀 Launching Visible Center Mac Browser with CDP Port 9222...');
  
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--window-position=0,0',
      '--window-size=1440,960',
      '--remote-debugging-port=9222',
      '--disable-features=Translate',
      '--lang=en-US',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });

  // Context 1: Patient (Left Half)
  const contextPatient = await browser.newContext({
    permissions: ['camera', 'microphone'],
    locale: 'en-US',
  });
  const pagePatient = await contextPatient.newPage();
  await pagePatient.setViewportSize({ width: 710, height: 860 });
  await pagePatient.goto(`${LIVE_URL}?portal=patient`, { waitUntil: 'domcontentloaded' });

  // Context 2: Super Admin (Right Half) - Isolated localStorage
  const contextAdmin = await browser.newContext({
    locale: 'en-US',
  });
  const pageAdmin = await contextAdmin.newPage();
  await pageAdmin.setViewportSize({ width: 710, height: 860 });
  await pageAdmin.goto(`${LIVE_URL}?portal=superadmin`, { waitUntil: 'domcontentloaded' });

  // Authenticate Super Admin immediately
  try {
    await pageAdmin.waitForTimeout(1500);
    const pinInput = pageAdmin.locator('input[type="password"]').first();
    if (await pinInput.isVisible({ timeout: 4000 })) {
      await pinInput.fill('1234');
      const submitBtn = pageAdmin.locator('button:has-text("Sign In as Super Admin"), button[type="submit"]').first();
      await submitBtn.click();
      console.log('   ✅ Super Admin authenticated with PIN 1234');
    }
  } catch (e) {
    console.log('   Super Admin already active');
  }

  console.log('🎯 Center Mac Cockpit running. Ready for step-by-step commands via CDP 9222.');
  await new Promise(() => {});
}

launchVisibleCockpit().catch(console.error);
