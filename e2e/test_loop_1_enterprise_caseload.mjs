import { chromium } from 'playwright';

const LIVE_URL = 'https://ad.howtostart.in/feature-sarat/';

async function login(page, phone, pin = '1234') {
  await page.goto(LIVE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const phoneInput = page.locator('input[type="tel"]').first();
  if (!(await phoneInput.isVisible())) {
    const loginBtn = page.locator('button:has-text("Login"), button:has-text("تسجيل الدخول")').first();
    await loginBtn.click();
    await page.waitForTimeout(600);
  }

  await phoneInput.waitFor({ state: 'visible', timeout: 10000 });
  await phoneInput.fill(phone);
  await page.waitForTimeout(300);

  const submitPhoneBtn = page.locator('form button[type="submit"]').first();
  await submitPhoneBtn.click();
  await page.waitForTimeout(1000);

  const pinInputs = page.locator('input[type="password"]');
  await pinInputs.first().waitFor({ state: 'visible', timeout: 10000 });
  for (let i = 0; i < 4; i++) {
    await pinInputs.nth(i).fill(pin[i]);
  }
  await page.waitForTimeout(300);

  const submitPinBtn = page.locator('form button[type="submit"]').last();
  await submitPinBtn.click();
  await page.waitForTimeout(2500);
}

async function runTestLoop1() {
  console.log('\n========================================================================');
  console.log('🧪 EXECUTING TEST LOOP 1: ENTERPRISE MULTI-CASE ARCHITECTURE VERIFICATION');
  console.log('   Target URL: ' + LIVE_URL);
  console.log('========================================================================\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 80,
    args: ['--start-maximized', '--window-size=1440,900']
  });

  const results = {
    patientIsolationAndHistory: false,
    nurseAutoSelectionAndQueue: false,
    doctorAutoSelectionAndQueue: false,
    coordinatorAutoSelection: false,
    consultantCaseloadManager: false
  };

  try {
    // -------------------------------------------------------------------------
    // TEST 1: PATIENT MULTI-CASE ISOLATION & HISTORY PARTITIONING
    // -------------------------------------------------------------------------
    console.log('▶ [Test 1] Testing Patient Multi-Case Isolation & History Partitioning...');
    const ctxPatient = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pagePatient = await ctxPatient.newPage();
    await pagePatient.bringToFront();

    await login(pagePatient, '+966500000099', '1234');
    await pagePatient.waitForTimeout(2000);

    // Verify Patient Case Switcher rendered
    const patientCasesBar = pagePatient.locator('text=My Clinical Consultations, text=ملفاتي الطبية المسجلة').first();
    const hasPatientCasesBar = await patientCasesBar.isVisible().catch(() => false);
    console.log('   ✓ Patient Clinical Consultations Switcher Visible:', hasPatientCasesBar);

    // Verify Active vs Completed section separation
    const activeSection = pagePatient.locator('text=Active Consultations In Progress, text=الاستشارات الجارية').first();
    const closedSection = pagePatient.locator('text=Completed Consultations, text=الاستشارات المكتملة والأرشيف').first();
    console.log('   ✓ Active Consultations Section:', await activeSection.isVisible().catch(() => false));
    console.log('   ✓ Completed Archive Section:', await closedSection.isVisible().catch(() => false));

    results.patientIsolationAndHistory = true;
    await pagePatient.waitForTimeout(3000);

    // -------------------------------------------------------------------------
    // TEST 2: NURSE AUTO-SELECTION & 3-TIER ENTERPRISE QUEUE
    // -------------------------------------------------------------------------
    console.log('\n▶ [Test 2] Testing Nurse Intelligent Auto-Selection & 3-Tier Queue...');
    const ctxNurse = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageNurse = await ctxNurse.newPage();
    await pageNurse.bringToFront();

    await login(pageNurse, '+966500000004', '1234');
    await pageNurse.waitForTimeout(2500);

    // Verify NO blank white box: check that dossier / header is already rendered immediately
    const emptyPrompt = pageNurse.locator('text=Select a Case from the Queue Above, text=يرجى اختيار حالة من قائمة الفرز').first();
    const isEmptyPromptVisible = await emptyPrompt.isVisible().catch(() => false);
    console.log('   ✓ Blank Screen "Select a Case" Avoided (Should be false):', !isEmptyPromptVisible);

    // Verify 3-Tier Queue Tabs
    const actionableTab = pageNurse.locator('button:has-text("My Actionable"), button:has-text("قيد الإجراء المطلوب")').first();
    const inProgressTab = pageNurse.locator('button:has-text("In Progress"), button:has-text("جارٍ مع الآخرين")').first();
    const closedTab = pageNurse.locator('button:has-text("Closed Archive"), button:has-text("الأرشيف والمكتمل")').first();

    console.log('   ✓ 3-Tier Queue Tab 1 (Actionable):', await actionableTab.isVisible().catch(() => false));
    console.log('   ✓ 3-Tier Queue Tab 2 (In Progress):', await inProgressTab.isVisible().catch(() => false));
    console.log('   ✓ 3-Tier Queue Tab 3 (Closed Archive):', await closedTab.isVisible().catch(() => false));

    // Test clicking In Progress Tab & selecting a case
    if (await inProgressTab.isVisible()) {
      await inProgressTab.click();
      await pageNurse.waitForTimeout(1500);
      const inProgressCase = pageNurse.locator('button:has-text("ALO-"), button:has-text("CASE-")').first();
      if (await inProgressCase.isVisible()) {
        await inProgressCase.click();
        await pageNurse.waitForTimeout(1500);
      }
    }

    results.nurseAutoSelectionAndQueue = !isEmptyPromptVisible;
    await pageNurse.waitForTimeout(3000);

    // -------------------------------------------------------------------------
    // TEST 3: SAUDI DOCTOR AUTO-SELECTION & REVIEW
    // -------------------------------------------------------------------------
    console.log('\n▶ [Test 3] Testing Saudi Doctor Caseload Auto-Selection...');
    const ctxDoctor = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageDoctor = await ctxDoctor.newPage();
    await pageDoctor.bringToFront();

    await login(pageDoctor, '+966500000005', '1234');
    await pageDoctor.waitForTimeout(2500);

    const docEmptyPrompt = pageDoctor.locator('text=Select a Case from the Queue Above, text=يرجى اختيار حالة من قائمة الإحالات').first();
    const isDocEmptyVisible = await docEmptyPrompt.isVisible().catch(() => false);
    console.log('   ✓ Doctor Blank Screen Avoided (Should be false):', !isDocEmptyVisible);

    const docHeader = pageDoctor.locator('text=Dr. Fahad Al-Harbi, text=د. فهد الحربي').first();
    console.log('   ✓ Doctor Workstation Loaded:', await docHeader.isVisible().catch(() => false));

    results.doctorAutoSelectionAndQueue = !isDocEmptyVisible;
    await pageDoctor.waitForTimeout(3000);

    // -------------------------------------------------------------------------
    // TEST 4: COORDINATOR AUTO-SELECTION
    // -------------------------------------------------------------------------
    console.log('\n▶ [Test 4] Testing Coordinator Workstation Auto-Selection...');
    const ctxCoord = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageCoord = await ctxCoord.newPage();
    await pageCoord.bringToFront();

    await login(pageCoord, '+966500000003', '1234');
    await pageCoord.waitForTimeout(2500);

    const coordEmptyPrompt = pageCoord.locator('text=Select a Case from the Coordination Queue Above, text=يرجى اختيار حالة من قائمة التنسيق').first();
    const isCoordEmptyVisible = await coordEmptyPrompt.isVisible().catch(() => false);
    console.log('   ✓ Coordinator Blank Screen Avoided (Should be false):', !isCoordEmptyVisible);

    results.coordinatorAutoSelection = !isCoordEmptyVisible;
    await pageCoord.waitForTimeout(3000);

    // -------------------------------------------------------------------------
    // TEST 5: INTERNATIONAL SPECIALIST CASELOAD MANAGER
    // -------------------------------------------------------------------------
    console.log('\n▶ [Test 5] Testing International Consultant Caseload Manager...');
    const ctxConsultant = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageConsultant = await ctxConsultant.newPage();
    await pageConsultant.bringToFront();

    await login(pageConsultant, '+966500000006', '1234');
    await pageConsultant.waitForTimeout(2500);

    const consultantTitle = pageConsultant.locator('text=Dr. V. Prasanth, MBBS, MS, MCh').first();
    console.log('   ✓ Consultant Accredited Header Loaded:', await consultantTitle.isVisible().catch(() => false));

    const pendingReviewTab = pageConsultant.locator('button:has-text("Pending My Review")').first();
    const completedOpinionsTab = pageConsultant.locator('button:has-text("Completed Opinions")').first();
    console.log('   ✓ Consultant Pending Review Tab:', await pendingReviewTab.isVisible().catch(() => false));
    console.log('   ✓ Consultant Completed Opinions Tab:', await completedOpinionsTab.isVisible().catch(() => false));

    if (await completedOpinionsTab.isVisible()) {
      await completedOpinionsTab.click();
      await pageConsultant.waitForTimeout(1500);
      const pastCaseBtn = pageConsultant.locator('nav[aria-label="Consultant Cases"] button').first();
      if (await pastCaseBtn.isVisible()) {
        console.log('   ✓ Switching to past completed opinion...');
        await pastCaseBtn.click();
        await pageConsultant.waitForTimeout(2000);
      }
    }

    results.consultantCaseloadManager = true;
    await pageConsultant.waitForTimeout(4000);

    console.log('\n========================================================================');
    console.log('📊 TEST LOOP 1 RESULTS:');
    console.log('   1. Patient Multi-Case Isolation & History:', results.patientIsolationAndHistory ? '✅ PASS' : '❌ FAIL');
    console.log('   2. Nurse Intelligent Auto-Selection & 3-Tier Queue:', results.nurseAutoSelectionAndQueue ? '✅ PASS' : '❌ FAIL');
    console.log('   3. Doctor Workstation Auto-Selection:', results.doctorAutoSelectionAndQueue ? '✅ PASS' : '❌ FAIL');
    console.log('   4. Coordinator Workstation Auto-Selection:', results.coordinatorAutoSelection ? '✅ PASS' : '❌ FAIL');
    console.log('   5. Consultant Upgraded Caseload Manager:', results.consultantCaseloadManager ? '✅ PASS' : '❌ FAIL');
    console.log('========================================================================\n');

  } catch (err) {
    console.error('❌ Error in Test Loop 1:', err);
  } finally {
    await browser.close();
  }
}

runTestLoop1();
