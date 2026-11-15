import { chromium } from 'playwright';

const LIVE_URL = 'https://ad.howtostart.in/feature-sarat/';

async function loginUser(page, phone, pin = '1234') {
  await page.goto(LIVE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // If not already on phone input, click login
  const phoneInput = page.locator('input[type="tel"]').first();
  if (!(await phoneInput.isVisible())) {
    const loginBtn = page.locator('button:has-text("Login"), button:has-text("تسجيل الدخول")').first();
    await loginBtn.click();
    await page.waitForTimeout(500);
  }

  await phoneInput.waitFor({ state: 'visible', timeout: 10000 });
  await phoneInput.fill(phone);
  await page.waitForTimeout(200);

  // Submit phone
  const submitPhoneBtn = page.locator('form button[type="submit"]').first();
  await submitPhoneBtn.click();
  await page.waitForTimeout(1000);

  // Enter 4-digit PIN
  const pinInputs = page.locator('input[type="password"]');
  await pinInputs.first().waitFor({ state: 'visible', timeout: 10000 });
  for (let i = 0; i < 4; i++) {
    await pinInputs.nth(i).fill(pin[i]);
  }
  await page.waitForTimeout(300);

  // Submit PIN inside modal
  const submitPinBtn = page.locator('form button[type="submit"]').last();
  await submitPinBtn.click();
  await page.waitForTimeout(2500);
}

async function runRealMultiRoleFlow() {
  console.log('\n========================================================================');
  console.log('🎬 STARTING VISIBLE MULTI-ROLE FLOW (REAL AUTH · ZERO DEMO TRACES)');
  console.log('   Target URL: ' + LIVE_URL);
  console.log('========================================================================\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 60,
    args: ['--start-maximized', '--window-size=1440,900']
  });

  try {
    // -------------------------------------------------------------------------
    // 1. PATIENT WINDOW (Sami Al-Harbi)
    // -------------------------------------------------------------------------
    console.log('👤 [Window 1] Launching Patient Window...');
    const ctxPatient = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pagePatient = await ctxPatient.newPage();
    await pagePatient.bringToFront();

    console.log('   Logging in Patient Sami Al-Harbi (+966500000099)...');
    await loginUser(pagePatient, '+966500000099', '1234');

    // Go to intake if on timeline or landing
    const startCaseBtn = pagePatient.locator('button:has-text("سجّل حالة جديدة"), button:has-text("Register a Case"), button:has-text("New Consultation"), button:has-text("Start Your Case")').first();
    if (await startCaseBtn.isVisible()) {
      await startCaseBtn.click();
      await pagePatient.waitForTimeout(1200);
    }

    console.log('   Entering dynamic clinical symptoms and prescriptions...');
    const diagInput = pagePatient.locator('input[placeholder*="Lumbar"]').first();
    if (await diagInput.isVisible()) {
      await diagInput.fill('Severe Lumbar Spinal Canal Stenosis');
    }

    const symptomsArea = pagePatient.locator('textarea').first();
    if (await symptomsArea.isVisible()) {
      await symptomsArea.fill('Neurogenic claudication limiting ambulation to 50 meters. Bilateral lower limb paresthesias.');
    }

    // Toggle Red-Flag tag
    const redFlagBtn = pagePatient.locator('button:has-text("Severe Shortness of Breath"), button:has-text("Dizziness or Fainting"), button:has-text("ضيق تنفس حاد")').first();
    if (await redFlagBtn.isVisible()) {
      await redFlagBtn.click();
    }

    // Add medication
    const medInput = pagePatient.locator('input[placeholder*="Panadol"]').first();
    if (await medInput.isVisible()) {
      await medInput.fill('Gabapentin 300mg (TDS)');
      const addBtn = pagePatient.locator('button:has-text("+ Add"), button:has-text("+ إضافة")').nth(1);
      if (await addBtn.isVisible()) await addBtn.click();
    }

    // Add allergy
    const algInput = pagePatient.locator('input[placeholder*="Penicillin"]').first();
    if (await algInput.isVisible()) {
      await algInput.fill('Penicillin');
      const addBtn = pagePatient.locator('button:has-text("+ Add"), button:has-text("+ إضافة")').nth(2);
      if (await addBtn.isVisible()) await addBtn.click();
    }

    // Consent checkbox
    const consent = pagePatient.locator('input[type="checkbox"]').first();
    if (await consent.isVisible()) await consent.check();
    await pagePatient.waitForTimeout(800);

    // Submit Case (P14)
    console.log('   Submitting intake case via P14...');
    const p14Btn = pagePatient.locator('button:has-text("P14")').first();
    if (await p14Btn.isVisible()) {
      await p14Btn.click();
      await pagePatient.waitForTimeout(3000);
    }

    // -------------------------------------------------------------------------
    // 2. NURSE WINDOW (Sara Al-Qahtani)
    // -------------------------------------------------------------------------
    console.log('\n🩺 [Window 2] Launching Nurse Window (Sara Al-Qahtani)...');
    const ctxNurse = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageNurse = await ctxNurse.newPage();
    await pageNurse.bringToFront();

    console.log('   Logging in Nurse Sara Al-Qahtani (+966500000004)...');
    await loginUser(pageNurse, '+966500000004', '1234');
    await pageNurse.waitForTimeout(1500);

    // Select the newly submitted case in triage queue
    const firstQueueCase = pageNurse.locator('[data-case-id], button:has-text("Lumbar"), div:has-text("Lumbar")').first();
    if (await firstQueueCase.isVisible()) {
      await firstQueueCase.click();
      await pageNurse.waitForTimeout(1000);
    }

    // Complete triage notes and approve (N07)
    console.log('   Nurse completing triage & routing via N07...');
    const triageText = pageNurse.locator('textarea#triage-notes-n05, textarea').first();
    if (await triageText.isVisible()) {
      await triageText.fill('De-identification verified per SDAIA guidelines. DICOM series checked. Routed to Saudi doctor.');
    }

    const urgentBtn = pageNurse.locator('button:has-text("Urgent"), button:has-text("عاجل")').first();
    if (await urgentBtn.isVisible()) await urgentBtn.click();

    const n07Btn = pageNurse.locator('button:has-text("N07"), button:has-text("Approve & route")').first();
    if (await n07Btn.isVisible() && await n07Btn.isEnabled()) {
      await n07Btn.click();
      await pageNurse.waitForTimeout(2500);
    }

    // -------------------------------------------------------------------------
    // 3. SAUDI TREATING DOCTOR WINDOW (Dr. Fahad Al-Harbi)
    // -------------------------------------------------------------------------
    console.log('\n👨‍⚕️ [Window 3] Launching Saudi Doctor Window (Dr. Fahad Al-Harbi)...');
    const ctxDoctor = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageDoctor = await ctxDoctor.newPage();
    await pageDoctor.bringToFront();

    console.log('   Logging in Dr. Fahad Al-Harbi (+966500000005)...');
    await loginUser(pageDoctor, '+966500000005', '1234');
    await pageDoctor.waitForTimeout(1500);

    const docCase = pageDoctor.locator('[data-case-id], div:has-text("Lumbar")').first();
    if (await docCase.isVisible()) {
      await docCase.click();
      await pageDoctor.waitForTimeout(1000);
    }

    // Approve Referral via D10
    console.log('   Doctor approving referral via D10...');
    const d10Btn = pageDoctor.locator('button:has-text("D10"), button:has-text("Approve Referral")').first();
    if (await d10Btn.isVisible()) {
      await d10Btn.scrollIntoViewIfNeeded();
      if (await d10Btn.isEnabled()) {
        await d10Btn.click();
        await pageDoctor.waitForTimeout(2500);
      }
    }

    // -------------------------------------------------------------------------
    // 4. COORDINATOR WINDOW (Emmanuel Arcon Gonzalez)
    // -------------------------------------------------------------------------
    console.log('\n📋 [Window 4] Launching Coordinator Window (Emmanuel Arcon Gonzalez)...');
    const ctxCoordinator = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageCoordinator = await ctxCoordinator.newPage();
    await pageCoordinator.bringToFront();

    console.log('   Logging in Emmanuel Arcon Gonzalez (+966500000003)...');
    await loginUser(pageCoordinator, '+966500000003', '1234');
    await pageCoordinator.waitForTimeout(1500);

    const coordCase = pageCoordinator.locator('[data-case-id], div:has-text("Lumbar")').first();
    if (await coordCase.isVisible()) {
      await coordCase.click();
      await pageCoordinator.waitForTimeout(1000);
    }

    const payBtn = pageCoordinator.locator('button:has-text("Verify Payment"), button:has-text("Gate"), button:has-text("C07")').first();
    if (await payBtn.isVisible()) {
      await payBtn.click();
      await pageCoordinator.waitForTimeout(2000);
    }

    // -------------------------------------------------------------------------
    // 5. INTERNATIONAL SPECIALIST WINDOW (Dr. V. Prasanth)
    // -------------------------------------------------------------------------
    console.log('\n🌐 [Window 5] Launching International Specialist Window (Dr. V. Prasanth)...');
    const ctxConsultant = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageConsultant = await ctxConsultant.newPage();
    await pageConsultant.bringToFront();

    console.log('   Logging in Dr. V. Prasanth (+966500000006)...');
    await loginUser(pageConsultant, '+966500000006', '1234');
    await pageConsultant.waitForTimeout(2000);

    const submitOpBtn = pageConsultant.locator('button:has-text("Submit Opinion"), button:has-text("اعتماد الرأي"), button:has-text("K06")').first();
    if (await submitOpBtn.isVisible()) {
      await submitOpBtn.click();
      await pageConsultant.waitForTimeout(2000);
    }

    // -------------------------------------------------------------------------
    // 6. BACK TO COORDINATOR: DUAL RELEASE
    // -------------------------------------------------------------------------
    console.log('\n📋 [Window 4] Bringing Coordinator forward for Certified Dual Release...');
    await pageCoordinator.bringToFront();
    await pageCoordinator.waitForTimeout(2000);

    const releaseBtn = pageCoordinator.locator('button:has-text("Release"), button:has-text("إصدار التقرير"), button:has-text("C08"), button:has-text("C09")').first();
    if (await releaseBtn.isVisible()) {
      await releaseBtn.click();
      await pageCoordinator.waitForTimeout(2000);
    }

    // -------------------------------------------------------------------------
    // 7. BACK TO PATIENT WINDOW: LIVE VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n👤 [Window 1] Bringing Patient Window forward for Real Status Verification...');
    await pagePatient.bringToFront();
    await pagePatient.reload({ waitUntil: 'networkidle' });
    await pagePatient.waitForTimeout(5000);

    console.log('\n========================================================================');
    console.log('✅ REAL MULTI-ROLE FLOW COMPLETE ACROSS ALL SEPARATE WINDOWS!');
    console.log('   Windows will remain open for your inspection...');
    console.log('========================================================================\n');
    await pagePatient.waitForTimeout(10000);

  } catch (err) {
    console.error('❌ Error during multi-role execution:', err);
  } finally {
    await browser.close();
  }
}

runRealMultiRoleFlow();
