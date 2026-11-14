import React from 'react';
import { ShieldCheck, Eye, FileCheck2 } from 'lucide-react';

export interface CaseItem {
  id: string;
  status?: string;
  [key: string]: any;
}

export interface DrillDownOpinionsTabProps {
  caseItem: CaseItem;
  lang: 'ar' | 'en';
  consultantName: string;
  doctorName: string;
  isPdf2Available: boolean;
  onOpenReport: (type: 'pdf1' | 'pdf2') => void;
}

const i18n = {
  ar: {
    specialistOpinionTitle: 'رأي الأخصائي الدولي',
    specialistOpinionSubtitle: 'الهند - استشارة طبية معتمدة',
    specialistOpinionText: 'تمت مراجعة الحالة السريرية وتقديم الرأي الطبي المتخصص بناءً على أحدث البروتوكولات العلاجية والمعايير الدولية المعتمدة.',
    saudiEndorsementTitle: 'مصادقة الطبيب المعالج في المملكة',
    saudiEndorsementSubtitle: 'وزارة الصحة السعودية / الهيئة السعودية للتخصصات الصحية',
    saudiEndorsementText: 'تمت المصادقة على الخطة العلاجية المقترحة من قبل الطبيب المعالج، وتوافقها مع الإجراءات الطبية المعتمدة محلياً لضمان أعلى معايير الرعاية والسلامة للمريض.',
    previewSecondOpinion: 'معاينة الرأي الثاني',
    previewDossier: 'معاينة الملف الشامل',
    certifiedBy: 'معتمد بواسطة:',
  },
  en: {
    specialistOpinionTitle: 'International Specialist Opinion',
    specialistOpinionSubtitle: 'India - Certified Medical Consultation',
    specialistOpinionText: 'The clinical case has been reviewed and a specialized medical opinion provided based on the latest therapeutic protocols and approved international standards.',
    saudiEndorsementTitle: 'Saudi Treating Doctor Endorsement',
    saudiEndorsementSubtitle: 'Ministry of Health / Saudi Commission for Health Specialties',
    saudiEndorsementText: 'The proposed treatment plan has been endorsed by the treating physician, ensuring alignment with locally approved medical procedures to guarantee the highest standards of patient care and safety.',
    previewSecondOpinion: 'Preview Second Opinion',
    previewDossier: 'Preview Comprehensive Dossier',
    certifiedBy: 'Certified by:',
  }
};

const DrillDownOpinionsTab: React.FC<DrillDownOpinionsTabProps> = ({
  caseItem,
  lang,
  consultantName,
  doctorName,
  isPdf2Available,
  onOpenReport,
}) => {
  const t = i18n[lang];
  const isRTL = lang === 'ar';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full h-full flex flex-col gap-6 p-4 md:p-6 font-['Cairo',sans-serif] bg-[#E6FAF7] rounded-xl overflow-y-auto"
    >
      {/* International Specialist Opinion Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-[#00C6AE]/20 p-5 md:p-6 transition-all duration-300 hover:shadow-md">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#007B6E]/10 flex items-center justify-center text-[#007B6E]">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#007B6E] leading-tight">
              {t.specialistOpinionTitle}
            </h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {t.specialistOpinionSubtitle}
            </p>
          </div>
        </div>

        <div className="bg-[#E6FAF7] rounded-xl p-4 border border-[#00C6AE]/10 mb-4">
          <p className={`text-sm md:text-base text-gray-700 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
            {t.specialistOpinionText}
          </p>
        </div>

        <div className={`flex items-center justify-between pt-2 border-t border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t.certifiedBy}
          </span>
          <span className="text-sm font-bold text-[#007B6E] bg-[#007B6E]/5 px-3 py-1 rounded-full">
            {consultantName}
          </span>
        </div>
      </section>

      {/* Saudi Treating Doctor Endorsement Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-[#00C6AE]/20 p-5 md:p-6 transition-all duration-300 hover:shadow-md">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
            <FileCheck2 size={24} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#007B6E] leading-tight">
              {t.saudiEndorsementTitle}
            </h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {t.saudiEndorsementSubtitle}
            </p>
          </div>
        </div>

        <div className="bg-[#E6FAF7] rounded-xl p-4 border border-[#00C6AE]/10 mb-4">
          <p className={`text-sm md:text-base text-gray-700 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
            {t.saudiEndorsementText}
          </p>
        </div>

        <div className={`flex items-center justify-between pt-2 border-t border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t.certifiedBy}
          </span>
          <span className="text-sm font-bold text-[#007B6E] bg-[#007B6E]/5 px-3 py-1 rounded-full">
            {doctorName}
          </span>
        </div>
      </section>

      {/* Action Buttons */}
      <div className={`flex flex-col sm:flex-row gap-3 mt-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <button
          type="button"
          onClick={() => onOpenReport('pdf1')}
          className="flex-1 group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#007B6E] hover:bg-[#00655A] text-white font-bold rounded-xl shadow-lg shadow-[#007B6E]/20 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#00C6AE]/30 active:scale-[0.98]"
          aria-label={t.previewSecondOpinion}
        >
          <Eye size={18} className="transition-transform duration-300 group-hover:scale-110" />
          <span>{t.previewSecondOpinion}</span>
        </button>

        {isPdf2Available && (
          <button
            type="button"
            onClick={() => onOpenReport('pdf2')}
            className="flex-1 group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#E6FAF7] text-[#007B6E] font-bold rounded-xl border-2 border-[#00C6AE] shadow-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#00C6AE]/20 active:scale-[0.98]"
            aria-label={t.previewDossier}
          >
            <FileCheck2 size={18} className="transition-transform duration-300 group-hover:scale-110 text-[#00C6AE]" />
            <span>{t.previewDossier}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DrillDownOpinionsTab;