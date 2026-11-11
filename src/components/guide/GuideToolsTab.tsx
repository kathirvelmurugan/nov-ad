import React from 'react';
import { Zap, RotateCcw, MessageCircle } from 'lucide-react';

interface GuideToolsTabProps {
  isAr: boolean;
}

export const GuideToolsTab: React.FC<GuideToolsTabProps> = ({ isAr }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tool 1: Auto Fill */}
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-800 dark:text-amber-300 mb-1.5">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{isAr ? '⚡ زر التعبئة السريعة (Auto-Fill)' : '⚡ Auto-Fill Screen'}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {isAr
              ? 'موجود في الشريط العلوي باللون البرتقالي. بنقرة واحدة يقوم بتعبئة كافة الحقول والنماذج في الشاشة الحالية ببيانات سريرية واقعية، حتى لا تضطر للكتابة اليدوية أثناء الاختبار.'
              : 'Located in the top header. In 1 click, it fills all form fields on the current screen with realistic clinical dummy data so testers do not need to type manually.'}
          </p>
        </div>

        {/* Tool 2: Case Rotator */}
        <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/40 dark:bg-teal-950/20">
          <div className="flex items-center gap-2 font-bold text-xs text-alo-teal dark:text-alo-aqua mb-1.5">
            <RotateCcw className="w-4 h-4 text-alo-teal" />
            <span>{isAr ? '🔄 تدوير الحالات (Next Case)' : '🔄 Next Case Rotator'}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {isAr
              ? 'زر تدوير الحالات في الشريط العلوي يتيح لك التنقل السلس بين حالات مرضية سريرية معتمدة بمختلف التخصصات.'
              : 'Cycles through distinct Saudi patient clinical cases across various medical sub-specialties.'}
          </p>
        </div>

        {/* Tool 3: WhatsApp Simulator */}
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300 mb-1.5">
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
            <span>{isAr ? '📱 محاكي رسائل الواتساب (WhatsApp Drawer)' : '📱 WhatsApp Meta Simulator'}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {isAr
              ? 'في أسفل الشاشة على اليمين يظهر إشعار الواتساب التفاعلي عند كل تقدم في المرحلة. يمكنك النقر عليه لفتح درج الرسائل المعتمدة من Meta باللغتين العربية والإنجليزية.'
              : 'Floating pill at the bottom right triggers simulated WhatsApp Meta-approved templates upon stage transitions, showing the exact messages sent to the patient.'}
          </p>
        </div>

        {/* Tool 4: Reset Demo */}
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20">
          <div className="flex items-center gap-2 font-bold text-xs text-rose-800 dark:text-rose-300 mb-1.5">
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>{isAr ? '🔄 إعادة ضبط المنصة (Reset Demo)' : '🔄 Reset Demo Sandbox'}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {isAr
              ? 'الزر الوردي في الشريط العلوي. عند الرغبة في مسح أي بيانات أو تعديلات أجريتها والبدء من جديد، انقر عليه لإعادة ضبط كافة الحالات العشر إلى حالتها الأولية فوراً.'
              : 'Pink button in the top ribbon. If you want to clear your local test data and start fresh, click this to wipe your browser cache and restore seed cases.'}
          </p>
        </div>
      </div>

      {/* URL Deep Link Guide */}
      <div className="bg-slate-100 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">
          {isAr ? '💡 نصيحة للاختبار الجماعي على عدة أجهزة:' : '💡 Multi-Device Testing Tip:'}
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          {isAr
            ? 'يمكنك فتح الرابط على هاتفك المحمول أو إرساله لزملائك الأطباء مباشرة بدون الحاجة لتسجيل دخول أو كلمات مرور. كل جهاز يعمل في مساحة مستقلة تماماً.'
            : 'Open the link on your mobile phone or share it with colleagues—no login or password credentials are required. Each device runs in its own private sandbox.'}
        </p>
        <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-[11px] text-alo-teal select-all text-center">
          https://ad.howtostart.in
        </div>
      </div>
    </div>
  );
};
