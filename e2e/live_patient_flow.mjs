import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Live walkthrough of the seeded cast against the deployed site.
 *
 * Runs visibly so the flow can be watched. Each stage opens its own tab,
 * signs in with phone + 1234, and works on the newest case. Stages are selected
 * with STAGE=a,b,c so a single step can be replayed without redoing the chain.
 */

const BASE = process.env.BASE_URL || 'https://ad.howtostart.in';
const PIN = '1234';
const CAST = {
  patient: '+966500000101',
  doctor: '+966500000003',
  nurse: '+966500000004',
  coordinator: '+966500000005',
  consultant: '+966500000006',
};

const STAGES = (process.env.STAGE || 'patient,nurse').split(',').map((s) => s.trim());
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// The queue auto-selects the newest actionable case, so a fresh chain needs no
// input. Set CASE=CASE-2026-1234 to drive one specific case through the stages.
const TARGET_CASE = (process.env.CASE || '').trim();
// The patient who owns TARGET_CASE, for the stages that must act as that patient
// rather than as the demo cast.
const PATIENT_PHONE = (process.env.PATIENT_PHONE || '+966500000051').trim();
// The referral queue is scoped by treatingDoctor.id; the nurse must bind this
// account before the doctor can see the case at all.
const DOCTOR_MATCH = process.env.DOCTOR_MATCH || 'Ahmed Al-Rashid';
// These are the three clinical questions the doctor writes. The consultant stage
// asserts the same text back, so a dropped slot cannot pass as a pass.
const DOCTOR_QUESTIONS = [
  'Given multi-vessel coronary disease with stable angina, is CABG preferred over PCI for this patient?',
  'What is the peri-operative risk given the reduced ejection fraction and his age?',
  'Which antiplatelet and statin regimen should follow revascularisation?',
];

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROFILE = path.join(ROOT, 'e2e', '.profile');

/**
 * The browser is watched by people, so it must not sit on top of the page with
 * "Translate this page?". Playwright normally starts from a throwaway profile,
 * which throws that setting away on every launch, so the walkthrough keeps its
 * own profile and re-applies the preference before each run.
 *
 * translate.enabled = false is the checkbox under Settings > Languages >
 * "Offer to translate pages that aren't in a language you read".
 * translate_blocked_languages additionally refuses Arabic outright.
 */
function seedProfile() {
  const prefsDir = path.join(PROFILE, 'Default');
  fs.mkdirSync(prefsDir, { recursive: true });
  const prefsPath = path.join(prefsDir, 'Preferences');
  let prefs = {};
  if (fs.existsSync(prefsPath)) {
    try { prefs = JSON.parse(fs.readFileSync(prefsPath, 'utf8')); } catch { prefs = {}; }
  }
  prefs.translate = { ...(prefs.translate || {}), enabled: false };
  prefs.translate_blocked_languages = ['ar', 'en'];
  prefs.intl = { ...(prefs.intl || {}), accept_languages: 'en-US,en' };
  fs.writeFileSync(prefsPath, JSON.stringify(prefs));
}

/** One tab at a time: open the new one, then drop whatever the last stage left. */
async function freshPage(ctx, width, height) {
  const page = await ctx.newPage();
  await page.setViewportSize({ width, height });
  for (const other of ctx.pages()) if (other !== page) await other.close();
  // A persistent profile keeps sessions between runs, so every stage starts
  // signed out exactly like the throwaway contexts it replaces. The marker keeps
  // that reset to once per tab instead of once per navigation, and the language
  // is pinned before React boots: left alone the app adopts the persona default
  // (Arabic for 9 of 10 personas) the moment a persona is selected.
  await ctx.clearCookies();
  await page.addInitScript(() => {
    try {
      if (!window.sessionStorage.getItem('__e2e_boot')) {
        window.sessionStorage.setItem('__e2e_boot', '1');
        window.localStorage.clear();
      }
      window.localStorage.setItem('alo_lang_preference', 'en');
    } catch { /* about:blank has no storage */ }
  });
  page.on('pageerror', (err) => console.log('   page error: ' + String(err.message).slice(0, 220)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('   console error: ' + msg.text().replace(/\s+/g, ' ').slice(0, 220));
  });
  // A 401 on any non-auth endpoint logs the user out on purpose, so every
  // rejection is printed with its URL - that is usually the real story.
  page.on('response', (res) => {
    if (res.status() >= 400) console.log(`   ${res.status()} ${res.request().method()} ${res.url().replace(BASE, '')}`);
  });
  return page;
}

