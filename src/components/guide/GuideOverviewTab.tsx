import React from 'react';
import { HeartPulse, ShieldCheck } from 'lucide-react';

interface GuideOverviewTabProps {
  isAr: boolean;
}

export const GuideOverviewTab: React.FC<GuideOverviewTabProps> = ({ isAr }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border border-teal-200 dark:border-teal-800 rounded-xl p-5">
        <h3 className="text-base font-bold text-alo-teal dark:text-alo-aqua mb-2 flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-alo-teal" />
          <span>{isAr ? 'ما هي منصة ALO DOCTOR؟' : 'What is ALO DOCTOR?'}</span>
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {isAr
            ? 'منصة الرأي الطبي الثاني العابرة للحدود (المملكة العربية السعودية 🇸🇦 ⇄ الهند 🇮🇳). تتيح للمرضى في السعودية الحصول على استشارة تخصصية دقيقة من كبار الاستشاريين الدوليين في مستشفيات فورتيس وأبولو، مع إشراف طبي محلي من استشاري سعودي مرخص، وتنسيق الرعاية المنزلية والفحوصات في الرياض وجدة.'
            : 'A cross-border medical second opinion telehealth platform connecting patients in Saudi Arabia (🇸🇦) with top-tier Indian specialists at Apollo and Fortis (🇮🇳). Governed by Saudi treating physicians, the platform features de-identified clinical review, Tap/Tabby payments, WebRTC video consultation, and on-the-ground Saudi partner fulfillment.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-alo-teal flex items-center justify-center font-bold mb-2">
            10
          </div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
            {isAr ? '10 حالات سريرية حقيقية' : '10 Realistic Seed Cases'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isAr
              ? 'حالات جاهزة في جراحة القلب، الأورام، العظام، الأعصاب، والأطفال للتنقل الفوري بينها.'
              : 'Pre-loaded Saudi clinical cases spanning Cardiology, Oncology, Orthopedics, Neurology, and Pediatrics.'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold mb-2">
            11
          </div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
            {isAr ? '11 دوراً بصلاحيات مختلفة' : '11 Interactive Personas'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isAr
              ? 'يمكنك التبديل بنقرة واحدة بين المريض، الممرض، الطبيب السعودي، الاستشاري الهندي، ومختبرات ألفا.'
              : 'Switch instantly between Patient, ALO nurse, Saudi treating doctor, Indian consultant, and partner roles.'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold mb-2">
            9
          </div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
            {isAr ? '9 مراحل سير عمل متكاملة' : '9-Stage Complete Journey'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isAr
              ? 'من التسجيل الأولي وحتى مكالمة الفيديو، التقرير المختوم، محادثة المتابعة 21 يوماً، وإغلاق الملف.'
              : 'From initial intake to WebRTC video call, stamped bilingual PDF, 21-day chat, and final closure.'}
          </p>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-slate-800 dark:text-slate-200">
            {isAr ? 'بيئة تجريبية آمنة ومستقلة لكل مستخدم (Isolated Sandbox)' : 'Isolated Local Storage Sandbox'}
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {isAr
              ? 'كل ما تقوم بتعديله أو إدخاله يُحفظ في متصفحك فقط عبر التخزين المحلي (LocalStorage). لن يؤثر عملك على أي مستخدم آخر، ويمكنك إعادة تعيين المنصة إلى حالتها الأصلية بضغطة زر واحدة (إعادة ضبط).'
              : 'All entries and updates are saved locally in your browser sandbox. Different reviewers can test simultaneously without conflicting with each other. Click "Reset Demo" at any time to return to factory state.'}
          </p>
        </div>
      </div>
    </div>
  );
};
