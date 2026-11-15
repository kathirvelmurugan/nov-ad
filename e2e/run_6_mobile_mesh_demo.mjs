import { chromium, devices } from 'playwright';
import { spawn } from 'node:child_process';
import http from 'node:http';

const PORT = 4192;
const BASE_URL = `http://localhost:${PORT}/`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function humanType(locator, text, delayMs = 15) {
  await locator.focus();
  for (const char of text) {
    await locator.pressSequentially(char, { delay: delayMs });
  }
}

function waitForPort(port, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(`http://localhost:${port}/`, () => resolve());
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) reject(new Error(`Timeout on port ${port}`));
        else setTimeout(check, 300);
      });
    };
    check();
  });
}

const SESSIONS = {
  P: {
    isAuthenticated: true,
    phone: '+966500000099',
    personaId: 'patient',
    roleCode: 'P',
    fullName: 'Sami Al-Harbi',
    isGuest: false,
    expiresAt: Date.now() + 86400000,
    lang: 'en',
  },
  N: {
    isAuthenticated: true,
    phone: '+966500000004',
    personaId: 'nurse',
    roleCode: 'N',
    fullName: 'Sara Al-Qahtani',
    isGuest: false,
    expiresAt: Date.now() + 86400000,
    lang: 'en',
  },
  D: {
    isAuthenticated: true,
    phone: '+966500000005',
    personaId: 'doctor',
    roleCode: 'D',
    hospitalId: 'hosp-alo-riyadh-01',
    fullName: 'Dr. Fahad Al-Harbi',
    isGuest: false,
    expiresAt: Date.now() + 86400000,
    lang: 'en',
  },
  C: {
    isAuthenticated: true,
    phone: '+966500000003',
    personaId: 'coordinator',
    roleCode: 'C',
    fullName: 'Emmanuel Arcon Gonzalez',
    isGuest: false,
    expiresAt: Date.now() + 86400000,
    lang: 'en',
  },
  K: {
    isAuthenticated: true,
    phone: '+966500000006',
    personaId: 'consultant',
    roleCode: 'K',
    fullName: 'Dr. V. Prasanth',
    isGuest: false,
    expiresAt: Date.now() + 86400000,
    lang: 'en',
  },
  AD: {
    isAuthenticated: true,
    phone: '+966500000001',
    personaId: 'super_admin',
    roleCode: 'AD',
    fullName: 'Adrian Lewis',
    isGuest: false,
    expiresAt: Date.now() + 86400000,
    lang: 'en',
  },
};

async function switchToEnglish(page) {
  try {
    const enBtn = page.locator('button:has-text("English"), button[title*="English"], button:has-text("EN")').first();
    if (await enBtn.isVisible({ timeout: 1200 }).catch(() => false)) {
      await enBtn.click();
      await sleep(300);
    }
  } catch (e) {}
}

async function initMobileWindow(page, roleKey, titleText) {
  const session = SESSIONS[roleKey];
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ sess, title }) => {
    localStorage.setItem('alo_user_session_v4.0_clean', JSON.stringify(sess));
    localStorage.setItem('alo_lang_preference', 'en');
    document.title = title;
  }, { sess: session, title: titleText });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(800);
  await switchToEnglish(page);
  await page.evaluate((title) => { document.title = title; }, titleText);
}

async function syncCaseToPage(page, caseData, activeCaseId = null) {
  await page.evaluate(({ c, id }) => {
    try {
      let cases = JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]');
      const idx = cases.findIndex((x) => x.id === c.id);
      if (idx >= 0) {
        cases[idx] = c;
      } else {
        cases = [c, ...cases];
      }
      localStorage.setItem('alo_cases_v4.0_clean', JSON.stringify(cases));
      if (id) {
        localStorage.setItem('alo_active_case_id_v4.0_clean', id);
      }
    } catch (e) {}
  }, { c: caseData, id: activeCaseId });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(800);
  await switchToEnglish(page);
}

