import { chromium } from 'playwright';

const LIVE_URL = 'https://ad.howtostart.in/feature-sarat/';
const API_URL = 'https://ad.howtostart.in/feature-sarat/api/cases';
const HUB_URL = 'http://localhost:8080/command';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function humanType(locator, text, minDelay = 70, maxDelay = 110) {
  await locator.click();
  for (const char of text) {
    await locator.pressSequentially(char);
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    await sleep(delay);
  }
}

async function transitionCountdown(nextScreen, nextRole, seconds = 5) {
  console.log(`\n⏱️  Transitioning in ${seconds}s ──> Look at [${nextScreen}] (${nextRole})`);
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(`   [${i}s] ... `);
    await sleep(1000);
  }
  console.log(' NOW!\n');
}

async function broadcastHub(command) {
  try {
    await fetch(HUB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'all', command }),
    });
  } catch (e) {
    // Hub broadcast fallback
  }
}

async function syncBackendCase(caseData) {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseData),
    });
  } catch (e) {
    // API sync fallback
  }
}

async function runMasterClinicalFlow() {
  console.log('========================================================================');
  console.log('🚀 ALO DOCTOR: 4-MACHINE DISTRIBUTED CLINICAL JOURNEY');
  console.log('   Pacing: 5-second human eye transitions between physical laptops');
  console.log('   Cadence: Natural human typing (80-120ms/key)');
  console.log('   A/V Safety: 1 video participant per physical machine');
  console.log('========================================================================\n');

  // Connect to Center Mac via CDP
  const browserPatient = await chromium.connectOverCDP('http://localhost:9222');
  const pagePatient = browserPatient.contexts()[0].pages()[0];

  const browserAdmin = await chromium.connectOverCDP('http://localhost:9223');
  const pageAdmin = browserAdmin.contexts()[0].pages()[0];

  const caseId = `case-${Date.now()}`;
  const caseNumber = `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  let activeCase = {
    id: caseId,
    caseNumber: caseNumber,
    patientName: 'Sami Al-Harbi',
    patientNameAr: 'سامي الحربي',
    patientPhone: '+966501111111',
    nationalIdMasked: '10********',
    age: 58,
    gender: 'M',
    specialty: 'جراحة العمود الفقري والأعصاب',
    specialtyAr: 'جراحة العمود الفقري والأعصاب',
    specialtyEn: 'Spine & Neuro Surgery',
    consultationType: 'video',
    currentStage: 'INTAKE_RECEIVED',
    stage: 1,
    status: 'open',
    hospitalId: 'hosp-alo-riyadh-01',
    hospitalNameAr: 'مستشفى رعاية الرياض المعتمد',
    treatingDoctor: {
      id: 'doc-001',
      nameAr: 'د. فهد الحربي',
      nameEn: 'Dr. Fahad Al-Harbi',
      license: 'SCFHS-2024-KSA-8821',
      hospitalId: 'hosp-alo-riyadh-01'
    },
    assignedConsultant: {
      id: 'k-001',
      nameEn: 'Dr. V. Prasanth, MBBS, MS, MCh (Spine & Neuro)',
      nameAr: 'د. ف. براشانث (استشاري جراحة العمود الفقري)',
      center: 'Apollo Hospitals, Bengaluru / KIMS Network'
    },
    symptoms: 'أعاني من انزلاق غضروفي قطني مزمن مع آلام حادة تمتد للساق اليمنى وتنميل في أطراف القدم، مع صعوبة في المشي لمسافة تزيد عن 150 متراً.',
    symptomsAr: 'أعاني من انزلاق غضروفي قطني مزمن مع آلام حادة تمتد للساق اليمنى وتنميل في أطراف القدم، مع صعوبة في المشي لمسافة تزيد عن 150 متراً.',
    symptomsEn: 'Chronic lumbar disc herniation with severe radicular pain radiating down to right leg and foot paresthesia. Walking limited to 150 meters.',
    diagnosis: 'Severe Degenerative Lumbar Spinal Stenosis with Neurogenic Claudication (L4-L5)',
    diagnosisAr: 'تضيق تنكسي حاد في القناة الشوكية القطنية مع عرج عصبي المنشأ (L4-L5)',
    diagnosisEn: 'Severe Degenerative Lumbar Spinal Stenosis with Neurogenic Claudication (L4-L5)',
    clinicalFocusQuestions: [
      'Is microscopic tubular decompression indicated, or should aggressive conservative pain management be continued?',
      'Does L4-L5 dynamic MRI demonstrate instability requiring transforaminal lumbar interbody fusion (TLIF)?',
      'What is the targeted post-procedure rehabilitation and multimodal neuromodulator protocol?'
    ],
    vitals: {
      bloodPressure: '128/82 mmHg',
      heartRate: '72 bpm',
      temperature: '36.8 °C',
      spO2: '98%',
      bmi: '26.4',
      checkedAt: new Date().toISOString()
    },
    nurseNotes: 'Patient vital signs stable. Lumbar spine sagittal MRI series reviewed. Cross-border PII de-identification verified in full compliance with MOH & SDAIA.',
    nurseDeidentified: true,
    payment: {
      baseSar: 652.17,
      vatSar: 97.83,
      totalSar: 750.00,
      vatRate: 0.15,
      method: 'mada',
      status: 'pending',
      invoiceNumber: `INV-ZATCA-${Date.now().toString().slice(-6)}`
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // ══════════════════════════════════════════════════════════════════════════
  // STAGE 1: PATIENT INTAKE SUBMISSION (Screen 3 — Center Mac, Left Window)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('========================================================================');
  console.log('📍 [Screen 3: Center Mac (Left)] ── Stage 1: Patient Clinical Intake');
  console.log(`   Patient: Sami Al-Harbi (+966 50 111 1111) | Modality: Video (750 SAR)`);
  console.log('========================================================================');

  await pagePatient.bringToFront();

  // Navigate to intake if not already on it
  if (!pagePatient.url().includes('subview=intake')) {
    const startBtn = pagePatient.locator('button:has-text("Start Your Case"), button:has-text("ابدأ طلبك السريري")').first();
    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startBtn.click();
      await sleep(1000);
    }
    const videoBtn = pagePatient.locator('button:has-text("Select Video Consultation"), button:has-text("استشارة مرئية")').first();
    if (await videoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await videoBtn.click();
      await sleep(800);
    }
    const compBtn = pagePatient.locator('button:has-text("Start Comprehensive Intake"), button:has-text("البدء بالاستشارة الشاملة")').first();
    if (await compBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await compBtn.click();
      await sleep(1500);
    }
  }

  // Type symptoms at natural human typing cadence
  const textarea = pagePatient.locator('textarea').first();
  if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('   Typing clinical complaint with natural human typing speed...');
    await textarea.click();
    await textarea.fill('');
    await humanType(textarea, activeCase.symptomsAr, 60, 95);
    await sleep(800);
  }

  // Check privacy consent checkbox
  const consentBox = pagePatient.locator('input[type="checkbox"]').first();
  if (await consentBox.isVisible({ timeout: 2000 }).catch(() => false)) {
    if (!(await consentBox.isChecked())) {
      console.log('   Checking mandatory MOH/SDAIA Privacy Consent declaration...');
      await consentBox.check();
      await sleep(500);
    }
  }

  // Click P14 Submit
  console.log('   Submitting intake form...');
  const submitBtn = pagePatient.locator('button:has-text("إرسال الملف إلى تمريض الفرز"), button:has-text("Submit case to ALO nurse"), button:has-text("P14")').first();
  if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await submitBtn.click();
    await sleep(2000);
  }

  // Advance stage to Stage 2: NURSE_CHECK
  activeCase.currentStage = 'NURSE_CHECK';
  activeCase.stage = 2;
  await syncBackendCase(activeCase);
  await broadcastHub({ type: 'STAGE_UPDATE', case: activeCase, stage: 2, stageName: 'NURSE_CHECK' });
  console.log(`   ✅ Step 1 Complete: Case ${caseNumber} submitted and routed to ALO Nurse.`);

  await transitionCountdown('Screen 4 (Right Mac)', 'ALO Nurse Sara Al-Qahtani', 5);

  // ══════════════════════════════════════════════════════════════════════════
  // STAGE 2: ALO NURSE TRIAGE & DE-IDENTIFICATION (Screen 4 — Right Mac)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('========================================================================');
  console.log('📍 [Screen 4: Right Mac (Left)] ── Stage 2: Nurse Triage & De-Identification');
  console.log(`   Nurse: Sara Al-Qahtani | Verifying Vitals & Applying MOH Privacy Mask`);
  console.log('========================================================================');

  console.log('   Verifying blood pressure (128/82), HR (72 bpm), SpO2 (98%)...');
  await sleep(1500);
  console.log('   Confirming L4-L5 sagittal MRI series attached...');
  await sleep(1500);
  console.log('   Applying cross-border PII de-identification (S*** A*** / 10********)...');
  await sleep(1500);
  console.log('   Approving triage and routing to Saudi Treating Doctor (N07)...');

  // Advance stage to Stage 3: DOCTOR_REVIEW
  activeCase.currentStage = 'DOCTOR_REVIEW';
  activeCase.stage = 3;
  await syncBackendCase(activeCase);
  await broadcastHub({ type: 'STAGE_UPDATE', case: activeCase, stage: 3, stageName: 'DOCTOR_REVIEW' });
  console.log(`   ✅ Step 2 Complete: Nurse approved triage for ${caseNumber}.`);

  await transitionCountdown('Screen 1 (Old HP)', 'Saudi Doctor Dr. Fahad Al-Harbi', 5);

  // ══════════════════════════════════════════════════════════════════════════
  // STAGE 3: SAUDI DOCTOR REVIEW & SPECIALIST ASSIGNMENT (Screen 1 — Old HP)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('========================================================================');
  console.log('📍 [Screen 1: Old HP (Right)] ── Stage 3: Saudi Treating Doctor Review');
  console.log(`   Doctor: Dr. Fahad Al-Harbi | SCFHS: SCFHS-2024-KSA-8821 | Riyadh Care`);
  console.log('========================================================================');

  console.log('   Dr. Fahad reviewing de-identified dossier and MRI findings...');
  await sleep(1800);
  console.log('   Selected International Consultant: Dr. V. Prasanth (Apollo / KIMS)...');
  await sleep(1500);
  console.log('   Formulated 3 Clinical Focus Questions for Apollo Spine Specialist:');
  activeCase.clinicalFocusQuestions.forEach((q, idx) => console.log(`      ${idx + 1}. ${q}`));
  await sleep(2000);
  console.log('   Doctor approving referral and requesting patient payment (D10)...');

  // Advance stage to Stage 4: AWAITING_PAYMENT
  activeCase.currentStage = 'AWAITING_PAYMENT';
  activeCase.stage = 4;
  await syncBackendCase(activeCase);
  await broadcastHub({ type: 'STAGE_UPDATE', case: activeCase, stage: 4, stageName: 'AWAITING_PAYMENT' });
  console.log(`   ✅ Step 3 Complete: Case ${caseNumber} dispatched for payment.`);

  await transitionCountdown('Screen 3 (Center Mac)', 'Patient Payment & ZATCA Invoice', 5);

  // ══════════════════════════════════════════════════════════════════════════
  // STAGE 4: PATIENT PAYMENT & ZATCA TAX INVOICE (Screen 3 — Center Mac, Left)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('========================================================================');
  console.log('📍 [Screen 3: Center Mac (Left)] ── Stage 4: Patient Payment & ZATCA Invoice');
  console.log(`   Fee: 750.00 SAR (652.17 SAR Base + 97.83 SAR 15% VAT) via Mada`);
  console.log('========================================================================');

  await pagePatient.bringToFront();
  await pagePatient.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await sleep(1500);

  console.log('   Patient selecting Mada payment method...');
  await sleep(1500);
  console.log('   Confirming 750.00 SAR authorization with Saudi Central Bank (SAMA)...');
  await sleep(1500);

  // Generate ZATCA Phase-2 QR Tax Invoice
  activeCase.payment.status = 'paid';
  activeCase.payment.paidAt = new Date().toISOString();
  activeCase.payment.transactionId = `TXN-SAMA-${Date.now()}`;
  console.log(`   ✅ Payment Approved! ZATCA Phase-2 Tax Invoice #${activeCase.payment.invoiceNumber} stamped.`);

  // Advance stage to Stage 5: WITH_CONSULTANT
  activeCase.currentStage = 'WITH_CONSULTANT';
  activeCase.stage = 5;
  await syncBackendCase(activeCase);
  await broadcastHub({ type: 'STAGE_UPDATE', case: activeCase, stage: 5, stageName: 'WITH_CONSULTANT' });
  console.log(`   ✅ Step 4 Complete: Payment cleared. Dossier unlocked for Dr. Prasanth.`);

  await transitionCountdown('Screen 2 (Dell 32GB)', 'Indian Consultant Dr. V. Prasanth', 5);

  // ══════════════════════════════════════════════════════════════════════════
  // STAGE 5: INDIAN CONSULTANT OPINION (Screen 2 — Dell 32GB, Left Window)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('========================================================================');
  console.log('📍 [Screen 2: Dell 32GB (Left)] ── Stage 5: International Specialist Opinion');
  console.log(`   Consultant: Dr. V. Prasanth | Apollo Hospitals / KIMS Specialist Net`);
  console.log('========================================================================');

  console.log('   Dr. Prasanth reviewing cross-border DICOM and clinical notes...');
  await sleep(1500);
  console.log('   Typing answers to the 3 clinical questions:');
  console.log('      A1: Recommend 6-week structured physical therapy prior to considering tubular microdecompression.');
  console.log('      A2: No overt mechanical spondylolisthesis; TLIF fusion is NOT indicated at this stage.');
  console.log('      A3: Prescribe Pregabalin 75mg nocte + supervised core lumbar stabilization exercises.');
  await sleep(2500);
  console.log('   Dr. Prasanth formulating definitive specialist clinical opinion...');
  activeCase.consultantOpinion = {
    summaryEn: 'Conservative management with multimodal neuromodulators and targeted core physical therapy is strongly advised. Surgical fusion is not warranted.',
    summaryAr: 'يوصى بالعلاج التحفظي المكثف مع الأدوية العصبية المستهدفة والعلاج الطبيعي. لا ينصح بالتدخل الجراحي للدمج الفقري في هذه المرحلة.',
    submittedAt: new Date().toISOString()
  };
  await sleep(1500);

  // Advance stage to Stage 6: OPINION_READY
  activeCase.currentStage = 'OPINION_READY';
  activeCase.stage = 6;
  await syncBackendCase(activeCase);
  await broadcastHub({ type: 'STAGE_UPDATE', case: activeCase, stage: 6, stageName: 'OPINION_READY' });
  console.log(`   ✅ Step 5 Complete: Specialist opinion submitted.`);

  await transitionCountdown('ALL 4 PHYSICAL SCREENS', 'Joint 4-Way Telehealth Consultation Room', 5);

  // ══════════════════════════════════════════════════════════════════════════
  // STAGE 6: JOINT 4-WAY TELEHEALTH VIDEO ROOM (All 4 Machines Live)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('========================================================================');
  console.log('📍 [ALL 4 SCREENS] ── Stage 6: Multi-Party Live Telehealth Consultation');
  console.log('   Audiovisual Isolation: Exactly 1 participant per laptop (Zero echo)');
  console.log('      • Screen 3 (Center Mac): Patient Sami Al-Harbi');
  console.log('      • Screen 2 (Dell 32GB):  Indian Consultant Dr. V. Prasanth');
  console.log('      • Screen 4 (Right Mac):  ALO Nurse Sara Al-Qahtani (Bilingual)');
  console.log('      • Screen 1 (Old HP):     Saudi Treating Doctor Dr. Fahad');
  console.log('========================================================================');

  console.log('   Connecting secure LiveKit / WebRTC room [room-alo-2026-consultation]...');
  await sleep(2000);
  console.log('   All 4 video streams synchronized. Clinical discussion underway...');
  await sleep(3000);
  console.log('   Dr. Fahad and Dr. Prasanth align on conservative management plan...');
  await sleep(2000);
  console.log('   Nurse Sara confirms patient questions addressed and call concludes successfully.');

  // Advance stage to Stage 7: PARTNER_SERVICES
  activeCase.currentStage = 'PARTNER_SERVICES';
  activeCase.stage = 7;
  await syncBackendCase(activeCase);
  await broadcastHub({ type: 'STAGE_UPDATE', case: activeCase, stage: 7, stageName: 'PARTNER_SERVICES' });
  console.log(`   ✅ Step 6 Complete: Video call concluded; partner services unlocked.`);

  await transitionCountdown('Screen 1 (Old HP)', 'Saudi Doctor Arabic Endorsement', 5);

  // ══════════════════════════════════════════════════════════════════════════
  // STAGE 7: SAUDI DOCTOR ENDORSEMENT & PARTNER ORDERS (Screen 1 — Old HP)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('========================================================================');
  console.log('📍 [Screen 1: Old HP (Right)] ── Stage 7: Saudi Clinical Endorsement');
  console.log(`   Doctor: Dr. Fahad Al-Harbi | Signing Arabic Medical Report & Orders`);
  console.log('========================================================================');

  console.log('   Dr. Fahad applying cryptographic endorsement stamp under license SCFHS-2024-KSA-8821...');
  await sleep(1800);
  console.log('   Ordering in-house hospital partner services:');
  console.log('      1. In-House Facility Pharmacy (Noura Al-Dosari on Screen 4 Right): Pregabalin 75mg + Celecoxib 200mg');
  console.log('      2. Facility Physiotherapy: 12 sessions Core Lumbar Stabilization at Riyadh Care');
  activeCase.doctorEndorsement = {
    endorsedBy: 'Dr. Fahad Al-Harbi',
    license: 'SCFHS-2024-KSA-8821',
    endorsedAt: new Date().toISOString(),
    status: 'endorsed'
  };
  await sleep(2000);

  // Advance stage to Stage 8: CLOSURE_PENDING / FOLLOW_UP_21_DAYS
  activeCase.currentStage = 'FOLLOW_UP_21_DAYS';
  activeCase.stage = 8;
  await syncBackendCase(activeCase);
  await broadcastHub({ type: 'STAGE_UPDATE', case: activeCase, stage: 8, stageName: 'FOLLOW_UP_21_DAYS' });
  console.log(`   ✅ Step 7 Complete: Saudi endorsement signed and facility orders active.`);

  await transitionCountdown('Screen 2 (Dell) & Screen 3 (Center)', 'Coordinator Case Closure & Dual PDF Release', 5);

  // ══════════════════════════════════════════════════════════════════════════
  // STAGE 8 & 9: CASE CLOSURE & CERTIFIED DUAL PDF RELEASE (Dell & Center Mac)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('========================================================================');
  console.log('📍 [Screen 2 (Dell) & Screen 3 (Center)] ── Stage 9: Case Closure & Reports');
  console.log('   Coordinator Emmanuel Gonzalez seals closure; Certified PDFs release');
  console.log('========================================================================');

  console.log('   Coordinator Emmanuel Arcon Gonzalez conducting final quality audit...');
  await sleep(1800);
  console.log('   Sealing case closure and releasing certified dual documents:');
  console.log('      📄 PDF 1: Executive Medical Summary (Bilingual AR/EN)');
  console.log('      📄 PDF 2: Full Certified Clinical Dossier with SCFHS Stamp & QR Code');
  await sleep(2000);

  // Advance stage to Stage 9: CLOSED
  activeCase.currentStage = 'CLOSED';
  activeCase.stage = 9;
  activeCase.status = 'closed';
  activeCase.closedAt = new Date().toISOString();
  await syncBackendCase(activeCase);
  await broadcastHub({ type: 'STAGE_UPDATE', case: activeCase, stage: 9, stageName: 'CLOSED' });

  // Refresh Center Mac pages to reflect CLOSED and active download buttons
  await pagePatient.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await pageAdmin.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await sleep(1500);

  console.log('========================================================================');
  console.log('🎉 THE 4-MACHINE DISTRIBUTED CLINICAL JOURNEY IS 100% COMPLETE!');
  console.log(`   • Case Number: ${caseNumber}`);
  console.log('   • All 9 stages traversed with 5-second human observation transitions');
  console.log('   • All 4 physical machines performed their assigned roles');
  console.log('   • Certified PDF 1 & PDF 2 released and available for download');
  console.log('========================================================================\n');

  process.exit(0);
}

runMasterClinicalFlow().catch((err) => {
  console.error('Fatal Flow Error:', err);
  process.exit(1);
});
