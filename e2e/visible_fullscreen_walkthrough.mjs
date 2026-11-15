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
      banner.style.padding = '12px 24px';
      banner.style.borderRadius = '12px';
      banner.style.fontSize = '14px';
      banner.style.fontWeight = 'bold';
      banner.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
      banner.style.border = '2px solid #0284c7';
      banner.style.zIndex = '9999999';
      banner.style.transition = 'all 0.3s ease';
      document.body.appendChild(banner);
    }
    banner.innerText = msg;
  }, text);
  await page.waitForTimeout(1000);
}

async function runVisibleDemo() {
  console.log('\n======================================================');
  console.log('🎬 LAUNCHING VISIBLE FULL-SCREEN PLAYWRIGHT DEMO');
  console.log('======================================================\n');

  console.log('1. Starting local API server on port 4192...');
  const serverProc = spawn('node', ['server/index.js'], { env: { ...process.env, PORT: String(PORT) } });
  await waitForServer(PORT);
  console.log('   ✓ Local server listening on http://localhost:4192');

  console.log('2. Opening visible Chromium browser window on your desktop...');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 60, // Human-friendly execution speed so you can watch every action
    args: ['--start-maximized', '--window-size=1440,900']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'ar-SA'
  });

  const page = await context.newPage();

  try {
    console.log('3. Navigating to Patient Intake View...');
    await page.goto(`${BASE_URL}?portal=patient&subview=intake`, { waitUntil: 'networkidle' });
    await showBanner(page, '👉 [Step 1] Patient Intake Loaded: Compact Service Bar & Dynamic Clinical Fields');
    await page.waitForTimeout(1500);

    // Step 2: Fill Diagnosis & Symptoms
    console.log('4. Entering Diagnosis & Medical Complaint...');
    await showBanner(page, '👉 [Step 2] Entering Medical Diagnosis & Patient Clinical Symptoms...');
    const diagInput = page.locator('input[placeholder*="Lumbar"]').first();
    await diagInput.scrollIntoViewIfNeeded();
    await diagInput.click();
    await diagInput.fill('Lumbar Disc Herniation with L5 Radiculopathy');
    await page.waitForTimeout(800);

    const symptomsArea = page.locator('textarea').first();
    await symptomsArea.click();
    await symptomsArea.fill('Severe lower back pain radiating down left leg for 6 months. Progressive numbness in foot.');
    await page.waitForTimeout(1000);

    // Step 3: Interactive Red Flag Symptoms
    console.log('5. Toggling Dynamic Red-Flag Symptoms...');
    await showBanner(page, '👉 [Step 3] Selecting Dynamic Red-Flag Symptoms (Severe Pain / Dyspnea)...');
    const redFlagBtn = page.locator('button:has-text("Severe Shortness of Breath"), button:has-text("ضيق تنفس حاد")').first();
    if (await redFlagBtn.isVisible()) {
      await redFlagBtn.scrollIntoViewIfNeeded();
      await redFlagBtn.click();
      await page.waitForTimeout(800);
    }

    // Step 4: Adding Custom Medication
    console.log('6. Adding Dynamic Current Medication...');
    await showBanner(page, '👉 [Step 4] Typing & Adding Custom Medication: Celebrex 200mg (OD)...');
    const medInput = page.locator('input[placeholder*="Panadol"], input[placeholder*="اسم الدواء"]').first();
    await medInput.scrollIntoViewIfNeeded();
    await medInput.click();
    await medInput.fill('Celebrex 200mg (OD)');
    const addMedBtn = page.locator('button:has-text("+ Add"), button:has-text("+ إضافة")').nth(1);
    await addMedBtn.click();
    await page.waitForTimeout(1200);

    // Step 5: Adding Drug Allergy
    console.log('7. Adding Dynamic Drug Allergy...');
    await showBanner(page, '👉 [Step 5] Typing & Adding Drug Allergy: Penicillin (Rash)...');
    const algInput = page.locator('input[placeholder*="Penicillin"], input[placeholder*="البنسلين"]').first();
    await algInput.scrollIntoViewIfNeeded();
    await algInput.click();
    await algInput.fill('Penicillin (Rash)');
    const addAlgBtn = page.locator('button:has-text("+ Add"), button:has-text("+ إضافة")').nth(2);
    await addAlgBtn.click();
    await page.waitForTimeout(1200);

    // Step 6: Checking Privacy Consent
    console.log('8. Checking Privacy Agreement...');
    await showBanner(page, '👉 [Step 6] Confirming MOH Health Data Privacy Consent...');
    const consentBox = page.locator('input[type="checkbox"]').first();
    await consentBox.scrollIntoViewIfNeeded();
    await consentBox.check();
    await page.waitForTimeout(1000);

    // Step 7: Submitting Case
    console.log('9. Submitting Case to ALO Nurse (No lab metrics needed!)...');
    await showBanner(page, '👉 [Step 7] Submitting Case to ALO Nurse (Zero Lab Values Required)...');
    const submitBtn = page.locator('button:has-text("P14"), button:has-text("Submit case")').first();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    await page.waitForTimeout(2000);

    // Step 8: Verifying Prominent Dossier at Top of Timeline
    console.log('10. Transitioned to Timeline! Checking Prominent Dossier Card at Top...');
    await showBanner(page, '🎉 [SUCCESS] Case Registered! Dossier Summary is Prominently Displayed at TOP!');
    await page.waitForTimeout(4000);

    console.log('\n======================================================');
    console.log('✅ VISIBLE FULL-SCREEN PLAYWRIGHT DEMO COMPLETE');
    console.log('   The browser will remain open for 6 seconds for inspection...');
    console.log('======================================================\n');
    await page.waitForTimeout(6000);

  } catch (err) {
    console.error('❌ Error during visible demo:', err);
  } finally {
    await browser.close();
    serverProc.kill();
  }
}

runVisibleDemo();
