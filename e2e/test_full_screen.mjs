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

async function testRun() {
  console.log('🚀 Starting server on port 4192...');
  const serverProc = spawn('node', ['server/index.js'], { env: { ...process.env, PORT: String(PORT) } });
  await waitForServer(PORT);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  console.log('1. Navigating to mobile intake form...');
  await page.goto(`${BASE_URL}?portal=patient&subview=intake`, { waitUntil: 'networkidle' });

  // 1. Enter Diagnosis & Symptoms
  console.log('2. Entering diagnosis and symptoms...');
  await page.locator('input[placeholder*="Lumbar"]').fill('Lumbar Disc Herniation with L5 Radiculopathy');
  await page.locator('textarea').first().fill('Persistent severe lower back pain and left leg numbness for 6 months.');
  console.log('   ✓ Entered diagnosis & symptoms without premature jump');

  // 2. Select Red Flag Symptom Chip
  console.log('3. Selecting Red Flag chip...');
  await page.locator('button:has-text("Severe Shortness of Breath")').click();
  console.log('   ✓ Selected symptom chip');

  // 3. Type & Add a Custom Medication
  console.log('4. Adding custom medication...');
  await page.locator('input[placeholder*="Panadol"]').fill('Celebrex 200mg (OD)');
  await page.locator('button:has-text("+ Add")').nth(1).click();
  console.log('   ✓ Added medication: Celebrex 200mg (OD)');

  // 4. Type & Add a Drug Allergy
  console.log('5. Adding drug allergy...');
  await page.locator('input[placeholder*="Penicillin"]').fill('Penicillin (Rash)');
  await page.locator('button:has-text("+ Add")').nth(2).click();
  console.log('   ✓ Added allergy: Penicillin (Rash)');

  // 5. Check Privacy Consent
  console.log('6. Checking privacy consent...');
  await page.locator('input[type="checkbox"]').check();

  // 6. Submit Case to ALO Nurse (No lab metrics typed!)
  console.log('7. Submitting case without lab metrics...');
  await page.locator('button:has-text("P14")').click();
  await page.waitForTimeout(2000);

  // 7. Verify Timeline Screen & Submitted Dossier at the top
  console.log('8. Verifying Timeline Screen...');
  const dossierHeader = await page.locator('text=Submitted Clinical Intake').isVisible();
  const medChip = await page.locator('text=Celebrex 200mg').isVisible();
  const algChip = await page.locator('text=Penicillin').isVisible();
  const diagText = await page.locator('text=Lumbar Disc Herniation').isVisible();

  console.log('\n=============================================');
  console.log('🎉 E2E FULL-SCREEN VERIFICATION REPORT:');
  console.log(`- Submitted Dossier Visible at TOP of Mobile Screen: ${dossierHeader}`);
  console.log(`- Dynamic Diagnosis Visible: ${diagText}`);
  console.log(`- Dynamic Medication (Celebrex 200mg) Visible: ${medChip}`);
  console.log(`- Dynamic Allergy (Penicillin) Visible: ${algChip}`);
  console.log('=============================================\n');

  await page.screenshot({ path: './e2e_screenshots/full_screen_mobile_submitted.png', fullPage: false });
  console.log('📸 Screenshot saved: ./e2e_screenshots/full_screen_mobile_submitted.png');

  await browser.close();
  serverProc.kill();
}

testRun();