/**
 * How English is this screen, really? The stored preference and the document
 * direction can both claim English while the rendered screen is still Arabic,
 * so the visible text is measured as well.
 */
async function languageReport(page) {
  const info = await page.evaluate(() => {
    const text = document.body ? document.body.innerText : '';
    return {
      pref: window.localStorage.getItem('alo_lang_preference'),
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      arabic: (text.match(/[\u0600-\u06FF]/g) || []).length,
      latin: (text.match(/[A-Za-z]/g) || []).length,
      head: text.replace(/\s+/g, ' ').trim().slice(0, 140),
    };
  });
  const total = info.arabic + info.latin;
  info.pct = total === 0 ? 0 : (100 * info.arabic) / total;
  return info;
}

async function requireEnglish(page, tag) {
  const info = await languageReport(page);
  log(`[${tag}] pref=${info.pref} lang=${info.lang} dir=${info.dir} arabic=${info.arabic} latin=${info.latin} (${info.pct.toFixed(1)}% arabic)`);
  log(`[${tag}] reads: ${info.head}`);
  if (info.pref !== 'en') throw new Error(`${tag}: interface language is "${info.pref}", expected en`);
  if (info.pct > 50) throw new Error(`${tag}: screen is still ${info.pct.toFixed(0)}% Arabic`);
  return info;
}

const log = (msg) => console.log(`   ${msg}`);

