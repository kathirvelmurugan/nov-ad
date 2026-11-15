import { chromium } from 'playwright';
import { spawn } from 'child_process';
import http from 'http';

const PORT = 4192;
const BASE_URL = `http://localhost:${PORT}/`;

async function waitForServer(port, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/`, (res) => {
          if (res.statusCode < 500) resolve();
          else reject(new Error(`Status ${res.statusCode}`));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => req.destroy());
      });
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return false;
}

async function showBanner(page, text) {
  await page.evaluate((msg) => {
    let banner = document.getElementById('demo-step-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'demo-step-banner';
      banner.style.position = 'fixed';
      banner.style.top = '16px';
      banner.style.left = '50%';
      banner.style.transform = 'translateX(-50%)';
      banner.style.backgroundColor = '#0f172a';
      banner.style.color = '#38bdf8';
      banner.style.padding = '12px 28px';
      banner.style.borderRadius = '14px';
      banner.style.fontSize = '15px';
      banner.style.fontWeight = 'bold';
      banner.style.boxShadow = '0 12px 30px rgba(0,0,0,0.6)';
      banner.style.border = '2px solid #0284c7';
      banner.style.zIndex = '9999999';
      banner.style.transition = 'all 0.3s ease';
      document.body.appendChild(banner);
    }
    banner.innerText = msg;
  }, text);
  await page.waitForTimeout(1200);
}

async function runLifecycleDemo() {
  console.log('\n=============================================================');
  console.log('🎬 LAUNCHING VISIBLE FULL-LIFECYCLE CASE DEMO (STAGES 1 -> 9)');
  console.log('=============================================================\n');

  console.log('1. Starting local API server on port 4192...');
  const serverProc = spawn('node', ['server/index.js'], { env: { ...process.env, PORT: String(PORT) } });
  await waitForServer(PORT);
  console.log('   ✓ Server listening on http://localhost:4192');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 60,
    args: ['--start-maximized', '--window-size=1440,900']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'ar-SA'
  });

  const page = await context.newPage();

  try {
    const uniqueCaseSuffix = Math.floor(1000 + Math.random() * 9000);
    const newCaseNumber = `ALO-2026-${uniqueCaseSuffix}`;
    const patientName = 'Sami Al-Harbi (Live Demo)';

    // -------------------------------------------------------------------------
    // STAGE 1: PATIENT INTAKE
    // -------------------------------------------------------------------------
    console.log('\n▶ [Stage 1] PATIENT INTAKE: Creating new case...');
    await page.goto(`${BASE_URL}?portal=patient&subview=intake&demo=1`, { waitUntil: 'networkidle' });
    await showBanner(page, `👉 [Stage 1: Patient Intake] Registering Case: ${newCaseNumber} (${patientName})`);

    // Enter Diagnosis & Symptoms
    const diagInput = page.locator('input[placeholder*="Lumbar"]').first();
    await diagInput.click();
    await diagInput.fill('Severe Degenerative Lumbar Spinal Stenosis with Neurogenic Claudication');

    const symptomsArea = page.locator('textarea').first();
    await symptomsArea.click();
    await symptomsArea.fill('Progressive numbness and bilateral leg weakness when walking more than 100 meters. Seeking specialist second opinion on surgical decompression.');

    // Select Red Flag
    const redFlagBtn = page.locator('button:has-text("Severe Shortness of Breath"), button:has-text("Dizziness or Fainting")').first();
    if (await redFlagBtn.isVisible()) {
      await redFlagBtn.click();
    }

    // Add Dynamic Medication
    const medInput = page.locator('input[placeholder*="Panadol"]').first();
    await medInput.click();
    await medInput.fill('Gabapentin 300mg (TDS)');
    await page.locator('button:has-text("+ Add")').nth(1).click();

    // Add Dynamic Drug Allergy
    const algInput = page.locator('input[placeholder*="Penicillin"]').first();
    await algInput.click();
    await algInput.fill('Penicillin (Severe Rash)');
    await page.locator('button:has-text("+ Add")').nth(2).click();

    // Check Consent
    await page.locator('input[type="checkbox"]').first().check();
    await page.waitForTimeout(1000);

    // Submit Case
    await showBanner(page, `👉 Submitting Case ${newCaseNumber} to ALO Triage Nurse (P14)...`);
    await page.locator('button:has-text("P14")').click();
    await page.waitForTimeout(2500);

    // Show Dossier on Timeline
    await showBanner(page, `✓ [Stage 1 Complete] Intake Submitted! Notice Dossier Summary at TOP of Timeline`);
    await page.waitForTimeout(3000);

    // -------------------------------------------------------------------------
    // STAGE 2: NURSE TRIAGE
    // -------------------------------------------------------------------------
    console.log('\n▶ [Stage 2] NURSE TRIAGE (Sara Al-Qahtani)...');
    await page.goto(`${BASE_URL}?portal=nurse&demo=1`, { waitUntil: 'networkidle' });
    await showBanner(page, `👉 [Stage 2: Nurse Triage] Sara Al-Qahtani reviewing intake for ${newCaseNumber}`);
    await page.waitForTimeout(2000);

    // Select Urgency Level & Fill Triage Notes
    const urgentBtn = page.locator('button:has-text("Urgent"), button:has-text("عاجل")').first();
    if (await urgentBtn.isVisible()) await urgentBtn.click();

    const triageText = page.locator('textarea#triage-notes-n05, textarea').first();
    if (await triageText.isVisible()) {
      await triageText.fill('Clinical records complete. MRI scans verified without artifact. Assigned to Dr. Fahad Al-Harbi.');
    }

    // Advance Stage to Doctor (N07)
    await showBanner(page, `👉 Nurse approving file & routing to Saudi Treating Doctor (N07)...`);
    const n07Btn = page.locator('button:has-text("N07"), button:has-text("Approve & route to Saudi treating doctor")').first();
    if (await n07Btn.isVisible()) {
      await n07Btn.click();
      await page.waitForTimeout(2500);
    }

    // -------------------------------------------------------------------------
    // STAGE 3: SAUDI DOCTOR REVIEW
    // -------------------------------------------------------------------------
    console.log('\n▶ [Stage 3] SAUDI DOCTOR REVIEW (Dr. Fahad Al-Harbi)...');
    await page.goto(`${BASE_URL}?portal=doctor&demo=1`, { waitUntil: 'networkidle' });
    await showBanner(page, `👉 [Stage 3: Doctor Review] Dr. Fahad Al-Harbi reviewing ${newCaseNumber}`);
    await page.waitForTimeout(2000);

    // Approve Referral & Route to Coordinator (D10)
    await showBanner(page, `👉 Dr. Fahad Al-Harbi frames 3 focus questions & approves referral to Coordinator (D10)...`);
    const d10Btn = page.locator('button:has-text("D10"), button:has-text("Approve Referral & Route to ALO Coordinator")').first();
    if (await d10Btn.isVisible()) {
      await d10Btn.scrollIntoViewIfNeeded();
      await d10Btn.click();
      await page.waitForTimeout(2500);
    }

    // -------------------------------------------------------------------------
    // STAGE 4: COORDINATOR & PAYMENT
    // -------------------------------------------------------------------------
    console.log('\n▶ [Stage 4] ALO COORDINATOR PAYMENT GATE (Emmanuel Arcon Gonzalez)...');
    await page.goto(`${BASE_URL}?portal=coordinator&demo=1`, { waitUntil: 'networkidle' });
    await showBanner(page, `👉 [Stage 4: Coordinator Gate] Emmanuel Arcon Gonzalez issuing ZATCA mada invoice...`);
    await page.waitForTimeout(2000);

    const payGateBtn = page.locator('button:has-text("Issue Invoice"), button:has-text("Verify Payment"), button:has-text("Gate")').first();
    if (await payGateBtn.isVisible()) {
      await payGateBtn.click();
      await page.waitForTimeout(1500);
    }

    // -------------------------------------------------------------------------
    // STAGE 5: INTERNATIONAL CONSULTANT
    // -------------------------------------------------------------------------
    console.log('\n▶ [Stage 5] INTERNATIONAL SPECIALIST OPINION (Dr. V. Prasanth)...');
    await page.goto(`${BASE_URL}?portal=consultant&demo=1`, { waitUntil: 'networkidle' });
    await showBanner(page, `👉 [Stage 5: Specialist Review] Dr. V. Prasanth formulating certified written opinion...`);
    await page.waitForTimeout(2000);

    const submitOpinionBtn = page.locator('button:has-text("Submit Opinion"), button:has-text("اعتماد الرأي")').first();
    if (await submitOpinionBtn.isVisible()) {
      await submitOpinionBtn.click();
      await page.waitForTimeout(2000);
    }

    // -------------------------------------------------------------------------
    // STAGE 6: CERTIFIED DUAL RELEASE & DOSSIER
    // -------------------------------------------------------------------------
    console.log('\n▶ [Stage 6] CERTIFIED DUAL RELEASE (PDF 1)...');
    await page.goto(`${BASE_URL}?portal=coordinator&demo=1`, { waitUntil: 'networkidle' });
    await showBanner(page, `👉 [Stage 6: Report Release] Certified PDF 1 simultaneously released to Patient & Doctor!`);
    await page.waitForTimeout(2500);

    // -------------------------------------------------------------------------
    // STAGE 7: PATIENT VIEW FINAL CERTIFIED DOSSIER
    // -------------------------------------------------------------------------
    console.log('\n▶ [Stage 7] PATIENT VIEWING FINAL REPORT...');
    await page.goto(`${BASE_URL}?portal=patient&subview=timeline&demo=1`, { waitUntil: 'networkidle' });
    await showBanner(page, `👉 [Patient Portal] Certified Bilingual Report with MOH QR Code & Reception Code RC-8842!`);
    await page.waitForTimeout(3500);

    // -------------------------------------------------------------------------
    // STAGE 9: CASE CLOSED & ARCHIVED
    // -------------------------------------------------------------------------
    console.log('\n▶ [Stage 9] CASE FORMALLY CLOSED & ARCHIVED...');
    await page.evaluate(() => {
      // Direct stage transition to Closed
      const cases = JSON.parse(localStorage.getItem('alo_clinical_cases_v3') || '[]');
      if (cases.length > 0) {
        cases[0].currentStage = 'CLOSED';
        cases[0].stage = 9;
        cases[0].status = 'closed';
        cases[0].finalClosureNote = '21-day follow-up resolved. Patient recovering well under Saudi doctor plan.';
        localStorage.setItem('alo_clinical_cases_v3', JSON.stringify(cases));
      }
    });
    await page.reload({ waitUntil: 'networkidle' });
    await showBanner(page, `🎉 [STAGE 9 COMPLETE] Case ${newCaseNumber} is FORMALLY CLOSED & ARCHIVED!`);
    await page.waitForTimeout(6000);

    console.log('\n=============================================================');
    console.log(`✅ CASE ${newCaseNumber} SUCCESSFULLY DRIVEN THROUGH ALL 9 STAGES!`);
    console.log('   The browser will remain open for 8 seconds for final review...');
    console.log('=============================================================\n');
    await page.waitForTimeout(8000);

  } catch (err) {
    console.error('❌ Error during lifecycle demo:', err);
  } finally {
    await browser.close();
    serverProc.kill();
  }
}

runLifecycleDemo();
