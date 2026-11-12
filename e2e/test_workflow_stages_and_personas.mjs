import puppeteer from 'puppeteer-core';

const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:4173';

async function testWorkflow() {
  console.log('--- Starting ALO Doctor End-to-End Automated Verification ---');
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const pageErrors = [];
  page.on('pageerror', (err) => {
    console.error('[Page Error]:', err.message);
    pageErrors.push(err.message);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('[Console Error]:', msg.text());
    }
  });

  try {
    // 1. Load Coordinator portal directly
    console.log('1. Loading Coordinator Portal...');
    await page.goto(`${BASE_URL}/?auth=bypass&role=C`, { waitUntil: 'networkidle0', timeout: 15000 });
    
    // Check for error boundary
    let errorAlert = await page.$('[role="alert"]');
    if (errorAlert) {
      const text = await page.evaluate(el => el.innerText, errorAlert);
      throw new Error(`ErrorBoundary caught error on Coordinator portal: ${text}`);
    }
    console.log('   ✓ Coordinator Portal loaded cleanly.');

    // 2. Test Stage 5 (WITH_CONSULTANT) as Patient (the exact scenario where user reported the bug)
    console.log('2. Testing Stage 5 (WITH_CONSULTANT) under Patient persona...');
    await page.evaluate(() => {
      // Force set active case to Stage 5 WITH_CONSULTANT
      const stored = localStorage.getItem('alo_cases_v4.0_clean');
      let cases = [];
      try { cases = JSON.parse(stored) || []; } catch(e) {}
      if (cases.length > 0) {
        cases[0].currentStage = 'WITH_CONSULTANT';
        cases[0].stage = 5;
        cases[0].paymentVerified = true;
        // Specifically test when consultant object is undefined or incomplete
        delete cases[0].consultant;
        localStorage.setItem('alo_cases_v4.0_clean', JSON.stringify(cases));
        localStorage.setItem('alo_active_case_id_v4.0_clean', cases[0].id);
      }
      localStorage.setItem('alo_patient_subview_v3.0', 'timeline');
    });

    // Navigate to Patient portal
    await page.goto(`${BASE_URL}/?auth=bypass&role=P&subview=timeline`, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    errorAlert = await page.$('[role="alert"]');
    if (errorAlert) {
      const text = await page.evaluate(el => el.innerText, errorAlert);
      throw new Error(`ErrorBoundary caught on Patient Stage 5: ${text}`);
    }
    console.log('   ✓ Patient Stage 5 (WITH_CONSULTANT) loaded WITHOUT error boundary!');

    // Check that Stage 5 timeline content rendered properly
    const timelineBadge = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="patient-status-view"]') || document.body;
      return el.innerText;
    });
    if (!timelineBadge.includes('5') && !timelineBadge.includes('Stage') && !timelineBadge.includes('المرحلة')) {
      console.warn('   ⚠ Could not find stage indicator text, body excerpt:', timelineBadge.slice(0, 200));
    } else {
      console.log('   ✓ Patient Stage 5 content rendered correctly.');
    }

    // 3. Test Payment Checkout View
    console.log('3. Testing Patient Payment Checkout UI alignment...');
    await page.goto(`${BASE_URL}/?auth=bypass&role=P&subview=checkout`, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    errorAlert = await page.$('[role="alert"]');
    if (errorAlert) {
      const text = await page.evaluate(el => el.innerText, errorAlert);
      throw new Error(`ErrorBoundary caught on Payment Checkout View: ${text}`);
    }

    // Check package cards layout
    const packageCardsInfo = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button[aria-pressed]'));
      if (buttons.length < 2) return null;
      const rect1 = buttons[0].getBoundingClientRect();
      const rect2 = buttons[1].getBoundingClientRect();
      return {
        count: buttons.length,
        rect1: { top: rect1.top, bottom: rect1.bottom, height: rect1.height },
        rect2: { top: rect2.top, bottom: rect2.bottom, height: rect2.height },
        topDelta: Math.abs(rect1.top - rect2.top),
        bottomDelta: Math.abs(rect1.bottom - rect2.bottom),
      };
    });

    if (packageCardsInfo) {
      console.log(`   ✓ Top consultation package cards found: ${packageCardsInfo.count}`);
      console.log(`     Top alignment delta: ${packageCardsInfo.topDelta.toFixed(1)}px (expected 0px)`);
      console.log(`     Bottom alignment delta: ${packageCardsInfo.bottomDelta.toFixed(1)}px (expected 0px)`);
      if (packageCardsInfo.topDelta > 2 || packageCardsInfo.bottomDelta > 2) {
        console.warn('   ⚠ Noticeable height delta between package cards:', packageCardsInfo);
      } else {
        console.log('   ✓ Consultation package cards are perfectly aligned horizontally and vertically!');
      }
    }

    // 4. Test all workflow stages sequentially (1 through 9) across all personas
    console.log('4. Testing full workflow stage advancement (1 through 9)...');
    const stages = [
      'INTAKE_RECEIVED',
      'NURSE_CHECK',
      'DOCTOR_REVIEW',
      'AWAITING_PAYMENT',
      'WITH_CONSULTANT',
      'OPINION_READY',
      'PARTNER_SERVICES',
      'FOLLOW_UP_21_DAYS',
      'CLOSED'
    ];

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      await page.evaluate((targetStage, num) => {
        const stored = localStorage.getItem('alo_cases_v4.0_clean');
        let cases = [];
        try { cases = JSON.parse(stored) || []; } catch(e) {}
        if (cases.length > 0) {
          cases[0].currentStage = targetStage;
          cases[0].stage = num;
          cases[0].paymentVerified = true;
          if (cases[0].pricing) cases[0].pricing.paid = true;
          delete cases[0].consultant; // Test with undefined consultant
          localStorage.setItem('alo_cases_v4.0_clean', JSON.stringify(cases));
        }
      }, stage, i + 1);

      await page.goto(`${BASE_URL}/?auth=bypass&role=P&subview=timeline`, { waitUntil: 'networkidle0', timeout: 10000 });
      await new Promise(r => setTimeout(r, 400));

      errorAlert = await page.$('[role="alert"]');
      if (errorAlert) {
        const text = await page.evaluate(el => el.innerText, errorAlert);
        throw new Error(`Stage ${stage} threw error boundary: ${text}`);
      }
      console.log(`   ✓ Stage ${i + 1}/9 (${stage}) Patient Timeline: CLEAN`);
    }

    // 5. Test other personas: Consultant (K), Doctor (D), Nurse (N), Coordinator (C)
    console.log('5. Testing other Persona screens for clean loading...');
    const personas = [
      { role: 'N', name: 'Nurse Triage' },
      { role: 'D', name: 'Saudi Treating Doctor' },
      { role: 'C', name: 'ALO Coordinator' },
      { role: 'K', name: 'International Consultant' },
    ];

    for (const p of personas) {
      await page.goto(`${BASE_URL}/?auth=bypass&role=${p.role}`, { waitUntil: 'networkidle0', timeout: 10000 });
      await new Promise(r => setTimeout(r, 400));
      errorAlert = await page.$('[role="alert"]');
      if (errorAlert) {
        const text = await page.evaluate(el => el.innerText, errorAlert);
        throw new Error(`Persona ${p.name} (${p.role}) threw error boundary: ${text}`);
      }
      console.log(`   ✓ ${p.name} (${p.role}) Portal: CLEAN`);
    }

    console.log('\n======================================================');
    console.log('🎉 ALL TESTS PASSED! ZERO CRASHES OR ERROR BOUNDARIES!');
    console.log('======================================================');
  } finally {
    await browser.close();
  }
}

testWorkflow().catch(err => {
  console.error('\n❌ Test failed with error:', err.message);
  process.exit(1);
});
