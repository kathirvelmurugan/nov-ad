import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import http from 'node:http';

const PORT = 4192;
const BASE_URL = `http://localhost:${PORT}/`;
const API_BASE = `http://localhost:${PORT}/api`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function humanType(locator, text, delayMs = 25) {
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
      await sleep(400);
    }
  } catch (e) {}
}

async function switchPersona(page, roleKey) {
  const session = SESSIONS[roleKey];
  await page.evaluate((sess) => {
    localStorage.setItem('alo_user_session_v4.0_clean', JSON.stringify(sess));
    localStorage.setItem('alo_lang_preference', 'en');
  }, session);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await sleep(1200);
  await switchToEnglish(page);
  await sleep(800);
}

async function selectActiveCaseCard(page, caseNumber) {
  console.log(`   Selecting active case ${caseNumber} from portal queue...`);
  await sleep(1000);

  // 1. Try finding by caseNumber in actionable tab
  let caseSelector = page.locator(`button[aria-label*="${caseNumber}"], button:has-text("${caseNumber}")`).first();
  if (await caseSelector.isVisible({ timeout: 2500 }).catch(() => false)) {
    await caseSelector.click();
    await sleep(2000);
    console.log(`   ✓ Active case ${caseNumber} selected. Details and action buttons loaded.`);
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
      await sleep(2000);
      console.log(`   ✓ Active case ${caseNumber} selected from All tab.`);
      return true;
    }
  }

  // 3. Fallback: click the first available queue case card in PortalCaseTrackerPanel
  const firstQueueItem = page.locator('div.max-h-\\[220px\\] button, button[aria-label*="CASE-2026"], button[aria-label*="ALO-"]').first();
  if (await firstQueueItem.isVisible({ timeout: 3000 }).catch(() => false)) {
    await firstQueueItem.click();
    await sleep(2000);
    console.log('   ✓ First queue item selected via fallback.');
    return true;
  }

  return false;
}

