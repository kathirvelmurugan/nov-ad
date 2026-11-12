import React, { useState, useCallback, useMemo, useEffect } from 'react';

const PALETTE = {
  tealDark: '#007B6E',
  tealBright: '#00C6AE',
  tealLight: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textMuted: '#6B7280',
  error: '#DC2626',
  errorLight: '#FEF2F2',
};

const STAGE_ORDER = {
  INTAKE_RECEIVED: 1,
  NURSE_CHECK: 2,
  DOCTOR_REVIEW: 3,
  AWAITING_PAYMENT: 4,
  WITH_CONSULTANT: 5,
  OPINION_READY: 6,
  PARTNER_SERVICES: 7,
  FOLLOW_UP_21_DAYS: 8,
  CLOSED: 9,
};

const STAGE_LABELS_AR = {
  INTAKE_RECEIVED: 'استلام الطلب',
  NURSE_CHECK: 'فحص الممرض',
  DOCTOR_REVIEW: 'مراجعة الطبيب',
  AWAITING_PAYMENT: 'بانتظار الدفع',
  WITH_CONSULTANT: 'مع الاستشاري',
  OPINION_READY: 'الرأي جاهز',
  PARTNER_SERVICES: 'خدمات الشركاء',
  FOLLOW_UP_21_DAYS: 'متابعة ٢١ يوم',
  CLOSED: 'مغلق',
};

const STAGE_LABELS_EN = {
  INTAKE_RECEIVED: 'Intake Received',
  NURSE_CHECK: 'Nurse Check',
  DOCTOR_REVIEW: 'Doctor Review',
  AWAITING_PAYMENT: 'Awaiting Payment',
  WITH_CONSULTANT: 'With Consultant',
  OPINION_READY: 'Opinion Ready',
  PARTNER_SERVICES: 'Partner Services',
  FOLLOW_UP_21_DAYS: 'Follow Up 21 Days',
  CLOSED: 'Closed',
};

const PERSONAS = [
  { id: 'patient_ar', name: 'مريض (عربي)', lang: 'ar', dir: 'rtl', role: 'PATIENT' },
  { id: 'nurse_ar', name: 'ممرض (عربي)', lang: 'ar', dir: 'rtl', role: 'NURSE' },
  { id: 'doctor_ar', name: 'طبيب (عربي)', lang: 'ar', dir: 'rtl', role: 'DOCTOR' },
  { id: 'consultant_ar', name: 'استشاري (عربي)', lang: 'ar', dir: 'rtl', role: 'CONSULTANT' },
  { id: 'admin_ar', name: 'مدير (عربي)', lang: 'ar', dir: 'rtl', role: 'ADMIN' },
  { id: 'patient_en', name: 'Patient (EN)', lang: 'en', dir: 'ltr', role: 'PATIENT' },
  { id: 'nurse_en', name: 'Nurse (EN)', lang: 'en', dir: 'ltr', role: 'NURSE' },
  { id: 'doctor_en', name: 'Doctor (EN)', lang: 'en', dir: 'ltr', role: 'DOCTOR' },
  { id: 'consultant_en', name: 'Consultant (EN)', lang: 'en', dir: 'ltr', role: 'CONSULTANT' },
  { id: 'admin_en', name: 'Admin (EN)', lang: 'en', dir: 'ltr', role: 'ADMIN' },
  { id: 'billing_en', name: 'Billing (EN)', lang: 'en', dir: 'ltr', role: 'BILLING' },
];

