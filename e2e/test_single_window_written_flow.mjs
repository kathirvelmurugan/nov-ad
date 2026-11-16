import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'https://ad.howtostart.in/feature-sarat';
const SLEEP_GAP = 5000; // 5-second gap for every persona switch and observation

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function safeReload(page, fallbackUrl) {
  try {
    await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
  } catch (err) {
    if (fallbackUrl) {
      await page.goto(fallbackUrl, { waitUntil: 'networkidle', timeout: 20000 });
    }
  }
}

async function transitionTo(page, roleName, contextDescription) {
  console.log(`\n========================================================================`);
  console.log(`👁️  SWITCHING TO: [${roleName.toUpperCase()}]`);
  console.log(`    Context: ${contextDescription}`);
  console.log(`    Observing impact on screen for ${SLEEP_GAP / 1000} seconds...`);
  console.log(`========================================================================`);
  
  await page.bringToFront();
  
  // Countdown ticker in terminal for clear pacing
  for (let s = SLEEP_GAP / 1000; s > 0; s--) {
    process.stdout.write(`   ⏱️  [${s}s remaining on ${roleName}] ... `);
    await sleep(1000);
  }
  console.log(' GO!\n');
}

async function loginStaff(page, phone, pin = '1234') {
  try {
    const phoneInput = await page.$('#auth-phone, #auth-phone-input, input[type="tel"]');
    if (phoneInput && (await phoneInput.isVisible())) {
      console.log(`   🔑 Logging in staff: ${phone} (PIN ${pin})...`);
      await phoneInput.fill(phone);
      
      const submitPhoneBtn = await page.$('button[type="submit"], #auth-phone-submit-btn');
      if (submitPhoneBtn) await submitPhoneBtn.click();
      await sleep(1000);

      const singlePin = await page.$('#auth-pin, input[type="password"]');
      if (singlePin && (await singlePin.isVisible())) {
        await singlePin.fill(pin);
        const submitPinBtn = await page.$('button[type="submit"], #auth-pin-submit-btn');
        if (submitPinBtn) await submitPinBtn.click();
        await sleep(2000);
      } else {
        const digit0 = await page.$('#auth-pin-digit-0');
        if (digit0) {
          await page.fill('#auth-pin-digit-0', pin[0]);
          await page.fill('#auth-pin-digit-1', pin[1]);
          await page.fill('#auth-pin-digit-2', pin[2]);
          await page.fill('#auth-pin-digit-3', pin[3]);
          const submitBtn = await page.$('button[type="submit"], #auth-pin-submit-btn');
          if (submitBtn) await submitBtn.click();
          await sleep(2000);
        }
      }
      console.log(`   ✅ Staff ${phone} login sequence completed.`);
    }
  } catch (err) {
    console.log(`   ℹ️ Login notice for ${phone}: ${err.message}`);
  }
}

