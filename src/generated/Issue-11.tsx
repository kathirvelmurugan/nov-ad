import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';

const STYLE_ID = 'alo-doctor-whatsapp-toast';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');

.whatsapp-toast-stack {
  position: fixed;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 2147483647;
  width: min(420px, calc(100vw - 32px));
  pointer-events: none;
}

.whatsapp-toast-stack--ltr {
  left: 16px;
  align-items: flex-start;
}

.whatsapp-toast-stack--rtl {
  right: 16px;
  align-items: flex-end;
}

.whatsapp-toast {
  pointer-events: auto;
  width: 100%;
  border-radius: 18px;
  border: 2px solid #007B6E;
  border-inline-start: 8px solid #25D366;
  background: linear-gradient(180deg, #FFFFFF 0%, #E6FAF7 100%);
  color: #08312B;
  box-shadow: 0 18px 44px rgba(0, 123, 110, 0.30);
  font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
  overflow: hidden;
  animation: whatsapp-toast-enter 240ms cubic-bezier(0.21, 1.02, 0.73, 1);
  cursor: pointer;
}

.whatsapp-toast--ltr {
  border-left: 8px solid #25D366;
}

.whatsapp-toast--rtl {
  border-right: 8px solid #25D366;
}

.whatsapp-toast:focus-within {
  outline: 3px solid #00C6AE;
  outline-offset: 2px;
}

.whatsapp-toast__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px 0;
}

.whatsapp-toast__badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #25D366;
  color: #04351F;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.whatsapp-toast__template {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #007B6E;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 800;
  direction: ltr;
  unicode-bidi: isolate;
}

.whatsapp-toast__close {
  margin-inline-start: auto;
  margin-left: auto;
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-radius: 999px;
  background: #E6FAF7;
  color: #007B6E;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
}

.whatsapp-toast--rtl .whatsapp-toast__close {
  margin-left: 0;
  margin-right: auto;
}

.whatsapp-toast__close:hover {
  background: #00C6AE;
  color: #032924;
}

.whatsapp-toast__close:focus-visible {
  outline: 3px solid #007B6E;
  outline-offset: 2px;
}

.whatsapp-toast__body {
  padding: 10px 16px 0;
}

.whatsapp-toast__title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #007B6E;
}

.whatsapp-toast__text {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.55;
}

.whatsapp-toast__meta {
  margin: 10px 0 0;
  display: grid;
  gap: 6px;
  padding: 0;
}

.whatsapp-toast__meta div {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
}

.whatsapp-toast__meta dt {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: #007B6E;
}

.whatsapp-toast__meta dd {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  direction: ltr;
  unicode-bidi: isolate;
}

.whatsapp-toast__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 12px 16px 16px;
}

.whatsapp-toast__button {
  border: 0;
  border-radius: 12px;
  padding: 10px 14px;
  background: #007B6E;
  color: #FFFFFF;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  min-height: 44px;
}

.whatsapp-toast__button:hover {
  background: #00C6AE;
  color: #032924;
}

.whatsapp-toast__button:focus-visible {
  outline: 3px solid #25D366;
  outline-offset: 2px;
}

.whatsapp-toast__wa {
  color: #007B6E;
  font-size: 13px;
  font-weight: 700;
  text-decoration: underline;
  direction: ltr;
  unicode-bidi: isolate;
}

.whatsapp-toast__wa:hover {
  color: #00C6AE;
}

.whatsapp-toast__wa:focus-visible {
  outline: 3px solid #007B6E;
  outline-offset: 2px;
  border-radius: 6px;
}