async function buttons(page) {
  return page.$$eval('button', (els) =>
    els
      .filter((e) => e.getClientRects().length > 0)
      .map((e) => (e.innerText || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean));
}

async function dump(page, tag) {
  console.log(`   -- ${tag} @ ${page.url()}`);
  const list = await buttons(page);
  console.log(`   -- buttons on screen (${tag}) --`);
  list.forEach((b, i) => console.log(`      [${i}] ${b}`));
  const info = await languageReport(page);
  if (info.pct > 20) console.log(`   !! language: ${info.pref}/${info.dir} but ${info.pct.toFixed(0)}% of the text is Arabic`);
  else console.log(`   language: ${info.pref}/${info.dir}, ${info.pct.toFixed(1)}% arabic`);
  const session = await page.evaluate(() => {
    const raw = window.localStorage.getItem('alo_user_session_v4.0_clean');
    if (!raw) return 'none';
    try { const s = JSON.parse(raw); return `${s.roleCode || s.role || '?'} ${s.phone || ''}`; } catch { return raw.slice(0, 40); }
  });
  console.log(`   session in storage: ${session}`);
  await page.screenshot({ path: `e2e_screenshots/live_${tag}.png`, fullPage: true });
  console.log(`   screenshot: e2e_screenshots/live_${tag}.png`);
  return list;
}

/**
 * Click the first visible button whose text matches.
 *
 * The list printed by dump() drops hidden and unlabelled buttons, so its indices
 * do not line up with page.$$('button'); matching on the handles themselves is
 * the only safe way round. Icon-only header buttons (log out, menu) sit between
 * the labelled ones and used to shift every click by a few positions.
 */
async function clickText(page, re, timeout = 8000) {
  const handles = await page.$$('button');
  for (const handle of handles) {
    if (!(await handle.isVisible().catch(() => false))) continue;
    const text = ((await handle.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
    if (!text || !re.test(text)) continue;
    // A disabled control is not a click target: Playwright would wait for it to
    // enable and then throw, hiding the real reason (usually an unmet gate).
    if (!(await handle.isEnabled().catch(() => true))) continue;
    await handle.scrollIntoViewIfNeeded();
    await handle.click();
    await delay(1200);
    return true;
  }
  return false;
}

/**
 * Pick a case out of the portal's caseload tracker.
 *
 * Every portal renders the same queue: buttons whose aria-label is
 * "<caseNumber> - <patientName>". Selecting by case number beats "click the
 * first Open button" because the queue is ordered by updated_at, so any earlier
 * run's leftovers sit at the top.
 */
async function selectCase(page, caseNumber) {
  const target = (caseNumber || TARGET_CASE || '').trim();
  if (!target) return false;
  const handles = await page.$$('button[aria-label]');
  for (const handle of handles) {
    const label = ((await handle.getAttribute('aria-label')) || '').trim();
    if (!label.startsWith(target)) continue;
    if (!(await handle.isVisible().catch(() => false))) continue;
    await handle.scrollIntoViewIfNeeded();
    await handle.click();
    await delay(1500);
    log('queue: selected ' + label);
    return true;
  }
  log('queue: no row for ' + target + ' (falling back to the auto-selected case)');
  return false;
}

/** The consultant's three questions, as actually rendered. */
async function readFocusQuestions(page) {
  return page.$$eval('[data-testid^="consultant-focus-question-"]', (els) =>
    els.map((e) => (e.innerText || '').replace(/\s+/g, ' ').trim()));
}

/** Reload into a named patient sub-view; the session in storage carries over. */
async function gotoView(page, query) {
  await page.goto(BASE + '/?lang=en' + query, { waitUntil: 'domcontentloaded' });
  await delay(3000);
}

async function login(page, phone, extraQuery = '') {
  // ?lang=en is the app's own switch (it writes alo_lang_preference), so the
  // walkthrough asks for English twice: in the URL and in storage.
  await page.goto(BASE + '/?lang=en' + extraQuery, { waitUntil: 'domcontentloaded' });
  await delay(2500);
  // The site opens on the public landing page; the credential gate is behind
  // Login. One gate serves every persona because the database issues the role.
  if (!(await page.$('#auth-phone-input'))) {
    const opened = await clickText(page, /^(login|تسجيل الدخول)$/i);
    if (!opened) await clickText(page, /login|تسجيل الدخول/i);
    await delay(1500);
  }
  await page.waitForSelector('#auth-phone-input', { timeout: 20000 });
  // The field is controlled and the submit button stays disabled until the value
  // validates, so type it the way a person would instead of assigning the value.
  await page.click('#auth-phone-input');
  await page.fill('#auth-phone-input', '');
  if (page.pressSequentially) await page.pressSequentially('#auth-phone-input', phone, { delay: 25 });
  else await page.type('#auth-phone-input', phone, { delay: 25 });
  await delay(600);
  const enabled = await page.isEnabled('#auth-phone-submit-btn');
  log('phone accepted, submit enabled: ' + enabled);
  await page.click('#auth-phone-submit-btn');
  await delay(2500);
  // The shipped gate collects the PIN in ONE field (#auth-pin, 4-6 digits).
  // The four-square PinEntryStep exists in the tree but nothing imports it.
  await page.waitForSelector('#auth-pin', { timeout: 20000 });
  await page.fill('#auth-pin', PIN);
  await delay(300);
  await page.click('form button[type="submit"]');
  await delay(3500);
  const stillGated = await page.$('#auth-pin');
  if (stillGated) {
    const alert = await page.$('[role=alert]');
    log('login refused: ' + (alert ? (await alert.innerText()).replace(/\s+/g, ' ').trim() : 'no message'));
    await dump(page, 'login_refused');
    throw new Error('PIN rejected for ' + phone);
  }
}

async function stageProbe(ctx) {
  const page = await freshPage(ctx, 1280, 900);
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await delay(4000);
  log('title: ' + (await page.title()));
  log('has auth phone input: ' + Boolean(await page.$('#auth-phone-input')));
  await dump(page, '0_probe_landing');
  await delay(1000);
}

async function stagePatient(ctx) {
  console.log('\n[1] PATIENT ' + CAST.patient);
  const page = await freshPage(ctx, 1280, 900);
  await login(page, CAST.patient);
  await dump(page, '1_patient_home');
  await requireEnglish(page, 'patient home');

  const started = await clickText(page, /start|new case|request|ابدأ|حالة/i);
  if (!started) {
    console.log('   !! could not find the intake entry point');
  } else {
    await delay(1500);
    // The intake form may open as a sheet or a route; wait for its first field.
    try {
      await page.waitForSelector('#intake-diagnosis-input', { timeout: 15000 });
      // Identity first: a phone-only account carries the placeholder name
      // 'Patient' and no age, so the Me card is the only place they are captured.
      const prefill = await page.inputValue('#self-full-name').catch(() => '(missing)');
      log('self name prefill: ' + JSON.stringify(prefill));
      await page.fill('#self-full-name', 'Fahad Al-Harbi');
      await page.fill('#self-national-id', '1098765432');
      await page.fill('#self-age', '44');
      await page.click('#self-national-id'); // blur the name -> PATCH /api/users/me
      await delay(1500);
      await page.fill('#intake-diagnosis-input', 'Severe multi-vessel coronary artery disease with stable angina');
      await page.fill('#intake-symptoms-input',
        'Recurrent substernal chest pressure radiating to the left arm on mild exertion, worse over three weeks.');
      await delay(400);
      const consent = await page.$('#intake-privacy-checkbox');
      if (consent) {
        await consent.scrollIntoViewIfNeeded();
        await consent.click();
      }
      await delay(400);
      // Prove the PDF path end to end from the browser: a real file has to reach
      // MinIO and come back as /api/storage/..., never as a tab-local blob URL.
      const pdfPath = path.join(ROOT, 'e2e', '.probe-upload.pdf');
      fs.writeFileSync(pdfPath,
        '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 0/Kids[]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');
      const fileInput = await page.$('#patient-file-upload');
      if (fileInput) {
        await fileInput.setInputFiles(pdfPath);
        await delay(4000);
        const shown = await page.$$eval('#patient-file-upload ~ label, [class*="rounded-xl"] p', (els) =>
          els.map((e) => (e.innerText || '').trim()).filter((t) => t.includes('.pdf')).slice(0, 3));
        log('intake file list: ' + (shown.join(' | ') || 'nothing listed'));
      }
      await dump(page, '1_patient_intake_filled');
      await page.click('#patient-intake-submit-btn');
      await delay(4000);
      await dump(page, '1_patient_submitted');
      const caseId = await page.$('#registered-case-id-display');
      if (caseId) log('case registered: ' + (await caseId.innerText()).trim());
    } catch (e) {
      console.log('   !! intake form not reached: ' + e.message.split('\n')[0]);
      await dump(page, '1_patient_stuck');
    }
  }
  await delay(2000);
}

async function stageNurse(ctx) {
  console.log('\n[2] NURSE ' + CAST.nurse);
  const page = await freshPage(ctx, 1400, 900);
  await login(page, CAST.nurse);
  await delay(1500);
  await dump(page, '2_nurse_queue');
  await requireEnglish(page, 'nurse queue');

  await selectCase(page);
  await dump(page, '2_nurse_case');

  // N06/N07 stay locked until a real doctor account is bound to the case: the
  // referral queue is an id join (case_data->treatingDoctor->>id), so a name in
  // the card is not enough.
  const assignLabel = await page.evaluate((needle) => {
    const card = [...document.querySelectorAll('article[role="button"]')]
      .find((c) => ((c.getAttribute('aria-label') || '').includes(needle)));
    if (!card) return null;
    card.click();
    return card.getAttribute('aria-label');
  }, DOCTOR_MATCH);
  if (!assignLabel) {
    await dump(page, '2_nurse_no_doctor');
    throw new Error('doctor directory did not offer ' + DOCTOR_MATCH);
  }
  log('assigned: ' + assignLabel);
  await delay(2000);

  const n07 = await page.$('[aria-label*="N07"]');
  const canN07 = n07 ? await n07.isEnabled() : false;
  log('N07 enabled: ' + canN07);
  await dump(page, '2_nurse_ready');
  if (!canN07) throw new Error('N07 still disabled: doctor assignment or triage notes were not accepted');
  await n07.click();
  await delay(3000);
  await dump(page, '2_nurse_after');
  await delay(1500);
}

/**
 * The doctor is the writer half of the contract: if these three fields do not
 * survive D10 into the case, the consultant has nothing to read.
 */
async function stageDoctor(ctx) {
  console.log('\n[3] DOCTOR ' + CAST.doctor);
  const page = await freshPage(ctx, 1400, 1000);
  await login(page, CAST.doctor);
  await delay(2000);
  await dump(page, '3_doctor_queue');
  await requireEnglish(page, 'doctor queue');

  await selectCase(page);
  try {
    await page.waitForSelector('#focus-question-0', { timeout: 20000 });
  } catch {
    await dump(page, '3_doctor_no_form');
    throw new Error('focus question inputs did not render for this doctor');
  }

  for (let i = 0; i < DOCTOR_QUESTIONS.length; i++) {
    await page.fill('#focus-question-' + i, DOCTOR_QUESTIONS[i]);
    await page.keyboard.press('Tab'); // commit before the next slot is written
    await delay(700);
  }
  await dump(page, '3_doctor_questions_filled');

  const typed = await page.$$eval('#focus-question-0, #focus-question-1, #focus-question-2', (els) =>
    els.map((e) => (e.value || '').trim()));
  const typedOk = typed.filter(Boolean).length === 3;
  log('three slots hold text: ' + typedOk);
  if (!typedOk) throw new Error('the question fields did not keep all three values');

  const approved = await clickText(page, /D10\s*·\s*Approve Referral/i);
  log('D10 approve clicked: ' + approved);
  if (!approved) {
    await dump(page, '3_doctor_approve_missing');
    throw new Error('D10 approve button not found or still disabled');
  }
  await delay(3500);
  await dump(page, '3_doctor_after_approve');
}

/** Gate 1: the coordinator issues the invoice and releases the case to pay. */
async function stageCoordinator(ctx) {
  console.log('\n[4] COORDINATOR ' + CAST.coordinator);
  const page = await freshPage(ctx, 1400, 1000);
  await login(page, CAST.coordinator);
  await delay(2500);
  await dump(page, '4_coordinator_queue');
  await requireEnglish(page, 'coordinator queue');

  await selectCase(page);
  await dump(page, '4_coordinator_case');

  const issued = await clickText(page, /C04\s*·\s*(Assign Payment Methods|Update Methods)/i);
  log('C04 invoice issued: ' + issued);
  if (!issued) {
    await dump(page, '4_coordinator_no_c04');
    throw new Error('C04 button not usable: referral not approved or no payment method selected');
  }
  await delay(3000);
  await dump(page, '4_coordinator_invoice');
}

/** The patient pays the issued invoice (Gate 2 stays locked until they do). */
async function stagePay(ctx) {
  console.log('\n[5] PATIENT PAYS ' + CAST.patient);
  const page = await freshPage(ctx, 1280, 1000);
  // The gate lives on the landing page, so sign in first and only then move to
  // the timeline - a fresh deep link renders the portal before any session exists.
  await login(page, CAST.patient);
  await gotoView(page, '&subview=timeline');
  await dump(page, '5_patient_timeline');
  await requireEnglish(page, 'patient timeline');

  // The patient sees every consultation they own; open the one under test.
  if (TARGET_CASE && (await clickText(page, new RegExp(TARGET_CASE)))) {
    await delay(1500);
    await dump(page, '5_patient_case');
  }

  // AWAITING_PAYMENT + issued invoice lands straight on checkout; otherwise the
  // timeline carries the button.
  await clickText(page, /Open Payment Checkout/i);
  await delay(2000);
  const paid = await clickText(page, /Complete Payment/i);
  log('complete payment clicked: ' + paid);
  if (!paid) {
    await dump(page, '5_patient_no_payment');
    throw new Error('checkout did not offer a Complete Payment button');
  }
  await delay(4000);
  await dump(page, '5_patient_paid');
}

/** Gate 2: the coordinator verifies the payment and dispatches to the consultant. */
async function stageDispatch(ctx) {
  console.log('\n[6] COORDINATOR DISPATCH ' + CAST.coordinator);
  const page = await freshPage(ctx, 1400, 1000);
  await login(page, CAST.coordinator);
  await delay(2500);
  await selectCase(page);
  await dump(page, '6_coordinator_paid');

  const dispatched = await clickText(page, /C05.C06[\s\S]*Verify Payment/i);
  log('C05-C06 verify & dispatch clicked: ' + dispatched);
  if (!dispatched) {
    await dump(page, '6_coordinator_not_paid');
    throw new Error('Gate 2 did not unlock: the payment was not recorded');
  }
  await delay(3500);
  await dump(page, '6_coordinator_dispatched');
}

/** The consultant is the reader half of the contract. */
async function stageConsultant(ctx) {
  console.log('\n[7] CONSULTANT ' + CAST.consultant);
  const page = await freshPage(ctx, 1400, 1100);
  await login(page, CAST.consultant);
  // The case id is read at mount, so it has to be applied after the session
  // exists - a fresh deep link would render the portal with no account.
  const target = TARGET_CASE ? '&caseId=' + encodeURIComponent(TARGET_CASE) : '';
  await gotoView(page, target);
  await dump(page, '7_consultant_landing');
  await requireEnglish(page, 'consultant portal');

  let shown = await readFocusQuestions(page);
  if (shown.length === 0) {
    // K05 opens only after the consultant accepts the case (K01–K04).
    await clickText(page, /Accept case/i);
    await delay(2500);
    shown = await readFocusQuestions(page);
  }
  await dump(page, '7_consultant_review');

  console.log('   -- focus questions rendered on the consultant screen --');
  shown.forEach((q, i) => console.log(`      [${i}] ${q || '(blank)'}`));
  const delivered = shown.filter(Boolean).length;
  const matches = DOCTOR_QUESTIONS.every((q, i) => shown[i] === q);
  console.log(`   delivered ${delivered}/3, identical to what the doctor wrote: ${matches}`);
  if (!matches) {
    throw new Error(`consultant did not receive the doctor's questions verbatim (${delivered}/3 slots filled)`);
  }
  console.log('   PASS: the doctor\'s three focus questions reached the consultant');
}

/**
 * Regression: a save composed before the doctor wrote the questions must not erase
 * them. This posts the case back exactly as a stale tab would - three blank slots -
 * and re-reads it. Only the server can guarantee this, because any client can be
 * out of date.
 */
async function stageStaleWrite(ctx) {
  console.log('\n[8] STALE SAVE ' + CAST.coordinator);
  const page = await freshPage(ctx, 1400, 1100);
  await login(page, CAST.coordinator);

  const result = await page.evaluate(async (caseNumber) => {
    const raw = window.localStorage.getItem('alo_user_session_v4.0_clean');
    const token = raw ? JSON.parse(raw).token : '';
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const load = async () => {
      const res = await fetch('/api/cases', { headers });
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : [];
    };
    const list = await load();
    const target = list.find((c) => c.caseNumber === caseNumber);
    if (!target) return { error: `case ${caseNumber} not in the queue (${list.length} cases)` };

    const slotsOf = (c) => ({
      en: (c.treatingDoctor && c.treatingDoctor.focusQuestionsEn) || [],
      ar: (c.treatingDoctor && c.treatingDoctor.focusQuestions) || [],
      top: c.focusQuestions || [],
    });
    const before = slotsOf(target);

    // What a browser that loaded the case before D10 approval would send back.
    const stale = {
      ...target,
      treatingDoctor: { ...(target.treatingDoctor || {}), focusQuestions: ['', '', ''], focusQuestionsEn: ['', '', ''] },
      focusQuestions: ['', '', ''],
    };
    const saveRes = await fetch('/api/cases', { method: 'POST', headers, body: JSON.stringify(stale) });
    const saved = await saveRes.json().catch(() => ({}));

    // Filing an opinion is a clinical act: anonymous and incomplete payloads must be
    // refused, otherwise a script can stamp answers nobody wrote.
    const opinionUrl = '/api/cases/' + encodeURIComponent(target.id) + '/opinion';
    const goodAnswers = ['a'.repeat(20), 'b'.repeat(20), 'c'.repeat(20)];
    const anon = await fetch(opinionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opinion: 'x'.repeat(60), answers: goodAnswers }),
    });
    const incomplete = await fetch(opinionUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ opinion: 'too short', answers: ['', '', ''] }),
    });

    const reread = (await load()).find((c) => c.caseNumber === caseNumber);

    return {
      status: saveRes.status,
      saved: saved.success !== false,
      anonStatus: anon.status,
      incompleteStatus: incomplete.status,
      before,
      after: reread ? slotsOf(reread) : null,
    };
  }, TARGET_CASE);

  if (result.error) throw new Error(result.error);
  console.log(`   stale POST answered ${result.status}, saved: ${result.saved}`);
  console.log(`   anonymous opinion POST: ${result.anonStatus}, incomplete opinion POST: ${result.incompleteStatus}`);
  if (result.anonStatus !== 401) throw new Error('the opinion endpoint accepted an anonymous filing');
  if (result.incompleteStatus !== 400) throw new Error('the opinion endpoint accepted an incomplete filing');
  console.log(`   before: en=${JSON.stringify(result.before.en)}`);
  console.log(`   after:  en=${JSON.stringify(result.after.en)}`);
  console.log(`   after:  ar=${JSON.stringify(result.after.ar)}`);
  console.log(`   after:  top=${JSON.stringify(result.after.top)}`);

  // A blank in the stale payload must not change what is stored.
  const unchanged =
    JSON.stringify(result.after.en) === JSON.stringify(result.before.en) &&
    JSON.stringify(result.after.ar) === JSON.stringify(result.before.ar);
  if (!unchanged) throw new Error('a stale save changed the doctor\'s focus questions');

  // The legacy mirror is derived from the doctor's fields, so it cannot drift.
  const expectedTop = [0, 1, 2].map((i) => result.before.ar[i] || result.before.en[i] || '');
  const mirrors = JSON.stringify(result.after.top) === JSON.stringify(expectedTop);
  console.log(`   legacy top-level mirror rebuilt from the doctor's fields: ${mirrors}`);
  if (!mirrors) throw new Error('the legacy top-level focusQuestions mirror is out of sync');

  console.log('   PASS: a stale save can no longer erase the questions');
}

