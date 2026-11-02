import React from 'react';
import { ClinicalCase } from '../../types';
import { ShieldAlert, UserX, FileCheck, Send } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
}

export const NurseTriageView: React.FC<Props> = ({ activeCase, onAdvanceStage }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2.5 py-1 rounded-full">
            👩‍⚕️ صندوق الفرز وتدقيق الملفات (N01 - Triage Inbox)
          </span>
          <h2 className="text-2xl font-bold text-slate-100 mt-2">
            تدقيق ملف الحالة: <span className="font-mono text-teal-400">{activeCase.caseNumber}</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            الممرضة المسؤولة: نورة الدوسري · مركز الفرز الطبي الموحد
          </p>
        </div>

        <button
          onClick={() => alert(`تم إرسال إشعار W03 إلى جوال المريض لطلب استكمال الأشعة!`)}
          className="flex items-center gap-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/50 text-amber-300 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>طلب مستند ناقص (Send W03 WhatsApp)</span>
        </button>
      </div>

      {/* Audit Checklist & De-identification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: File Audit */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>مطابقة سلامة المستندات الطبية</span>
          </h3>

          <div className="space-y-3">
            {activeCase.files.map((file) => (
              <div
                key={file.id}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-200">{file.name}</p>
                  <p className="text-[10px] text-slate-500">{file.size} · فحص سليم وجاهز للمعاينة</p>
                </div>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                  مكتمل ✓
                </span>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-300">ملاحظة التمريض:</span> تم فحص وضوح مقاطع الرنين والموجات فوق الصوتية، والتقارير مطابقة للمواصفات السريرية.
          </div>
        </div>

        {/* Right: De-identification Engine */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <UserX className="w-4 h-4 text-teal-400" />
            <span>محرك إخفاء الهوية للاستشاري الدولي (De-Identification)</span>
          </h3>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-500">اسم المريض:</span>
              <span className="font-mono text-emerald-400 font-bold">[مخفي تماماً · De-identified]</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-500">العمر والجنس:</span>
              <span className="text-slate-200 font-semibold">{activeCase.age} سنة · {activeCase.gender === 'M' ? 'ذكر' : 'أنثى'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-500">الهوية الوطنية / الجوال:</span>
              <span className="font-mono text-emerald-400 font-bold">[محجوب عن الاستشاري]</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">المدينة والمستشفى:</span>
              <span className="text-slate-200">{activeCase.city}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal">
            تلتزم منصة ألو دكتور بحماية خصوصية المريض وفق معايير الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA).
          </p>
        </div>
      </div>

      {/* Advance Action */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
        <span className="text-xs text-slate-400">
          تم التحقق من كافة الملفات وإعداد الملخص السريري بنجاح.
        </span>

        <button
          onClick={onAdvanceStage}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
        >
          <Send className="w-4 h-4" />
          <span>اعتماد الملف وإرساله للطبيب السعودي (D02)</span>
        </button>
      </div>
    </div>
  );
};
