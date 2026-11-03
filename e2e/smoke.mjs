// =============================================================================
// ALO DOCTOR - E2E smoke test (Puppeteer)
//
// Verifies, against a served build of the app, that the UI uses the EXACT
// persona and stage terms from the ALO DOCTOR workflow document (v2.4):
//   Personas: Patient, Saudi treating doctor, ALO nurse, ALO coordinator,
//             Indian consultant
//   Stages:   Intake received, Nurse check, Doctor review, Awaiting payment,
//             With consultant, Opinion ready, Partner services,
//             Follow-up 21 days, Closed
//
// Run locally:  npm i --no-save puppeteer && npm run build
//               npx vite preview --port 4173 &  then  node e2e/smoke.mjs
// Run in CI:    see .github/workflows/e2e.yml
// =============================================================================
import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:4173';
const ART = 'e2e-artifacts';

const PERSONA_TERMS = [
  'Patient',
  'Saudi treating doctor',
  'ALO nurse',
  'ALO coordinator',
  'Indian consultant',
];

const STAGE_TERMS = [
  'Intake received',
  'Nurse check',
  'Doctor review',
  'Awaiting payment',
  'With consultant',
  'Opinion ready',
  'Partner services',
  'Follow-up 21 days',
  'Closed',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
function check(label, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? ' :: ' + extra : ''}`);
  if (!ok) failures++;
}

fs.mkdirSync(ART, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e)));

try {
  // 1. Load
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction(() => document.body && document.body.innerText.trim().length > 0, { timeout: 30000 });
  check('app loads and renders', true);

  // 2. Switch to English so labels are the document's EN terms
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /English \(EN\)/.test(x.textContent || ''));
    if (b) b.click();
  });
  await sleep(400);

  // 3. Persona switcher: exactly 5 buttons, exact document terms
  const personaBarText = await page.evaluate(() => {
    const label = [...document.querySelectorAll('span')].find((s) => /Switch Role/.test(s.textContent || ''));
    const bar = label ? label.parentElement : null;
    return bar ? bar.innerText : '';
  });
  const personaCount = await page.evaluate(() => {
    const label = [...document.querySelectorAll('span')].find((s) => /Switch Role/.test(s.textContent || ''));
    const bar = label ? label.parentElement : null;
    return bar ? bar.querySelectorAll('button').length : 0;
  });
  check('persona switcher shows 5 roles', personaCount === 5, `count=${personaCount}`);
  for (const t of PERSONA_TERMS) check(`persona term present: "${t}"`, personaBarText.includes(t));

  // 4. Stage stepper: exact document status chain
  const bodyText = await page.evaluate(() => document.body.innerText);
  for (const t of STAGE_TERMS) check(`stage term present: "${t}"`, bodyText.includes(t));

  // 5. Click through all 5 personas without crashing
  for (let i = 0; i < 5; i++) {
    await page.evaluate((idx) => {
      const label = [...document.querySelectorAll('span')].find((s) => /Switch Role/.test(s.textContent || ''));
      const bar = label ? label.parentElement : null;
      const btns = bar ? [...bar.querySelectorAll('button')] : [];
      if (btns[idx]) btns[idx].click();
    }, i);
    await sleep(250);
  }
  check('clicked all 5 personas without crash', consoleErrors.length === 0, `consoleErrors=${consoleErrors.length}`);

  // 6. Advance stage by clicking a stepper stage button
  const clicked = await page.evaluate((term) => {
    const b = [...document.querySelectorAll('button')].find((x) => (x.textContent || '').replace('✓', '').trim() === term);
    if (b) { b.click(); return true; }
    return false;
  }, 'Nurse check');
  await sleep(300);
  const afterText = await page.evaluate(() => document.body.innerText);
  check('clicking a stepper stage advances without crash', clicked && afterText.includes('Nurse check'));

  // 7. No JS console / page errors overall
  check('no JS console or page errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await page.screenshot({ path: path.join(ART, 'e2e-final.png'), fullPage: false });
} catch (err) {
  failures++;
  console.log('FAIL  unexpected error :: ' + String(err));
  try { await page.screenshot({ path: path.join(ART, 'e2e-failure.png'), fullPage: true }); } catch {}
} finally {
  await browser.close();
}

console.log(failures === 0 ? '\nE2E RESULT: PASS' : `\nE2E RESULT: FAIL (${failures} failure(s))`);
process.exit(failures === 0 ? 0 : 1);
