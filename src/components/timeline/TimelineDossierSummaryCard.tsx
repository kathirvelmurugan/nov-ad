import React, { useState } from 'react';
import { FileText, Pill, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { ClinicalCase } from '../../types';

interface TimelineDossierSummaryCardProps {
  activeCase: ClinicalCase;
  isAr: boolean;
}

export const TimelineDossierSummaryCard: React.FC<TimelineDossierSummaryCardProps> = ({
  activeCase,
  isAr,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const meds = activeCase.currentMedications || [];
  const allergies = activeCase.allergies || [];
  const flags = activeCase.redFlags || [];
  const isNkda = !!activeCase.noKnownAllergies;
  const isNoMeds = !!activeCase.noCurrentMedications;

  return (
    <div className="bg-slate-50 dark:bg-alo-darkCard/50 border border-slate-200 dark:border-alo-darkBorder rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
      {/* Header with Accordion Toggle */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
          <FileText className="w-4 h-4 text-alo-teal" />
          <span>{isAr ? 'ملخص ملفك السريري المقدم (Submitted Intake):' : 'Summary of Your Submitted Clinical Intake:'}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded">
            ✓ {isAr ? 'مسجل بنجاح' : 'Registered'}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-1">
          {/* Main 2-column Grid: Diagnosis & Selected Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-2xs">
              <span className="font-bold text-slate-400 block text-[11px] mb-1">
                {isAr ? 'الشكوى السريرية والتشخيص:' : 'Chief Complaint & Diagnosis:'}
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {isAr ? (activeCase.diagnosisAr || activeCase.diagnosis || 'استشارة طبية') : (activeCase.diagnosisEn || activeCase.diagnosis || 'Medical Consultation')}
              </p>
              {activeCase.symptoms && (
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {isAr ? (activeCase.symptomsAr || activeCase.symptoms) : (activeCase.symptomsEn || activeCase.symptoms)}
                </p>
              )}
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-2xs">
              <span className="font-bold text-slate-400 block text-[11px] mb-1">
                {isAr ? 'الطبيب السعودي المعالج المختار:' : 'Selected Saudi Treating Doctor:'}
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {activeCase.treatingDoctor?.name || (isAr ? 'د. فهد الحربي' : 'Dr. Fahad Al-Harbi')}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium">
                {activeCase.treatingDoctor?.hospital || (isAr ? 'المجمع الطبي الشريك' : 'Partner Medical Center')} ({activeCase.treatingDoctor?.city || (isAr ? 'الرياض' : 'Riyadh')})
              </p>
            </div>
          </div>

          {/* Dynamic Intake Badges (Flags, Meds, Allergies) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Red Flags */}
            <div className="p-2.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/30">
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold mb-1.5 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{isAr ? 'علامات الخطورة:' : 'Associated Signs:'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {flags.length > 0 ? (
                  flags.map((f, i) => (
                    <span key={i} className="text-[10px] bg-white dark:bg-slate-900 border border-amber-200 px-2 py-0.5 rounded font-medium text-amber-800 dark:text-amber-200">
                      {f}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400 italic">{isAr ? 'لم تسجل علامات حرجة' : 'None reported'}</span>
                )}
              </div>
            </div>

            {/* Current Medications */}
            <div className="p-2.5 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl border border-teal-200/60 dark:border-teal-900/30">
              <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 font-bold mb-1.5 text-[11px]">
                <Pill className="w-3.5 h-3.5 text-alo-teal" />
                <span>{isAr ? 'الأدوية الحالية:' : 'Current Medications:'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {isNoMeds ? (
                  <span className="text-[10px] bg-white dark:bg-slate-900 border border-teal-200 px-2 py-0.5 rounded font-medium text-slate-600">
                    {isAr ? 'لا توجد أدوية حالية' : 'None'}
                  </span>
                ) : meds.length > 0 ? (
                  meds.map((m, i) => (
                    <span key={i} className="text-[10px] bg-white dark:bg-slate-900 border border-teal-200 px-2 py-0.5 rounded font-medium text-teal-800 dark:text-teal-200">
                      {m}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400 italic">{isAr ? 'لم تسجل أدوية' : 'None recorded'}</span>
                )}
              </div>
            </div>

            {/* Allergies */}
            <div className="p-2.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200/60 dark:border-rose-900/30">
              <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-bold mb-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                <span>{isAr ? 'الحساسية الدوائية:' : 'Drug Allergies:'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {isNkda ? (
                  <span className="text-[10px] bg-white dark:bg-slate-900 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-medium">
                    {isAr ? 'لا توجد حساسية معروفة' : 'NKDA'}
                  </span>
                ) : allergies.length > 0 ? (
                  allergies.map((a, i) => (
                    <span key={i} className="text-[10px] bg-white dark:bg-slate-900 border border-rose-200 px-2 py-0.5 rounded font-medium text-rose-800 dark:text-rose-200">
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400 italic">{isAr ? 'لم تسجل حساسية' : 'None recorded'}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
