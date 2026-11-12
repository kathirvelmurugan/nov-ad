import React from 'react';
import { User, X, FolderHeart, Sparkles, Lock } from 'lucide-react';
import { ClinicalCase } from '../../types';

interface Props {
  isAr: boolean;
  ArrowIcon: React.ElementType;
  activeCase: ClinicalCase;
  isOpen: boolean;
  onClose: () => void;
  onOpenMyCases: () => void;
  onStartCase?: () => void;
  onScrollToSection: (id: string) => void;
  onLogout?: () => void;
}

export const LandingAccountModal: React.FC<Props> = ({
  isAr,
  ArrowIcon,
  activeCase,
  isOpen,
  onClose,
  onOpenMyCases,
  onStartCase,
  onScrollToSection,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 text-slate-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isAr ? 'حساب المريض' : 'Patient Account'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isAr ? 'بوابة المرضى المعتمدة · ألو دكتور' : 'Verified Patient Portal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Logged in patient card */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 p-4 rounded-2xl text-white space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-300">
            <span className="font-mono">{activeCase.caseNumber || (isAr ? 'لا توجد حالات مسجلة' : 'No active cases')}</span>
            <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-400/30">
              {isAr ? 'هوية موثقة' : 'Verified ID'}
            </span>
          </div>
          <p className="text-base font-black">
            {isAr
              ? (activeCase.patientNameAr || activeCase.patientName || 'المريض')
              : (activeCase.patientNameEn || activeCase.patientName || 'Patient')}
          </p>
          {activeCase.nationalIdMasked ? (
            <p className="text-[11px] text-slate-300">
              {isAr ? 'الهوية الوطنية:' : 'National ID:'} <span className="font-mono text-emerald-300">{activeCase.nationalIdMasked}</span> · {isAr ? 'المدينة:' : 'City:'} {isAr ? (activeCase.cityAr || 'الرياض') : (activeCase.cityEn || 'Riyadh')}
            </p>
          ) : (
            <p className="text-[11px] text-slate-300">
              {isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onOpenMyCases();
            }}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-between transition-colors shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FolderHeart className="w-4 h-4" />
              <span>{activeCase.caseNumber ? (isAr ? 'متابعة حالتي النشطة (Live Tracker)' : 'View My Active Case') : (isAr ? 'حالاتي الطبية' : 'My Cases')}</span>
            </div>
            <ArrowIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onClose();
              if (onStartCase) {
                onStartCase();
              } else {
                onScrollToSection('services');
              }
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'بدء طلب خدمة جديدة' : 'Start a New Service Request'}</span>
            </div>
            <ArrowIcon className="w-4 h-4" />
          </button>

          {onLogout && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs flex items-center justify-between transition-colors border border-rose-200 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-600" />
                <span>{isAr ? 'تسجيل الخروج والتحقق برقم جوال آخر (OTP)' : 'Sign Out & Verify with Mobile OTP'}</span>
              </div>
              <ArrowIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Privacy notice in modal */}
        <p className="text-[10px] text-slate-400 text-center leading-normal">
          {isAr
            ? '🔒 يتم تشفير وحماية بياناتك بالكامل وفقاً لنظام حماية البيانات الشخصية والبيانات الصحية بالمملكة العربية السعودية.'
            : '🔒 Your data is fully encrypted under Saudi Personal Data Protection and MOH Health Information Security regulations.'}
        </p>
      </div>
    </div>
  );
};
