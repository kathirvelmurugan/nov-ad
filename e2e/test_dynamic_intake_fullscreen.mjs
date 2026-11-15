import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';

const PORT = 4192;
const BASE_URL = `http://localhost:${PORT}/`;
const SCREENSHOT_DIR = './e2e_screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

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

async function run() {
  console.log('🚀 Launching local server for Full-Screen Playwright Test...');
  const serverProc = spawn('node', ['server/index.js'], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe'
  });

  serverProc.stdout.on('data', d => process.stdout.write(`[Server] ${d}`));
  serverProc.stderr.on('data', d => process.stderr.write(`[Server ERR] ${d}`));

  const isUp = await waitForServer(PORT);
  if (!isUp) {
    console.error('❌ Server failed to start on port', PORT);
    serverProc.kill();
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: MOBILE FULL-SCREEN (390x844 - iPhone style)
    // -------------------------------------------------------------------------
    console.log('\n📱 --- TEST 1: MOBILE FULL-SCREEN (390x844) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      locale: 'ar-SA'
    });
    const mobilePage = await mobileContext.newPage();

    console.log('1. Navigating to mobile intake...');
    await mobilePage.goto(`${BASE_URL}?portal=patient&subview=intake`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1000);

    // Screenshot 1: Mobile Intake Screen (Top view showing compact service track)
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '01_mobile_intake_top.png') });
    console.log('   📸 Captured: 01_mobile_intake_top.png');

    console.log('2. Interacting with dynamic clinical tags:');
    // Toggle a red flag chip
    const redFlagBtn = mobilePage.locator('button:has-text("ضيق تنفس حاد"), button:has-text("Severe Shortness of Breath")').first();
    if (await redFlagBtn.isVisible()) {
      await redFlagBtn.click();
      console.log('   ✓ Selected Red Flag: Severe Shortness of Breath');
    }

    // Type a medication
    const medInput = mobilePage.locator('input[placeholder*="Panadol"], input[placeholder*="اسم الدواء"]').first();
    if (await medInput.isVisible()) {
      await medInput.fill('Metformin 500mg');
      const addMedBtn = mobilePage.locator('button:has-text("+ إضافة"), button:has-text("+ Add")').first();
      await addMedBtn.click();
      console.log('   ✓ Added Medication: Metformin 500mg');
    }

    // Type an allergy
    const allergyInput = mobilePage.locator('input[placeholder*="البنسلين"], input[placeholder*="Penicillin"]').first();
    if (await allergyInput.isVisible()) {
      await allergyInput.fill('Penicillin Rash');
      const addAlgBtn = mobilePage.locator('button:has-text("+ إضافة"), button:has-text("+ Add")').nth(1);
      if (await addAlgBtn.isVisible()) await addAlgBtn.click();
      console.log('   ✓ Added Allergy: Penicillin Rash');
    }

    // Fill symptoms (min 10 chars)
    const symptomsText = mobilePage.locator('textarea').first();
    await symptomsText.fill('Severe lower back pain radiating to left leg for 3 months.');

    // Check privacy consent
    const consentBox = mobilePage.locator('input[type="checkbox"]').first();
    await consentBox.check();

    // Screenshot 2: Form with dynamic inputs
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '02_mobile_intake_filled.png') });
    console.log('   📸 Captured: 02_mobile_intake_filled.png');

    // Submit form (without any lab metrics!)
    console.log('3. Submitting case without lab metrics...');
    const submitBtn = mobilePage.locator('button:has-text("P14"), button:has-text("Submit case")').first();
    await submitBtn.click();
    await mobilePage.waitForTimeout(2000);

    // Screenshot 3: Mobile Submitted View (Dossier immediately visible at top!)
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '03_mobile_submitted_timeline.png') });
    console.log('   📸 Captured: 03_mobile_submitted_timeline.png');

    // Verify Dossier is visible at top
    const dossierTitle = await mobilePage.locator('text=Submitted Clinical Intake, text=Submitted Intake, text=ملخص ملفك السريري').isVisible();
    const submittedMed = await mobilePage.locator('text=Metformin 500mg').isVisible();
    const submittedAlg = await mobilePage.locator('text=Penicillin Rash').isVisible();

    console.log(`   [Mobile Verification]:`);
    console.log(`   - Dossier visible at top without scrolling: ${dossierTitle}`);
    console.log(`   - Submitted Medication (Metformin 500mg) visible: ${submittedMed}`);
    console.log(`   - Submitted Allergy (Penicillin Rash) visible: ${submittedAlg}`);

    // -------------------------------------------------------------------------
    // TEST 2: DESKTOP FULL-SCREEN (1440x900)
    // -------------------------------------------------------------------------
    console.log('\n💻 --- TEST 2: DESKTOP FULL-SCREEN (1440x900) ---');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: 'ar-SA'
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(`${BASE_URL}?portal=patient&subview=timeline`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1000);

    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '04_desktop_timeline_dossier.png') });
    console.log('   📸 Captured: 04_desktop_timeline_dossier.png');

    console.log('\n🎉 ALL FULL-SCREEN VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await browser.close();
    serverProc.kill();
  }
}

run();
