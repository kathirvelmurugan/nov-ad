import React, { useState } from 'react';
import { KeyRound, ShieldCheck, ArrowRight, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { DEFAULT_TEST_PASSWORD } from './authTypesAndUtils';

interface FirstTimeActivationStepProps {
  isRTL: boolean;
  phoneDisplay: string;
  staffName?: string;
  roleName?: string;
  onActivationSuccess: (newPin: string) => void;
  onBack: () => void;
  t: (ar: string, en: string) => string;
}

export const FirstTimeActivationStep: React.FC<FirstTimeActivationStepProps> = ({
  isRTL,
  phoneDisplay,
  staffName,
  roleName,
  onActivationSuccess,
  onBack,
  t,
}) => {
  const [subStep, setSubStep] = useState<'verify_temp' | 'set_pin'>('verify_temp');
  const [tempPassword, setTempPassword] = useState('');
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyTemp = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPassword.trim() !== DEFAULT_TEST_PASSWORD) {
      setError(t('كلمة المرور المؤقتة غير صحيحة (الرمز التجريبي: 123456)', 'Invalid temporary password (Demo password: 123456)'));
      return;
    }
    setError('');
    setSubStep('set_pin');
  };

  const handlePinDigitChange = (index: number, val: string, isConfirm: boolean) => {
    const digit = val.slice(-1);
    if (val && !/^\d+$/.test(digit)) return;

    if (isConfirm) {
      const copy = [...confirmPin];
      copy[index] = digit;
      setConfirmPin(copy);
      if (digit && index < 3) {
        document.getElementById(`confirm-pin-${index + 1}`)?.focus();
      }
    } else {
      const copy = [...newPin];
      copy[index] = digit;
      setNewPin(copy);
      if (digit && index < 3) {
        document.getElementById(`new-pin-${index + 1}`)?.focus();
      }
    }
    setError('');
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinStr = newPin.join('');
    const confirmStr = confirmPin.join('');

    if (pinStr.length < 4) {
      setError(t('يرجى إدخال رمز الدخول الجديد المكون من 4 أرقام كاملاً', 'Please enter full 4-digit PIN'));
      return;
    }
    if (pinStr !== confirmStr) {
      setError(t('رمزا الدخول غير متطابقين، يرجى إعادة التحقق', 'PINs do not match. Please re-enter'));
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsLoading(false);
    onActivationSuccess(pinStr);
  };

  return (
    <div className="space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Activation Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-slate-900 p-4 rounded-2xl border border-teal-200 dark:border-teal-800 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-extrabold text-teal-900 dark:text-teal-200">
            {t('تفعيل حساب الكادر الطبي لأول مرة', 'First-Time Staff Activation')}
          </span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 font-medium">
          {staffName ? `${t('مرحباً بك', 'Welcome')} ${staffName} (${roleName || ''})` : phoneDisplay} · {t('يرجى استكمال تفعيل الحساب للوصول إلى لوحة التحكم', 'Please activate your account to access your workspace')}.
        </p>
      </div>

      {subStep === 'verify_temp' ? (
        <form onSubmit={handleVerifyTemp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('كلمة المرور المؤقتة للتفعيل:', 'Temporary Activation Password:')}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                value={tempPassword}
                onChange={(e) => {
                  setTempPassword(e.target.value);
                  setError('');
                }}
                placeholder={t('أدخل كلمة المرور (تجريبياً: 123456)', 'Enter temporary password (Demo: 123456)')}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-alo-teal outline-none font-mono"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 rtl:right-auto rtl:left-3 top-3" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              {t('الرمز التجريبي الحالي المعتمد: 123456', 'Current demo test password: 123456')}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50"
            >
              {t('رجوع', 'Back')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-alo-teal hover:bg-teal-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2"
            >
              <span>{t('التحقق والمتابعة لتعيين الرمز السري', 'Verify & Set Personal PIN')}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSavePin} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('تعيين رمز الدخول السري الجديد (4 أرقام):', 'Create New 4-Digit PIN:')}
              </label>
              <div className="flex gap-2 justify-center" dir="ltr">
                {newPin.map((digit, i) => (
                  <input
                    key={i}
                    id={`new-pin-${i}`}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinDigitChange(i, e.target.value, false)}
                    className="w-12 h-12 text-center text-lg font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-alo-teal outline-none font-mono shadow-xs"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('تأكيد رمز الدخول السري (4 أرقام):', 'Confirm 4-Digit PIN:')}
              </label>
              <div className="flex gap-2 justify-center" dir="ltr">
                {confirmPin.map((digit, i) => (
                  <input
                    key={i}
                    id={`confirm-pin-${i}`}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinDigitChange(i, e.target.value, true)}
                    className="w-12 h-12 text-center text-lg font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-alo-teal outline-none font-mono shadow-xs"
                  />
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>
              {t('سيتم حفظ جلسة تسجيل الدخول تلقائياً لمدة 30 يوماً.', 'Your session will remain securely active for 30 days.')}
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-alo-teal to-emerald-700 text-white font-extrabold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>{isLoading ? t('جاري الحفظ...', 'Saving...') : t('حفظ الرمز والدخول إلى البوابة', 'Save PIN & Launch Portal')}</span>
          </button>
        </form>
      )}
    </div>
  );
};
