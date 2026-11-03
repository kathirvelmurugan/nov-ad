import React, { useState, useMemo } from 'react';
import { ClinicalCase } from '../../types';
import { CreditCard, CheckCircle2, ShieldCheck, Receipt, ArrowRight, Zap, QrCode, Sparkles, Video, FileText, Users } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  lang?: 'ar' | 'en';
}

interface TierConfig {
  id: number;
  nameEn: string;
  nameAr: string;
  baseSar: number;
  vatSar: number;
  totalSar: number;
  tabbyMonthly: number;
  featuresEn: string[];
  featuresAr: string[];
  icon: React.ElementType;
  recommended: boolean;
}

const TIERS: TierConfig[] = [
  {
    id: 1,
    nameEn: 'Written Second Opinion Report',
    nameAr: 'تقرير الرأي الطبي الثاني المكتوب',
    baseSar: 1200,
    vatSar: 180,
    totalSar: 1380,
    tabbyMonthly: 345.00,
    featuresEn: ['Senior Consultant Review', '48-Hour SLA Guarantee', 'Digital Stamped PDF'],
    featuresAr: ['مراجعة استشاري أول', 'ضمان إنجاز خلال 48 ساعة', 'ملف PDF رقمي مختوم'],
    icon: FileText,
    recommended: false,
  },
  {
    id: 2,
    nameEn: 'Written Report + 30-min Video Telehealth',
    nameAr: 'تقرير مكتوب + 30 دقيقة استشارة مرئية',
    baseSar: 2500,
    vatSar: 375,
    totalSar: 2875,
    tabbyMonthly: 718.75,
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
      'متابعة الأسئلة والأجوبة لمدة 21 يوماً بعد المكالمة',
    ],
    icon: Video,
    recommended: true,
  },
  {
    id: 3,
    nameEn: 'Multidisciplinary Tumor Board / Complex Surgical Panel',
    nameAr: 'لجنة الأورام متعددة التخصصات / جراحة معقدة',
    baseSar: 4500,
    vatSar: 675,
    totalSar: 5175,
    tabbyMonthly: 1293.75,
    featuresEn: [
      '3 International Super-Specialists',
      'Comprehensive Multi-Disciplinary Dossier',
      'Complex Surgical Planning',
      'Full Partner Care Logistics',
    ],
    featuresAr: [
      '3 أخصائيين دوليين فائقين',
      'ملف شامل متعدد التخصصات',
      'تخطيط جراحي معقد',
      'خدمات لوجستية كاملة لرعاية الشركاء',
    ],
    icon: Users,
    recommended: false,
  },
];

type PaymentMethodId = 'mada' | 'applepay' | 'tabby' | 'visa';

interface PaymentMethodConfig {
  id: PaymentMethodId;
  labelEn: string;
  labelAr: string;
  subEn: string;
  subAr: string;
  icon: React.ElementType;
}

const PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: 'mada', labelEn: 'mada', labelAr: 'مدى', subEn: 'Saudi Most Popular', subAr: 'الأكثر شعبية في السعودية', icon: CreditCard },
  { id: 'applepay', labelEn: 'Apple Pay', labelAr: 'آبل باي', subEn: '1-Click Checkout', subAr: 'دفع بنقرة واحدة', icon: Zap },
  { id: 'tabby', labelEn: 'Tabby', labelAr: 'تابي', subEn: '4 Interest-Free Split', subAr: 'قسّمها على 4 بدون فوائد', icon: Sparkles },
  { id: 'visa', labelEn: 'Visa / Mastercard', labelAr: 'فيزا / ماستركارد', subEn: 'International Cards', subAr: 'البطاقات الدولية', icon: CreditCard },
];

