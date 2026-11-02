import React, { useState } from 'react';
import { ClinicalCase } from '../../types';
import { CreditCard, CheckCircle2, ShieldCheck, Receipt, ArrowRight } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

export const PaymentCheckoutView: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'mada' | 'applepay' | 'visa'>('mada');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onUpdateCase({
        pricing: {
          ...activeCase.pricing,
          paid: true,
          invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        },
      });
      setIsProcessing(false);
      onAdvanceStage();
    }, 700);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Invoice Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <Receipt className="w-5 h-5" />
            <span>فاتورة ضريبية معتمدة (ZATCA Tax Invoice)</span>
          </div>
          <span className="text-xs bg-slate-950 px-3 py-1 rounded-full text-slate-400 font-mono">
            {activeCase.caseNumber}
          </span>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>استشارة الرأي الطبي الثاني ({activeCase.specialty.split('(')[0]}):</span>
            <span className="font-mono">{activeCase.pricing.baseSar.toLocaleString()} ر.س</span>
          </div>

          <div className="flex justify-between text-slate-400 text-xs">
            <span>ضريبة القيمة المضافة (15% VAT):</span>
            <span className="font-mono">{activeCase.pricing.vatSar.toLocaleString()} ر.س</span>
          </div>

          <div className="flex justify-between text-base font-extrabold text-white pt-3 border-t border-slate-800">
            <span>المبلغ الإجمالي المستحق:</span>
            <span className="font-mono text-teal-400 text-xl">{activeCase.pricing.totalSar.toLocaleString()} ر.س</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <label className="block text-xs font-bold text-slate-300 mb-3">
            اختر وسيلة الدفع الآمنة (Saudi Payment Gateways):
          </label>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'mada', name: 'مدى (mada)', badge: 'الأكثر استخداماً' },
              { id: 'applepay', name: 'Apple Pay', badge: 'دفع فوري' },
              { id: 'visa', name: 'بطاقة ائتمان', badge: 'Visa / MC' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMethod(m.id as any)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedMethod === m.id
                    ? 'bg-teal-950/60 border-teal-500 text-teal-300 shadow-md ring-1 ring-teal-500/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="block font-bold text-xs">{m.name}</span>
                <span className="text-[10px] opacity-75">{m.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 1-Click Pay Button */}
        <div className="mt-6">
          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isProcessing ? (
              <span>جارٍ تأكيد السداد وإصدار الفاتورة...</span>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>سداد فوري {activeCase.pricing.totalSar} ر.س ومتابعة الاستشارة</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>مدفوعات مؤمنة ومشفرة 100% وفق متطلبات البنك المركزي السعودي (SAMA)</span>
        </div>
      </div>
    </div>
  );
};
