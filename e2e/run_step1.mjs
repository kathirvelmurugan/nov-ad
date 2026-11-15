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

async function runStep1() {
  console.log('🚀 Executing Step 1: Patient Clinical Intake Submission...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  let pagePatient;
  for (const c of browser.contexts()) {
    for (const p of c.pages()) {
      if (p.url().includes('portal=patient')) pagePatient = p;
    }
  }

  if (!pagePatient) {
    throw new Error('Patient page not found on Center Mac');
  }

  console.log(`   Page URL: ${pagePatient.url()}`);
  await pagePatient.bringToFront();

  // 1. Click "Start Your Case"
  const startBtn = pagePatient.locator('button:has-text("Start Your Case"), button:has-text("ابدأ طلبك السريري")').first();
  if (await startBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('   Clicking "Start Your Case" button...');
    await startBtn.click();
    await sleep(1500);
  }

  // 2. Select Video Consultation (750 SAR)
  const videoModalityCard = pagePatient.locator('button:has-text("Select Video Consultation"), button:has-text("Video"), button:has-text("استشارة مرئية")').first();
  if (await videoModalityCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('   Selecting Video Consultation Modality (750 SAR)...');
    await videoModalityCard.click();
    await sleep(800);
  }

  // 2B. Click "Start Comprehensive Intake →"
  const intakeBtn = pagePatient.locator('button:has-text("Start Comprehensive Intake"), button:has-text("ابدأ طلبك السريري")').first();
  if (await intakeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('   Clicking "Start Comprehensive Intake →"...');
    await intakeBtn.click();
    await sleep(1500);
  }

  // 3. Fill in symptoms textarea with natural cadence
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
  }

  // 4. Click Submit Button
  const submitBtn = pagePatient.locator('button:has-text("Submit case to ALO nurse"), button:has-text("إرسال الملف إلى تمريض الفرز"), button:has-text("P14")').first();
  if (await submitBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('   Clicking "Submit case to ALO nurse" button...');
    await submitBtn.click();
    await sleep(2500);
    console.log('   ✅ Case successfully submitted by Patient!');
  }

  console.log('🎉 STEP 1 EXECUTION COMPLETE.');
  process.exit(0);
}

runStep1().catch((err) => {
  console.error('Error in Step 1:', err);
  process.exit(1);
});
