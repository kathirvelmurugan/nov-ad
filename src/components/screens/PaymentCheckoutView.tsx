import React, { useState, useMemo, useEffect } from 'react';
import { ClinicalCase, PaymentMethodId } from '../../types';
import { CreditCard, CheckCircle2, ShieldCheck, Receipt, ArrowRight, Zap, QrCode, Sparkles, Video, FileText } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  onBackToTimeline?: () => void;
  lang?: 'ar' | 'en';
}

type PaymentMethod = PaymentMethodId;

interface TierConfig {
  id: number;
  tierNameEn: string;
  tierNameAr: string;
  baseSar: number;
  vatSar: number;
  totalSar: number;
  featuresEn: string[];
  featuresAr: string[];
  icon: React.ElementType;
  recommended: boolean;
}

const TIERS: TierConfig[] = [
  {
    id: 1,
    tierNameEn: 'Written opinion only',
    tierNameAr: 'رأي مكتوب فقط',
    baseSar: 65.22,
    vatSar: 9.78,
    totalSar: 75,
    featuresEn: ['Written second opinion · report PDF 1', '48-hour delivery', 'Follow-up 21 days'],
    featuresAr: ['رأي طبي ثانٍ مكتوب · تقرير PDF 1', 'تسليم خلال 48 ساعة', 'متابعة 21 يوماً'],
    icon: FileText,
    recommended: false,
  },
  {
    id: 2,
    tierNameEn: 'Video + written opinion',
    tierNameAr: 'مرئي + رأي مكتوب',
    baseSar: 130.43,
    vatSar: 19.57,
    totalSar: 150,
    featuresEn: ['30-min video / voice call', 'ALO nurse interprets on call', 'Written opinion · report PDF 1', 'Follow-up 21 days'],
    featuresAr: ['مكالمة مرئية / صوتية 30 دقيقة', 'ممرضة ألو تترجم خلال المكالمة', 'رأي مكتوب · تقرير PDF 1', 'متابعة 21 يوماً'],
    icon: Video,
    recommended: true,
  },
];

const PAYMENT_METHODS = {
  en: [
    { id: 'mada' as PaymentMethod, label: 'mada', sublabel: 'Saudi Most Popular', icon: CreditCard },
    { id: 'applepay' as PaymentMethod, label: 'Apple Pay', sublabel: '1-Click', icon: Zap },
    { id: 'visa' as PaymentMethod, label: 'Visa / Mastercard', sublabel: 'Global Secure', icon: CreditCard },
    { id: 'tabby' as PaymentMethod, label: 'Tabby (4 Installments)', sublabel: '0% Interest Split', icon: Sparkles },
  ],
  ar: [
    { id: 'mada' as PaymentMethod, label: 'مدى', sublabel: 'الأكثر شعبية في السعودية', icon: CreditCard },
    { id: 'applepay' as PaymentMethod, label: 'Apple Pay', sublabel: 'بنقرة واحدة', icon: Zap },
    { id: 'visa' as PaymentMethod, label: 'فيزا / ماستركارد', sublabel: 'دفع عالمي آمن', icon: CreditCard },
    { id: 'tabby' as PaymentMethod, label: 'تابي (4 دفعات)', sublabel: 'تقسيط بدون فوائد', icon: Sparkles },
  ],
};