@keyframes whatsapp-toast-enter {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .whatsapp-toast {
    animation: none;
  }
}
`;

function useStyleInjection(): void {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }, []);
}

function isAscii(value: string): boolean {
  return /^[\u0020-\u007E]*$/.test(value);
}

function decodeUriComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value.replace(/%[0-9A-Fa-f]{2}/g, '');
  }
}

function toAsciiUrlToken(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^\u0020-\u007E]/g, '')
    .trim()
    .replace(/[^A-Za-z0-9._~\-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sanitizeHost(hostname: string): string {
  const decoded = decodeUriComponentSafe(hostname);
  const ascii = decoded
    .normalize('NFKD')
    .replace(/[^\u0020-\u007E]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return ascii || 'ad.howtostart.in';
}

function sanitizePath(pathname: string): string {
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => toAsciiUrlToken(decodeUriComponentSafe(segment)))
    .filter(Boolean);

  return segments.length > 0 ? `/${segments.join('/')}` : '/';
}

function sanitizeSearch(searchParams: URLSearchParams): string {
  const params = new URLSearchParams();

  searchParams.forEach((rawValue, rawKey) => {
    const key = toAsciiUrlToken(rawKey);
    if (!key) {
      return;
    }

    const value = toAsciiUrlToken(rawValue);
    params.append(key, value);
  });

  const output = params.toString();
  return output ? `?${output}` : '';
}

function sanitizeHash(hash: string): string {
  if (!hash) {
    return '';
  }

  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const token = toAsciiUrlToken(decodeUriComponentSafe(raw));
  return token ? `#${token}` : '';
}

function sanitizeFallbackUrl(fallback: string): string {
  const ascii = fallback.replace(/[^\u0020-\u007E]/g, '').trim();

  if (!ascii) {
    return '/';
  }

  if (/^https?:\/\//i.test(ascii)) {
    const compact = ascii.replace(/\s+/g, '-');
    return isAscii(compact) ? compact : '/';
  }

  const compact = ascii.replace(/\s+/g, '-');
  return compact.startsWith('/') ? compact : `/${compact}`;
}

export function ensureEnglishUrl(input: string, fallback = '/'): string {
  const safeFallback = sanitizeFallbackUrl(fallback);

  if (typeof input !== 'string' || input.trim().length === 0) {
    return safeFallback;
  }

  try {
    const base =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://ad.howtostart.in';

    const url = new URL(input, base);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return safeFallback;
    }

    const host = sanitizeHost(url.hostname);
    const port = url.port ? `:${url.port.replace(/[^0-9]/g, '')}` : '';
    const path = sanitizePath(url.pathname);
    const search = sanitizeSearch(url.searchParams);
    const hash = sanitizeHash(url.hash);
    const result = `${url.protocol}//${host}${port}${path}${search}${hash}`;

    return isAscii(result) ? result : safeFallback;
  } catch {
    const token = toAsciiUrlToken(input);
    const result = token ? (token.startsWith('/') ? token : `/${token}`) : safeFallback;
    return isAscii(result) ? result : safeFallback;
  }
}

export const DEFAULT_WHATSAPP_DOMAIN = 'https://ad.howtostart.in';
export const DEFAULT_WHATSAPP_RECIPIENT = '+966 50 123 4567';
export const DEFAULT_WHATSAPP_ADVANCE_URL = `${DEFAULT_WHATSAPP_DOMAIN}/flows/next`;

const TEMPLATE_CODES = [
  'W01',
  'W02',
  'W03',
  'W04',
  'W05',
  'W06',
  'W07',
  'W08',
  'W09',
  'W10',
  'W11',
  'W12',
  'W13',
  'W14',
  'W15',
  'W16',
  'W17',
  'W18',
  'W19',
  'W20',
] as const;

export type WhatsAppTemplateCode = (typeof TEMPLATE_CODES)[number];

export const WHATSAPP_TEMPLATE_CODES = TEMPLATE_CODES;

function isWhatsAppTemplateCode(value: unknown): value is WhatsAppTemplateCode {
  return typeof value === 'string' && (TEMPLATE_CODES as readonly string[]).includes(value);
}

function parseTemplateCodeCandidate(value: string): WhatsAppTemplateCode | null {
  const upper = value.trim().toUpperCase();

  if (isWhatsAppTemplateCode(upper)) {
    return upper;
  }

  const match = upper.match(/^W(?:HATSAPP)?[-_ ]?0*(\d{1,2})$/);

  if (match?.[1]) {
    const parsed = Number.parseInt(match[1], 10);

    if (parsed >= 1 && parsed <= TEMPLATE_CODES.length) {
      return TEMPLATE_CODES[parsed - 1] ?? 'W01';
    }
  }

  return null;
}

