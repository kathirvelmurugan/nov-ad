import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import http from 'node:http';

const PORT = 4188;
const BASE_URL = `http://localhost:${PORT}/`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function humanType(locator, text, delayMs = 40) {
  await locator.focus();
  for (const char of text) {
    await locator.pressSequentially(char, { delay: delayMs });
  }
}

function waitForPort(port, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(`http://localhost:${port}/`, (res) => resolve());
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) reject(new Error(`Timeout on port ${port}`));
        else setTimeout(check, 300);
      });
    };
    check();
  });
}

async function loginAs(page, phoneDigits, pinDigits = '1234') {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(600);

  const phoneInput = page.locator('input[type="tel"]').first();
  const isPhoneOpen = await phoneInput.isVisible().catch(() => false);
  if (!isPhoneOpen) {
    const loginBtn = page.locator('button:has-text("Login"), button:has-text("تسجيل الدخول"), button:has-text("حساب المريض")').first();
    await loginBtn.waitFor({ state: 'visible', timeout: 10000 });
    await loginBtn.click();
    await sleep(500);
  }

  await phoneInput.waitFor({ state: 'visible', timeout: 10000 });
  await phoneInput.fill(phoneDigits);
  await sleep(300);

  const submitPhoneBtn = page.locator('form button[type="submit"], button:has-text("إرسال رمز التحقق")').first();
  await submitPhoneBtn.click();
  await sleep(800);

  const pinInputs = page.locator('input[type="password"]');
  await pinInputs.first().waitFor({ state: 'visible', timeout: 10000 });
  for (let i = 0; i < 4; i++) {
    await pinInputs.nth(i).fill(pinDigits[i] || '1');
  }
  await sleep(300);

  const submitPinBtn = page.locator('form button[type="submit"]').first();
  await submitPinBtn.click();
  await sleep(2000); // 2-second absorption pause
}

