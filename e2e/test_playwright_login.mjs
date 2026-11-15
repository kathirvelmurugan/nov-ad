import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 4182;
const LOCAL_URL = `http://localhost:${PORT}/`;
const REMOTE_URL = 'https://ad.howtostart.in/feature-sarat/';
const TARGET_URL = process.env.REMOTE ? REMOTE_URL : (process.env.TARGET_URL || LOCAL_URL);

const SCREENSHOT_DIR = path.resolve('e2e-artifacts/playwright-login');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function waitForPort(port, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(`http://localhost:${port}/`, (res) => {
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timeout waiting for port ${port}`));
        } else {
          setTimeout(check, 300);
        }
      });
    };
    check();
  });
}

const PERSONAS = [
  { role: 'AD', title: 'Super Admin', name: 'Adrian Lewis', phone: '+966500000001', pin: '1234' },
  { role: 'HA', title: 'Hospital Admin', name: 'David Nunez', phone: '+966504444444', pin: '1234' },
  { role: 'D', title: 'Treating Doctor', name: 'Dr. Fahad Al-Harbi', phone: '+966500000005', pin: '1234' },
  { role: 'N', title: 'Nurse Triage', name: 'Sara Al-Qahtani', phone: '+966500000004', pin: '1234' },
  { role: 'K', title: 'International Consultant', name: 'Dr. V. Prasanth', phone: '+966500000006', pin: '1234' },
  { role: 'C', title: 'Care Coordinator', name: 'Emmanuel Arcon Gonzalez', phone: '+966500000003', pin: '1234' },
  { role: 'P', title: 'Patient', name: 'Sami Al-Harbi', phone: '+966500000099', pin: '1234' },
];

async function testPersonaLogin(browser, persona, results) {
  const start = Date.now();
  console.log(`\n▶ [Playwright Test] Testing Login: ${persona.title} (${persona.role}) [Phone: ${persona.phone}]...`);
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('pageerror', (err) => {
    console.error(`  [Browser Error] [${persona.role}]:`, err.message);
  });

  try {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(600);

    // If phone input not already open, click login button
    const phoneInput = page.locator('input[type="tel"]').first();
    const isPhoneOpen = await phoneInput.isVisible().catch(() => false);
    if (!isPhoneOpen) {
      const loginBtn = page.locator('button:has-text("Login"), button:has-text("تسجيل الدخول"), button:has-text("حساب المريض")').first();
      await loginBtn.waitFor({ state: 'visible', timeout: 10000 });
      await loginBtn.click();
      await page.waitForTimeout(500);
    }

    // Fill phone number
    await phoneInput.waitFor({ state: 'visible', timeout: 10000 });
    await phoneInput.fill(persona.phone);
    await page.waitForTimeout(200);

    // Submit phone
    const submitPhoneBtn = page.locator('form button[type="submit"], button:has-text("إرسال رمز التحقق"), button:has-text("Send Verification Code")').first();
    await submitPhoneBtn.click();
    await page.waitForTimeout(800);

    // Verify 4-digit PIN screen
    const pinInputs = page.locator('input[type="password"]');
    await pinInputs.first().waitFor({ state: 'visible', timeout: 10000 });
    const count = await pinInputs.count();
    if (count < 4) {
      throw new Error(`Expected 4 PIN inputs, but found ${count}`);
    }

    // Enter PIN
    for (let i = 0; i < 4; i++) {
      await pinInputs.nth(i).fill(persona.pin[i]);
    }
    await page.waitForTimeout(200);

    // Submit PIN
    const submitPinBtn = page.locator('form button[type="submit"]').first();
    await submitPinBtn.click();
    await page.waitForTimeout(1200);

    // Check localStorage session
    const sessionStr = await page.evaluate(() => localStorage.getItem('alo_user_session_v4.0_clean'));
    if (!sessionStr) {
      throw new Error(`[${persona.role}] Session not stored in localStorage!`);
    }

    const session = JSON.parse(sessionStr);
    if (!session.isAuthenticated || session.roleCode !== persona.role) {
      throw new Error(`[${persona.role}] Role mismatch! Expected '${persona.role}', got '${session.roleCode}'`);
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`  ✅ [PASS] Role '${session.roleCode}' authenticated successfully in ${duration}s!`);

    const shotPath = path.join(SCREENSHOT_DIR, `login_${persona.role}_pass.png`);
    await page.screenshot({ path: shotPath });

    results.push({
      role: persona.role,
      title: persona.title,
      name: persona.name,
      phone: persona.phone,
      status: 'PASS',
      duration: `${duration}s`,
      sessionRole: session.roleCode,
    });
  } catch (err) {
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.error(`  ❌ [FAIL] ${persona.title} (${persona.role}) failed:`, err.message);
    const shotPath = path.join(SCREENSHOT_DIR, `login_${persona.role}_fail.png`);
    await page.screenshot({ path: shotPath }).catch(() => {});
    results.push({
      role: persona.role,
      title: persona.title,
      name: persona.name,
      phone: persona.phone,
      status: 'FAIL',
      duration: `${duration}s`,
      error: err.message,
    });
  } finally {
    await context.close();
  }
}

async function testNegativeInvalidPin(browser, results) {
  const start = Date.now();
  console.log(`\n▶ [Playwright Test] Testing Negative Path: Reject Invalid PIN (Phone: +966500000001, PIN: 9999)...`);
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(600);

    const phoneInput = page.locator('input[type="tel"]').first();
    if (!(await phoneInput.isVisible())) {
      const loginBtn = page.locator('button:has-text("Login"), button:has-text("تسجيل الدخول")').first();
      await loginBtn.click();
      await page.waitForTimeout(500);
    }

    await phoneInput.fill('+966500000001');
    const submitPhoneBtn = page.locator('form button[type="submit"]').first();
    await submitPhoneBtn.click();
    await page.waitForTimeout(800);

    const pinInputs = page.locator('input[type="password"]');
    await pinInputs.first().waitFor({ state: 'visible', timeout: 10000 });

    // Fill incorrect pin 9999
    for (let i = 0; i < 4; i++) {
      await pinInputs.nth(i).fill('9');
    }
    await page.waitForTimeout(200);

    const submitPinBtn = page.locator('form button[type="submit"]').first();
    await submitPinBtn.click();
    await page.waitForTimeout(1000);

    // Verify session was NOT created with authenticated: true
    const sessionStr = await page.evaluate(() => localStorage.getItem('alo_user_session_v4.0_clean'));
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.isAuthenticated) {
        throw new Error('Security violation: invalid PIN 9999 resulted in authenticated session!');
      }
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`  ✅ [PASS] Invalid PIN correctly blocked from authenticating (${duration}s)!`);

    results.push({
      role: 'SECURITY',
      title: 'Invalid PIN Block',
      name: 'Security Test',
      phone: '+966500000001',
      status: 'PASS',
      duration: `${duration}s`,
      sessionRole: 'REJECTED_PROPERLY',
    });
  } catch (err) {
    console.error(`  ❌ [FAIL] Negative PIN check failed:`, err.message);
    results.push({
      role: 'SECURITY',
      title: 'Invalid PIN Block',
      name: 'Security Test',
      phone: '+966500000001',
      status: 'FAIL',
      error: err.message,
    });
  } finally {
    await context.close();
  }
}

async function main() {
  console.log('================================================================');
  console.log('🎭 RUNNING PLAYWRIGHT COMPREHENSIVE LOGIN TEST SUITE');
  console.log(`🌐 Target: ${TARGET_URL}`);
  console.log('================================================================');

  let previewProcess = null;
  if (!process.env.REMOTE) {
    console.log(`Starting local preview on port ${PORT}...`);
    previewProcess = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
      stdio: 'inherit',
      shell: true,
    });
    await waitForPort(PORT);
    console.log(`✓ Local preview is live at ${LOCAL_URL}\n`);
  }

  const cleanup = () => {
    if (previewProcess) {
      try { previewProcess.kill(); } catch (e) {}
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(1); });

  const results = [];
  try {
    const browser = await chromium.launch({ headless: true });

    // 1. Positive Tests for all 7 key personas
    for (const persona of PERSONAS) {
      await testPersonaLogin(browser, persona, results);
    }

    // 2. Negative Security Test
    await testNegativeInvalidPin(browser, results);

    await browser.close();

    console.log('\n================================================================');
    console.log('📊 PLAYWRIGHT LOGIN TEST RESULTS SUMMARY');
    console.log('================================================================');
    console.table(results.map(r => ({
      Role: r.role,
      Title: r.title,
      Phone: r.phone,
      Status: r.status,
      Duration: r.duration || 'N/A',
      Session: r.sessionRole || 'N/A',
    })));

    const passedCount = results.filter(r => r.status === 'PASS').length;
    const totalCount = results.length;
    console.log(`\n🎉 SUMMARY: ${passedCount}/${totalCount} TESTS PASSED (${((passedCount/totalCount)*100).toFixed(0)}%)`);

    cleanup();
    process.exit(passedCount === totalCount ? 0 : 1);
  } catch (err) {
    console.error('Fatal test error:', err);
    cleanup();
    process.exit(1);
  }
}

main();