export function getTemplateCodeForStage(stage: string | number): WhatsAppTemplateCode {
  const raw = String(stage ?? '').trim();
  const parsed = parseTemplateCodeCandidate(raw);

  if (parsed) {
    return parsed;
  }

  const digits = raw.replace(/[^0-9]/g, '');

  if (digits) {
    const parsedDigits = Number.parseInt(digits, 10);

    if (Number.isFinite(parsedDigits)) {
      const bounded = Math.min(Math.max(parsedDigits, 1), TEMPLATE_CODES.length);
      return TEMPLATE_CODES[bounded - 1] ?? 'W01';
    }
  }

  return 'W01';
}

export function normalizeWhatsAppTemplateCode(value: unknown): WhatsAppTemplateCode {
  if (isWhatsAppTemplateCode(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseTemplateCodeCandidate(value);

    if (parsed) {
      return parsed;
    }
  }

  return getTemplateCodeForStage(String(value ?? ''));
}

export interface WhatsAppToastContent {
  title: string;
  body: string;
}

export const WHATSAPP_TEMPLATE_CONTENT = TEMPLATE_CODES.reduce<
  Record<WhatsAppTemplateCode, { en: WhatsAppToastContent; ar: WhatsAppToastContent }>
>((accumulator, code, index) => {
  const stageNumber = index + 1;

  accumulator[code] = {
    en: {
      title: `WhatsApp template ${code} delivered`,
      body: `Stage ${stageNumber} simulated a WhatsApp delivery to the tester.`,
    },
    ar: {
      title: `تم إرسال قالب واتساب ${code}`,
      body: `قامت المرحلة ${stageNumber} بمحاكاة إرسال رسالة واتساب إلى المختبر.`,
    },
  };

  return accumulator;
}, {} as Record<WhatsAppTemplateCode, { en: WhatsAppToastContent; ar: WhatsAppToastContent }>);

export type WhatsAppDirection = 'ltr' | 'rtl';

function useDirection(locale?: string): WhatsAppDirection {
  return useMemo(() => {
    const candidates: Array<string | undefined> = [locale];

    if (typeof document !== 'undefined') {
      candidates.push(document.documentElement.lang, document.documentElement.dir);
    }

    if (typeof navigator !== 'undefined') {
      candidates.push(navigator.language);
    }

    for (const candidate of candidates) {
      if (!candidate) {
        continue;
      }

      const value = candidate.toLowerCase();

      if (value === 'rtl' || value.startsWith('ar')) {
        return 'rtl';
      }

      if (value === 'ltr' || value.startsWith('en')) {
        return 'ltr';
      }
    }

    return 'ltr';
  }, [locale]);
}

const COPY: Record<
  WhatsAppDirection,
  {
    announced: string;
    viewAdvance: string;
    close: string;
    recipientLabel: string;
    templateLabel: string;
  }
> = {
  ltr: {
    announced: 'WhatsApp simulation',
    viewAdvance: 'View template & advance',
    close: 'Dismiss notification',
    recipientLabel: 'Recipient',
    templateLabel: 'Template',
  },
  rtl: {
    announced: 'محاكاة واتساب',
    viewAdvance: 'عرض القالب والمتابعة',
    close: 'إغلاق الإشعار',
    recipientLabel: 'المستلم',
    templateLabel: 'القالب',
  },
};

function createToastId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `whatsapp-toast-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface WhatsAppToastProps {
  open?: boolean;
  templateCode: WhatsAppTemplateCode;
  recipient?: string;
  title?: string;
  body?: string;
  detailsUrl?: string;
  advanceUrl?: string;
  personaId?: string;
  locale?: string;
  autoHideMs?: number;
  disableDefaultNavigation?: boolean;
  onViewDetails?: (detailsUrl: string) => void;
  onAdvance?: (advanceUrl: string) => void;
  onAction?: () => void;
  onDismiss?: () => void;
}

export function WhatsAppToast({
  open = true,
  templateCode,
  recipient,
  title,
  body,
  detailsUrl,
  advanceUrl,
  personaId,
  locale,
  autoHideMs = 12000,
  disableDefaultNavigation = false,
  onViewDetails,
  onAdvance,
  onAction,
  onDismiss,
}: WhatsAppToastProps) {
  useStyleInjection();

  const direction = useDirection(locale);
  const copy = COPY[direction];
  const safeRecipient = (recipient ?? DEFAULT_WHATSAPP_RECIPIENT).trim() || DEFAULT_WHATSAPP_RECIPIENT;
  const templateContent = WHATSAPP_TEMPLATE_CONTENT[templateCode] ?? WHATSAPP_TEMPLATE_CONTENT.W01;
  const localizedContent = direction === 'rtl' ? templateContent.ar : templateContent.en;

  const safeDetailsUrl = useMemo(
    () =>
      ensureEnglishUrl(
        detailsUrl ?? `${DEFAULT_WHATSAPP_DOMAIN}/whatsapp-templates/${templateCode}`,
        `${DEFAULT_WHATSAPP_DOMAIN}/whatsapp-templates/${templateCode}`,
      ),
    [detailsUrl, templateCode],
  );

  const safeAdvanceUrl = useMemo(
    () => ensureEnglishUrl(advanceUrl ?? DEFAULT_WHATSAPP_ADVANCE_URL, DEFAULT_WHATSAPP_ADVANCE_URL),
    [advanceUrl],
  );

  const waDigits = useMemo(() => {
    const digits = safeRecipient.replace(/\D/g, '');

    if (!digits) {
      return '966501234567';
    }

    if (digits.startsWith('0')) {
      const withoutLeadingZeros = digits.replace(/^0+/, '');
      return withoutLeadingZeros ? `966${withoutLeadingZeros}` : '966501234567';
    }

    return digits;
  }, [safeRecipient]);

  const safeWaUrl = useMemo(
    () => ensureEnglishUrl(`https://wa.me/${waDigits}`, 'https://wa.me/966501234567'),
    [waDigits],
  );

  const [paused, setPaused] = useState(false);
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!open || paused || autoHideMs <= 0 || typeof window === 'undefined') {
      return;
    }

    const timeout = window.setTimeout(() => {
      dismissRef.current?.();
    }, autoHideMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open, paused, autoHideMs]);

  const handleAction = useCallback(() => {
    const canUseWindow = typeof window !== 'undefined';

    if (onViewDetails) {
      onViewDetails(safeDetailsUrl);
    } else if (!disableDefaultNavigation && canUseWindow) {
      window.open(safeDetailsUrl, '_blank', 'noopener,noreferrer');
    }

    if (onAdvance) {
      onAdvance(safeAdvanceUrl);
    } else if (!disableDefaultNavigation && canUseWindow) {
      window.location.assign(safeAdvanceUrl);
    }

    onAction?.();
    dismissRef.current?.();
  }, [
    onViewDetails,
    onAdvance,
    onAction,
    disableDefaultNavigation,
    safeDetailsUrl,
    safeAdvanceUrl,
  ]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={`whatsapp-toast ${direction === 'rtl' ? 'whatsapp-toast--rtl' : 'whatsapp-toast--ltr'}`}
      dir={direction}
      lang={direction === 'rtl' ? 'ar' : 'en'}
      data-template-code={templateCode}
      data-persona-id={personaId || undefined}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      onClick={handleAction}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="whatsapp-toast__header">
        <span className="whatsapp-toast__badge">WhatsApp</span>
        <span className="whatsapp-toast__template" dir="ltr">
          {templateCode}
        </span>
        <button
          type="button"
          className="whatsapp-toast__close"
          aria-label={copy.close}
          onClick={(event) => {
            event.stopPropagation();
            dismissRef.current?.();
          }}
        >
          ×
        </button>
      </div>

      <div className="whatsapp-toast__body">
        <p className="whatsapp-toast__title">{title ?? localizedContent.title}</p>
        <p className="whatsapp-toast__text">{body ?? localizedContent.body}</p>

        <dl className="whatsapp-toast__meta">
          <div>
            <dt>{copy.recipientLabel}</dt>
            <dd dir="ltr">{safeRecipient}</dd>
          </div>
          <div>
            <dt>{copy.templateLabel}</dt>
            <dd dir="ltr">{templateCode}</dd>
          </div>
        </dl>
      </div>

      <div className="whatsapp-toast__actions">
        <button
          type="button"
          className="whatsapp-toast__button"
          onClick={(event) => {
            event.stopPropagation();
            handleAction();
          }}
        >
          {copy.viewAdvance}
        </button>

        <a
          className="whatsapp-toast__wa"
          href={safeWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          onClick={(event) => event.stopPropagation()}
        >
          {safeWaUrl.replace(/^https?:\/\//, '')}
        </a>
      </div>
    </div>
  );
}

export interface WhatsAppToastRequest {
  recipient?: string;
  title?: string;
  body?: string;
  detailsUrl?: string;
  advanceUrl?: string;
  personaId?: string;
  locale?: string;
  autoHideMs?: number;
  disableDefaultNavigation?: boolean;
  onViewDetails?: (detailsUrl: string) => void;
  onAdvance?: (advanceUrl: string) => void;
  onAction?: () => void;
}

export interface ShowWhatsAppToastOptions extends WhatsAppToastRequest {
  templateCode: WhatsAppTemplateCode | string;
}

export interface WhatsAppToastEntry
  extends Omit<WhatsAppToastProps, 'open' | 'onDismiss' | 'templateCode'> {
  id: string;
  templateCode: WhatsAppTemplateCode;
}

export interface WhatsAppToastContextValue {
  showWhatsAppToast: (options: ShowWhatsAppToastOptions) => string;
  dismissWhatsAppToast: (id: string) => void;
}

const WhatsAppToastContext = createContext<WhatsAppToastContextValue | null>(null);

const NOOP_WHATSAPP_TOAST_CONTEXT: WhatsAppToastContextValue = {
  showWhatsAppToast: () => {
    if (typeof console !== 'undefined') {
      console.warn('WhatsAppToast: Wrap your application in <WhatsAppToastProvider> to display toast notifications.');
    }

    return 'noop';
  },
  dismissWhatsAppToast: () => undefined,
};

export interface WhatsAppToastProviderProps {
  locale?: string;
  personaId?: string;
  defaultAutoHideMs?: number;
}

export function WhatsAppToastProvider({
  children,
  locale,
  personaId,
  defaultAutoHideMs = 12000,
}: PropsWithChildren<WhatsAppToastProviderProps>) {
  useStyleInjection();

  const direction = useDirection(locale);
  const [toasts, setToasts] = useState<WhatsAppToastEntry[]>([]);

  const showWhatsAppToast = useCallback((options: ShowWhatsAppToastOptions): string => {
    const id = createToastId();
    const templateCode = normalizeWhatsAppTemplateCode(options.templateCode);
    const entry: WhatsAppToastEntry = { ...options, templateCode, id };

    setToasts((current) => [...current.slice(-2), entry]);

    return id;
  }, []);

  const dismissWhatsAppToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      showWhatsAppToast,
      dismissWhatsAppToast,
    }),
    [showWhatsAppToast, dismissWhatsAppToast],
  );

  return (
    <WhatsAppToastContext.Provider value={value}>
      {children}

      {toasts.length > 0 ? (
        <div
          className={`whatsapp-toast-stack ${direction === 'rtl' ? 'whatsapp-toast-stack--rtl' : 'whatsapp-toast-stack--ltr'}`}
          dir={direction}
          data-testid="whatsapp-toast-stack"
        >
          {toasts.map(({ id, ...toastProps }) => (
            <WhatsAppToast
              key={id}
              open
              {...toastProps}
              locale={toastProps.locale ?? locale}
              personaId={toastProps.personaId ?? personaId}
              autoHideMs={toastProps.autoHideMs ?? defaultAutoHideMs}
              onDismiss={() => dismissWhatsAppToast(id)}
            />
          ))}
        </div>
      ) : null}
    </WhatsAppToastContext.Provider>
  );
}

