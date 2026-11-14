import React, { useMemo } from 'react';

interface PartnerFacilityTransferCardProps {
  activeCase: any;
  lang: 'ar' | 'en';
  onConfirmTransfer?: () => void;
}

const PartnerFacilityTransferCard: React.FC<PartnerFacilityTransferCardProps> = ({
  activeCase,
  lang,
  onConfirmTransfer,
}) => {
  const isRtl = lang === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  const copy = useMemo(() => ({
    ar: {
      facilityLabel: 'المنشأة الصحية الشريكة',
      departmentLabel: 'القسم المحوّل إليه',
      checkInTitle: 'تسجيل الدخول في الاستقبال',
      voucherLabel: 'رمز القسيمة',
      scanInstruction: 'امسح رمز الاستجابة السريعة عند الوصول لتسجيل الدخول تلقائياً.',
      prepTitle: 'تعليمات التحضير للقبول السريري',
      prepStep1: 'يرجى إحضار بطاقة الهوية الوطنية أو الإقامة سارية المفعول.',
      prepStep2: 'تأكد من الصيام لمدة لا تقل عن 8 ساعات إذا كان الإجراء يتطلب تخديراً.',
      prepStep3: 'أحضر جميع التقارير الطبية والأشعة السابقة ذات الصلة بالحالة.',
      prepStep4: 'يُرجى الوصول قبل الموعد المحدد بـ 30 دقيقة لإتمام إجراءات التسجيل.',
      confirmBtn: 'تأكيد التحويل',
      noData: 'لا توجد بيانات تحويل متاحة حالياً.',
    },
    en: {
      facilityLabel: 'Partner Healthcare Facility',
      departmentLabel: 'Referred Department',
      checkInTitle: 'Reception Check-In',
      voucherLabel: 'Voucher Code',
      scanInstruction: 'Scan the QR code upon arrival for automated check-in.',
      prepTitle: 'Clinical Admission Preparation Instructions',
      prepStep1: 'Please bring a valid National ID or Iqama.',
      prepStep2: 'Ensure fasting for at least 8 hours if the procedure requires anesthesia.',
      prepStep3: 'Bring all previous medical reports and imaging related to the case.',
      prepStep4: 'Please arrive 30 minutes prior to the scheduled time to complete registration.',
      confirmBtn: 'Confirm Transfer',
      noData: 'No transfer data currently available.',
    },
  }), []);

  const t = copy[lang];

  if (!activeCase) {
    return (
      <div
        dir={dir}
        className="w-full max-w-2xl mx-auto p-6 rounded-2xl bg-[#E6FAF7] dark:bg-gray-800 border border-[#00C6AE]/30 dark:border-[#007B6E]/50 text-center font-cairo"
      >
        <p className="text-[#007B6E] dark:text-[#00C6AE] text-lg font-semibold">
          {t.noData}
        </p>
      </div>
    );
  }

  const facilityName = activeCase.facilityName || activeCase.partnerHospital || '';
  const department = activeCase.department || activeCase.targetDepartment || '';
  const voucherCode = activeCase.voucherCode || activeCase.referralCode || 'N/A';
  const qrPayload = activeCase.qrPayload || `ALO-V2.4-${voucherCode}`;

  return (
    <div
      dir={dir}
      className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-xl bg-white dark:bg-gray-900 border border-[#00C6AE]/20 dark:border-[#007B6E]/40 font-cairo transition-colors duration-300"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#007B6E] to-[#00C6AE] p-6 text-white">
        <h2 className="text-2xl font-bold mb-4 tracking-wide">
          {t.checkInTitle}
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Facility Badge */}
          <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <span className="block text-xs uppercase tracking-widest text-white/80 mb-1 font-semibold">
              {t.facilityLabel}
            </span>
            <span className="block text-lg font-bold leading-snug">
              {facilityName}
            </span>
          </div>

          {/* Department Badge */}
          <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <span className="block text-xs uppercase tracking-widest text-white/80 mb-1 font-semibold">
              {t.departmentLabel}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#25D366] text-white text-sm font-bold shadow-sm">
              {department}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-8">
        
        {/* QR & Voucher Section */}
        <section aria-label="Check-in Credentials" className="flex flex-col md:flex-row items-center justify-between gap-8 p-6 rounded-2xl bg-[#E6FAF7] dark:bg-gray-800/60 border border-[#00C6AE]/20 dark:border-[#007B6E]/30">
          
          {/* Simulated QR Code */}
          <div className="flex flex-col items-center gap-3">
            <div 
              className="w-40 h-40 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-inner border-2 border-[#007B6E] dark:border-[#00C6AE] flex items-center justify-center relative overflow-hidden"
              aria-label="QR Code"
            >
              {/* SVG QR Placeholder Pattern */}
              <svg viewBox="0 0 100 100" className="w-full h-full opacity-90">
                <rect x="10" y="10" width="25" height="25" fill="#007B6E" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="18" y="18" width="9" height="9" fill="#007B6E" />
                
                <rect x="65" y="10" width="25" height="25" fill="#007B6E" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="73" y="18" width="9" height="9" fill="#007B6E" />
                
                <rect x="10" y="65" width="25" height="25" fill="#007B6E" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="18" y="73" width="9" height="9" fill="#007B6E" />
                
                <rect x="40" y="10" width="8" height="8" fill="#00C6AE" />
                <rect x="52" y="10" width="8" height="8" fill="#007B6E" />
                <rect x="40" y="22" width="8" height="8" fill="#007B6E" />
                <rect x="40" y="40" width="20" height="20" fill="#007B6E" />
                <rect x="45" y="45" width="10" height="10" fill="white" />
                <rect x="65" y="45" width="8" height="8" fill="#00C6AE" />
                <rect x="77" y="45" width="8" height="8" fill="#007B6E" />
                <rect x="65" y="65" width="20" height="20" fill="#007B6E" />
                <rect x="40" y="70" width="8" height="8" fill="#00C6AE" />
                <rect x="52" y="80" width="8" height="8" fill="#007B6E" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>
            <p className="text-sm text-[#007B6E] dark:text-[#00C6AE] font-medium text-center max-w-[200px]">
              {t.scanInstruction}
            </p>
          </div>

          {/* Voucher Details */}
          <div className={`flex-1 flex flex-col ${isRtl ? 'items-start md:items-end' : 'items-start'} gap-4 w-full`}>
            <div className="w-full">
              <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                {t.voucherLabel}
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  readOnly
                  value={voucherCode}
                  dir="ltr"
                  className="w-full text-2xl font-mono font-bold tracking-[0.2em] text-center py-4 px-6 rounded-xl bg-white dark:bg-gray-900 border-2 border-[#007B6E] dark:border-[#00C6AE] text-[#007B6E] dark:text-[#00C6AE] focus:outline-none focus:ring-4 focus:ring-[#00C6AE]/20 transition-all"
                  aria-label={t.voucherLabel}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                ALO DOCTOR v2.4 Secure Link
              </span>
            </div>
          </div>
        </section>

        {/* Clinical Admission Preparation Instructions */}
        <section aria-label="Preparation Instructions" className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E6FAF7] dark:bg-[#007B6E]/20 text-[#007B6E] dark:text-[#00C6AE]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </span>
            {t.prepTitle}
          </h3>
          
          <ul className="space-y-3">
            {[t.prepStep1, t.prepStep2, t.prepStep3, t.prepStep4].map((instruction, index) => (
              <li 
                key={`prep-step-${index}`}
                className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 hover:border-[#00C6AE]/40 dark:hover:border-[#007B6E]/40 transition-colors"
              >
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#007B6E] text-white text-sm font-bold shadow-sm">
                  {index + 1}
                </span>
                <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed pt-0.5 font-medium">
                  {instruction}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Action Footer */}
        {onConfirmTransfer && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onConfirmTransfer}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] text-white font-bold text-lg shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/40 transition-all duration-200 flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
              aria-label={t.confirmBtn}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.confirmBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerFacilityTransferCard;