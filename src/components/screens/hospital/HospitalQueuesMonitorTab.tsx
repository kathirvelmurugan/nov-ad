import React from 'react';
import { TestTube2, Pill, QrCode, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { TenantHospital, ClinicalCase } from '../../../types';

interface HospitalQueuesMonitorTabProps {
  isRTL: boolean;
  hospital: TenantHospital;
  activeCase?: ClinicalCase;
  onNavigateToDept?: (roleCode: 'L' | 'PH' | 'REC') => void;
}

export const HospitalQueuesMonitorTab: React.FC<HospitalQueuesMonitorTabProps> = ({
  isRTL,
  hospital,
  activeCase,
}) => {
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              <Clock className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {isRTL ? 'مراقبة طوابير الأقسام والخدمات المشتركة' : 'Department Queues & SLA Monitor'}
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {isRTL
              ? `طوابير التشغيل المباشرة في مختبر وصيدلية واستقبال ${hospital.nameAr}.`
              : `Live operational queues for Laboratory, Pharmacy, and Reception at ${hospital.nameEn}.`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lab Queue Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TestTube2 className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {isRTL ? 'طابور المختبر (L01)' : 'Laboratory Queue (L01)'}
                </h3>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                0 Pending
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                {isRTL ? 'لا توجد طلبات مخبرية معلقة حالياً' : 'No pending laboratory orders'}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] font-bold text-slate-400">
              {isRTL ? 'محطة المختبر التشغيلية المعتمدة' : 'Accredited Lab Station'}
            </span>
          </div>
        </div>

        {/* Pharmacy Queue Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {isRTL ? 'طابور الصيدلية (H01)' : 'Pharmacy Queue (H01)'}
                </h3>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                0 Ready
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                {isRTL ? 'لا توجد وصفات دوائية بانتظار الصرف' : 'No prescriptions awaiting dispensing'}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] font-bold text-slate-400">
              {isRTL ? 'محطة الصيدلية السريرية المعتمدة' : 'Accredited Pharmacy Station'}
            </span>
          </div>
        </div>

        {/* Reception Desk Queue Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {isRTL ? 'شباك الاستقبال (REC)' : 'Reception Desk (REC)'}
                </h3>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                0 Arrivals
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                {isRTL ? 'لا توجد مواعيد حضورية مسجلة اليوم' : 'No in-person arrivals queued today'}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] font-bold text-slate-400">
              {isRTL ? 'كاونتر الاستقبال والحضور المعتمد' : 'Accredited Reception Station'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalQueuesMonitorTab;