const UI_STRINGS = {
  en: {
    title: 'Select Your Consultation Package',
    subtitle: 'Choose the care level that best fits your clinical needs. All packages include ZATCA-compliant invoicing.',
    recommended: 'Recommended',
    baseFee: 'Base Fee',
    vat: 'VAT (15%)',
    total: 'Total',
    tabbySplit: 'or 4 interest-free payments of',
    perMonth: '/mo',
    paymentMethodTitle: 'Payment Method',
    invoiceTitle: 'ZATCA Phase-2 Tax Invoice',
    caseNumber: 'Case Number',
    serviceFee: 'Service Fee',
    zatcaVat: 'ZATCA VAT (15%)',
    totalDue: 'Total Amount Due',
    qrIndicator: 'ZATCA QR Code Generated',
    samaBadge: 'SAMA Compliant Gateway',
    completePayment: 'Complete Payment',
    via: 'via',
    processing: 'Processing securely...',
    sar: 'SAR',
  },
  ar: {
    title: 'اختر باقة الاستشارة الخاصة بك',
    subtitle: 'اختر مستوى الرعاية الذي يناسب احتياجاتك الطبية. جميع الباقات تشمل فوترة متوافقة مع هيئة الزكاة والضريبة والجمارك.',
    recommended: 'الأكثر طلباً',
    baseFee: 'الرسوم الأساسية',
    vat: 'ضريبة القيمة المضافة (15%)',
    total: 'الإجمالي',
    tabbySplit: 'أو 4 دفعات بدون فوائد بقيمة',
    perMonth: '/شهر',
    paymentMethodTitle: 'طريقة الدفع',
    invoiceTitle: 'فاتورة ضريبية - المرحلة الثانية (ZATCA)',
    caseNumber: 'رقم الحالة',
    serviceFee: 'رسوم الخدمة',
    zatcaVat: 'ضريبة ZATCA (15%)',
    totalDue: 'إجمالي المبلغ المستحق',
    qrIndicator: 'تم إنشاء رمز QR الضريبي',
    samaBadge: 'بوابة دفع متوافقة مع ساما',
    completePayment: 'إتمام الدفع',
    via: 'عبر',
    processing: 'جارٍ المعالجة بأمان...',
    sar: 'ر.س',
  },
};

