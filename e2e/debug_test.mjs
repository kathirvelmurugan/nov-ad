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

async function debugRun() {
  const serverProc = spawn('node', ['server/index.js'], { env: { ...process.env, PORT: String(PORT) } });
  await waitForServer(PORT);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto(`${BASE_URL}?portal=patient&subview=intake`, { waitUntil: 'networkidle' });
  console.log('1. Page loaded. Textareas found:', await page.locator('textarea').count());

  // Fill symptoms first
  const textarea = page.locator('textarea').first();
  await textarea.fill('Patient experiencing severe chronic fatigue and shortness of breath.');
  console.log('2. Textarea filled successfully.');

  // Click Red Flag chip
  const flag = page.locator('button:has-text("ضيق تنفس حاد")').first();
  await flag.click();
  console.log('3. Red flag clicked.');

  // Type Medication
  const medInput = page.locator('input[placeholder*="Panadol"]').first();
  await medInput.fill('Aspirin 100mg');
  const addMed = page.locator('button:has-text("+ إضافة")').first();
  await addMed.click();
  console.log('4. Medication added.');

  // Type Allergy
  const algInput = page.locator('input[placeholder*="البنسلين"]').first();
  await algInput.fill('Penicillin');
  const addAlg = page.locator('button:has-text("+ إضافة")').nth(1);
  await addAlg.click();
  console.log('5. Allergy added.');

  // Check consent
  const consent = page.locator('input[type="checkbox"]').first();
  await consent.check();
  console.log('6. Consent checked.');

  // Click submit
  const submit = page.locator('button:has-text("P14")').first();
  await submit.click();
  await page.waitForTimeout(2000);
  console.log('7. Submitted! URL is now:', page.url());

  // Check if timeline loaded with summary card
  const summaryTitle = await page.locator('text=ملخص ملفك السريري المقدم').isVisible();
  console.log('8. Summary card visible at top?', summaryTitle);
  const medVisible = await page.locator('text=Aspirin 100mg').isVisible();
  console.log('9. Medication pill visible?', medVisible);
  const algVisible = await page.locator('text=Penicillin').isVisible();
  console.log('10. Allergy pill visible?', algVisible);

  await page.screenshot({ path: './e2e_screenshots/verified_mobile_submitted.png' });
  console.log('📸 Saved verified_mobile_submitted.png');

  await browser.close();
  serverProc.kill();
}

debugRun();