const PaymentCheckoutView: React.FC<Props> = ({ activeCase, onAdvanceStage, onUpdateCase, lang = 'ar' }) => {
  const isRtl = lang === 'ar';
  const [selectedTierId, setSelectedTierId] = useState<number>(activeCase.pricing?.tier || 2);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId>('mada');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentTier = useMemo(() => TIERS.find(t => t.id === selectedTierId) || TIERS[1], [selectedTierId]);
  const currentPaymentMethod = useMemo(() => PAYMENT_METHODS.find(p => p.id === selectedPayment) || PAYMENT_METHODS[0], [selectedPayment]);

  const handleTierSelect = (tier: TierConfig) => {
    setSelectedTierId(tier.id);
    onUpdateCase({
      pricing: {
        ...activeCase.pricing,
        tier: tier.id,
        baseSar: tier.baseSar,
        vatSar: tier.vatSar,
        totalSar: tier.totalSar,
        tierName: isRtl ? tier.nameAr : tier.nameEn,
      } as any,
    });
  };

  const handlePayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2200));

    const tapChargeId = `chg_tap_ksa_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`;
    const invoiceNumber = `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    onUpdateCase({
      paymentDetails: {
        ...(activeCase.paymentDetails || {}),
        tapChargeId,
        invoiceNumber,
        method: selectedPayment,
        status: 'completed',
        amount: currentTier.totalSar,
      } as any,
    });

    setIsProcessing(false);
    onAdvanceStage();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRtl ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const t = {
    title: isRtl ? 'اختر باقة الاستشارة الطبية' : 'Select Your Consultation Package',
    subtitle: isRtl ? 'جميع الباقات تشمل ضريبة القيمة المضافة 15% وفقاً لاشتراطات ZATCA' : 'All packages include 15% VAT in compliance with ZATCA regulations',
    paymentTitle: isRtl ? 'طريقة الدفع' : 'Payment Method',
    invoiceTitle: isRtl ? 'فاتورة ضريبية - المرحلة الثانية ZATCA' : 'ZATCA Phase-2 Tax Invoice',
    caseNumber: isRtl ? 'رقم الحالة' : 'Case Number',
    serviceFee: isRtl ? 'رسوم الخدمة' : 'Service Fee',
    vat: isRtl ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)',
    totalDue: isRtl ? 'إجمالي المبلغ المستحق' : 'Total Amount Due',
    zatcaQr: isRtl ? 'رمز QR الضريبي من ZATCA' : 'ZATCA Tax QR Code',
    samaBadge: isRtl ? 'متوافق مع معايير SAMA' : 'SAMA Compliant',
    completeBtn: isRtl ? `إتمام الدفع (${formatCurrency(currentTier.totalSar)} عبر ${currentPaymentMethod.labelAr})` : `Complete Payment (${formatCurrency(currentTier.totalSar)} via ${currentPaymentMethod.labelEn})`,
    processing: isRtl ? 'جارٍ معالجة الدفع الآمن...' : 'Processing secure payment...',
    recommended: isRtl ? 'الأكثر طلباً' : 'Most Popular',
    monthly: isRtl ? '/ شهرياً عبر تابي' : '/mo via Tabby',
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen w-full bg-[#E6FAF7] py-8 px-4 md:px-8" style={{ fontFamily: isRtl ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#007B6E]">{t.title}</h1>
          <p className="text-sm md:text-base text-[#007B6E]/70 font-medium">{t.subtitle}</p>
        </div>

        {/* 3-Tier Selection Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TIERS.map((tier) => {
            const isSelected = selectedTierId === tier.id;
            const Icon = tier.icon;
            
            return (
              <button
                key={tier.id}
                onClick={() => handleTierSelect(tier)}
                className={`relative flex flex-col h-full text-start rounded-3xl p-6 transition-all duration-300 border-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00C6AE]/50 ${
                  isSelected 
                    ? 'bg-white border-[#007B6E] shadow-[0_0_0_4px_rgba(0,198,174,0.25),0_20px_25px_-5px_rgba(0,0,0,0.1)] scale-[1.02]' 
                    : 'bg-white/60 border-transparent hover:border-[#00C6AE]/50 hover:bg-white shadow-sm'
                }`}
                aria-pressed={isSelected}
                aria-label={`${isRtl ? tier.nameAr : tier.nameEn} - ${formatCurrency(tier.totalSar)}`}
              >
                {tier.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#007B6E] to-[#00C6AE] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles size={12} />
                    {t.recommended}
                  </div>
                )}

                <div className={`mb-5 inline-flex items-center justify-center w-14 h-14 rounded-2xl ${isSelected ? 'bg-[#007B6E] text-white' : 'bg-[#E6FAF7] text-[#007B6E]'}`}>
                  <Icon size={28} strokeWidth={2} />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight min-h-[3.5rem]">
                  {isRtl ? tier.nameAr : tier.nameEn}
                </h3>

                <div className="space-y-1 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#007B6E]">{formatCurrency(tier.totalSar)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <span>{formatCurrency(tier.tabbyMonthly)}{t.monthly}</span>
                  </div>
                </div>

                <ul className="space-y-3 flex-1 mb-6">
                  {(isRtl ? tier.featuresAr : tier.featuresEn).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                      <CheckCircle2 size={18} className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-[#00C6AE]' : 'text-gray-400'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className={`w-full py-3 rounded-xl text-center font-bold text-sm transition-colors ${
                  isSelected ? 'bg-[#007B6E] text-white' : 'bg-[#E6FAF7] text-[#007B6E]'
                }`}>
                  {isSelected ? (isRtl ? 'تم الاختيار' : 'Selected') : (isRtl ? 'اختر هذه الباقة' : 'Select Package')}
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Column: Payment Methods & Action */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Payment Methods */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <CreditCard size={22} className="text-[#007B6E]" />
                {t.paymentTitle}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const isActive = selectedPayment === method.id;
                  const MIcon = method.icon;
                  
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00C6AE]/50 ${
                        isActive 
                          ? 'border-[#007B6E] bg-[#E6FAF7]' 
                          : 'border-gray-100 hover:border-[#00C6AE]/40 bg-white'
                      }`}
                      aria-pressed={isActive}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-[#007B6E] text-white' : 'bg-gray-50 text-gray-500'}`}>
                        <MIcon size={20} />
                      </div>
                      <div className="text-start flex-1">
                        <div className="font-bold text-gray-900 text-sm">{isRtl ? method.labelAr : method.labelEn}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">{isRtl ? method.subAr : method.subEn}</div>
                      </div>
                      {isActive && (
                        <CheckCircle2 size={20} className="text-[#007B6E] flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Tabby Calculator Info */}
            {selectedPayment === 'tabby' && (
              <div className="bg-gradient-to-br from-[#007B6E] to-[#00C6AE] rounded-3xl p-6 text-white shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={24} />
                  <h3 className="font-bold text-lg">{isRtl ? 'حاسبة تقسيم تابي' : 'Tabby Split Calculator'}</h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((installment) => (
                    <div key={installment} className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/20">
                      <div className="text-xs opacity-80 mb-1 font-medium">
                        {isRtl ? `دفعة ${installment}` : `Payment ${installment}`}
                      </div>
                      <div className="font-black text-sm">
                        {formatCurrency(currentTier.tabbyMonthly)}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-4 opacity-80 text-center font-medium">
                  {isRtl ? 'بدون أي رسوم خفية أو فوائد. موافقة فورية.' : 'Zero hidden fees or interest. Instant approval.'}
                </p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-[#007B6E] to-[#00C6AE] hover:from-[#006B5E] hover:to-[#00B69E] text-white font-bold text-lg py-5 px-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00C6AE]/50 group"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t.processing}</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={24} />
                  <span>{t.completeBtn}</span>
                  <ArrowRight size={20} className={`transition-transform duration-300 ${isRtl ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                </>
              )}
            </button>
          </div>

          {/* Right Column: ZATCA Phase-2 Tax Invoice */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Receipt size={20} className="text-[#007B6E]" />
                  {t.invoiceTitle}
                </h2>
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-500">{t.caseNumber}</span>
                  <span className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">
                    {activeCase.caseNumber || 'ALO-2026-000000'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-500">{isRtl ? 'الباقة المختارة' : 'Selected Package'}</span>
                  <span className="text-sm font-bold text-gray-900 max-w-[60%] text-end">
                    {isRtl ? currentTier.nameAr : currentTier.nameEn}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-t border-dashed border-gray-200 mt-2 pt-4">
                  <span className="text-sm font-medium text-gray-500">{t.serviceFee}</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(currentTier.baseSar)}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-500">{t.vat}</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(currentTier.vatSar)}</span>
                </div>

                <div className="flex justify-between items-center py-4 bg-[#E6FAF7] rounded-2xl px-4 mt-4 border border-[#00C6AE]/20">
                  <span className="text-base font-bold text-[#007B6E]">{t.totalDue}</span>
                  <span className="text-2xl font-black text-[#007B6E]">{formatCurrency(currentTier.totalSar)}</span>
                </div>
              </div>

              {/* ZATCA QR & Compliance */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-4">
                <div className="w-32 h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 p-4">
                  <QrCode size={48} className="text-[#007B6E]" />
                  <span className="text-[10px] font-bold text-gray-500 text-center uppercase tracking-wider">{t.zatcaQr}</span>
                </div>
                
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-100">
                  <ShieldCheck size={16} className="text-[#25D366]" />
                  <span className="text-xs font-bold">{t.samaBadge}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentCheckoutView;