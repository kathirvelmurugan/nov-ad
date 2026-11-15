import { chromium } from 'playwright';

const LIVE_URL = 'https://ad.howtostart.in/feature-sarat/';

async function loginUserPaced(page, phone, pin = '1234') {
  console.log(`      Navigating to ${LIVE_URL}...`);
  await page.goto(LIVE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click Login if not already open
  const phoneInput = page.locator('input[type="tel"]').first();
  if (!(await phoneInput.isVisible())) {
    const loginBtn = page.locator('button:has-text("Login"), button:has-text("تسجيل الدخول")').first();
    await loginBtn.click();
    await page.waitForTimeout(1000);
  }

  // Type Phone with human delay
  await phoneInput.waitFor({ state: 'visible', timeout: 10000 });
  await phoneInput.fill(phone);
  await page.waitForTimeout(800);

  // Submit phone
  const submitPhoneBtn = page.locator('form button[type="submit"]').first();
  await submitPhoneBtn.click();
  await page.waitForTimeout(1500);

  // Enter 4-digit PIN
  const pinInputs = page.locator('input[type="password"]');
  await pinInputs.first().waitFor({ state: 'visible', timeout: 10000 });
  for (let i = 0; i < 4; i++) {
    await pinInputs.nth(i).fill(pin[i]);
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(800);

  // Submit PIN inside modal
  const submitPinBtn = page.locator('form button[type="submit"]').last();
  await submitPinBtn.click();
  await page.waitForTimeout(3000);
}

async function runPacedMultiWindowFlow() {
  console.log('\n========================================================================');
  console.log('🎬 STARTING PACED MULTI-WINDOW DEMO (3-SECOND PAUSES · REAL AUTH)');
  console.log('   Target: ' + LIVE_URL);
  console.log('========================================================================\n');

  // Single browser instance with multiple OS windows or separate contexts
  const browser = await chromium.launch({
    headless: false,
    slowMo: 120,
    args: ['--start-maximized', '--window-size=1400,880']
  });

  const windows = {};

  try {
    // -------------------------------------------------------------------------
    // 1. PATIENT WINDOW (Sami Al-Harbi)
    // -------------------------------------------------------------------------
    console.log('▶ [Step 1] Opening Window 1: Patient (Sami Al-Harbi)...');
    const ctxPatient = await browser.newContext({ viewport: { width: 1400, height: 880 } });
    const pagePatient = await ctxPatient.newPage();
    windows.patient = pagePatient;
    await pagePatient.bringToFront();

    console.log('   👤 Logging in Patient (+966500000099)...');
    await loginUserPaced(pagePatient, '+966500000099', '1234');
    await pagePatient.waitForTimeout(3000); // 3-second gap

    // Start New Case / Intake
    const startCaseBtn = pagePatient.locator('button:has-text("سجّل حالة جديدة"), button:has-text("Register a Case"), button:has-text("New Consultation"), button:has-text("Start Your Case")').first();
    if (await startCaseBtn.isVisible()) {
      await startCaseBtn.click();
      await pagePatient.waitForTimeout(2000);
    }

    console.log('   📝 Patient entering diagnosis, symptoms, medications, and allergies...');
    const diagInput = pagePatient.locator('input[placeholder*="Lumbar"]').first();
    if (await diagInput.isVisible()) {
      await diagInput.fill('Severe Degenerative Lumbar Spinal Canal Stenosis');
      await pagePatient.waitForTimeout(1000);
    }

    const symptomsArea = pagePatient.locator('textarea').first();
    if (await symptomsArea.isVisible()) {
      await symptomsArea.fill('Severe lower back and leg pain on walking 50m. Numbness in both feet for 6 months.');
      await pagePatient.waitForTimeout(1000);
    }

    // Toggle Red-Flag tag
    const redFlagBtn = pagePatient.locator('button:has-text("Severe Shortness of Breath"), button:has-text("Dizziness or Fainting"), button:has-text("ضيق تنفس حاد")').first();
    if (await redFlagBtn.isVisible()) {
      await redFlagBtn.click();
      await pagePatient.waitForTimeout(1000);
    }

    // Add medication
    const medInput = pagePatient.locator('input[placeholder*="Panadol"]').first();
    if (await medInput.isVisible()) {
      await medInput.fill('Gabapentin 300mg (TDS)');
      const addBtn = pagePatient.locator('button:has-text("+ Add"), button:has-text("+ إضافة")').nth(1);
      if (await addBtn.isVisible()) await addBtn.click();
      await pagePatient.waitForTimeout(1000);
    }

    // Add allergy
    const algInput = pagePatient.locator('input[placeholder*="Penicillin"]').first();
    if (await algInput.isVisible()) {
      await algInput.fill('Penicillin');
      const addBtn = pagePatient.locator('button:has-text("+ Add"), button:has-text("+ إضافة")').nth(2);
      if (await addBtn.isVisible()) await addBtn.click();
      await pagePatient.waitForTimeout(1000);
    }

    // Check consent
    const consent = pagePatient.locator('input[type="checkbox"]').first();
    if (await consent.isVisible()) await consent.check();
    await pagePatient.waitForTimeout(1500);

    // Submit Case (P14)
    console.log('   🚀 Patient submitting Case to ALO Nurse (P14)...');
    const p14Btn = pagePatient.locator('button:has-text("P14")').first();
    if (await p14Btn.isVisible()) {
      await p14Btn.click();
      await pagePatient.waitForTimeout(3000); // 3-second gap
    }

    console.log('   ⏳ 3-second pause to observe patient timeline dossier...');
    await pagePatient.waitForTimeout(3000);

    // -------------------------------------------------------------------------
    // 2. NURSE WINDOW (Sara Al-Qahtani)
    // -------------------------------------------------------------------------
    console.log('\n▶ [Step 2] Opening Window 2: Nurse Triage (Sara Al-Qahtani)...');
    const ctxNurse = await browser.newContext({ viewport: { width: 1400, height: 880 } });
    const pageNurse = await ctxNurse.newPage();
    windows.nurse = pageNurse;
    await pageNurse.bringToFront();

    console.log('   🩺 Logging in Nurse (+966500000004)...');
    await loginUserPaced(pageNurse, '+966500000004', '1234');
    await pageNurse.waitForTimeout(3000); // 3-second gap

    // Select the new case in triage queue
    const firstQueueCase = pageNurse.locator('[data-case-id], button:has-text("Lumbar"), div:has-text("Lumbar")').first();
    if (await firstQueueCase.isVisible()) {
      console.log('   Selecting new case in nurse triage queue...');
      await firstQueueCase.click();
      await pageNurse.waitForTimeout(2000);
    }

    // Fill triage notes & set urgency
    console.log('   Filling clinical triage assessment & setting Urgency...');
    const triageText = pageNurse.locator('textarea#triage-notes-n05, textarea').first();
    if (await triageText.isVisible()) {
      await triageText.fill('De-identification verified per SDAIA Art 29. DICOM lumbo-sacral MRI checked. Routing to Saudi treating physician.');
      await pageNurse.waitForTimeout(1000);
    }

    const urgentBtn = pageNurse.locator('button:has-text("Urgent"), button:has-text("عاجل")').first();
    if (await urgentBtn.isVisible()) {
      await urgentBtn.click();
      await pageNurse.waitForTimeout(1000);
    }

    // Click N07 Approve
    console.log('   Clicking N07: Approve & route to Saudi treating doctor...');
    const n07Btn = pageNurse.locator('button:has-text("N07"), button:has-text("Approve & route")').first();
    if (await n07Btn.isVisible() && await n07Btn.isEnabled()) {
      await n07Btn.click();
      await pageNurse.waitForTimeout(3000); // 3-second gap
    }

    console.log('   ⏳ 3-second pause to observe Nurse triage approval...');
    await pageNurse.waitForTimeout(3000);

    // -------------------------------------------------------------------------
    // 3. SAUDI DOCTOR WINDOW (Dr. Fahad Al-Harbi)
    // -------------------------------------------------------------------------
    console.log('\n▶ [Step 3] Opening Window 3: Saudi Treating Doctor (Dr. Fahad Al-Harbi)...');
    const ctxDoctor = await browser.newContext({ viewport: { width: 1400, height: 880 } });
    const pageDoctor = await ctxDoctor.newPage();
    windows.doctor = pageDoctor;
    await pageDoctor.bringToFront();

    console.log('   👨‍⚕️ Logging in Dr. Fahad Al-Harbi (+966500000005)...');
    await loginUserPaced(pageDoctor, '+966500000005', '1234');
    await pageDoctor.waitForTimeout(3000); // 3-second gap

    const docCase = pageDoctor.locator('[data-case-id], div:has-text("Lumbar")').first();
    if (await docCase.isVisible()) {
      console.log('   Opening case in doctor review portal...');
      await docCase.click();
      await pageDoctor.waitForTimeout(2000);
    }

    // Click D10 Approve Referral
    console.log('   Clicking D10: Approve Referral & Route to ALO Coordinator...');
    const d10Btn = pageDoctor.locator('button:has-text("D10"), button:has-text("Approve Referral")').first();
    if (await d10Btn.isVisible()) {
      await d10Btn.scrollIntoViewIfNeeded();
      await pageDoctor.waitForTimeout(1000);
      if (await d10Btn.isEnabled()) {
        await d10Btn.click();
        await pageDoctor.waitForTimeout(3000); // 3-second gap
      }
    }

    console.log('   ⏳ 3-second pause to observe Doctor approval state...');
    await pageDoctor.waitForTimeout(3000);

    // -------------------------------------------------------------------------
    // 4. COORDINATOR WINDOW (Emmanuel Arcon Gonzalez)
    // -------------------------------------------------------------------------
    console.log('\n▶ [Step 4] Opening Window 4: Care Coordinator (Emmanuel Arcon Gonzalez)...');
    const ctxCoordinator = await browser.newContext({ viewport: { width: 1400, height: 880 } });
    const pageCoordinator = await ctxCoordinator.newPage();
    windows.coordinator = pageCoordinator;
    await pageCoordinator.bringToFront();

    console.log('   📋 Logging in Coordinator (+966500000003)...');
    await loginUserPaced(pageCoordinator, '+966500000003', '1234');
    await pageCoordinator.waitForTimeout(3000); // 3-second gap

    const coordCase = pageCoordinator.locator('[data-case-id], div:has-text("Lumbar")').first();
    if (await coordCase.isVisible()) {
      await coordCase.click();
      await pageCoordinator.waitForTimeout(2000);
    }

    console.log('   Verifying payment & gating case to international consultant...');
    const payBtn = pageCoordinator.locator('button:has-text("Verify Payment"), button:has-text("Gate"), button:has-text("C07")').first();
    if (await payBtn.isVisible()) {
      await payBtn.click();
      await pageCoordinator.waitForTimeout(3000);
    }

    console.log('   ⏳ 3-second pause to observe Coordinator payment gate...');
    await pageCoordinator.waitForTimeout(3000);

    // -------------------------------------------------------------------------
    // 5. INTERNATIONAL SPECIALIST WINDOW (Dr. V. Prasanth)
    // -------------------------------------------------------------------------
    console.log('\n▶ [Step 5] Opening Window 5: International Specialist (Dr. V. Prasanth)...');
    const ctxConsultant = await browser.newContext({ viewport: { width: 1400, height: 880 } });
    const pageConsultant = await ctxConsultant.newPage();
    windows.consultant = pageConsultant;
    await pageConsultant.bringToFront();

    console.log('   🌐 Logging in Dr. V. Prasanth (+966500000006)...');
    await loginUserPaced(pageConsultant, '+966500000006', '1234');
    await pageConsultant.waitForTimeout(3000); // 3-second gap

    console.log('   Formulating & submitting certified clinical second opinion (K06)...');
    const submitOpBtn = pageConsultant.locator('button:has-text("Submit Opinion"), button:has-text("اعتماد الرأي"), button:has-text("K06")').first();
    if (await submitOpBtn.isVisible()) {
      await submitOpBtn.click();
      await pageConsultant.waitForTimeout(3000);
    }

    console.log('   ⏳ 3-second pause to observe Consultant opinion submission...');
    await pageConsultant.waitForTimeout(3000);

    // -------------------------------------------------------------------------
    // 6. BRING COORDINATOR FORWARD: DUAL RELEASE
    // -------------------------------------------------------------------------
    console.log('\n▶ [Step 6] Bringing Coordinator Window back to Front for Dual Release...');
    await pageCoordinator.bringToFront();
    await pageCoordinator.waitForTimeout(3000); // 3-second gap

    console.log('   Executing Dual Release of Certified PDF 1...');
    const releaseBtn = pageCoordinator.locator('button:has-text("Release"), button:has-text("إصدار التقرير"), button:has-text("C08"), button:has-text("C09")').first();
    if (await releaseBtn.isVisible()) {
      await releaseBtn.click();
      await pageCoordinator.waitForTimeout(3000);
    }

    console.log('   ⏳ 3-second pause to observe Report Release confirmation...');
    await pageCoordinator.waitForTimeout(3000);

    // -------------------------------------------------------------------------
    // 7. BRING PATIENT WINDOW FORWARD: VERIFY LIVE REPORT
    // -------------------------------------------------------------------------
    console.log('\n▶ [Step 7] Bringing Patient Window back to Front for Final Timeline Verification...');
    await pagePatient.bringToFront();
    await pagePatient.waitForTimeout(3000); // 3-second gap

    console.log('   Reloading Patient timeline to show updated live status from PostgreSQL...');
    await pagePatient.reload({ waitUntil: 'networkidle' });
    await pagePatient.waitForTimeout(3000);

    console.log('\n========================================================================');
    console.log('✅ PACED MULTI-WINDOW DEMO COMPLETED SUCCESSFULLY!');
    console.log('   All windows will remain open for 20 seconds so you can inspect them.');
    console.log('========================================================================\n');
    await pagePatient.waitForTimeout(20000);

  } catch (err) {
    console.error('❌ Error in paced multi-window execution:', err);
  } finally {
    await browser.close();
  }
}

runPacedMultiWindowFlow();