export function useWhatsAppToast(): WhatsAppToastContextValue {
  const context = useContext(WhatsAppToastContext);
  return context ?? NOOP_WHATSAPP_TOAST_CONTEXT;
}

export interface WhatsAppStageToastOptions extends WhatsAppToastRequest {
  templateCode?: WhatsAppTemplateCode | string;
}

export function useWhatsAppStageToast(
  stage: string | number | null | undefined,
  options?: WhatsAppStageToastOptions,
): void {
  const { showWhatsAppToast } = useWhatsAppToast();
  const optionsRef = useRef(options);
  const previousStageRef = useRef(stage);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const previousStage = previousStageRef.current;
    previousStageRef.current = stage;

    if (stage == null || stage === previousStage) {
      return;
    }

    const currentOptions = optionsRef.current ?? {};
    const templateCode = currentOptions.templateCode ?? getTemplateCodeForStage(stage);

    showWhatsAppToast({
      ...currentOptions,
      templateCode,
    });
  }, [stage, showWhatsAppToast]);
}

export interface WhatsAppStageToastProps extends WhatsAppStageToastOptions {
  stage: string | number | null | undefined;
}

export function WhatsAppStageToast({ stage, ...options }: WhatsAppStageToastProps): null {
  useWhatsAppStageToast(stage, options);
  return null;
}