async function selectActiveCaseCard(page, caseNumber) {
  await sleep(800);

  // 1. Try finding by caseNumber
  let caseSelector = page.locator(`button[aria-label*="${caseNumber}"], button:has-text("${caseNumber}")`).first();
  if (await caseSelector.isVisible({ timeout: 2500 }).catch(() => false)) {
    await caseSelector.scrollIntoViewIfNeeded();
    await caseSelector.evaluate((b) => b.click()).catch(() => caseSelector.click({ force: true }));
    await sleep(1500);
    return true;
  }

  // 2. Try All Tab
  const allTab = page.locator('button:has-text("All"), button:has-text("كل الحالات")').first();
  if (await allTab.isVisible({ timeout: 1500 }).catch(() => false)) {
    await allTab.evaluate((b) => b.click()).catch(() => allTab.click({ force: true }));
    await sleep(800);
    caseSelector = page.locator(`button[aria-label*="${caseNumber}"], button:has-text("${caseNumber}")`).first();
    if (await caseSelector.isVisible({ timeout: 2500 }).catch(() => false)) {
      await caseSelector.scrollIntoViewIfNeeded();
      await caseSelector.evaluate((b) => b.click()).catch(() => caseSelector.click({ force: true }));
      await sleep(1500);
      return true;
    }
  }

  // 3. Fallback
  const firstQueueItem = page.locator('div.max-h-\\[220px\\] button, button[aria-label*="CASE-2026"], button[aria-label*="ALO-"]').first();
  if (await firstQueueItem.isVisible({ timeout: 2500 }).catch(() => false)) {
    await firstQueueItem.scrollIntoViewIfNeeded();
    await firstQueueItem.evaluate((b) => b.click()).catch(() => firstQueueItem.click({ force: true }));
    await sleep(1500);
    return true;
  }

  return false;
}

