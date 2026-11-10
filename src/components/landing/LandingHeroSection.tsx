import React from 'react';
import {
  ShieldCheck,
  Stethoscope,
  Clock,
  Sparkles,
  CheckCircle2,
  Award,
  Lock,
} from 'lucide-react';

interface Props {
  isAr: boolean;
  ArrowIcon: React.ElementType;
  onStartCase?: () => void;
  onScrollToSection: (id: string) => void;
}

export const LandingHeroSection: React.FC<Props> = ({
  isAr,
  ArrowIcon,
  onStartCase,
  onScrollToSection,
}) => {
  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-teal-50/20 to-white py-16 lg:py-24">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Content Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/90 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {isAr
                  ? '🇸🇦 المنصة السعودية للرأي الطبي الثاني والاستشارات الدولية'
                  : '🇸🇦 Accredited Saudi Second Medical Opinion & Telehealth'}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {isAr ? (
                <>
                  صحتك. <span className="text-emerald-700">قرارات أفضل.</span>
                </>
              ) : (
                <>
                  Your Health. <span className="text-emerald-700">Better Decisions.</span>
                </>
              )}
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed font-normal">
              {isAr
                ? 'آراء طبية من نخبة الخبراء، أطباء موثوقون، ورعاية صحية متكاملة — تبدأ جميعها بطلب بسيط.'
                : 'Expert medical opinions, trusted doctors and healthcare support — all starting with a simple request.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onStartCase ? onStartCase : () => onScrollToSection('services')}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-700 hover:to-teal-900 text-white font-black text-base shadow-lg shadow-emerald-700/25 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
              >
                <span>{isAr ? 'ابدأ طلبك السريري' : 'Start Your Case'}</span>
                <ArrowIcon className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onScrollToSection('how-it-works')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'كيف تعمل المنصة' : 'How It Works'}</span>
              </button>
            </div>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 font-semibold border-t border-slate-200/70">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? 'حماية بيانات معتمدة (سدايا)' : 'SDAIA Compliant Privacy'}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? 'إشراف أطباء سعوديين معتمدين' : 'Saudi Physician Oversight'}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? 'تقرير موثق خلال 24-48 ساعة' : '24-48h Certified Report'}</span>
              </div>
            </div>
          </div>

          {/* Right Visual Card Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_12px_40px_rgba(15,35,60,0.08)] border border-slate-100 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-900">
                        {isAr ? 'د. عبدالله الشمري' : 'Dr. Abdullah Al-Shammari'}
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        {isAr ? 'استشاري أمراض القلب · مستشفى رعاية الرياض' : 'Senior Cardiologist · Riyadh Care'}
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-100/70 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-300/60">
                    {isAr ? 'طبيب سعودي معتمد' : 'Verified MD'}
                  </span>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-2xl p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">
                      {isAr ? 'ملف الاستشارة الطبية المباشرة' : 'Clinical Second Opinion Case'}
                    </span>
                    <span className="font-mono text-emerald-700 font-extrabold text-[11px]">
                      ALO-2026-LIVE
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">{isAr ? 'التخصص الطبي:' : 'Specialty:'}</span>
                      <span className="font-bold text-slate-800">
                        {isAr ? 'أمراض القلب وجراحة الصمامات' : 'Cardiology & Valvular Care'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">{isAr ? 'الاستشاري الدولي:' : 'Consultant:'}</span>
                      <span className="font-bold text-slate-800">Dr. Arjun Mehta (KIMS / Apollo)</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400">{isAr ? 'حالة التقرير:' : 'Status:'}</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{isAr ? 'جاهز للاعتماد' : 'Ready for Endorsement'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'تقرير ثنائي اللغة معتمد' : 'Certified Bilingual Report'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 font-medium font-mono text-[10px]">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>SDAIA / MOH / ZATCA</span>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 bg-white rounded-2xl p-3.5 shadow-lg border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">
                    {isAr ? '99.4% نسبة الدقة والتوافق' : '99.4% Diagnostic Concordance'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {isAr ? 'مستندة لمعايير الجودة العالمية' : 'Benchmarked by Top Centers'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
