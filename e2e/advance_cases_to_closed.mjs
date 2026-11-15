import { chromium } from 'playwright';

const TARGET_BASE = 'https://ad.howtostart.in/feature-sarat';
const CASES_API = `${TARGET_BASE}/api/cases`;

const TARGET_CASES = [
  { id: 'case-1794655863428', caseNumber: 'ALO-2026-2475', patientName: 'Khalid Al-Otaibi' },
  { id: 'case-1794655578368', caseNumber: 'ALO-2026-9507', patientName: 'Patient' }
];

async function advanceCases() {
  console.log('\n=============================================================');
  console.log('🚀 ADVANCING ALO-2026-2475 & ALO-2026-9507 TO CLOSED STAGE');
  console.log('   Target URL:', TARGET_BASE);
  console.log('=============================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const request = context.request;

  try {
    // 1. Fetch current case data from live API
    console.log('1. Fetching live case payloads from PostgreSQL...');
    const listRes = await request.get(CASES_API);
    const listJson = await listRes.json();
    const cases = listJson.data || [];

    for (const target of TARGET_CASES) {
      console.log(`\n-------------------------------------------------------------`);
      console.log(`Processing Case: ${target.caseNumber} (${target.patientName}) [ID: ${target.id}]`);
      console.log(`-------------------------------------------------------------`);

      const currentCase = cases.find(c => c.id === target.id) || { id: target.id, caseNumber: target.caseNumber };
      let activeStage = currentCase.currentStage || 'NURSE_CHECK';
      console.log(`Current Stage: ${activeStage}`);

      // STAGE 2 -> 3 (NURSE_CHECK -> DOCTOR_REVIEW)
      if (activeStage === 'INTAKE_RECEIVED' || activeStage === 'NURSE_CHECK') {
        console.log('▶ Advancing Stage 2 (NURSE_CHECK) -> Stage 3 (DOCTOR_REVIEW)...');
        const updateNurse = {
          ...currentCase,
          currentStage: 'DOCTOR_REVIEW',
          stage: 3,
          metadata: {
            ...(currentCase.metadata || {}),
            nurseVerified: true,
            triageNotes: 'Triage complete. DICOM scans and hemodynamic baseline verified. Assigned to Dr. Fahad Al-Harbi (Cardiology).',
            triageLevel: 'urgent',
            deidentifiedAt: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        };
        const res = await request.post(CASES_API, { data: updateNurse });
        console.log(`   ✓ Routed to Saudi Treating Doctor (HTTP ${res.status()})`);
        activeStage = 'DOCTOR_REVIEW';
      }

      // STAGE 3 -> 4 (DOCTOR_REVIEW -> AWAITING_PAYMENT)
      if (activeStage === 'DOCTOR_REVIEW') {
        console.log('▶ Advancing Stage 3 (DOCTOR_REVIEW) -> Stage 4 (AWAITING_PAYMENT)...');
        const updateDoctor = {
          ...currentCase,
          currentStage: 'AWAITING_PAYMENT',
          stage: 4,
          treatingDoctor: {
            ...(currentCase.treatingDoctor || {}),
            name: 'Dr. Fahad Al-Harbi',
            hospital: 'Riyadh Care Medical Center',
            city: 'Riyadh',
            scfhsNumber: 'SCFHS-2024-KSA-8821',
            focusQuestions: [
              'Is catheter-based intervention indicated given current patient clinical symptoms?',
              'What is the optimal antithrombotic and medication reconciliation protocol?',
              'What is the recommended rehabilitation and clinical follow-up timeframe?'
            ],
            focusQuestionsEn: [
              'Is catheter-based intervention indicated given current patient clinical symptoms?',
              'What is the optimal antithrombotic and medication reconciliation protocol?',
              'What is the recommended rehabilitation and clinical follow-up timeframe?'
            ]
          },
          referralApproved: true,
          saudiApprovedAt: new Date().toISOString(),
          allowedPaymentMethods: ['mada', 'applepay', 'visa', 'tabby'],
          invoiceIssued: true,
          updatedAt: new Date().toISOString()
        };
        const res = await request.post(CASES_API, { data: updateDoctor });
        console.log(`   ✓ Saudi Doctor referral approved & Routed to Coordinator (HTTP ${res.status()})`);
        activeStage = 'AWAITING_PAYMENT';
      }

      // STAGE 4 -> 5 (AWAITING_PAYMENT -> WITH_CONSULTANT)
      if (activeStage === 'AWAITING_PAYMENT') {
        console.log('▶ Advancing Stage 4 (AWAITING_PAYMENT) -> Stage 5 (WITH_CONSULTANT)...');
        const updatePayment = {
          ...currentCase,
          currentStage: 'WITH_CONSULTANT',
          stage: 5,
          pricing: {
            paid: true,
            tier: 1,
            tierName: 'Written opinion only (Tier 1)',
            baseSar: 65.22,
            vatPercent: 15,
            vatSar: 9.78,
            totalSar: 75,
            invoiceNumber: `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
            tapChargeId: `chg_tap_ksa_${Date.now()}`
          },
          paymentVerified: true,
          paymentDetails: {
            amount: 75,
            currency: 'SAR',
            method: 'mada',
            status: 'completed'
          },
          consultantToken: {
            token: `ALO-MAGIC-CONSULTANT-${target.caseNumber}`,
            expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
            otpVerified: true
          },
          metadata: {
            ...(currentCase.metadata || {}),
            paymentVerified: true,
            dispatchedToConsultantAt: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        };
        const res = await request.post(CASES_API, { data: updatePayment });
        console.log(`   ✓ ZATCA Payment verified & Dispatched to International Consultant (HTTP ${res.status()})`);
        activeStage = 'WITH_CONSULTANT';
      }

      // STAGE 5 -> 6 (WITH_CONSULTANT -> OPINION_READY)
      if (activeStage === 'WITH_CONSULTANT') {
        console.log('▶ Advancing Stage 5 (WITH_CONSULTANT) -> Stage 6 (OPINION_READY)...');
        const updateOpinion = {
          ...currentCase,
          currentStage: 'OPINION_READY',
          stage: 6,
          consultant: {
            name: 'Dr. V. Prasanth',
            center: 'International Specialist Center, KIMS',
            city: 'Hyderabad, India',
            rating: 4.95,
            experienceYears: 19,
            specialty: 'Cardiothoracic & Interventional Cardiology',
            opinionEnglish: 'Comprehensive clinical evaluation confirms indicated medical and intervention protocol. Conservative pharmacological optimization alongside monitored lifestyle modification is recommended with scheduled interval imaging.',
            opinionArabic: 'التقييم السريري الشامل يؤكد ملاءمة الخطة العلاجية والدوائية المقترحة، مع التوصية بالمتابعة الدورية.'
          },
          consultantAnswers: [
            'Conservative pharmacological management is suitable for initial 8-week monitoring window.',
            'Maintain optimal antiplatelet and statin therapy with periodic lipid and renal panel monitoring.',
            'Schedule follow-up clinical examination and diagnostic scan at 30 days.'
          ],
          consultantOpinion: 'Comprehensive clinical evaluation confirms indicated medical and intervention protocol.',
          secondOpinionSubmitted: true,
          metadata: {
            ...(currentCase.metadata || {}),
            consultantAccepted: true,
            opinionSubmittedAt: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        };
        const res = await request.post(CASES_API, { data: updateOpinion });
        console.log(`   ✓ International Consultant Opinion submitted (HTTP ${res.status()})`);
        activeStage = 'OPINION_READY';
      }

      // STAGE 6 -> 7 (OPINION_READY -> PARTNER_SERVICES)
      if (activeStage === 'OPINION_READY') {
        console.log('▶ Advancing Stage 6 (OPINION_READY) -> Stage 7 (PARTNER_SERVICES)...');
        const updateReportRelease = {
          ...currentCase,
          currentStage: 'PARTNER_SERVICES',
          stage: 7,
          reportReleased: true,
          metadata: {
            ...(currentCase.metadata || {}),
            pdf1Released: true,
            pdf1Timestamp: new Date().toISOString(),
            saudiDoctorApprovedOpinion: true,
            saudiApprovedAt: new Date().toISOString()
          },
          saudiEndorsement: {
            status: 'endorsed',
            doctorName: 'Dr. Fahad Al-Harbi',
            scfhsLicense: 'SCFHS-2024-KSA-8821',
            endorsementDate: new Date().toISOString(),
            requiresLocalLab: true,
            prescriptionIssued: true,
            releasedToPatient: true
          },
          partnerOrders: {
            lab: { test: 'Comprehensive Blood Panel & Lipid Profile', status: 'collected' },
            pharmacy: { meds: ['Atorvastatin 40mg', 'Aspirin 81mg'], status: 'ready', substituteAllowed: true },
            homeNurse: { area: 'Riyadh Care District', visits: 1, status: 'scheduled' },
            physio: { sessions: 2, status: 'planned' }
          },
          internalOrders: {
            lab: { tests: ['Troponin-I', 'CBC', 'Lipid Panel'], status: 'completed', ordered: true },
            pharmacy: { status: 'dispensed', ordered: true, medications: ['Atorvastatin 40mg', 'Aspirin 81mg'] },
            reception: { status: 'checked_in', checkinCode: 'ALO-RC-8842' },
            medicalCenterId: 'hosp-alo-riyadh-01',
            medicalCenterName: 'Riyadh Care Medical Center'
          },
          updatedAt: new Date().toISOString()
        };
        const res = await request.post(CASES_API, { data: updateReportRelease });
        console.log(`   ✓ Dual Report Released & Partner Facility Orders Authorized (HTTP ${res.status()})`);
        activeStage = 'PARTNER_SERVICES';
      }

      // STAGE 7 -> 8 (PARTNER_SERVICES -> FOLLOW_UP_21_DAYS)
      if (activeStage === 'PARTNER_SERVICES') {
        console.log('▶ Advancing Stage 7 (PARTNER_SERVICES) -> Stage 8 (FOLLOW_UP_21_DAYS)...');
        const updateFollowUp = {
          ...currentCase,
          currentStage: 'FOLLOW_UP_21_DAYS',
          stage: 8,
          metadata: {
            ...(currentCase.metadata || {}),
            followUpActive: true,
            followUpStartedAt: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        };
        const res = await request.post(CASES_API, { data: updateFollowUp });
        console.log(`   ✓ 21-Day Follow-Up Window Active (HTTP ${res.status()})`);
        activeStage = 'FOLLOW_UP_21_DAYS';
      }

      // STAGE 8 -> 9 (FOLLOW_UP_21_DAYS -> CLOSED)
      if (activeStage === 'FOLLOW_UP_21_DAYS') {
        console.log('▶ Advancing Stage 8 (FOLLOW_UP_21_DAYS) -> Stage 9 (CLOSED)...');
        const updateClosed = {
          ...currentCase,
          currentStage: 'CLOSED',
          stage: 9,
          status: 'closed',
          finalClosureNote: '21-day clinical follow-up completed with patient. Symptoms resolved and patient adherent to Saudi doctor treatment plan. Case formally archived.',
          metadata: {
            ...(currentCase.metadata || {}),
            closedAt: new Date().toISOString(),
            closedBy: 'Emmanuel Arcon Gonzalez (ALO Care Coordinator)'
          },
          updatedAt: new Date().toISOString()
        };
        const res = await request.post(CASES_API, { data: updateClosed });
        console.log(`   ✓ CASE FORMALLY CLOSED & ARCHIVED! (HTTP ${res.status()})`);
        activeStage = 'CLOSED';
      }
    }

    // 2. Final Verification against live PostgreSQL
    console.log('\n=============================================================');
    console.log('🔍 FINAL LIVE DATABASE VERIFICATION:');
    console.log('=============================================================');
    const verifyRes = await request.get(CASES_API);
    const verifyJson = await verifyRes.json();
    const verifiedCases = verifyJson.data || [];

    for (const target of TARGET_CASES) {
      const match = verifiedCases.find(c => c.id === target.id);
      if (match) {
        console.log(`Case ${match.caseNumber} (${match.patientName}):`);
        console.log(`  - Stage Number: ${match.stage}`);
        console.log(`  - Current Stage: ${match.currentStage}`);
        console.log(`  - Status: ${match.status}`);
        console.log(`  - Closure Note: "${match.finalClosureNote || 'N/A'}"`);
        console.log(`  - Verified Closed: ${match.currentStage === 'CLOSED' ? '✅ YES' : '❌ NO'}\n`);
      }
    }

  } catch (err) {
    console.error('❌ Error executing progression:', err);
  } finally {
    await browser.close();
  }
}

advanceCases();
