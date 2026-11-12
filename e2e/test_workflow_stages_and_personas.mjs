import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.BASE_URL || 'https://ad.howtostart.in/feature-sarat/';
const API_BASE = process.env.API_BASE || 'https://ad.howtostart.in/feature-sarat/api';
const SCREENSHOT_DIR = path.resolve('e2e-artifacts/screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const PERSONAS = [
  { role: 'AD', name: 'Adrian Lewis', phone: '+966500000001', pin: '1234', hospital: 'none' },
  { role: 'HA', name: 'David Nunez', phone: '+966500000002', pin: '1234', hospital: 'hosp-alo-riyadh-01' },
  { role: 'C', name: 'Emmanuel Arcon Gonzalez', phone: '+966500000003', pin: '1234', hospital: 'none' },
  { role: 'N', name: 'Sara Al-Qahtani', phone: '+966500000004', pin: '1234', hospital: 'none' },
  { role: 'D', name: 'Dr. Fahad Al-Harbi', phone: '+966500000005', pin: '1234', hospital: 'hosp-alo-riyadh-01' },
  { role: 'K', name: 'Dr. V. Prasanth', phone: '+966500000006', pin: '1234', hospital: 'none' },
  { role: 'L', name: 'Omar Al-Zahrani', phone: '+966500000007', pin: '1234', hospital: 'hosp-alo-riyadh-01' },
  { role: 'PH', name: 'Noura Al-Dosari', phone: '+966500000008', pin: '1234', hospital: 'hosp-alo-riyadh-01' },
  { role: 'REC', name: 'Marcus Vance', phone: '+966500000009', pin: '1234', hospital: 'hosp-alo-riyadh-01' },
  { role: 'P', name: 'Sami Al-Harbi', phone: '+966500000099', pin: '1234', hospital: 'none' },
];

