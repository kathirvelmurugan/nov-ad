import React, { useState } from 'react';
import { ClinicalCase } from '../../types';
import { 
  FileUp, 
  Shield, 
  Stethoscope, 
  Video, 
  FileText, 
  CheckCircle2, 
  UserCheck, 
  Heart, 
  AlertTriangle, 
  Activity, 
  Pill, 
  Check, 
  Eye
} from 'lucide-react';

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
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<string | null>(null);
  const [isCaregiverMode, setIsCaregiverMode] = useState<boolean>(activeCase.caregiver?.isProxy ?? true);
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(true);

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      {/* P01 & P02: Patient Identity Banner */}
      <div className="bg-gradient-to-r from-teal-900/60 via-slate-800 to-slate-900 p-6 rounded-2xl border border-teal-700/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-bold mb-1 text-xs">
            <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded text-[10px] font-mono border border-teal-500/30">P01 · الهوية الوطنية</span>
            <Shield className="w-3.5 h-3.5" />
            <span>طلب رأي طبي ثانٍ معتمد · منصة ألو دكتور</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {activeCase.patientName}
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            الهوية الوطنية / الإقامة: <span className="font-mono text-teal-300 font-bold">{activeCase.nationalIdMasked}</span> · العمر: {activeCase.age} سنة · الجنس: {activeCase.gender === 'M' ? 'ذكر' : 'أنثى'} · {activeCase.city}
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-700 px-4 py-2.5 rounded-xl text-center shrink-0">
          <span className="text-[11px] text-slate-400 block font-mono">P02 · رقم التتبع</span>
          <span className="text-lg font-mono font-black text-teal-400">{activeCase.caseNumber}</span>
        </div>
      </div>

      {/* P03 & P04: Caregiver / Legal Proxy Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded text-[10px] font-mono border border-teal-500/30">P03 · الوكيل الشرعي</span>
            <UserCheck className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-slate-200">تقديم الطلب عبر مرافق / وكيل شرعي مرخص</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCaregiverMode(!isCaregiverMode)}
            className={`text-xs px-3 py-1 rounded-full font-bold transition-all border ${
              isCaregiverMode
                ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {isCaregiverMode ? 'مفعل (مرافق يقدم الطلب)' : 'المريض نفسه'}
          </button>
        </div>

        {isCaregiverMode && (
          <div className="bg-slate-950 border border-teal-900/40 rounded-xl p-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">اسم المرافق / الوكيل:</span>
              <input
                type="text"
                value={activeCase.caregiver?.name || 'فاطمة العتيبي'}
                onChange={(e) => onUpdateCase({
                  caregiver: { ...activeCase.caregiver!, name: e.target.value }
                })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-teal-500 font-semibold"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">صلة القرابة:</span>
              <input
                type="text"
                value={activeCase.caregiver?.relationship || 'ابنة المريض (Daughter)'}
                onChange={(e) => onUpdateCase({
                  caregiver: { ...activeCase.caregiver!, relationship: e.target.value }
                })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">رقم الهوية الوطنية للوكيل:</span>
              <input
                type="text"
                value={activeCase.caregiver?.nationalId || '1098452103'}
                onChange={(e) => onUpdateCase({
                  caregiver: { ...activeCase.caregiver!, nationalId: e.target.value }
                })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-teal-300 outline-none focus:border-teal-500"
              />
            </div>
            <div className="md:col-span-3 flex items-center gap-2 pt-1">
              <span className="text-[10px] text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800 font-mono">P04 · تفويض نظامي</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-slate-300">
                أقر بصفتي وكيلاً شرعياً بامتلاك الصلاحية النظامية لرفع الملف الطبي ومتابعة الاستشارة حسب اشتراطات وزارة الصحة السعودية.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* P05 & P06: Clinical Symptoms & Condition */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded text-[10px] font-mono border border-teal-500/30">P05 · التوصيف السريري</span>
            <Heart className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-bold text-slate-100">التشخيص ووصف الأعراض الحالية</h3>
          </div>
          <span className="text-xs text-teal-400 font-bold bg-teal-950/60 px-2.5 py-1 rounded border border-teal-800">
            {activeCase.specialty}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            التشخيص الأولي المثبت في التقرير:
          </label>
          <input
            type="text"
            value={activeCase.diagnosis}
            onChange={(e) => onUpdateCase({ diagnosis: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-teal-500 outline-none font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            الأعراض وتطور الحالة السريرية:
          </label>
          <textarea
            rows={3}
            value={activeCase.symptoms}
            onChange={(e) => onUpdateCase({ symptoms: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:ring-1 focus:ring-teal-500 outline-none leading-relaxed"
          />
        </div>

        {/* P06: Symptom Severity & Red Flags Checklist */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800 font-mono">P06 · مؤشرات الخطورة</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">العلامات السريرية الحرجة المصاحبة للحالة:</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-900 border border-amber-900/40 p-2 rounded-lg flex items-center gap-1.5 text-amber-300 font-semibold">
              <Check className="w-3.5 h-3.5 text-amber-400" />
              <span>ضيق تنفس جهدي (NYHA III)</span>
            </div>
            <div className="bg-slate-900 border border-amber-900/40 p-2 rounded-lg flex items-center gap-1.5 text-amber-300 font-semibold">
              <Check className="w-3.5 h-3.5 text-amber-400" />
              <span>نوبة إغماء حديثة (Syncope)</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg flex items-center gap-1.5 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>ألم ضاغط في الصدر (Angina)</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg flex items-center gap-1.5 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>تسارع أو خفقان قلبي</span>
            </div>
          </div>
        </div>

        {/* P07 & P08: Diagnostic Scans & Echo Metrics */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded text-[10px] font-mono border border-teal-500/30">P07 · الفحوصات التشخيصية</span>
              <FileUp className="w-4 h-4 text-teal-400" />
              <label className="text-xs font-semibold text-slate-300">
                الملفات المرفوعة (Echo · CINE Loops · DICOM):
              </label>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono font-bold">✓ 3 ملفات مكتملة</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeCase.files.map((file) => (
              <div
                key={file.id}
                onClick={() => setSelectedFileForPreview(file.name)}
                className="bg-slate-950 border border-slate-800 hover:border-teal-600/60 p-3 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileUp className="w-4 h-4 text-teal-400 shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500">{file.size} · {file.type.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-teal-300" />
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>

          {/* P08: Echo Lab Snapshot Metrics */}
          <div className="mt-3 bg-teal-950/30 border border-teal-800/40 p-3 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-teal-300 font-bold">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>P08 · قياسات الإيكو المعتمدة:</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-200">
              <span>مساحة الصمام: <strong className="text-teal-300 font-bold">0.65 cm²</strong></span>
              <span>تدرج الضغط: <strong className="text-teal-300 font-bold">48 mmHg</strong></span>
              <span>سرعة التدفق: <strong className="text-teal-300 font-bold">4.4 m/s</strong></span>
              <span>كفاءة الضخ (LVEF): <strong className="text-emerald-300 font-bold">55%</strong></span>
            </div>
          </div>
        </div>

        {/* P09 & P10: Medications & Allergy Tags */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800 font-mono">P09 · الأدوية والحساسية</span>
              <Pill className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-bold text-slate-200">الأدوية المستخدمة حالياً:</span>
            </div>
            <span className="text-[10px] text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800 font-bold">
              P10 · حساسية: البنسلين (Penicillin Allergy)
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
            <span className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300">Atorvastatin 40mg (مساءً)</span>
            <span className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300">Aspirin 100mg (بعد الغداء)</span>
            <span className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300">Ramipril 5mg (صباحاً)</span>
            <span className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-amber-300">حاصرات بيتا (موقفة مؤقتاً)</span>
          </div>
        </div>

        {/* P11 & P12: Consultation Format & Legal MOH Consent */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              P11 · صيغة الاستشارة المرغوبة:
            </span>
            <div className="flex items-center gap-2">
              <span className="bg-teal-600/30 border border-teal-500 text-teal-300 text-xs px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                <span>اتصال مرئي + تقرير مكتوب (Tier 2 Video)</span>
              </span>
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-[11px] text-slate-300 leading-relaxed">
              <strong className="text-teal-400">P12 · إقرار الخصوصية والمشاركة الطبية:</strong> أوافق على مشاركة ملفاتي الطبية مع منسقي التمريض في منصة ألو دكتور والاستشاري الدولي المعتمد لغرض إعداد الرأي الطبي الثاني، وفقاً لنظام حماية البيانات الصحية في المملكة العربية السعودية.
            </span>
          </label>
        </div>

        {/* P13 & P14: Submission & WhatsApp Trigger Notification */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>P13 · عند الإرسال، سيتم توليد إشعار واتساب التلقائي (Template W01).</span>
          </div>

          <button
            onClick={onAdvanceStage}
            disabled={!privacyAgreed}
            className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:opacity-50 text-white font-extrabold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>P14 · إرسال الملف إلى تمريض الفرز (Submit Case)</span>
            <span>←</span>
          </button>
        </div>
      </div>
    </div>
  );
};
