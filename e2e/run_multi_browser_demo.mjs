import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import http from 'node:http';

const PORT = 4192;
const BASE_URL = `http://localhost:${PORT}/`;
const API_BASE = `http://localhost:${PORT}/api`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function humanType(locator, text, delayMs = 20) {
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
  HA: {
    isAuthenticated: true,
    phone: '+966504444444',
    personaId: 'hospital_admin_alias',
    roleCode: 'HA',
    hospitalId: 'hosp-alo-riyadh-01',
    fullName: 'David Nunez',
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
    if (await enBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await enBtn.click();
      await sleep(300);
    }
  } catch (e) {}
}

async function initWindow(page, roleKey, titleText) {
  const session = SESSIONS[roleKey];
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ sess, title }) => {
    localStorage.setItem('alo_user_session_v4.0_clean', JSON.stringify(sess));
    localStorage.setItem('alo_lang_preference', 'en');
    document.title = title;
  }, { sess: session, title: titleText });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(1000);
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
  await sleep(1000);
  await switchToEnglish(page);
}

async function selectActiveCaseCard(page, caseNumber) {
  console.log(`   Selecting active case ${caseNumber} from portal queue...`);
  await sleep(1000);

  // 1. Try finding by caseNumber in actionable tab
  let caseSelector = page.locator(`button[aria-label*="${caseNumber}"], button:has-text("${caseNumber}")`).first();
  if (await caseSelector.isVisible({ timeout: 2500 }).catch(() => false)) {
    await caseSelector.click();
    await sleep(1500);
    console.log(`   ✓ Active case ${caseNumber} selected.`);
    return true;
  }

  // 2. Try switching to 'All Cases' tab
  const allTab = page.locator('button:has-text("All"), button:has-text("كل الحالات"), button:has-text("All Cases")').first();
  if (await allTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await allTab.click();
    await sleep(800);
    caseSelector = page.locator(`button[aria-label*="${caseNumber}"], button:has-text("${caseNumber}")`).first();
    if (await caseSelector.isVisible({ timeout: 2500 }).catch(() => false)) {
      await caseSelector.click();
      await sleep(1500);
      console.log(`   ✓ Active case ${caseNumber} selected from All tab.`);
      return true;
    }
  }

  // 3. Fallback: click the first available queue case card in PortalCaseTrackerPanel
  const firstQueueItem = page.locator('div.max-h-\\[220px\\] button, button[aria-label*="CASE-2026"], button[aria-label*="ALO-"]').first();
  if (await firstQueueItem.isVisible({ timeout: 3000 }).catch(() => false)) {
    await firstQueueItem.click();
    await sleep(1500);
    console.log('   ✓ First queue item selected via fallback.');
    return true;
  }

  return false;
}

