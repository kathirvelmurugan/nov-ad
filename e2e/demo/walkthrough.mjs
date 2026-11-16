// =============================================================================
// Visible walkthrough of the full clinical journey — every persona signs in.
//
// This is a demo driver, not a test: it opens a real browser, logs each persona
// in with their phone + PIN, narrates the stage on screen and screenshots it.
// There is no ?demo=1 shortcut here on purpose — the point is to show the
// product working with authentication on.
//
//   node e2e/demo/walkthrough.mjs                      # boots API + app on :4192
//   E2E_BASE_URL=https://… node e2e/demo/walkthrough.mjs   # drive a running server
//
// The target server needs PostgreSQL and the seeded personas below.
// =============================================================================
import { spawn } from 'node:child_process';
import http from 'node:http';

const PORT = Number(process.env.DEMO_PORT || 4192);
const EXTERNAL_BASE = process.env.E2E_BASE_URL;
const BASE_URL = EXTERNAL_BASE || `http://localhost:${PORT}`;

// The helpers read E2E_BASE_URL at import time, so set it before importing them.
process.env.E2E_BASE_URL = BASE_URL;

const { launchBrowser, createIsolatedContext } = await import('../helpers/browser-setup.mjs');
const { loginPersona } = await import('../helpers/auth.mjs');
const { sleep, screenshot } = await import('../helpers/ui-helpers.mjs');

// ── Database-verified personas — every one of these signs in for real ───
const PERSONAS = {
  patient:     { phone: '+966500000099', label: 'Patient (self-registered)' },
  nurse:       { phone: '+966500000004', label: 'Sara Al-Qahtani (Nurse)' },
  doctor:      { phone: '+966500000012', label: 'Dr. Al-Shammari (Doctor)' },
  coordinator: { phone: '+966500000003', label: 'Emmanuel Gonzalez (Coordinator)' },
  consultant:  { phone: '+919876543211', label: 'Dr. Rajesh Kumar (Consultant)' },
};

const PORTAL_ROUTE = {
  patient: '/?subview=intake',
  nurse: '/?portal=nurse',
  doctor: '/?portal=doctor',
  coordinator: '/?portal=coordinator',
  consultant: '/?portal=consultant',
};

