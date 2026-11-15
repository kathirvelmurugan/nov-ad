import { chromium } from 'playwright';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function humanType(locator, text, minDelay = 70, maxDelay = 110) {
  await locator.click();
  for (const char of text) {
    await locator.pressSequentially(char);
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    await sleep(delay);
  }
}

async function executeStep1() {
  console.log('🔗 Connecting to Center Mac via CDP (port 9222)...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  const pages = contexts[0].pages();
  
  // Find Patient page
  let pagePatient = pages.find((p) => p.url().includes('portal=patient'));
  if (!pagePatient) pagePatient = pages[0];

  console.log(`📍 Found Patient Page at ${pagePatient.url()}`);

  // Step 1A: If start button is visible, click it
  const startBtn = pagePatient.locator('button:has-text("ابدأ طلبك السريري"), button:has-text("Start Clinical Request"), button:has-text("New Consultation")').first();
  if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('   Clicking Start Clinical Request button...');
    await startBtn.click();
    await sleep(1200);
  }

  // Step 1B: Select Video Consultation Modality (750 SAR)
  const videoCard = pagePatient.locator('button:has-text("Video"), button:has-text("استشارة مرئية"), button:has-text("مرئي + رأي مكتوب")').first();
  if (await videoCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('   Selecting Video Consultation Modality (750 SAR)...');
    await videoCard.click();
    await sleep(800);
  }

  // Step 1C: Enter Clinical Symptoms & Chief Complaint
  const symptomsArea = pagePatient.locator('textarea').first();
  if (await symptomsArea.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('   Typing symptoms with natural human typing speed (80-120ms/key)...');
    await symptomsArea.fill('');
    await humanType(
      symptomsArea,
      'Severe chronic lumbar spine pain radiating down to right leg with persistent numbness. Walking limited to 150m.',
      70,
      110
    );
    await sleep(1000);
  }

  // Step 1D: Click P14 Submit Button
  const submitBtn = pagePatient.locator('button:has-text("Submit case to ALO nurse"), button:has-text("إرسال الملف إلى تمريض الفرز"), button:has-text("P14")').first();
  if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('   Submitting case to ALO Nurse triage queue...');
    await submitBtn.click();
    await sleep(2500);
  } else {
    // Fallback search for any submit button
    const anySubmit = pagePatient.locator('button[type="submit"], button:has-text("Submit"), button:has-text("إرسال")').first();
    if (await anySubmit.isVisible({ timeout: 2000 }).catch(() => false)) {
      await anySubmit.click();
      await sleep(2000);
    }
  }

  console.log('✅ STEP 1 COMPLETE: Patient case submitted live on Screen 3.');
  process.exit(0);
}

executeStep1().catch((err) => {
  console.error('Error in Step 1:', err);
  process.exit(1);
});