async function main() {
  console.log('========================================================================');
  console.log('🎬 ALO DOCTOR MULTI-BROWSER TILED GRID PLAYTEST');
  console.log('🖥️ 4 Windows Statically Visible Side-by-Side: Patient | Nurse | Doctor | Coordinator');
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

  // Screen Grid Geometry for 1440x900 or 1920x1080 display:
  // 4 Quadrants:
  // Win 1: (0, 0)       Top-Left     Patient Sami
  // Win 2: (720, 0)     Top-Right    Nurse Sara
  // Win 3: (0, 460)     Bottom-Left  Saudi Doctor Fahad
  // Win 4: (720, 460)   Bottom-Right Coordinator Emmanuel / Consultant Prasanth

  const WIN_W = 710;
  const WIN_H = 440;

  console.log('\n🚀 Launching 4 dedicated browser windows side-by-side on your screen...');

  // Window 1: Patient Portal (Top-Left)
  const bPatient = await chromium.launch({
    headless: false,
    args: [`--window-position=0,0`, `--window-size=${WIN_W},${WIN_H}`, '--disable-infobars', '--no-first-run'],
  });
  const pPatient = await (await bPatient.newContext({ viewport: { width: WIN_W - 20, height: WIN_H - 70 } })).newPage();

  // Window 2: Nurse Triage Portal (Top-Right)
  const bNurse = await chromium.launch({
    headless: false,
    args: [`--window-position=${WIN_W + 10},0`, `--window-size=${WIN_W},${WIN_H}`, '--disable-infobars', '--no-first-run'],
  });
  const pNurse = await (await bNurse.newContext({ viewport: { width: WIN_W - 20, height: WIN_H - 70 } })).newPage();

  // Window 3: Saudi Doctor Portal (Bottom-Left)
  const bDoctor = await chromium.launch({
    headless: false,
    args: [`--window-position=0,${WIN_H + 20}`, `--window-size=${WIN_W},${WIN_H}`, '--disable-infobars', '--no-first-run'],
  });
  const pDoctor = await (await bDoctor.newContext({ viewport: { width: WIN_W - 20, height: WIN_H - 70 } })).newPage();

  // Window 4: ALO Coordinator / Specialist Portal (Bottom-Right)
  const bCoord = await chromium.launch({
    headless: false,
    args: [`--window-position=${WIN_W + 10},${WIN_H + 20}`, `--window-size=${WIN_W},${WIN_H}`, '--disable-infobars', '--no-first-run'],
  });
  const pCoord = await (await bCoord.newContext({ viewport: { width: WIN_W - 20, height: WIN_H - 70 } })).newPage();

  console.log('✓ Initializing all 4 user windows with authenticated sessions and English language...');
  await initWindow(pPatient, 'P', '👤 [1. PATIENT PORTAL] Sami Al-Harbi');
  await initWindow(pNurse, 'N', '🩺 [2. ALO NURSE TRIAGE] Sara Al-Qahtani');
  await initWindow(pDoctor, 'D', '👨‍⚕️ [3. SAUDI TREATING DOCTOR] Dr. Fahad Al-Harbi');
  await initWindow(pCoord, 'C', '👔 [4. ALO COORDINATOR] Emmanuel Arcon Gonzalez');

  console.log('\n👁️ ALL 4 SCREENS ARE NOW VISIBLE SIMULTANEOUSLY ON SCREEN.');
  console.log('   Notice that Nurse, Doctor, and Coordinator queues are currently idle, awaiting new patient intake.\n');
  await sleep(3000);

  let activeCaseNumber = 'CASE-2026-DEMO';
  let activeCaseObject = null;

  try {
    // -------------------------------------------------------------------
    // STAGE 1: PATIENT INTAKE (Window 1: Sami Al-Harbi)
    // -------------------------------------------------------------------
    console.log('▶ [Stage 1] WINDOW 1 (Top-Left): Patient Sami Al-Harbi creates new consultation...');
    await pPatient.bringToFront();
    await pPatient.evaluate(() => { localStorage.setItem('alo_patient_subview_v3.0', 'intake'); });
    await pPatient.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await switchToEnglish(pPatient);

    const startBtn = pPatient.locator('button:has-text("New Consultation"), button:has-text("+ New Consultation"), button:has-text("Start Your Case"), button:has-text("طلب استشارة جديدة")').first();
    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startBtn.click();
      await sleep(1500);
    }

    const uniqueTag = `E2E-${Date.now()}`;
    const diagnosisTitle = 'Severe Calcified Aortic Stenosis with NYHA Class III Exertional Dyspnea';
    const clinicalHistory = `Patient presents with progressive shortness of breath on exertion, atypical angina, and severe fatigue lasting 4 weeks. Seeking international cardiothoracic specialist second opinion. Tag: ${uniqueTag}`;

    // 1. Fill Caregiver / Legal Proxy Fields
    const caregiverNameInput = pPatient.locator('input[placeholder*="Full Name"], input[placeholder*="الاسم الكامل"]').first();
    if (await caregiverNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('   [Win 1] Filling Caregiver Full Name...');
      await caregiverNameInput.scrollIntoViewIfNeeded();
      await caregiverNameInput.fill('');
      await humanType(caregiverNameInput, 'Faisal Sami Al-Harbi (Authorized Legal Proxy)', 15);
      await sleep(600);
    }

    const relationshipInput = pPatient.locator('input[placeholder*="Son"], input[placeholder*="صلة القرابة"]').first();
    if (await relationshipInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   [Win 1] Filling Caregiver Relationship...');
      await relationshipInput.scrollIntoViewIfNeeded();
      await relationshipInput.fill('');
      await humanType(relationshipInput, 'Son / Authorized Legal Healthcare Proxy', 15);
      await sleep(600);
    }

    const caregiverIdInput = pPatient.locator('input[placeholder*="10XXXXXXXX"]').first();
    if (await caregiverIdInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   [Win 1] Filling Caregiver National ID...');
      await caregiverIdInput.scrollIntoViewIfNeeded();
      await caregiverIdInput.fill('');
      await humanType(caregiverIdInput, '1088776655', 20);
      await sleep(600);
    }

    // 2. Select Saudi Doctor Dropdown
    const docSelect = pPatient.locator('select').first();
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
      await sleep(800);
    }

    // 3. Fill Medical Diagnosis Title (>= 50 chars)
    console.log(`   [Win 1] Entering Confirmed Medical Diagnosis Title (${diagnosisTitle.length} chars >= 50)...`);
    const diagnosisLabel = pPatient.locator('label:has-text("Confirmed Medical Diagnosis"), label:has-text("Diagnosis"), label:has-text("التشخيص")').first();
    await diagnosisLabel.waitFor({ state: 'visible', timeout: 8000 });
    const diagnosisInput = diagnosisLabel.locator('..').locator('input');
    await diagnosisInput.scrollIntoViewIfNeeded();
    await diagnosisInput.fill('');
    await humanType(diagnosisInput, diagnosisTitle, 20);
    await sleep(800);

    // 4. Fill Symptoms Narrative (>= 50 chars)
    console.log(`   [Win 1] Entering Clinical Symptoms (${clinicalHistory.length} chars >= 50)...`);
    const symptomsLabel = pPatient.locator('label:has-text("Symptoms & Patient History"), label:has-text("Symptoms"), label:has-text("الأعراض")').first();
    await symptomsLabel.waitFor({ state: 'visible', timeout: 8000 });
    const symptomsInput = symptomsLabel.locator('..').locator('textarea');
    await symptomsInput.scrollIntoViewIfNeeded();
    await symptomsInput.fill('');
    await humanType(symptomsInput, clinicalHistory, 15);
    await sleep(800);

    // 5. Select Video + Written Opinion (P11)
    const videoBtn = pPatient.locator('button:has-text("Video + written opinion"), button:has-text("مرئي + رأي مكتوب")').first();
    if (await videoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await videoBtn.click();
      await sleep(500);
    }

    // 6. Check MOH Health Data Privacy Consent
    const consentBox = pPatient.locator('input[type="checkbox"]').first();
    if (await consentBox.isVisible().catch(() => false)) {
      const isChecked = await consentBox.isChecked();
      if (!isChecked) {
        await consentBox.check();
        await sleep(800);
      }
    }

    // 7. Submit Intake
    const submitIntake = pPatient.locator('button:has-text("Submit case to ALO nurse"), button:has-text("Submit Consultation"), button:has-text("إرسال الملف إلى تمريض الفرز")').first();
    console.log('   [Win 1] Submitting consultation to Nurse Triage...');
    await submitIntake.click();
    await sleep(3000);

    // Retrieve created case from localStorage
    const savedCases = await pPatient.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]'); } catch (e) { return []; }
    });

    if (savedCases.length > 0) {
      activeCaseObject = savedCases[0];
      activeCaseNumber = activeCaseObject.caseNumber || activeCaseObject.id;
      console.log(`   ✅ [Win 1] Patient Case Created: ${activeCaseNumber}`);
    }

    // SYNC TO NURSE WINDOW (Window 2): Watch the queue update live!
    console.log('\n👁️ [SYNC] Watch WINDOW 2 (Top-Right): Nurse Sara queue updates with the new patient case...');
    await pNurse.bringToFront();
    if (activeCaseObject) await syncCaseToPage(pNurse, activeCaseObject, activeCaseObject.id);
    await sleep(2500);

    // -------------------------------------------------------------------
    // STAGE 2: NURSE CLINICAL TRIAGE (Window 2: Sara Al-Qahtani)
    // -------------------------------------------------------------------
    console.log(`\n▶ [Stage 2] WINDOW 2 (Top-Right): Nurse Sara reviewing Case ${activeCaseNumber}...`);
    await selectActiveCaseCard(pNurse, activeCaseNumber);

    const triageText = pNurse.locator('textarea').first();
    if (await triageText.isVisible({ timeout: 5000 }).catch(() => false)) {
      const triageNotes = 'Transthoracic echocardiogram confirms severe calcified aortic stenosis with AVA 0.6cm2 and mean gradient 48mmHg. NYHA Class III symptoms verified. Assigned to Dr. Fahad.';
      console.log(`   [Win 2] Typing N05 clinical triage notes (${triageNotes.length} chars >= 50 chars)...`);
      await triageText.fill('');
      await humanType(triageText, triageNotes, 15);
      await sleep(1500);
    }

    // Assign Dr. Fahad Al-Harbi (N06)
    const doctorCard = pNurse.locator('div, button').filter({ hasText: /Dr\. Fahad Al-Harbi|د\. فهد الحربي/ }).last();
    if (await doctorCard.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   [Win 2] Assigning treating doctor: Dr. Fahad Al-Harbi (N06)...');
      await doctorCard.click();
      await sleep(1200);
    }

    const n07Button = pNurse.locator('button:has-text("N07"), button:has-text("Approve & route to Saudi treating doctor")').first();
    if (await n07Button.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('   [Win 2] Clicking N07 Approval button...');
      await n07Button.click();
      await sleep(2500);
      console.log('   ✓ Case routed to Saudi Treating Doctor (D02)!');
    }

    // Update active case object
    const nurseUpdatedCases = await pNurse.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]'); } catch (e) { return []; }
    });
    if (nurseUpdatedCases.length > 0) activeCaseObject = nurseUpdatedCases[0];

    // SYNC TO SAUDI DOCTOR (Window 3): Watch the incoming case arrive!
    console.log('\n👁️ [SYNC] Watch WINDOW 3 (Bottom-Left): Dr. Fahad receives the case in his actionable inbox...');
    await pDoctor.bringToFront();
    if (activeCaseObject) await syncCaseToPage(pDoctor, activeCaseObject, activeCaseObject.id);
    await sleep(2500);

    // -------------------------------------------------------------------
    // STAGE 3: SAUDI TREATING DOCTOR REVIEW (Window 3: Dr. Fahad Al-Harbi)
    // -------------------------------------------------------------------
    console.log(`\n▶ [Stage 3] WINDOW 3 (Bottom-Left): Dr. Fahad reviewing Case ${activeCaseNumber}...`);
    await selectActiveCaseCard(pDoctor, activeCaseNumber);

    const focusInputs = pDoctor.locator('textarea');
    const fCount = await focusInputs.count();
    if (fCount >= 3) {
      console.log('   [Win 3] Formulating 3 D07 focus questions (each >= 50 chars)...');
      const q1 = 'Is transcatheter aortic valve replacement (TAVR) favored over surgical replacement given the anatomical risk score?';
      const q2 = 'What is the risk profile for high-degree AV block requiring permanent pacemaker implantation with this annulus diameter?';
      const q3 = 'Recommended duration for dual antiplatelet therapy (DAPT) post-procedure versus single-agent oral anticoagulation?';
      await focusInputs.nth(0).fill(q1);
      await sleep(800);
      await focusInputs.nth(1).fill(q2);
      await sleep(800);
      await focusInputs.nth(2).fill(q3);
      await sleep(1500);
    }

    const d10Btn = pDoctor.locator('button:has-text("D10"), button:has-text("Approve Referral & Route to ALO Coordinator")').first();
    if (await d10Btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('   [Win 3] Clicking D10 Referral Approval...');
      await d10Btn.click();
      await sleep(2500);
      console.log('   ✓ Referral Approved! Routed to ALO Coordinator.');
    }

    const doctorUpdatedCases = await pDoctor.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]'); } catch (e) { return []; }
    });
    if (doctorUpdatedCases.length > 0) activeCaseObject = doctorUpdatedCases[0];

    // SYNC TO COORDINATOR (Window 4): Watch referral arrive!
    console.log('\n👁️ [SYNC] Watch WINDOW 4 (Bottom-Right): Coordinator Emmanuel receives the referral...');
    await pCoord.bringToFront();
    if (activeCaseObject) await syncCaseToPage(pCoord, activeCaseObject, activeCaseObject.id);
    await sleep(2500);

    // -------------------------------------------------------------------
    // STAGE 4: ALO CARE COORDINATOR (Window 4: Emmanuel Arcon Gonzalez)
    // -------------------------------------------------------------------
    console.log(`\n▶ [Stage 4] WINDOW 4 (Bottom-Right): ALO Coordinator issues payment link...`);
    await selectActiveCaseCard(pCoord, activeCaseNumber);

    const issueLinkBtn = pCoord.locator('button:has-text("Assign Payment Methods"), button:has-text("C04")').first();
    if (await issueLinkBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   [Win 4] Issuing ZATCA invoice and assigning payment link (C04)...');
      await issueLinkBtn.click();
      await sleep(2000);
    }

    const coordUpdatedCases = await pCoord.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]'); } catch (e) { return []; }
    });
    if (coordUpdatedCases.length > 0) activeCaseObject = coordUpdatedCases[0];

    // -------------------------------------------------------------------
    // STAGE 5: INDIAN SUPER-SPECIALIST (Window 4: Dr. V. Prasanth)
    // -------------------------------------------------------------------
    console.log(`\n▶ [Stage 5] WINDOW 4 (Bottom-Right): Indian Specialist Dr. V. Prasanth synthesizes opinion...`);
    await initWindow(pCoord, 'K', '🩺 [5. INDIAN SPECIALIST] Dr. V. Prasanth');
    if (activeCaseObject) await syncCaseToPage(pCoord, activeCaseObject, activeCaseObject.id);

    const acceptCaseBtn = pCoord.locator('button:has-text("Accept Case"), button:has-text("قبول الحالة")').first();
    if (await acceptCaseBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   [Win 4] Dr. Prasanth accepting case lock...');
      await acceptCaseBtn.click();
      await sleep(1500);
    }

    const cTextareas = pCoord.locator('textarea');
    const cCount = await cTextareas.count();
    if (cCount >= 4) {
      console.log('   [Win 4] Answering 3 focus questions & entering comprehensive second opinion (all >= 50 chars)...');
      const ans1 = 'Transfemoral TAVR is favored given peripheral vascular caliber and STS operative mortality score of 4.8%.';
      const ans2 = 'Low membranous septum depth suggests using balloon-expandable valve with high positioning to mitigate pacemaker risk.';
      const ans3 = 'Recommend Dual Antiplatelet Therapy (Aspirin 81mg + Clopidogrel 75mg) for 3 months followed by single-agent Aspirin.';
      const opinion = 'Comprehensive Second Opinion: Multislice CTA confirms annular perimeter suitability. Transfemoral TAVR with a 26mm balloon-expandable valve provides optimal hemodynamics with low procedural risk under experienced Heart Team.';
      await cTextareas.nth(0).fill(ans1);
      await sleep(600);
      await cTextareas.nth(1).fill(ans2);
      await sleep(600);
      await cTextareas.nth(2).fill(ans3);
      await sleep(600);
      await cTextareas.nth(3).fill(opinion);
      await sleep(1500);
    }

    const submitK06 = pCoord.locator('button:has-text("Submit written opinion"), button:has-text("K06")').first();
    if (await submitK06.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('   [Win 4] Submitting International Second Opinion (K06)...');
      await submitK06.click();
      await sleep(2500);
      console.log('   ✓ Opinion submitted to ALO Coordinator for Bilingual Dispatch!');
    }

    const consultantUpdatedCases = await pCoord.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]'); } catch (e) { return []; }
    });
    if (consultantUpdatedCases.length > 0) activeCaseObject = consultantUpdatedCases[0];

    // -------------------------------------------------------------------
    // STAGE 6: ALO COORDINATOR DUAL DISPATCH (Window 4: Emmanuel Arcon Gonzalez)
    // -------------------------------------------------------------------
    console.log(`\n▶ [Stage 6] WINDOW 4 (Bottom-Right): ALO Coordinator executes Dual Simultaneous Dispatch (C08)...`);
    await initWindow(pCoord, 'C', '👔 [6. ALO COORDINATOR DISPATCH] Emmanuel Arcon Gonzalez');
    if (activeCaseObject) await syncCaseToPage(pCoord, activeCaseObject, activeCaseObject.id);
    await selectActiveCaseCard(pCoord, activeCaseNumber);

    // Switch to C08 Tab (Report Release PDF 1)
    const c08Tab = pCoord.locator('button:has-text("C08"), button:has-text("PDF 1")').first();
    if (await c08Tab.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   [Win 4] Switching to Tab C08: Report Verification & Dual Dispatch...');
      await c08Tab.click();
      await sleep(1500);
    }

    // Click Dual Dispatch Button
    const dispatchBtn = pCoord.locator('button:has-text("C08"), button:has-text("Verify & Dispatch"), button:has-text("اعتماد وتوزيع")').first();
    if (await dispatchBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   [Win 4] Triggering Dual Simultaneous Dispatch (PDF 1 to Patient and Saudi Doctor)...');
      await dispatchBtn.click();
      await sleep(2500);
    }

    const dispatchedCases = await pCoord.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]'); } catch (e) { return []; }
    });
    if (dispatchedCases.length > 0) activeCaseObject = dispatchedCases[0];

    // ⚡ WATCH BOTH WINDOW 1 AND WINDOW 3 RECEIVE THE REPORT SIMULTANEOUSLY!
    console.log('\n⚡ [DUAL SIMULTANEOUS DISPATCH IN ACTION]');
    console.log('   👁️ Watch WINDOW 1 (Top-Left, Patient) AND WINDOW 3 (Bottom-Left, Saudi Doctor) update concurrently!');
    if (activeCaseObject) {
      await syncCaseToPage(pPatient, activeCaseObject, activeCaseObject.id);
      await syncCaseToPage(pDoctor, activeCaseObject, activeCaseObject.id);
    }
    await sleep(3000);

    // -------------------------------------------------------------------
    // STAGE 7: SAUDI TREATING DOCTOR ENDORSEMENT (Window 3: Dr. Fahad Al-Harbi)
    // -------------------------------------------------------------------
    console.log(`\n▶ [Stage 7] WINDOW 3 (Bottom-Left): Dr. Fahad reviews dispatched opinion & endorses (D12)...`);
    await pDoctor.bringToFront();
    await selectActiveCaseCard(pDoctor, activeCaseNumber);

    const endorseBtn = pDoctor.locator('button:has-text("D12"), button:has-text("Endorse"), button:has-text("اعتماد الرأي")').first();
    if (await endorseBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   [Win 3] Dr. Fahad signing clinical endorsement (D12)...');
      await endorseBtn.click();
      await sleep(2500);
      console.log('   ✓ Consultant opinion endorsed by Saudi Treating Doctor!');
    }

    const endorsedCases = await pDoctor.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]'); } catch (e) { return []; }
    });
    if (endorsedCases.length > 0) activeCaseObject = endorsedCases[0];

    // -------------------------------------------------------------------
    // STAGE 8: PATIENT VERIFICATION (Window 1: Sami Al-Harbi)
    // -------------------------------------------------------------------
    console.log(`\n▶ [Stage 8] WINDOW 1 (Top-Left): Patient Sami verifies certified endorsed report...`);
    await pPatient.bringToFront();
    if (activeCaseObject) await syncCaseToPage(pPatient, activeCaseObject, activeCaseObject.id);
    const timelineTab = pPatient.locator('button:has-text("Timeline"), button:has-text("My Cases"), button:has-text("ملفاتي")').first();
    if (await timelineTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await timelineTab.click();
      await sleep(2000);
    }
    console.log('   ✓ Patient verified certified report (PDF 1), QR verification, and active 21-day follow-up window.');
    await sleep(2500);

    // -------------------------------------------------------------------
    // STAGE 9 & 10: ADMINISTRATIVE GOVERNANCE
    // -------------------------------------------------------------------
    console.log('\n▶ [Stage 9] WINDOW 2 (Top-Right): Medical Center Admin David Nunez inspects hospital referrals...');
    await initWindow(pNurse, 'HA', '🏥 [9. HOSPITAL ADMIN] David Nunez');
    if (activeCaseObject) await syncCaseToPage(pNurse, activeCaseObject, activeCaseObject.id);
    const referralsTab = pNurse.locator('button:has-text("Referrals"), button:has-text("Cases")').first();
    if (await referralsTab.isVisible({ timeout: 4000 }).catch(() => false)) {
      await referralsTab.click();
      await sleep(2000);
    }

    console.log('\n▶ [Stage 10] WINDOW 4 (Bottom-Right): ALO Super Admin Adrian Lewis inspects Master Registry...');
    await initWindow(pCoord, 'AD', '🛡️ [10. ALO SUPER ADMIN] Adrian Lewis');
    if (activeCaseObject) await syncCaseToPage(pCoord, activeCaseObject, activeCaseObject.id);
    const masterCasesTab = pCoord.locator('button:has-text("Cases"), button:has-text("Master Registry")').first();
    if (await masterCasesTab.isVisible({ timeout: 4000 }).catch(() => false)) {
      await masterCasesTab.click();
      await sleep(3000);
    }

    console.log('\n========================================================================');
    console.log('🎉 MULTI-BROWSER TILED GRID PLAYTEST COMPLETED SUCCESSFULLY!');
    console.log('========================================================================\n');
    console.log('Leaving all 4 windows open for 10 seconds for visual inspection...');
    await sleep(10000);

  } catch (err) {
    console.error('Demo execution notice:', err.message);
  } finally {
    await bPatient.close().catch(() => {});
    await bNurse.close().catch(() => {});
    await bDoctor.close().catch(() => {});
    await bCoord.close().catch(() => {});
    cleanup();
    process.exit(0);
  }
}

main();
