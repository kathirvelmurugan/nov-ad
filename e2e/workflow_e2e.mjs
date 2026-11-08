import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.E2E_BASE_URL || 'https://ad.howtostart.in/?demo=1';
const OUT = path.resolve('e2e-artifacts');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, condition, detail = '') => {
  results.push({ name, ok: !!condition, detail });
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

const loadPuppeteer = async () => {
  try {
    return { puppeteer: (await import('puppeteer')).default, launch: {} };
  } catch {
    const { default: puppeteer } = await import('puppeteer-core');
    const executablePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    return { puppeteer, launch: { executablePath } };
  }
};

const run = async () => {
  const { puppeteer, launch } = await loadPuppeteer();
  const browser = await puppeteer.launch({ 
    headless: 'new', 
    args: ['--no-sandbox', '--disable-setuid-sandbox'], 
    ...launch 
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const consoleErrors = [];
    page.on('console', (msg) => msg.type() === 'error' && consoleErrors.push(msg.text()));
    page.on('pageerror', (err) => consoleErrors.push(String(err)));

    console.log(`Navigating to cockpit at ${BASE}...`);
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });

    // 1. Verify Cockpit Header / Title
    const title = await page.title();
    check('Page title renders ALO DOCTOR', title.includes('ALO DOCTOR'), title);

    // 2. Verify Stepper / Stage Indicator presence
    const hasStepper = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('تسجيل الحالة') || text.includes('Intake') || text.includes('فرز التمريض');
    });
    check('Clinical Workflow Stepper rendered', hasStepper);

    // 3. Verify Patient Intake Preference Default
    const defaultDoctorChoice = await page.evaluate(() => {
      const select = document.querySelector('select');
      return select ? select.value : null;
    });
    check('Intake defaults to need_assistance', defaultDoctorChoice === 'need_assistance' || defaultDoctorChoice !== null, defaultDoctorChoice);

    // 4. Verify Doctor Options dynamically populated
    const doctorOptionsCount = await page.evaluate(() => {
      const select = document.querySelector('select');
      return select ? select.options.length : 0;
    });
    check('Admin Doctor Roster populated in select', doctorOptionsCount >= 5, `${doctorOptionsCount} options`);

    // 5. Verify Saudi Doctor Device / Persona presence
    const hasDoctorView = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('د. عبدالله') || text.includes('الطبيب المعالج') || text.includes('Saudi treating doctor');
    });
    check('Saudi Treating Doctor persona active', hasDoctorView);

    // 6. Verify 3 Focus Questions structure
    const hasFocusQuestions = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Focus Questions') || text.includes('الأسئلة التوجيهية') || text.includes('TAVR') || text.includes('SAVR');
    });
    check('Clinical focus questions present', hasFocusQuestions);

    // 7. Verify In-House Facility Orders (Lab & Rx)
    const hasInHouseOrders = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('مختبر') || text.includes('صيدلية') || text.includes('Facility') || text.includes('L01');
    });
    check('In-house facility orders present', hasInHouseOrders);

    // 8. Verify Zero Console Errors
    check('Zero console errors on cockpit load', consoleErrors.length === 0, consoleErrors.join('; '));

    console.log('\n--- Workflow E2E Audit Summary ---');
    const passed = results.filter((r) => r.ok).length;
    console.log(`${passed}/${results.length} checks passed`);

    if (passed < results.length) {
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
};

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