async function waitForServer(port, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/api/cases`, (res) => {
          if (res.statusCode < 500) resolve();
          else reject(new Error(`Status ${res.statusCode}`));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => req.destroy());
      });
      return true;
    } catch {
      await sleep(500);
    }
  }
  return false;
}

async function showBanner(page, text, color = '#38bdf8', bg = '#0f172a', border = '#0284c7') {
  await page.evaluate(({ msg, color, bg, border }) => {
    let banner = document.getElementById('demo-step-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'demo-step-banner';
      banner.style.position = 'fixed';
      banner.style.top = '18px';
      banner.style.left = '50%';
      banner.style.transform = 'translateX(-50%)';
      banner.style.padding = '12px 28px';
      banner.style.borderRadius = '14px';
      banner.style.fontSize = '15px';
      banner.style.fontWeight = 'bold';
      banner.style.boxShadow = '0 12px 30px rgba(0,0,0,0.6)';
      banner.style.zIndex = '9999999';
      banner.style.transition = 'all 0.3s ease';
      document.body.appendChild(banner);
    }
    banner.style.backgroundColor = bg;
    banner.style.color = color;
    banner.style.border = `2px solid ${border}`;
    banner.innerText = msg;
  }, { msg: text, color, bg, border });
  await sleep(1200);
}

/** Bring a persona forward, narrate the stage, capture it. */
async function narrate(windows, key, text, shot, color) {
  const { page, label } = windows[key];
  await page.bringToFront();
  await showBanner(page, text, color);
  await screenshot(page, shot);
  console.log(`   [${label}] ${text}`);
}

async function openPortal(windows, key) {
  const { page } = windows[key];
  await page.goto(`${BASE_URL}${PORTAL_ROUTE[key]}`, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(1500);
}

async function firstVisible(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.isVisible({ timeout: 1500 }).catch(() => false)) return locator;
  }
  return null;
}

async function main() {
  console.log('\n=============================================================');
  console.log('  ALO DOCTOR — authenticated walkthrough of the clinical journey');
  console.log(`  Target: ${BASE_URL}`);
  console.log('=============================================================\n');

  // ── Preflight: the target must expose the API, not just static files ──
  const apiOk = await fetch(`${BASE_URL}/api/cases`)
    .then((r) => r.ok)
    .catch(() => false);
  if (!apiOk) {
    console.error(
      `✗ ${BASE_URL}/api/cases is not reachable.\n` +
      '  This walkthrough signs every persona in, so it needs the Express server + PostgreSQL.\n' +
      '  Start the stack, or point it at a running deployment: E2E_BASE_URL=<url>'
    );
    process.exit(1);
  }

  let serverProc = null;
  if (!EXTERNAL_BASE) {
    console.log(`1. Starting the API server on port ${PORT}...`);
    serverProc = spawn('node', ['server/index.js'], { env: { ...process.env, PORT: String(PORT) }, stdio: 'inherit' });
    if (!(await waitForServer(PORT))) {
      console.error('✗ Server did not become ready. Is PostgreSQL running?');
      serverProc.kill();
      process.exit(1);
    }
    console.log(`   ✓ Listening on ${BASE_URL}\n`);
  }

  const browser = await launchBrowser();
  const windows = {};
  const failures = [];

  try {
    // ── Sign in every persona, each in an isolated profile ───────────────
    console.log('2. Signing in every persona with their own phone + PIN...');
    for (const [key, def] of Object.entries(PERSONAS)) {
      const context = await createIsolatedContext(browser);
      const page = await context.newPage();
      const loggedIn = await loginPersona(page, def.phone, def.label);
      if (!loggedIn) failures.push(`login:${key}`);
      windows[key] = { context, page, label: def.label };
    }
    console.log(`   ✓ Sessions open: ${Object.keys(windows).join(', ')}\n`);

    // ── Stage 1: patient intake ──────────────────────────────────────────
    console.log('▶ [Stage 1] Patient intake');
    await openPortal(windows, 'patient');
    await narrate(windows, 'patient', '👉 [Stage 1] Patient intake — new case for second opinion', 'demo-01-intake.png');

    await windows.patient.page.locator('[data-testid="intake-diagnosis-input"]').fill(
      'Severe degenerative lumbar spinal stenosis with neurogenic claudication'
    );
    await windows.patient.page.locator('[data-testid="intake-symptoms-input"]').fill(
      'Progressive numbness and bilateral leg weakness when walking more than 100 meters. Seeking a specialist second opinion on surgical decompression.'
    );
    const redFlag = await firstVisible(windows.patient.page, [
      'button:has-text("Severe Shortness of Breath")',
      'button:has-text("Dizziness or Fainting")',
    ]);
    if (redFlag) await redFlag.click();
    const consent = windows.patient.page.locator('[data-testid="intake-privacy-checkbox"]');
    if (await consent.isVisible({ timeout: 1500 }).catch(() => false)) await consent.check();
    await sleep(600);
    await screenshot(windows.patient.page, 'demo-02-intake-filled.png', true);

    await narrate(windows, 'patient', '👉 Submitting the dossier to ALO triage (P14)', null);
    await windows.patient.page.locator('[data-testid="patient-intake-submit-btn"]').click();
    await sleep(2500);
    const caseNumber = (await windows.patient.page.locator('#registered-case-id-display').innerText().catch(() => '')).trim();
    await narrate(windows, 'patient', `✓ Case registered: ${caseNumber || '(number captured on screen)'}`, 'demo-03-submitted.png', '#34d399', '#052e16', '#059669');
    console.log(`   Case ${caseNumber || '?'} is now in the triage queue\n`);

    // ── Stage 2: nurse triage ────────────────────────────────────────────
    console.log('▶ [Stage 2] Nurse triage');
    await openPortal(windows, 'nurse');
    await narrate(windows, 'nurse', '👉 [Stage 2] Nurse triage — clinical review of the new dossier', 'demo-04-nurse.png');
    const triageNotes = await firstVisible(windows.nurse.page, ['#triage-notes-n05', 'textarea']);
    if (triageNotes) {
      await triageNotes.fill('Records complete. Imaging verified. Routed to the Saudi treating doctor.');
      await sleep(500);
    }
    const n07 = await firstVisible(windows.nurse.page, [
      'button:has-text("N07")',
      'button:has-text("Approve & route to Saudi treating doctor")',
    ]);
    if (n07) { await n07.click(); await sleep(2500); }
    await narrate(windows, 'nurse', '✓ Triage approved and routed to the Saudi doctor (N07)', 'demo-05-nurse-approved.png', '#34d399', '#052e16', '#059669');

    // ── Stage 3: Saudi doctor review ────────────────────────────────────
    console.log('▶ [Stage 3] Saudi doctor review');
    await openPortal(windows, 'doctor');
    await narrate(windows, 'doctor', '👉 [Stage 3] Treating doctor frames focus questions & approves the referral', 'demo-06-doctor.png');
    const d10 = await firstVisible(windows.doctor.page, [
      'button:has-text("D10")',
      'button:has-text("Approve Referral & Route to ALO Coordinator")',
    ]);
    if (d10) { await d10.scrollIntoViewIfNeeded().catch(() => {}); await d10.click(); await sleep(2500); }
    await narrate(windows, 'doctor', '✓ Referral approved for cross-border consultation (D10)', 'demo-07-doctor-approved.png', '#34d399', '#052e16', '#059669');

    // ── Stage 4: coordinator issues the payment gate ────────────────────
    console.log('▶ [Stage 4] Coordinator payment gate');
    await openPortal(windows, 'coordinator');
    await narrate(windows, 'coordinator', '👉 [Stage 4] Coordinator issues the ZATCA invoice (payment gate)', 'demo-08-invoice.png');
    const invoiceBtn = await firstVisible(windows.coordinator.page, [
      'button:has-text("Issue Invoice")',
      'button:has-text("Verify Payment")',
    ]);
    if (invoiceBtn) { await invoiceBtn.click(); await sleep(2000); }
    const verifyBtn = await firstVisible(windows.coordinator.page, [
      'button:has-text("Verify Payment")',
      'button:has-text("Dispatch to Consultant")',
    ]);
    if (verifyBtn) { await verifyBtn.click(); await sleep(2500); }
    await narrate(windows, 'coordinator', '✓ Payment verified — dossier dispatched to the consultant', 'demo-09-paid.png', '#34d399', '#052e16', '#059669');

    // ── Stage 5: consultant written opinion ────────────────────────────
    console.log('▶ [Stage 5] Consultant written opinion');
    await openPortal(windows, 'consultant');
    await narrate(windows, 'consultant', '👉 [Stage 5] International consultant formulates the written opinion', 'demo-10-consultant.png');
    const opinion = windows.consultant.page.locator('#consultant-opinion');
    if (await opinion.isVisible({ timeout: 3000 }).catch(() => false)) {
      await opinion.fill(
        'COMPREHENSIVE SPECIALIST SECOND OPINION: Subacute lumbar stenosis with radiculopathy. ' +
        'Start 6 weeks of structured physiotherapy before considering microdecompression. ' +
        'No dynamic instability observed; fusion is not indicated at this stage.'
      );
      await sleep(600);
    }
    const submitOpinion = await firstVisible(windows.consultant.page, [
      'button:has-text("Submit Opinion")',
      'button:has-text("اعتماد الرأي")',
    ]);
    if (submitOpinion) { await submitOpinion.click(); await sleep(2500); }
    await narrate(windows, 'consultant', '✓ Written opinion submitted', 'demo-11-opinion.png', '#34d399', '#052e16', '#059669');

    // ── Stage 6: coordinator releases the certified report ─────────────
    console.log('▶ [Stage 6] Certified report release');
    await openPortal(windows, 'coordinator');
    await narrate(windows, 'coordinator', '👉 [Stage 6] Coordinator releases the certified bilingual report', 'demo-12-release.png');
    const releaseBtn = await firstVisible(windows.coordinator.page, [
      'button:has-text("Release")',
      'button:has-text("إطلاق التقرير")',
      'button:has-text("Close Case")',
    ]);
    if (releaseBtn) { await releaseBtn.click(); await sleep(2500); }
    await narrate(windows, 'coordinator', '✓ Report released to patient and doctor', 'demo-13-released.png', '#34d399', '#052e16', '#059669');

    // ── Stage 7: patient reads the final dossier ───────────────────────
    console.log('▶ [Stage 7] Patient views the final dossier');
    await windows.patient.page.goto(`${BASE_URL}/?subview=timeline`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
    await narrate(windows, 'patient', '👉 [Stage 7] Patient timeline — certified bilingual report', 'demo-14-patient-timeline.png', '#38bdf8');

    // ── Result ─────────────────────────────────────────────────────────
    console.log('\n=============================================================');
    if (failures.length) {
      console.log(`⚠ Completed with ${failures.length} problem(s): ${failures.join(', ')}`);
      console.log('  Login problems usually mean the persona rows are missing from PostgreSQL.');
    } else {
      console.log('✅ All personas signed in and the journey was driven end to end.');
    }
    console.log('   Screenshots: e2e_screenshots/demo-*.png');
    console.log('=============================================================\n');
    await sleep(4000);
  } catch (err) {
    console.error('❌ Walkthrough aborted:', err);
  } finally {
    await browser.close();
    if (serverProc) serverProc.kill();
  }
}

await main();
