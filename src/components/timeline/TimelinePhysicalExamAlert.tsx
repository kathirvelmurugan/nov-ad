import React from 'react';
import { Stethoscope } from 'lucide-react';
import { ClinicalCase } from '../../types';

interface TimelinePhysicalExamAlertProps {
  activeCase: ClinicalCase;
  isAr: boolean;
}

export const TimelinePhysicalExamAlert: React.FC<TimelinePhysicalExamAlertProps> = ({
  activeCase,
  isAr,
}) => {
  if (!activeCase.inPersonExamRequired) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-100/30 dark:from-amber-950/40 dark:to-amber-900/20 border-2 border-amber-400 dark:border-amber-700/80 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
            <Stethoscope className="w-5 h-5" />
          </span>
          <div>
            <h4 className="text-sm font-black text-amber-950 dark:text-amber-200">
              {isAr ? '🏥 يلزم فحص سريري حضوري بالمجمع الطبي' : '🏥 Medical Center In-Person Exam Required'}
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold mt-0.5">
              {isAr ? 'قرار الطبيب السعودي المعالج (ينطبق على الاستشارة المكتوبة والمرئية)' : 'Treating Physician Order (Applies to both Written & Video)'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black font-mono bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700">
          {activeCase.internalOrders?.reception?.checkinCode || 'ALO-RC-8812'}
        </span>
      </div>

      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
        {isAr
          ? `قرر طبيبك المعالج (${activeCase.treatingDoctor.name} - ${activeCase.treatingDoctor.hospital}) ضرورة الحضور لإجراء الفحص البدني السريري: ${activeCase.inPersonExamReason || 'تقييم العلامات الحيوية والمدى الحركي وموضع الألم'}. تم حجز مقعدك بالاستقبال.`
          : `Your treating physician (${activeCase.treatingDoctor.name} at ${activeCase.treatingDoctor.hospital}) requires a hands-on physical exam: ${activeCase.inPersonExamReason || 'Assessment of vitals, ROM, and palpation'}. Reception slot booked.`}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-amber-200 dark:border-amber-800/60">
        <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
          📅 {isAr ? 'الموعد المحدد:' : 'Slot:'} <span className="font-mono">{activeCase.inPersonAppointmentSlot || (isAr ? 'غداً - 10:30 صباحاً' : 'Tomorrow - 10:30 AM')}</span>
        </div>
        <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800">
          ✓ {isAr ? 'مسار الرأي الدولي مستمر بالتوازي' : 'Parallel to International Review'}
        </span>
      </div>
    </div>
  );
};
