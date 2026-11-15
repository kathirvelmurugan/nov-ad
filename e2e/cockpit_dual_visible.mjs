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

async function handleAuthModalIfPresent(page, phone = '0501111111') {
  await sleep(1000);
  // Check if auth modal or phone input is present
  const phoneInput = page.locator('input[type="tel"], input[placeholder*="05"], input[placeholder*="5"]').first();
  if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log(`   Entering Patient Phone: ${phone}...`);
    await phoneInput.click();
    await phoneInput.fill(phone);
    await sleep(500);

    const sendCodeBtn = page.locator('button:has-text("Send Verification Code"), button:has-text("إرسال رمز التحقق"), button[type="submit"]').first();
    await sendCodeBtn.click();
    await sleep(1200);
  }

  // Check if 4-digit PIN is requested (returning user)
  const pinInput = page.locator('input[type="password"]').first();
  const otpInputs = page.locator('input[maxlength="1"], input[type="text"][pattern]');

  const otpCount = await otpInputs.count();
  if (otpCount >= 6) {
    console.log('   Entering OTP: 123456...');
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(String(i + 1 <= 6 ? (i + 1) : 1));
    }
    await sleep(800);
    const verifyBtn = page.locator('button:has-text("Verify & Continue"), button:has-text("تحقق ومتابعة"), button[type="submit"]').first();
    if (await verifyBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await verifyBtn.click();
      await sleep(1200);
    }
  }

  // If PIN setup (new user) or PIN entry appears:
  const activePinInput = page.locator('input[type="password"], input[maxlength="1"]').first();
  const digitInputs = page.locator('input[maxlength="1"]');
  const digitCount = await digitInputs.count();
  if (digitCount === 4) {
    console.log('   Entering 4-digit PIN: 1234...');
    for (let i = 0; i < 4; i++) {
      await digitInputs.nth(i).fill(String(i + 1));
    }
    await sleep(600);
    const confirmBtn = page.locator('button:has-text("Save PIN"), button:has-text("Sign In"), button:has-text("تأكيد"), button[type="submit"]').first();
    if (await confirmBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await confirmBtn.click();
      await sleep(1500);
    }
  } else if (await pinInput.isVisible({ timeout: 1500 }).catch(() => false)) {
    console.log('   Entering PIN: 1234...');
    await pinInput.fill('1234');
    await sleep(500);
    const submitPin = page.locator('button[type="submit"]').first();
    await submitPin.click();
    await sleep(1500);
  }
}

async function runSideBySideCockpit() {
  console.log('🚀 Launching 2 SEPARATE Visible Windows Side-by-Side (Zero Overlap)...');

  // Left Window: Patient (x=0, y=0, width=720, height=960)
  const browserPatient = await chromium.launch({
    headless: false,
    args: [
      '--window-position=0,0',
      '--window-size=720,960',
      '--remote-debugging-port=9222',
      '--disable-features=Translate',
      '--lang=en-US',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });
  const contextPatient = await browserPatient.newContext({
    viewport: { width: 710, height: 860 },
    permissions: ['camera', 'microphone'],
    locale: 'en-US',
  });
  const pagePatient = await contextPatient.newPage();

  // Right Window: Super Admin (x=720, y=0, width=720, height=960)
  const browserAdmin = await chromium.launch({
    headless: false,
    args: [
      '--window-position=720,0',
      '--window-size=720,960',
      '--remote-debugging-port=9223',
      '--disable-features=Translate',
      '--lang=en-US',
    ],
  });
  const contextAdmin = await browserAdmin.newContext({
    viewport: { width: 710, height: 860 },
    locale: 'en-US',
  });
  const pageAdmin = await contextAdmin.newPage();

  console.log('   Navigating Patient (Left) and Super Admin (Right)...');
  await Promise.all([
    pagePatient.goto(`${LIVE_URL}?portal=patient`, { waitUntil: 'domcontentloaded' }),
    pageAdmin.goto(`${LIVE_URL}?portal=superadmin`, { waitUntil: 'domcontentloaded' }),
  ]);
  await sleep(1500);

  // Authenticate Super Admin on Right
  console.log('   Authenticating Super Admin on Right Half...');
  const adminPin = pageAdmin.locator('input[type="password"]').first();
  if (await adminPin.isVisible({ timeout: 4000 }).catch(() => false)) {
    await adminPin.fill('1234');
    const adminSubmit = pageAdmin.locator('button:has-text("Sign In as Super Admin"), button[type="submit"]').first();
    await adminSubmit.click();
    console.log('   ✅ Super Admin Logged In.');
    await sleep(1500);
  }

  // Handle Patient Authentication on Left
  console.log('   Preparing Patient on Left Half...');
  const startBtn = pagePatient.locator('button:has-text("Start Your Case"), button:has-text("ابدأ طلبك السريري")').first();
  if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('   Clicking "Start Your Case"...');
    await startBtn.click();
    await sleep(1200);
  }

  // Check if auth modal appeared
  await handleAuthModalIfPresent(pagePatient, '0501111111');

  // Select Video Modality (750 SAR)
  const videoCard = pagePatient.locator('button:has-text("Select Video Consultation"), button:has-text("Video"), button:has-text("استشارة مرئية")').first();
  if (await videoCard.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('   Selecting Video Consultation Modality (750 SAR)...');
    await videoCard.click();
    await sleep(800);
  }

  const compIntakeBtn = pagePatient.locator('button:has-text("Start Comprehensive Intake")').first();
  if (await compIntakeBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
    console.log('   Clicking "Start Comprehensive Intake →"...');
    await compIntakeBtn.click();
    await sleep(1500);
  }

  // Type symptoms if textarea visible
  const textarea = pagePatient.locator('textarea').first();
  if (await textarea.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('   Typing clinical symptoms at human speed (80-120ms/key)...');
    await textarea.click();
    await textarea.fill('');
    await humanType(
      textarea,
      'Severe chronic lumbar spine pain radiating down to right leg with persistent numbness. Walking limited to 150m.',
      70,
      110
    );
    await sleep(1000);

    const submitBtn = pagePatient.locator('button:has-text("Submit case to ALO nurse"), button:has-text("إرسال الملف إلى تمريض الفرز"), button:has-text("P14")').first();
    if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('   Clicking "Submit case to ALO nurse"...');
      await submitBtn.click();
      await sleep(2500);
      console.log('   ✅ Case submitted live to Nurse queue!');
    }
  }

  console.log('🎉 CENTER MAC SETUP COMPLETE: Patient (Left) and Super Admin (Right) side-by-side.');
  await new Promise(() => {});
}

runSideBySideCockpit().catch(console.error);