const I18N = {
  ar: {
    title: 'حارس التراجع - ألو دكتور',
    subtitle: 'نظام حماية مراحل الحالات السريرية الإصدار ٢.٤',
    caseId: 'رقم الحالة',
    currentStage: 'المرحلة الحالية',
    targetStage: 'المرحلة المطلوبة',
    patchAttempt: 'محاولة تحديث (PATCH)',
    adminOverride: 'تجاوز المدير (POST)',
    adminToken: 'رمز المدير',
    forceStage: 'فرض المرحلة',
    responseLog: 'سجل الاستجابة',
    selectPersona: 'اختر الشخصية',
    regressionBlocked: 'تم حظر التراجع! خطأ ٤٠٩',
    success: 'تم التحديث بنجاح! خطأ ٢٠٠',
    forbidden: 'ممنوع! رمز المدير مطلوب. خطأ ٤٣٠',
    badRequest: 'طلب خاطئ! مرحلة غير معروفة. خطأ ٤٠٠',
    notFound: 'الحالة غير موجودة. خطأ ٤٠٤',
    noChange: 'لا يوجد تغيير في المرحلة. خطأ ٢٠٠',
    forwardAllowed: 'التقدم مسموح. خطأ ٢٠٠',
    serverCode: 'كود الخادم (server/index.js)',
    apiGuard: 'حارس API',
    clearLog: 'مسح السجل',
  },
  en: {
    title: 'Regression Guard - ALO DOCTOR',
    subtitle: 'Clinical Case Stage Protection System v2.4',
    caseId: 'Case ID',
    currentStage: 'Current Stage',
    targetStage: 'Target Stage',
    patchAttempt: 'PATCH Attempt',
    adminOverride: 'Admin Override (POST)',
    adminToken: 'Admin Token',
    forceStage: 'Force Stage',
    responseLog: 'Response Log',
    selectPersona: 'Select Persona',
    regressionBlocked: 'Regression Blocked! HTTP 409',
    success: 'Updated Successfully! HTTP 200',
    forbidden: 'Forbidden! Admin token required. HTTP 403',
    badRequest: 'Bad Request! Unknown stage. HTTP 400',
    notFound: 'Case not found. HTTP 404',
    noChange: 'No stage change. HTTP 200',
    forwardAllowed: 'Forward progression allowed. HTTP 200',
    serverCode: 'Server Code (server/index.js)',
    apiGuard: 'API Guard',
    clearLog: 'Clear Log',
  },
};

const generateServerCode = () => `// ALO DOCTOR v2.4 Saudi Edition - Stage Regression Guard
// File: server/index.js
// Model: qwen3-235b-a22b via Alibaba DashScope
// Branch: feature-sarat

const express = require('express');
const app = express();
app.use(express.json());

/**
 * STAGE_ORDER constant defines the linear progression of clinical stages.
 * Used by the regression guard to prevent backward stage transitions
 * which pose a data integrity risk in the clinical workflow.
 */
const STAGE_ORDER = {
  INTAKE_RECEIVED: 1,
  NURSE_CHECK: 2,
  DOCTOR_REVIEW: 3,
  AWAITING_PAYMENT: 4,
  WITH_CONSULTANT: 5,
  OPINION_READY: 6,
  PARTNER_SERVICES: 7,
  FOLLOW_UP_21_DAYS: 8,
  CLOSED: 9,
};

// In-memory store for demonstration
let memoryCases = [
  { id: 'CASE-001', currentStage: 'DOCTOR_REVIEW', stage: 3, updatedAt: new Date().toISOString() },
  { id: 'CASE-002', currentStage: 'CLOSED', stage: 9, updatedAt: new Date().toISOString() },
];

/**
 * PATCH /api/cases/:id
 * Stage Regression Guard: Prevents moving a case backward in the clinical workflow.
 * Returns HTTP 409 Conflict if requested stage order is less than current stage order.
 */
app.patch('/api/cases/:id', (req, res) => {
  const existing = memoryCases.find((c) => c.id === req.params.id);
  
  if (!existing) {
    return res.status(404).json({ error: 'Case not found' });
  }

  // REGRESSION GUARD: Block backward stage transitions
  if (existing && req.body.currentStage && req.body.currentStage !== existing.currentStage) {
    const currentOrder = STAGE_ORDER[existing.currentStage] || 0;
    const newOrder = STAGE_ORDER[req.body.currentStage] || 0;
    
    if (newOrder < currentOrder) {
      return res.status(409).json({
        error: \`Stage regression denied. Cannot move case from "\${existing.currentStage}" (stage \${currentOrder}) back to "\${req.body.currentStage}" (stage \${newOrder}). Use admin override if intentional.\`,
        currentStage: existing.currentStage,
        requestedStage: req.body.currentStage,
      });
    }
  }

  // Apply update normally for forward transitions or non-stage updates
  Object.assign(existing, req.body, { updatedAt: new Date().toISOString() });
  if (req.body.currentStage) {
    existing.stage = STAGE_ORDER[req.body.currentStage] || existing.stage;
  }
  
  return res.status(200).json({ success: true, case: existing });
});

/**
 * POST /api/admin/cases/:id/force-stage
 * Protected endpoint for legitimate admin rollbacks.
 * Requires x-admin-token header for authorization.
 */
app.post('/api/admin/cases/:id/force-stage', (req, res) => {
  const adminToken = req.headers['x-admin-token'];
  
  if (adminToken !== 'ALO-ADMIN-OVERRIDE-2026') {
    return res.status(403).json({ error: 'Admin token required' });
  }
  
  const { targetStage } = req.body;
  
  if (!STAGE_ORDER[targetStage]) {
    return res.status(400).json({ error: \`Unknown stage: \${targetStage}\` });
  }
  
  const idx = memoryCases.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Case not found' });
  
  memoryCases[idx].currentStage = targetStage;
  memoryCases[idx].stage = STAGE_ORDER[targetStage];
  memoryCases[idx].updatedAt = new Date().toISOString();
  
  res.json({ success: true, case: memoryCases[idx] });
});

module.exports = app;`;