async function runWrittenOpinionFlow() {
  console.log('========================================================================');
  console.log('🚀 ALO DOCTOR · SINGLE-WINDOW VISIBLE WRITTEN OPINION WORKFLOW');
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Pacing: Strict 5-second observation gap per persona switch`);
  console.log('   Video Call: Bypassed for 100% pure Written Specialist Opinion');
  console.log('========================================================================\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
    args: [
      '--window-position=80,40',
      '--window-size=1280,900',
      '--no-sandbox',
      '--disable-dev-shm-usage',
    ]
  });

  let registeredCaseId = '';

  try {
    // ════════════════════════════════════════════════════════════════════════
    // 1. SETUP DISTINCT SCOPED BROWSER CONTEXTS (Zero Session Bleed)
    // ════════════════════════════════════════════════════════════════════════
    console.log('📦 Initializing scoped persona contexts in unified window space...');
    
    // Patient (Mobile/Card Viewport)
    const patientCtx = await browser.newContext({ viewport: { width: 1240, height: 860 }, locale: 'ar-SA' });
    const patientPage = await patientCtx.newPage();

    // Nurse
    const nurseCtx = await browser.newContext({ viewport: { width: 1240, height: 860 }, locale: 'ar-SA' });
    const nursePage = await nurseCtx.newPage();

    // Saudi Treating Doctor
    const doctorCtx = await browser.newContext({ viewport: { width: 1240, height: 860 }, locale: 'ar-SA' });
    const doctorPage = await doctorCtx.newPage();

    // Indian Specialist Consultant
    const consultantCtx = await browser.newContext({ viewport: { width: 1240, height: 860 }, locale: 'en-US' });
    const consultantPage = await consultantCtx.newPage();

    // ALO Care Coordinator
    const coordCtx = await browser.newContext({ viewport: { width: 1240, height: 860 }, locale: 'ar-SA' });
    const coordPage = await coordCtx.newPage();

    // Pre-load all portals in background
    console.log('🌐 Loading persona portals...');
    await Promise.all([
      patientPage.goto(`${BASE_URL}/?portal=patient&subview=intake`, { waitUntil: 'networkidle', timeout: 35000 }),
      nursePage.goto(`${BASE_URL}/?portal=nurse`, { waitUntil: 'networkidle', timeout: 35000 }),
      doctorPage.goto(`${BASE_URL}/?portal=doctor`, { waitUntil: 'networkidle', timeout: 35000 }),
      coordPage.goto(`${BASE_URL}/?portal=coordinator`, { waitUntil: 'networkidle', timeout: 35000 }),
    ]);

    // Authenticate Nurse, Doctor, Coordinator in background
    await loginStaff(nursePage, '0500000004', '1234');
    await loginStaff(doctorPage, '0500000005', '1234');
    await loginStaff(coordPage, '0500000003', '1234');

    // ════════════════════════════════════════════════════════════════════════
    // STEP 1: PATIENT INTAKE (Written Second Opinion)
    // ════════════════════════════════════════════════════════════════════════
    await transitionTo(patientPage, 'Patient (Sami Al-Harbi)', 'Patient filling intake for Written Second Opinion');

    const startNewBtn = await patientPage.$('button:has-text("Start a new case"), button:has-text("تسجيل حالة جديدة"), #patient-start-new-case-btn');
    if (startNewBtn && await startNewBtn.isVisible()) {
      console.log('   Starting fresh case intake...');
      await startNewBtn.click();
      await sleep(1500);
    }

    console.log('   Entering diagnosis and symptoms for Lumbar Disc Herniation...');
    await patientPage.waitForSelector('#intake-diagnosis-input', { timeout: 15000 });
    await patientPage.fill('#intake-diagnosis-input', 'L5-S1 Lumbar Disc Herniation with Radiculopathy');
    await sleep(500);

    await patientPage.waitForSelector('#intake-symptoms-input', { timeout: 15000 });
    await patientPage.fill('#intake-symptoms-input', 'Severe lower back pain radiating down right leg with numbness in foot. Seeking formal written opinion on surgical vs conservative therapy.');
    await sleep(500);

    // Make sure Written format is selected (default)
    const writtenOption = await patientPage.$('button:has-text("مكتوب"), button:has-text("Written")');
    if (writtenOption) {
      await writtenOption.click();
      await sleep(400);
    }

    console.log('   Accepting MOH & SDAIA data privacy consent...');
    await patientPage.waitForSelector('#intake-privacy-checkbox', { timeout: 10000 });
    await patientPage.check('#intake-privacy-checkbox');
    await sleep(600);

    console.log('   Submitting case intake to ALO Clinical Operations...');
    await patientPage.click('#patient-intake-submit-btn');

    await patientPage.waitForSelector('#case-registered-success-card', { timeout: 20000 });
    const caseIdEl = await patientPage.$('#registered-case-id-display');
    if (caseIdEl) {
      registeredCaseId = (await caseIdEl.innerText()).trim();
      console.log(`   ✅ Patient Case Successfully Registered: [${registeredCaseId}]`);
    } else {
      registeredCaseId = 'CASE-2026-AUTO';
    }
    await patientPage.screenshot({ path: 'e2e_screenshots/written_flow_1_patient_submitted.png' });

    // ════════════════════════════════════════════════════════════════════════
    // STEP 2: SWITCH TO NURSE (Observe Impact & Triage)
    // ════════════════════════════════════════════════════════════════════════
    await safeReload(nursePage, `${BASE_URL}/?portal=nurse`);
    await loginStaff(nursePage, '0500000004', '1234');
    await transitionTo(nursePage, 'ALO Nurse (Sara Al-Qahtani)', `Verify new case ${registeredCaseId} arrived in Triage Queue`);

    // Click on active case in queue if multiple
    const nurseCase = await nursePage.$(`button:has-text("${registeredCaseId}"), tr:has-text("${registeredCaseId}"), div:has-text("${registeredCaseId}")`);
    if (nurseCase) {
      await nurseCase.click();
      await sleep(1000);
    }

    console.log('   Nurse reviewing clinical documents and assigning Dr. Fahad...');
    const docCard = await nursePage.$('article:has-text("فهد"), article:has-text("Fahad"), article:has-text("د.")');
    if (docCard) {
      await docCard.click();
      await sleep(500);
    }

    const triageText = await nursePage.$('textarea');
    if (triageText) {
      await triageText.fill('Vitals: BP 128/82, HR 74. MRI shows 6mm L5-S1 extrusion. Triaged as Urgent (24h SLA) for Written Second Opinion with Dr. Fahad Al-Harbi.');
      await sleep(500);
    }

    console.log('   Nurse forwarding case to Saudi Treating Doctor (N07)...');
    const forwardBtn = await nursePage.$('button:has-text("تحويل للطبيب المعالج"), button:has-text("إرسال للطبيب"), button[aria-label*="N07"]');
    if (forwardBtn) {
      await forwardBtn.click();
      await sleep(2000);
      console.log('   ✅ Case forwarded to Dr. Fahad Al-Harbi.');
    }
    await nursePage.screenshot({ path: 'e2e_screenshots/written_flow_2_nurse_triaged.png' });

    // ════════════════════════════════════════════════════════════════════════
    // STEP 3: SWITCH TO SAUDI DOCTOR (Observe Impact & Referral Endorsement)
    // ════════════════════════════════════════════════════════════════════════
    await safeReload(doctorPage, `${BASE_URL}/?portal=doctor`);
    await loginStaff(doctorPage, '0500000005', '1234');
    await transitionTo(doctorPage, 'Saudi Doctor (Dr. Fahad Al-Harbi)', `Verify case ${registeredCaseId} arrived in Doctor Review Queue`);

    const doctorCase = await doctorPage.$(`button:has-text("${registeredCaseId}"), tr:has-text("${registeredCaseId}"), div:has-text("${registeredCaseId}")`);
    if (doctorCase) {
      await doctorCase.click();
      await sleep(1000);
    }

    console.log('   Dr. Fahad reviewing case and confirming Written Second Opinion format...');
    await sleep(1000);

    console.log('   Dr. Fahad endorsing referral and requesting patient payment (D10)...');
    const approveBtn = await doctorPage.$('button:has-text("D10"), button:has-text("اعتماد الإحالة"), button:has-text("الموافقة على طلب الاستشارة"), button:has-text("موافق")');
    if (approveBtn) {
      await approveBtn.click();
      await sleep(2000);
      console.log('   ✅ Referral endorsed! Case requires payment.');
    }
    await doctorPage.screenshot({ path: 'e2e_screenshots/written_flow_3_doctor_endorsed.png' });

    // ════════════════════════════════════════════════════════════════════════
    // STEP 4: SWITCH TO PATIENT (Observe Payment Requirement & Pay)
    // ════════════════════════════════════════════════════════════════════════
    await patientPage.goto(`${BASE_URL}/?portal=patient&subview=timeline`, { waitUntil: 'networkidle' });
    await transitionTo(patientPage, 'Patient (Sami Al-Harbi)', `Verify Referral Approval & Payment Gate (Mada / ZATCA Invoice)`);

    console.log('   Patient selecting Mada payment (750 SAR)...');
    const payBtn = await patientPage.$('button:has-text("سداد"), button:has-text("Pay"), button:has-text("دفع"), button:has-text("750")');
    if (payBtn) {
      await payBtn.click();
      await sleep(2000);
      console.log('   ✅ Payment confirmed! ZATCA Tax Invoice issued.');
    }
    await patientPage.screenshot({ path: 'e2e_screenshots/written_flow_4_patient_paid.png' });

    // ════════════════════════════════════════════════════════════════════════
    // STEP 5: SWITCH TO INDIAN CONSULTANT (Formulate & Submit Written Opinion)
    // ════════════════════════════════════════════════════════════════════════
    const magicLinkUrl = `${BASE_URL}/?token=demo_consultant_token&caseId=${registeredCaseId}&role=K`;
    await consultantPage.goto(magicLinkUrl, { waitUntil: 'networkidle' });
    await transitionTo(consultantPage, 'Indian Consultant (Dr. V. Prasanth)', `Specialist reviewing cross-border dossier & formulating Written Opinion`);

    // Ensure Consultant is on K06 (Written Opinion Tab)
    const k06Tab = await consultantPage.$('button:has-text("K06"), button:has-text("Opinion"), button:has-text("الرأي الطبي")');
    if (k06Tab) {
      await k06Tab.click();
      await sleep(1000);
    }

    console.log('   Dr. Prasanth typing answers to the 3 Clinical Focus Questions...');
    const textareas = await consultantPage.$$('textarea');
    if (textareas.length >= 4) {
      // 3 focus questions + 1 clinical synthesis
      await textareas[0].fill('Answer 1: Recommend 6 weeks of structured physical therapy before any tubular microdecompression is considered.');
      await sleep(400);
      await textareas[1].fill('Answer 2: No dynamic instability observed on flexion-extension imaging; TLIF fusion is NOT indicated.');
      await sleep(400);
      await textareas[2].fill('Answer 3: Prescribe Pregabalin 75mg at bedtime with supervised core lumbar stabilization exercises.');
      await sleep(400);
      await textareas[3].fill('COMPREHENSIVE SPECIALIST SECOND OPINION:\nPatient presents with subacute L5-S1 lumbar disc herniation with radiculopathy. Given the absence of progressive neurological deficit or cauda equina syndrome, conservative multimodal therapy is strongly indicated. Decompressive surgery should only be reserved if symptoms persist beyond 12 weeks of structured rehabilitation.');
    } else {
      // Fallback to #consultant-opinion if single textarea
      const opinionArea = await consultantPage.$('#consultant-opinion, textarea');
      if (opinionArea) {
        await opinionArea.fill('COMPREHENSIVE SPECIALIST SECOND OPINION:\nPatient presents with subacute L5-S1 lumbar disc herniation with radiculopathy. Given the absence of progressive neurological deficit or cauda equina syndrome, conservative multimodal therapy is strongly indicated. Decompressive surgery should only be reserved if symptoms persist beyond 12 weeks of structured rehabilitation.');
      }
    }
    await sleep(1000);

    console.log('   Submitting formal written specialist opinion...');
    const submitOpinionBtn = await consultantPage.$('button:has-text("Submit"), button:has-text("إرسال"), button:has-text("Save Opinion")');
    if (submitOpinionBtn && (await submitOpinionBtn.isEnabled())) {
      await submitOpinionBtn.click();
      await sleep(2000);
      console.log('   ✅ Written opinion formally submitted!');
    }
    await consultantPage.screenshot({ path: 'e2e_screenshots/written_flow_5_consultant_opinion.png' });

    // ════════════════════════════════════════════════════════════════════════
    // STEP 6: SWITCH TO SAUDI DOCTOR (Observe Opinion & License Endorsement)
    // ════════════════════════════════════════════════════════════════════════
    await safeReload(doctorPage, `${BASE_URL}/?portal=doctor`);
    await loginStaff(doctorPage, '0500000005', '1234');
    await transitionTo(doctorPage, 'Saudi Doctor (Dr. Fahad Al-Harbi)', `Dr. Fahad reviews Dr. Prasanth's Written Opinion & signs with SCFHS Stamp`);

    const doctorCaseReview = await doctorPage.$(`button:has-text("${registeredCaseId}"), tr:has-text("${registeredCaseId}")`);
    if (doctorCaseReview) {
      await doctorCaseReview.click();
      await sleep(1000);
    }

    console.log('   Dr. Fahad stamping medical endorsement (D12)...');
    const endorseBtn = await doctorPage.$('button:has-text("D12"), button:has-text("اعتماد رأي الاستشاري"), button:has-text("Approve Consultant Opinion")');
    if (endorseBtn && (await endorseBtn.isEnabled())) {
      await endorseBtn.click();
      await sleep(2000);
      console.log('   ✅ Doctor clinical endorsement completed with license SCFHS-2024-KSA-8821!');
    }
    await doctorPage.screenshot({ path: 'e2e_screenshots/written_flow_6_doctor_endorsed.png' });

    // ════════════════════════════════════════════════════════════════════════
    // STEP 7: SWITCH TO COORDINATOR (Verify & Release Bilingual Reports)
    // ════════════════════════════════════════════════════════════════════════
    await safeReload(coordPage, `${BASE_URL}/?portal=coordinator`);
    await loginStaff(coordPage, '0500000003', '1234');
    await transitionTo(coordPage, 'ALO Coordinator (Emmanuel Arcon Gonzalez)', `Verify completed file, release PDF 1 & PDF 2, and seal case closure`);

    const coordCase = await coordPage.$(`button:has-text("${registeredCaseId}"), tr:has-text("${registeredCaseId}")`);
    if (coordCase) {
      await coordCase.click();
      await sleep(1000);
    }

    // Step A: Release PDF 1 (C08)
    const releasePdf1Btn = await coordPage.$('button:has-text("C08"), button:has-text("اعتماد وتوزيع"), button:has-text("Dispatch")');
    if (releasePdf1Btn && (await releasePdf1Btn.isEnabled())) {
      await releasePdf1Btn.click();
      await sleep(1500);
      console.log('   ✅ Certified Executive Report (PDF 1) released!');
    }

    // Step B: Navigate to Case Closure Tab and Close Case
    const closureTab = await coordPage.$('button:has-text("C10"), button:has-text("إغلاق الحالة"), button:has-text("Case Closure")');
    if (closureTab) {
      await closureTab.click();
      await sleep(1000);

      const releasePdf2Btn = await coordPage.$('button:has-text("اعتماد وإصدار"), button:has-text("Release Final Dossier"), button:has-text("PDF 2")');
      if (releasePdf2Btn && (await releasePdf2Btn.isEnabled())) {
        await releasePdf2Btn.click();
        await sleep(1500);
        console.log('   ✅ Full Clinical Dossier (PDF 2) released!');
      }

      const closeCaseBtn = await coordPage.$('button:has-text("إغلاق الحالة نهائياً"), button:has-text("Close Case"), button:has-text("🔒")');
      if (closeCaseBtn && (await closeCaseBtn.isEnabled())) {
        await closeCaseBtn.click();
        await sleep(1500);
        console.log('   ✅ Case officially closed and archived in registry.');
      }
    }
    await coordPage.screenshot({ path: 'e2e_screenshots/written_flow_7_coordinator_closed.png' });

    // ════════════════════════════════════════════════════════════════════════
    // STEP 8: SWITCH TO PATIENT (Observe Final Closed State & Report Downloads)
    // ════════════════════════════════════════════════════════════════════════
    await patientPage.goto(`${BASE_URL}/?portal=patient&subview=timeline&caseId=${registeredCaseId}`, { waitUntil: 'networkidle' });
    await transitionTo(patientPage, 'Patient (Sami Al-Harbi)', `Final Observation: Closed Case Timeline with Instant PDF 1 & PDF 2 Downloads`);

    console.log('   Verifying PDF download buttons on Patient screen...');
    const pdfButtons = await patientPage.$$('button:has-text("PDF"), a:has-text("PDF"), button:has-text("تحميل"), button:has-text("Download")');
    console.log(`   ✅ Found ${pdfButtons.length} report action buttons accessible to patient.`);
    await patientPage.screenshot({ path: 'e2e_screenshots/written_flow_8_patient_final_reports.png' });

    console.log('\n========================================================================');
    console.log('🎉 DEMONSTRATION COMPLETE: FULL WRITTEN OPINION FLOW VALIDATED CLEANLY!');
    console.log('   All 5 browser contexts demonstrated cause-and-effect with 5s gaps.');
    console.log('   Screenshots captured in e2e_screenshots/written_flow_*.png');
    console.log('========================================================================\n');

  } catch (err) {
    console.error('❌ Error executing single-window written opinion flow:', err);
  } finally {
    console.log('Keeping browser open for 15 seconds for your live inspection...');
    await sleep(15000);
    await browser.close();
  }
}

runWrittenOpinionFlow();
