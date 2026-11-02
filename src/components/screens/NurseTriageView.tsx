import React, { useState } from 'react';
import { ClinicalCase } from '../../types';
import { 
  ShieldAlert, 
  UserX, 
  FileCheck, 
  Send, 
  AlertTriangle, 
  Clock, 
  Stethoscope, 
  CheckCircle2, 
  MessageSquare
} from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
}

export const NurseTriageView: React.FC<Props> = ({ activeCase, onAdvanceStage }) => {
  const [urgencyLevel, setUrgencyLevel] = useState<'routine' | 'urgent' | 'stat'>('urgent');
  const [triageNotes, setTriageNotes] = useState<string>(
    'المريض يعاني من تضيق أبهري شديد متكلس مع أعراض سريرية متقدمة (نوبة إغماء حديثة). الملف مكتمل تشخيصياً ويتضمن تقرير الإيكو وفحوصات القسطرة ومقاطع الرنين CINE. تم إخفاء الهوية الوطنية والاسم وفق الضوابط، وتصنيف الحالة بأولوية عاجلة (24 ساعة SLA).'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      {/* N01: Triage Inbox & Case Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/30">
              N01 · صندوق الفرز والتدقيق
            </span>
            <span className="text-xs font-bold text-teal-400">
              مركز الفرز السريري الموحد · منصة ألو دكتور
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mt-2">
            تدقيق ملف الحالة: <span className="font-mono text-teal-400">{activeCase.caseNumber}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            الممرضة المسؤولة عن الفرز: <span className="text-slate-200 font-semibold">سارة الدوسري (Sara N.)</span> · المستشفى المرجعي: {activeCase.treatingDoctor.hospital}
          </p>
        </div>

        <button
          onClick={() => alert(`تم إرسال إشعار واتساب W03 لاستعجال النواقص!`)}
          className="flex items-center gap-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/50 text-amber-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shrink-0"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>طلب نواقص عبر واتساب (Send W03)</span>
        </button>
      </div>

      {/* N02 & N03: Document Audit & De-Identification Engine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* N02: File Audit */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/20 text-teal-300 font-mono text-[10px] px-2 py-0.5 rounded border border-teal-500/30">
                N02 · تدقيق الفحوصات
              </span>
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">سلامة الفحوصات ومقاطع DICOM</h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">3/3 مستند معتمد</span>
          </div>

          <div className="space-y-2.5">
            {activeCase.files.map((file) => (
              <div
                key={file.id}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-200">{file.name}</p>
                  <p className="text-[10px] text-slate-500">{file.size} · مقطع واضح وبدقة تشخيصية عالية</p>
                </div>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                  مطابق ✓
                </span>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-300">تقرير الممرضة سارة:</span> تم التحقق من سلامة صور إيكو القلب (AVA 0.65 cm², Gradient 48 mmHg). كافة الصور مطابقة للمواصفات السريرية المعتمدة للاستشارة الدولية.
          </div>
        </div>

        {/* N03: De-identification Engine */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/20 text-teal-300 font-mono text-[10px] px-2 py-0.5 rounded border border-teal-500/30">
                N03 · حجب الهوية
              </span>
              <UserX className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-slate-200">إخفاء البيانات الشخصية (De-Identification)</h3>
            </div>
            <span className="text-[10px] text-teal-400 font-mono font-bold">SDAIA Compliant</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-500">الاسم الثلاثي للمريض:</span>
              <span className="font-mono text-emerald-400 font-bold">[مخفي تماماً · De-identified Patient]</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-500">رقم الهوية الوطنية / الإقامة:</span>
              <span className="font-mono text-emerald-400 font-bold">[محجوب عن الاستشاري الدولي]</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
              <span className="text-slate-500">العمر والجنس:</span>
              <span className="text-slate-200 font-semibold">{activeCase.age} سنة · {activeCase.gender === 'M' ? 'ذكر' : 'أنثى'}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">المدينة والمستشفى المعالج:</span>
              <span className="text-slate-200">{activeCase.city} · {activeCase.treatingDoctor.hospital}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal">
            تتم معالجة الملفات الطبية وحجب الهوية تلقائياً وفقاً للائحة حماية البيانات الصحية ومواصفات الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).
          </p>
        </div>
      </div>

      {/* N04 & N05: Red-Flag Urgency Tagger & Nurse Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/30">
              N04 · تصنيف الأولوية
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">درجة الاستعجال ومؤشرات الخطورة السريرية</h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setUrgencyLevel('routine')}
              className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                urgencyLevel === 'routine'
                  ? 'bg-slate-800 border-slate-600 text-slate-200'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              عادي (48 ساعة)
            </button>
            <button
              type="button"
              onClick={() => setUrgencyLevel('urgent')}
              className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                urgencyLevel === 'urgent'
                  ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              عاجل (24 ساعة SLA)
            </button>
            <button
              type="button"
              onClick={() => setUrgencyLevel('stat')}
              className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                urgencyLevel === 'stat'
                  ? 'bg-rose-950 border-rose-500 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              حرج وفوري (STAT)
            </button>
          </div>
        </div>

        {/* N05: Nurse Summary Formulation */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-teal-500/20 text-teal-300 font-mono text-[10px] px-2 py-0.5 rounded border border-teal-500/30">
              N05 · الملخص التمريضي
            </span>
            <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
            <label className="text-xs font-semibold text-slate-300">
              التلخيص السريري الموجه للطبيب السعودي المعالج (د. عبدالله الشمري):
            </label>
          </div>
          <textarea
            rows={3}
            value={triageNotes}
            onChange={(e) => setTriageNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:ring-1 focus:ring-teal-500 outline-none leading-relaxed"
          />
        </div>

        {/* N06 & N07: Assignment and Stage Advance Action */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 font-mono text-[10px] px-2 py-0.5 rounded border border-teal-500/30">
              N06 · الطبيب المعالج
            </span>
            <span>المحال إليه: <strong className="text-teal-400 font-semibold">{activeCase.treatingDoctor.name}</strong> ({activeCase.treatingDoctor.hospital})</span>
          </div>

          <button
            onClick={onAdvanceStage}
            className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-extrabold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Send className="w-4 h-4" />
            <span>N07 · اعتماد الفرز وإرسال الملف للطبيب السعودي (D01)</span>
            <span>←</span>
          </button>
        </div>
      </div>
    </div>
  );
};
