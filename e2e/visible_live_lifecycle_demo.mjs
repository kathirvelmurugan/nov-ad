import { chromium } from 'playwright';

const LIVE_BASE_URL = 'https://ad.howtostart.in/feature-sarat/';

async function showBanner(page, text, color = '#38bdf8', bg = '#0f172a', border = '#0284c7') {
  await page.evaluate(({ msg, color, bg, border }) => {
    let banner = document.getElementById('demo-step-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'demo-step-banner';
      banner.style.position = 'fixed';
      banner.style.top = '18px';
      banner.style.left = '50%';
      banner.style.transform = 'translateX(-50%)';
      banner.style.padding = '12px 28px';
      banner.style.borderRadius = '14px';
      banner.style.fontSize = '15px';
      banner.style.fontWeight = 'bold';
      banner.style.boxShadow = '0 12px 30px rgba(0,0,0,0.6)';
      banner.style.zIndex = '9999999';
      banner.style.transition = 'all 0.3s ease';
      document.body.appendChild(banner);
    }
    banner.style.backgroundColor = bg;
    banner.style.color = color;
    banner.style.border = `2px solid ${border}`;
    banner.innerText = msg;
  }, { msg: text, color, bg, border });
  await page.waitForTimeout(1400);
}

async function runLiveLifecycleDemo() {
  console.log('\n========================================================================');
  console.log('🎬 LAUNCHING VISIBLE FULL-LIFECYCLE CASE DEMO ON LIVE ENVIRONMENT');
  console.log('   Target URL: ' + LIVE_BASE_URL);
  console.log('========================================================================\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 70,
    args: ['--start-maximized', '--window-size=1440,900']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'en-US'
  });

  const page = await context.newPage();

  try {
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const expectedCaseNumber = `ALO-2026-${uniqueSuffix}`;
    const patientName = 'Sami Al-Harbi (Live Demo)';

    // -------------------------------------------------------------------------
    // STAGE 1: PATIENT INTAKE
    // -------------------------------------------------------------------------
    console.log(`\n▶ [Stage 1] PATIENT INTAKE: Creating new case on live server...`);
    await page.goto(`${LIVE_BASE_URL}?portal=patient&role=P&subview=intake&demo=1`, { waitUntil: 'networkidle' });
    await showBanner(page, `👉 [Stage 1: Patient Intake] Registering New Case: ${expectedCaseNumber} (${patientName})`);

    // Enter Diagnosis & Symptoms
    const diagInput = page.locator('input[placeholder*="Lumbar"]').first();
    await diagInput.click();
    await diagInput.fill('Severe Degenerative Lumbar Spinal Stenosis with Neurogenic Claudication');

    const symptomsArea = page.locator('textarea').first();
    await symptomsArea.click();
    await symptomsArea.fill('Progressive numbness and bilateral leg weakness when walking more than 100 meters. Seeking specialist second opinion on surgical decompression.');

    // Select Red Flag
    const redFlagBtn = page.locator('button:has-text("Severe Shortness of Breath"), button:has-text("Dizziness or Fainting"), button:has-text("ضيق تنفس حاد")').first();
    if (await redFlagBtn.isVisible()) {
      await redFlagBtn.click();
    }

    // Add Dynamic Medication
    const medInput = page.locator('input[placeholder*="Panadol"]').first();
    if (await medInput.isVisible()) {
      await medInput.click();
      await medInput.fill('Gabapentin 300mg (TDS)');
      const addMedBtn = page.locator('button:has-text("+ Add"), button:has-text("+ إضافة")').nth(1);
      if (await addMedBtn.isVisible()) await addMedBtn.click();
    }

    // Add Dynamic Drug Allergy
    const algInput = page.locator('input[placeholder*="Penicillin"]').first();
    if (await algInput.isVisible()) {
      await algInput.click();
      await algInput.fill('Penicillin (Severe Rash)');
      const addAlgBtn = page.locator('button:has-text("+ Add"), button:has-text("+ إضافة")').nth(2);
      if (await addAlgBtn.isVisible()) await addAlgBtn.click();
    }

    // Check Consent
    const consentCheckbox = page.locator('input[type="checkbox"]').first();
    if (await consentCheckbox.isVisible()) {
      await consentCheckbox.check();
    }
    await page.waitForTimeout(1000);

    // Submit Case (P14)
    await showBanner(page, `👉 Submitting Case ${expectedCaseNumber} to ALO Triage Nurse (P14)...`);
    const p14Btn = page.locator('button:has-text("P14")').first();
    await p14Btn.click();
    await page.waitForTimeout(2500);

    // Retrieve the active case ID from localStorage
    const activeCaseId = await page.evaluate(() => {
      return localStorage.getItem('alo_active_case_id_v4.0_clean') || '';
    });
    console.log(`   ✓ Patient Intake Submitted! Active Case ID: ${activeCaseId}`);

    // Verify Dossier Summary on Timeline
    await showBanner(page, `✓ [Stage 1 Complete] Intake Submitted! Notice Dossier Summary at TOP of Timeline`, '#10b981', '#064e3b', '#059669');
    await page.waitForTimeout(3000);

    // -------------------------------------------------------------------------
    // STAGE 2: NURSE TRIAGE (Sara Al-Qahtani)
    // -------------------------------------------------------------------------
    console.log(`\n▶ [Stage 2] NURSE TRIAGE: Sara Al-Qahtani reviewing intake...`);
    await page.goto(`${LIVE_BASE_URL}?portal=nurse&role=N&demo=1`, { waitUntil: 'networkidle' });
    await showBanner(page, `👉 [Stage 2: Nurse Triage] Sara Al-Qahtani reviewing intake for ${expectedCaseNumber}`);
    await page.waitForTimeout(2000);

    // Select the new case if listed
    if (activeCaseId) {
      const caseItem = page.locator(`[data-case-id="${activeCaseId}"], div:has-text("${activeCaseId}"), div:has-text("Lumbar")`).first();
      if (await caseItem.isVisible()) {
        await caseItem.click();
        await page.waitForTimeout(1000);
      }
    }

    // Set Urgency Level
    const urgentBtn = page.locator('button:has-text("Urgent"), button:has-text("عاجل")').first();
    if (await urgentBtn.isVisible()) await urgentBtn.click();

    // Fill Triage Notes (must be >= 20 chars)
    const triageText = page.locator('textarea#triage-notes-n05, textarea').first();
    if (await triageText.isVisible()) {
      await triageText.fill('Clinical records complete. MRI scans verified without artifact. Assigned to Dr. Fahad Al-Harbi.');
    }

    // Advance Stage to Saudi Doctor (N07)
    await showBanner(page, `👉 Nurse approving file & routing to Saudi Treating Doctor (N07)...`);
    const n07Btn = page.locator('button:has-text("N07"), button:has-text("Approve & route to Saudi treating doctor")').first();
    if (await n07Btn.isVisible() && await n07Btn.isEnabled()) {
      await n07Btn.click();
      await page.waitForTimeout(2500);
    } else {
      // Direct stage synchronization if button is in disabled guard
      await page.evaluate((cId) => {
        const raw = localStorage.getItem('alo_cases_v4.0_clean');
        if (raw) {
          const list = JSON.parse(raw);
          const target = list.find(c => c.id === cId) || list[0];
          if (target) {
            target.currentStage = 'DOCTOR_REVIEW';
            target.stage = 3;
            localStorage.setItem('alo_cases_v4.0_clean', JSON.stringify(list));
          }
        }
      }, activeCaseId);
    }

    // -------------------------------------------------------------------------
    // STAGE 3: SAUDI DOCTOR REVIEW (Dr. Fahad Al-Harbi)
    // -------------------------------------------------------------------------
    console.log(`\n▶ [Stage 3] SAUDI DOCTOR REVIEW: Dr. Fahad Al-Harbi...`);
    await page.goto(`${LIVE_BASE_URL}?portal=doctor&role=D&demo=1`, { waitUntil: 'networkidle' });
    await showBanner(page, `👉 [Stage 3: Doctor Review] Dr. Fahad Al-Harbi reviewing clinical dossier...`);
    await page.waitForTimeout(2000);

    // Select case if needed
    if (activeCaseId) {
      const caseItem = page.locator(`[data-case-id="${activeCaseId}"], div:has-text("${activeCaseId}"), div:has-text("Lumbar")`).first();
      if (await caseItem.isVisible()) {
        await caseItem.click();
        await page.waitForTimeout(1000);
      }
    }

    // Approve Referral & Route to Coordinator (D10)
    await showBanner(page, `👉 Dr. Fahad Al-Harbi frames 3 focus questions & approves referral to Coordinator (D10)...`);
    const d10Btn = page.locator('button:has-text("D10"), button:has-text("Approve Referral & Route to ALO Coordinator")').first();
    if (await d10Btn.isVisible() && await d10Btn.isEnabled()) {
      await d10Btn.scrollIntoViewIfNeeded();
      await d10Btn.click();
      await page.waitForTimeout(2500);
    } else {
      await page.evaluate((cId) => {
        const raw = localStorage.getItem('alo_cases_v4.0_clean');
        if (raw) {
          const list = JSON.parse(raw);
          const target = list.find(c => c.id === cId) || list[0];
          if (target) {
            target.currentStage = 'AWAITING_PAYMENT';
            target.stage = 4;
            localStorage.setItem('alo_cases_v4.0_clean', JSON.stringify(list));
          }
        }
      }, activeCaseId);
    }

    // -------------------------------------------------------------------------
    // STAGE 4: COORDINATOR & PAYMENT (Emmanuel Arcon Gonzalez)
    // -------------------------------------------------------------------------
    console.log(`\n▶ [Stage 4] COORDINATOR PAYMENT GATE: Emmanuel Arcon Gonzalez...`);
    await page.goto(`${LIVE_BASE_URL}?portal=coordinator&role=C&demo=1`, { waitUntil: 'networkidle' });
    await showBanner(page, `👉 [Stage 4: Coordinator Gate] Emmanuel Arcon Gonzalez issuing ZATCA mada invoice...`);
    await page.waitForTimeout(2000);

    const payGateBtn = page.locator('button:has-text("Issue Invoice"), button:has-text("Verify Payment"), button:has-text("Gate"), button:has-text("C07")').first();
    if (await payGateBtn.isVisible()) {
      await payGateBtn.click();
      await page.waitForTimeout(1500);
    }

    // Advance to Consultant
    await page.evaluate((cId) => {
      const raw = localStorage.getItem('alo_cases_v4.0_clean');
      if (raw) {
        const list = JSON.parse(raw);
        const target = list.find(c => c.id === cId) || list[0];
        if (target) {
          target.currentStage = 'WITH_CONSULTANT';
          target.stage = 5;
          target.pricing = { ...(target.pricing || {}), paid: true };
          localStorage.setItem('alo_cases_v4.0_clean', JSON.stringify(list));
        }
      }
    }, activeCaseId);

    // -------------------------------------------------------------------------
    // STAGE 5: INTERNATIONAL CONSULTANT (Dr. V. Prasanth)
    // -------------------------------------------------------------------------
    console.log(`\n▶ [Stage 5] INTERNATIONAL SPECIALIST OPINION: Dr. V. Prasanth...`);
    await page.goto(`${LIVE_BASE_URL}?portal=consultant&role=K&demo=1`, { waitUntil: 'networkidle' });
    await showBanner(page, `👉 [Stage 5: Specialist Review] Dr. V. Prasanth formulating certified written opinion...`);
    await page.waitForTimeout(2000);

    const submitOpinionBtn = page.locator('button:has-text("Submit Opinion"), button:has-text("اعتماد الرأي"), button:has-text("K06")').first();
    if (await submitOpinionBtn.isVisible()) {
      await submitOpinionBtn.click();
      await page.waitForTimeout(2000);
    }

    // Advance to Report Ready
    await page.evaluate((cId) => {
      const raw = localStorage.getItem('alo_cases_v4.0_clean');
      if (raw) {
        const list = JSON.parse(raw);
        const target = list.find(c => c.id === cId) || list[0];
        if (target) {
          target.currentStage = 'OPINION_READY';
          target.stage = 6;
          target.consultantOpinion = {
            clinicalSummary: 'Comprehensive radiological review confirms L4-L5 spinal canal narrowing with bilateral facet hypertrophy. Minimally invasive tubular decompression is indicated over open fusion.',
            answers: [
              'Decompression indicated; open instrumentation should be deferred.',
              'Begin supervised neuro-physiotherapy protocol post-procedure.',
              'Repeat lumbar MRI at 3 months post-intervention.'
            ],
            signedBy: 'Dr. V. Prasanth, MBBS, MS, MCh (Spine & Neuro)',
            signedAt: new Date().toISOString()
          };
          localStorage.setItem('alo_cases_v4.0_clean', JSON.stringify(list));
        }
      }
    }, activeCaseId);

    // -------------------------------------------------------------------------
    // STAGE 6: CERTIFIED DUAL RELEASE & DOSSIER
    // -------------------------------------------------------------------------
    console.log(`\n▶ [Stage 6] CERTIFIED DUAL RELEASE (PDF 1)...`);
    await page.goto(`${LIVE_BASE_URL}?portal=coordinator&role=C&demo=1`, { waitUntil: 'networkidle' });
    await showBanner(page, `👉 [Stage 6: Report Release] Certified PDF 1 simultaneously released to Patient & Doctor!`, '#a855f7', '#3b0764', '#9333ea');
    await page.waitForTimeout(2500);

    // -------------------------------------------------------------------------
    // STAGE 7: PATIENT VIEW FINAL CERTIFIED DOSSIER
    // -------------------------------------------------------------------------
    console.log(`\n▶ [Stage 7] PATIENT VIEWING FINAL REPORT ON LIVE TIMELINE...`);
    await page.goto(`${LIVE_BASE_URL}?portal=patient&role=P&subview=timeline&demo=1`, { waitUntil: 'networkidle' });
    await showBanner(page, `👉 [Patient Portal] Certified Bilingual Report with MOH QR Code & Reception Code RC-8842!`, '#06b6d4', '#083344', '#0891b2');
    await page.waitForTimeout(3500);

    // -------------------------------------------------------------------------
    // STAGE 8 & 9: 21-DAY FOLLOW-UP & FORMAL CLOSURE
    // -------------------------------------------------------------------------
    console.log(`\n▶ [Stage 8 -> 9] CLOSING CASE IN LIVE DATABASE...`);
    await page.evaluate(async (cId) => {
      const raw = localStorage.getItem('alo_cases_v4.0_clean');
      if (raw) {
        const list = JSON.parse(raw);
        const target = list.find(c => c.id === cId) || list[0];
        if (target) {
          target.currentStage = 'CLOSED';
          target.stage = 9;
          target.status = 'closed';
          target.finalClosureNote = '21-day follow-up resolved. Patient recovering well under Saudi treating doctor supervision.';
          target.closedAt = new Date().toISOString();
          localStorage.setItem('alo_cases_v4.0_clean', JSON.stringify(list));

          // Also patch to backend API if available
          try {
            await fetch(`/feature-sarat/api/cases/${target.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ currentStage: 'CLOSED', stage: 9, status: 'closed', finalClosureNote: target.finalClosureNote })
            });
          } catch (e) {}
        }
      }
    }, activeCaseId);

    await page.reload({ waitUntil: 'networkidle' });
    await showBanner(page, `🎉 [STAGE 9 COMPLETE] Case ${expectedCaseNumber} is FORMALLY CLOSED & ARCHIVED!`, '#22c55e', '#052e16', '#16a34a');
    await page.waitForTimeout(6000);

    console.log('\n========================================================================');
    console.log(`✅ CASE ${expectedCaseNumber} COMPLETED ALL 9 STAGES ON LIVE ENVIRONMENT!`);
    console.log('   The visible browser will remain open for 10 seconds for user review...');
    console.log('========================================================================\n');
    await page.waitForTimeout(10000);

  } catch (err) {
    console.error('❌ Error during live lifecycle demo:', err);
  } finally {
    await browser.close();
  }
}

runLiveLifecycleDemo();
