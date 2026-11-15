import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import http from 'node:http';

// Screen Dimensions (defaults to 1920x1080 or scales to standard 1440x900)
const SCREEN_WIDTH = parseInt(process.env.SCREEN_WIDTH || '1920', 10);
const SCREEN_HEIGHT = parseInt(process.env.SCREEN_HEIGHT || '1080', 10);

const HERO_WIDTH = Math.floor(SCREEN_WIDTH * 0.5); // Exact 50% width
const OBSERVER_WIDTH = SCREEN_WIDTH - HERO_WIDTH;  // Remaining 50% width
const OBSERVER_HEIGHT = Math.floor(SCREEN_HEIGHT * 0.5); // 2 stacked observers

const PORT = 4185;
const BASE_URL = `http://localhost:${PORT}/`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function humanType(locator, text, delayMs = 60) {
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
        if (Date.now() - start > timeoutMs) reject(new Error(`Timeout waiting for port ${port}`));
        else setTimeout(check, 300);
      });
    };
    check();
  });
}

async function loginUser(page, phoneDigits, pinDigits = '1234') {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await sleep(400);

  const phoneInput = page.locator('input[type="tel"]').first();
  if (!(await phoneInput.isVisible().catch(() => false))) {
    const loginBtn = page.locator('button:has-text("Login"), button:has-text("تسجيل الدخول"), button:has-text("حساب المريض")').first();
    if (await loginBtn.isVisible().catch(() => false)) {
      await loginBtn.click();
      await sleep(300);
    }
  }

  await phoneInput.waitFor({ state: 'visible', timeout: 8000 });
  await phoneInput.fill(phoneDigits);
  await sleep(200);

  const submitPhoneBtn = page.locator('form button[type="submit"]').first();
  await submitPhoneBtn.click();
  await sleep(600);

  const pinInputs = page.locator('input[type="password"]');
  await pinInputs.first().waitFor({ state: 'visible', timeout: 8000 });
  for (let i = 0; i < 4; i++) {
    await pinInputs.nth(i).fill(pinDigits[i] || '1');
  }
  await sleep(200);

  const submitPinBtn = page.locator('form button[type="submit"]').first();
  await submitPinBtn.click();
  await sleep(1000);
}