export default function AloDoctorRegressionGuard() {
  const [activePersonaId, setActivePersonaId] = useState('admin_en');
  const [caseId, setCaseId] = useState('CASE-001');
  const [currentStage, setCurrentStage] = useState('DOCTOR_REVIEW');
  const [targetStage, setTargetStage] = useState('NURSE_CHECK');
  const [adminToken, setAdminToken] = useState('');
  const [logs, setLogs] = useState([]);
  const [showCode, setShowCode] = useState(false);

  const persona = useMemo(() => PERSONAS.find(p => p.id === activePersonaId) || PERSONAS[0], [activePersonaId]);
  const t = I18N[persona.lang] || I18N.en;
  const stageLabels = persona.lang === 'ar' ? STAGE_LABELS_AR : STAGE_LABELS_EN;
  const isRTL = persona.dir === 'rtl';

  const addLog = useCallback((entry) => {
    setLogs(prev => [{ timestamp: new Date().toISOString(), ...entry }, ...prev].slice(0, 50));
  }, []);

  const simulatePatch = useCallback(() => {
    const currentOrder = STAGE_ORDER[currentStage] || 0;
    const newOrder = STAGE_ORDER[targetStage] || 0;

    if (currentStage === targetStage) {
      addLog({ type: 'info', status: 200, message: t.noChange, payload: { currentStage, targetStage } });
      return;
    }

    if (newOrder < currentOrder) {
      addLog({
        type: 'error',
        status: 409,
        message: t.regressionBlocked,
        payload: {
          error: `Stage regression denied. Cannot move case from "${currentStage}" (stage ${currentOrder}) back to "${targetStage}" (stage ${newOrder}). Use admin override if intentional.`,
          currentStage,
          requestedStage: targetStage,
        }
      });
    } else {
      addLog({
        type: 'success',
        status: 200,
        message: t.forwardAllowed,
        payload: { success: true, case: { id: caseId, currentStage: targetStage, stage: newOrder, updatedAt: new Date().toISOString() } }
      });
    }
  }, [currentStage, targetStage, caseId, addLog, t]);

  const simulateAdminOverride = useCallback(() => {
    if (adminToken !== 'ALO-ADMIN-OVERRIDE-2026') {
      addLog({ type: 'error', status: 403, message: t.forbidden, payload: { error: 'Admin token required' } });
      return;
    }

    if (!STAGE_ORDER[targetStage]) {
      addLog({ type: 'error', status: 400, message: t.badRequest, payload: { error: `Unknown stage: ${targetStage}` } });
      return;
    }

    addLog({
      type: 'success',
      status: 200,
      message: t.success,
      payload: {
        success: true,
        case: { id: caseId, currentStage: targetStage, stage: STAGE_ORDER[targetStage], updatedAt: new Date().toISOString() }
      }
    });
  }, [adminToken, targetStage, caseId, addLog, t]);

  const fontClass = isRTL ? "font-['Cairo',sans-serif]" : "font-['Inter',sans-serif]";

  const containerStyle = {
    direction: persona.dir,
    fontFamily: isRTL ? "'Cairo', sans-serif" : "'Inter', sans-serif",
    backgroundColor: PALETTE.tealLight,
    minHeight: '100vh',
  };

  return (
    <div style={containerStyle} className={`${fontClass} min-h-screen p-4 md:p-8`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        .alo-focus:focus { outline: none; box-shadow: 0 0 0 3px rgba(0, 198, 174, 0.3); }
        .alo-transition { transition: all 0.2s ease-in-out; }
      `}</style>

      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 style={{ color: PALETTE.tealDark }} className="text-3xl md:text-4xl font-bold mb-2">
              {t.title}
            </h1>
            <p style={{ color: PALETTE.textMuted }} className="text-sm md:text-base">
              {t.subtitle}
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <label htmlFor="persona-switcher" className="sr-only">{t.selectPersona}</label>
            <select
              id="persona-switcher"
              value={activePersonaId}
              onChange={(e) => setActivePersonaId(e.target.value)}
              className="alo-focus alo-transition px-4 py-2 rounded-lg border-2 text-sm font-semibold cursor-pointer"
              style={{
                borderColor: PALETTE.tealBright,
                backgroundColor: PALETTE.white,
                color: PALETTE.tealDark,
              }}
              aria-label={t.selectPersona}
            >
              {PERSONAS.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <section
          className="rounded-2xl p-6 shadow-sm border"
          style={{ backgroundColor: PALETTE.white, borderColor: `${PALETTE.tealBright}33` }}
          aria-labelledby="patch-heading"
        >
          <h2 id="patch-heading" style={{ color: PALETTE.tealDark }} className="text-xl font-bold mb-6 flex items-center gap-2">
            <span style={{ backgroundColor: PALETTE.tealLight, color: PALETTE.tealDark }} className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            {t.patchAttempt}
          </h2>

          <div className="space-y-5">
            <div>
              <label htmlFor="case-id" style={{ color: PALETTE.textDark }} className="block text-sm font-semibold mb-2">
                {t.caseId}
              </label>
              <input
                id="case-id"
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="alo-focus alo-transition w-full px-4 py-3 rounded-xl border-2 text-sm"
                style={{ borderColor: `${PALETTE.tealBright}44`, backgroundColor: PALETTE.tealLight }}
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="current-stage" style={{ color: PALETTE.textDark }} className="block text-sm font-semibold mb-2">
                {t.currentStage}
              </label>
              <select
                id="current-stage"
                value={currentStage}
                onChange={(e) => setCurrentStage(e.target.value)}
                className="alo-focus alo-transition w-full px-4 py-3 rounded-xl border-2 text-sm font-medium"
                style={{ borderColor: `${PALETTE.tealBright}44`, backgroundColor: PALETTE.white }}
              >
                {Object.entries(STAGE_ORDER).map(([key, val]) => (
                  <option key={key} value={key}>{val}. {stageLabels[key]}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="target-stage" style={{ color: PALETTE.textDark }} className="block text-sm font-semibold mb-2">
                {t.targetStage}
              </label>
              <select
                id="target-stage"
                value={targetStage}
                onChange={(e) => setTargetStage(e.target.value)}
                className="alo-focus alo-transition w-full px-4 py-3 rounded-xl border-2 text-sm font-medium"
                style={{ borderColor: `${PALETTE.tealBright}44`, backgroundColor: PALETTE.white }}
              >
                {Object.entries(STAGE_ORDER).map(([key, val]) => (
                  <option key={key} value={key}>{val}. {stageLabels[key]}</option>
                ))}
              </select>
            </div>

            <button
              onClick={simulatePatch}
              className="alo-focus alo-transition w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-wide"
              style={{ backgroundColor: PALETTE.tealDark }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PALETTE.tealBright}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PALETTE.tealDark}
              aria-label={t.patchAttempt}
            >
              PATCH /api/cases/{caseId}
            </button>
          </div>
        </section>

        <section
          className="rounded-2xl p-6 shadow-sm border"
          style={{ backgroundColor: PALETTE.white, borderColor: `${PALETTE.tealBright}33` }}
          aria-labelledby="admin-heading"
        >
          <h2 id="admin-heading" style={{ color: PALETTE.tealDark }} className="text-xl font-bold mb-6 flex items-center gap-2">
            <span style={{ backgroundColor: PALETTE.whatsapp, color: PALETTE.white }} className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            {t.adminOverride}
          </h2>

          <div className="space-y-5">
            <div>
              <label htmlFor="admin-token" style={{ color: PALETTE.textDark }} className="block text-sm font-semibold mb-2">
                {t.adminToken}
              </label>
              <input
                id="admin-token"
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="ALO-ADMIN-OVERRIDE-2026"
                className="alo-focus alo-transition w-full px-4 py-3 rounded-xl border-2 text-sm font-mono"
                style={{ borderColor: `${PALETTE.tealBright}44`, backgroundColor: PALETTE.tealLight }}
                dir="ltr"
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="admin-target-stage" style={{ color: PALETTE.textDark }} className="block text-sm font-semibold mb-2">
                {t.targetStage}
              </label>
              <select
                id="admin-target-stage"
                value={targetStage}
                onChange={(e) => setTargetStage(e.target.value)}
                className="alo-focus alo-transition w-full px-4 py-3 rounded-xl border-2 text-sm font-medium"
                style={{ borderColor: `${PALETTE.tealBright}44`, backgroundColor: PALETTE.white }}
              >
                {Object.entries(STAGE_ORDER).map(([key, val]) => (
                  <option key={key} value={key}>{val}. {stageLabels[key]}</option>
                ))}
              </select>
            </div>

            <button
              onClick={simulateAdminOverride}
              className="alo-focus alo-transition w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-wide flex items-center justify-center gap-2"
              style={{ backgroundColor: PALETTE.whatsapp }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              aria-label={t.forceStage}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              POST /api/admin/cases/{caseId}/force-stage
            </button>
          </div>
        </section>

        <section
          className="lg:col-span-2 rounded-2xl p-6 shadow-sm border"
          style={{ backgroundColor: PALETTE.white, borderColor: `${PALETTE.tealBright}33` }}
          aria-labelledby="log-heading"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 id="log-heading" style={{ color: PALETTE.tealDark }} className="text-xl font-bold flex items-center gap-2">
              {t.responseLog}
              <span style={{ backgroundColor: PALETTE.tealLight, color: PALETTE.tealDark }} className="text-xs px-2.5 py-1 rounded-full font-semibold">
                {logs.length}
              </span>
            </h2>
            <button
              onClick={() => setLogs([])}
              className="alo-focus alo-transition text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ color: PALETTE.tealDark, backgroundColor: PALETTE.tealLight }}
              aria-label={t.clearLog}
            >
              {t.clearLog}
            </button>
          </div>

          <div
            className="rounded-xl overflow-hidden border max-h-96 overflow-y-auto"
            style={{ borderColor: `${PALETTE.tealBright}22`, backgroundColor: '#0F172A' }}
            role="log"
            aria-live="polite"
            dir="ltr"
          >
            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm font-mono">
                No API calls simulated yet. Use the controls above.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {logs.map((log, idx) => (
                  <div key={idx} className="p-4 font-mono text-xs leading-relaxed">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-slate-500">{log.timestamp.split('T')[1].replace('Z', '')}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          log.status === 409 || log.status === 403 || log.status === 400
                            ? 'bg-red-500/20 text-red-400'
                            : log.status === 200
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        HTTP {log.status}
                      </span>
                      <span className="text-slate-300 font-semibold">{log.message}</span>
                    </div>
                    <pre className="text-slate-400 whitespace-pre-wrap break-all bg-slate-900/50 p-3 rounded-lg">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-2 mt-4">
          <button
            onClick={() => setShowCode(!showCode)}
            className="alo-focus alo-transition w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 border-2"
            style={{
              borderColor: PALETTE.tealBright,
              backgroundColor: showCode ? PALETTE.tealDark : PALETTE.white,
              color: showCode ? PALETTE.white : PALETTE.tealDark,
            }}
            aria-expanded={showCode}
            aria-controls="server-code-panel"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            {t.serverCode}
          </button>

          {showCode && (
            <div
              id="server-code-panel"
              className="mt-4 rounded-2xl overflow-hidden border shadow-lg"
              style={{ borderColor: `${PALETTE.tealBright}33` }}
            >
              <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: '#1E293B' }}>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-slate-400 text-xs font-mono">server/index.js</span>
              </div>
              <pre
                className="p-6 text-sm font-mono leading-relaxed overflow-x-auto text-slate-300"
                style={{ backgroundColor: '#0F172A', maxHeight: '600px' }}
                dir="ltr"
              >
                <code>{generateServerCode()}</code>
              </pre>
            </div>
          )}
        </section>

        <section
          className="lg:col-span-2 rounded-2xl p-6 border mt-2"
          style={{ backgroundColor: `${PALETTE.tealDark}08`, borderColor: `${PALETTE.tealBright}33` }}
          aria-labelledby="acceptance-heading"
        >
          <h3 id="acceptance-heading" style={{ color: PALETTE.tealDark }} className="font-bold text-lg mb-4">
            {t.apiGuard} — Acceptance Criteria
          </h3>
          <ul className="space-y-3 text-sm" style={{ color: PALETTE.textDark }}>
            {[
              'PATCH /api/cases/:id with currentStage lower than existing returns HTTP 409 with descriptive error JSON',
              'PATCH with equal or higher stage continues normally (200)',
              'PATCH without currentStage in body continues normally (200)',
              'Admin override POST /api/admin/cases/:id/force-stage works with correct header, returns 403 without it',
              'All existing E2E tests still pass (they only advance stages forward)',
              'Inline comment in server/index.js documenting the guard is present',
            ].map((criteria, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg
                  className="flex-shrink-0 mt-0.5"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={PALETTE.tealBright}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 pb-8 text-center">
        <p style={{ color: PALETTE.textMuted }} className="text-xs font-medium">
          ALO DOCTOR v2.4 Saudi Edition • ISSUE-6 WAVE-0-PARALLEL • Stage Regression Guard • Production Ready
        </p>
      </footer>
    </div>
  );
}