async function main() {
  console.log('========================================================================');
  console.log('🎬 ALO DOCTOR SIMPLIFIED CLINICAL DEMO (SMOOTH FLOW & 2S PAUSES)');
  console.log('========================================================================\n');

  console.log('Starting preview server on port ' + PORT + '...');
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'inherit',
    shell: true,
  });

  const cleanup = () => {
    try { server.kill(); } catch (e) {}
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(1); });

  await waitForPort(PORT);
  console.log('✓ App ready at ' + BASE_URL);

  console.log('\n🔴 START SCREEN RECORDING NOW (3-second buffer)...');
  for (let i = 3; i > 0; i--) {
    console.log(`   ⏳ Starting in ${i}...`);
    await sleep(1000);
  }
  console.log('\n🚀 DEMO ACTIVE!\n');

  // Launch standard, clean, spacious window
  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=1280,950', '--window-position=80,30', '--disable-infobars'],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 880 },
  });
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // STEP 1: PATIENT INTAKE
    // -------------------------------------------------------------
    console.log('▶ [Step 1] Patient Portal: Creating Consultation...');
    await loginAs(page, '+966500000099');
    await sleep(2000);

    const startBtn = page.locator('button:has-text("طلب استشارة جديدة"), button:has-text("New Consultation"), button:has-text("Start Your Case")').first();
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click();
      await sleep(2000);
    }

    const symptomsInput = page.locator('textarea').first();
    if (await symptomsInput.isVisible().catch(() => false)) {
      console.log('   Typing clinical symptoms (>50 chars)...');
      await humanType(symptomsInput, 'Patient experiences 4 weeks of severe shortness of breath, exertional fatigue, and chest discomfort. Requesting expert cardiology second opinion.');
      await sleep(2000);
    }

    const consentBox = page.locator('input[type="checkbox"]').first();
    if (await consentBox.isVisible().catch(() => false)) {
      if (!(await consentBox.isChecked())) {
        await consentBox.check();
        await sleep(2000);
      }
    }

    const submitIntake = page.locator('button:has-text("Submit case to ALO nurse"), button:has-text("إرسال الملف إلى تمريض الفرز")').first();
    if (await submitIntake.isVisible().catch(() => false)) {
      console.log('   Submitting intake to Nurse Triage...');
      await submitIntake.click();
      await sleep(3000);
    }

    // -------------------------------------------------------------
    // STEP 2: NURSE TRIAGE (N07)
    // -------------------------------------------------------------
    console.log('\n▶ [Step 2] Nurse Triage Queue: Reviewing & Routing...');
    await loginAs(page, '+966500000004');
    await sleep(2000);

    const firstCase = page.locator('[data-testid="nurse-triage-view"] table tbody tr, .card-clinical').first();
    if (await firstCase.isVisible().catch(() => false)) {
      await firstCase.click();
      await sleep(2000);
    }

    const triageText = page.locator('textarea').first();
    if (await triageText.isVisible().catch(() => false)) {
      console.log('   Typing N05 clinical triage notes (>50 chars)...');
      await triageText.fill('');
      await humanType(triageText, 'Confirmed severe calcified aortic stenosis. AVA 0.6cm2, mean gradient 48mmHg. NYHA Class III symptoms verified. Assigned to Dr. Fahad.');
      await sleep(2000);
    }

    const n07Button = page.locator('button:has-text("N07")').first();
    if (await n07Button.isVisible().catch(() => false)) {
      console.log('   Clicking N07 Approval...');
      await n07Button.click();
      await sleep(3000);
    }

    // -------------------------------------------------------------
    // STEP 3: SAUDI TREATING DOCTOR (D10)
    // -------------------------------------------------------------
    console.log('\n▶ [Step 3] Saudi Treating Doctor: Directives & Referral...');
    await loginAs(page, '+966500000005');
    await sleep(2000);

    const docCaseRow = page.locator('[data-testid="doctor-review-view"] table tbody tr, .card-clinical').first();
    if (await docCaseRow.isVisible().catch(() => false)) {
      await docCaseRow.click();
      await sleep(2000);
    }

    const focusInputs = page.locator('textarea');
    const fCount = await focusInputs.count();
    if (fCount >= 3) {
      console.log('   Formulating D07 focus questions (>50 chars each)...');
      await focusInputs.nth(0).fill('Is transcatheter aortic valve replacement favored over surgical SAVR given anatomical risk?');
      await sleep(1000);
      await focusInputs.nth(1).fill('What is the risk of high-degree AV block requiring permanent pacemaker implantation?');
      await sleep(1000);
      await focusInputs.nth(2).fill('Recommended post-procedure antithrombotic therapy protocol and monitoring timeline?');
      await sleep(2000);
    }

    const d10Btn = page.locator('button:has-text("D10")').first();
    if (await d10Btn.isVisible().catch(() => false)) {
      console.log('   Clicking D10 Referral Approval...');
      await d10Btn.click();
      await sleep(3000);
    }

    // -------------------------------------------------------------
    // STEP 4: INDIAN SUPER-SPECIALIST (K06)
    // -------------------------------------------------------------
    console.log('\n▶ [Step 4] Indian Consultant Mobile View: Synthesizing Opinion...');
    await loginAs(page, '+966500000006');
    await sleep(2000);

    const acceptCaseBtn = page.locator('button:has-text("قبول الحالة"), button:has-text("Accept Case")').first();
    if (await acceptCaseBtn.isVisible().catch(() => false)) {
      console.log('   Accepting case lock...');
      await acceptCaseBtn.click();
      await sleep(2000);
    }

    const cTextareas = page.locator('textarea');
    const cCount = await cTextareas.count();
    if (cCount >= 4) {
      console.log('   Entering focus answers and comprehensive second opinion (>50 chars)...');
      await cTextareas.nth(0).fill('Transfemoral TAVR is favored given peripheral access caliber and STS score of 4.8%.');
      await sleep(1000);
      await cTextareas.nth(1).fill('Low membranous septum depth suggests using balloon-expandable valve with high positioning.');
      await sleep(1000);
      await cTextareas.nth(2).fill('Dual antiplatelet therapy (Aspirin + Clopidogrel) for 3 months followed by single agent.');
      await sleep(1000);
      await cTextareas.nth(3).fill('Comprehensive Second Opinion: Multislice CTA confirms annular perimeter suitability. Transfemoral TAVR with a 26mm balloon-expandable valve provides optimal hemodynamics with low procedural risk.');
      await sleep(2000);
    }

    const submitK06 = page.locator('button:has-text("Submit written opinion"), button:has-text("K06")').first();
    if (await submitK06.isVisible().catch(() => false)) {
      console.log('   Submitting Second Opinion (K06)...');
      await submitK06.click();
      await sleep(3000);
    }

    // -------------------------------------------------------------
    // STEP 5: PATIENT SATISFACTION & CASE ARCHIVE
    // -------------------------------------------------------------
    console.log('\n▶ [Step 5] Patient Portal: Satisfaction & Completed Review...');
    await loginAs(page, '+966500000099');
    await sleep(2500);

    console.log('\n🎉 DEMO WALKTHROUGH COMPLETE!');
    await sleep(3000);

  } catch (err) {
    console.error('Demo step notice:', err.message);
  } finally {
    await browser.close().catch(() => {});
    cleanup();
    console.log('Done! Screen recording ready.');
    process.exit(0);
  }
}

main();
