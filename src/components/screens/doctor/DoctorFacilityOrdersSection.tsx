import React from 'react';
import { Stethoscope } from 'lucide-react';
import { ClinicalCase } from '../../../types';
import { DEFAULT_PARTNER_ORDERS } from '../../../hooks/workflowConstants';

interface Props {
  activeCase: ClinicalCase;
  isAr: boolean;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

export const DoctorFacilityOrdersSection: React.FC<Props> = ({
  activeCase,
  isAr,
  onUpdateCase,
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-teal-200 dark:border-teal-900/40 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-teal-200">
            D08 · {isAr ? 'الفحوصات والوصفات الطبية الداخلية الفورية' : 'Concurrent In-House Facility Orders'}
          </span>
          <Stethoscope className="w-4 h-4 text-alo-teal" />
          <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
            {isAr ? 'أوامر مختبر وصيدلية المجمع الطبي (بالتزامن مع الاستشارة الدولية):' : 'Medical Center In-House Lab & Pharmacy Orders (Concurrent):'}
          </h3>
        </div>
        <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded border border-teal-200">
          {activeCase.treatingDoctor.hospital}
        </span>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        {isAr
          ? '💡 يمكنك إصدار فحوصات تمهيدية أو وصفات مسكنة فورية لمختبر وصيدلية مجمعك الطبي أثناء فترة مراجعة الاستشاري الدولي دون تأخير علاج المريض.'
          : '💡 Trigger immediate baseline lab requisitions or symptomatic prescriptions within your facility while the international consultation is underway.'}
      </p>

      {/* Facility Lab Requisition */}
      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean((activeCase.partnerOrders?.lab?.status && activeCase.partnerOrders.lab.status !== 'pending') || activeCase.internalOrders?.lab?.ordered)}
              onChange={(e) => {
                const checked = e.target.checked;
                onUpdateCase({
                  partnerOrders: {
                    ...(activeCase.partnerOrders || DEFAULT_PARTNER_ORDERS),
                    lab: {
                      test: checked ? 'تحليل تروبونين وفحوصات تمهيدية' : 'None',
                      status: checked ? 'collected' : 'pending'
                    }
                  },
                  internalOrders: {
                    medicalCenterId: 'mc_riyadh_care',
                    medicalCenterName: activeCase.treatingDoctor?.hospital || 'مستشفى رعاية الرياض',
                    lab: {
                      ordered: checked,
                      tests: checked ? ['Troponin-I', 'CBC', 'Renal Function'] : [],
                      status: checked ? 'ordered' : 'none',
                    },
                    pharmacy: activeCase.internalOrders?.pharmacy || {
                      ordered: false,
                      medications: [],
                      status: 'none',
                    },
                    reception: activeCase.internalOrders?.reception || {
                      checkinCode: 'ALO-RC-8812',
                      status: 'scheduled',
                    }
                  }
                });
              }}
              className="rounded text-alo-teal focus:ring-alo-teal w-4 h-4"
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'طلب فحوصات مخبرية تمهيدية داخلية بمختبر المجمع (Facility Lab Requisition)' : 'Order Baseline Labs at Facility Laboratory'}
            </span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {isAr ? 'مختبر المجمع المعتمد' : 'In-House Lab Unit'}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {['تروبونين-I (Troponin)', 'تحليل دم شامل (CBC)', 'وظائف الكلى (Renal)', 'إنزيمات الكبد (LFT)'].map((test) => (
            <span key={test} className="text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-900">
              ✓ {test}
            </span>
          ))}
        </div>
      </div>

      {/* Facility Pharmacy Prescription */}
      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean((activeCase.partnerOrders?.pharmacy?.meds && activeCase.partnerOrders.pharmacy.meds.length > 0) || activeCase.internalOrders?.pharmacy?.ordered)}
              onChange={(e) => {
                const checked = e.target.checked;
                onUpdateCase({
                  partnerOrders: {
                    ...(activeCase.partnerOrders || DEFAULT_PARTNER_ORDERS),
                    pharmacy: {
                      meds: checked ? ['Aspirin 81mg', 'Atorvastatin 40mg', 'Metoprolol 25mg'] : [],
                      substituteAllowed: true,
                      status: checked ? 'ready' : 'pending'
                    }
                  },
                  internalOrders: {
                    medicalCenterId: 'mc_riyadh_care',
                    medicalCenterName: activeCase.treatingDoctor?.hospital || 'مستشفى رعاية الرياض',
                    lab: activeCase.internalOrders?.lab || {
                      ordered: false,
                      tests: [],
                      status: 'none',
                    },
                    pharmacy: {
                      ordered: checked,
                      medications: checked ? ['Aspirin 81mg', 'Atorvastatin 40mg'] : [],
                      status: checked ? 'ordered' : 'none',
                    },
                    reception: activeCase.internalOrders?.reception || {
                      checkinCode: 'ALO-RC-8812',
                      status: 'scheduled',
                    }
                  }
                });
              }}
              className="rounded text-alo-teal focus:ring-alo-teal w-4 h-4"
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'إصدار وصفة أدوية مسكنة / علاجية فورية عبر صيدلية المجمع (Facility Outpatient Pharmacy)' : 'Issue Immediate Symptomatic Rx via Facility Pharmacy'}
            </span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {isAr ? 'صيدلية المجمع المعتمدة' : 'In-House Pharmacy Unit'}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {['أسبرين 81 ملغ (Aspirin)', 'أتورفاستاتين 40 ملغ (Atorvastatin)', 'ميتوبرولول 25 ملغ (Metoprolol)'].map((med) => (
            <span key={med} className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900">
              💊 {med}
            </span>
          ))}
          <span className="text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-900">
            🛡️ {isAr ? 'معتمد نظاماً استبدال البدائل الجنيسة (SFDA Generic Substitution X20)' : 'SFDA Generic Substitution Permitted (X20)'}
          </span>
        </div>
      </div>
    </div>
  );
};
