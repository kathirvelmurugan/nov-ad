import React, { useState } from 'react';
import { PALETTE, getInputStyle, getPrimaryButtonStyle, labelStyle } from './authTypesAndUtils';
import { SEEDED_TENANT_HOSPITALS, SEEDED_STAFF_DIRECTORY } from '../../data/platformSeed';
import { RoleCode } from '../../types';
import { Building2, KeyRound, Phone, CheckCircle2 } from 'lucide-react';

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
  const [selectedHospitalId, setSelectedHospitalId] = useState('hosp-riyadh-care');
  const [loginMethod, setLoginMethod] = useState<'admin_otp' | 'staff_pin'>('staff_pin');
  const [staffCode, setStaffCode] = useState('10201'); // Default Saudi Doctor
  const [staffPin, setStaffPin] = useState('1234');
  const [adminPhone, setAdminPhone] = useState('+966 50 444 4444');
  const [adminOtp, setAdminOtp] = useState('123456');
  const [error, setError] = useState('');

  const handleHospitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const hospital = SEEDED_TENANT_HOSPITALS.find((h) => h.id === selectedHospitalId);
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
      // Find staff in directory
      const cleanCode = staffCode.trim();
      const matched = SEEDED_STAFF_DIRECTORY.find(
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
        fullName: isRTL ? (matched.fullNameAr || matched.fullName) : matched.fullName,
      });
    }
  };

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
          {SEEDED_TENANT_HOSPITALS.map((h) => (
            <option key={h.id} value={h.id}>
              {isRTL ? h.nameAr : h.nameEn} ({isRTL ? h.cityAr : h.city})
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
            <label style={{ ...labelStyle, textAlign: isRTL ? 'right' : 'left', display: 'block' }}>{t('رقم الموظف (Staff ID)', 'Staff ID (5-Digit)')}</label>
            <input
              type="text"
              value={staffCode}
              onChange={(e) => setStaffCode(e.target.value)}
              placeholder="e.g. 10201 (Doctor) / 10501 (Lab)"
              style={getInputStyle(isRTL)}
            />
          </div>
          <div>
            <label style={{ ...labelStyle, textAlign: isRTL ? 'right' : 'left', display: 'block' }}>{t('رمز المرور السري (PIN)', 'Passcode / PIN')}</label>
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
            <label style={{ ...labelStyle, textAlign: isRTL ? 'right' : 'left', display: 'block' }}>{t('جوال مدير المجمع الطبي', 'Hospital Admin Mobile')}</label>
            <input
              type="text"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              style={getInputStyle(isRTL)}
            />
          </div>
          <div>
            <label style={{ ...labelStyle, textAlign: isRTL ? 'right' : 'left', display: 'block' }}>{t('رمز التحقق المرسل (OTP)', 'Verification Code (OTP)')}</label>
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
