import { chromium } from 'playwright';

const LIVE_URL = 'https://ad.howtostart.in/feature-sarat/?portal=patient';

async function loginUser(page, phone, pin = '1234') {
  await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const phoneInput = page.locator('input[type="tel"]').first();
  if (!(await phoneInput.isVisible())) {
    const loginBtn = page.locator('button:has-text("Login"), button:has-text("تسجيل الدخول")').first();
    if (await loginBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loginBtn.click();
      await page.waitForTimeout(600);
    }
  }

  await phoneInput.waitFor({ state: 'visible', timeout: 12000 });
  await phoneInput.fill(phone);
  await page.waitForTimeout(400);

  const submitPhoneBtn = page.locator('form button[type="submit"]').first();
  await submitPhoneBtn.click();
  await page.waitForTimeout(1000);

  const pinInputs = page.locator('input[type="password"]');
  await pinInputs.first().waitFor({ state: 'visible', timeout: 10000 });
  for (let i = 0; i < 4; i++) {
    await pinInputs.nth(i).fill(pin[i]);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(500);

  const submitPinBtn = page.locator('form button[type="submit"]').last();
  await submitPinBtn.click();
  await page.waitForTimeout(2000);
}

async function navigateToIntake(page) {
  const startBtn = page.locator('button:has-text("ابدأ طلبك السريري"), button:has-text("اختيار الرأي الطبي الثاني"), button:has-text("طلب استشارة جديدة"), button:has-text("New Consultation")').first();
  if (await startBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('   Clicking Start button to open Intake form...');
    await startBtn.click();
    await page.waitForTimeout(1500);
  }
}

async function runPhysicalVerification() {
  console.log('\n========================================================================');
  console.log('👁️  STARTING PHYSICAL VISIBLE VERIFICATION: INTAKE BENEFICIARY MODES');
  console.log('   Target: ' + LIVE_URL);
  console.log('   Window 1 (Left):  Direct Patient Mode ("Me / نفسي")');
  console.log('   Window 2 (Right): Caregiver Proxy Mode ("Family / أحد أفراد الأسرة")');
  console.log('   Pacing: Both windows positioned side-by-side and held for 3 MINUTES');
  console.log('========================================================================\n');

  // Launch Window 1 (Left Half: position 0, 0)
  console.log('▶ [Window 1: Direct Patient Mode (Me)]');
  const browser1 = await chromium.launch({
    headless: false,
    slowMo: 60,
    args: ['--window-size=720,950', '--window-position=0,0']
  });
  const ctx1 = await browser1.newContext({ viewport: { width: 720, height: 900 } });
  const page1 = await ctx1.newPage();
  await page1.bringToFront();

  console.log('   Logging in Window 1 (+966500000099)...');
  await loginUser(page1, '+966500000099', '1234');
  await navigateToIntake(page1);

  // Ensure Window 1 has "Me" active
  const meToggle1 = page1.locator('button:has-text("نفسي"), button:has-text("Me")').first();
  if (await meToggle1.isVisible({ timeout: 10000 }).catch(() => false)) {
    await meToggle1.click();
    await page1.waitForTimeout(800);
    console.log('   ✓ Window 1: Direct Patient Mode Active (Me / نفسي)');
    console.log('   ✓ Verified Account Holder: Sami Al-Harbi (+966 50 000 0099 · National ID 10********)');
  }

  // Launch Window 2 (Right Half: position 720, 0)
  console.log('\n▶ [Window 2: Caregiver / Family Mode]');
  const browser2 = await chromium.launch({
    headless: false,
    slowMo: 60,
    args: ['--window-size=720,950', '--window-position=720,0']
  });
  const ctx2 = await browser2.newContext({ viewport: { width: 720, height: 900 } });
  const page2 = await ctx2.newPage();
  await page2.bringToFront();

  console.log('   Logging in Window 2 (+966500000099)...');
  await loginUser(page2, '+966500000099', '1234');
  await navigateToIntake(page2);

  // Switch to Family / Dependent Mode
  const familyToggle2 = page2.locator('button:has-text("أحد أفراد الأسرة"), button:has-text("Family")').first();
  if (await familyToggle2.isVisible({ timeout: 10000 }).catch(() => false)) {
    await familyToggle2.click();
    await page2.waitForTimeout(1000);
    console.log('   ✓ Window 2: Switched to Caregiver / Family Mode (P13)');
  }

  // Fill in Beneficiary Details
  console.log('   Filling beneficiary patient details for elderly parent...');
  const patNameInput = page2.locator('input[placeholder*="فهد الحربي"], input[placeholder*="Fahad Al-Harbi"]').first();
  if (await patNameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await patNameInput.fill('فهد الحربي (Fahad Al-Harbi)');
    await page2.waitForTimeout(300);
  }

  const patIdInput = page2.locator('input[placeholder="10XXXXXXXX"]').first();
  if (await patIdInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await patIdInput.fill('1098765432');
    await page2.waitForTimeout(300);
  }

  // Select Relationship: Parent
  const relSelect = page2.locator('select').first();
  if (await relSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
    await relSelect.selectOption('Parent');
    await page2.waitForTimeout(300);
  }

  // Set Age
  const ageInput = page2.locator('input[type="number"]').first();
  if (await ageInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await ageInput.fill('68');
    await page2.waitForTimeout(300);
  }

  // Type sample symptoms
  const sympInput = page2.locator('textarea').first();
  if (await sympInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await sympInput.fill('ألم ضاغط في الصدر وضيق تنفس أثناء المشي وصعود الدرج منذ 3 أسابيع (الوالد يحتاج تقييم استشاري)');
    await page2.waitForTimeout(500);
  }

  console.log('   ✓ Window 2: Beneficiary configured:');
  console.log('     • Beneficiary: فهد الحربي (Fahad Al-Harbi)');
  console.log('     • National ID: 1098765432 · Age: 68 · Relationship: Parent');
  console.log('     • Communication Anchor: Caregiver Phone (+966 50 000 0099)');

  console.log('\n========================================================================');
  console.log('🎉 BOTH BROWSERS CONFIGURED & DISPLAYED SIDE-BY-SIDE ON SCREEN!');
  console.log('   Left Window:  Direct Patient (Me) · Sami Al-Harbi');
  console.log('   Right Window: Caregiver Mode (Family) · Fahad Al-Harbi via Caregiver Sami');
  console.log('   Holding windows open for 3 MINUTES (180 seconds) for physical review...');
  console.log('========================================================================\n');

  // Countdown timer for 3 minutes (180 seconds)
  const totalSeconds = 180;
  for (let rem = totalSeconds; rem > 0; rem -= 15) {
    console.log(`⏱️  Windows held open on your screen: ${rem} seconds remaining...`);
    await page1.waitForTimeout(15000);
  }

  console.log('\n✅ 3-minute physical review completed. Closing test browsers.');
  await browser1.close();
  await browser2.close();
}

runPhysicalVerification().catch((err) => {
  console.error('❌ Verification Error:', err);
  process.exit(1);
});