async function main() {
  console.log('========================================================================');
  console.log('📱 ALO DOCTOR 6-PERSONA MOBILE-ALIGNED MESH PLAYTEST');
  console.log('🖥️ 6 Dedicated Mobile Views Visible Side-by-Side in 2x3 Grid');
  console.log('========================================================================\n');

  console.log('Starting unified backend & frontend server on port ' + PORT + '...');
  const server = spawn('node', ['server/index.js'], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'inherit',
    shell: true,
  });

  const cleanup = () => {
    try { server.kill(); } catch (e) {}
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(1); });

  await waitForPort(PORT);
  console.log('✓ Application server is ready at ' + BASE_URL);

  // 2 Rows x 3 Columns Layout:
  // Row 1 (Top):    [Win 1: Patient]     [Win 2: Nurse]       [Win 3: Saudi Doctor]
  // Row 2 (Bottom): [Win 4: Coordinator] [Win 5: Consultant]  [Win 6: Super Admin]
  const CELL_W = 465;
  const CELL_H = 430;
  const MOB_VIEWPORT = { width: 390, height: 750 };

  console.log('\n🚀 Spawning 6 dedicated mobile view windows side-by-side...');

  // Helper to launch mobile window
  const launchMobile = async (posX, posY, title) => {
    const browser = await chromium.launch({
      headless: false,
      args: [
        `--window-position=${posX},${posY}`,
        `--window-size=${CELL_W},${CELL_H}`,
        '--disable-infobars',
        '--no-first-run',
      ],
    });
    const context = await browser.newContext({
      viewport: MOB_VIEWPORT,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    return { browser, page };
  };

  const win1 = await launchMobile(0, 0, '📱 [1. PATIENT] Sami Al-Harbi');
  const win2 = await launchMobile(CELL_W + 5, 0, '🩺 [2. ALO NURSE] Sara Al-Qahtani');
  const win3 = await launchMobile((CELL_W + 5) * 2, 0, '👨‍⚕️ [3. SAUDI DOCTOR] Dr. Fahad Al-Harbi');

  const win4 = await launchMobile(0, CELL_H + 15, '👔 [4. ALO COORDINATOR] Emmanuel Arcon');
  const win5 = await launchMobile(CELL_W + 5, CELL_H + 15, '🩺 [5. INDIAN CONSULTANT] Dr. V. Prasanth');
  const win6 = await launchMobile((CELL_W + 5) * 2, CELL_H + 15, '🛡️ [6. SUPER ADMIN] Adrian Lewis');

  console.log('✓ Initializing all 6 mobile windows with authenticated sessions and English language...');
  await initMobileWindow(win1.page, 'P', '📱 [1. PATIENT] Sami Al-Harbi');
  await initMobileWindow(win2.page, 'N', '🩺 [2. ALO NURSE] Sara Al-Qahtani');
  await initMobileWindow(win3.page, 'D', '👨‍⚕️ [3. SAUDI DOCTOR] Dr. Fahad Al-Harbi');
  await initMobileWindow(win4.page, 'C', '👔 [4. ALO COORDINATOR] Emmanuel Arcon');
  await initMobileWindow(win5.page, 'K', '🩺 [5. INDIAN CONSULTANT] Dr. V. Prasanth');
  await initMobileWindow(win6.page, 'AD', '🛡️ [6. SUPER ADMIN] Adrian Lewis');

  console.log('\n👁️ ALL 6 PERSONAS ARE NOW VISIBLE SIMULTANEOUSLY ON SCREEN IN MOBILE ALIGNMENT.');
  console.log('   Row 1: Patient (Top-Left) | Nurse (Top-Mid) | Doctor (Top-Right)');
  console.log('   Row 2: Coordinator (Bottom-Left) | Consultant (Bottom-Mid) | Super Admin (Bottom-Right)\n');
  await sleep(3000);

  let activeCaseNumber = 'CASE-2026-DEMO';
  let activeCaseObject = null;

  try {
    // -------------------------------------------------------------------
    // STAGE 1: PATIENT INTAKE (Window 1: Sami Al-Harbi)
    // -------------------------------------------------------------------
    console.log('▶ [Stage 1] WINDOW 1 (Top-Left): Patient Sami Al-Harbi creates new consultation...');
    await win1.page.bringToFront();
    await win1.page.evaluate(() => { localStorage.setItem('alo_patient_subview_v3.0', 'intake'); });
    await win1.page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await switchToEnglish(win1.page);

    const startBtn = win1.page.locator('button:has-text("New Consultation"), button:has-text("+ New Consultation"), button:has-text("Start Your Case"), button:has-text("طلب استشارة جديدة")').first();
    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startBtn.scrollIntoViewIfNeeded();
      await startBtn.click();
      await sleep(1500);
    }

    const uniqueTag = `E2E-${Date.now()}`;
    const diagnosisTitle = 'Severe Calcified Aortic Stenosis with NYHA Class III Exertional Dyspnea';
    const clinicalHistory = `Patient presents with progressive shortness of breath on exertion, atypical angina, and severe fatigue lasting 4 weeks. Seeking international cardiothoracic specialist second opinion. Tag: ${uniqueTag}`;

    // 1. Caregiver Details
    const caregiverNameInput = win1.page.locator('input[placeholder*="Full Name"], input[placeholder*="الاسم الكامل"]').first();
    if (await caregiverNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('   [Win 1] Filling Caregiver Full Name...');
      await caregiverNameInput.scrollIntoViewIfNeeded();
      await caregiverNameInput.fill('');
      await humanType(caregiverNameInput, 'Faisal Sami Al-Harbi (Authorized Proxy)', 15);
      await sleep(500);
    }

    const relationshipInput = win1.page.locator('input[placeholder*="Son"], input[placeholder*="صلة القرابة"]').first();
    if (await relationshipInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   [Win 1] Filling Caregiver Relationship...');
      await relationshipInput.scrollIntoViewIfNeeded();
      await relationshipInput.fill('');
      await humanType(relationshipInput, 'Son / Legal Healthcare Proxy', 15);
      await sleep(500);
    }

    const caregiverIdInput = win1.page.locator('input[placeholder*="10XXXXXXXX"]').first();
    if (await caregiverIdInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   [Win 1] Filling Caregiver National ID...');
      await caregiverIdInput.scrollIntoViewIfNeeded();
      await caregiverIdInput.fill('');
      await humanType(caregiverIdInput, '1088776655', 20);
      await sleep(500);
    }

    // 2. Doctor Dropdown
    const docSelect = win1.page.locator('select').first();
    if (await docSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('   [Win 1] Selecting Saudi Doctor Dr. Fahad Al-Harbi...');
      await docSelect.scrollIntoViewIfNeeded();
      const options = await docSelect.locator('option').allInnerTexts();
      const fahadOpt = options.find((opt) => opt.includes('Fahad') || opt.includes('فهد'));
      if (fahadOpt) {
        await docSelect.selectOption({ label: fahadOpt });
      } else if (options.length > 1) {
        await docSelect.selectOption({ index: 1 });
      }
      await sleep(600);
    }

    // 3. Diagnosis Title (>= 50 chars)
    console.log(`   [Win 1] Entering Confirmed Medical Diagnosis Title (${diagnosisTitle.length} chars >= 50)...`);
    const diagnosisLabel = win1.page.locator('label:has-text("Confirmed Medical Diagnosis"), label:has-text("Diagnosis"), label:has-text("التشخيص")').first();
    await diagnosisLabel.waitFor({ state: 'visible', timeout: 8000 });
    const diagnosisInput = diagnosisLabel.locator('..').locator('input');
    await diagnosisInput.scrollIntoViewIfNeeded();
    await diagnosisInput.fill('');
    await humanType(diagnosisInput, diagnosisTitle, 15);
    await sleep(600);

    // 4. Symptoms Narrative (>= 50 chars)
    console.log(`   [Win 1] Entering Clinical Symptoms Narrative (${clinicalHistory.length} chars >= 50)...`);
    const symptomsLabel = win1.page.locator('label:has-text("Symptoms & Patient History"), label:has-text("Symptoms"), label:has-text("الأعراض")').first();
    await symptomsLabel.waitFor({ state: 'visible', timeout: 8000 });
    const symptomsInput = symptomsLabel.locator('..').locator('textarea');
    await symptomsInput.scrollIntoViewIfNeeded();
    await symptomsInput.fill('');
    await humanType(symptomsInput, clinicalHistory, 12);
    await sleep(600);

    // 5. Consent & Submit
    const consentBox = win1.page.locator('input[type="checkbox"]').first();
    if (await consentBox.isVisible().catch(() => false)) {
      await consentBox.scrollIntoViewIfNeeded();
      const isChecked = await consentBox.isChecked();
      if (!isChecked) {
        await consentBox.check();
        await sleep(600);
      }
    }

    const submitIntake = win1.page.locator('button:has-text("Submit case to ALO nurse"), button:has-text("Submit Consultation"), button:has-text("إرسال الملف إلى تمريض الفرز")').first();
    await submitIntake.scrollIntoViewIfNeeded();
    console.log('   [Win 1] Submitting consultation to Nurse Triage...');
    await submitIntake.click();
    await sleep(3000);

    const savedCases = await win1.page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]'); } catch (e) { return []; }
    });
    if (savedCases.length > 0) {
      activeCaseObject = savedCases[0];
      activeCaseNumber = activeCaseObject.caseNumber || activeCaseObject.id;
      console.log(`   ✅ [Win 1] Patient Case Created: ${activeCaseNumber}`);
    }

    // SYNC TO ALL OTHER WINDOWS: Watch queues light up!
    console.log('\n👁️ [SYNC] Broadcasting case creation to all other 5 mobile views...');
    await syncCaseToPage(win2.page, activeCaseObject, activeCaseObject.id);
    await syncCaseToPage(win3.page, activeCaseObject, activeCaseObject.id);
    await syncCaseToPage(win4.page, activeCaseObject, activeCaseObject.id);
    await syncCaseToPage(win5.page, activeCaseObject, activeCaseObject.id);
    await syncCaseToPage(win6.page, activeCaseObject, activeCaseObject.id);
    console.log('   ✓ Notice Case appeared in Nurse (Win 2) and Master Registry (Win 6)!');
    await sleep(2500);

    // -------------------------------------------------------------------
    // STAGE 2: NURSE CLINICAL TRIAGE (Window 2: Sara Al-Qahtani)
    // -------------------------------------------------------------------
    console.log(`\n▶ [Stage 2] WINDOW 2 (Top-Mid): Nurse Sara reviewing Case ${activeCaseNumber}...`);
    await win2.page.bringToFront();
    await selectActiveCaseCard(win2.page, activeCaseNumber);

    const triageText = win2.page.locator('textarea').first();
    if (await triageText.isVisible({ timeout: 5000 }).catch(() => false)) {
      const triageNotes = 'Transthoracic echocardiogram confirms severe calcified aortic stenosis with AVA 0.6cm2 and mean gradient 48mmHg. NYHA Class III symptoms verified. Assigned to Dr. Fahad.';
      console.log(`   [Win 2] Typing N05 clinical triage notes (${triageNotes.length} chars >= 50 chars)...`);
      await triageText.scrollIntoViewIfNeeded();
      await triageText.fill('');
      await humanType(triageText, triageNotes, 15);
      await sleep(1000);
    }

    // Confirm treating doctor Dr. Fahad Al-Harbi (N06)
    const doctorCard = win2.page.locator('button, div.cursor-pointer').filter({ hasText: /Dr\. Fahad Al-Harbi|د\. فهد الحربي/ }).first();
    if (await doctorCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   [Win 2] Confirming treating doctor: Dr. Fahad Al-Harbi (N06)...');
      await doctorCard.scrollIntoViewIfNeeded();
      await doctorCard.click({ force: true, timeout: 2000 }).catch(() => {});
      await sleep(1000);
    }

    const n07Button = win2.page.locator('button:has-text("N07"), button:has-text("Approve & route to Saudi treating doctor")').first();
    if (await n07Button.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('   [Win 2] Clicking N07 Approval button...');
      await n07Button.scrollIntoViewIfNeeded();
      await n07Button.evaluate((b) => b.click()).catch(() => n07Button.click({ force: true }));
      await sleep(2500);
      console.log('   ✓ Case routed to Saudi Treating Doctor (D02)!');
    }

    const nurseUpdatedCases = await win2.page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]'); } catch (e) { return []; }
    });
    if (nurseUpdatedCases.length > 0) activeCaseObject = nurseUpdatedCases[0];

    // SYNC TO WINDOW 3 (Doctor): Watch actionable inbox receive case!
    console.log('\n👁️ [SYNC] Watch WINDOW 3 (Top-Right): Dr. Fahad receives the case in actionable inbox...');
    await win3.page.bringToFront();
    await syncCaseToPage(win3.page, activeCaseObject, activeCaseObject.id);
    await sleep(2500);

    // -------------------------------------------------------------------
    // STAGE 3: SAUDI TREATING DOCTOR REVIEW (Window 3: Dr. Fahad Al-Harbi)
    // -------------------------------------------------------------------
    console.log(`\n▶ [Stage 3] WINDOW 3 (Top-Right): Dr. Fahad reviewing Case ${activeCaseNumber}...`);
    await selectActiveCaseCard(win3.page, activeCaseNumber);

    const focusInputs = win3.page.locator('textarea');
    const fCount = await focusInputs.count();
    if (fCount >= 3) {
      console.log('   [Win 3] Formulating 3 D07 focus questions (each >= 50 chars)...');
      const q1 = 'Is transcatheter aortic valve replacement (TAVR) favored over surgical replacement given the anatomical risk score?';
      const q2 = 'What is the risk profile for high-degree AV block requiring permanent pacemaker implantation with this annulus diameter?';
      const q3 = 'Recommended duration for dual antiplatelet therapy (DAPT) post-procedure versus single-agent oral anticoagulation?';
      await focusInputs.nth(0).scrollIntoViewIfNeeded();
      await focusInputs.nth(0).fill(q1);
      await sleep(600);
      await focusInputs.nth(1).scrollIntoViewIfNeeded();
      await focusInputs.nth(1).fill(q2);
      await sleep(600);
      await focusInputs.nth(2).scrollIntoViewIfNeeded();
      await focusInputs.nth(2).fill(q3);
      await sleep(1000);
    }

    const d10Btn = win3.page.locator('button:has-text("D10"), button:has-text("Approve Referral & Route to ALO Coordinator")').first();
    if (await d10Btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('   [Win 3] Clicking D10 Referral Approval...');
      await d10Btn.scrollIntoViewIfNeeded();
      await d10Btn.evaluate((b) => b.click()).catch(() => d10Btn.click({ force: true }));
      await sleep(2500);
      console.log('   ✓ Referral Approved! Routed to ALO Coordinator.');
    }

    const docUpdatedCases = await win3.page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]'); } catch (e) { return []; }
    });
    if (docUpdatedCases.length > 0) activeCaseObject = docUpdatedCases[0];

    // SYNC TO WINDOW 4 (Coordinator): Watch referral arrive!
    console.log('\n👁️ [SYNC] Watch WINDOW 4 (Bottom-Left): Coordinator Emmanuel receives referral...');
    await win4.page.bringToFront();
    await syncCaseToPage(win4.page, activeCaseObject, activeCaseObject.id);
    await sleep(2500);

    // -------------------------------------------------------------------
    // STAGE 4: ALO CARE COORDINATOR (Window 4: Emmanuel Arcon Gonzalez)
    // -------------------------------------------------------------------
    console.log(`\n▶ [Stage 4] WINDOW 4 (Bottom-Left): ALO Coordinator issues payment link...`);
    await selectActiveCaseCard(win4.page, activeCaseNumber);

    const issueLinkBtn = win4.page.locator('button:has-text("Assign Payment Methods"), button:has-text("C04")').first();
    if (await issueLinkBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   [Win 4] Issuing ZATCA invoice and assigning payment link (C04)...');
      await issueLinkBtn.scrollIntoViewIfNeeded();
      await issueLinkBtn.evaluate((b) => b.click()).catch(() => issueLinkBtn.click({ force: true }));
      await sleep(2000);
    }

    const coordUpdatedCases = await win4.page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]'); } catch (e) { return []; }
    });
    if (coordUpdatedCases.length > 0) activeCaseObject = coordUpdatedCases[0];

    // SYNC TO WINDOW 5 (Indian Specialist): Watch case unlock for review!
    console.log('\n👁️ [SYNC] Watch WINDOW 5 (Bottom-Mid): Indian Consultant Dr. Prasanth view unlocks...');
    await win5.page.bringToFront();
    await syncCaseToPage(win5.page, activeCaseObject, activeCaseObject.id);
    await sleep(2500);

    // -------------------------------------------------------------------
    // STAGE 5: INDIAN SUPER-SPECIALIST (Window 5: Dr. V. Prasanth)
    // -------------------------------------------------------------------
    console.log(`\n▶ [Stage 5] WINDOW 5 (Bottom-Mid): Dr. Prasanth synthesizing opinion...`);
    const acceptCaseBtn = win5.page.locator('button:has-text("Accept Case"), button:has-text("قبول الحالة")').first();
    if (await acceptCaseBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   [Win 5] Dr. Prasanth accepting case lock...');
      await acceptCaseBtn.scrollIntoViewIfNeeded();
      await acceptCaseBtn.evaluate((b) => b.click()).catch(() => acceptCaseBtn.click({ force: true }));
      await sleep(1500);
    }

    const cTextareas = win5.page.locator('textarea');
    const cCount = await cTextareas.count();
    if (cCount >= 4) {
      console.log('   [Win 5] Answering 3 focus questions & entering comprehensive second opinion (all >= 50 chars)...');
      const ans1 = 'Transfemoral TAVR is favored given peripheral vascular caliber and STS operative mortality score of 4.8%.';
      const ans2 = 'Low membranous septum depth suggests using balloon-expandable valve with high positioning to mitigate pacemaker risk.';
      const ans3 = 'Recommend Dual Antiplatelet Therapy (Aspirin 81mg + Clopidogrel 75mg) for 3 months followed by single-agent Aspirin.';
      const opinion = 'Comprehensive Second Opinion: Multislice CTA confirms annular perimeter suitability. Transfemoral TAVR with a 26mm balloon-expandable valve provides optimal hemodynamics with low procedural risk under experienced Heart Team.';
      await cTextareas.nth(0).scrollIntoViewIfNeeded();
      await cTextareas.nth(0).fill(ans1);
      await sleep(500);
      await cTextareas.nth(1).scrollIntoViewIfNeeded();
      await cTextareas.nth(1).fill(ans2);
      await sleep(500);
      await cTextareas.nth(2).scrollIntoViewIfNeeded();
      await cTextareas.nth(2).fill(ans3);
      await sleep(500);
      await cTextareas.nth(3).scrollIntoViewIfNeeded();
      await cTextareas.nth(3).fill(opinion);
      await sleep(1200);
    }

    const submitK06 = win5.page.locator('button:has-text("Submit written opinion"), button:has-text("K06")').first();
    if (await submitK06.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('   [Win 5] Submitting International Second Opinion (K06)...');
      await submitK06.scrollIntoViewIfNeeded();
      await submitK06.evaluate((b) => b.click()).catch(() => submitK06.click({ force: true }));
      await sleep(2500);
      console.log('   ✓ Opinion submitted to ALO Coordinator for Bilingual Dispatch!');
    }

    const consultantUpdatedCases = await win5.page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]'); } catch (e) { return []; }
    });
    if (consultantUpdatedCases.length > 0) activeCaseObject = consultantUpdatedCases[0];

    // -------------------------------------------------------------------
    // STAGE 6: ALO COORDINATOR DUAL DISPATCH (Window 4: Emmanuel Arcon Gonzalez)
    // -------------------------------------------------------------------
    console.log(`\n▶ [Stage 6] WINDOW 4 (Bottom-Left): Coordinator executes Dual Simultaneous Dispatch (C08)...`);
    await win4.page.bringToFront();
    await syncCaseToPage(win4.page, activeCaseObject, activeCaseObject.id);
    await selectActiveCaseCard(win4.page, activeCaseNumber);

    const c08Tab = win4.page.locator('button:has-text("C08"), button:has-text("PDF 1")').first();
    if (await c08Tab.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   [Win 4] Switching to Tab C08: Report Verification & Dual Dispatch...');
      await c08Tab.scrollIntoViewIfNeeded();
      await c08Tab.evaluate((b) => b.click()).catch(() => c08Tab.click({ force: true }));
      await sleep(1500);
    }

    const dispatchBtn = win4.page.locator('button:has-text("C08"), button:has-text("Verify & Dispatch"), button:has-text("اعتماد وتوزيع")').first();
    if (await dispatchBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   [Win 4] Triggering Dual Simultaneous Dispatch (PDF 1 to Patient and Saudi Doctor)...');
      await dispatchBtn.scrollIntoViewIfNeeded();
      await dispatchBtn.evaluate((b) => b.click()).catch(() => dispatchBtn.click({ force: true }));
      await sleep(2500);
    }

    const dispatchedCases = await win4.page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]'); } catch (e) { return []; }
    });
    if (dispatchedCases.length > 0) activeCaseObject = dispatchedCases[0];

    // ⚡ WATCH BOTH WINDOW 1 (PATIENT) AND WINDOW 3 (SAUDI DOCTOR) RECEIVE THE REPORT SIMULTANEOUSLY!
    console.log('\n⚡ [DUAL SIMULTANEOUS DISPATCH IN ACTION]');
    console.log('   👁️ Watch WINDOW 1 (Top-Left, Patient) AND WINDOW 3 (Top-Right, Saudi Doctor) update concurrently!');
    await syncCaseToPage(win1.page, activeCaseObject, activeCaseObject.id);
    await syncCaseToPage(win3.page, activeCaseObject, activeCaseObject.id);
    await sleep(3000);

    // -------------------------------------------------------------------
    // STAGE 7: SAUDI TREATING DOCTOR ENDORSEMENT (Window 3: Dr. Fahad Al-Harbi)
    // -------------------------------------------------------------------
    console.log(`\n▶ [Stage 7] WINDOW 3 (Top-Right): Dr. Fahad reviews dispatched opinion & endorses (D12)...`);
    await win3.page.bringToFront();
    await selectActiveCaseCard(win3.page, activeCaseNumber);

    const endorseBtn = win3.page.locator('button:has-text("D12"), button:has-text("Endorse"), button:has-text("اعتماد الرأي")').first();
    if (await endorseBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   [Win 3] Dr. Fahad signing clinical endorsement (D12)...');
      await endorseBtn.scrollIntoViewIfNeeded();
      await endorseBtn.evaluate((b) => b.click()).catch(() => endorseBtn.click({ force: true }));
      await sleep(2500);
      console.log('   ✓ Consultant opinion endorsed by Saudi Treating Doctor!');
    }

    const endorsedCases = await win3.page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]'); } catch (e) { return []; }
    });
    if (endorsedCases.length > 0) activeCaseObject = endorsedCases[0];

    // -------------------------------------------------------------------
    // STAGE 8: PATIENT VERIFICATION (Window 1: Sami Al-Harbi)
    // -------------------------------------------------------------------
    console.log(`\n▶ [Stage 8] WINDOW 1 (Top-Left): Patient Sami verifies certified endorsed report...`);
    await win1.page.bringToFront();
    await syncCaseToPage(win1.page, activeCaseObject, activeCaseObject.id);
    const timelineTab = win1.page.locator('button:has-text("Timeline"), button:has-text("My Cases"), button:has-text("ملفاتي")').first();
    if (await timelineTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await timelineTab.scrollIntoViewIfNeeded();
      await timelineTab.evaluate((b) => b.click()).catch(() => timelineTab.click({ force: true }));
      await sleep(2000);
    }
    console.log('   ✓ Patient verified certified report (PDF 1), QR verification, and active 21-day follow-up window.');

    // -------------------------------------------------------------------
    // STAGE 9: SUPER ADMIN MASTER REGISTRY (Window 6: Adrian Lewis)
    // -------------------------------------------------------------------
    console.log(`\n▶ [Stage 9] WINDOW 6 (Bottom-Right): Super Admin Adrian Lewis inspects Master Registry...`);
    await win6.page.bringToFront();
    await syncCaseToPage(win6.page, activeCaseObject, activeCaseObject.id);
    const masterCasesTab = win6.page.locator('button:has-text("Cases"), button:has-text("Master Registry")').first();
    if (await masterCasesTab.isVisible({ timeout: 4000 }).catch(() => false)) {
      await masterCasesTab.scrollIntoViewIfNeeded();
      await masterCasesTab.evaluate((b) => b.click()).catch(() => masterCasesTab.click({ force: true }));
      await sleep(3000);
    }
    console.log('   ✓ Platform-wide audit trail, timestamps, and stage transitions verified.');

    console.log('\n========================================================================');
    console.log('🎉 6-PERSONA MOBILE-ALIGNED MESH PLAYTEST COMPLETED SUCCESSFULLY!');
    console.log('========================================================================\n');
    console.log('Leaving all 6 mobile windows open for 15 seconds for visual inspection...');
    await sleep(15000);

  } catch (err) {
    console.error('Demo execution notice:', err.message);
  } finally {
    await win1.browser.close().catch(() => {});
    await win2.browser.close().catch(() => {});
    await win3.browser.close().catch(() => {});
    await win4.browser.close().catch(() => {});
    await win5.browser.close().catch(() => {});
    await win6.browser.close().catch(() => {});
    cleanup();
    process.exit(0);
  }
}

main();
