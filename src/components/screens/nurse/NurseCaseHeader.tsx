import React from 'react';
import { MessageSquare, LogOut } from 'lucide-react';

export interface NurseCaseHeaderProps {
  activeCase: any;
  nurseName: string;
  referenceHospital: string;
  isAr: boolean;
  onLogout?: () => void;
}

const NurseCaseHeader: React.FC<NurseCaseHeaderProps> = ({
  activeCase,
  nurseName,
  referenceHospital,
  isAr,
  onLogout,
}) => {
  const dir = isAr ? 'rtl' : 'ltr';
  const fontClass = isAr ? 'font-cairo' : 'font-sans';

  const handleWhatsAppW03 = () => {
    const contactPhone =
      activeCase?.caregiver?.isProxy && activeCase?.caregiver?.phone
        ? activeCase.caregiver.phone
        : activeCase?.patientPhone;
    if (!contactPhone) return;
    const msg = isAr
      ? `مرحباً، نرجو إرسال الفحوصات الناقصة للحالة رقم ${activeCase.caseNumber}`
      : `Hello, please send the missing scans for case #${activeCase.caseNumber}`;
    const url = `https://wa.me/${contactPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isCaregiverProxy = !!activeCase?.caregiver?.isProxy;
  const caregiverName = activeCase?.caregiver?.name;
  const caregiverRel = activeCase?.caregiver?.relationship;

  return (
    <header
      dir={dir}
      className={`w-full bg-[#E6FAF7] border-b-2 border-[#00C6AE] px-4 py-3 flex items-center justify-between rounded-t-xl ${fontClass}`}
      role="banner"
      aria-label={isAr ? 'رأس ملف مراجعة الحالة' : 'Case Review File Header'}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-[#007B6E]">
          {isAr ? 'ملف مراجعة الحالة N01' : 'N01 Case Review File'}
        </h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#007B6E]">
          <span>
            {isAr ? 'رقم الحالة:' : 'Case #:'}{' '}
            <strong>{activeCase?.caseNumber ?? '--'}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 flex-wrap">
            <span>
              {isAr ? 'المريض:' : 'Patient:'}{' '}
              <strong>{(isAr ? activeCase?.patientNameAr : (activeCase?.patientNameEn || activeCase?.patientName)) || activeCase?.patientName || '--'}</strong>
            </span>
            {isCaregiverProxy && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#007B6E] text-white">
                {isAr
                  ? `مرافق مفوض: ${caregiverName || 'مفوض'} (${caregiverRel || 'أسرة'})`
                  : `Proxy: ${caregiverName || 'Caregiver'} (${caregiverRel || 'Family'})`}
              </span>
            )}
          </span>
          <span>
            {isAr ? 'الممرض/ة:' : 'Nurse:'} <strong>{nurseName}</strong>
          </span>
          <span>
            {isAr ? 'المستشفى المرجعي:' : 'Ref Hospital:'}{' '}
            <strong>{referenceHospital}</strong>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleWhatsAppW03}
          disabled={!activeCase?.patientPhone}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-white text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007B6E] focus-visible:ring-offset-2 ${
            activeCase?.patientPhone
              ? 'bg-[#25D366] hover:bg-[#1EBE5D] cursor-pointer'
              : 'bg-gray-400 cursor-not-allowed opacity-60'
          }`}
          aria-label={isAr ? 'طلب فحوصات ناقصة عبر واتساب W03' : 'Request missing scans via WhatsApp W03'}
        >
          <MessageSquare size={16} aria-hidden="true" />
          <span>{isAr ? 'طلب فحوصات W03' : 'Request Scans W03'}</span>
        </button>

        {onLogout && (
          <button
            id="staff-nav-logout-btn"
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title={isAr ? 'تسجيل الخروج' : 'Log Out'}
          >
            <LogOut size={14} />
            <span>{isAr ? 'خروج' : 'Logout'}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default NurseCaseHeader;