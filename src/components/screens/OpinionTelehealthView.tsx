import React, { useState } from 'react';
import { ClinicalCase } from '../../types';
import { Video, FileText, CheckCircle2, ShieldCheck, Download, Users, Mic, MicOff } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

export const OpinionTelehealthView: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'call'>('report');
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Tabs */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-400 bg-teal-950/60 border border-teal-800 px-2.5 py-1 rounded-full">
            📑 المرحلة 6: التقرير الطبي المعتمد والاتصال المرئي (Opinion & Report)
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            ملف الرأي الطبي الثاني: <span className="font-mono text-teal-400">{activeCase.caseNumber}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'report'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>التقرير المعتمد (Bilingual PDF)</span>
          </button>

          <button
            onClick={() => setActiveTab('call')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'call'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>محاكي الاتصال المرئي الثلاثي (3-Party Call)</span>
          </button>
        </div>
      </div>

      {activeTab === 'call' ? (
        /* 3-Party Telehealth Call Simulator */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Users className="w-4 h-4 text-teal-400" />
              <span>الغرفة الافتراضية للاتصال الطبي المشترك (P23 - Telehealth Studio)</span>
            </div>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
              مباشر · Live Encrypted
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 1. Indian Consultant */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center aspect-video relative overflow-hidden group">
              <div className="w-12 h-12 rounded-full bg-sky-900/60 border border-sky-500/50 flex items-center justify-center text-xl mb-1">
                👨‍⚕️
              </div>
              <p className="text-xs font-bold text-white font-sans">{activeCase.consultant.name}</p>
              <p className="text-[10px] text-sky-400 font-sans">Cardiac Consultant (India)</p>
              <span className="absolute bottom-2 right-2 text-[9px] bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-400">
                English
              </span>
            </div>

            {/* 2. Saudi Treating Doctor */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center aspect-video relative overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-teal-900/60 border border-teal-500/50 flex items-center justify-center text-xl mb-1">
                👨‍⚕️
              </div>
              <p className="text-xs font-bold text-white">{activeCase.treatingDoctor.name}</p>
              <p className="text-[10px] text-teal-400">{activeCase.treatingDoctor.hospital}</p>
              <span className="absolute bottom-2 right-2 text-[9px] bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-400">
                عربي / EN
              </span>
            </div>

            {/* 3. Patient */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center aspect-video relative overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-amber-900/60 border border-amber-500/50 flex items-center justify-center text-xl mb-1">
                👨‍💼
              </div>
              <p className="text-xs font-bold text-white">{activeCase.patientName}</p>
              <p className="text-[10px] text-amber-400">المريض (الرياض)</p>
              <span className="absolute bottom-2 right-2 text-[9px] bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-400">
                عربي
              </span>
            </div>

            {/* 4. Nurse Noura (Live Interpreter) */}
            <div className="bg-slate-950 border border-emerald-800/80 rounded-xl p-3 flex flex-col items-center justify-center text-center aspect-video relative overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-500/50 flex items-center justify-center text-xl mb-1">
                👩‍⚕️
              </div>
              <p className="text-xs font-bold text-white">نورة الدوسري</p>
              <p className="text-[10px] text-emerald-400">مترجمة طبية حية (عربي ↔ إنجليزي)</p>
              <span className="absolute bottom-2 right-2 text-[9px] bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300 font-bold">
                ترجمة فورية
              </span>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full border transition-colors ${
                isMuted ? 'bg-red-950 text-red-400 border-red-800' : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-5 py-2 rounded-xl text-xs"
            >
              الانتقال إلى التقرير المعتمد النهائي
            </button>
          </div>
        </div>
      ) : (
        /* Official Stamped Bilingual PDF Report View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="bg-white text-slate-950 rounded-2xl p-6 sm:p-8 shadow-2xl border-4 border-slate-200 space-y-6">
            {/* Letterhead */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div className="text-right">
                <h1 className="text-2xl font-black tracking-tight text-teal-800">ألو دكتور · ALO DOCTOR</h1>
                <p className="text-xs font-semibold text-slate-600">منصة الاستشارات الطبية الدولية المعتمدة · المملكة العربية السعودية</p>
              </div>

              <div className="text-center bg-slate-100 p-2 rounded-lg border border-slate-300">
                <span className="text-[10px] text-slate-500 block font-mono">OFFICIAL SEAL</span>
                <span className="text-xs font-bold text-teal-900 font-mono">ALO-SA-CERTIFIED</span>
              </div>
            </div>

            {/* Case & Patient Meta Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">رقم الملف المعتمد:</span>
                <strong className="font-mono text-teal-900">{activeCase.caseNumber}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">المريض:</span>
                <strong className="text-slate-900">{activeCase.patientName} ({activeCase.age} سنة)</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">الطبيب السعودي المعالج:</span>
                <strong className="text-slate-900">{activeCase.treatingDoctor.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">الاستشاري الدولي:</span>
                <strong className="text-slate-900 font-sans">{activeCase.consultant.name}</strong>
              </div>
            </div>

            {/* Two Column Side-by-Side: Arabic Certified Translation & English Opinion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Arabic Translation Column (RTL) */}
              <div className="space-y-3 text-right" dir="rtl">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="text-xs font-black text-teal-900 uppercase">
                    الرأي الطبي المعتمد (الترجمة العربية الرسمية)
                  </h4>
                  <span className="text-[10px] bg-teal-100 text-teal-900 px-2 py-0.5 rounded font-bold">
                    ترجمة معتمدة ✓
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-cairo">
                  {activeCase.consultant.opinionArabic ||
                    'بناءً على تخطيط صدى القلب والتصوير المقطعي، تأكد وجود تضيق أبهري كلسي شديد بمساحة صمام 0.7 سم² وتدرج ضغط متوسط 46 ملم زئبق. بالنظر لعمر المريض (58 سنة) ونسبة خطورة جراحية منخفضة (2.1%)، فإن الاستبدال الجراحي (SAVR) هو الخيار الأمثل مقارنة بالقسطرة لتحقيق كفاءة طويلة الأمد.'}
                </p>
              </div>

              {/* English Consultant Opinion Column (LTR) */}
              <div className="space-y-3 text-left font-sans" dir="ltr">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="text-xs font-black text-sky-950 uppercase">
                    Official Consultant Second Opinion (English Original)
                  </h4>
                  <span className="text-[10px] bg-sky-100 text-sky-900 px-2 py-0.5 rounded font-bold font-mono">
                    KIMS HYDERABAD ✓
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {activeCase.consultant.opinionEnglish ||
                    'Based on high-resolution Echo and Cardiac CT, severe calcific aortic stenosis with valve area 0.7 cm² and mean gradient 46 mmHg is confirmed. Given patient age 58 and low surgical STS score of 2.1%, Surgical Aortic Valve Replacement (SAVR) with a mechanical or bioprosthetic valve provides superior long-term durability over TAVR.'}
                </p>
              </div>
            </div>

            {/* Bottom Signature & Stamp Area */}
            <div className="pt-4 border-t-2 border-slate-900 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">اعتماد منسقة الحالة:</p>
                <p className="text-[11px] text-slate-600">سارة القحطاني · قسم الترجمة والتقارير الطبية المعتمدة</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-16 h-16 border-2 border-teal-800 rounded-full flex flex-col items-center justify-center text-[8px] font-black text-teal-900 rotate-[-12deg] bg-teal-50/50">
                  <span>ALO DOCTOR</span>
                  <span>معتمد رسمياً</span>
                  <span>OCT 2026</span>
                </div>

                <button
                  onClick={() => alert(`جاري تصدير وتحميل ملف PDF المعتمد لحالة ${activeCase.caseNumber}`)}
                  className="bg-slate-950 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 text-xs shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل التقرير PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Advance Action to Partner Referrals */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              صدر التقرير المعتمد وتم تسليمه للمريض. يمكن الآن إصدار الإحالات الطبية للشركاء (D10).
            </span>

            <button
              onClick={onAdvanceStage}
              className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>إصدار أوامر الخدمات والشركاء (Partner Services)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
