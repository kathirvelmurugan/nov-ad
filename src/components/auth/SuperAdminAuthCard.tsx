import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface SuperAdminAuthCardProps {
  isRTL: boolean;
  passcode: string;
  setPasscode: (code: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error?: string;
  t: (ar: string, en: string) => string;
}

export const SuperAdminAuthCard: React.FC<SuperAdminAuthCardProps> = ({
  isRTL,
  passcode,
  setPasscode,
  onSubmit,
  isLoading,
  error,
  t,
}) => {
  return (
    <form onSubmit={onSubmit} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '16px',
          borderRadius: '14px',
          marginBottom: '16px',
          border: '1px solid #334155',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <ShieldCheck style={{ width: 18, height: 18, color: '#38bdf8' }} />
          <span style={{ fontSize: '14px', fontWeight: 800 }}>
            {t('بوابة الإشراف والرقابة العليا (ALO Master)', 'Super Admin Governance Portal')}
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
          {t(
            'صلاحية مشفرة لإدارة المستشفيات الشريكة وسجلات الحوكمة.',
            'Cryptographically privileged master governance authority.'
          )}
        </p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
          {t('جوال المشرف العام', 'Super Admin Phone')}
        </label>
        <input
          type="text"
          disabled
          value="+966 50 000 0001"
          style={{
            width: '100%',
            padding: '12px 14px',
            fontSize: '15px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#f8fafc',
            color: '#0f172a',
            fontFamily: 'monospace',
            direction: 'ltr',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
          {t('رمز التحقق / Passcode (123456)', 'Passcode / Security PIN (123456)')}
        </label>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            fontSize: '16px',
            borderRadius: '10px',
            border: '2px solid #0f172a',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {error && (
        <div
          role="alert"
          style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '15px',
          fontWeight: 800,
          color: '#ffffff',
          backgroundColor: '#0f172a',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        <ShieldCheck style={{ width: 16, height: 16 }} />
        <span>{t('الدخول كمشرف عام للمنصة', 'Sign In as Super Admin')}</span>
      </button>
    </form>
  );
};

export default SuperAdminAuthCard;