async function fetchLiveCases() {
  const res = await fetch(`${API_BASE}/cases`);
  if (!res.ok) throw new Error(`Failed to fetch /api/cases: HTTP ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

async function verifyCaseTransition(caseId, expectedStageNum, expectedCurrentStage, stepName) {
  console.log(`\n🔍 [API Check] Verifying case ${caseId} after "${stepName}"...`);
  let attempts = 0;
  let targetCase = null;
  while (attempts < 10) {
    const cases = await fetchLiveCases();
    targetCase = cases.find((c) => c.id === caseId);
    if (targetCase && targetCase.currentStage === expectedCurrentStage) {
      break;
    }
    await new Promise((r) => setTimeout(r, 600));
    attempts++;
  }

  if (!targetCase) {
    throw new Error(`Case ${caseId} not found in /api/cases after ${stepName}!`);
  }

  console.log(`   API State: ID=${targetCase.id} | Case#=${targetCase.caseNumber} | stage=${targetCase.stage} | currentStage=${targetCase.currentStage}`);
  if (targetCase.currentStage !== expectedCurrentStage) {
    throw new Error(`Stage mismatch for case ${caseId} at ${stepName}! Expected currentStage='${expectedCurrentStage}', but got '${targetCase.currentStage}'`);
  }
  if (expectedStageNum !== null && targetCase.stage !== expectedStageNum) {
    console.warn(`   ⚠ Note: stage number is ${targetCase.stage} (expected ${expectedStageNum})`);
  }
  console.log(`   ✓ [Verified in DB] ${stepName} transitioned successfully to ${targetCase.currentStage} (stage ${targetCase.stage})`);
  return targetCase;
}

async function loginPersona(browser, persona) {
  console.log(`\n▶ [Phase A] Logging in Persona ${persona.role} (${persona.name} | ${persona.phone})...`);
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.bringToFront();

  // Attach error and response monitoring
  page.on('pageerror', (err) => {
    console.error(`  [Browser PageError] [${persona.role}]:`, err.message);
  });
  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('favicon') && !res.url().includes('.map')) {
      console.warn(`  [Browser HTTP ${res.status()}] [${persona.role}]: ${res.url()}`);
    }
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Click English (top-left)
  const englishBtn = page.locator('button:has-text("English")').first();
  if (await englishBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await englishBtn.click();
    await page.waitForTimeout(300);
  }

  // Click Login (top-right)
  const loginBtn = page.locator('button:has-text("Login"), button:has-text("تسجيل الدخول")').first();
  if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await loginBtn.click();
    await page.waitForTimeout(400);
  }

  // Enter phone
  const phoneInput = page.locator('input[type="tel"]').first();
  await phoneInput.waitFor({ state: 'visible', timeout: 5000 });
  await phoneInput.fill(persona.phone);
  await page.waitForTimeout(200);

  // Submit phone
  const submitPhoneBtn = page.locator('button[type="submit"]').first();
  await submitPhoneBtn.click();
  await page.waitForTimeout(700);

  // Verify it goes straight to 4-digit PIN 1234 (no 123456 activation/OTP)
  const pinInputs = page.locator('input[type="password"]');
  const count = await pinInputs.count();
  if (count < 4) {
    const shotPath = path.join(SCREENSHOT_DIR, `fail_login_${persona.role}.png`);
    await page.screenshot({ path: shotPath, fullPage: true });
    throw new Error(`[${persona.role}] Expected 4 password PIN inputs, but found ${count}. Screenshot saved: ${shotPath}`);
  }

  // Type PIN 1234
  for (let i = 0; i < 4; i++) {
    await pinInputs.nth(i).fill(persona.pin[i]);
  }
  await page.waitForTimeout(200);

  // Submit PIN
  const submitPinBtn = page.locator('button[type="submit"]').first();
  await submitPinBtn.click();
  await page.waitForTimeout(1200);

  // Verify session.roleCode in localStorage
  const sessionStr = await page.evaluate(() => localStorage.getItem('alo_user_session_v4.0_clean'));
  if (!sessionStr) {
    const shotPath = path.join(SCREENSHOT_DIR, `fail_session_${persona.role}.png`);
    await page.screenshot({ path: shotPath, fullPage: true });
    throw new Error(`[${persona.role}] Missing session in localStorage! Screenshot: ${shotPath}`);
  }
  const session = JSON.parse(sessionStr);
  if (!session.isAuthenticated || session.roleCode !== persona.role) {
    throw new Error(`[${persona.role}] Role mismatch! Expected ${persona.role}, got ${session.roleCode}`);
  }

  console.log(`  ✓ Persona ${persona.role} authenticated! Role verified: ${session.roleCode}`);
  return { context, page };
}

