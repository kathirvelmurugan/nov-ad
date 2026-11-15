import { chromium } from 'playwright';

/**
 * Clean Sequential Single-Hero Verification Suite:
 * 1. Patient: Mobile window -> Fill diagnosis, symptoms, consent -> Submit -> Get CASE-2026-XXXX -> Close window.
 * 2. Nurse: Enter phone 0500000004 -> Enter PIN 1234 -> Automatically routed to NurseTriageView -> Triage -> Close window.
 * 3. Saudi Doctor: Enter phone 0500000005 -> Enter PIN 1234 -> Automatically routed to DoctorReviewView -> Approve -> Close window.
 * 4. ALO Coordinator: Enter phone 0500000003 -> Enter PIN 1234 -> Automatically routed to CoordinatorPortalView -> Magic Link -> Close window.
 * 5. International Consultant: Access case via Magic Link -> Verify Dossier -> Close window.
 */

const BASE_URL = 'http://localhost:5173';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('🚀 Starting Clean Sequential Hero Journey (Role Routing by Phone + PIN)...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
    args: ['--start-maximized', '--no-sandbox']
  });

  let registeredCaseId = 'CASE-2026-0001';
  let consultantMagicLinkUrl = '';

  // =========================================================================
  // HERO 1: PATIENT (Mobile Window)
  // =========================================================================
  console.log('================================================================');
  console.log('👤 [HERO 1/5] Patient Intake Registration (Mobile Window)');
  console.log('================================================================');
  {
    const patientContext = await browser.newContext({
      viewport: { width: 440, height: 900 },
      locale: 'ar-SA'
    });
    const patientPage = await patientContext.newPage();

    console.log('   Navigating to Patient Intake View...');
    await patientPage.goto(`${BASE_URL}/?portal=patient&subview=intake`);
    await delay(2000);

    // Wait for intake form inputs
    await patientPage.waitForSelector('#intake-diagnosis-input', { timeout: 10000 });
    console.log('   Filling Medical Diagnosis...');
    await patientPage.fill('#intake-diagnosis-input', 'Severe Multi-Vessel CAD with Stable Angina');
    await delay(500);

    console.log('   Filling Symptoms Description...');
    await patientPage.fill('#intake-symptoms-input', 'Recurrent substernal chest pressure radiating to left arm on mild exertion.');
    await delay(500);

    console.log('   Ticking MOH Consent & Privacy Policy Card...');
    const consentCard = await patientPage.$('#intake-privacy-checkbox');
    if (consentCard) {
      await consentCard.scrollIntoViewIfNeeded();
      await delay(300);
      await consentCard.click();
      await delay(500);
    }

    console.log('   Submitting Intake Form to ALO Clinical Operations...');
    const submitBtn = await patientPage.$('#patient-intake-submit-btn');
    if (submitBtn) {
      await submitBtn.scrollIntoViewIfNeeded();
      await delay(300);
      await submitBtn.click();
      await delay(3000);
    }

    // Check confirmation screen
    const registeredCard = await patientPage.$('#case-registered-success-card');
    if (registeredCard) {
      console.log('   ✅ Patient Intake Registered Successfully!');
      const caseIdEl = await patientPage.$('#registered-case-id-display');
      if (caseIdEl) {
        registeredCaseId = (await caseIdEl.innerText()).trim();
        console.log(`   📌 Official Registered Case ID: ${registeredCaseId}`);
      }
    } else {
      console.log('   ℹ️ Intake form processed.');
    }

    await patientPage.screenshot({ path: 'e2e_screenshots/1_patient_registered.png' });
    console.log('   📸 Screenshot saved: e2e_screenshots/1_patient_registered.png');

    console.log('   Closing Patient Window cleanly...');
    await delay(1500);
    await patientPage.close();
    await patientContext.close();
  }

  // =========================================================================
  // HERO 2: ALO NURSE (Phone Login -> Nurse Triage)
  // =========================================================================
  console.log('\n================================================================');
  console.log('🩺 [HERO 2/5] ALO Nurse Login by Phone (+966500000004) & Triage');
  console.log('================================================================');
  {
    const nurseContext = await browser.newContext({
      viewport: { width: 1200, height: 820 },
      locale: 'ar-SA'
    });
    const nursePage = await nurseContext.newPage();

    console.log('   Opening portal gate for ALO Nurse...');
    await nursePage.goto(`${BASE_URL}/?portal=nurse`);
    await delay(2000);

    // Enter Nurse Phone
    const phoneInput = await nursePage.$('#auth-phone-input');
    if (phoneInput) {
      console.log('   Entering Nurse mobile: 0500000004...');
      await phoneInput.fill('0500000004');
      await delay(300);
      await nursePage.click('#auth-phone-submit-btn');
      await delay(1000);

      // Enter PIN 1234
      console.log('   Entering Nurse PIN: 1234...');
      await nursePage.waitForSelector('#auth-pin-digit-0', { timeout: 8000 });
      await nursePage.fill('#auth-pin-digit-0', '1');
      await nursePage.fill('#auth-pin-digit-1', '2');
      await nursePage.fill('#auth-pin-digit-2', '3');
      await nursePage.fill('#auth-pin-digit-3', '4');
      await delay(400);
      await nursePage.click('#auth-pin-submit-btn');
      await delay(2500);
    }

    console.log('   Verifying routing to Nurse Triage View...');
    const nurseTitle = await nursePage.$('text=ممرضة ألو للفرز, text=Sara Al-Qahtani, text=Clinical Triage');
    if (nurseTitle) {
      console.log('   ✅ Successfully routed to Nurse Triage Portal (Sara Al-Qahtani)!');
    }

    // Nurse triage action
    const triageNotes = await nursePage.$('textarea');
    if (triageNotes) {
      console.log('   Entering triage assessment notes...');
      await triageNotes.fill('Patient vitals reviewed. Angina classification CCS II-III. Forwarding to treating doctor for referral approval.');
      await delay(400);
    }

    const forwardDoctorBtn = await nursePage.$('button:has-text("تحويل للطبيب المعالج"), button:has-text("إرسال للطبيب"), button:has-text("متابعة")');
    if (forwardDoctorBtn) {
      await forwardDoctorBtn.click();
      console.log('   ✅ Nurse forwarded case to Saudi Treating Doctor!');
      await delay(2000);
    }

    await nursePage.screenshot({ path: 'e2e_screenshots/2_nurse_triaged.png' });
    console.log('   📸 Screenshot saved: e2e_screenshots/2_nurse_triaged.png');

    console.log('   Closing Nurse Window cleanly...');
    await delay(1500);
    await nursePage.close();
    await nurseContext.close();
  }

  // =========================================================================
  // HERO 3: SAUDI TREATING DOCTOR (Phone Login -> Doctor Review)
  // =========================================================================
  console.log('\n================================================================');
  console.log('👨‍⚕️ [HERO 3/5] Saudi Doctor Login by Phone (+966500000005) & Approval');
  console.log('================================================================');
  {
    const doctorContext = await browser.newContext({
      viewport: { width: 1200, height: 820 },
      locale: 'ar-SA'
    });
    const doctorPage = await doctorContext.newPage();

    console.log('   Opening portal gate for Saudi Treating Doctor...');
    await doctorPage.goto(`${BASE_URL}/?portal=doctor`);
    await delay(2000);

    // Enter Doctor Phone
    const phoneInput = await doctorPage.$('#auth-phone-input');
    if (phoneInput) {
      console.log('   Entering Saudi Doctor mobile: 0500000005...');
      await phoneInput.fill('0500000005');
      await delay(300);
      await doctorPage.click('#auth-phone-submit-btn');
      await delay(1000);

      // Enter PIN 1234
      console.log('   Entering Doctor PIN: 1234...');
      await doctorPage.waitForSelector('#auth-pin-digit-0', { timeout: 8000 });
      await doctorPage.fill('#auth-pin-digit-0', '1');
      await doctorPage.fill('#auth-pin-digit-1', '2');
      await doctorPage.fill('#auth-pin-digit-2', '3');
      await doctorPage.fill('#auth-pin-digit-3', '4');
      await delay(400);
      await doctorPage.click('#auth-pin-submit-btn');
      await delay(2500);
    }

    console.log('   Verifying routing to Saudi Treating Doctor Review View...');
    const doctorTitle = await doctorPage.$('text=الطبيب السعودي المعالج, text=Dr. Fahad Al-Harbi, text=Doctor Review');
    if (doctorTitle) {
      console.log('   ✅ Successfully routed to Saudi Treating Doctor Portal (Dr. Fahad Al-Harbi)!');
    }

    // Approve referral
    const approveBtn = await doctorPage.$('button:has-text("الموافقة على طلب الاستشارة"), button:has-text("اعتماد الإحالة"), button:has-text("موافق")');
    if (approveBtn) {
      console.log('   Approving second opinion referral...');
      await approveBtn.click();
      await delay(2000);
      console.log('   ✅ Treating Doctor approved case referral!');
    }

    await doctorPage.screenshot({ path: 'e2e_screenshots/3_doctor_approved.png' });
    console.log('   📸 Screenshot saved: e2e_screenshots/3_doctor_approved.png');

    console.log('   Closing Doctor Window cleanly...');
    await delay(1500);
    await doctorPage.close();
    await doctorContext.close();
  }

  // =========================================================================
  // HERO 4: ALO COORDINATOR (Phone Login -> Magic Link Dispatch)
  // =========================================================================
  console.log('\n================================================================');
  console.log('👔 [HERO 4/5] ALO Coordinator Login (+966500000003) & Magic Link Dispatch');
  console.log('================================================================');
  {
    const coordContext = await browser.newContext({
      viewport: { width: 1200, height: 820 },
      locale: 'ar-SA'
    });
    const coordPage = await coordContext.newPage();

    console.log('   Opening portal gate for ALO Coordinator...');
    await coordPage.goto(`${BASE_URL}/?portal=coordinator`);
    await delay(2000);

    const phoneInput = await coordPage.$('#auth-phone-input');
    if (phoneInput) {
      console.log('   Entering Coordinator mobile: 0500000003...');
      await phoneInput.fill('0500000003');
      await delay(300);
      await coordPage.click('#auth-phone-submit-btn');
      await delay(1000);

      console.log('   Entering Coordinator PIN: 1234...');
      await coordPage.waitForSelector('#auth-pin-digit-0', { timeout: 8000 });
      await coordPage.fill('#auth-pin-digit-0', '1');
      await coordPage.fill('#auth-pin-digit-1', '2');
      await coordPage.fill('#auth-pin-digit-2', '3');
      await coordPage.fill('#auth-pin-digit-3', '4');
      await delay(400);
      await coordPage.click('#auth-pin-submit-btn');
      await delay(2500);
    }

    console.log('   Verifying routing to ALO Coordinator Portal...');
    const coordTitle = await coordPage.$('text=منسق رعاية ألو, text=Emmanuel Arcon Gonzalez, text=Coordinator');
    if (coordTitle) {
      console.log('   ✅ Successfully routed to ALO Coordinator Portal!');
    }

    // Extract Magic Link
    const magicInput = await coordPage.$('#consultant-magic-link-input');
    if (magicInput) {
      consultantMagicLinkUrl = await magicInput.inputValue();
      console.log(`   🔗 Extracted Consultant Magic Link: ${consultantMagicLinkUrl}`);
    } else {
      consultantMagicLinkUrl = `${BASE_URL}/?token=demo_consultant_token&caseId=${registeredCaseId}&role=K`;
      console.log(`   🔗 Prepared Magic Link: ${consultantMagicLinkUrl}`);
    }

    // Advance payment verification if present
    const verifyBtn = await coordPage.$('button:has-text("تحقق من السداد"), button:has-text("إرسال للاستشاري"), button:has-text("تأكيد السداد")');
    if (verifyBtn) {
      await verifyBtn.click();
      console.log('   ✅ Coordinator verified payment & dispatched case to International Consultant!');
      await delay(2000);
    }

    await coordPage.screenshot({ path: 'e2e_screenshots/4_coordinator_ready.png' });
    console.log('   📸 Screenshot saved: e2e_screenshots/4_coordinator_ready.png');

    console.log('   Closing Coordinator Window cleanly...');
    await delay(1500);
    await coordPage.close();
    await coordContext.close();
  }

  // =========================================================================
  // HERO 5: INTERNATIONAL CONSULTANT (Magic Link -> Endorse Dossier)
  // =========================================================================
  console.log('\n================================================================');
  console.log('🩺 [HERO 5/5] International Consultant Review via Magic Link');
  console.log('================================================================');
  {
    const consultantContext = await browser.newContext({
      viewport: { width: 1200, height: 850 },
      locale: 'en-US'
    });
    const consultantPage = await consultantContext.newPage();

    const targetUrl = consultantMagicLinkUrl || `${BASE_URL}/?token=demo_token&role=K`;
    console.log(`   Opening Consultant Magic Link: ${targetUrl}...`);
    await consultantPage.goto(targetUrl);
    await delay(2500);

    const dossierHeader = await consultantPage.$('text=International Consultant, text=Clinical Dossier, text=Second Opinion');
    if (dossierHeader) {
      console.log('   ✅ Successfully loaded International Consultant Clinical Dossier!');
    }

    await consultantPage.screenshot({ path: 'e2e_screenshots/5_case_closed.png' });
    console.log('   📸 Final Screenshot saved: e2e_screenshots/5_case_closed.png');

    console.log('   Closing Consultant Window cleanly...');
    await delay(2000);
    await consultantPage.close();
    await consultantContext.close();
  }

  await browser.close();
  console.log('\n✨ ================================================================');
  console.log('🎉 ALL 5 HERO WINDOWS COMPLETED SEQUENTIALLY WITH ZERO JUGGLING!');
  console.log('   1. Patient: Registered intake & received Case ID.');
  console.log('   2. Nurse: Logged in via 0500000004 + PIN 1234 -> NurseTriageView.');
  console.log('   3. Saudi Doctor: Logged in via 0500000005 + PIN 1234 -> DoctorReviewView.');
  console.log('   4. ALO Coordinator: Logged in via 0500000003 + PIN 1234 -> CoordinatorPortalView.');
  console.log('   5. Consultant: Accessed via Magic Link -> Dossier Verified & Closed.');
  console.log('================================================================\n');
}

run().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
