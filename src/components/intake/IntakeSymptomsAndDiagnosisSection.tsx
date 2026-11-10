import React from 'react';
import { Heart, AlertTriangle, Check, Pill, FileText, Video } from 'lucide-react';
import { ClinicalCase } from '../../types';

interface Props {
  activeCase: ClinicalCase;
  isAr: boolean;
  privacyAgreed: boolean;
  setPrivacyAgreed: (val: boolean) => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

export const IntakeSymptomsAndDiagnosisSection: React.FC<Props> = ({
  activeCase,
  isAr,
  privacyAgreed,
  setPrivacyAgreed,
  onUpdateCase,
}) => {
  return (
    <>
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="bg-alo-mint text-alo-teal px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-teal-200">
            P05 · {isAr ? 'التوصيف السريري' : 'Clinical Diagnosis'}
          </span>
          <Heart className="w-4 h-4 text-alo-teal" />
          <h3 className="text-base font-extrabold text-alo-navy dark:text-slate-100">
            {isAr ? 'التشخيص ووصف الأعراض الحالية' : 'Diagnosis & Clinical Symptoms'}
          </h3>
        </div>
        <span className="text-xs text-alo-teal font-bold bg-alo-mint px-3 py-1 rounded-lg border border-teal-200">
          {isAr ? (activeCase.specialtyAr || activeCase.specialty) : (activeCase.specialtyEn || activeCase.specialty)}
        </span>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          {isAr ? 'التشخيص الطبي الحالي:' : 'Confirmed Medical Diagnosis:'}
        </label>
        <input
          type="text"
          value={isAr ? (activeCase.diagnosisAr || activeCase.diagnosis) : (activeCase.diagnosisEn || activeCase.diagnosis)}
          onChange={(e) => onUpdateCase(isAr ? { diagnosisAr: e.target.value, diagnosis: e.target.value } : { diagnosisEn: e.target.value, diagnosis: e.target.value })}
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-alo-teal outline-none font-bold shadow-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          {isAr ? 'الأعراض والشكوى السريرية الحالية:' : 'Symptoms & Patient History:'}
        </label>
        <textarea
          rows={3}
          value={isAr ? (activeCase.symptomsAr || activeCase.symptoms) : (activeCase.symptomsEn || activeCase.symptoms)}
          onChange={(e) => onUpdateCase(isAr ? { symptomsAr: e.target.value, symptoms: e.target.value } : { symptomsEn: e.target.value, symptoms: e.target.value })}
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-alo-teal outline-none leading-relaxed shadow-sm font-medium"
        />
      </div>

      {/* P06: Symptom Severity & Red Flags Checklist */}
      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-xl space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-mono font-bold">
            P06 · {isAr ? 'مؤشرات الخطورة' : 'Red-Flag Tags'}
          </span>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {isAr ? 'العلامات السريرية الحرجة المصاحبة للحالة:' : 'Critical Associated Clinical Signs:'}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="bg-white dark:bg-slate-900 border border-amber-300 p-2 rounded-lg flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold shadow-sm">
            <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{isAr ? 'ضيق تنفس جهدي (NYHA III)' : 'Exertional Dyspnea (NYHA III)'}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-amber-300 p-2 rounded-lg flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold shadow-sm">
            <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{isAr ? 'نوبة إغماء حديثة (Syncope)' : 'Recent Syncope Episode'}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg flex items-center gap-1.5 text-slate-700 dark:text-slate-300 shadow-sm">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{isAr ? 'ألم ضاغط في الصدر (Angina)' : 'Exertional Angina'}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg flex items-center gap-1.5 text-slate-700 dark:text-slate-300 shadow-sm">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{isAr ? 'تسارع خفقان القلب' : 'Palpitations'}</span>
          </div>
        </div>
      </div>

      {/* P09 & P10: Medications & Allergy Tags */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-alo-teal bg-alo-mint px-2 py-0.5 rounded font-mono font-bold">
              P09 · {isAr ? 'الأدوية الحالية' : 'Current Medications'}
            </span>
            <Pill className="w-3.5 h-3.5 text-alo-teal" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'الأدوية الموصوفة للمريض:' : 'Patient Prescriptions:'}
            </span>
          </div>
          <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 px-2 py-0.5 rounded font-bold">
            P10 · {isAr ? 'حساسية: البنسلين' : 'Allergy: Penicillin (Rash)'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
          <span className="medical-term bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded text-slate-800 dark:text-slate-200 font-semibold shadow-sm">
            Atorvastatin 40mg (OD)
          </span>
          <span className="medical-term bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded text-slate-800 dark:text-slate-200 font-semibold shadow-sm">
            Aspirin 100mg (OD)
          </span>
          <span className="medical-term bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded text-slate-800 dark:text-slate-200 font-semibold shadow-sm">
            Ramipril 5mg (OD)
          </span>
          <span className="medical-term bg-amber-50 border border-amber-300 px-2.5 py-1 rounded text-amber-800 font-semibold">
            {isAr ? 'حاصرات بيتا (موقفة)' : 'Beta-blockers (Held)'}
          </span>
        </div>
      </div>

      {/* P11 & P12: Consultation Format & Legal MOH Consent */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            P11 · {isAr ? 'صيغة الاستشارة المرغوبة:' : 'Consultation Format:'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onUpdateCase({ consultationType: 'written' })}
              className={`text-xs px-3 py-1 rounded-lg font-extrabold flex items-center gap-1.5 shadow-sm border transition-colors ${
                activeCase.consultationType === 'written'
                  ? 'bg-alo-mint border-teal-300 text-alo-teal'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isAr ? 'رأي مكتوب فقط' : 'Written opinion only'}</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateCase({ consultationType: 'video' })}
              className={`text-xs px-3 py-1 rounded-lg font-extrabold flex items-center gap-1.5 shadow-sm border transition-colors ${
                activeCase.consultationType === 'video'
                  ? 'bg-alo-mint border-teal-300 text-alo-teal'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>{isAr ? 'مرئي + رأي مكتوب' : 'Video + written opinion'}</span>
            </button>
          </div>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <input
            type="checkbox"
            checked={privacyAgreed}
            onChange={(e) => setPrivacyAgreed(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-alo-teal focus:ring-alo-teal"
          />
          <span className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            <strong className="text-alo-teal font-extrabold">
              P12 · {isAr ? 'إقرار الخصوصية والمشاركة الطبية:' : 'MOH Health Data Privacy Consent:'}
            </strong>{' '}
            {isAr
              ? 'أوافق على مشاركة ملفاتي الطبية مع منسقي التمريض في منصة ألو دكتور والاستشاري الدولي المعتمد لغرض إعداد الرأي الطبي الثاني، وفقاً لنظام حماية البيانات الصحية في المملكة العربية السعودية.'
              : 'I consent to sharing diagnostic records with ALO DOCTOR triage nurses and the accredited international consultant for the second opinion evaluation in compliance with Saudi Health Information Privacy Law.'}
          </span>
        </label>
      </div>
    </>
  );
};
