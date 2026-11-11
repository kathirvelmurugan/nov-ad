import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import { PALETTE, getInputStyle, getPrimaryButtonStyle, labelStyle } from './authTypesAndUtils';
import { SEEDED_TENANT_HOSPITALS, SEEDED_STAFF_DIRECTORY } from '../../data/platformSeed';
import { TENANTS_KEY, PLATFORM_USERS_KEY } from '../../hooks/workflowConstants';
import { RoleCode, TenantHospital, StaffAccountRecord } from '../../types';
import { Building2, KeyRound, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

interface HospitalStaffLoginFormProps {
  isRTL: boolean;
  isLoading: boolean;
  onStaffLoginSuccess: (session: {
    phone: string;
    roleCode: RoleCode;
    hospitalId: string;
    fullName: string;
  }) => void;
  t: (ar: string, en: string) => string;
}

export const HospitalStaffLoginForm: React.FC<HospitalStaffLoginFormProps> = ({
  isRTL,
  isLoading,
  onStaffLoginSuccess,
  t,
}) => {
  // Read dynamic hospitals from localStorage or fall back to seed
  const [hospitals, setHospitals] = useState<TenantHospital[]>(() => {
    try {
      const saved = localStorage.getItem(TENANTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SEEDED_TENANT_HOSPITALS;
  });

  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(() => hospitals[0]?.id || '');
  const [loginMethod, setLoginMethod] = useState<'admin_otp' | 'staff_pin'>('staff_pin');
  const [staffCode, setStaffCode] = useState('');
  const [staffPin, setStaffPin] = useState('1234');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminOtp, setAdminOtp] = useState('123456');
  const [error, setError] = useState('');

  // Re-sync dynamic hospitals from backend API and localStorage on mount and window focus
  useEffect(() => {
    const refresh = () => {
      apiClient.fetchTenants().then((fetched) => {
        if (Array.isArray(fetched) && fetched.length > 0) {
          setHospitals(fetched);
          if (!selectedHospitalId) {
            setSelectedHospitalId(fetched[0].id);
            setAdminPhone(fetched[0].hospitalAdminPhone || '');
          }
        }
      });
    };

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [selectedHospitalId]);

  // Auto-select first hospital or update admin phone if changed
  useEffect(() => {
    if (!selectedHospitalId && hospitals.length > 0) {
      setSelectedHospitalId(hospitals[0].id);
      setAdminPhone(hospitals[0].hospitalAdminPhone || '');
    } else if (selectedHospitalId) {
      const h = hospitals.find((item) => item.id === selectedHospitalId);
      if (h) setAdminPhone(h.hospitalAdminPhone || '');
    }
  }, [hospitals, selectedHospitalId]);

  // Read staff accounts dynamically
  const getDynamicStaff = (): StaffAccountRecord[] => {
    try {
      const stored = localStorage.getItem(PLATFORM_USERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return SEEDED_STAFF_DIRECTORY;
  };

  const handleHospitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (hospitals.length === 0) {
      setError(
        t(
          'لا توجد مستشفيات مسجلة حالياً. يرجى تسجيل الدخول كمشرف عام لإنشاء أول مستشفى.',
          'No partner hospitals enrolled yet. Please login as Super Admin to add the first hospital.'
        )
      );
      return;
    }

    const hospital = hospitals.find((h) => h.id === selectedHospitalId);
    if (!hospital) {
      setError(t('المجمع الطبي غير موجود', 'Hospital not found'));
      return;
    }

    if (loginMethod === 'admin_otp') {
      if (adminOtp.trim() !== '123456') {
        setError(t('رمز التحقق غير صحيح (استخدم 123456)', 'Invalid OTP code (use 123456)'));
        return;
      }
      onStaffLoginSuccess({
        phone: hospital.hospitalAdminPhone,
        roleCode: 'HA',
        hospitalId: hospital.id,
        fullName: hospital.hospitalAdminName,
      });
    } else {
      const cleanCode = staffCode.trim();
      const allStaff = getDynamicStaff();
      const matched = allStaff.find(
        (s) => s.staffCode === cleanCode && (s.hospitalId === selectedHospitalId || !s.hospitalId)
      );

      if (!matched || staffPin.trim() !== matched.pin) {
        setError(t('رقم الموظف أو رمز PIN غير صحيح', 'Invalid Staff ID or PIN'));
        return;
      }

      onStaffLoginSuccess({
        phone: matched.phone,
        roleCode: matched.roleCode,
        hospitalId: selectedHospitalId,
        fullName: isRTL ? matched.fullNameAr || matched.fullName : matched.fullName,
      });
    }
  };

  if (hospitals.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 12px', direction: isRTL ? 'rtl' : 'ltr' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            backgroundColor: '#fef3c7',
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
          }}
        >
          <AlertCircle style={{ width: 24, height: 24 }} />
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: PALETTE.textDark, margin: '0 0 6px 0' }}>
          {t('لا توجد مستشفيات مسجلة حالياً', 'No Partner Hospitals Registered Yet')}
        </h3>
        <p style={{ fontSize: '12px', color: PALETTE.textMuted, lineHeight: 1.6, margin: '0 0 16px 0' }}>
          {t(
            'النظام مهيأ في حالة بداية جديدة (Clean Slate). يرجى التبديل لتبويب "المشرف العام" لإضافة أول مستشفى وكوادره الطبية.',
            'System is in clean-slate state. Please switch to the "Super Admin" tab to onboard the first hospital and its staff.'
          )}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleHospitalSubmit} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Hospital Picker */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ ...labelStyle, textAlign: isRTL ? 'right' : 'left', display: 'block' }}>
          <Building2 style={{ width: 14, height: 14, display: 'inline', marginInlineEnd: 4 }} />
          {t('اختر المجمع الطبي / المستشفى الشريك', 'Select Partner Hospital / Medical Center')}
        </label>
        <select
          value={selectedHospitalId}
          onChange={(e) => setSelectedHospitalId(e.target.value)}
          style={{
            ...getInputStyle(isRTL),
            cursor: 'pointer',
            backgroundColor: '#ffffff',
            fontWeight: 700,
          }}
        >
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>
              {isRTL ? h.nameAr : h.nameEn} ({isRTL ? h.cityAr || h.city : h.city})
            </option>
          ))}
        </select>
      </div>

      {/* Sub-selector: Staff PIN vs Admin OTP */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setLoginMethod('staff_pin')}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: '8px',
            border: loginMethod === 'staff_pin' ? `2px solid ${PALETTE.primary}` : '1px solid #cbd5e1',
            backgroundColor: loginMethod === 'staff_pin' ? PALETTE.background : '#ffffff',
            color: loginMethod === 'staff_pin' ? PALETTE.primary : '#64748b',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <KeyRound style={{ width: 13, height: 13, display: 'inline', marginInlineEnd: 4 }} />
          {t('دخول الموظف والأطباء (5 أرقام)', 'Staff / Doctor ID (5-Digit)')}
        </button>

        <button
          type="button"
          onClick={() => setLoginMethod('admin_otp')}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: '8px',
            border: loginMethod === 'admin_otp' ? `2px solid ${PALETTE.primary}` : '1px solid #cbd5e1',
            backgroundColor: loginMethod === 'admin_otp' ? PALETTE.background : '#ffffff',
            color: loginMethod === 'admin_otp' ? PALETTE.primary : '#64748b',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <Phone style={{ width: 13, height: 13, display: 'inline', marginInlineEnd: 4 }} />
          {t('مدير المجمع (رمز OTP)', 'Hospital Admin (OTP)')}
        </button>
      </div>

      {/* Fields */}
      {loginMethod === 'staff_pin' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ ...labelStyle, textAlign: isRTL ? 'right' : 'left', display: 'block' }}>
              {t('رقم الموظف (Staff ID)', 'Staff ID (5-Digit)')}
            </label>
            <input
              type="text"
              value={staffCode}
              onChange={(e) => setStaffCode(e.target.value)}
              placeholder="e.g. 10201 (Doctor) / 10001 (Admin)"
              style={getInputStyle(isRTL)}
            />
          </div>
          <div>
            <label style={{ ...labelStyle, textAlign: isRTL ? 'right' : 'left', display: 'block' }}>
              {t('رمز المرور السري (PIN)', 'Passcode / PIN')}
            </label>
            <input
              type="password"
              value={staffPin}
              onChange={(e) => setStaffPin(e.target.value)}
              placeholder="••••"
              style={getInputStyle(isRTL)}
            />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ ...labelStyle, textAlign: isRTL ? 'right' : 'left', display: 'block' }}>
              {t('جوال مدير المجمع الطبي', 'Hospital Admin Mobile')}
            </label>
            <input
              type="text"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              style={getInputStyle(isRTL)}
            />
          </div>
          <div>
            <label style={{ ...labelStyle, textAlign: isRTL ? 'right' : 'left', display: 'block' }}>
              {t('رمز التحقق المرسل (OTP)', 'Verification Code (OTP)')}
            </label>
            <input
              type="text"
              value={adminOtp}
              onChange={(e) => setAdminOtp(e.target.value)}
              placeholder="123456"
              style={getInputStyle(isRTL)}
            />
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: PALETTE.error, fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
          ⚠️ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        style={{
          ...getPrimaryButtonStyle(),
          opacity: isLoading ? 0.7 : 1,
          marginTop: '16px',
        }}
      >
        <CheckCircle2 style={{ width: 16, height: 16 }} />
        <span>{t('تسجيل الدخول إلى بوابة المستشفى', 'Sign In to Hospital Portal')}</span>
      </button>
    </form>
  );
};
