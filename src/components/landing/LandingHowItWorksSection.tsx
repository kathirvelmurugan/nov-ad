import React from 'react';

interface Props {
  isAr: boolean;
}

export const LandingHowItWorksSection: React.FC<Props> = ({ isAr }) => {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full inline-block">
            {isAr ? 'بساطة وأمان' : 'Streamlined & Secure'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isAr ? 'كيف تعمل منصة ألو دكتور' : 'How ALO DOCTOR Works'}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed font-normal">
            {isAr
              ? 'أربع خطوات متكاملة تبدأ بطلبك وتنتهي باستلام تقرير استشاري معتمد مع رعاية ومتابعة مستمرة.'
              : 'A seamless 4-step clinical pathway ensuring verified diagnosis, expert review, and continuous support.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/70 hover:border-emerald-300 transition-all space-y-4 relative">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-600/30">
                1
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-bold">
                STEP 01
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              {isAr ? '1. اختيار الخدمة' : '1. Choose a Service'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'حدد الخدمة الطبية التي تحتاجها سواءً كانت رأياً ثانياً مكتوباً، استشارة فيديو، أو فحوصات مخبرية.'
                : 'Select the healthcare service you require, from written second opinion to video consultation or labs.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/70 hover:border-emerald-300 transition-all space-y-4 relative">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-600/30">
                2
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-bold">
                STEP 02
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              {isAr ? '2. تعبئة النموذج ورفع التقارير' : '2. Fill Intake Form'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'شارك تفاصيل الأعراض وارفع مقاطع الأشعة والفحوصات، مع تطبيق حجب الهوية الآلي لحماية خصوصيتك.'
                : 'Share symptoms, previous diagnosis, and upload diagnostic imaging with automated PII masking.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/70 hover:border-emerald-300 transition-all space-y-4 relative">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-600/30">
                3
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-bold">
                STEP 03
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              {isAr ? '3. مراجعة الاستشاريين' : '3. Expert Review'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'يتولى التمريض فرز الملف، ويشرف طبيبك السعودي على صياغة الأسئلة التخصصية للمستشار الدولي.'
                : 'ALO triage nurses audit the file, and your Saudi physician frames targeted clinical questions for the consultant.'}
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/70 hover:border-emerald-300 transition-all space-y-4 relative">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-600/30">
                4
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-bold">
                STEP 04
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              {isAr ? '4. استلام الرأي والدعم' : '4. Get Support'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'استلم تقريرك الطبي المعتمد ثنائي اللغة، مع جلسة مرئية ومتابعة سريرية مستمرة لمدة 21 يوماً.'
                : 'Receive your endorsed bilingual report, optional live telehealth session, and 21-day follow-up.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