export const PaymentCheckoutView: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
  onBackToTimeline,
  lang = 'en',
}) => {
  const isRTL = lang === 'ar';
  const t = UI_STRINGS[lang];
  const allowedIds = activeCase.allowedPaymentMethods && activeCase.allowedPaymentMethods.length > 0
    ? activeCase.allowedPaymentMethods
    : [];
  const methods = PAYMENT_METHODS[lang].filter((m) => allowedIds.includes(m.id));
  const isCoordinatorAssigned = !!activeCase.invoiceIssued && methods.length > 0;

  const [selectedTierId, setSelectedTierId] = useState<number>(
    activeCase.consultationType === 'written' ? 1 : 2
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(methods[0]?.id || 'mada');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setSelectedTierId(activeCase.consultationType === 'written' ? 1 : 2);
  }, [activeCase.consultationType, activeCase.id]);

  useEffect(() => {
    if (methods.length > 0 && !methods.some((m) => m.id === paymentMethod)) {
      setPaymentMethod(methods[0].id);
    }
  }, [activeCase.allowedPaymentMethods, lang]);

  const selectedTier = useMemo(
    () => TIERS.find((tier) => tier.id === selectedTierId) || TIERS[1],
    [selectedTierId]
  );

  const tabbyMonthly = useMemo(
    () => (selectedTier.totalSar / 4).toFixed(2),
    [selectedTier.totalSar]
  );

  const handleTierSelect = (tier: TierConfig) => {
    setSelectedTierId(tier.id);
    onUpdateCase({
      consultationType: tier.id === 1 ? 'written' : 'video',
      tier: tier.id,
      pricing: {
        ...activeCase.pricing,
        tier: tier.id,
        baseSar: tier.baseSar,
        vatSar: tier.vatSar,
        totalSar: tier.totalSar,
        tierName: isRTL ? tier.tierNameAr : tier.tierNameEn,
      },
    });
  };

  const handlePayment = async () => {
    if (!isCoordinatorAssigned) return;
    setIsProcessing(true);

    // Simulate network delay for payment gateway
    await new Promise((resolve) => setTimeout(resolve, 1600));

    const tapChargeId = `chg_tap_ksa_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    const invoiceNumber = activeCase.pricing?.invoiceNumber || `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    onUpdateCase({
      paymentVerified: false,
      pricing: {
        ...activeCase.pricing,
        tier: selectedTier.id,
        baseSar: selectedTier.baseSar,
        vatSar: selectedTier.vatSar,
        totalSar: selectedTier.totalSar,
        tierName: isRTL ? selectedTier.tierNameAr : selectedTier.tierNameEn,
        invoiceNumber,
        tapChargeId,
        paid: true,
      },
      paymentDetails: {
        ...activeCase.paymentDetails,
        tapChargeId,
        invoiceNumber,
        method: paymentMethod,
        status: 'completed',
        amount: selectedTier.totalSar,
        currency: 'SAR',
      },
      metadata: {
        ...(activeCase.metadata || {}),
        paymentVerified: false,
      },
    });

    setIsProcessing(false);
    onAdvanceStage();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const selectedMethodLabel = methods.find((m) => m.id === paymentMethod)?.label || '';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full bg-[#E6FAF7] min-h-[calc(100vh-80px)] py-4 sm:py-6"
      style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        
        {onBackToTimeline && (
          <div className="flex items-center justify-start">
            <button
              onClick={onBackToTimeline}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#007B6E] hover:text-[#005a50] transition-colors bg-white/90 hover:bg-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-[#00C6AE]/30 shadow-sm cursor-pointer"
            >
              <span>{isRTL ? '→' : '←'}</span>
              <span>{isRTL ? 'العودة إلى متابعة الطلب' : 'Back to Case Timeline'}</span>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#007B6E] tracking-tight">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* 2-Tier Selection Matrix (Tier 1 & Tier 2 Only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-4">
          {TIERS.map((tier) => {
            const isSelected = selectedTierId === tier.id;
            const IconComponent = tier.icon;
            const tierName = isRTL ? tier.tierNameAr : tier.tierNameEn;
            const features = isRTL ? tier.featuresAr : tier.featuresEn;

            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => handleTierSelect(tier)}
                aria-pressed={isSelected}
                className={`relative flex flex-col justify-between h-full text-start p-6 sm:p-7 rounded-3xl border-2 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00C6AE]/50 ${
                  isSelected
                    ? 'border-[#007B6E] bg-white ring-2 ring-[#007B6E]/20 shadow-xl'
                    : 'border-slate-200/90 bg-white/80 hover:bg-white hover:border-[#00C6AE]/60 hover:shadow-md'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#007B6E] to-[#00C6AE] text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-md whitespace-nowrap flex items-center gap-1.5 z-10">
                    <Sparkles size={12} />
                    <span>{t.recommended}</span>
                  </div>
                )}

                <div>
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-2xl mb-4 ${
                    isSelected ? 'bg-[#007B6E] text-white shadow-sm' : 'bg-[#E6FAF7] text-[#007B6E]'
                  }`}>
                    <IconComponent size={26} strokeWidth={2.2} />
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-4 leading-snug">
                    {tierName}
                  </h3>

                  <ul className="space-y-2.5 mb-6">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                        <CheckCircle2
                          size={17}
                          className={`mt-0.5 shrink-0 ${isSelected ? 'text-[#007B6E]' : 'text-[#00C6AE]'}`}
                        />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-auto space-y-1.5">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>{t.baseFee}</span>
                    <span className="font-semibold">{formatCurrency(tier.baseSar)} {t.sar}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>{t.vat}</span>
                    <span className="font-semibold">{formatCurrency(tier.vatSar)} {t.sar}</span>
                  </div>
                  <div className="flex justify-between items-center text-base sm:text-lg font-extrabold text-[#007B6E] pt-2 border-t border-slate-100">
                    <span>{t.total}</span>
                    <span className="text-xl sm:text-2xl font-black">{formatCurrency(tier.totalSar)} {t.sar}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Payment Methods & Invoice */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          
          {/* Payment Methods */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/90 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
                  <CreditCard className="text-[#007B6E]" size={22} />
                  <span>{t.paymentMethodTitle}</span>
                </h2>
                {isCoordinatorAssigned && (
                  <span className="text-xs font-bold text-[#007B6E] bg-[#E6FAF7] px-3 py-1 rounded-full border border-[#00C6AE]/40">
                    {isRTL ? 'معتمدة من منسق ألو' : 'Assigned by ALO Coordinator'}
                  </span>
                )}
              </div>

              {!isCoordinatorAssigned ? (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-semibold">
                  {isRTL
                    ? 'الدفع مقفل حالياً — بانتظار قيام منسق رعاية ألو باعتماد الفاتورة وتحديد طرق الدفع المتاحة لك.'
                    : 'Payment is locked — waiting for the ALO Coordinator to issue your invoice and assign available payment methods.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {methods.map((method) => {
                    const isActive = paymentMethod === method.id;
                    const MethodIcon = method.icon;
                    
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all duration-200 text-start cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C6AE] ${
                          isActive
                            ? 'border-[#007B6E] bg-[#E6FAF7]/60 shadow-sm ring-1 ring-[#007B6E]/30'
                            : 'border-slate-200/80 hover:border-[#00C6AE]/50 bg-white'
                        }`}
                      >
                        <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${
                          isActive ? 'bg-[#007B6E] text-white shadow-sm' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <MethodIcon size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-xs sm:text-sm truncate ${isActive ? 'text-[#007B6E]' : 'text-slate-900'}`}>
                            {method.label}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{method.sublabel}</p>
                        </div>
                        {isActive && (
                          <CheckCircle2 size={18} className="text-[#007B6E] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dynamic Tabby Info if Tabby Selected */}
            {paymentMethod === 'tabby' && (
              <div className="mt-4 p-3 bg-[#E6FAF7] rounded-2xl border border-[#00C6AE]/30 flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <Sparkles className="text-[#007B6E] mt-0.5 shrink-0" size={18} />
                <div className="text-xs text-[#007B6E] font-medium leading-relaxed">
                  {isRTL 
                    ? `سيتم تقسيم المبلغ الإجمالي ${formatCurrency(selectedTier.totalSar)} ر.س إلى 4 دفعات شهرية بدون فوائد بقيمة ${tabbyMonthly} ر.س عبر تابي.`
                    : `Your total of SAR ${formatCurrency(selectedTier.totalSar)} will be split into 4 interest-free monthly payments of SAR ${tabbyMonthly} via Tabby.`
                  }
                </div>
              </div>
            )}
          </div>

          {/* ZATCA Phase-2 Tax Invoice Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/90 flex flex-col justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mb-5 flex items-center gap-2.5">
                <Receipt className="text-[#007B6E]" size={22} />
                <span>{t.invoiceTitle}</span>
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2.5 border-b border-dashed border-slate-200">
                  <span className="text-xs sm:text-sm font-medium text-slate-500">{t.caseNumber}</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono tracking-wider">
                    {activeCase.caseNumber || 'ALO-000000'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-dashed border-slate-200">
                  <span className="text-xs sm:text-sm font-medium text-slate-500">{t.serviceFee}</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {formatCurrency(selectedTier.baseSar)} {t.sar}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-dashed border-slate-200">
                  <span className="text-xs sm:text-sm font-medium text-slate-500">{t.zatcaVat}</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {formatCurrency(selectedTier.vatSar)} {t.sar}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-sm sm:text-base font-extrabold text-slate-900">{t.totalDue}</span>
                  <span className="text-xl sm:text-2xl font-black text-[#007B6E]">
                    {formatCurrency(selectedTier.totalSar)} {t.sar}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                <QrCode size={18} className="text-slate-400 shrink-0" />
                <span className="text-[11px] font-medium text-slate-600 truncate">{t.qrIndicator}</span>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-[#E6FAF7] rounded-xl border border-[#00C6AE]/20">
                <ShieldCheck size={18} className="text-[#007B6E] shrink-0" />
                <span className="text-[11px] font-bold text-[#007B6E] truncate">{t.samaBadge}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instant Payment Action */}
        <div className="flex flex-col items-center justify-center pt-4 pb-8">
          <button
            type="button"
            onClick={handlePayment}
            disabled={isProcessing || !isCoordinatorAssigned}
            className={`group relative inline-flex items-center justify-center gap-3 w-full sm:w-auto sm:min-w-[420px] px-8 py-4 rounded-2xl text-base sm:text-lg font-extrabold text-white transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00C6AE]/50 shadow-md ${
              isProcessing || !isCoordinatorAssigned
                ? 'bg-[#007B6E]/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#007B6E] to-[#00C6AE] hover:shadow-xl hover:brightness-105 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t.processing}</span>
              </>
            ) : (
              <>
                <span>
                  {t.completePayment} ({formatCurrency(selectedTier.totalSar)} {t.sar} {t.via} {selectedMethodLabel})
                </span>
                <ArrowRight
                  size={20}
                  className={`transition-transform duration-200 ${
                    isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'
                  }`}
                />
              </>
            )}
          </button>
          
          <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>{isRTL ? 'محمي بتشفير 256-bit SSL ومتوافق مع معايير PCI-DSS' : 'Secured by 256-bit SSL encryption & PCI-DSS compliant'}</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default PaymentCheckoutView;