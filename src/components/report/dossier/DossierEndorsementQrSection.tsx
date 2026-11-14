import React from 'react';

interface DossierEndorsementQrSectionProps {
  caseItem: any;
  lang: 'ar' | 'en';
  doctorName: string;
}

const i18n = {
  ar: {
    endorsementTitle: 'تصديق الطبيب المعالج',
    endorsementBody: 'أُقر أنا، الطبيب المعالج المسؤول عن هذه الحالة، بأن المعلومات الطبية الواردة في هذا الملف دقيقة ومطابقة للمعايير السريرية المعتمدة. تم إعداد هذا التقرير وفقاً للوائح وزارة الصحة السعودية (MOH) وهيئة التخصصات الصحية السعودية (SCFHS).',
    verificationLabel: 'ختم التحقق الرقمي الرسمي',
    qrPlaceholder: 'امسح الرمز للتحقق من صحة المستند',
    securityWatermark: 'وثيقة رقمية مؤمنة - نظام ALO DOCTOR',
    mohRef: 'المرجع التنظيمي: MOH/SCFHS',
    scfhsId: 'رقم التسجيل المهني موثق رقمياً',
    issuedBy: 'جهة الإصدار: المنصة الطبية المعتمدة',
  },
  en: {
    endorsementTitle: 'Treating Doctor Endorsement',
    endorsementBody: 'I, the treating physician responsible for this case, hereby certify that the medical information contained within this dossier is accurate and complies with approved clinical standards. This report has been generated in accordance with the regulations of the Saudi Ministry of Health (MOH) and the Saudi Commission for Health Specialties (SCFHS).',
    verificationLabel: 'Official Digital Verification Seal',
    qrPlaceholder: 'Scan code to verify document authenticity',
    securityWatermark: 'Secured Digital Document - ALO DOCTOR System',
    mohRef: 'Regulatory Reference: MOH/SCFHS',
    scfhsId: 'Professional Registration Digitally Verified',
    issuedBy: 'Issuing Authority: Certified Medical Platform',
  }
};

const DossierEndorsementQrSection: React.FC<DossierEndorsementQrSectionProps> = ({ caseItem, lang, doctorName }) => {
  const isRtl = lang === 'ar';
  const t = i18n[lang];
  const dir = isRtl ? 'rtl' : 'ltr';
  
  const caseId = caseItem?.id || caseItem?.caseId || 'ALO-REF-000000';
  const timestamp = new Date().toISOString().split('T')[0];

  return (
    <section
      dir={dir}
      lang={lang}
      className="relative w-full overflow-hidden rounded-xl border-2 border-[#007B6E] bg-white p-6 shadow-sm print:border-[#007B6E] print:shadow-none print:p-4 print:break-inside-avoid"
      style={{ fontFamily: isRtl ? 'Cairo, sans-serif' : 'system-ui, -apple-system, sans-serif' }}
      aria-label={t.endorsementTitle}
    >
      {/* Security Watermark Background */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] print:opacity-[0.05]"
        aria-hidden="true"
      >
        <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${isRtl ? '-rotate-12' : 'rotate-12'}`}>
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#007B6E" fontSize="48" fontWeight="900" fontFamily="Cairo, sans-serif">
            {t.securityWatermark}
          </text>
          <circle cx="300" cy="300" r="280" stroke="#007B6E" strokeWidth="4" strokeDasharray="20 10" />
          <path d="M300 50 L320 100 L370 100 L330 130 L345 180 L300 150 L255 180 L270 130 L230 100 L280 100 Z" fill="#007B6E" />
        </svg>
      </div>

      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#007B6E] via-[#00C6AE] to-[#25D366] print:bg-[#007B6E]" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        
        {/* Left/Main Content: Endorsement Statement */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6FAF7] text-[#007B6E] print:bg-transparent print:border print:border-[#007B6E]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.306-3.497 4.49 4.49 0 013.498-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#007B6E] print:text-lg">
              {t.endorsementTitle}
            </h3>
          </div>

          <p className="text-base leading-relaxed text-gray-800 print:text-sm print:text-black">
            {t.endorsementBody}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-[#E6FAF7] p-3 print:bg-transparent print:border print:border-gray-200">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#007B6E]">
                {t.mohRef}
              </span>
              <span className="mt-1 block text-sm font-medium text-gray-900">
                {caseId}
              </span>
            </div>
            <div className="rounded-lg bg-[#E6FAF7] p-3 print:bg-transparent print:border print:border-gray-200">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#007B6E]">
                {t.issuedBy}
              </span>
              <span className="mt-1 block text-sm font-medium text-gray-900">
                {timestamp}
              </span>
            </div>
          </div>
        </div>

        {/* Right/Side Content: QR Code & Digital Seal */}
        <div className={`flex flex-col items-center gap-4 ${isRtl ? 'lg:border-l lg:pl-6' : 'lg:border-l lg:pl-6'} border-gray-200 print:border-gray-300`}>
          <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-[#00C6AE] bg-white p-4 shadow-inner print:border-solid print:border-[#007B6E] print:shadow-none">
            <span className="mb-2 text-xs font-bold uppercase tracking-widest text-[#007B6E]">
              {t.verificationLabel}
            </span>
            
            {/* QR Code Placeholder / SVG Icon */}
            <div className="relative flex h-32 w-32 items-center justify-center rounded-lg bg-[#E6FAF7] p-2 print:h-24 print:w-24 print:bg-white print:border print:border-black">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-full w-full text-[#007B6E] print:text-black" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h3.75v3.75h-3.75v-3.75z" />
              </svg>
              
              {/* Official ALO Stamp Overlay */}
              <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md print:bg-[#007B6E] print:shadow-none print:border print:border-black">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <span className="mt-3 max-w-[160px] text-center text-[10px] font-medium leading-tight text-gray-500 print:text-black print:text-[9px]">
              {t.qrPlaceholder}
            </span>
          </div>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#00C6AE] print:text-[#007B6E]">
              {t.scfhsId}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Security Bar */}
      <div className="mt-6 flex items-center justify-between border-t border-dashed border-gray-200 pt-4 print:border-gray-400 print:pt-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#25D366] print:animate-none print:bg-[#007B6E]" aria-hidden="true" />
          <span className="text-xs font-semibold text-gray-500 print:text-black">
            {t.securityWatermark}
          </span>
        </div>
        <div className="text-xs font-mono text-gray-400 print:text-black">
          v2.4 SA
        </div>
      </div>
    </section>
  );
};

export default DossierEndorsementQrSection;