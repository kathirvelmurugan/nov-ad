import React from 'react';
import { PERSONAS } from '../data/personas';
import { Persona, ClinicalCase } from '../types';
import { RefreshCw, Zap, CheckCircle2, ShieldCheck, HeartPulse } from 'lucide-react';

interface Props {
  activePersona: Persona;
  onSelectPersona: (p: Persona) => void;
  activeCase: ClinicalCase;
  onNextCase: () => void;
  onSelectCase: (caseId: string) => void;
  cases: ClinicalCase[];
  onAutoFill: () => void;
}

export const TopProfileSwitcher: React.FC<Props> = ({
  activePersona,
  onSelectPersona,
  activeCase,
  onNextCase,
  onSelectCase,
  cases,
  onAutoFill,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Utility Ribbon: Case Selector + Auto-Fill + Status */}
      <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-teal-400 font-bold tracking-wide">
            <HeartPulse className="w-4 h-4 text-teal-400 animate-pulse" />
            <span className="text-sm">ALO DOCTOR</span>
            <span className="bg-teal-950 text-teal-300 text-[10px] px-2 py-0.5 rounded-full border border-teal-800">
              v2.4 Saudi Edition
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Active Case Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">الحالة النشطة (Case):</span>
            <select
              value={activeCase.id}
              onChange={(e) => onSelectCase(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-100 rounded px-2.5 py-1 font-medium focus:ring-1 focus:ring-teal-500 outline-none text-xs"
            >
              {cases.map((c, i) => (
                <option key={c.id} value={c.id}>
                  #{i + 1} {c.caseNumber} - {c.patientName} ({c.specialty.split('(')[0]})
                </option>
              ))}
            </select>

            <button
              onClick={onNextCase}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded border border-slate-700 transition-colors"
              title="تدوير الحالة التالية (Next Case)"
            >
              <RefreshCw className="w-3 h-3 text-teal-400" />
              <span>تدوير الحالة (Next)</span>
            </button>
          </div>
        </div>

        {/* Magic Auto-Fill + Current Stage Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onAutoFill}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold px-3 py-1 rounded-md shadow-sm transition-all text-xs"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            <span>⚡ تعبئة تلقائية سريعة (Auto-Fill Screen)</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              {activeCase.currentStage}
            </span>
          </div>
        </div>
      </div>

      {/* Main Persona Switcher Bar: 11 Clickable Roles */}
      <div className="px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap px-1 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>تبديل الدور (11 Roles):</span>
        </span>

        {PERSONAS.map((persona) => {
          const isActive = activePersona.code === persona.code;
          return (
            <button
              key={persona.code}
              onClick={() => onSelectPersona(persona)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40 ring-2 ring-teal-400/50 scale-105'
                  : 'bg-slate-800/90 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              <span>{persona.avatar}</span>
              <span>{persona.badge}</span>
              {isActive && <CheckCircle2 className="w-3 h-3 text-white ml-0.5" />}
            </button>
          );
        })}
      </div>
    </header>
  );
};
