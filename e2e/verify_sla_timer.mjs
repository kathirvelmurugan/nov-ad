import puppeteer from 'puppeteer-core';

const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log('--- Verifying Doctor SLA Dynamic Countdown Timer on VPS ---');
  await page.goto('https://ad.howtostart.in/feature-sarat/?portal=doctor', { waitUntil: 'networkidle2' });

  await page.waitForSelector('[data-testid="doctor-sla-timer"]', { timeout: 10000 });
  const timeT0 = await page.$eval('[data-testid="doctor-sla-timer"]', el => el.innerText.trim());
  console.log('Live Doctor SLA at T = 0.0s:', timeT0);

  await new Promise(r => setTimeout(r, 1100));
  const timeT1 = await page.$eval('[data-testid="doctor-sla-timer"]', el => el.innerText.trim());
  console.log('Live Doctor SLA at T = 1.1s:', timeT1);

  await new Promise(r => setTimeout(r, 1100));
  const timeT2 = await page.$eval('[data-testid="doctor-sla-timer"]', el => el.innerText.trim());
  console.log('Live Doctor SLA at T = 2.2s:', timeT2);

  await page.screenshot({ path: '/tmp/doctor_sla_timer_live.png' });

  if (timeT0 !== timeT1 && timeT1 !== timeT2) {
    console.log('✅ VERIFIED: Timer is ticking every second smoothly!');
  } else {
    console.error('❌ FAILED: Timer did not tick smoothly.');
    process.exit(1);
  }

  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