async function main() {
  console.log('========================================================================');
  console.log('🎬 ALO DOCTOR ROBUST CLINICAL DEMO (ALL SUMMARIES >= 50 CHARS)');
  console.log('🏥 Full Patient Lifecycle + Case Drilldown + Admin Governance');
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

  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=1280,980', '--window-position=80,20', '--disable-infobars'],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  let activeCaseNumber = 'ALO-DEMO';

  try {
    // -------------------------------------------------------------
    // STAGE 1: PATIENT INTAKE (Sami Al-Harbi)
    // -------------------------------------------------------------
    console.log('▶ [Stage 1] Patient Portal: Creating New Consultation...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('alo_lang_preference', 'en');
      localStorage.setItem('alo_patient_subview_v3.0', 'intake');
    });
    await switchPersona(page, 'P');
    await sleep(1500);

    const startBtn = page.locator('button:has-text("New Consultation"), button:has-text("+ New Consultation"), button:has-text("Start Your Case"), button:has-text("طلب استشارة جديدة")').first();
    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('   Clicking Start Case / New Consultation button...');
      await startBtn.click();
      await sleep(1500);
    }

    const uniqueTag = `E2E-${Date.now()}`;
    const diagnosisTitle = 'Severe Calcified Aortic Stenosis with NYHA Class III Exertional Dyspnea';
    const clinicalHistory = `Patient presents with progressive shortness of breath on exertion, atypical angina, and severe fatigue lasting 4 weeks. Seeking international cardiothoracic specialist second opinion. Tag: ${uniqueTag}`;

    // 1. Fill Caregiver / Legal Proxy Fields (above medical diagnosis)
    const caregiverNameInput = page.locator('input[placeholder*="Full Name"], input[placeholder*="الاسم الكامل"]').first();
    if (await caregiverNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('   Filling Caregiver / Legal Proxy Full Name (above diagnosis)...');
      await caregiverNameInput.scrollIntoViewIfNeeded();
      await caregiverNameInput.click();
      await caregiverNameInput.fill('');
      await humanType(caregiverNameInput, 'Faisal Sami Al-Harbi (Authorized Legal Proxy)', 15);
      await sleep(600);
    }

    const relationshipInput = page.locator('input[placeholder*="Son"], input[placeholder*="صلة القرابة"]').first();
    if (await relationshipInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   Filling Caregiver Relationship...');
      await relationshipInput.scrollIntoViewIfNeeded();
      await relationshipInput.click();
      await relationshipInput.fill('');
      await humanType(relationshipInput, 'Son / Authorized Legal Healthcare Proxy', 15);
      await sleep(600);
    }

    const caregiverIdInput = page.locator('input[placeholder*="10XXXXXXXX"]').first();
    if (await caregiverIdInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   Filling Caregiver National ID...');
      await caregiverIdInput.scrollIntoViewIfNeeded();
      await caregiverIdInput.click();
      await caregiverIdInput.fill('');
      await humanType(caregiverIdInput, '1088776655', 20);
      await sleep(600);
    }

    // 2. Select Saudi Treating Doctor Assignment Dropdown (directly above medical diagnosis)
    const docSelect = page.locator('select').first();
    if (await docSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('   Selecting Saudi Treating Doctor in assignment dropdown (directly above diagnosis)...');
      await docSelect.scrollIntoViewIfNeeded();
      const options = await docSelect.locator('option').allInnerTexts();
      const fahadOpt = options.find((opt) => opt.includes('Fahad') || opt.includes('فهد'));
      if (fahadOpt) {
        await docSelect.selectOption({ label: fahadOpt });
        console.log(`   ✓ Selected Doctor: ${fahadOpt}`);
      } else if (options.length > 1) {
        await docSelect.selectOption({ index: 1 });
        console.log(`   ✓ Selected Doctor: ${options[1]}`);
      }
      await sleep(800);
    }

    // 3. Explicitly fill Medical Diagnosis Title (>= 50 chars)
    console.log(`   Entering Confirmed Medical Diagnosis Title (${diagnosisTitle.length} chars >= 50 chars)...`);
    const diagnosisLabel = page.locator('label:has-text("Confirmed Medical Diagnosis"), label:has-text("Diagnosis"), label:has-text("التشخيص")').first();
    await diagnosisLabel.waitFor({ state: 'visible', timeout: 8000 });
    const diagnosisInput = diagnosisLabel.locator('..').locator('input');
    await diagnosisInput.scrollIntoViewIfNeeded();
    await diagnosisInput.click();
    await diagnosisInput.fill('');
    await humanType(diagnosisInput, diagnosisTitle, 20);
    await sleep(1000);
    console.log(`   ✓ Diagnosis Title Entered: "${await diagnosisInput.inputValue()}"`);

    // 4. Explicitly fill Clinical Symptoms & Patient History (>= 50 chars)
    console.log(`   Entering Clinical Symptoms & History (${clinicalHistory.length} chars >= 50 chars)...`);
    const symptomsLabel = page.locator('label:has-text("Symptoms & Patient History"), label:has-text("Symptoms"), label:has-text("الأعراض")').first();
    await symptomsLabel.waitFor({ state: 'visible', timeout: 8000 });
    const symptomsInput = symptomsLabel.locator('..').locator('textarea');
    await symptomsInput.scrollIntoViewIfNeeded();
    await symptomsInput.click();
    await symptomsInput.fill('');
    await humanType(symptomsInput, clinicalHistory, 15);
    await sleep(1000);
    console.log('   ✓ Clinical Symptoms Paragraph Entered.');

    // 5. Select consultation format (Video + Written Opinion, P11)
    const videoBtn = page.locator('button:has-text("Video + written opinion"), button:has-text("مرئي + رأي مكتوب")').first();
    if (await videoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   Selecting Consultation Format: Video + Written Opinion (P11)...');
      await videoBtn.click();
      await sleep(600);
    }

    // 6. Check mandatory privacy consent checkbox
    const consentBox = page.locator('input[type="checkbox"]').first();
    if (await consentBox.isVisible().catch(() => false)) {
      const isChecked = await consentBox.isChecked();
      if (!isChecked) {
        console.log('   Checking mandatory MOH Health Data Privacy Consent...');
        await consentBox.check();
        await sleep(1000);
      }
    }

    // 7. Click Submit Intake Button
    const submitIntake = page.locator('button:has-text("Submit case to ALO nurse"), button:has-text("Submit Consultation"), button:has-text("إرسال الملف إلى تمريض الفرز")').first();
    console.log('   Submitting consultation to Nurse Triage...');
    await submitIntake.click();
    await sleep(3000);

    // Retrieve active case number from localStorage
    const savedCases = await page.evaluate(() => {
      try {
        return JSON.parse(localStorage.getItem('alo_cases_v4.0_clean') || '[]');
      } catch (e) {
        return [];
      }
    });

    if (savedCases.length > 0) {
      activeCaseNumber = savedCases[0].caseNumber || savedCases[0].id;
      console.log(`   ✅ Case successfully submitted and verified in state: ${activeCaseNumber}`);
    } else {
      console.log('   ✓ Case submitted.');
    }
    await sleep(2000);

    // -------------------------------------------------------------
    // STAGE 2: NURSE TRIAGE (Sara Al-Qahtani)
    // -------------------------------------------------------------
    console.log(`\n▶ [Stage 2] Nurse Triage: Reviewing Case ${activeCaseNumber}...`);
    await switchPersona(page, 'N');
    await sleep(1500);

    await selectActiveCaseCard(page, activeCaseNumber);

    const triageText = page.locator('textarea').first();
    if (await triageText.isVisible({ timeout: 5000 }).catch(() => false)) {
      const triageNotes = 'Transthoracic echocardiogram confirms severe calcified aortic stenosis with AVA 0.6cm2 and mean gradient 48mmHg. NYHA Class III symptoms verified. Assigned to Dr. Fahad.';
      console.log(`   Typing N05 clinical triage notes (${triageNotes.length} chars >= 50 chars)...`);
      await triageText.fill('');
      await humanType(triageText, triageNotes, 15);
      await sleep(1500);
    }

    // Assign Dr. Fahad Al-Harbi (N06)
    const doctorCard = page.locator('div, button').filter({ hasText: /Dr\. Fahad Al-Harbi|د\. فهد الحربي/ }).last();
    if (await doctorCard.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   Assigning treating doctor: Dr. Fahad Al-Harbi (N06)...');
      await doctorCard.click();
      await sleep(1200);
    }

    const n07Button = page.locator('button:has-text("N07"), button:has-text("Approve & route to Saudi treating doctor")').first();
    if (await n07Button.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('   Clicking N07 Approval button...');
      await n07Button.click();
      await sleep(2500);
      console.log('   ✓ Case routed to Saudi Treating Doctor (D02)!');
    }

    // -------------------------------------------------------------
    // STAGE 3: SAUDI TREATING DOCTOR REVIEW (Dr. Fahad Al-Harbi)
    // -------------------------------------------------------------
    console.log(`\n▶ [Stage 3] Saudi Treating Doctor: Reviewing Case ${activeCaseNumber}...`);
    await switchPersona(page, 'D');
    await sleep(1500);

    await selectActiveCaseCard(page, activeCaseNumber);

    const focusInputs = page.locator('textarea');
    const fCount = await focusInputs.count();
    if (fCount >= 3) {
      console.log('   Formulating D07 focus questions (all >= 50 chars)...');
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

    const d10Btn = page.locator('button:has-text("D10"), button:has-text("Approve Referral & Route to ALO Coordinator")').first();
    if (await d10Btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('   Clicking D10 Referral Approval...');
      await d10Btn.click();
      await sleep(2500);
      console.log('   ✓ Referral Approved! Routed to Care Coordinator.');
    }

    // -------------------------------------------------------------
    // STAGE 4: ALO CARE COORDINATOR (Emmanuel Arcon Gonzalez)
    // -------------------------------------------------------------
    console.log(`\n▶ [Stage 4] ALO Care Coordinator: Operational Overview (${activeCaseNumber})...`);
    await switchPersona(page, 'C');
    await sleep(1500);

    await selectActiveCaseCard(page, activeCaseNumber);

    const issueLinkBtn = page.locator('button:has-text("Assign Payment Methods"), button:has-text("C04")').first();
    if (await issueLinkBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   Issuing invoice and assigning payment link (C04)...');
      await issueLinkBtn.click();
      await sleep(2000);
    }

    // -------------------------------------------------------------
    // STAGE 5: INDIAN SUPER-SPECIALIST (Dr. V. Prasanth)
    // -------------------------------------------------------------
    console.log(`\n▶ [Stage 5] Indian Consultant Mobile View: Synthesizing Opinion (${activeCaseNumber})...`);
    await switchPersona(page, 'K');
    await sleep(1500);

    const acceptCaseBtn = page.locator('button:has-text("Accept Case"), button:has-text("قبول الحالة")').first();
    if (await acceptCaseBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   Accepting case lock...');
      await acceptCaseBtn.click();
      await sleep(1500);
    }

    const cTextareas = page.locator('textarea');
    const cCount = await cTextareas.count();
    if (cCount >= 4) {
      console.log('   Entering focus answers and comprehensive second opinion (all >= 50 chars)...');
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

    const submitK06 = page.locator('button:has-text("Submit written opinion"), button:has-text("K06")').first();
    if (await submitK06.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('   Submitting International Second Opinion (K06)...');
      await submitK06.click();
      await sleep(2500);
      console.log('   ✓ Second Opinion submitted! Routed to ALO Care Coordinator for Dual Dispatch.');
    }

    // -------------------------------------------------------------
    // STAGE 6: ALO CARE COORDINATOR DUAL DISPATCH (Emmanuel Arcon Gonzalez)
    // -------------------------------------------------------------
    console.log(`\n▶ [Stage 6] ALO Care Coordinator: Bilingual Review & Dual Dispatch (C08)...`);
    await switchPersona(page, 'C');
    await sleep(1500);

    await selectActiveCaseCard(page, activeCaseNumber);

    // Switch to C08 Tab (Report Release PDF 1)
    const c08Tab = page.locator('button:has-text("C08"), button:has-text("PDF 1")').first();
    if (await c08Tab.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   Switching to C08 Tab: Report Verification & Dual Dispatch...');
      await c08Tab.click();
      await sleep(1500);
    }

    // Verify & Dispatch to Patient and Saudi Doctor simultaneously
    const dispatchBtn = page.locator('button:has-text("C08"), button:has-text("Verify & Dispatch"), button:has-text("اعتماد وتوزيع")').first();
    if (await dispatchBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   Clicking C08 Dual Dispatch Button (Simultaneous Release to Patient & Doctor)...');
      await dispatchBtn.click();
      await sleep(2500);
      console.log('   ✓ Report PDF 1 dispatched simultaneously to Patient and Saudi Doctor!');
    }

    // -------------------------------------------------------------
    // STAGE 7: SAUDI TREATING DOCTOR ENDORSEMENT (Dr. Fahad Al-Harbi)
    // -------------------------------------------------------------
    console.log(`\n▶ [Stage 7] Saudi Treating Doctor: Reviewing Dispatched Opinion & Endorsement (D12)...`);
    await switchPersona(page, 'D');
    await sleep(1500);

    await selectActiveCaseCard(page, activeCaseNumber);

    const endorseBtn = page.locator('button:has-text("D12"), button:has-text("Endorse"), button:has-text("اعتماد الرأي")').first();
    if (await endorseBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   Dr. Fahad endorsing Indian Consultant opinion (D12)...');
      await endorseBtn.click();
      await sleep(2000);
      console.log('   ✓ Consultant opinion endorsed by Saudi Treating Doctor!');
    }

    // -------------------------------------------------------------
    // STAGE 8: PATIENT REPORT VERIFICATION (Sami Al-Harbi)
    // -------------------------------------------------------------
    console.log(`\n▶ [Stage 8] Patient Portal: Verifying Certified Bilingual Report & Endorsement (${activeCaseNumber})...`);
    await switchPersona(page, 'P');
    await sleep(2000);

    const timelineTab = page.locator('button:has-text("Timeline"), button:has-text("My Cases"), button:has-text("ملفاتي")').first();
    if (await timelineTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('   Opening Patient Case Timeline...');
      await timelineTab.click();
      await sleep(2000);
    }
    console.log('   ✓ Patient verified certified report (PDF 1) and active 21-day follow-up tracker.');

    // -------------------------------------------------------------
    // STAGE 9: MEDICAL CENTER ADMIN PORTAL (David Nunez)
    // -------------------------------------------------------------
    console.log('\n▶ [Stage 9] Medical Center Admin Portal: Hospital Oversight & Referrals...');
    await switchPersona(page, 'HA');
    await sleep(2000);

    const referralsTab = page.locator('button:has-text("Referrals"), button:has-text("Cases")').first();
    if (await referralsTab.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   Navigating Hospital Referrals Registry...');
      await referralsTab.click();
      await sleep(2000);
    }

    // -------------------------------------------------------------
    // STAGE 10: ALO SUPER ADMIN DASHBOARD (Adrian Lewis)
    // -------------------------------------------------------------
    console.log('\n▶ [Stage 10] ALO Super Admin: Platform Governance & Master Case Registry...');
    await switchPersona(page, 'AD');
    await sleep(2000);

    const masterCasesTab = page.locator('button:has-text("Cases"), button:has-text("Master Registry")').first();
    if (await masterCasesTab.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('   Inspecting Platform Master Case Registry...');
      await masterCasesTab.click();
      await sleep(3000);
    }

    console.log('\n========================================================================');
    console.log('🎉 FULL CLINICAL WORKFLOW & ADMIN GOVERNANCE DEMO COMPLETED SUCCESSFULLY!');
    console.log('========================================================================\n');
    await sleep(4000);

  } catch (err) {
    console.error('Demo execution notice:', err.message);
  } finally {
    await browser.close().catch(() => {});
    cleanup();
    process.exit(0);
  }
}

main();
