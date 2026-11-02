import React, { useState } from 'react';
import { ClinicalCase } from '../../types';
import { CreditCard, CheckCircle2, ShieldCheck, Receipt, ArrowRight, Zap, QrCode } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  lang?: 'ar' | 'en';
}

export const PaymentCheckoutView: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
  lang = 'ar',
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'mada' | 'applepay' | 'tabby'>('mada');
  const [isProcessing, setIsProcessing] = useState(false);
  const isAr = lang === 'ar';

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onUpdateCase({
        pricing: {
          ...activeCase.pricing,
          paid: true,
          invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          tapChargeId: `chg_tap_ksa_${Math.floor(100000 + Math.random() * 900000)}`,
        },
      });
      setIsProcessing(false);
      onAdvanceStage();
    }, 700);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Invoice Card */}
      <div className="card-clinical p-6 shadow-md border-t-4 border-t-alo-teal">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2 text-alo-teal font-extrabold text-sm">
            <Receipt className="w-5 h-5 text-alo-teal" />
            <span>{isAr ? 'فاتورة ضريبية معتمدة (ZATCA Phase-2 Tax Invoice)' : 'ZATCA Phase-2 Compliant Tax Invoice'}</span>
          </div>
          <span className="text-xs bg-alo-mint text-alo-teal px-3 py-1 rounded-full font-mono font-bold">
            {activeCase.caseNumber}
          </span>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-3.5 text-sm">
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>
              {isAr ? 'باقة الرأي الطبي الثاني المعتمد:' : 'Second Opinion Service Tier:'}{' '}
              <strong className="text-alo-navy dark:text-slate-100">
                {isAr ? 'اتصال مرئي + تقرير مكتوب (Tier 2)' : 'Video Telehealth + Written Report (Tier 2)'}
              </strong>
            </span>
            <span className="font-mono font-bold">
              {activeCase.pricing.baseSar.toLocaleString()} {isAr ? 'ر.س' : 'SAR'}
            </span>
          </div>

          <div className="flex justify-between text-slate-500 text-xs">
            <span>{isAr ? 'ضريبة القيمة المضافة (15% ZATCA VAT):' : 'Value Added Tax (15% ZATCA VAT):'}</span>
            <span className="font-mono font-bold">
              {activeCase.pricing.vatSar.toLocaleString()} {isAr ? 'ر.س' : 'SAR'}
            </span>
          </div>

          {/* Tabby 4x Split Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
            <span>
              {isAr ? 'قسّطها على 4 دفعات بدون فوائد مع تابّي:' : 'Split into 4 interest-free payments with Tabby:'}
            </span>
            <span className="font-mono font-black text-sm">
              {(activeCase.pricing.totalSar / 4).toFixed(2)} {isAr ? 'ر.س/شهر' : 'SAR/mo'}
            </span>
          </div>

          <div className="flex justify-between text-lg font-black text-alo-navy dark:text-white pt-4 border-t border-slate-200 dark:border-slate-800">
            <span>{isAr ? 'المجموع المستحق للسداد:' : 'Total Amount Payable:'}</span>
            <span className="font-mono text-alo-teal">
              {activeCase.pricing.totalSar.toLocaleString()} {isAr ? 'ر.س (SAR)' : 'SAR'}
            </span>
          </div>
        </div>

        {/* Payment Methods: mada, Apple Pay, Tabby */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
            {isAr ? 'طريقة الدفع عبر بوابة Tap Payments (KSA):' : 'Select Payment Method via Tap Payments (KSA):'}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'mada', label: isAr ? 'مدى (mada)' : 'mada Debit', badge: '🇸🇦 الأكثر استخداماً' },
              { id: 'applepay', label: 'Apple Pay', badge: '⚡ نقرة واحدة' },
              { id: 'tabby', label: 'تابّي (Tabby)', badge: '4 أقساط' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMethod(m.id as any)}
                className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  selectedMethod === m.id
                    ? 'bg-alo-mint border-teal-400 text-alo-teal ring-2 ring-teal-400/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="font-extrabold">{m.label}</span>
                <span className="text-[10px] text-slate-500 font-normal">{m.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Instant Simulator Action */}
        <div className="mt-6">
          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-alo-teal to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-black py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer active:scale-98"
          >
            <Zap className="w-4 h-4 fill-white text-white" />
            <span>
              {isProcessing
                ? (isAr ? 'جارٍ معالجة السداد عبر Tap...' : 'Processing Tap Charge...')
                : isAr
                ? `⚡ محاكاة السداد الفوري (${activeCase.pricing.totalSar.toLocaleString()} ر.س عبر ${selectedMethod.toUpperCase()})`
                : `⚡ Complete Payment (${activeCase.pricing.totalSar.toLocaleString()} SAR via ${selectedMethod.toUpperCase()})`}
            </span>
          </button>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {isAr
                ? 'مدفوعات مشفرة وآمنة 100% عبر خوادم Tap Payments المرخصة من البنك المركزي السعودي (SAMA).'
                : '100% Secure Payments via Tap Payments KSA, authorized by the Saudi Central Bank (SAMA).'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
