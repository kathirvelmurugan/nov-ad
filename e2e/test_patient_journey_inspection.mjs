import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TARGET_URL = 'https://ad.howtostart.in/feature-sarat/';
const SCREENSHOT_DIR = './e2e_screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runInspection() {
  console.log(`\n🚀 Starting Playwright Patient Journey Inspection on: ${TARGET_URL}\n`);
  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // TEST 1: DESKTOP VIEWPORT (1280x800)
    // -------------------------------------------------------------
    console.log('--- TEST 1: DESKTOP VIEWPORT (1280x800) ---');
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      locale: 'ar-SA'
    });
    const desktopPage = await desktopContext.newPage();

    console.log('1. Navigating to landing page...');
    await desktopPage.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '01_desktop_landing.png'), fullPage: false });
    console.log('   Captured: 01_desktop_landing.png');

    const landingTitle = await desktopPage.title();
    console.log(`   Page Title: "${landingTitle}"`);

    // Check visible service buttons
    const startButtons = await desktopPage.locator('button').allInnerTexts();
    console.log(`   Visible Buttons (sample): ${startButtons.filter(b => b.trim().length > 0).slice(0, 8).join(' | ')}`);

    // Click "Get Second Opinion" / "Start Case"
    console.log('2. Clicking "Start Case" / "Get Second Opinion"...');
    const startCaseBtn = desktopPage.locator('button:has-text("احصل على رأي"), button:has-text("ابدأ الآن"), button:has-text("Start"), button:has-text("الخدمات السريرية")').first();
    
    if (await startCaseBtn.isVisible()) {
      const btnText = await startCaseBtn.innerText();
      console.log(`   Found start button: "${btnText}" -> Clicking it...`);
      await startCaseBtn.click();
      await desktopPage.waitForTimeout(2000);
    } else {
      console.log('   Primary start button not found with text search, looking for service cards...');
      const serviceCard = desktopPage.locator('#services, [id*="service"]').first();
      if (await serviceCard.isVisible()) {
        console.log('   Found services section, clicking first service card button...');
        const cardBtn = serviceCard.locator('button').first();
        if (await cardBtn.isVisible()) await cardBtn.click();
        await desktopPage.waitForTimeout(2000);
      }
    }

    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '02_desktop_after_click.png'), fullPage: false });
    console.log('   Captured: 02_desktop_after_click.png');

    // Check if login gate opened
    const isAuthGateVisible = await desktopPage.locator('text=تسجيل الدخول, text=Sign In, input[type="tel"]').isVisible().catch(() => false);
    console.log(`   Auth Gate / Login Modal Visible? ${isAuthGateVisible}`);

    if (isAuthGateVisible) {
      console.log('   Entering Patient Phone and submitting...');
      const phoneInput = desktopPage.locator('input[type="tel"], input[placeholder*="5"]').first();
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('500000010');
        await desktopPage.waitForTimeout(500);
        const submitPhoneBtn = desktopPage.locator('button:has-text("متابعة"), button:has-text("دخول"), button:has-text("Continue"), button:has-text("Sign In")').first();
        if (await submitPhoneBtn.isVisible()) {
          await submitPhoneBtn.click();
          await desktopPage.waitForTimeout(1000);
        }
      }

      // Check if PIN input appears
      const pinInput = desktopPage.locator('input[type="password"], input[maxlength="4"], input[placeholder*="PIN"], input[placeholder*="رمز"]').first();
      if (await pinInput.isVisible().catch(() => false)) {
        console.log('   Entering PIN 1234...');
        await pinInput.fill('1234');
        await desktopPage.waitForTimeout(500);
        const verifyBtn = desktopPage.locator('button:has-text("تأكيد"), button:has-text("Verify"), button:has-text("دخول")').first();
        if (await verifyBtn.isVisible()) await verifyBtn.click();
        await desktopPage.waitForTimeout(2000);
      }
    }

    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '03_desktop_intake_view.png'), fullPage: false });
    console.log('   Captured: 03_desktop_intake_view.png');

    // Inspect intake fields
    const intakeDoctorCard = await desktopPage.locator('text=P04-B, text=الطبيب المعالج, text=Saudi treating doctor').isVisible().catch(() => false);
    const consultationFormatCard = await desktopPage.locator('text=P11, text=صيغة الاستشارة, text=Consultation Format').isVisible().catch(() => false);
    const symptomsField = await desktopPage.locator('textarea, input[placeholder*="الأعراض"], input[placeholder*="Symptoms"]').isVisible().catch(() => false);
    
    console.log(`   [Desktop Intake Inspection Results]:`);
    console.log(`   - Saudi Treating Doctor Selection (P04-B) Visible: ${intakeDoctorCard}`);
    console.log(`   - Consultation Format Selection (P11) Visible: ${consultationFormatCard}`);
    console.log(`   - Clinical Symptoms Input Visible: ${symptomsField}`);

    // -------------------------------------------------------------
    // TEST 2: MOBILE VIEWPORT (390x844 - iPhone 14 style)
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: MOBILE VIEWPORT (390x844) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      locale: 'ar-SA'
    });
    const mobilePage = await mobileContext.newPage();

    console.log('1. Navigating to mobile landing page...');
    await mobilePage.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '04_mobile_landing.png'), fullPage: false });
    console.log('   Captured: 04_mobile_landing.png');

    // Check what is visible in mobile landing view
    const mobileHeaders = await mobilePage.locator('h1, h2, h3').allInnerTexts();
    console.log(`   Mobile Headings (sample): ${mobileHeaders.slice(0, 5).join(' | ')}`);

    console.log('2. Clicking "Start Case" on Mobile...');
    const mobileStartBtn = mobilePage.locator('button:has-text("احصل على رأي"), button:has-text("ابدأ الآن"), button:has-text("Start"), button:has-text("طلب استشارة")').first();
    if (await mobileStartBtn.isVisible()) {
      console.log(`   Found mobile start button: "${await mobileStartBtn.innerText()}" -> Clicking...`);
      await mobileStartBtn.click();
      await mobilePage.waitForTimeout(2000);
    }

    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '05_mobile_after_click.png'), fullPage: false });
    console.log('   Captured: 05_mobile_after_click.png');

    // Also test direct deep link: subview=intake
    console.log('3. Navigating to mobile deep link: ?subview=intake ...');
    await mobilePage.goto(`${TARGET_URL}?subview=intake`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1500);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '06_mobile_intake_view.png'), fullPage: false });
    console.log('   Captured: 06_mobile_intake_view.png');

    const mobileDoctorCard = await mobilePage.locator('text=P04-B, text=الطبيب المعالج, text=Saudi treating doctor').isVisible().catch(() => false);
    const mobileFormatCard = await mobilePage.locator('text=P11, text=صيغة الاستشارة, text=Consultation Format').isVisible().catch(() => false);
    
    console.log(`   [Mobile Intake Inspection Results]:`);
    console.log(`   - Mobile Saudi Treating Doctor Selection (P04-B): ${mobileDoctorCard}`);
    console.log(`   - Mobile Consultation Format Selection (P11): ${mobileFormatCard}`);

    console.log('\n✅ Playwright Patient Journey Inspection Completed Successfully.\n');
  } catch (err) {
    console.error('❌ Error during inspection:', err);
  } finally {
    await browser.close();
  }
}

runInspection();
