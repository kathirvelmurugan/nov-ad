import React from 'react';
import { ClinicalCase } from '../../types';
import { FileUp, Shield, Stethoscope, Video, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

export const PatientIntakeView: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900/60 via-slate-800 to-slate-900 p-6 rounded-2xl border border-teal-700/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-bold mb-1 text-sm">
            <Shield className="w-4 h-4" />
            <span>طلب رأي طبي ثانٍ معتمد · منصة ألو دكتور</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {activeCase.patientName}
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            الهوية الوطنية / الإقامة: <span className="font-mono text-teal-300">{activeCase.nationalIdMasked}</span> · المدينة: {activeCase.city}
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-700 px-4 py-2.5 rounded-xl text-center">
          <span className="text-[11px] text-slate-400 block">رقم الحالة المسجل:</span>
          <span className="text-lg font-mono font-black text-teal-400">{activeCase.caseNumber}</span>
        </div>
      </div>

      {/* Main Intake Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
          <Stethoscope className="w-5 h-5 text-teal-400" />
          <span>بيانات الحالة والتشخيص الأولي</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              التخصص الطبي المطلوب:
            </label>
            <input
              type="text"
              value={activeCase.specialty}
              onChange={(e) => onUpdateCase({ specialty: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              صيغة الاستشارة المفضلة:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'video', label: 'اتصال مرئي', icon: <Video className="w-3.5 h-3.5" /> },
                { id: 'written', label: 'تقرير مكتوب', icon: <FileText className="w-3.5 h-3.5" /> },
                { id: 'voice', label: 'مكالمة صوتية', icon: <Stethoscope className="w-3.5 h-3.5" /> },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => onUpdateCase({ consultationType: fmt.id as any })}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold border transition-colors ${
                    activeCase.consultationType === fmt.id
                      ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {fmt.icon}
                  <span>{fmt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            التشخيص الحالي ووصف الأعراض السريرية:
          </label>
          <textarea
            rows={3}
            value={activeCase.symptoms}
            onChange={(e) => onUpdateCase({ symptoms: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:ring-1 focus:ring-teal-500 outline-none leading-relaxed"
          />
        </div>

        {/* Uploaded Diagnostic Files */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            الملفات والأشعة التشخيصية المرفوعة (DICOM / Echo / Reports):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeCase.files.map((file) => (
              <div
                key={file.id}
                className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileUp className="w-4 h-4 text-teal-400 shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500">{file.size} · {file.type.toUpperCase()}</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Stage Advance Action */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onAdvanceStage}
            className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
          >
            <span>إرسال الملف إلى تمريض الفرز (Submit to Nurse)</span>
            <span>←</span>
          </button>
        </div>
      </div>
    </div>
  );
};
