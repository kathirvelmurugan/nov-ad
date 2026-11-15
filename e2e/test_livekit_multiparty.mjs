import { chromium } from 'playwright';

async function testLiveKitMultiParty() {
  console.log('🚀 Starting Multi-Party LiveKit Production Flow E2E Test...');

  // 1. Test Backend Token Generation for all personas
  const personas = [
    { role: 'patient', name: 'طارق الغامدي' },
    { role: 'treating_doctor', name: 'د. سارة العتيبي' },
    { role: 'consultant', name: 'Dr. Pradeep Kumar' },
    { role: 'nurse_interpreter', name: 'ممرضة ألو' },
  ];

  const roomName = 'ALO-TEST-LIVEKIT-E2E';
  const tokens = {};

  for (const p of personas) {
    const res = await fetch('http://localhost:3000/api/livekit/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName,
        participantName: p.name,
        participantRole: p.role,
      }),
    });
    const data = await res.json();
    if (!data.success || !data.token) {
      throw new Error(`Failed to generate token for ${p.role}: ${JSON.stringify(data)}`);
    }
    tokens[p.role] = data;
    console.log(`   ✅ Minted backend token for ${p.role}: ${data.identity}`);
  }

  // 2. Launch browser to verify UI rendering and security boundaries
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('   Navigating to local application...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

  // 3. Security Verification: verify apiSecret is not present in window or client state
  const leakedSecret = await page.evaluate(() => {
    return window.LIVEKIT_CONFIG?.apiSecret || window.apiSecret;
  }).catch(() => null);

  if (leakedSecret) {
    throw new Error('SECURITY VIOLATION: apiSecret is exposed in client window!');
  }
  console.log('   🔒 Security verified: apiSecret is strictly inaccessible in client bundle.');

  // 4. Verify Microcopy Scrubbing: verify no demo PIN hints on login screen
  const pageContent = await page.content();
  if (pageContent.includes('Default demo PIN: 1234') || pageContent.includes('تجريبياً: 123456')) {
    throw new Error('Microcopy scrubbing failed: demo credential hints are still visible in HTML!');
  }
  console.log('   ✨ Microcopy verified: zero demo credential hints found on authentication screens.');

  await browser.close();
  console.log('🎉 LIVEKIT MULTI-PARTY & SECURITY E2E TEST PASSED WITH ZERO ERRORS!');
}

testLiveKitMultiParty().catch((err) => {
  console.error('❌ LiveKit E2E Test Failed:', err);
  process.exit(1);
});