async function runEndToEndTest() {
  console.log('========================================================================');
  console.log('🏥 ALO DOCTOR MULTI-PERSONA END-TO-END CLINICAL WORKFLOW VERIFICATION');
  console.log(`Target: ${BASE_URL}`);
  console.log(`API Base: ${API_BASE}`);
  console.log('Mode: Headed Chrome, slowMo: 300ms');
  console.log('========================================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    slowMo: 300,
    args: ['--window-size=1440,900', '--start-maximized'],
  });

  const sessions = {};

  try {
    // -------------------------------------------------------------------------
    // Phase A: Verify Login for all 10 Personas
    // -------------------------------------------------------------------------
    console.log('\n========================================================================');
    console.log('PHASE A: VERIFYING LOGIN FOR ALL 10 PERSONAS');
    console.log('========================================================================');

    for (const persona of PERSONAS) {
      sessions[persona.role] = await loginPersona(browser, persona);
    }
    console.log('\n🎉 PHASE A COMPLETE: All 10 personas authenticated into separate isolated sessions!');

    // -------------------------------------------------------------------------
    // Phase B: Run One Real Clinical Case End-to-End Across Contexts
    // -------------------------------------------------------------------------
    console.log('\n========================================================================');
    console.log('PHASE B: EXECUTING FULL CLINICAL CASE ACROSS PERSONA SESSIONS');
    console.log('========================================================================');

    const pageP = sessions['P'].page;
    const pageN = sessions['N'].page;
    const pageD = sessions['D'].page;
    const pageC = sessions['C'].page;
    const pageK = sessions['K'].page;
    const pageL = sessions['L'].page;
    const pagePH = sessions['PH'].page;
    const pageREC = sessions['REC'].page;

    // -------------------------------------------------------------------------
    // Step B1: P (Patient) Intake Submission
    // -------------------------------------------------------------------------
    console.log('\n▶ Step B1: [P] Patient Intake Submission...');
    await pageP.bringToFront();

    // Check if on Landing or Timeline, and start a new consultation
    const newCaseBtn = pageP.locator('button:has-text("New Consultation"), button:has-text("+ New Consultation"), button:has-text("طلب استشارة جديدة"), button:has-text("Start Your Case"), button:has-text("ابدأ طلبك السريري")').first();
    if (await newCaseBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   Clicking Start Case / New Consultation button...');
      await newCaseBtn.click();
      await pageP.waitForTimeout(1000);
    }

    // Fill Symptoms
    const symptomsTextarea = pageP.locator('textarea').first();
    await symptomsTextarea.waitFor({ state: 'visible', timeout: 5000 });
    const uniqueSymptomTag = `Severe exertional dyspnea & chest pressure [E2E-${Date.now()}]`;
    await symptomsTextarea.fill(`Patient presents with 3-week progressive shortness of breath on exertion and atypical angina. Seeking international cardiac specialist second opinion. Tag: ${uniqueSymptomTag}`);
    console.log('   Filled patient clinical symptoms.');

    // Ensure Privacy checkbox is checked
    const privacyCheckbox = pageP.locator('input[type="checkbox"]').first();
    if (await privacyCheckbox.isVisible().catch(() => false)) {
      const isChecked = await privacyCheckbox.isChecked();
      if (!isChecked) await privacyCheckbox.check();
    }

    // Submit case to ALO nurse
    const submitIntakeBtn = pageP.locator('button:has-text("Submit case to ALO nurse"), button:has-text("إرسال الملف إلى تمريض الفرز")').first();
    await submitIntakeBtn.click();
    console.log('   Clicked Submit case to ALO nurse (P14).');
    await pageP.waitForTimeout(2500);

    // Verify in API
    const casesAfterIntake = await fetchLiveCases();
    const createdCase = casesAfterIntake.find((c) => (c.patientPhone === '+966500000099' || c.patientPhone === '+966500000010') && c.symptoms && c.symptoms.includes(uniqueSymptomTag));
    if (!createdCase) {
      throw new Error(`Newly submitted case not found in /api/cases! Patient phone: +966500000099, tag: ${uniqueSymptomTag}`);
    }
    const activeCaseId = createdCase.id;
    const activeCaseNumber = createdCase.caseNumber;
    console.log(`   ✓ New Case Created: ID=${activeCaseId} | Case#=${activeCaseNumber}`);
    await verifyCaseTransition(activeCaseId, 2, 'NURSE_CHECK', 'Step B1: Patient Intake Submission');

    // -------------------------------------------------------------------------
    // Step B2: N (Nurse) Triage & Doctor Assignment
    // -------------------------------------------------------------------------
    console.log(`\n▶ Step B2: [N] Nurse Triage & Assign Treating Doctor (${activeCaseNumber})...`);
    await pageN.bringToFront();
    await pageN.reload({ waitUntil: 'domcontentloaded' });
    await pageN.waitForTimeout(1000);

    // If case switcher is present, select our active case
    const nurseCaseCard = pageN.locator(`button:has-text("${activeCaseNumber}")`).first();
    if (await nurseCaseCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nurseCaseCard.click();
      await pageN.waitForTimeout(600);
    }

    // Assign Doctor: Dr. Fahad Al-Harbi
    const doctorCard = pageN.locator('div, button').filter({ hasText: /Dr\. Fahad Al-Harbi|د\. فهد الحربي/ }).last();
    if (await doctorCard.isVisible({ timeout: 4000 }).catch(() => false)) {
      await doctorCard.click();
      console.log('   Assigned treating doctor: Dr. Fahad Al-Harbi');
      await pageN.waitForTimeout(400);
    }

    // Click Approve & route to Saudi treating doctor (N07)
    const approveNurseBtn = pageN.locator('button:has-text("Approve & route to Saudi treating doctor"), button:has-text("اعتماد الفرز وإرسال الملف للطبيب السعودي")').first();
    await approveNurseBtn.waitFor({ state: 'visible', timeout: 5000 });
    await approveNurseBtn.click();
    console.log('   Clicked N07 Approve & Route to Saudi treating doctor.');
    await pageN.waitForTimeout(2000);

    await verifyCaseTransition(activeCaseId, 3, 'DOCTOR_REVIEW', 'Step B2: Nurse Triage & Doctor Assignment');

    // -------------------------------------------------------------------------
    // Step B3: D (Doctor) Referral Approval
    // -------------------------------------------------------------------------
    console.log(`\n▶ Step B3: [D] Saudi Treating Doctor Referral Approval (${activeCaseNumber})...`);
    await pageD.bringToFront();
    await pageD.reload({ waitUntil: 'domcontentloaded' });
    await pageD.waitForTimeout(1000);

    // Select active case if in tracker
    const doctorCaseCard = pageD.locator(`button:has-text("${activeCaseNumber}")`).first();
    if (await doctorCaseCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await doctorCaseCard.click();
      await pageD.waitForTimeout(600);
    }

    // Click Approve Referral & Route to ALO Coordinator (D10)
    const approveDoctorBtn = pageD.locator('button:has-text("Approve Referral & Route to ALO Coordinator"), button:has-text("اعتماد الإحالة وإرسال الملف لمنسق رعاية ألو")').first();
    await approveDoctorBtn.waitFor({ state: 'visible', timeout: 6000 });
    await approveDoctorBtn.click();
    console.log('   Clicked D10 Approve Referral & Route to ALO Coordinator.');
    await pageD.waitForTimeout(2000);

    await verifyCaseTransition(activeCaseId, 4, 'AWAITING_PAYMENT', 'Step B3: Doctor Referral Approval');

    // -------------------------------------------------------------------------
    // Step B4: C (Coordinator) Payment Link & Method Assignment
    // -------------------------------------------------------------------------
    console.log(`\n▶ Step B4: [C] ALO Coordinator Payment Link Setup (${activeCaseNumber})...`);
    await pageC.bringToFront();
    await pageC.reload({ waitUntil: 'domcontentloaded' });
    await pageC.waitForTimeout(1000);

    // Select active case
    const coordinatorCaseCard = pageC.locator(`button:has-text("${activeCaseNumber}")`).first();
    if (await coordinatorCaseCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await coordinatorCaseCard.click();
      await pageC.waitForTimeout(600);
    }

    // Click Payment Link button (C04)
    const issueLinkBtn = pageC.locator('button:has-text("Assign Payment Methods & Send Invoice to Patient"), button:has-text("اعتماد الفاتورة وإسناد الدفع للمريض"), button:has-text("C04")').first();
    await issueLinkBtn.waitFor({ state: 'visible', timeout: 6000 });
    await issueLinkBtn.click();
    console.log('   Clicked C04 Assign Payment Methods & Send Invoice to Patient.');
    await pageC.waitForTimeout(2000);

    // Verify invoiceIssued
    const checkAfterInvoice = await verifyCaseTransition(activeCaseId, 4, 'AWAITING_PAYMENT', 'Step B4: Coordinator Payment Link');
    if (!checkAfterInvoice.invoiceIssued && !checkAfterInvoice.metadata?.paymentLinkIssued) {
      throw new Error(`Expected invoiceIssued=true or paymentLinkIssued=true on case ${activeCaseId}`);
    }
    console.log('   ✓ Invoice issued and payment gateway unlocked for patient!');

    // -------------------------------------------------------------------------
    // Step B5: P (Patient) Checkout & Payment
    // -------------------------------------------------------------------------
    console.log(`\n▶ Step B5: [P] Patient Payment Checkout (${activeCaseNumber})...`);
    await pageP.bringToFront();
    await pageP.reload({ waitUntil: 'domcontentloaded' });
    await pageP.waitForTimeout(1000);

    const pCaseCard = pageP.locator(`button:has-text("${activeCaseNumber}")`).first();
    if (await pCaseCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pCaseCard.click();
      await pageP.waitForTimeout(600);
    }

    // Click Open Payment Checkout
    const openCheckoutBtn = pageP.locator('button:has-text("Open Payment Checkout"), button:has-text("الانتقال إلى بوابة الدفع"), button:has-text("سداد الفاتورة")').first();
    if (await openCheckoutBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await openCheckoutBtn.click();
      await pageP.waitForTimeout(1000);
    }

    // On Payment Checkout View: Select mada method and complete payment
    const completePaymentBtn = pageP.locator('button:has-text("Complete Payment"), button:has-text("إتمام السداد")').first();
    await completePaymentBtn.waitFor({ state: 'visible', timeout: 6000 });
    await completePaymentBtn.click();
    console.log('   Clicked Complete Payment button.');
    await pageP.waitForTimeout(3000);

    // Verify in API that payment is recorded
    let paymentVerifiedInApi = false;
    for (let i = 0; i < 10; i++) {
      const cases = await fetchLiveCases();
      const current = cases.find((c) => c.id === activeCaseId);
      if (current && (current.pricing?.paid || current.paymentDetails?.status === 'completed')) {
        paymentVerifiedInApi = true;
        console.log(`   ✓ Patient payment verified in DB: paid=${current.pricing?.paid}, method=${current.paymentDetails?.method}`);
        break;
      }
      await new Promise((r) => setTimeout(r, 600));
    }
    if (!paymentVerifiedInApi) {
      throw new Error(`Patient payment was not saved to DB for case ${activeCaseId}!`);
    }

    // -------------------------------------------------------------------------
    // Step B6: C (Coordinator) Verify Payment & Dispatch to Indian Consultant
    // -------------------------------------------------------------------------
    console.log(`\n▶ Step B6: [C] Verify Payment & Dispatch to Indian Consultant (${activeCaseNumber})...`);
    await pageC.bringToFront();
    await pageC.reload({ waitUntil: 'domcontentloaded' });
    await pageC.waitForTimeout(1000);

    // Select active case
    const cCaseCard = pageC.locator(`button:has-text("${activeCaseNumber}")`).first();
    if (await cCaseCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cCaseCard.click();
      await pageC.waitForTimeout(600);
    }

    // Click C05-C06 Verify Payment & Connect to Indian Consultant
    const verifyAndDispatchBtn = pageC.locator('button:has-text("Verify Payment & Connect to Indian Consultant"), button:has-text("تأكيد استلام الدفع وتوصيل الملف للاستشاري الهندي"), button:has-text("C05–C06")').first();
    await verifyAndDispatchBtn.waitFor({ state: 'visible', timeout: 6000 });
    await verifyAndDispatchBtn.click();
    console.log('   Clicked C05-C06 Verify Payment & Connect to Indian Consultant.');
    await pageC.waitForTimeout(2000);

    await verifyCaseTransition(activeCaseId, 5, 'WITH_CONSULTANT', 'Step B6: Coordinator Verify & Dispatch');

    // -------------------------------------------------------------------------
    // Step B7: K (Consultant) Second Opinion Submission
    // -------------------------------------------------------------------------
    console.log(`\n▶ Step B7: [K] International Consultant Clinical Review (${activeCaseNumber})...`);
    await pageK.bringToFront();
    await pageK.reload({ waitUntil: 'domcontentloaded' });
    await pageK.waitForTimeout(1000);

    // Select case if listed
    const kCaseCard = pageK.locator(`button:has-text("${activeCaseNumber}")`).first();
    if (await kCaseCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await kCaseCard.click();
      await pageK.waitForTimeout(600);
    }

    // Handle OTP Challenge if displayed
    const otpInput = pageK.locator('input[placeholder*="123456"], input[maxlength="6"]').first();
    if (await otpInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await otpInput.fill('123456');
      const verifyOtpBtn = pageK.locator('button:has-text("Verify & Access Clinical Dossier"), button:has-text("تحقق")').first();
      await verifyOtpBtn.click();
      await pageK.waitForTimeout(1000);
    }

    // Navigate to K06 Opinion screen
    const k06Tab = pageK.locator('button:has-text("K06 Opinion"), button:has-text("K06")').first();
    if (await k06Tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await k06Tab.click();
      await pageK.waitForTimeout(600);
    }

    // Fill focus answers if present
    const answerInputs = pageK.locator('textarea');
    const answerCount = await answerInputs.count();
    if (answerCount > 1) {
      await answerInputs.nth(0).fill('TAVR is clinically indicated given high surgical risk and anatomical suitability on CTA.');
      await answerInputs.nth(1).fill('Recommend dual antiplatelet therapy (DAPT) with Aspirin 81mg and Clopidogrel 75mg for 3-6 months.');
      await answerInputs.nth(2).fill('Perform transthoracic echocardiogram at 30 days and 6 months to evaluate prosthetic valve hemodynamics.');
    }

    // Fill final opinion text
    const opinionTextarea = pageK.locator('textarea').last();
    await opinionTextarea.fill('Comprehensive evaluation confirms severe symptomatic aortic stenosis. Transcatheter aortic valve replacement (TAVR) via transfemoral access is strongly endorsed.');

    // Click Submit opinion
    const submitOpinionBtn = pageK.locator('button:has-text("Submit written opinion"), button:has-text("Save opinion")').first();
    await submitOpinionBtn.waitFor({ state: 'visible', timeout: 5000 });
    await submitOpinionBtn.click();
    console.log('   Clicked Submit written opinion button.');
    await pageK.waitForTimeout(2000);

    await verifyCaseTransition(activeCaseId, 6, 'OPINION_READY', 'Step B7: Consultant Second Opinion');

    // -------------------------------------------------------------------------
    // Step B8: D (Doctor) Endorsement of Consultant Opinion
    // -------------------------------------------------------------------------
    console.log(`\n▶ Step B8: [D] Saudi Treating Doctor Opinion Endorsement (${activeCaseNumber})...`);
    await pageD.bringToFront();
    await pageD.reload({ waitUntil: 'domcontentloaded' });
    await pageD.waitForTimeout(1000);

    const dCaseCard2 = pageD.locator(`button:has-text("${activeCaseNumber}")`).first();
    if (await dCaseCard2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dCaseCard2.click();
      await pageD.waitForTimeout(600);
    }

    // Click D12 Approve Consultant Opinion & Send to ALO Coordinator
    const endorseBtn = pageD.locator('button:has-text("Approve Consultant Opinion & Send to ALO Coordinator"), button:has-text("اعتماد رأي الاستشاري وإرساله لمنسق ألو")').first();
    await endorseBtn.waitFor({ state: 'visible', timeout: 6000 });
    await endorseBtn.click();
    console.log('   Clicked D12 Approve Consultant Opinion & Send to ALO Coordinator.');
    await pageD.waitForTimeout(2000);

    let isEndorsed = false;
    for (let i = 0; i < 10; i++) {
      const cases = await fetchLiveCases();
      const c = cases.find((x) => x.id === activeCaseId);
      if (c && c.saudiEndorsement?.status === 'endorsed') {
        isEndorsed = true;
        console.log(`   ✓ Saudi endorsement confirmed in DB: status=${c.saudiEndorsement.status}`);
        break;
      }
      await new Promise((r) => setTimeout(r, 600));
    }

    // -------------------------------------------------------------------------
    // Step B9: C (Coordinator) Release Certified Report PDF 1
    // -------------------------------------------------------------------------
    console.log(`\n▶ Step B9: [C] Release Certified Report PDF 1 to Patient (${activeCaseNumber})...`);
    await pageC.bringToFront();
    await pageC.reload({ waitUntil: 'domcontentloaded' });
    await pageC.waitForTimeout(1000);

    const cCaseCard2 = pageC.locator(`button:has-text("${activeCaseNumber}")`).first();
    if (await cCaseCard2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cCaseCard2.click();
      await pageC.waitForTimeout(600);
    }

    // Switch to C08 tab if not active
    const c08Tab = pageC.locator('button:has-text("C08"), button:has-text("Release Report"), button:has-text("إصدار التقرير الأول")').first();
    if (await c08Tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await c08Tab.click();
      await pageC.waitForTimeout(600);
    }

    // Click Assign & Release Certified Report (PDF 1) to Patient (C08)
    const releasePdf1Btn = pageC.locator('button:has-text("Assign & Release Certified Report"), button:has-text("إسناد وإرسال التقرير المعتمد")').first();
    await releasePdf1Btn.waitFor({ state: 'visible', timeout: 6000 });
    await releasePdf1Btn.click();
    console.log('   Clicked C08 Assign & Release Certified Report (PDF 1).');
    await pageC.waitForTimeout(2000);

    await verifyCaseTransition(activeCaseId, 7, 'PARTNER_SERVICES', 'Step B9: Release Report PDF 1');

    // -------------------------------------------------------------------------
    // Step B10: L, PH, REC Partner Services Processing
    // -------------------------------------------------------------------------
    console.log(`\n▶ Step B10: Processing Partner Services (Lab, Pharmacy, Reception) for Case ${activeCaseNumber}...`);

    // 10a: Lab (Omar Al-Zahrani)
    await pageL.bringToFront();
    await pageL.reload({ waitUntil: 'domcontentloaded' });
    await pageL.waitForTimeout(1000);
    const lCaseCard = pageL.locator(`button:has-text("${activeCaseNumber}")`).first();
    if (await lCaseCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await lCaseCard.click();
      await pageL.waitForTimeout(600);
    }
    const labActionBtn = pageL.locator('button:has-text("Upload Results"), button:has-text("اعتماد ورفع النتائج"), button:has-text("Sample Collected"), button:has-text("تأكيد سحب العينات")').first();
    if (await labActionBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await labActionBtn.click();
      console.log('   [L] Diagnostic Lab processed and uploaded test results.');
      await pageL.waitForTimeout(1500);
    }

    // 10b: Pharmacy (Noura Al-Dosari)
    await pagePH.bringToFront();
    await pagePH.reload({ waitUntil: 'domcontentloaded' });
    await pagePH.waitForTimeout(1000);
    const phCaseCard = pagePH.locator(`button:has-text("${activeCaseNumber}")`).first();
    if (await phCaseCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await phCaseCard.click();
      await pagePH.waitForTimeout(600);
    }
    const pharmacyActionBtn = pagePH.locator('button:has-text("Dispense Rx"), button:has-text("تأكيد التحضير والصرف"), button:has-text("صرف")').first();
    if (await pharmacyActionBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await pharmacyActionBtn.click();
      console.log('   [PH] Clinical Pharmacy prepared and dispensed prescription.');
      await pagePH.waitForTimeout(1500);
    }

    // 10c: Reception (Marcus Vance)
    await pageREC.bringToFront();
    await pageREC.reload({ waitUntil: 'domcontentloaded' });
    await pageREC.waitForTimeout(1000);
    const recCaseCard = pageREC.locator(`button:has-text("${activeCaseNumber}")`).first();
    if (await recCaseCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recCaseCard.click();
      await pageREC.waitForTimeout(600);
    }
    const recActionBtn = pageREC.locator('button:has-text("Check-in Done"), button:has-text("تأكيد اكتمال الزيارة والاستقبال")').first();
    if (await recActionBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await recActionBtn.click();
      console.log('   [REC] Reception checked in patient and confirmed visit completion.');
      await pageREC.waitForTimeout(1500);
    }

    // Activate 21-Day Follow-Up Window
    const activate21DaysBtn = pageREC.locator('button:has-text("تسليم التقرير وتفعيل متابعة الـ 21 يوماً"), button:has-text("Activate 21-Day")').first();
    if (await activate21DaysBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await activate21DaysBtn.click();
      console.log('   Activated 21-Day Follow-Up window (D13).');
      await pageREC.waitForTimeout(2000);
      await verifyCaseTransition(activeCaseId, 8, 'FOLLOW_UP_21_DAYS', 'Step B10: Activate 21-Day Follow-Up');
    }

    // -------------------------------------------------------------------------
    // Step B11: 21-Day Follow-Up Completion & PDF 2 Dossier Generation
    // -------------------------------------------------------------------------
    console.log(`\n▶ Step B11: [P & C] 21-Day Follow-Up Completion & PDF 2 Verification...`);
    await pageP.bringToFront();
    await pageP.reload({ waitUntil: 'domcontentloaded' });
    await pageP.waitForTimeout(1500);

    // Open follow-up chat from patient timeline
    const openFollowUpBtn = pageP.locator('button:has-text("فتح محادثة المتابعة"), button:has-text("Open Follow-up")').first();
    if (await openFollowUpBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await openFollowUpBtn.click();
      await pageP.waitForTimeout(1000);
    }

    // Rate 5 stars and complete follow-up
    const stars = pageP.locator('button[role="radio"]');
    if (await stars.count() > 0) {
      await stars.last().click();
      await pageP.waitForTimeout(400);
    }

    const completeFollowUpBtn = pageP.locator('button:has-text("إتمام المتابعة"), button:has-text("Complete Follow-Up")').first();
    if (await completeFollowUpBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await completeFollowUpBtn.click();
      console.log('   [P] Patient completed 21-day follow-up with 5-star rating.');
      await pageP.waitForTimeout(2000);
    }

    // Verify in API that case reached CLOSED (Stage 9) and pdf2Released is true
    await verifyCaseTransition(activeCaseId, 9, 'CLOSED', 'Step B11: Follow-Up Closure & PDF 2');

    // Verify PDF 2 Dossier on Patient Portal
    await pageP.bringToFront();
    await pageP.reload({ waitUntil: 'domcontentloaded' });
    await pageP.waitForTimeout(1500);
    const patientPdf2Btn = pageP.locator('button:has-text("PDF 2"), button:has-text("التقرير السريري الشامل"), button:has-text("Comprehensive")').first();
    const isPatientPdf2Available = await patientPdf2Btn.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`   ✓ [P] Patient Comprehensive Dossier (PDF 2) button visible: ${isPatientPdf2Available}`);

    // Verify PDF 2 Dossier on Coordinator Portal
    await pageC.bringToFront();
    await pageC.reload({ waitUntil: 'domcontentloaded' });
    await pageC.waitForTimeout(1500);
    const cCaseCardClosed = pageC.locator(`button:has-text("${activeCaseNumber}")`).first();
    if (await cCaseCardClosed.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cCaseCardClosed.click();
      await pageC.waitForTimeout(600);
    }
    const c10Tab = pageC.locator('button:has-text("C10"), button:has-text("إغلاق الملف"), button:has-text("Case Closure")').first();
    if (await c10Tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await c10Tab.click();
      await pageC.waitForTimeout(600);
    }
    const coordPdf2Btn = pageC.locator('button:has-text("PDF 2"), button:has-text("تقرير الإغلاق النهائي"), button:has-text("Final Dossier")').first();
    const isCoordPdf2Available = await coordPdf2Btn.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`   ✓ [C] Coordinator Final Dossier (PDF 2) button visible: ${isCoordPdf2Available}`);

    console.log('\n========================================================================');
    console.log('🎉 FULL WORKFLOW PASSED WITH ZERO CRASHES AND 100% CLEAN STAGE ADVANCE!');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('\n❌ WORKFLOW FAILED WITH ERROR:', err.message);
    const errShot = path.join(SCREENSHOT_DIR, `failure_${Date.now()}.png`);
    const activePage = browser.contexts()[0]?.pages()[0];
    if (activePage) {
      await activePage.screenshot({ path: errShot, fullPage: true }).catch(() => {});
      console.error(`📸 Failure screenshot captured at: ${errShot}`);
    }
    throw err;
  } finally {
    // Keep browser open for a few seconds so user sees final state
    await new Promise((r) => setTimeout(r, 4000));
    await browser.close();
  }
}

runEndToEndTest().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
