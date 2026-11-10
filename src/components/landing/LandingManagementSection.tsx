import React from 'react';
import { FolderHeart, Calendar, FileText, Users } from 'lucide-react';

interface Props {
  isAr: boolean;
  ArrowIcon: React.ElementType;
  onOpenMyCases: () => void;
  onServiceClick: (serviceId: string) => void;
}

export const LandingManagementSection: React.FC<Props> = ({
  isAr,
  ArrowIcon,
  onOpenMyCases,
  onServiceClick,
}) => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full inline-block">
            {isAr ? 'منصة المريض الرقمية' : 'Digital Patient Portal'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isAr ? 'إدارة رعايتك الصحية في مكان واحد' : 'Manage Your Healthcare in One Place'}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed font-normal">
            {isAr
              ? 'تتبع طلباتك، استعرض تقاريرك الطبية، أدر مواعيدك وأكثر عبر ملفك السريري الشخصي.'
              : 'Track your requests, access certified reports, manage telehealth appointments, and coordinate family care.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1: My Cases */}
          <div
            onClick={onOpenMyCases}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all space-y-4 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FolderHeart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {isAr ? 'حالاتي الطبية' : 'My Cases'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {isAr
                  ? 'متابعة مسار الحالة خطوة بخطوة من الفرز حتى استلام التقرير النهائي.'
                  : 'Track live status across all 9 stages from nurse intake to final closure.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <span>{isAr ? 'عرض الحالات النشطة' : 'View Active Cases'}</span>
              <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 2: Appointments */}
          <div
            onClick={() => onServiceClick('video-consultation')}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all space-y-4 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                {isAr ? 'المواعيد والاستشارات' : 'Appointments'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {isAr
                  ? 'جدولة وإدارة جلسات الاستشارة المرئية المباشرة مع الاستشاريين الدوليين.'
                  : 'Schedule and manage live video consultations with international consultants.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-teal-700">
              <span>{isAr ? 'حجز جلسة مرئية' : 'Book Video Session'}</span>
              <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 3: Medical Records */}
          <div
            onClick={() => onServiceClick('second-opinion')}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all space-y-4 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
                {isAr ? 'السجلات والفحوصات' : 'Medical Records'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {isAr
                  ? 'تخزين آمن لصور الأشعة ثلاثية الأبعاد (DICOM) والتقارير الطبية المختومة.'
                  : 'Secure cloud repository for diagnostic scans, echo loops, and stamped PDF reports.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-sky-700">
              <span>{isAr ? 'رفع ملفات جديدة' : 'Upload Diagnostic Files'}</span>
              <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 4: Family Profiles */}
          <div
            onClick={() => onServiceClick('second-opinion')}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all space-y-4 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
                {isAr ? 'الملفات العائلية' : 'Family Profiles'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {isAr
                  ? 'إدارة طلبات الوالدين والأبناء بصفتك وكيلاً شرعياً معتمداً ومخولاً.'
                  : 'Submit and oversee cases for parents and dependents under legal proxy consent.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-amber-700">
              <span>{isAr ? 'إدارة المرافقين' : 'Manage Caregiver Proxy'}</span>
              <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
