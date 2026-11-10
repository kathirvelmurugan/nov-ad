import React from 'react';
import { Clock, CheckCircle2, HelpCircle } from 'lucide-react';
import { HealthcareServiceItem } from '../../data/healthcareServices';

interface Props {
  isAr: boolean;
  ArrowIcon: React.ElementType;
  services: HealthcareServiceItem[];
  selectedServiceId: string;
  onServiceClick: (serviceId: string) => void;
}

export const LandingServicesSection: React.FC<Props> = ({
  isAr,
  ArrowIcon,
  services,
  selectedServiceId,
  onServiceClick,
}) => {
  return (
    <section id="services" className="py-20 bg-slate-50/60 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full inline-block">
            {isAr ? 'الخدمات السريرية المعتمدة' : 'Accredited Clinical Services'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isAr ? 'اختر الخدمة الصحية' : 'Choose a Healthcare Service'}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed font-normal">
            {isAr
              ? 'حدد الخدمة التي تحتاجها للبدء في طلبك الطبي، وسنقوم بتوجيهك للنموذج السريري المخصص لها.'
              : 'Select the service you need to get started with your medical request, connecting directly into our specialized clinical intake flow.'}
          </p>
        </div>

        {/* Six Healthcare Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service) => {
            const IconComp = service.icon;
            const isSelected = selectedServiceId === service.id;

            return (
              <div
                key={service.id}
                onClick={() => onServiceClick(service.id)}
                className={`group relative bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl shadow-emerald-700/10 -translate-y-1'
                    : 'border-slate-200/90 hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/70">
                      {isAr ? service.badgeAr : service.badgeEn}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {isAr ? service.titleAr : service.titleEn}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {isAr ? service.descAr : service.descEn}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50/70 px-3 py-1.5 rounded-xl border border-emerald-200/60">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{isAr ? service.turnaroundAr : service.turnaroundEn}</span>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    {(isAr ? service.featuresAr : service.featuresEn).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onServiceClick(service.id);
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-50 hover:bg-emerald-600 text-slate-800 hover:text-white border border-slate-200/80 hover:border-emerald-600'
                    }`}
                  >
                    <span>
                      {isAr ? `اختيار ${service.titleAr}` : `Select ${service.titleEn}`}
                    </span>
                    <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guidance Note */}
        <div className="mt-12 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {isAr ? 'لست متأكداً من الخدمة المناسبة لحالتك؟' : 'Unsure which service best fits your condition?'}
              </p>
              <p className="text-[11px] text-slate-500">
                {isAr 
                  ? 'فريق التمريض السريري لدينا متواجد لمساعدتك في توجيه ملفك لأفضل مسار ملائم.'
                  : 'Our clinical triage nursing team is available to guide your records to the optimal clinical path.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onServiceClick('second-opinion')}
            className="text-xs font-black text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-4 py-2.5 rounded-xl border border-emerald-200 transition-colors shrink-0 cursor-pointer"
          >
            {isAr ? 'البدء بالاستشارة الشاملة ←' : 'Start Comprehensive Intake →'}
          </button>
        </div>
      </div>
    </section>
  );
};