export interface WhatsAppToastSsePayload extends WhatsAppToastRequest {
  templateCode?: WhatsAppTemplateCode | string;
  stage?: string | number;
}

export function useWhatsAppToastSse(url: string, enabled = true): void {
  const { showWhatsAppToast } = useWhatsAppToast();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || typeof EventSource === 'undefined') {
      return;
    }

    const safeUrl = ensureEnglishUrl(url, '/api/whatsapp/toast-events');
    const source = new EventSource(safeUrl);

    const handleEvent = (event: Event) => {
      const data = (event as MessageEvent).data;

      if (typeof data !== 'string') {
        return;
      }

      let payload: unknown;

      try {
        payload = JSON.parse(data);
      } catch {
        return;
      }

      if (typeof payload !== 'object' || payload === null) {
        return;
      }

      const record = payload as Record<string, unknown>;

      const request: WhatsAppToastRequest = {
        recipient: typeof record.recipient === 'string' ? record.recipient : undefined,
        title: typeof record.title === 'string' ? record.title : undefined,
        body: typeof record.body === 'string' ? record.body : undefined,
        detailsUrl: typeof record.detailsUrl === 'string' ? record.detailsUrl : undefined,
        advanceUrl: typeof record.advanceUrl === 'string' ? record.advanceUrl : undefined,
        personaId: typeof record.personaId === 'string' ? record.personaId : undefined,
        locale: typeof record.locale === 'string' ? record.locale : undefined,
        autoHideMs: typeof record.autoHideMs === 'number' ? record.autoHideMs : undefined,
        disableDefaultNavigation:
          typeof record.disableDefaultNavigation === 'boolean'
            ? record.disableDefaultNavigation
            : undefined,
      };

      let templateCandidate = 'W01';

      if (typeof record.templateCode === 'string') {
        templateCandidate = record.templateCode;
      } else if (typeof record.stage === 'string') {
        templateCandidate = record.stage;
      } else if (typeof record.stage === 'number') {
        templateCandidate = String(record.stage);
      }

      showWhatsAppToast({
        ...request,
        templateCode: templateCandidate,
      });
    };

    source.addEventListener('whatsapp-template', handleEvent);
    source.addEventListener('message', handleEvent);

    return () => {
      source.removeEventListener('whatsapp-template', handleEvent);
      source.removeEventListener('message', handleEvent);
      source.close();
    };
  }, [url, enabled, showWhatsAppToast]);
}

export default WhatsAppToast;