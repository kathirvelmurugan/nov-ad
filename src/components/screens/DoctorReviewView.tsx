import React from 'react';
import { ClinicalCase } from '../../types';
import { Stethoscope, HelpCircle, Check, Timer, UserCheck } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  lang?: 'ar' | 'en';
}

export const DoctorReviewView: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';

  const handleQuestionChange = (index: 0 | 1 | 2, value: string) => {
    const currentQuestions = [...activeCase.treatingDoctor.focusQuestions] as [string, string, string];
    currentQuestions[index] = value;
    onUpdateCase({
      treatingDoctor: {
        ...activeCase.treatingDoctor,
        focusQuestions: currentQuestions,
      },
    });
  };

  const questions = isAr 
    ? activeCase.treatingDoctor.focusQuestions
    : (activeCase.treatingDoctor.focusQuestionsEn || activeCase.treatingDoctor.focusQuestions);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Doctor Header & SLA Warning */}
      <div className="card-clinical p-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-alo-teal">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-teal-200">
              D01 · {isAr ? 'الطبيب المعالج' : 'Treating Physician'}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {isAr ? 'المستشفى الشريك:' : 'Partner Hospital:'} {activeCase.treatingDoctor.hospital}
            </span>
          </div>
          <h2 className="text-2xl font-black text-alo-navy dark:text-slate-100 mt-1">
            {isAr ? activeCase.treatingDoctor.name : 'Dr. Abdullah Al-Shammari, MD'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr ? (activeCase.specialtyAr || activeCase.specialty) : (activeCase.specialtyEn || activeCase.specialty)} · {activeCase.treatingDoctor.city}
          </p>
        </div>

        {/* 24-Hour SLA Badge */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 p-3 rounded-xl flex items-center gap-3 shadow-sm">
          <Timer className="w-5 h-5 text-amber-600 animate-pulse shrink-0" />
          <div>
            <span className="text-[10px] text-amber-800 dark:text-amber-300 block font-bold">
              {isAr ? 'مهلة المراجعة السريرية (SLA X09):' : 'Clinical SLA Review Window:'}
            </span>
            <span className="text-xs font-mono font-black text-amber-900 dark:text-amber-200">
              23:42:15 {isAr ? 'متبقية' : 'Remaining'}
            </span>
          </div>
        </div>
      </div>

      {/* Review Details & Consultant Selection */}
      <div className="card-clinical p-6 space-y-6">
        <div>
          <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100 mb-2">
            {isAr ? 'التشخيص السريري المرفوع من التمريض:' : 'Clinical Diagnosis from Triage:'}
          </h3>
          <p className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
            {isAr ? (activeCase.diagnosisAr || activeCase.diagnosis) : (activeCase.diagnosisEn || activeCase.diagnosis)}
          </p>
        </div>

        {/* Consultant Selector Card */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {isAr ? 'الاستشاري الدولي المستهدف للرأي الثاني:' : 'Target International Specialist:'}
          </label>
          <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👨‍⚕️</span>
              <div>
                <p className="font-extrabold text-alo-teal text-sm">{activeCase.consultant.name}</p>
                <p className="text-xs text-slate-500 font-medium">{activeCase.consultant.center} · {activeCase.consultant.city}</p>
              </div>
            </div>
            <span className="bg-alo-mint text-alo-teal text-xs px-2.5 py-1 rounded-md border border-teal-200 font-extrabold">
              ✓ {isAr ? 'معتمد في الشبكة' : 'Network Accredited'}
            </span>
          </div>
        </div>

        {/* 3 Mandatory Focus Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                D07 · {isAr ? 'الأسئلة التوجيهية' : '3 Focus Questions'}
              </span>
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
                {isAr ? 'الأسئلة السريرية التوجيهية الإلزامية (3 Focus Questions):' : 'Mandatory Clinical Directives for International Specialist:'}
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              {isAr ? 'يجب صياغة 3 أسئلة دقيقة' : '3 precise clinical questions'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isAr ? 'السؤال الأول (Question 1 - قرار التدخل TAVR أم SAVR):' : 'Question 1 (Intervention: TAVR vs. SAVR):'}
            </label>
            <textarea
              rows={2}
              value={questions[0]}
              onChange={(e) => handleQuestionChange(0, e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-alo-teal outline-none leading-relaxed shadow-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isAr ? 'السؤال الثاني (Question 2 - تقييم الشريان التاجي والحاجة لتداخل):' : 'Question 2 (Coronary CAD & Revascularization):'}
            </label>
            <textarea
              rows={2}
              value={questions[1]}
              onChange={(e) => handleQuestionChange(1, e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-alo-teal outline-none leading-relaxed shadow-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isAr ? 'السؤال الثالث (Question 3 - بروتوكول التخثر والتأهيل):' : 'Question 3 (Antithrombotic Protocol & Follow-Up):'}
            </label>
            <textarea
              rows={2}
              value={questions[2]}
              onChange={(e) => handleQuestionChange(2, e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-alo-teal outline-none leading-relaxed shadow-sm font-medium"
            />
          </div>
        </div>

        {/* Advance Action */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onAdvanceStage}
            className="w-full sm:w-auto bg-gradient-to-r from-alo-teal to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-extrabold py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isAr ? 'D10 · اعتماد التوجيهات وإصدار رابط السداد (P19)' : 'Approve & Issue Payment Invoice (P19)'}</span>
            <span>{isAr ? '←' : '→'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
