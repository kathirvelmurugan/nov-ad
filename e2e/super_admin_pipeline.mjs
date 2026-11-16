// =============================================================================
// ALO DOCTOR - Super Admin Stage Pipeline + Latest Activity E2E Test (Playwright)
// Verifies against LIVE production at https://ad.howtostart.in
//
// Login flow:
//   1. Landing page → click "Login" → auth modal (phone step)
//   2. Click "Super Admin Access" → super_admin step
//   3. #auth-sa-pin ← "1234" → submit (red button)
//   4. Server validates → portal renders (may be Arabic by default)
//   5. Switch to English via language toggle → verify all items
// =============================================================================
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'https://ad.howtostart.in';
const ART = path.join(__dirname, '..', 'e2e_screenshots');

let failures = 0;
function check(label, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? ' :: ' + extra : ''}`);
  if (!ok) failures++;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log('=== ALO DOCTOR Super Admin E2E (Playwright) ===\n');

const browser = await chromium.launch({
  headless: false,
  slowMo: 80,
  args: [
    '--disable-features=TranslateUI',
    '--lang=en-US',
  ],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'en-US',
  timezoneId: 'Asia/Riyadh',
});
// Suppress the Chrome "Translate this page?" prompt
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
});
const page = await context.newPage();

// ── Step 1: Clear storage, load landing page ────────────────────────────────
console.log('--- Step 1: Landing page ---');
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
await sleep(2000);

const landingText = await page.evaluate(() => document.body.innerText);
check('Landing page loads', landingText.includes('How It Works') || landingText.includes('Start Your Case'));
console.log(`  Body: ${landingText.length} chars`);

// ── Step 2: Click "Login" → auth modal ──────────────────────────────────────
console.log('\n--- Step 2: Auth modal ---');
await page.locator('button', { hasText: /^Login$/ }).first().click();
await sleep(1500);

const authText = await page.evaluate(() => document.body.innerText);
check('Auth modal opened', authText.includes('Super Admin Access') || authText.includes('Mobile Number') || authText.includes('رقم الجوال'));

// ── Step 3: "Super Admin Access" → restricted card ──────────────────────────
console.log('\n--- Step 3: Super Admin mode ---');
const saBtn = page.locator('button', { hasText: /Super Admin Access|مدير النظام/ });
check('"Super Admin Access" button found', await saBtn.count() > 0);
await saBtn.first().click();
await sleep(1500);

const restricted = await page.locator('text=Restricted Area').first().isVisible().catch(() => false);
const restrictedAr = await page.evaluate(() => document.body.innerText.includes('منطقة مقيدة'));
check('Restricted area card appears', restricted || restrictedAr);

// ── Step 4: PIN → authenticate ──────────────────────────────────────────────
console.log('\n--- Step 4: Authenticate ---');
const pinInput = page.locator('#auth-sa-pin');
check('PIN input found', await pinInput.count() > 0);

await pinInput.fill('1234');
await sleep(400);

const submitBtn = page.locator('form button[type="submit"]').first();
check('Submit enabled', !(await submitBtn.isDisabled()));

await submitBtn.click();
console.log('  Submitted, waiting...');
await sleep(5000);

// ── Step 5: Verify portal loads ─────────────────────────────────────────────
console.log('\n--- Step 5: Portal loaded ---');
let portalText = await page.evaluate(() => document.body.innerText);
console.log(`  Body: ${portalText.length} chars`);

// Portal shows Arabic by default (app language preference is 'ar')
// Check with both Arabic and English portal indicators
const hasPortalAr = portalText.includes('سجل الحالات') || portalText.includes('الحوكمة');
const hasPortalEn = portalText.includes('All Cases') || portalText.includes('Master Clinical');
check('Super Admin portal renders', hasPortalAr || hasPortalEn);
console.log(`  Arabic portal: ${hasPortalAr}, English portal: ${hasPortalEn}`);

// ── Step 6: Switch to English ───────────────────────────────────────────────
console.log('\n--- Step 6: Switch to English ---');
const enBtn = page.locator('button[title="Switch Interface to English"]');
const enCount = await enBtn.count();
check('English language toggle found', enCount > 0, `count=${enCount}`);

if (enCount > 0) {
  await enBtn.first().click();
  await sleep(2000);
  
  // Verify language switched
  portalText = await page.evaluate(() => document.body.innerText);
  const switched = portalText.includes('Latest Activity') || portalText.includes('Master Clinical') || portalText.includes('All Cases');
  check('Language switched to English', switched);
}

// ── TEST 1: Latest Activity Widget ──────────────────────────────────────────
console.log('\n--- TEST 1: Latest Activity Widget ---');
const activityCardText = await page.evaluate(() => {
  const buttons = [...document.querySelectorAll('button')];
  // Activity card: contains "Latest Activity" or "آخر تحديث" + patient/stage info
  const card = buttons.find(b => {
    const t = b.textContent || '';
    return t.includes('Latest Activity') || t.includes('آخر تحديث');
  });
  return card ? card.textContent.replace(/\s+/g, ' ').trim() : '';
});
console.log(`  Card: "${activityCardText.substring(0, 200)}"`);
check('Activity card shows "Latest Activity"', activityCardText.includes('Latest Activity') || activityCardText.includes('آخر تحديث'));
check('Activity card has patient/stage', activityCardText.length > 30);

// Time indicator: optional (server cases may not have updatedAt)
const hasTime = activityCardText.includes('m ago') || activityCardText.includes('now') || activityCardText.includes('h ago') || activityCardText.includes('د') || activityCardText.includes('الآن');
console.log(`  Time indicator: ${hasTime} (absent if no updatedAt — normal)`);

// Capture header + Latest Activity widget (viewport top)
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await sleep(400);
await page.screenshot({ path: path.join(ART, '01-header-activity-widget.png'), fullPage: false });
console.log('  Screenshot: 01-header-activity-widget.png');

// ── TEST 2: Stage Pipeline Pills ────────────────────────────────────────────
console.log('\n--- TEST 2: Stage Pipeline Pills ---');
// Tabs are now in English — the "Cases" tab should be active
// Stage pills are buttons with 3 child spans: num + label + count
const EN_LABELS = ['ALL', 'Intake', 'Triage', 'Doctor', 'Payment', 'Consultant', 'Opinion', 'Services', 'Follow-Up', 'Closed'];
const AR_LABELS = ['الكل', 'استلام', 'فرز', 'طبيب', 'سداد', 'استشاري', 'رأي', 'خدمات', 'متابعة', 'مغلق'];

let pillsFound = 0;
for (let i = 0; i < EN_LABELS.length; i++) {
  const found = await page.evaluate((lbls) => {
    return [...document.querySelectorAll('button')].some(b => {
      const t = b.textContent || '';
      return lbls.some(l => t.includes(l));
    });
  }, [EN_LABELS[i], AR_LABELS[i]]);
  if (found) pillsFound++;
  check(`"${EN_LABELS[i]}"`, found);
}
console.log(`  ${pillsFound}/${EN_LABELS.length}`);

// Scroll down to pills area and capture
await page.evaluate(() => { const el = document.querySelector('select'); if (el) el.scrollIntoView({ block: 'start' }); });
await sleep(400);
await page.evaluate(() => window.scrollBy(0, -60));
await sleep(200);
await page.screenshot({ path: path.join(ART, '02-stage-pipeline-pills.png'), fullPage: false });
console.log('  Screenshot: 02-stage-pipeline-pills.png');

// ── TEST 3: Mini Pipeline Flow ──────────────────────────────────────────────
console.log('\n--- TEST 3: Pipeline Flow ---');
const nodes = await page.evaluate(() => {
  return [...document.querySelectorAll('button')].filter(b => {
    const title = b.getAttribute('title') || '';
    return title.includes(':');
  }).length;
});
check('9 stage nodes', nodes >= 9, `found ${nodes}`);

// Capture mini pipeline nodes
await page.screenshot({ path: path.join(ART, '03-mini-pipeline-flow.png'), fullPage: false });
console.log('  Screenshot: 03-mini-pipeline-flow.png');

// ── TEST 4: Stage Filtering ─────────────────────────────────────────────────
console.log('\n--- TEST 4: Stage Filtering ---');
// Click "Closed" pill (or "مغلق" if still Arabic)
const clickedClosed = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find(b => {
    const t = b.textContent || '';
    return (t.includes('Closed') || t.includes('مغلق')) && /\d/.test(t);
  });
  if (btn) { btn.click(); return true; }
  return false;
});
check('Clicked "Closed"', clickedClosed);
await sleep(600);
await page.screenshot({ path: path.join(ART, '04-filtered-closed.png'), fullPage: false });
console.log('  Screenshot: 04-filtered-closed.png');

// Click "ALL"/"الكل" to reset
const clickedAll = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find(b => {
    const t = b.textContent || '';
    return (t.includes('ALL') || t.includes('الكل')) && /\d/.test(t);
  });
  if (btn) { btn.click(); return true; }
  return false;
});
check('Clicked ALL reset', clickedAll);
await sleep(600);

// ── TEST 4b: Verify removed Super Admin header elements ─────────────────────
console.log('\n--- TEST 4b: Header clean-up ---');
const fullText = await page.evaluate(() => document.body.innerText);
const noCaseFile = !fullText.includes('Case File:');
const noActiveRole = !fullText.includes('Active Role:');
check('No "Case File:" in Super Admin header', noCaseFile);
check('No "Active Role:" in Super Admin header', noActiveRole);

// ── TEST 4c: Care Team SA column header ────────────────────────────────────
console.log('\n--- TEST 4c: Care Team SA ---');
const hasCareTeamSA = await page.evaluate(() => {
  const ths = [...document.querySelectorAll('th')];
  return ths.some(th => (th.textContent || '').includes('Care Team SA') || (th.textContent || '').includes('الفريق الطبي السعودي'));
});
check('Table header shows "Care Team SA"', hasCareTeamSA);

// ── TEST 5: Cases Table + Care Team SA ─────────────────────────────────────
console.log('\n--- TEST 5: Cases Table ---');
// Scroll down to the table area
await page.evaluate(() => { const th = document.querySelector('th'); if (th) th.scrollIntoView({ block: 'start' }); });
await sleep(500);
await page.evaluate(() => window.scrollBy(0, -30));
await sleep(200);
await page.screenshot({ path: path.join(ART, '05-cases-table-care-team-sa.png'), fullPage: false });
console.log('  Screenshot: 05-cases-table-care-team-sa.png');

// ── TEST 6: Hospital Dropdown ───────────────────────────────────────────────
console.log('\n--- TEST 6: Hospital Dropdown ---');
const opts = await page.evaluate(() => {
  const sel = document.querySelector('select');
  if (!sel) return [];
  return [...sel.options].map(o => o.textContent.trim());
});
console.log(`  Options: ${opts.join(' | ')}`);
check('English names present', opts.some(o => /Medical|Hospital|Center|Complex/i.test(o)));

// Capture hospital filter area
await page.evaluate(() => { const sel = document.querySelector('select'); if (sel) sel.scrollIntoView({ block: 'center' }); });
await sleep(400);
await page.screenshot({ path: path.join(ART, '06-hospital-dropdown.png'), fullPage: false });
console.log('  Screenshot: 06-hospital-dropdown.png');

// ── TEST 7: Drill-down view — verify no empty Egress Token ──────────────────
console.log('\n--- TEST 7: Drill-down (Egress Token hidden when empty) ---');
// Click on first case row to open drill-down
const drillOpened = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('tr')];
  // Find a row that has case data (has a td with ALO- pattern or case number)
  const caseRow = rows.find(r => /ALO-\d/.test(r.textContent || ''));
  if (caseRow) { caseRow.click(); return true; }
  // Fallback: try clicking any clickable row in the table body
  const tbody = document.querySelector('tbody');
  if (tbody) {
    const firstRow = tbody.querySelector('tr');
    if (firstRow) { firstRow.click(); return true; }
  }
  return false;
});
check('Opened case drill-down', drillOpened);
await sleep(2000);

// Check drill-down content for missing egress token
const drillText = await page.evaluate(() => document.body.innerText);
const noEgressToken = !drillText.includes('Cross-Border Egress Token') || drillText.includes('Cross-Border Egress Token') && !drillText.includes('N/A');
console.log(`  Drill-down has "Cross-Border Egress Token": ${drillText.includes('Cross-Border Egress Token')}`);
check('Egress Token NOT shown when empty/N/A', !drillText.includes('Cross-Border Egress Token') || drillText.includes('Cross-Border Egress Token') && !/cross-border egress token\s+N\/A/i.test(drillText));

await page.screenshot({ path: path.join(ART, '07-drilldown-no-egress-token.png'), fullPage: false });
console.log('  Screenshot: 07-drilldown-no-egress-token.png');

// Close drill-down (click backdrop or close button)
await page.keyboard.press('Escape');
await sleep(600);

// ── FINAL: Scrolled full-page capture ───────────────────────────────────────
// Scroll back to top first, then full page
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await sleep(400);
await page.screenshot({ path: path.join(ART, '08-super-admin-fullpage.png'), fullPage: true });
console.log(`\n  Screenshots: ${ART}`);

await browser.close();
console.log(failures === 0 ? '\n======== E2E RESULT: PASS ========' : `\n======== E2E RESULT: FAIL (${failures} failures) ========`);
process.exit(failures === 0 ? 0 : 1);