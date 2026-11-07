// =============================================================================
// ALO DOCTOR - Patient home (landing page) E2E checks
//
// Verifies the mobile-first home page against the client brief:
//   - medical opinion is the strongest element and sits above doctors
//   - 9 service tiles in a 3x3 grid
//   - India is the only live destination and lists the 12 MOU hospitals
//     as a single scrolling line
//   - Thailand is reduced to flag + name + "Coming soon": no hospital count
//   - the current-request tracker shows the client's FIVE stages
//   - the bottom tab bar has five items and the WhatsApp FAB is present
//   - no horizontal overflow at 390px, 414px or desktop width
//
// Run locally:  npm i --no-save puppeteer && npm run build
//               npx vite preview --port 4173 &  then  node e2e/home.mjs
// =============================================================================
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:4173';
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
    const executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    return { puppeteer, launch: { executablePath } };
  }
};

const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

const run = async () => {
  const { puppeteer, launch } = await loadPuppeteer();
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'], ...launch });

  try {
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on('console', (msg) => msg.type() === 'error' && consoleErrors.push(msg.text()));
    page.on('pageerror', (err) => consoleErrors.push(String(err)));

    /* ----------------------------- MOBILE 390 ----------------------------- */
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.goto(BASE, { waitUntil: 'networkidle0' });
    await page.waitForSelector('[data-testid="opinion-card"]');

    const shot = async (name) => page.screenshot({ path: path.join(OUT, name), fullPage: false });
    await shot('home-mobile-top.png');

    // 1. Medical opinion on top, with a working primary action
    const opinion = await page.$eval('[data-testid="opinion-card"]', (el) => ({
      text: el.textContent.replace(/\s+/g, ' ').trim(),
      buttons: el.querySelectorAll('button').length,
    }));
    check('medical opinion card renders', opinion.text.length > 0, opinion.text.slice(0, 48));
    check('medical opinion has one primary action', opinion.buttons >= 1, `${opinion.buttons} button(s)`);

    // Order: opinion must appear above the doctors strip
    const order = await page.evaluate(() => {
      const a = document.querySelector('[data-testid="opinion-card"]');
      const b = document.querySelector('[data-testid="doctor-card"]');
      if (!a || !b) return null;
      return a.getBoundingClientRect().top < b.getBoundingClientRect().top;
    });
    check('medical opinion sits above doctors', order === true);

    // 2. Doctors and specialties
    const doctors = await page.$$('[data-testid="doctor-card"]');
    check('doctors + specialties strip', doctors.length >= 3, `${doctors.length} cards`);

    // 3. Services 3x3
    const tiles = await page.$$('[data-testid="service-tile"]');
    check('nine service tiles', tiles.length === 9, `${tiles.length} tiles`);
    const columns = await page.$eval(
      '[data-testid="service-tile"]',
      (el) => el.parentElement ? getComputedStyle(el.parentElement).gridTemplateColumns.split(' ').length : 0,
    );
    check('service grid is 3 columns', columns === 3, `${columns} columns`);

    // 4. Treatment Abroad + India + 12 MOU names
    await page.evaluate(() =>
      document.getElementById('travel-abroad')?.scrollIntoView({ block: 'start' }),
    );
    await new Promise((r) => setTimeout(r, 600));
    await shot('home-mobile-travel.png');

    const indiaText = await page.$eval('[data-testid="india-card"]', (el) =>
      el.textContent.replace(/\s+/g, ' ').trim(),
    );
    check('India card shows the hospital count', /12/.test(indiaText), indiaText.slice(0, 60));

    const hospitals = await page.$$('[data-testid="mou-hospital"]');
    check('12 MOU hospital names rendered', hospitals.length === 12, `${hospitals.length} names`);

    const singleLine = await page.$$eval('[data-testid="india-card"] [data-testid="mou-hospital"]', (els) => {
      if (!els.length) return null;
      const tops = new Set(els.map((el) => Math.round(el.getBoundingClientRect().top)));
      return tops.size === 1;
    });
    check('hospital names occupy one line', singleLine === true);

    // 5. Thailand = flag + name + Coming soon only
    const coming = await page.$$eval('[data-testid="coming-soon"]', (els) =>
      els.map((el) => ({ tag: el.tagName, text: el.textContent.replace(/\s+/g, ' ').trim() })),
    );
    check('coming-soon destinations render', coming.length >= 1, `${coming.length} card(s)`);
    const thai = coming.find((c) => /thailand|تايلاند/i.test(c.text));
    check('Thailand shows as coming soon', !!thai, thai ? thai.text : 'not found');
    check('coming-soon card carries no hospital count', !!thai && !/\d+\s*(hospitals|مستشفى)/i.test(thai.text));
    check('coming-soon card is not interactive', !!thai && thai.tag !== 'BUTTON');

    // 6. Five-stage tracker
    await page.evaluate(() =>
      document.querySelector('[data-testid="tracker-step"]')?.scrollIntoView({ block: 'center' }),
    );
    await new Promise((r) => setTimeout(r, 400));
    const steps = await page.$$eval('[data-testid="tracker-step"]', (els) =>
      els.map((el) => el.textContent.replace(/\s+/g, ' ').trim()),
    );
    check('request tracker shows five stages', steps.length === 5, steps.join(' | '));
    await shot('home-mobile-tracker.png');

    // 7. Chrome: tab bar + FAB
    const tabs = await page.$$('[data-testid="tab-item"]');
    check('bottom tab bar has five items', tabs.length === 5, `${tabs.length} items`);
    check('WhatsApp FAB present', !!(await page.$('[data-testid="whatsapp-fab"]')));

    // 8. No horizontal overflow
    const mobileWidth = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    check(
      'no horizontal overflow at 390px',
      mobileWidth.scroll <= mobileWidth.client + 1,
      `${mobileWidth.scroll} / ${mobileWidth.client}`,
    );

    // 9. "Next phase" destinations stay on the home page
    const tabBars = await page.$$('[data-testid="tab-item"]');
    await tabBars[2].click(); // Medical File
    await new Promise((r) => setTimeout(r, 350));
    const sheetVisible = await page.evaluate(() => document.body.textContent.includes('next phase') || document.body.textContent.includes('المرحلة القادمة'));
    check('unbuilt tab opens an inline sheet', sheetVisible);
    check('home page still rendered behind the sheet', !!(await page.$('[data-testid="opinion-card"]')));
    await shot('home-mobile-sheet.png');
    await page.keyboard.press('Escape');
    await page.evaluate(() => {
      const close = Array.from(document.querySelectorAll('button')).find(
        (b) => b.getAttribute('aria-label') === 'Close' || b.getAttribute('aria-label') === 'إغلاق',
      );
      close?.click();
    });

    /* ---------------------------- MOBILE 414 ----------------------------- */
    await page.setViewport({ width: 414, height: 896, deviceScaleFactor: 2 });
    await page.reload({ waitUntil: 'networkidle0' });
    const width414 = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    check(
      'no horizontal overflow at 414px',
      width414.scroll <= width414.client + 1,
      `${width414.scroll} / ${width414.client}`,
    );

    /* ----------------------------- DESKTOP ------------------------------- */
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('[data-testid="opinion-card"]');
    await shot('home-desktop.png');
    const desktopWidth = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    check(
      'no horizontal overflow at 1440px',
      desktopWidth.scroll <= desktopWidth.client + 1,
      `${desktopWidth.scroll} / ${desktopWidth.client}`,
    );

    /* -------------------------- BILINGUAL TOGGLE ------------------------- */
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.reload({ waitUntil: 'networkidle0' });
    const toEnglish = await page.$('button[aria-label="Switch to English"]');
    if (toEnglish) {
      await toEnglish.click();
      await new Promise((r) => setTimeout(r, 500));
    } else {
      // already in English
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 300));
    await shot('home-mobile-english.png');
    const englishText = await page.$eval('[data-testid="opinion-card"]', (el) =>
      el.textContent.replace(/\s+/g, ' ').trim(),
    );
    check('bilingual toggle switches the home page to English', /opinion|request/i.test(englishText), englishText.slice(0, 48));
    const englishWidth = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    check(
      'no horizontal overflow in English at 390px',
      englishWidth.scroll <= englishWidth.client + 1,
      `${englishWidth.scroll} / ${englishWidth.client}`,
    );

    check('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.error(`FAILED: ${failed.map((f) => f.name).join(', ')}`);
    process.exitCode = 1;
  }
};

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
