import React from 'react';
import { ClinicalCase } from '../../types';

interface Props {
  activeCase: ClinicalCase;
  otpCode: string;
  setOtpCode: (val: string) => void;
  onVerifyOtp: () => void;
  tealPrimary: string;
  tealSecondary: string;
  tealBg: string;
  whatsappGreen: string;
}

export const ConsultantOtpChallenge: React.FC<Props> = ({
  activeCase,
  otpCode,
  setOtpCode,
  onVerifyOtp,
  tealPrimary,
  tealSecondary,
  tealBg,
  whatsappGreen,
}) => {
  return (
    <section aria-label="Magic link OTP challenge" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: `2px solid ${tealSecondary}` }}>
      <div style={{ display: 'inline-block', backgroundColor: tealBg, color: tealPrimary, fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', marginBottom: '12px', border: `1px solid ${tealSecondary}` }}>
        K00 · MAGIC LINK ACCESS CONTROL
      </div>
      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', marginTop: 0, marginBottom: '8px' }}>
        Verify Identity to Unlock Clinical File
      </h2>
      <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, marginBottom: '16px' }}>
        A temporary magic link was dispatched to your registered specialist credentials. Enter the 6-digit WhatsApp OTP to authenticate your session.
      </p>

      <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Active Magic Token:</div>
        <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: tealPrimary }}>
          {activeCase.consultantToken?.token || 'ALO-TOKEN-72H-DR-ARJUN-KIMS'}
        </div>
      </div>

      <label htmlFor="otp-input" style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#333', marginBottom: '6px' }}>
        6-Digit Verification OTP (WhatsApp / SMS):
      </label>
      <input
        id="otp-input"
        type="text"
        maxLength={6}
        value={otpCode}
        onChange={(e) => setOtpCode(e.target.value)}
        style={{ width: '100%', padding: '12px', fontSize: '18px', fontWeight: 800, textAlign: 'center', letterSpacing: '4px', borderRadius: '8px', border: `2px solid ${tealPrimary}`, marginBottom: '12px', outline: 'none', boxSizing: 'border-box' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: tealBg, borderRadius: '8px', marginBottom: '20px', border: `1px solid ${tealSecondary}` }}>
        <span style={{ color: whatsappGreen, fontSize: '16px', fontWeight: 800 }}>✓</span>
        <span style={{ fontSize: '12px', color: tealPrimary, fontWeight: 700 }}>
          Encrypted 30-day session cookie will be established on this browser.
        </span>
      </div>

      <button
        type="button"
        onClick={onVerifyOtp}
        style={{ width: '100%', padding: '14px', backgroundColor: tealPrimary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,123,110,0.2)' }}
      >
        Verify OTP & Unlock Case Dossier (K01) →
      </button>
    </section>
  );
};