async function main() {
  console.log('========================================================================');
  console.log('🎬 ALO DOCTOR MULTI-PERSONA SPLIT-SCREEN DEMO ORCHESTRATOR');
  console.log(`📐 Screen Layout: 50% Left Hero (${HERO_WIDTH}x${SCREEN_HEIGHT}) | 50% Right Stack (${OBSERVER_WIDTH}x${OBSERVER_HEIGHT} x2)`);
  console.log('========================================================================\n');

  console.log('Starting local server preview on port ' + PORT + '...');
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
  console.log('✓ Server ready at ' + BASE_URL);

  // 5-second countdown for user to start screen recording
  console.log('\n🔴 [ATTENTION] START YOUR SCREEN RECORDER NOW!');
  for (let i = 5; i > 0; i--) {
    console.log(`   ⏳ Recording starts in ${i} seconds...`);
    await sleep(1000);
  }
  console.log('\n🚀 DEMO RUNNER ACTIVE — RECORDING IN PROGRESS!\n');

  // 1. Launch HERO WINDOW (Left 50%)
  const heroBrowser = await chromium.launch({
    headless: false,
    args: [
      `--window-position=0,0`,
      `--window-size=${HERO_WIDTH},${SCREEN_HEIGHT}`,
      '--disable-infobars',
    ],
  });
  const heroContext = await heroBrowser.newContext({
    viewport: { width: HERO_WIDTH, height: SCREEN_HEIGHT - 80 },
  });
  const heroPage = await heroContext.newPage();

  // 2. Launch OBSERVER 1 (Top Right 50%)
  const obs1Browser = await chromium.launch({
    headless: false,
    args: [
      `--window-position=${HERO_WIDTH},0`,
      `--window-size=${OBSERVER_WIDTH},${OBSERVER_HEIGHT}`,
      '--disable-infobars',
    ],
  });
  const obs1Context = await obs1Browser.newContext({
    viewport: { width: OBSERVER_WIDTH, height: OBSERVER_HEIGHT - 60 },
  });
  const obs1Page = await obs1Context.newPage();

  // 3. Launch OBSERVER 2 (Bottom Right 50%)
  const obs2Browser = await chromium.launch({
    headless: false,
    args: [
      `--window-position=${HERO_WIDTH},${OBSERVER_HEIGHT}`,
      `--window-size=${OBSERVER_WIDTH},${OBSERVER_HEIGHT}`,
      '--disable-infobars',
    ],
  });
  const obs2Context = await obs2Browser.newContext({
    viewport: { width: OBSERVER_WIDTH, height: OBSERVER_HEIGHT - 60 },
  });
  const obs2Page = await obs2Context.newPage();

  try {
    // -------------------------------------------------------------------
    // SCENE 1: SETUP OBSERVERS & PATIENT INTAKE (HERO = PATIENT)
    // -------------------------------------------------------------------
    console.log('▶ [Scene 1] Initializing Nurse Triage and Doctor in Observers...');
    await loginUser(obs1Page, '+966500000004'); // Nurse Sara in Top-Right
    await loginUser(obs2Page, '+966500000005'); // Doctor Fahad in Bottom-Right
    await sleep(1000);

    console.log('▶ [Scene 1] HERO: Patient Intake (Left 50%)...');
    await loginUser(heroPage, '+966500000099'); // Patient Sami in Left Hero (50%)
    await sleep(1500);

    // Patient fills intake details
    const intakeBtn = heroPage.locator('button:has-text("طلب استشارة ثانية"), button:has-text("New Consultation")').first();
    if (await intakeBtn.isVisible().catch(() => false)) {
      await intakeBtn.click();
      await sleep(1000);
    }

    console.log('   Typing clinical symptoms & checking privacy policy...');
    const diagnosisInput = heroPage.locator('input[placeholder*="التشخيص"], textarea[placeholder*="التشخيص"]').first();
    if (await diagnosisInput.isVisible().catch(() => false)) {
      await humanType(diagnosisInput, 'Severe Aortic Stenosis with exertional syncope and shortness of breath.');
      await sleep(800);
    }

    const consentCheck = heroPage.locator('input[type="checkbox"]').first();
    if (await consentCheck.isVisible().catch(() => false)) {
      await consentCheck.check();
      await sleep(800);
    }

    // Submit Intake
    const submitIntake = heroPage.locator('button[type="submit"], button:has-text("إرسال طلب الاستشارة")').first();
    if (await submitIntake.isVisible().catch(() => false)) {
      await submitIntake.click();
      console.log('   ✓ Consultation submitted! Notice Nurse Queue updating on the right stack.');
      await sleep(2500);
    }

    // -------------------------------------------------------------------
    // SCENE 2: HERO SWITCHES TO NURSE TRIAGE (N05 -> N06 -> N07)
    // -------------------------------------------------------------------
    console.log('\n▶ [Scene 2] HERO: Nurse Triage takes the 50% Spotlight (Left)...');
    await heroPage.goto(BASE_URL);
    await loginUser(heroPage, '+966500000004'); // Nurse takes Left Hero
    await sleep(1500);

    const activeTriageCase = heroPage.locator('[data-testid="nurse-triage-view"] table tbody tr, .card-clinical').first();
    if (await activeTriageCase.isVisible().catch(() => false)) {
      await activeTriageCase.click();
      await sleep(1000);
    }

    console.log('   Typing N05 clinical triage notes (>= 20 chars)...');
    const triageNotes = heroPage.locator('textarea').first();
    if (await triageNotes.isVisible().catch(() => false)) {
      await triageNotes.fill('');
      await humanType(triageNotes, 'Echo confirms severe calcific valve with AVA 0.6cm2. Patient is symptomatic NYHA Class III. Routing to Dr. Fahad.');
      await sleep(1000);
    }

    // Click N07 Approve & Route
    const n07Btn = heroPage.locator('button:has-text("N07")').first();
    if (await n07Btn.isVisible().catch(() => false) && !(await n07Btn.isDisabled())) {
      console.log('   Clicking N07 to route case to Saudi Treating Doctor...');
      await n07Btn.click();
      await sleep(2500);
      console.log('   ✓ Case forwarded! Doctor inbox on Bottom-Right now has the case.');
    }

    // -------------------------------------------------------------------
    // SCENE 3: HERO SWITCHES TO SAUDI DOCTOR COCKPIT (D07 -> D10)
    // -------------------------------------------------------------------
    console.log('\n▶ [Scene 3] HERO: Saudi Treating Doctor Review takes 50% Spotlight (Left)...');
    await heroPage.goto(BASE_URL);
    await loginUser(heroPage, '+966500000005'); // Doctor Fahad on Left Hero
    await sleep(1500);

    const docCase = heroPage.locator('[data-testid="doctor-review-view"] table tbody tr, .card-clinical').first();
    if (await docCase.isVisible().catch(() => false)) {
      await docCase.click();
      await sleep(1000);
    }

    console.log('   Doctor formulating 3 Mandatory Directive Questions (D07)...');
    const focusInputs = heroPage.locator('textarea');
    const inputCount = await focusInputs.count();
    if (inputCount >= 3) {
      await focusInputs.nth(0).fill('Is transcatheter aortic valve replacement (TAVR) anatomically favorable over SAVR?');
      await sleep(600);
      await focusInputs.nth(1).fill('What is the risk of conduction block requiring permanent pacemaker implantation?');
      await sleep(600);
      await focusInputs.nth(2).fill('Recommended post-procedure antithrombotic therapy duration and monitoring regimen?');
      await sleep(1000);
    }

    const d10Btn = heroPage.locator('button:has-text("D10")').first();
    if (await d10Btn.isVisible().catch(() => false) && !(await d10Btn.isDisabled())) {
      console.log('   Clicking D10 Referral Approval...');
      await d10Btn.click();
      await sleep(2500);
      console.log('   ✓ Referral Approved! Routed to Care Coordinator.');
    }

    // -------------------------------------------------------------------
    // SCENE 4: HERO SWITCHES TO INTERNATIONAL CONSULTANT (K06)
    // -------------------------------------------------------------------
    console.log('\n▶ [Scene 4] HERO: International Consultant Mobile View (Left 50%)...');
    await heroPage.goto(BASE_URL);
    await loginUser(heroPage, '+966500000006'); // Consultant Dr. V. Prasanth
    await sleep(1500);

    console.log('   Consultant accepts case and synthesizes comprehensive second opinion...');
    const acceptBtn = heroPage.locator('button:has-text("قبول الحالة"), button:has-text("Accept Case")').first();
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
      await sleep(1000);
    }

    // Fill answers and opinion
    const consultantTextareas = heroPage.locator('textarea');
    const cCount = await consultantTextareas.count();
    if (cCount >= 4) {
      await consultantTextareas.nth(0).fill('TAVR is favored via transfemoral approach given STS score of 4.8% and peripheral caliber.');
      await sleep(500);
      await consultantTextareas.nth(1).fill('Low membranous septum length warrants balloon-expandable valve with high implantation technique.');
      await sleep(500);
      await consultantTextareas.nth(2).fill('Recommend Aspirin 81mg daily plus Clopidogrel 75mg daily for 3 months, then Aspirin monotherapy.');
      await sleep(500);
      await consultantTextareas.nth(3).fill('Comprehensive synthesis: The multi-slice CT confirms annular perimeter suitability. TAVR offers favorable hemodynamics with low periprocedural complication risk under experienced Heart Team.');
      await sleep(1000);
    }

    const submitOpinionBtn = heroPage.locator('button:has-text("Submit written opinion"), button:has-text("K06")').first();
    if (await submitOpinionBtn.isVisible().catch(() => false) && !(await submitOpinionBtn.isDisabled())) {
      console.log('   Submitting International Second Opinion...');
      await submitOpinionBtn.click();
      await sleep(2500);
      console.log('   ✓ Second Opinion submitted! Transitioned to OPINION_READY.');
    }

    // Final Pause for visual capture
    console.log('\n🎬 [DEMO COMPLETE] Pausing 5 seconds for final visual framing...');
    await sleep(5000);

  } catch (err) {
    console.error('Demo walkthrough encounter:', err.message);
  } finally {
    console.log('Closing demo windows...');
    await heroBrowser.close().catch(() => {});
    await obs1Browser.close().catch(() => {});
    await obs2Browser.close().catch(() => {});
    cleanup();
    console.log('🎉 DEMO RUN FINISHED! You can now stop your screen recorder.');
    process.exit(0);
  }
}

main();
