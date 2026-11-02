import React from 'react';
import { ClinicalCase } from '../../types';
import { Globe2, FileText, CheckCircle2, Calendar, Stethoscope } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

export const ConsultantMobileView: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left font-sans" dir="ltr">
      {/* English Consultant Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-xs font-bold text-sky-400 bg-sky-950/60 border border-sky-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
            🌍 International Consultant Portal (K02)
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">
            {activeCase.consultant.name}
          </h2>
          <p className="text-sm text-slate-400">
            {activeCase.consultant.center} · {activeCase.consultant.city}
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-right">
          <span className="text-[11px] text-slate-400 block font-mono">Case Reference:</span>
          <span className="text-lg font-mono font-bold text-sky-400">{activeCase.caseNumber}</span>
        </div>
      </div>

      {/* De-Identified Medical Dossier */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div>
            <span className="text-slate-500">Demographics:</span>{' '}
            <strong className="text-white">{activeCase.age} yrs · {activeCase.gender === 'M' ? 'Male' : 'Female'}</strong>
          </div>
          <div>
            <span className="text-slate-500">Origin:</span>{' '}
            <strong className="text-white">{activeCase.city}</strong>
          </div>
          <div>
            <span className="text-slate-500">Patient Identity:</span>{' '}
            <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-mono text-[10px]">
              Strictly De-Identified ✓
            </span>
          </div>
        </div>

        {/* Diagnosis & Symptoms */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Primary Clinical Findings:
          </h3>
          <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm text-slate-200 leading-relaxed font-cairo">
            {activeCase.diagnosis}
          </p>
        </div>

        {/* The 2 Focus Questions from Saudi Treating Doctor */}
        <div className="space-y-3 bg-sky-950/30 border border-sky-800/50 p-4 rounded-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            <span>2 Direct Clinical Questions from Treating Doctor ({activeCase.treatingDoctor.name})</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-sky-900/40">
              <strong className="text-sky-300">Q1:</strong>{' '}
              <span className="text-slate-200 font-cairo">{activeCase.treatingDoctor.focusQuestions[0]}</span>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-sky-900/40">
              <strong className="text-sky-300">Q2:</strong>{' '}
              <span className="text-slate-200 font-cairo">{activeCase.treatingDoctor.focusQuestions[1]}</span>
            </div>
          </div>
        </div>

        {/* Consultant Medical Opinion Submission */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Structured Medical Second Opinion (English):
          </label>
          <textarea
            rows={5}
            value={activeCase.consultant.opinionEnglish || ''}
            onChange={(e) =>
              onUpdateCase({
                consultant: { ...activeCase.consultant, opinionEnglish: e.target.value },
              })
            }
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-100 focus:ring-1 focus:ring-sky-500 outline-none leading-relaxed font-sans"
            placeholder="Type comprehensive second opinion citing the provided diagnostic scans and addressing both questions..."
          />
        </div>

        {/* Video Telehealth Slot Selection */}
        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Proposed Telehealth Slot:</span>
            <strong className="text-white font-mono">{activeCase.consultant.proposedSlot || 'Tue 5:00 PM KSA / 7:30 PM IST'}</strong>
          </div>
          <span className="text-emerald-400 font-semibold text-[11px]">SLA Verified (&lt; 48h) ✓</span>
        </div>

        {/* Submit Action */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onAdvanceStage}
            className="bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Official Medical Opinion (K08)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
