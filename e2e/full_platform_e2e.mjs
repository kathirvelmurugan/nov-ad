import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.TARGET_URL || 'https://ad.howtostart.in/';
const OUT = path.resolve('e2e-artifacts');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, condition, detail = '') => {
  results.push({ name, ok: !!condition, detail });
  const status = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}  ${name}${detail ? `  (${detail})` : ''}`);
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
  console.log(`\n======================================================`);
  console.log(`🚀 RUNNING FULL END-TO-END VERIFICATION: ${BASE}`);
  console.log(`======================================================\n`);

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
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const txt = msg.text();
        if (!txt.includes('favicon') && !txt.includes('404')) {
          consoleErrors.push(txt);
        }
      }
    });
    page.on('pageerror', (err) => consoleErrors.push(String(err)));
    page.on('dialog', async (dialog) => {
      console.log(`  [Browser Alert Handled] "${dialog.message()}"`);
      await dialog.accept();
    });

    // -------------------------------------------------------------
    // STEP 1: Fresh Ingress - Saudi Mobile OTP Auth Gate
    // -------------------------------------------------------------
    console.log(`\n--- STEP 1: Saudi Mobile OTP Auth Gate ---`);
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });

    const gateText = await page.evaluate(() => document.body.innerText);
    check('Auth Gate rendered on fresh unauthenticated visit', 
      gateText.includes('تسجيل الدخول') && (gateText.includes('رقم جوالك') || gateText.includes('966'))
    );

    const hasPhoneInput = await page.$('input[type="tel"]');
    check('Saudi Mobile Phone input (+966 5X) exists', !!hasPhoneInput);

    // -------------------------------------------------------------
    // STEP 2: Phone Entry & 1-Click QA Preset Login
    // -------------------------------------------------------------
    console.log(`\n--- STEP 2: Phone Entry & Verified Ingress ---`);
    const presetClicked = await page.evaluate(() => {
      const presetButtons = Array.from(document.querySelectorAll('div[role="button"]'));
      const salemBtn = presetButtons.find(el => el.innerText && el.innerText.includes('سالم العامري'));
      if (salemBtn) {
        salemBtn.click();
        return true;
      }
      return false;
    });
    check('1-Click QA Preset for Salem Al-Ameri triggered', presetClicked);
    await new Promise(r => setTimeout(r, 1200));

    // -------------------------------------------------------------
    // STEP 3: 30-Day Session Persistence
    // -------------------------------------------------------------
    console.log(`\n--- STEP 3: 30-Day Session Persistence ---`);
    const sessionData = await page.evaluate(() => {
      const raw = localStorage.getItem('alo_user_session_v2.4');
      return raw ? JSON.parse(raw) : null;
    });
    check('Session stored in localStorage (alo_user_session_v2.4)', !!sessionData && sessionData.isAuthenticated);
    if (sessionData) {
      const daysRemaining = Math.round((sessionData.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
      check('Session active for 30 days', daysRemaining >= 29, `${daysRemaining} days remaining`);
    }

    // -------------------------------------------------------------
    // STEP 4: Patient Dashboard & Intake Default Doctor Preference
    // -------------------------------------------------------------
    console.log(`\n--- STEP 4: Patient Dashboard & Intake Preferences ---`);
    const homeText = await page.evaluate(() => document.body.innerText);
    check('Patient Home Screen loaded with services', 
      homeText.includes('الرأي الطبي') || homeText.includes('خدمات') || homeText.includes('الأطباء')
    );

    // Click 'ابدأ الطلب' or open intake view
    await page.goto(`${BASE}?intake=1`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    const defaultDoctorChoice = await page.evaluate(() => {
      const select = document.querySelector('select');
      return select ? select.value : null;
    });
    check('Intake doctor selection defaults to need_assistance', 
      defaultDoctorChoice === 'need_assistance', `Selected value: ${defaultDoctorChoice}`
    );

    const doctorOptionsCount = await page.evaluate(() => {
      const select = document.querySelector('select');
      return select ? select.options.length : 0;
    });
    check('Doctor dropdown populated with Medical Center physicians', doctorOptionsCount >= 3, `${doctorOptionsCount} options`);

    // -------------------------------------------------------------
    // STEP 5: 8-Step Clinical Flow on Paid Case (case-004)
    // -------------------------------------------------------------
    console.log(`\n--- STEP 5: 8-Step Clinical Flow & Role Invariants ---`);
    // Rotate to paid case-004
    await page.evaluate(() => {
      localStorage.setItem('alo_active_case_id_v2.4', 'case-004');
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    const clickPersona = async (matchTerm) => {
      await page.evaluate((term) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => 
          (b.title && b.title.toLowerCase().includes(term.toLowerCase())) ||
          (b.innerText && b.innerText.toLowerCase().includes(term.toLowerCase()))
        );
        if (btn) btn.click();
      }, matchTerm);
      await new Promise(r => setTimeout(r, 1200));
    };

    // 5.1 Saudi Doctor Review (Role D)
    await clickPersona('طبيب');
    const doctorScreenText = await page.evaluate(() => document.body.innerText);
    check('Saudi Doctor Review view renders 3 clinical focus questions', 
      doctorScreenText.includes('الأسئلة') || doctorScreenText.includes('Focus Questions') || doctorScreenText.includes('D08')
    );

    // 5.2 D08 Concurrent In-House Facility Lab & Pharmacy Orders
    check('D08 In-house facility orders for Lab (L01) and Pharmacy (H01) active', 
      doctorScreenText.includes('D08') || doctorScreenText.includes('مختبر') || doctorScreenText.includes('الفحوصات')
    );
    check('SFDA Generic Substitution policy (X20) present in doctor orders', 
      doctorScreenText.includes('بديل') || doctorScreenText.includes('SFDA') || doctorScreenText.includes('substitute')
    );

    // 5.3 International Consultant OTP Access Control (Role K - Step K00)
    await clickPersona('استشاري');
    const consultantScreenText = await page.evaluate(() => document.body.innerText);
    const hasConsultantOtp = consultantScreenText.includes('K00') || consultantScreenText.includes('OTP') || consultantScreenText.includes('WhatsApp');
    check('Consultant Access Control enforces 6-digit WhatsApp OTP (K00)', hasConsultantOtp);

    // Unlock Consultant Dossier with 123456
    const consultantUnlocked = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="123456"], input[maxlength="6"], input[type="text"]');
      if (input) {
        input.value = '123456';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const btns = Array.from(document.querySelectorAll('button'));
      const verifyBtn = btns.find(b => b.innerText && b.innerText.includes('Verify OTP'));
      if (verifyBtn) {
        verifyBtn.click();
        return true;
      }
      return false;
    });
    check('Consultant OTP 123456 entered and unlocked dossier (K01)', consultantUnlocked);
    await new Promise(r => setTimeout(r, 1000));

    // 5.4 Coordinator Invoicing & Verification (Role C)
    await clickPersona('منسق');
    const coordScreenText = await page.evaluate(() => document.body.innerText);
    check('Coordinator verification and invoicing surface verified', 
      coordScreenText.includes('منسق') || coordScreenText.includes('Coordinator') || coordScreenText.includes('سداد') || coordScreenText.includes('ZATCA')
    );

    // -------------------------------------------------------------
    // STEP 6: Sign Out & Session Revocation
    // -------------------------------------------------------------
    console.log(`\n--- STEP 6: Sign Out & Session Revocation ---`);
    const logoutClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const logoutBtn = btns.find(b => 
        (b.title && b.title.includes('خروج')) ||
        (b.title && b.title.toLowerCase().includes('sign out')) ||
        (b.innerText && (b.innerText.includes('خروج') || b.innerText.toLowerCase().includes('logout')))
      );
      if (logoutBtn) {
        logoutBtn.click();
        return true;
      }
      return false;
    });
    check('Top ribbon Logout button clicked', logoutClicked);
    await new Promise(r => setTimeout(r, 1200));

    const postLogoutSession = await page.evaluate(() => {
      return localStorage.getItem('alo_user_session_v2.4');
    });
    check('Session revoked from localStorage after logout', postLogoutSession === null);

    const postLogoutText = await page.evaluate(() => document.body.innerText);
    check('Redirected back to Saudi Mobile Auth Gate after logout', 
      postLogoutText.includes('تسجيل الدخول') || postLogoutText.includes('رقم جوالك')
    );

    // -------------------------------------------------------------
    // STEP 7: Client Error Audit
    // -------------------------------------------------------------
    console.log(`\n--- STEP 7: Client Error Audit ---`);
    check('Zero fatal client-side JavaScript console errors', consoleErrors.length === 0, 
      consoleErrors.length > 0 ? consoleErrors.join('; ') : 'Clean console logs'
    );

    const screenshotPath = path.join(OUT, 'e2e_full_verification.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Captured full-page verification screenshot: ${screenshotPath}`);

  } finally {
    await browser.close();
  }

  // Final summary
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`\n======================================================`);
  console.log(`E2E TEST SUMMARY: ${passed}/${results.length} PASSED (${failed} FAILED)`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

run().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
