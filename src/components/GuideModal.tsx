import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Users,
  Layers,
  Zap,
} from 'lucide-react';
import { ClinicalStage } from '../types';
import { GuideOverviewTab } from './guide/GuideOverviewTab';
import { GuideRolesTab } from './guide/GuideRolesTab';
import { GuideStagesTab } from './guide/GuideStagesTab';
import { GuideToolsTab } from './guide/GuideToolsTab';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  onSelectStage?: (stage: ClinicalStage) => void;
  onSelectPersonaCode?: (code: string) => void;
}

export const GuideModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  onSelectStage,
  onSelectPersonaCode,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'stages' | 'tools'>('overview');
  const isAr = lang === 'ar';

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="bg-white dark:bg-alo-darkCard border border-slate-200 dark:border-alo-darkBorder rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-alo-darkCanvas">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-alo-teal flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isAr ? 'دليل تجربة منصة ألو دكتور الشامل' : 'ALO DOCTOR Interactive Walkthrough Guide'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'تعرّف على تدفق المراحل التسع، الأدوار الـ 11، وأدوات الاختبار السريع'
                  : 'Explore 9 clinical stages, 11 roles, and demo tools'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-alo-teal text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isAr ? '1. نظرة عامة' : '1. Overview'}</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'roles'
                ? 'bg-alo-teal text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isAr ? '2. الأدوار الـ 11' : '2. 11 Personas'}</span>
          </button>

          <button
            onClick={() => setActiveTab('stages')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'stages'
                ? 'bg-alo-teal text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? '3. المراحل السريرية الـ 9' : '3. 9 Clinical Stages'}</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'tools'
                ? 'bg-alo-teal text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isAr ? '4. أدوات التجربة السريعة' : '4. Tester Power Tools'}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && <GuideOverviewTab isAr={isAr} />}
          {activeTab === 'roles' && (
            <GuideRolesTab
              isAr={isAr}
              onSelectPersonaCode={onSelectPersonaCode}
              onClose={onClose}
            />
          )}
          {activeTab === 'stages' && (
            <GuideStagesTab
              isAr={isAr}
              onSelectStage={onSelectStage}
              onClose={onClose}
            />
          )}
          {activeTab === 'tools' && <GuideToolsTab isAr={isAr} />}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-alo-darkCanvas border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {isAr ? 'ALO DOCTOR — تجربة سريرية حية v2.4' : 'ALO DOCTOR — Clinical Demo Experience v2.4'}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-alo-teal hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            {isAr ? 'فهمت، ابدأ التجربة' : 'Got it, Start Testing'}
          </button>
        </div>
      </div>
    </div>
  );
};
