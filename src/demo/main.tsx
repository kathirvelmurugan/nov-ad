/**
 * Standalone demo entry — served at demo.html, completely outside the product.
 *
 * No session, no auth, no API. The case lives in React state only, so a visitor
 * can click anything without creating or mutating a real record.
 */
import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { FiveDeviceCockpitView } from '../components/cockpit';
import { ClinicalCase, ClinicalStage } from '../types';
import { STAGE_ORDER } from '../hooks/workflowConstants';
import { nextStageOf, stageGateError, stageGateMessage, stageNumberOf } from '../hooks/stageLogic';
import { createDemoCase } from './demoCase';
import '../index.css';

const TEAL = '#007B6E';

const DemoShell: React.FC = () => {
  const [lang, setLang] = useState<'ar' | 'en'>('en');
  const [activeCase, setActiveCase] = useState<ClinicalCase>(() => createDemoCase());
  const [notice, setNotice] = useState<string>('');

  const isAr = lang === 'ar';

  const updateCase = useCallback((patch: Partial<ClinicalCase>) => {
    setActiveCase((prev) => {
      const next = { ...prev, ...patch } as ClinicalCase;
      // Same rule as the product: the numeric stage is never hand-written.
      if (patch.currentStage) next.stage = stageNumberOf(patch.currentStage);
      return next;
    });
  }, []);

  const advanceStage = useCallback(() => {
    setActiveCase((prev) => {
      const target = nextStageOf(prev.currentStage);
      if (!target) return prev;
      const gateError = stageGateError(target, prev);
      if (gateError) {
        setNotice(stageGateMessage(gateError, lang));
        return prev;
      }
      setNotice('');
      return { ...prev, currentStage: target, stage: stageNumberOf(target) };
    });
  }, [lang]);

  const verifyPaymentAndDispatch = useCallback(() => {
    updateCase({
      paymentVerified: true,
      isCrossBorderDeidentified: true,
      egressToken: 'ALO-DEMO-EGRESS',
      consultantToken: {
        token: 'K-DEMO-TOKEN',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        otpVerified: true,
        sessionCookieActive: true,
        sessionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      currentStage: 'WITH_CONSULTANT',
    });
    setNotice('');
  }, [updateCase]);

  const jumpToStage = (stage: ClinicalStage) => {
    setActiveCase(createDemoCase(stage));
    setNotice('');
  };

  return (
    <div style={{ paddingTop: '8px' }}>
      {/* Demo control bar — deliberately not part of the product UI */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 2000,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 16px',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          fontFamily: "'Inter', sans-serif",
          fontSize: '12px',
          boxShadow: '0 2px 12px rgba(15, 23, 42, 0.35)',
        }}
      >
        <span
          style={{
            backgroundColor: TEAL,
            padding: '3px 9px',
            borderRadius: '999px',
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          DEMO
        </span>
        <span style={{ opacity: 0.85 }}>
          {isAr
            ? 'عرض توضيحي فقط — لا تسجيل دخول ولا حفظ للبيانات'
            : 'Walkthrough only — no login, nothing is saved'}
        </span>

        <label style={{ marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ opacity: 0.8 }}>{isAr ? 'المرحلة' : 'Stage'}</span>
          <select
            value={activeCase.currentStage}
            onChange={(event) => jumpToStage(event.target.value as ClinicalStage)}
            style={{
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '3px 6px',
              fontSize: '12px',
            }}
          >
            {STAGE_ORDER.map((stage, index) => (
              <option key={stage} value={stage}>
                {index + 1}. {stage.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => setLang(isAr ? 'en' : 'ar')}
          style={{
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '3px 10px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          {isAr ? 'EN' : 'AR'}
        </button>

        <button
          type="button"
          onClick={() => jumpToStage('INTAKE_RECEIVED')}
          style={{
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '3px 10px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          {isAr ? 'إعادة البدء' : 'Restart'}
        </button>

        <a
          href="./index.html"
          style={{
            color: '#5eead4',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          {isAr ? 'التطبيق الفعلي ↗' : 'Open the real app ↗'}
        </a>
      </div>

      {notice && (
        <div
          style={{
            margin: '8px 16px 0',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            color: '#78350f',
            fontSize: '12px',
            fontWeight: 700,
          }}
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {notice}
        </div>
      )}

      <FiveDeviceCockpitView
        activeCase={activeCase}
        onAdvanceStage={advanceStage}
        onVerifyPaymentAndDispatch={verifyPaymentAndDispatch}
        onUpdateCase={updateCase}
        onResetActiveCase={() => jumpToStage('INTAKE_RECEIVED')}
        lang={lang}
        onSwitchToWorkstation={() => { window.location.href = './index.html'; }}
      />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DemoShell />
  </React.StrictMode>
);
