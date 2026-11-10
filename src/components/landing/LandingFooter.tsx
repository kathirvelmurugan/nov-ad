import React from 'react';
import { HeartPulse } from 'lucide-react';

interface Props {
  isAr: boolean;
  onScrollToSection: (id: string) => void;
}

export const LandingFooter: React.FC<Props> = ({ isAr, onScrollToSection }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-wider">
                  ALO DOCTOR
                </span>
                <span className="text-emerald-400 text-xs font-bold block">
                  {isAr ? 'منصة الرأي الطبي الثاني' : 'Saudi Second Medical Opinion'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              {isAr
                ? 'منصة سعودية رائدة تربط المرضى بنخبة الاستشاريين الدوليين والمستشفيات المرجعية المعتمدة، بإشراف أطباء سعوديين وتوافق كامل مع أنظمة وزارة الصحة وسدايا.'
                : 'Premier Saudi telehealth network connecting patients with accredited international specialists and leading tertiary hospitals under Saudi physician oversight.'}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
              <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-emerald-400 font-bold">
                🇸🇦 Kingdom of Saudi Arabia
              </span>
              <span className="text-slate-500">·</span>
              <span>v2.4 Accredited Edition</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {isAr ? 'روابط سريعة' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onScrollToSection('hero')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {isAr ? 'الرئيسية' : 'Home'}
                </button>
              </li>
              <li>
                <button onClick={() => onScrollToSection('services')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {isAr ? 'الخدمات السريرية' : 'Healthcare Services'}
                </button>
              </li>
              <li>
                <button onClick={() => onScrollToSection('how-it-works')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {isAr ? 'كيف يعمل' : 'How It Works'}
                </button>
              </li>
              <li>
                <button onClick={() => onScrollToSection('network')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {isAr ? 'الشبكة المعتمدة' : 'Accredited Network'}
                </button>
              </li>
              <li>
                <button onClick={() => onScrollToSection('faq')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
                </button>
              </li>
            </ul>
          </div>

          {/* Regulatory & Emergency Disclaimers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {isAr ? 'إخلاء المسؤولية الطبية' : 'Clinical Disclaimer'}
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'منصة ألو دكتور مخصصة للاستشارات الطبية المجدولة والآراء السريرية الثانية وليست مخصصة لحالات الطوارئ المهددة للحياة. في حال الطوارئ، يرجى الاتصال فوراً بالهلال الأحمر السعودي (997).'
                : 'ALO DOCTOR is designed for elective second opinions and scheduled consultations. For acute medical emergencies, call the Saudi Red Crescent immediately at 997.'}
            </p>
            <div className="pt-2 text-[10px] text-slate-500 font-mono">
              MOH License: #KSA-TELEHEALTH-2026 · SDAIA Compliant
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 ALO DOCTOR. All rights reserved. Kingdom of Saudi Arabia.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-slate-300 cursor-pointer">{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
            <span>·</span>
            <span className="hover:text-slate-300 cursor-pointer">{isAr ? 'شروط الخدمة' : 'Terms of Service'}</span>
            <span>·</span>
            <span className="hover:text-slate-300 cursor-pointer">{isAr ? 'الدعم والمساعدة' : 'Support'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
