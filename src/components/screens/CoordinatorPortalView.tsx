import React, { useState } from 'react';
import { ClinicalCase } from '../../types';
import { 
  CheckCircle2, 
  Send, 
  CreditCard, 
  Clock, 
  FileText, 
  ShieldCheck, 
  MessageSquare, 
  HelpCircle,
  Stethoscope,
  Receipt,
  Zap,
  ArrowRight
} from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  lang?: 'ar' | 'en';
}

export const CoordinatorPortalView: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';
  const [linkDispatched, setLinkDispatched] = useState<boolean>(activeCase.pricing?.paid ?? false);
  const [dispatchAlert, setDispatchAlert] = useState<string | null>(null);

  const baseSar = activeCase.pricing?.baseSar || 2500;
  const vatRate = 0.15;
  const vatAmount = baseSar * vatRate;
  const totalSar = baseSar + vatAmount;
  const tabbyMonthly = totalSar / 4;

  const handleDispatchPaymentLink = () => {
    setLinkDispatched(true);
    const msg = isAr 
      ? `تم توليد فاتورة ZATCA وإرسال رابط السداد الآمن (تابي / مدى) لرقم المريض عبر واتساب!`
      : `ZATCA compliant payment link (Mada / Tabby) dispatched to patient via WhatsApp!`;
    setDispatchAlert(msg);
  };

  const handleSimulatePatientPayment = () => {
    onUpdateCase({
      pricing: {
        ...activeCase.pricing,
        paid: true,
        invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        tapChargeId: `chg_tap_ksa_${Math.floor(100000 + Math.random() * 900000)}`,
      }
    });
  };

  const handleForwardToConsultant = () => {
    onAdvanceStage();
  };

  const questions = isAr 
    ? activeCase.treatingDoctor.focusQuestions
    : (activeCase.treatingDoctor.focusQuestionsEn || activeCase.treatingDoctor.focusQuestions);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* C01: Coordinator Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-6 rounded-2xl border border-teal-800/60 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 font-bold mb-1.5 text-xs text-teal-300">
            <span className="bg-teal-500/20 text-teal-200 px-2 py-0.5 rounded text-[10px] font-mono border border-teal-500/30">
              C01 · {isAr ? 'منسق رعاية ألو' : 'ALO Care Coordinator'}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>{isAr ? 'مركز اعتماد الإحالات والفوترة الطبية (Master Map 1/2)' : 'Clinical Referral & Billing Gateway'}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {isAr ? 'مراجعة وتنسيق إحالة الحالة:' : 'Coordinate Referral for:'}{' '}
            <span className="text-teal-300 font-mono">{activeCase.caseNumber}</span>
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            {isAr ? 'المريض:' : 'Patient:'}{' '}
            <strong className="text-white">{isAr ? activeCase.patientNameAr : (activeCase.patientNameEn || activeCase.patientName)}</strong> · {isAr ? 'الطبيب السعودي المحيل:' : 'Referring Saudi Doctor:'}{' '}
            <strong className="text-teal-300">{activeCase.treatingDoctor.name}</strong> ({activeCase.treatingDoctor.hospital})
          </p>
        </div>

        <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl text-center shrink-0">
          <span className="text-[11px] text-teal-200 block font-mono">
            {isAr ? 'حالة السداد' : 'Payment Status'}
          </span>
          <span className={`text-sm font-mono font-black ${activeCase.pricing?.paid ? 'text-emerald-300' : 'text-amber-300'}`}>
            {activeCase.pricing?.paid 
              ? (isAr ? '✓ تم السداد بنجاح' : '✓ Paid & Confirmed')
              : (isAr ? '⏳ بانتظار سداد المريض' : '⏳ Awaiting Payment')}
          </span>
        </div>
      </div>

      {dispatchAlert && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{dispatchAlert}</span>
          </div>
          <button 
            onClick={() => setDispatchAlert(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* C02: Referral Dossier Review */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selected Specialist & Doctor Questions */}
        <div className="card-clinical p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-teal-200">
                C02 · {isAr ? 'الاستشاري الموصى به' : 'Target Consultant'}
              </span>
              <Stethoscope className="w-4 h-4 text-alo-teal" />
              <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
                {isAr ? 'اختيار الطبيب المعالج' : 'Saudi Doctor Selection'}
              </h3>
            </div>
            <span className="text-[10px] text-alo-teal bg-alo-mint px-2 py-0.5 rounded font-bold border border-teal-200">
              {isAr ? 'معتمد' : 'Accredited'}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">{isAr ? 'الاستشاري الدولي:' : 'International Specialist:'}</span>
              <strong className="text-alo-teal font-bold">{activeCase.consultant.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isAr ? 'المركز الطبي الدولي:' : 'Medical Center:'}</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{activeCase.consultant.center} · {activeCase.consultant.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isAr ? 'التشخيص المعتمد:' : 'Clinical Diagnosis:'}</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{isAr ? (activeCase.diagnosisAr || activeCase.diagnosis) : (activeCase.diagnosisEn || activeCase.diagnosis)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{isAr ? 'الأسئلة التوجيهية الثلاثة الموجهة للاستشاري (D07):' : '3 Focus Questions Framed by Doctor:'}</span>
            </h4>
            <div className="space-y-1.5 text-xs">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-alo-teal mr-1">Q{idx + 1}:</span> {q}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* C03: Service Fee Confirmation Card */}
        <div className="card-clinical p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-800 font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-amber-200">
                  C03 · {isAr ? 'تسعير الباقة' : 'Pricing Confirmation'}
                </span>
                <Receipt className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
                  {isAr ? 'تفاصيل فاتورة الرأي الطبي (ZATCA)' : 'Second Opinion Service Fee'}
                </h3>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold border border-emerald-200">
                15% VAT
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs mt-3">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{isAr ? 'باقة الرأي الثاني (Tier 2 Video + Report):' : 'Second Opinion Tier 2 Package:'}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{baseSar.toLocaleString()} SAR</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{isAr ? 'ضريبة القيمة المضافة (15% VAT):' : 'Value Added Tax (15%):'}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{vatAmount.toFixed(2)} SAR</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-white">
                <span>{isAr ? 'الإجمالي المستحق على المريض:' : 'Total Patient Payable:'}</span>
                <span className="text-base text-alo-teal font-mono">{totalSar.toLocaleString()} SAR</span>
              </div>

              {/* Tabby Installment Callout */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-200 font-semibold">
                <span>{isAr ? 'خيارات تابي (4 دفعات شهرية بدون فوائد):' : 'Tabby Split (4 Interest-Free Payments):'}</span>
                <span className="font-mono font-bold">{tabbyMonthly.toFixed(2)} SAR / {isAr ? 'شهر' : 'mo'}</span>
              </div>
            </div>
          </div>

          {/* Action Dispatch Buttons */}
          <div className="space-y-2 pt-2">
            {!activeCase.pricing?.paid ? (
              <>
                <button
                  type="button"
                  onClick={handleDispatchPaymentLink}
                  className="w-full bg-gradient-to-r from-alo-teal to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-extrabold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isAr 
                      ? 'C04 · توليد وإرسال رابط السداد للمريض عبر واتساب (Send Link)' 
                      : 'C04 · Dispatch ZATCA Payment Link to Patient via WhatsApp'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSimulatePatientPayment}
                  className="w-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border border-amber-300 text-amber-800 dark:text-amber-200 font-bold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isAr ? '⚡ محاكاة دفع المريض الفوري (Simulate Instant Payment)' : '⚡ Simulate Instant Patient Payment'}</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-center text-xs text-emerald-800 font-bold">
                  ✓ {isAr ? 'تم استلام وتأكيد السداد (رقم الفاتورة: ' : 'Payment Confirmed (Invoice: '} {activeCase.pricing?.invoiceNumber || 'INV-2026-9021'})
                </div>

                <button
                  type="button"
                  onClick={handleForwardToConsultant}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs active:scale-95 cursor-pointer"
                >
                  <span>
                    {isAr 
                      ? 'C05 · إحالة الملف للاستشاري الدولي وبدء عداد 48 ساعة (Forward to Consultant)' 
                      : 'C05 · Forward Case to International Consultant (Start 48h SLA)'}
                  </span>
                  <span>{isAr ? '←' : '→'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorPortalView;