/**
 * Stage 7 -> 8: money is settled exactly once, at the dispatch cut-point.
 *
 * This drives the real "Proceed to 21-Day Follow-up" control on a report-released
 * case and fails on any dialog. The gate used to re-check payment verification at
 * every downstream stage, so a case whose invoice had already been collected was
 * rejected because a flag - not the money - was missing.
 */
async function stageFollowUp(ctx) {
  console.log('\n[9] 21-DAY FOLLOW-UP ' + PATIENT_PHONE);
  const page = await freshPage(ctx, 1280, 1000);
  const dialogs = [];
  page.on('dialog', async (d) => {
    dialogs.push(`${d.type()}: ${d.message()}`);
    await d.dismiss().catch(() => {});
  });

  await login(page, PATIENT_PHONE);
  await gotoView(page, '&subview=timeline');
  if (TARGET_CASE && (await clickText(page, new RegExp(TARGET_CASE)))) await delay(1200);
  await dump(page, '9_followup_before');

  const readStage = () => page.evaluate(async (caseNumber) => {
    const raw = window.localStorage.getItem('alo_user_session_v4.0_clean');
    const token = raw ? JSON.parse(raw).token : '';
    const res = await fetch('/api/cases', { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    const list = Array.isArray(json.data) ? json.data : [];
    const found = list.find((c) => c.caseNumber === caseNumber);
    return found ? { stage: found.currentStage, num: found.stage } : null;
  }, TARGET_CASE);

  const before = await readStage();
  console.log(`   stage before: ${before && before.stage} (${before && before.num})`);

  const clicked = await clickText(page, /Proceed to 21-Day Follow-up/i);
  if (!clicked) {
    await dump(page, '9_followup_no_button');
    throw new Error('the released-report card did not offer "Proceed to 21-Day Follow-up"');
  }
  await delay(4000);
  await dump(page, '9_followup_after');

  if (dialogs.length) {
    throw new Error('the follow-up stage raised a payment dialog: ' + dialogs.join(' | '));
  }

  const after = await readStage();
  console.log(`   stage after:  ${after && after.stage} (${after && after.num})`);
  if (!after || after.stage !== 'FOLLOW_UP_21_DAYS') {
    throw new Error('the case did not advance to FOLLOW_UP_21_DAYS');
  }
  console.log('   PASS: the 21-day follow-up opened without asking for payment again');
}

async function main() {
  seedProfile();
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    headless: false,
    slowMo: 60,
    locale: 'en-US',
    viewport: { width: 1280, height: 900 },
    args: [
      '--start-maximized',
      '--window-position=40,20',
      '--lang=en-US',
      // Belt and braces: the profile preference above is the real switch, these
      // remove the bubble and the language detection that asks for it.
      '--disable-features=Translate,TranslateUI,TranslateServerLanguageDetection',
      '--no-first-run',
      '--no-default-browser-check',
    ],
  });
  try {
    for (const s of STAGES) {
      if (s === 'probe') await stageProbe(ctx);
      else if (s === 'patient') await stagePatient(ctx);
      else if (s === 'nurse') await stageNurse(ctx);
      else if (s === 'doctor') await stageDoctor(ctx);
      else if (s === 'coordinator') await stageCoordinator(ctx);
      else if (s === 'pay') await stagePay(ctx);
      else if (s === 'dispatch') await stageDispatch(ctx);
      else if (s === 'consultant') await stageConsultant(ctx);
      else if (s === 'stale') await stageStaleWrite(ctx);
      else if (s === 'followup') await stageFollowUp(ctx);
      else console.log('   (stage not implemented yet: ' + s + ')');
    }
  } finally {
    console.log('\ndone. browser stays open for 10s so you can look at it.');
    await delay(10000);
    await ctx.close();
  }
}

main().catch((e) => { console.error('failed:', e); process.exit(1); });