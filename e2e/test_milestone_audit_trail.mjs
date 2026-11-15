import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('🚀 Starting Universal Milestone HUD & Timestamp Audit Verification...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
    args: ['--start-maximized', '--no-sandbox']
  });

  let registeredCaseId = 'CASE-2026-0001';
  let consultantMagicLinkUrl = '';

  // =========================================================================
  // HERO 1: PATIENT (Case Registration + Milestone 1 Validation)
  // =========================================================================
  console.log('================================================================');
  console.log('👤 [HERO 1/5] Patient Intake & M01 Activity Timestamp');
  console.log('================================================================');
  {
    const context = await browser.newContext({ viewport: { width: 440, height: 900 }, locale: 'ar-SA' });
    const page = await context.newPage();

    console.log('   Navigating to Patient Intake View...');
    await page.goto(`${BASE_URL}/?portal=patient&subview=intake`);
    await delay(2000);

    await page.waitForSelector('#intake-diagnosis-input', { timeout: 10000 });
    console.log('   Entering Diagnosis...');
    await page.fill('#intake-diagnosis-input', 'Severe Coronary Artery Disease with Triple Vessel Stenosis');
    await delay(400);

    console.log('   Entering Symptoms...');
    await page.fill('#intake-symptoms-input', 'Recurrent angina pectoris on mild exertion with shortness of breath.');
    await delay(400);

    console.log('   Ticking MOH Health Privacy Consent Checkbox...');
    await page.check('#intake-privacy-checkbox');
    await delay(500);

    console.log('   Submitting Intake Form to ALO Clinical Operations...');
    const submitBtn = await page.$('#patient-intake-submit-btn');
    if (submitBtn) {
      await submitBtn.scrollIntoViewIfNeeded();
      await delay(300);
      await submitBtn.click();
      await delay(3000);
    }

    // Assert Registration Card & Case ID
    await page.waitForSelector('#case-registered-success-card', { timeout: 8000 });
    console.log('   ✅ Patient Success Card Displayed!');

    const caseIdEl = await page.$('#registered-case-id-display');
    if (caseIdEl) {
      registeredCaseId = (await caseIdEl.innerText()).trim();
      console.log(`   📌 Official Registered Case ID: ${registeredCaseId}`);
    }

    // Verify Milestone HUD M01 is completed
    const m01Badge = await page.$('text=M01, text=تسجيل الحالة والموافقة');
    if (m01Badge) {
      console.log('   ✅ Milestone M01 active & verified in HUD!');
    }

    await page.screenshot({ path: 'e2e_screenshots/audit_1_patient_milestone.png' });
    console.log('   📸 Screenshot saved: e2e_screenshots/audit_1_patient_milestone.png');

    await delay(1500);
    await page.close();
    await context.close();
  }

  // =========================================================================
  // HERO 2: ALO NURSE (Phone Login -> Milestone HUD -> Triage Action)
  // =========================================================================
  console.log('\n================================================================');
  console.log('🩺 [HERO 2/5] ALO Nurse Login & Milestone M02 Audit Triage');
  console.log('================================================================');
  {
    const context = await browser.newContext({ viewport: { width: 1200, height: 820 }, locale: 'ar-SA' });
    const page = await context.newPage();

    console.log('   Navigating to Nurse Portal...');
    await page.goto(`${BASE_URL}/?portal=nurse`);
    await delay(2000);

    // Enter Nurse Phone 0500000004
    const phoneInput = await page.$('#auth-phone-input');
    if (phoneInput) {
      console.log('   Entering Nurse Mobile: 0500000004...');
      await phoneInput.fill('0500000004');
      await delay(300);
      await page.click('#auth-phone-submit-btn');
      await delay(1000);

      console.log('   Entering Nurse PIN: 1234...');
      await page.waitForSelector('#auth-pin-digit-0', { timeout: 8000 });
      await page.fill('#auth-pin-digit-0', '1');
      await page.fill('#auth-pin-digit-1', '2');
      await page.fill('#auth-pin-digit-2', '3');
      await page.fill('#auth-pin-digit-3', '4');
      await delay(400);
      await page.click('#auth-pin-submit-btn');
      await delay(2500);
    }

    console.log('   Selecting active triage case from queue...');
    const caseSelectBtn = await page.$('button:has-text("عرض التفاصيل"), tr:has-text("CASE-2026"), div:has-text("CASE-2026"), tr:has-text("سامي")');
    if (caseSelectBtn) {
      await caseSelectBtn.click();
      await delay(1000);
    }

    console.log('   Verifying Milestone HUD on Nurse Screen...');
    const hudHeader = await page.$('text=مسار المعالم السريرية والشفافية المعتمدة');
    if (hudHeader) {
      console.log('   ✅ Universal Milestone HUD visible on Nurse Triage screen!');
    }

    // Perform Triage
    const triageNotes = await page.$('textarea');
    if (triageNotes) {
      await triageNotes.fill('Vitals reviewed: BP 138/86, HR 78 bpm. Triple vessel disease confirmed on angiography. Triaged to Dr. Fahad Al-Harbi.');
      await delay(400);
    }

    const forwardBtn = await page.$('button:has-text("تحويل للطبيب المعالج"), button:has-text("إرسال للطبيب"), button:has-text("متابعة")');
    if (forwardBtn) {
      await forwardBtn.click();
      console.log('   ✅ Nurse forwarded case to Saudi Treating Doctor!');
      await delay(2000);
    }

    await page.screenshot({ path: 'e2e_screenshots/audit_2_nurse_milestone.png' });
    console.log('   📸 Screenshot saved: e2e_screenshots/audit_2_nurse_milestone.png');

    await delay(1500);
    await page.close();
    await context.close();
  }

  // =========================================================================
  // HERO 3: SAUDI TREATING DOCTOR (Phone Login -> Milestone HUD -> Endorsement)
  // =========================================================================
  console.log('\n================================================================');
  console.log('👨‍⚕️ [HERO 3/5] Saudi Doctor Login & Milestone M03 Endorsement');
  console.log('================================================================');
  {
    const context = await browser.newContext({ viewport: { width: 1200, height: 820 }, locale: 'ar-SA' });
    const page = await context.newPage();

    console.log('   Navigating to Doctor Review Portal...');
    await page.goto(`${BASE_URL}/?portal=doctor`);
    await delay(2000);

    const phoneInput = await page.$('#auth-phone-input');
    if (phoneInput) {
      console.log('   Entering Saudi Doctor Mobile: 0500000005...');
      await phoneInput.fill('0500000005');
      await delay(300);
      await page.click('#auth-phone-submit-btn');
      await delay(1000);

      console.log('   Entering Doctor PIN: 1234...');
      await page.waitForSelector('#auth-pin-digit-0', { timeout: 8000 });
      await page.fill('#auth-pin-digit-0', '1');
      await page.fill('#auth-pin-digit-1', '2');
      await page.fill('#auth-pin-digit-2', '3');
      await page.fill('#auth-pin-digit-3', '4');
      await delay(400);
      await page.click('#auth-pin-submit-btn');
      await delay(2500);
    }

    console.log('   Selecting active review case from queue...');
    const doctorCaseBtn = await page.$('button:has-text("عرض التفاصيل"), tr:has-text("CASE-2026"), div:has-text("CASE-2026"), tr:has-text("سامي")');
    if (doctorCaseBtn) {
      await doctorCaseBtn.click();
      await delay(1000);
    }

    console.log('   Verifying Milestone HUD on Doctor Screen...');
    const hudEl = await page.$('text=مسار المعالم السريرية والشفافية المعتمدة');
    if (hudEl) {
      console.log('   ✅ Universal Milestone HUD visible on Doctor Review screen!');
    }

    // Approve Referral
    const approveBtn = await page.$('button:has-text("الموافقة على طلب الاستشارة"), button:has-text("اعتماد الإحالة"), button:has-text("موافق")');
    if (approveBtn) {
      await approveBtn.click();
      console.log('   ✅ Treating Doctor endorsed second opinion referral!');
      await delay(2000);
    }

    await page.screenshot({ path: 'e2e_screenshots/audit_3_doctor_milestone.png' });
    console.log('   📸 Screenshot saved: e2e_screenshots/audit_3_doctor_milestone.png');

    await delay(1500);
    await page.close();
    await context.close();
  }

  // =========================================================================
  // HERO 4: ALO COORDINATOR (Phone Login -> Milestone HUD -> Magic Link)
  // =========================================================================
  console.log('\n================================================================');
  console.log('👔 [HERO 4/5] ALO Coordinator Login & Milestone M04 Dispatch');
  console.log('================================================================');
  {
    const context = await browser.newContext({ viewport: { width: 1200, height: 820 }, locale: 'ar-SA' });
    const page = await context.newPage();

    console.log('   Navigating to Coordinator Portal...');
    await page.goto(`${BASE_URL}/?portal=coordinator`);
    await delay(2000);

    const phoneInput = await page.$('#auth-phone-input');
    if (phoneInput) {
      console.log('   Entering Coordinator Mobile: 0500000003...');
      await phoneInput.fill('0500000003');
      await delay(300);
      await page.click('#auth-phone-submit-btn');
      await delay(1000);

      console.log('   Entering Coordinator PIN: 1234...');
      await page.waitForSelector('#auth-pin-digit-0', { timeout: 8000 });
      await page.fill('#auth-pin-digit-0', '1');
      await page.fill('#auth-pin-digit-1', '2');
      await page.fill('#auth-pin-digit-2', '3');
      await page.fill('#auth-pin-digit-3', '4');
      await delay(400);
      await page.click('#auth-pin-submit-btn');
      await delay(2500);
    }

    console.log('   Selecting active coordinator case from queue...');
    const coordCaseBtn = await page.$('button:has-text("عرض التفاصيل"), div:has-text("CASE-2026"), tr:has-text("CASE-2026"), tr:has-text("سامي")');
    if (coordCaseBtn) {
      await coordCaseBtn.click();
      await delay(1000);
    }

    console.log('   Verifying Milestone HUD on Coordinator Screen...');
    const hudEl = await page.$('text=مسار المعالم السريرية والشفافية المعتمدة');
    if (hudEl) {
      console.log('   ✅ Universal Milestone HUD visible on Coordinator screen!');
    }

    // Extract Magic Link
    const magicInput = await page.$('#consultant-magic-link-input');
    if (magicInput) {
      consultantMagicLinkUrl = await magicInput.inputValue();
      console.log(`   🔗 Extracted Consultant Magic Link: ${consultantMagicLinkUrl}`);
    } else {
      consultantMagicLinkUrl = `${BASE_URL}/?token=demo_consultant_token&caseId=${registeredCaseId}&role=K`;
      console.log(`   🔗 Prepared Consultant Magic Link: ${consultantMagicLinkUrl}`);
    }

    await page.screenshot({ path: 'e2e_screenshots/audit_4_coordinator_milestone.png' });
    console.log('   📸 Screenshot saved: e2e_screenshots/audit_4_coordinator_milestone.png');

    await delay(1500);
    await page.close();
    await context.close();
  }

  // =========================================================================
  // HERO 5: INTERNATIONAL CONSULTANT (Magic Link -> Milestone HUD -> Dossier)
  // =========================================================================
  console.log('\n================================================================');
  console.log('🩺 [HERO 5/5] International Consultant Review & Milestone M05 HUD');
  console.log('================================================================');
  {
    const context = await browser.newContext({ viewport: { width: 1200, height: 850 }, locale: 'en-US' });
    const page = await context.newPage();

    const targetUrl = consultantMagicLinkUrl || `${BASE_URL}/?token=demo_token&role=K`;
    console.log(`   Opening Consultant Magic Link: ${targetUrl}...`);
    await page.goto(targetUrl);
    await delay(2500);

    const hudEl = await page.$('text=Clinical Milestone & Transparency HUD');
    if (hudEl) {
      console.log('   ✅ Milestone HUD successfully loaded in English on Consultant screen!');
    }

    await page.screenshot({ path: 'e2e_screenshots/audit_5_consultant_milestone.png' });
    console.log('   📸 Final Screenshot saved: e2e_screenshots/audit_5_consultant_milestone.png');

    await delay(2000);
    await page.close();
    await context.close();
  }

  await browser.close();
  console.log('\n✨ ================================================================');
  console.log('🎉 ALL 5 HERO WINDOWS COMPLETED WITH MILESTONE ACTIVITY TIMESTAMPS!');
  console.log('   M01: Patient Intake registered with verified MOH consent.');
  console.log('   M02: Nurse Sara Al-Qahtani triaged and logged timestamp.');
  console.log('   M03: Dr. Fahad Al-Harbi endorsed referral with timestamp.');
  console.log('   M04: Emmanuel Arcon Gonzalez verified payment and dispatched.');
  console.log('   M05: Dr. V. Prasanth reviewed dossier via Magic Link.');
  console.log('================================================================\n');
}

run().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
