// =============================================================================
// Shared auth helpers — login, user creation for any E2E test
// =============================================================================
import { BASE } from './browser-setup.mjs';
import { check, sleep, dismissErrorDialog, ensureEnglish } from './ui-helpers.mjs';

export const PIN = '1234';

// ── Ensure test users exist in the database ────────────────────────────
export async function setupTestUsers(users) {
  console.log('\n🔧 Ensuring all test users exist in DB...');
  for (const u of users) {
    try {
      const res = await fetch(`${BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(u),
      });
      const data = await res.json();
      console.log(
        `  ${res.status === 201 ? 'Created' : 'Exists'}: ${u.fullName} (${u.phone}) → ${data.roleCode || data.role_code}`
      );
    } catch (err) {
      console.log(`  ⚠ Failed to create ${u.fullName}: ${err.message}`);
    }
  }
  console.log('  ✅ Test users ready.\n');
}

// ── Login a persona in their own context ───────────────────────────────
export async function loginPersona(page, phone, label) {
  console.log(`\n🔐 [${label}] Logging in (${phone})...`);

  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  await sleep(1500);

  // Click "Login" button on the landing page
  const loginBtn = page.locator('button', { hasText: /^Login$/ }).first();
  if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await loginBtn.click();
    await sleep(1000);
  }

  // ── Phone step ────────────────────────────────────────────────────
  // PhoneEntryStep (new UI) has SA/IN country selector with #auth-phone-input.
  // Old UI has a plain input[type="tel"] without id. Support both.
  // Default country is SA — for Indian (+91) numbers, click the 🇮🇳 button first
  // so the validation accepts the Indian-format digits (only on new UI).
  if (phone.startsWith('+91')) {
    const indiaBtn = page.locator('button').filter({ hasText: /India|\+91/ }).first();
    if (await indiaBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await indiaBtn.click();
      console.log(`  🇮🇳 Switched to India country for ${phone}`);
      await sleep(500);
    }
  }

  // Try new UI selector first (#auth-phone-input from PhoneEntryStep),
  // fall back to old UI selector (plain input[type="tel"]).
  let phoneInput = page.locator('#auth-phone-input').first();
  let phoneInputVisible = await phoneInput.isVisible({ timeout: 3000 }).catch(() => false);
  if (!phoneInputVisible) {
    phoneInput = page.locator('input[type="tel"]').first();
    phoneInputVisible = await phoneInput.isVisible({ timeout: 2000 }).catch(() => false);
  }

  if (phoneInputVisible) {
    await phoneInput.fill(phone);
    await sleep(400);
    // Try new UI submit button first, fall back to generic form submit
    let submitPhone = page.locator('#auth-phone-submit-btn').first();
    let submitVisible = await submitPhone.isVisible({ timeout: 2000 }).catch(() => false);
    if (!submitVisible) {
      submitPhone = page.locator('form button[type="submit"]').first();
    }
    if (!(await submitPhone.isDisabled().catch(() => false))) {
      await submitPhone.click();
      await sleep(2500);
    }
  }

  // ── PIN step — single field #auth-pin (staff) or 4-digit inputs (patient) ─
  const singlePin = page.locator('#auth-pin');
  const singlePinVisible = await singlePin.isVisible({ timeout: 3000 }).catch(() => false);

  if (singlePinVisible) {
    console.log(`  PIN step: single #auth-pin field`);
    await singlePin.fill(PIN);
    await sleep(400);
    const submitPin = page.locator('form button[type="submit"]').first();
    if (!(await submitPin.isDisabled())) {
      await submitPin.click();
      await sleep(5000);
    }
  } else {
    // Fallback: 4 separate digit inputs (patient-side PinEntryStep)
    const dig0 = page.locator('#auth-pin-digit-0');
    if (await dig0.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`  PIN step: 4-digit inputs`);
      for (let i = 0; i < 4; i++) {
        await page.locator(`#auth-pin-digit-${i}`).fill(PIN[i]);
        await sleep(100);
      }
      await sleep(400);
      const submitPin = page
        .locator('#auth-pin-submit-btn, form button[type="submit"]')
        .first();
      await submitPin.click();
      await sleep(4000);
    } else {
      // pin_setup step — user has no PIN yet, set one up
      const newPinInput = page.locator('#auth-new-pin');
      if (await newPinInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`  PIN step: setup (new user — creating PIN ${PIN})`);
        await newPinInput.fill(PIN);
        await sleep(200);
        const confirmInput = page.locator('#auth-confirm-pin');
        if (await confirmInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await confirmInput.fill(PIN);
        }
        await sleep(400);
        const submitSetup = page.locator('form button[type="submit"]').first();
        await submitSetup.click();
        await sleep(5000);
      }
    }
  }

  // ── Wait for auth modal to fully close ───────────────────────────────
  await page
    .waitForSelector('#auth-pin', { state: 'detached', timeout: 15000 })
    .catch(() => {});
  await page
    .waitForSelector('#auth-new-pin', { state: 'detached', timeout: 5000 })
    .catch(() => {});
  await sleep(2000);

  // ── Dismiss any error dialog + verify login ──────────────────────────
  await dismissErrorDialog(page);

  const bodyText = await page.evaluate(() => document.body.innerText);
  const isPublicPage =
    bodyText.includes('How It Works') || bodyText.includes('Start Your Case');
  // An authenticated shell always renders a sign-out control. Rely on that
  // first: a portal with an empty queue is only a couple hundred characters
  // long, so a length threshold alone reports a false failure.
  const hasSessionChrome = /Log Out|تسجيل الخروج|Sign out/i.test(bodyText);
  const loggedIn = hasSessionChrome || (bodyText.length > 500 && !isPublicPage);

  if (!loggedIn) {
    console.log(
      `  ⚠ Login may have failed — body: ${bodyText.length} chars, public page: ${isPublicPage}`
    );
    console.log(`  Page snippet: ${bodyText.substring(0, 200)}`);
  }
  check(`${label} logged in`, loggedIn, `${bodyText.length} chars`);

  // ── Switch to English ────────────────────────────────────────────────
  await ensureEnglish(page, label);

  return loggedIn;
}