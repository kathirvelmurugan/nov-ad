import React from 'react';
import { ClinicalCase } from '../../types';
import { FlaskConical, Pill, Activity, Home, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

export const PartnerServicesView: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-400 bg-teal-950/60 border border-teal-800 px-2.5 py-1 rounded-full">
            🏥 شبكة الشركاء الميدانيين (Partner Services Hub)
          </span>
          <h2 className="text-xl font-bold text-white mt-2">
            أوامر الإحالة والتنفيذ لحالة: <span className="font-mono text-teal-400">{activeCase.caseNumber}</span>
          </h2>
          <p className="text-sm text-slate-400">
            متابعة استيفاء طلبات المختبر، الصيدلية، التمريض المنزلي، والعلاج الطبيعي
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Lab Orders (L01) */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              <span>فحوصات المختبر المطلوبة (Lab Order L01)</span>
            </h3>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-mono">
              {activeCase.partnerOrders.lab.status}
            </span>
          </div>
          <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
            {activeCase.partnerOrders.lab.test}
          </p>
          <button
            onClick={() => {
              onUpdateCase({
                partnerOrders: {
                  ...activeCase.partnerOrders,
                  lab: { ...activeCase.partnerOrders.lab, status: 'completed' },
                },
              });
              alert('تم سحب العينة ورفع النتائج للملف الطبي بنجاح!');
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 rounded-lg transition-colors"
          >
            تحديث: تم سحب العينة واعتماد النتيجة ✓
          </button>
        </div>

        {/* 2. Pharmacy Fulfillment & Generic Substitution (H01, X20) */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Pill className="w-4 h-4 text-sky-400" />
              <span>صرف الوصفة الدوائية (Pharmacy H01)</span>
            </h3>
            <span className="text-[10px] bg-sky-950 text-sky-400 px-2 py-0.5 rounded font-mono">
              {activeCase.partnerOrders.pharmacy.status}
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <span className="text-slate-400 block text-[10px]">الأدوية الموصوفة:</span>
            <ul className="list-disc list-inside text-slate-200 font-mono">
              {activeCase.partnerOrders.pharmacy.meds.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>صلاحية استبدال الدواء بالبديل المكافئ الجنيس (X20): مسموح بها ✓</span>
            </div>
          </div>
          <button
            onClick={() => {
              onUpdateCase({
                partnerOrders: {
                  ...activeCase.partnerOrders,
                  pharmacy: { ...activeCase.partnerOrders.pharmacy, status: 'ready' },
                },
              });
              alert('تم تسعير الوصفة وتجهيز الأدوية للتسليم!');
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 rounded-lg transition-colors"
          >
            تحديث: جاهز للتسليم بصيدلية الشريك ✓
          </button>
        </div>

        {/* 3. Home Nursing Dispatch (V01, W16) */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Home className="w-4 h-4 text-purple-400" />
              <span>التمريض المنزلي (Home Nursing V01)</span>
            </h3>
            <span className="text-[10px] bg-purple-950 text-purple-400 px-2 py-0.5 rounded font-mono">
              {activeCase.partnerOrders.homeNurse.status}
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
            <p className="text-slate-300">منطقة الخدمة: <strong className="text-white">{activeCase.partnerOrders.homeNurse.area}</strong></p>
            <p className="text-slate-400">عدد الزيارات المجدولة: {activeCase.partnerOrders.homeNurse.visits} زيارات تمريضية</p>
          </div>
          <button
            onClick={() => {
              onUpdateCase({
                partnerOrders: {
                  ...activeCase.partnerOrders,
                  homeNurse: { ...activeCase.partnerOrders.homeNurse, status: 'dispatched' },
                },
              });
              alert('تم إرسال الممرضة وإشعار المريض عبر واتساب W16!');
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 rounded-lg transition-colors"
          >
            إرسال الممرضة للمنزل (Trigger W16 WhatsApp)
          </button>
        </div>

        {/* 4. Physiotherapy Rehabilitation (T01) */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              <span>برنامج العلاج الطبيعي والتأهيل (Physio T01)</span>
            </h3>
            <span className="text-[10px] bg-rose-950 text-rose-400 px-2 py-0.5 rounded font-mono">
              {activeCase.partnerOrders.physio.status}
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
            <p className="text-slate-300">خطة التأهيل: <strong className="text-white">{activeCase.partnerOrders.physio.sessions} جلسات علاجية</strong></p>
            <p className="text-slate-400">المركز المعتمد: مركز التأهيل الطبي بمستشفى رعاية الرياض</p>
          </div>
          <button
            onClick={() => {
              onUpdateCase({
                partnerOrders: {
                  ...activeCase.partnerOrders,
                  physio: { ...activeCase.partnerOrders.physio, status: 'in_progress' },
                },
              });
              alert('تم تأكيد الخطة العلاجية وبدء الجلسات التأهيلية!');
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 rounded-lg transition-colors"
          >
            تأكيد وجدولة الجلسات التأهيلية ✓
          </button>
        </div>
      </div>

      {/* Advance Action */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
        <span className="text-xs text-slate-400">
          تم تفعيل خدمات الشركاء وإشعار المريض. يمكن الآن فتح قناة المتابعة الطبية المباشرة (21 يوماً).
        </span>

        <button
          onClick={onAdvanceStage}
          className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>فتح نافذة المتابعة الطبية (21-Day Follow-Up)</span>
        </button>
      </div>
    </div>
  );
};
