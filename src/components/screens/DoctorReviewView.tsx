import React from 'react';
import { ClinicalCase } from '../../types';
import { Stethoscope, HelpCircle, Check, Timer } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

export const DoctorReviewView: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
}) => {
  const handleQuestionChange = (index: 0 | 1, value: string) => {
    const currentQuestions = [...activeCase.treatingDoctor.focusQuestions] as [string, string];
    currentQuestions[index] = value;
    onUpdateCase({
      treatingDoctor: {
        ...activeCase.treatingDoctor,
        focusQuestions: currentQuestions,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Doctor Header & SLA Warning */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-400 bg-teal-950/60 border border-teal-800 px-2.5 py-1 rounded-full">
            🩺 بوابة الطبيب السعودي المعالج (D02 - Doctor Review)
          </span>
          <h2 className="text-2xl font-bold text-slate-100 mt-2">
            {activeCase.treatingDoctor.name}
          </h2>
          <p className="text-sm text-slate-400">
            {activeCase.treatingDoctor.hospital} · {activeCase.specialty}
          </p>
        </div>

        {/* 24-Hour SLA Badge */}
        <div className="bg-slate-950 border border-amber-800/80 p-3 rounded-xl flex items-center gap-3">
          <Timer className="w-5 h-5 text-amber-400 animate-spin" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">مهلة المراجعة (SLA X09):</span>
            <span className="text-sm font-mono font-bold text-amber-400">23:42:15 متبقية</span>
          </div>
        </div>
      </div>

      {/* Review Details & Consultant Selection */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-200 mb-2">التشخيص السريري المرفوع:</h3>
          <p className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed">
            {activeCase.diagnosis}
          </p>
        </div>

        {/* Consultant Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            الاستشاري الدولي المستهدف للرأي الثاني:
          </label>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-teal-300 text-sm">{activeCase.consultant.name}</p>
              <p className="text-xs text-slate-400">{activeCase.consultant.center} · {activeCase.consultant.city}</p>
            </div>
            <span className="bg-teal-950 text-teal-400 text-xs px-2.5 py-1 rounded-md border border-teal-800 font-bold">
              معتمد في الشبكة ✓
            </span>
          </div>
        </div>

        {/* 2 Mandatory Focus Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span>الأسئلة السريرية التوجيهية الإلزامية (Mandatory Focus Questions)</span>
            </h3>
            <span className="text-[11px] text-slate-400">يجب تحديد سؤالين دقيقين للاستشاري الدولي</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              السؤال الأول (Question 1):
            </label>
            <textarea
              rows={2}
              value={activeCase.treatingDoctor.focusQuestions[0]}
              onChange={(e) => handleQuestionChange(0, e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-teal-500 outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              السؤال الثاني (Question 2):
            </label>
            <textarea
              rows={2}
              value={activeCase.treatingDoctor.focusQuestions[1]}
              onChange={(e) => handleQuestionChange(1, e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-teal-500 outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Advance Action */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onAdvanceStage}
            className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
          >
            <Check className="w-4 h-4" />
            <span>اعتماد الحالة وإصدار أمر السداد (Approve for Consultant)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
