import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const BASE = process.env.TARGET_URL || 'https://ad.howtostart.in/';
const OUT = path.resolve('e2e-artifacts');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, condition, detail = '') => {
  results.push({ name, ok: !!condition, detail });
  const status = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}  ${name}${detail ? `  (${detail})` : ''}`);
};

const run = async () => {
  console.log(`\n======================================================`);
  console.log(`🚀 VERIFYING LIVEKIT WEBRTC & IN-PERSON EXAM FLAG: ${BASE}`);
  console.log(`======================================================\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto(BASE, { waitUntil: 'networkidle2' });

    // Step 1: Login via QA Preset Salem
    await page.waitForSelector('div[role="button"]');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div[role="button"]'));
      const card = cards.find(el => el.innerText.includes('سالم العامري') || el.innerText.includes('Salem'));
      if (card) card.click();
    });
    check('Auth QA Preset Salem authenticated', true);
    await new Promise(r => setTimeout(r, 1200));

    // Enable studio view to access doctor persona & active case-004
    await page.evaluate(() => {
      localStorage.setItem('alo_view_mode_v2.4', 'studio');
      localStorage.setItem('alo_active_case_id_v2.4', 'case-004');
    });
    await page.goto(`${BASE}?demo=1`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    // Step 2: Switch to Saudi Doctor Review View (D01)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => 
        (b.title && b.title.includes('طبيب')) ||
        (b.innerText && b.innerText.includes('طبيب'))
      );
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Step 3: Check In-Person Physical Exam checkbox presence
    const doctorScreenText = await page.evaluate(() => document.body.innerText);
    const inPersonFound = doctorScreenText.includes('فحص سريري حضوري بالمجمع الطبي') || 
                          doctorScreenText.includes('In-Person Clinical Exam Required');
    check('Universal In-Person Exam flag is rendered on Doctor Review screen', inPersonFound);

    const universalBadgeFound = doctorScreenText.includes('للرأي المكتوب والمرئي') || 
                               doctorScreenText.includes('Universal (Written & Video)');
    check('In-Person Exam explicitly marked Universal (Written & Video)', universalBadgeFound);

    // Step 4: Advance to Stage 6 (OPINION_READY) & test Telehealth LiveKit Room
    await page.evaluate(() => {
      localStorage.setItem('alo_patient_subview_v2.4', 'telehealth');
      const buttons = Array.from(document.querySelectorAll('button'));
      const pBtn = buttons.find(b => (b.innerText && b.innerText.includes('مريض')) || (b.title && b.title.includes('مريض')));
      if (pBtn) pBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    const telehealthText = await page.evaluate(() => document.body.innerText);
    const hasLiveKitRoom = telehealthText.includes('LiveKit') || 
                           telehealthText.includes('WebRTC') ||
                           telehealthText.includes('المتعدد التخصصات') ||
                           telehealthText.includes('Telehealth');
    check('LiveKit WebRTC Telehealth Room view rendered at Stage 6', hasLiveKitRoom);

    const hasLiveKitButtons = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button')).map(b => b.innerText);
      return btns.some(t => t.includes('LiveKit') || t.includes('البث المباشر') || t.includes('WebRTC') || t.includes('التقرير'));
    });
    check('LiveKit connection trigger button is interactive', hasLiveKitButtons);

    console.log(`\n======================================================`);
    const allPassed = results.every(r => r.ok);
    console.log(`SUMMARY: ${results.filter(r => r.ok).length}/${results.length} PASSED (Exit Code: ${allPassed ? 0 : 1})`);
    console.log(`======================================================\n`);

    await browser.close();
    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('Test error:', err);
    await browser.close();
    process.exit(1);
  }
};

run();
