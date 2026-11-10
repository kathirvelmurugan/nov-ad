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
  onNavigateToDept,
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
              <span className="text-xs bg-sky-50 text-sky-700 font-bold px-2.5 py-0.5 rounded-full border border-sky-200">
                2 Pending
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>CBC + Lipid Profile</span>
                  <span className="text-amber-600 font-mono">18m left</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {isRTL ? 'المريض: سارة الغامدي' : 'Patient: Sarah Al-Ghamdi'} ({activeCase?.id || 'CASE-901'})
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>HbA1c + Fasting Blood Sugar</span>
                  <span className="text-emerald-600 font-mono">42m left</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {isRTL ? 'المريض: فهد العتيبي' : 'Patient: Fahad Al-Otaibi'} (CASE-884)
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateToDept && onNavigateToDept('L')}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              {isRTL ? 'فتح محطة المختبر (L)' : 'Open Lab Workstation (L)'}
            </button>
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
              <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                1 Ready
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Atorvastatin 20mg + Aspirin</span>
                  <span className="text-emerald-700 font-bold text-[11px] bg-emerald-100 px-2 py-0.5 rounded">
                    Ready for Dispense
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {isRTL ? 'المريض: سارة الغامدي' : 'Patient: Sarah Al-Ghamdi'} ({activeCase?.id || 'CASE-901'})
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateToDept && onNavigateToDept('PH')}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              {isRTL ? 'فتح محطة الصيدلية (PH)' : 'Open Pharmacy Workstation (PH)'}
            </button>
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
              <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                3 Arrivals
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span className="font-mono">Code: RC-8842</span>
                  <span className="text-purple-700 font-bold text-[11px]">Checked-In</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {isRTL ? 'المريض: سارة الغامدي — عيادة القلب' : 'Sarah Al-Ghamdi — Cardiology'}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span className="font-mono">Code: RC-7721</span>
                  <span className="text-amber-600 font-bold text-[11px]">En Route</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {isRTL ? 'المريض: فهد العتيبي — الباطنية' : 'Fahad Al-Otaibi — Internal Med'}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateToDept && onNavigateToDept('REC')}
              className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              {isRTL ? 'فتح كاونتر الاستقبال (REC)' : 'Open Reception Counter (REC)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalQueuesMonitorTab;
