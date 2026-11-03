import React, { useState, useMemo } from 'react';
import { ClinicalCase } from '../../types';
import { CreditCard, CheckCircle2, ShieldCheck, Receipt, ArrowRight, Zap, QrCode, Sparkles, Video, FileText, Users } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  lang?: 'ar' | 'en';
}

type PaymentMethod = 'mada' | 'applepay' | 'tabby' | 'visa';

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
    tierNameEn: 'Written Second Opinion Report',
    tierNameAr: 'تقرير الرأي الطبي الثاني المكتوب',
    baseSar: 1200,
    vatSar: 180,
    totalSar: 1380,
    featuresEn: ['Senior Consultant Review', '48-Hour SLA Delivery', 'Digital Stamped PDF'],
    featuresAr: ['مراجعة استشاري أول', 'تسليم خلال 48 ساعة', 'ملف PDF رقمي مختوم'],
    icon: FileText,
    recommended: false,
  },
  {
    id: 2,
    tierNameEn: 'Written Report + 30-min Video Telehealth',
    tierNameAr: 'تقرير مكتوب + 30 دقيقة استشارة مرئية',
    baseSar: 2500,
    vatSar: 375,
    totalSar: 2875,
    featuresEn: [
      '30-Min WebRTC Video Call',
      'ALO Nurse Sara Live Medical Translation',
      'Dual-Signed PDF Report',
      '21-Day Post-Call Q&A Relay',
    ],
    featuresAr: [
      'مكالمة فيديو WebRTC لمدة 30 دقيقة',
      'ترجمة طبية مباشرة مع ممرضة آلو سارة',
      'تقرير PDF مزدوج التوقيع',
      'متابعة أسئلة وأجوبة لمدة 21 يوماً بعد المكالمة',
    ],
    icon: Video,
    recommended: true,
  },
  {
    id: 3,
    tierNameEn: 'Multidisciplinary Tumor Board / Complex Surgical Panel',
    tierNameAr: 'لجنة الأورام متعددة التخصصات / جراحة معقدة',
    baseSar: 4500,
    vatSar: 675,
    totalSar: 5175,
    featuresEn: [
      '3 International Super-Specialists',
      'Comprehensive Multi-Disciplinary Dossier',
      'Complex Surgical Planning',
      'Full Partner Care Logistics',
    ],
    featuresAr: [
      '3 استشاريين دوليين فائقين التخصص',
      'ملف شامل متعدد التخصصات',
      'تخطيط جراحي معقد',
      'خدمات لوجستية كاملة لرعاية الشريك',
    ],
    icon: Users,
    recommended: false,
  },
];

