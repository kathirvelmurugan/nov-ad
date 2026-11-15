import { chromium } from 'playwright';

const LIVE_URL = 'https://ad.howtostart.in/feature-sarat/';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function humanType(locator, text, minDelay = 70, maxDelay = 110) {
  await locator.click();
  for (const char of text) {
    await locator.pressSequentially(char);
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    await sleep(delay);
  }
}

async function runCenterMacVisibleFlow() {
  console.log('🚀 Launching Clean Visible Center Mac Cockpit (No Translate Bubbles)...');

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--window-position=0,0',
      '--window-size=1440,960',
      '--disable-features=Translate',
      '--lang=en-US',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });

  // Window 1: Patient (Left Half)
  const contextPatient = await browser.newContext({
    viewport: { width: 710, height: 860 },
    permissions: ['camera', 'microphone'],
    locale: 'en-US',
  });
  const pagePatient = await contextPatient.newPage();

  // Window 2: Super Admin (Right Half)
  const contextAdmin = await browser.newContext({
    viewport: { width: 710, height: 860 },
    locale: 'en-US',
  });
  const pageAdmin = await contextAdmin.newPage();

  console.log('   Navigating both portals...');
  await Promise.all([
    pagePatient.goto(`${LIVE_URL}?portal=patient`, { waitUntil: 'domcontentloaded' }),
    pageAdmin.goto(`${LIVE_URL}?portal=superadmin`, { waitUntil: 'domcontentloaded' }),
  ]);
  await sleep(1500);

  // 1. Authenticate Super Admin (Right Window)
  console.log('   Authenticating Super Admin (Right Window)...');
  const adminPinBox = pageAdmin.locator('input[type="password"]').first();
  if (await adminPinBox.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('   Entering Super Admin PIN: 1234...');
    await adminPinBox.fill('1234');
    await sleep(400);
    const adminSubmitBtn = pageAdmin.locator('button:has-text("Sign In as Super Admin"), button[type="submit"]').first();
    await adminSubmitBtn.click();
    console.log('   ✅ Super Admin Logged In.');
    await sleep(1500);
  }

  // 2. Start Patient Clinical Intake (Left Window)
  console.log('   Starting Patient Intake (Left Window)...');
  const startBtn = pagePatient.locator('button:has-text("ابدأ طلبك السريري"), button:has-text("Start Clinical Request"), button:has-text("New Consultation")').first();
  if (await startBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('   Clicking Start button...');
    await startBtn.click();
    await sleep(1500);
  }

  // Select Video Modality (750 SAR)
  const videoCard = pagePatient.locator('button:has-text("Video"), button:has-text("استشارة مرئية"), button:has-text("مرئي + رأي مكتوب")').first();
  if (await videoCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('   Selecting Video Consultation Tier (750 SAR)...');
    await videoCard.click();
    await sleep(800);
  }

  // Type Symptoms at Human Speed
  const symptomsArea = pagePatient.locator('textarea').first();
  if (await symptomsArea.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('   Typing symptoms at human speed (80-120ms/key)...');
    await humanType(symptomsArea, 'Severe chronic lumbar spine pain radiating down to right leg with persistent numbness. Walking limited to 150m.', 70, 110);
    await sleep(1000);
  }

  // Submit Intake Form
  const submitBtn = pagePatient.locator('button:has-text("تقديم الطلب السريري"), button:has-text("Submit Clinical Intake"), button:has-text("Submit"), button:has-text("إرسال")').first();
  if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('   Submitting clinical case...');
    await submitBtn.click();
    await sleep(2000);
    console.log('   ✅ Case ALO-2026-9001 submitted live by Patient!');
  }

  console.log('🎉 Center Mac Flow Complete. Windows remain open on screen.');
  await new Promise(() => {});
}

runCenterMacVisibleFlow().catch(console.error);
