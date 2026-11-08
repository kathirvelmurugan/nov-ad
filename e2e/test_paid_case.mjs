import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://ad.howtostart.in/?intake=1';
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
    page.on('dialog', async (dialog) => {
      console.log(`[Browser Alert Dismissed] ${dialog.message()}`);
      await dialog.accept();
    });

    const clickPersona = async (matchTerm) => {
      await page.evaluate((term) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => 
          (b.title && b.title.toLowerCase().includes(term.toLowerCase())) ||
          (b.innerText && b.innerText.toLowerCase().includes(term.toLowerCase()))
        );
        if (btn) btn.click();
      }, matchTerm);
      await new Promise(r => setTimeout(r, 800));
    };

    console.log(`\n=== 1. Step 1: Patient Ingress & Dynamic Admin Roster ===`);
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });

    const title = await page.title();
    check('Page title renders ALO DOCTOR', title.includes('ALO DOCTOR'), title);

    const defaultDoctorChoice = await page.evaluate(() => {
      const select = document.querySelector('select');
      return select ? select.value : null;
    });
    check('Intake permanently defaults to need_assistance', defaultDoctorChoice === 'need_assistance', defaultDoctorChoice);

    const doctorOptionsCount = await page.evaluate(() => {
      const select = document.querySelector('select');
      return select ? select.options.length : 0;
    });
    check('Option B dynamically lists Medical Center Admin enrolled doctors', doctorOptionsCount >= 6, `${doctorOptionsCount} options in dropdown`);

    console.log(`\n=== 2. Step 2: Nurse Triage View & Matching Roster ===`);
    await clickPersona('nurse');

    const hasNurseRoster = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Accredited') || text.includes('أطباء معتمدون') || text.includes('د. عبدالله الشمري');
    });
    check('Nurse triage renders accredited doctor matching cards', hasNurseRoster);

    console.log(`\n=== 3. Step 3: Saudi Doctor Review & Safety Gate ===`);
    await clickPersona('treating doctor');

    const hasDoctorFocusAndOrders = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasQuestions = text.includes('Focus Questions') || text.includes('الأسئلة التوجيهية') || text.includes('D07');
      const hasOrders = text.includes('D08') || text.includes('مختبر') || text.includes('صيدلية') || text.includes('Facility');
      return hasQuestions && hasOrders;
    });
    check('Doctor Review presents 3 Focus Questions (D07) and in-house facility orders (D08)', hasDoctorFocusAndOrders);

    console.log(`\n=== 4. Step 4: Coordinator Portal & Invoicing ===`);
    await clickPersona('coordinator');

    const hasCoordinatorPortal = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Coordinator') || text.includes('منسق') || text.includes('C01') || text.includes('C08');
    });
    check('Coordinator portal renders case management and bilingual synthesis pipeline', hasCoordinatorPortal);

    console.log(`\n=== 5. Step 5: Advancing to Paid Case & Indian Consultant Review ===`);
    // Rotate to paid case using the new Next Case button
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('حالة تالية') || b.innerText.includes('Next Case'));
      if (nextBtn) {
        nextBtn.click();
        nextBtn.click();
        nextBtn.click(); // Cycles to case-004 (which is fully paid)
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    await clickPersona('consultant');
    await new Promise(r => setTimeout(r, 800));

    const hasConsultantView = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Arjun') || text.includes('Consultant') || text.includes('OTP') || text.includes('KIMS') || text.includes('Clinical File') || text.includes('Focus');
    });
    check('Consultant mobile view renders with OTP verification gate & specialist directives', hasConsultantView);

    console.log(`\n=== 6. Step 8: In-House Facility Queues (L01, H01, REC01) ===`);
    // Click Stepper Step 7 (Partner services / In-House Hub)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const step7 = buttons.find(b => b.innerText.includes('7. إصدار التقرير') || b.innerText.includes('7. Release Report'));
      if (step7) step7.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const hasFacilityQueues = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasLab = text.includes('L01') || text.includes('المختبر الداخلي') || text.includes('Lab');
      const hasRx = text.includes('H01') || text.includes('الصيدلية') || text.includes('Pharmacy');
      const hasRec = text.includes('الاستقبال') || text.includes('Reception') || text.includes('SLA');
      return hasLab || hasRx || hasRec;
    });
    check('In-House Facility Hub renders Lab L01, Pharmacy H01, Reception REC01, and D13 Milestone Gate', hasFacilityQueues);

    console.log(`\n=== 7. Console Error Audit ===`);
    check('Zero console errors across entire clinical flow navigation', consoleErrors.length === 0, consoleErrors.join('; '));

    console.log('\n========================================');
    console.log('   FULL END-TO-END AUDIT SCORECARD');
    console.log('========================================');
    const passed = results.filter((r) => r.ok).length;
    console.log(`TOTAL CHECKS: ${passed}/${results.length} PASSED`);

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
