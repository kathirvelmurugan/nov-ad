import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
const page = await ctx.newPage();

await page.goto('https://ad.howtostart.in', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));

// Login
await page.locator('button', { hasText: /^Login$/ }).first().click();
await new Promise(r => setTimeout(r, 1500));

// Super Admin
const saBtn = page.locator('button', { hasText: /Super Admin Access/ });
if (await saBtn.count() > 0) await saBtn.first().click();
await new Promise(r => setTimeout(r, 1500));

// Enter PIN
const pin = page.locator('#auth-sa-pin');
if (await pin.count() > 0) {
  await pin.fill('1234');
  await new Promise(r => setTimeout(r, 400));
  await page.locator('form button[type="submit"]').first().click();
  await new Promise(r => setTimeout(r, 6000));
}

// Diagnose
const body = await page.evaluate(() => document.body.innerText);
console.log('BODY (first 1200):', body.substring(0, 1200));

const btns = await page.evaluate(() => {
  return [...document.querySelectorAll('button')].map(b => {
    const t = b.textContent.replace(/\s+/g, ' ').trim().substring(0, 60);
    const title = b.getAttribute('title') || '';
    return (title ? t + ' [' + title.substring(0,30) + ']' : t);
  });
});
console.log('ALL BUTTONS:');
btns.forEach((b, i) => console.log(`  ${i}: ${b}`));

const selects = await page.evaluate(() => {
  return [...document.querySelectorAll('select')].map(s => ({
    id: s.id,
    opts: [...s.options].map(o => o.textContent.trim())
  }));
});
console.log('SELECTS:', JSON.stringify(selects, null, 2));

await browser.close();