const PAYMENT_METHODS = {
  en: [
    { id: 'mada' as PaymentMethod, label: 'mada', sublabel: 'Saudi Most Popular', icon: CreditCard },
    { id: 'applepay' as PaymentMethod, label: 'Apple Pay', sublabel: '1-Click', icon: Zap },
    { id: 'tabby' as PaymentMethod, label: 'Tabby', sublabel: '4 Interest-Free Split', icon: Sparkles },
    { id: 'visa' as PaymentMethod, label: 'Visa / Mastercard', sublabel: 'Global Secure', icon: CreditCard },
  ],
  ar: [
    { id: 'mada' as PaymentMethod, label: 'مدى', sublabel: 'الأكثر شعبية في السعودية', icon: CreditCard },
    { id: 'applepay' as PaymentMethod, label: 'Apple Pay', sublabel: 'بنقرة واحدة', icon: Zap },
    { id: 'tabby' as PaymentMethod, label: 'تابي', sublabel: 'قسّمها على 4 بدون فوائد', icon: Sparkles },
    { id: 'visa' as PaymentMethod, label: 'فيزا / ماستركارد', sublabel: 'دفع عالمي آمن', icon: CreditCard },
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
  lang = 'en',
}) => {
  const isRTL = lang === 'ar';
  const t = UI_STRINGS[lang];
  const methods = PAYMENT_METHODS[lang];

  const [selectedTierId, setSelectedTierId] = useState<number>(
    activeCase.pricing?.tier || 2
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mada');
  const [isProcessing, setIsProcessing] = useState(false);

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
    setIsProcessing(true);
    
    // Simulate network delay for payment gateway
    await new Promise((resolve) => setTimeout(resolve, 2200));

    const tapChargeId = `chg_tap_ksa_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    const invoiceNumber = `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    onUpdateCase({
      paymentDetails: {
        ...activeCase.paymentDetails,
        tapChargeId,
        invoiceNumber,
        method: paymentMethod,
        status: 'completed',
        amount: selectedTier.totalSar,
        currency: 'SAR',
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
      className="min-h-screen w-full bg-[#E6FAF7] py-8 px-4 sm:px-6 lg:px-8"
      style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#007B6E] tracking-tight">
            {t.title}
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* 3-Tier Selection Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TIERS.map((tier) => {
            const isSelected = selectedTierId === tier.id;
            const IconComponent = tier.icon;
            const tierName = isRTL ? tier.tierNameAr : tier.tierNameEn;
            const features = isRTL ? tier.featuresAr : tier.featuresEn;
            const monthly = (tier.totalSar / 4).toFixed(2);

            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => handleTierSelect(tier)}
                aria-pressed={isSelected}
                className={`relative flex flex-col h-full text-start p-6 rounded-3xl border-2 transition-all duration-300 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00C6AE]/50 ${
                  isSelected
                    ? 'border-[#007B6E] bg-white shadow-[0_0_0_4px_rgba(0,123,110,0.15),0_20px_25px_-5px_rgba(0,0,0,0.1)] scale-[1.02]'
                    : 'border-transparent bg-white/70 hover:bg-white hover:border-[#00C6AE]/40 hover:shadow-lg'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#007B6E] to-[#00C6AE] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap flex items-center gap-1.5">
                    <Sparkles size={12} />
                    {t.recommended}
                  </div>
                )}

                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 ${
                  isSelected ? 'bg-[#007B6E] text-white' : 'bg-[#E6FAF7] text-[#007B6E]'
                }`}>
                  <IconComponent size={28} strokeWidth={2} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4 leading-snug min-h-[3.5rem]">
                  {tierName}
                </h3>

                <ul className="space-y-3 mb-6 flex-1">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle2
                        size={18}
                        className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-[#007B6E]' : 'text-[#00C6AE]'}`}
                      />
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-gray-100 pt-5 mt-auto space-y-2">
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{t.baseFee}</span>
                    <span>{formatCurrency(tier.baseSar)} {t.sar}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{t.vat}</span>
                    <span>{formatCurrency(tier.vatSar)} {t.sar}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-extrabold text-[#007B6E] pt-2">
                    <span>{t.total}</span>
                    <span>{formatCurrency(tier.totalSar)} {t.sar}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#00C6AE] pt-1">
                    <Sparkles size={12} />
                    <span>{t.tabbySplit} {monthly} {t.sar} {t.perMonth}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Payment Methods & Invoice */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Payment Methods */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <CreditCard className="text-[#007B6E]" size={24} />
              {t.paymentMethodTitle}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {methods.map((method) => {
                const isActive = paymentMethod === method.id;
                const MethodIcon = method.icon;
                
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00C6AE]/50 ${
                      isActive
                        ? 'border-[#007B6E] bg-[#E6FAF7]/50'
                        : 'border-gray-100 hover:border-[#00C6AE]/50 bg-white'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                      isActive ? 'bg-[#007B6E] text-white' : 'bg-gray-50 text-gray-500'
                    }`}>
                      <MethodIcon size={24} />
                    </div>
                    <div className="text-start flex-1">
                      <p className={`font-bold text-sm ${isActive ? 'text-[#007B6E]' : 'text-gray-900'}`}>
                        {method.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{method.sublabel}</p>
                    </div>
                    {isActive && (
                      <CheckCircle2 size={20} className="text-[#007B6E] flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Tabby Info if Tabby Selected */}
            {paymentMethod === 'tabby' && (
              <div className="mt-6 p-4 bg-[#E6FAF7] rounded-2xl border border-[#00C6AE]/30 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Sparkles className="text-[#007B6E] mt-0.5 flex-shrink-0" size={20} />
                <div className="text-sm text-[#007B6E] font-medium leading-relaxed">
                  {isRTL 
                    ? `سيتم تقسيم المبلغ الإجمالي ${formatCurrency(selectedTier.totalSar)} ر.س إلى 4 دفعات شهرية بدون فوائد بقيمة ${tabbyMonthly} ر.س عبر تابي.`
                    : `Your total of SAR ${formatCurrency(selectedTier.totalSar)} will be split into 4 interest-free monthly payments of SAR ${tabbyMonthly} via Tabby.`
                  }
                </div>
              </div>
            )}
          </div>

          {/* ZATCA Phase-2 Tax Invoice Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Receipt className="text-[#007B6E]" size={24} />
              {t.invoiceTitle}
            </h2>

            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                <span className="text-sm font-medium text-gray-500">{t.caseNumber}</span>
                <span className="text-sm font-bold text-gray-900 font-mono tracking-wider">
                  {activeCase.caseNumber || 'ALO-000000'}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                <span className="text-sm font-medium text-gray-500">{t.serviceFee}</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(selectedTier.baseSar)} {t.sar}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                <span className="text-sm font-medium text-gray-500">{t.zatcaVat}</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(selectedTier.vatSar)} {t.sar}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-gray-900">{t.totalDue}</span>
                <span className="text-2xl font-extrabold text-[#007B6E]">
                  {formatCurrency(selectedTier.totalSar)} {t.sar}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <QrCode size={24} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500">{t.qrIndicator}</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-[#E6FAF7] rounded-xl">
                <ShieldCheck size={24} className="text-[#007B6E]" />
                <span className="text-xs font-bold text-[#007B6E]">{t.samaBadge}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instant Payment Action */}
        <div className="flex flex-col items-center justify-center pt-4 pb-12">
          <button
            type="button"
            onClick={handlePayment}
            disabled={isProcessing}
            className={`group relative inline-flex items-center justify-center gap-3 w-full sm:w-auto sm:min-w-[420px] px-10 py-5 rounded-2xl text-lg font-bold text-white transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00C6AE]/50 ${
              isProcessing
                ? 'bg-[#007B6E]/80 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#007B6E] to-[#00C6AE] hover:shadow-[0_10px_30px_-5px_rgba(0,123,110,0.5)] hover:-translate-y-0.5 active:translate-y-0'
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
                  className={`transition-transform duration-300 ${
                    isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'
                  }`}
                />
              </>
            )}
          </button>
          
          <p className="mt-4 text-xs text-gray-400 flex items-center gap-1.5">
            <ShieldCheck size={12} />
            {isRTL ? 'محمي بتشفير 256-bit SSL ومتوافق مع معايير PCI-DSS' : 'Secured by 256-bit SSL encryption & PCI-DSS compliant'}
          </p>
        </div>

      </div>
    </div>
  );
};

export default PaymentCheckoutView;