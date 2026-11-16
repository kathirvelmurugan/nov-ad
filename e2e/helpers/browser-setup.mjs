// =============================================================================
// Shared browser setup — one place for translate suppression & context creation
// Import in any E2E test: import { launchBrowser, createIsolatedContext } from '...'
// =============================================================================
import { chromium } from 'playwright';

export const BASE = process.env.E2E_BASE_URL || 'https://ad.howtostart.in';
export const VIEWPORT = { width: 1440, height: 900 };

// ── Google Translate killer — CSS injection + MutationObserver ─────
// Flags alone can't stop Chrome's translate iframe injection.
// CSS hides the bar instantly; the observer cleans up any survivors.
export const TRANSLATE_KILLER = () => {
  // Override language signals so Chrome never detects Arabic
  Object.defineProperty(navigator, 'language', { get: () => 'en-US', configurable: true });
  Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'], configurable: true });

  // CSS injection — blocks translate bar BEFORE it renders
  const style = document.createElement('style');
  style.id = 'alo-no-translate';
  style.textContent = [
    'iframe.goog-te-banner-frame, .goog-te-banner-frame { display: none !important; }',
    'iframe.goog-te-balloon-frame, .goog-te-balloon-frame { display: none !important; }',
    'iframe.goog-te-menu-frame, .goog-te-menu-frame { display: none !important; }',
    'div[id$="-translate-bar"] { display: none !important; }',
    'div[class*="google-translate"] { display: none !important; }',
    'iframe[id*="google"], iframe[src*="translate"] { display: none !important; }',
    '#google_translate_element { display: none !important; }',
    '.skiptranslate { display: none !important; }',
    'body { top: 0 !important; position: relative !important; }',
  ].join('\n');
  document.head.appendChild(style);

  // MutationObserver — nuke any translate iframe that survives CSS
  const killBar = () => {
    document.querySelectorAll(
      '.goog-te-banner-frame, .goog-te-balloon-frame, .goog-te-menu-frame,' +
      ' iframe[id*="google"], iframe[src*="translate"],' +
      ' div[id$="-translate-bar"], div[class*="translate"]'
    ).forEach(el => el.remove());
  };
  killBar();
  new MutationObserver(killBar).observe(document.documentElement, { childList: true, subtree: true });
};

// ── Launch browser with all translate-blocking flags ──────────────────
export async function launchBrowser() {
  return chromium.launch({
    headless: false,
    slowMo: 80,
    args: [
      '--disable-features=TranslateUI,Translate',  // kill translate UI + service
      '--disable-translate',                        // block translation infra
      '--disable-sync-translation',                 // block sync translation
      '--translate-ranker-model-url=',              // empty model = no translate
      '--lang=en-US',                               // browser UI in English
      '--accept-lang=en-US,en;q=0.9',               // preferred languages
    ],
  });
}

// ── Create an isolated context (private profile) ──────────────────────
export async function createIsolatedContext(browser) {
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    locale: 'en-US',
    timezoneId: 'Asia/Riyadh',
    extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
  });
  await ctx.addInitScript(TRANSLATE_KILLER);
  return ctx;
}