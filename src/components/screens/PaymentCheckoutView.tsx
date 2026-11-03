import React, { useState } from 'react';
import { ClinicalCase } from '../../types';
import { CreditCard, CheckCircle2, ShieldCheck, Receipt, ArrowRight, Zap, QrCode, Sparkles, Video, FileText, Users } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  lang?: 'ar' | 'en';
}

interface TierConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  baseSar: number;
  vatSar: number;
  totalSar: number;
  featuresAr: string[];
  featuresEn: string[];
  icon: React.ReactNode;
  recommended: boolean;
}

const TIERS: TierConfig[] = [
  {
    id: 'tier_1_written',
    nameAr: 'تقرير رأي طبي ثانٍ مكتوب',
    nameEn: 'Written Second Opinion Report',
    baseSar: 1200,
    vatSar: 180,
    totalSar: 1380,
    featuresAr: ['استشاري أول متخصص', 'ضمان استجابة خلال 48 ساعة', 'ملف PDF رقمي معتمد ومختوم'],
    featuresEn: ['Senior Consultant', '48-Hour SLA', 'Digital Stamped PDF'],
    icon: <FileText className="w-6 h-6" />,
    recommended: false
  },
  {
    id: 'tier_2_video',
    nameAr: 'تقرير مكتوب + استشارة مرئية 30 دقيقة',
    nameEn: 'Written Report + 30-min Video Telehealth',
    baseSar: 2500,
    vatSar: 375,
    totalSar: 2875,
    featuresAr: ['مكالمة مرئية WebRTC لمدة 30 دقيقة', 'ترجمة طبية مباشرة مع ممرضة آلو سارة', 'ملف PDF مزدوج التوقيع', 'متابعة أسئلة بعد المكالمة لمدة 21 يوماً'],
    featuresEn: ['30-Min WebRTC Video Call', 'ALO Nurse Sara Live Medical Translation', 'Dual-Signed PDF', '21-Day Post-Call Q&A Relay'],
    icon: <Video className="w-6 h-6" />,
    recommended: true
  },
  {
    id: 'tier_3_board',
    nameAr: 'لجنة أورام متعددة التخصصات / جراحية معقدة',
    nameEn: 'Multidisciplinary Tumor Board / Complex Surgical Panel',
    baseSar: 4500,
    vatSar: 675,
    totalSar: 5175,
    featuresAr: ['3 استشاريين دوليين فائقي التخصص', 'ملف شامل متعدد التخصصات', 'تخطيط جراحي معقد', 'لوجستيات رعاية الشركاء الكاملة'],
    featuresEn: ['3 International Super-Specialists', 'Comprehensive Multi-Disciplinary Dossier', 'Complex Surgical Planning', 'Full Partner Care Logistics'],
    icon: <Users className="w-6 h-6" />,
    recommended: false
  }
];

type PaymentMethod = 'mada' | 'apple_pay' | 'tabby' | 'visa_mc';

export const PaymentCheckoutView: React.FC<Props> = ({ activeCase, onAdvanceStage, onUpdateCase, lang = 'ar' }) => {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const fontFamily = isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const initialTierId = activeCase.pricing?.tier || 'tier_2_video';
  const [selectedTierId, setSelectedTierId] = useState<string>(initialTierId);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mada');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedTier = TIERS.find(t => t.id === selectedTierId) || TIERS[1];
  const tabbySplit = (selectedTier.totalSar / 4).toFixed(2);

  const handleTierSelect = (tier: TierConfig) => {
    setSelectedTierId(tier.id);
    onUpdateCase({
      pricing: {
        ...activeCase.pricing,
        tier: tier.id,
        baseSar: tier.baseSar,
        vatSar: tier.vatSar,
        totalSar: tier.totalSar,
        tierName: isAr ? tier.nameAr : tier.nameEn
      }
    });
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const tapChargeId = `chg_tap_ksa_${Math.floor(100000 + Math.random() * 900000)}`;

    onUpdateCase({
      pricing: {
        ...activeCase.pricing,
        paid: true,
        tier: selectedTier.id,
        tierName: isAr ? selectedTier.nameAr : selectedTier.nameEn,
        baseSar: selectedTier.baseSar,
        vatSar: selectedTier.vatSar,
        totalSar: selectedTier.totalSar,
        invoiceNumber,
        tapChargeId
      },
      metadata: {
        ...activeCase.metadata,
        paymentMethod: selectedMethod,
        paidAt: new Date().toISOString()
      }
    });

    setIsProcessing(false);
    onAdvanceStage();
  };

  const paymentMethods: { id: PaymentMethod; labelAr: string; labelEn: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'mada', labelAr: 'مدى', labelEn: 'mada', icon: <CreditCard className="w-5 h-5" />, badge: isAr ? 'الأكثر شعبية' : 'Most Popular' },
    { id: 'apple_pay', labelAr: 'Apple Pay', labelEn: 'Apple Pay', icon: <Zap className="w-5 h-5" />, badge: isAr ? 'بنقرة واحدة' : '1-Click' },
    { id: 'tabby', labelAr: 'تابي', labelEn: 'Tabby', icon: <Sparkles className="w-5 h-5" />, badge: isAr ? 'قسّمها 4 بدون فوائد' : '4 Interest-Free Split' },
    { id: 'visa_mc', labelAr: 'فيزا / ماستركارد', labelEn: 'Visa / Mastercard', icon: <CreditCard className="w-5 h-5" /> }
  ];

  return (
    <div 
      dir={dir} 
      style={{ fontFamily }} 
      className="min-h-screen bg-[#E6FAF7] py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#007B6E]">
            {isAr ? 'إتمام الدفع واختيار الباقة' : 'Complete Payment & Select Package'}
          </h1>
          <p className="text-gray-600">
            {isAr ? 'رقم الحالة: ' : 'Case Number: '}{activeCase.caseNumber}
          </p>
        </div>

        {/* 3-Tier Selection Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const isSelected = selectedTierId === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => handleTierSelect(tier)}
                className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 text-start bg-white shadow-sm hover:shadow-lg focus:outline-none ${
                  isSelected 
                    ? 'border-[#007B6E] ring-4 ring-[#00C6AE]/30 scale-[1.02]' 
                    : 'border-transparent hover:border-[#00C6AE]'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#007B6E] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {isAr ? 'الأكثر طلباً' : 'Recommended'}
                  </div>
                )}

                <div className={`p-3 rounded-xl w-fit mb-4 ${isSelected ? 'bg-[#E6FAF7] text-[#007B6E]' : 'bg-gray-100 text-gray-500'}`}>
                  {tier.icon}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {isAr ? tier.nameAr : tier.nameEn}
                </h3>

                <div className="space-y-1 mb-6 flex-grow">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{isAr ? 'الأساس' : 'Base'}</span>
                    <span>SAR {tier.baseSar.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{isAr ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}</span>
                    <span>SAR {tier.vatSar.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-[#007B6E] pt-2 border-t border-gray-100 mt-2">
                    <span>{isAr ? 'الإجمالي' : 'Total'}</span>
                    <span>SAR {tier.totalSar.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#00C6AE] font-semibold mt-1">
                    <span>Tabby</span>
                    <span>SAR {(tier.totalSar / 4).toFixed(2)}/{isAr ? 'شهر' : 'mo'}</span>
                  </div>
                </div>

                <ul className="space-y-3">
                  {(isAr ? tier.featuresAr : tier.featuresEn).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? 'text-[#007B6E]' : 'text-gray-300'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Payment Methods & Action */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Payment Methods */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#007B6E]" />
                {isAr ? 'طريقة الدفع' : 'Payment Method'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const isActive = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        isActive 
                          ? 'border-[#007B6E] bg-[#E6FAF7]' 
                          : 'border-gray-100 hover:border-[#00C6AE] bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={isActive ? 'text-[#007B6E]' : 'text-gray-400'}>
                          {method.icon}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {isAr ? method.labelAr : method.labelEn}
                        </span>
                      </div>
                      {method.badge && (
                        <span className="text-[10px] font-bold bg-[#007B6E] text-white px-2 py-0.5 rounded-full">
                          {method.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Tabby Info */}
              {selectedMethod === 'tabby' && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-purple-900 font-medium">
                    {isAr 
                      ? `ادفع SAR ${tabbySplit} شهرياً لمدة 4 أشهر بدون أي فوائد أو رسوم خفية.` 
                      : `Pay SAR ${tabbySplit}/month for 4 months with zero interest or hidden fees.`}
                  </p>
                </div>
              )}
            </div>

            {/* ZATCA Phase-2 Tax Invoice Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#007B6E]" />
                  {isAr ? 'فاتورة ضريبية (ZATCA المرحلة الثانية)' : 'Tax Invoice (ZATCA Phase-2)'}
                </h2>
                <div className="flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-gray-400" />
                  <ShieldCheck className="w-6 h-6 text-[#007B6E]" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                  <span className="text-gray-600">{isAr ? 'رقم الحالة' : 'Case Number'}</span>
                  <span className="font-mono font-semibold text-gray-900">{activeCase.caseNumber}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                  <span className="text-gray-600">{isAr ? 'الباقة المختارة' : 'Selected Package'}</span>
                  <span className="font-semibold text-gray-900 text-end max-w-[60%]">
                    {isAr ? selectedTier.nameAr : selectedTier.nameEn}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                  <span className="text-gray-600">{isAr ? 'رسوم الخدمة' : 'Service Fee'}</span>
                  <span className="font-semibold text-gray-900">SAR {selectedTier.baseSar.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                  <span className="text-gray-600">{isAr ? 'ضريبة القيمة المضافة (15% ZATCA)' : 'VAT (15% ZATCA)'}</span>
                  <span className="font-semibold text-gray-900">SAR {selectedTier.vatSar.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-4 mt-2 bg-[#E6FAF7] rounded-xl px-4">
                  <span className="text-lg font-bold text-[#007B6E]">{isAr ? 'الإجمالي المستحق' : 'Total Amount Due'}</span>
                  <span className="text-2xl font-black text-[#007B6E]">SAR {selectedTier.totalSar.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <QrCode className="w-3 h-3" />
                  <span>{isAr ? 'رمز QR متوافق مع ZATCA' : 'ZATCA Compliant QR Code'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{isAr ? 'متوافق مع معايير SAMA' : 'SAMA Compliance Badge'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Summary & Checkout Action */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {isAr ? 'ملخص الطلب' : 'Order Summary'}
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-3 bg-[#E6FAF7] rounded-xl">
                  <div className="text-[#007B6E]">
                    {selectedTier.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {isAr ? selectedTier.nameAr : selectedTier.nameEn}
                    </p>
                    <p className="text-xs text-[#007B6E] font-semibold">
                      {isAr ? 'الباقة المختارة' : 'Selected Tier'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{isAr ? 'الدفع عبر' : 'Paying via'}</p>
                  <p className="text-sm font-bold text-gray-900 capitalize">
                    {paymentMethods.find(m => m.id === selectedMethod)?.[isAr ? 'labelAr' : 'labelEn']}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="font-semibold">SAR {selectedTier.baseSar.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{isAr ? 'الضريبة' : 'Tax'}</span>
                  <span className="font-semibold">SAR {selectedTier.vatSar.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-black pt-3 border-t-2 border-gray-100">
                  <span className="text-[#007B6E]">{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-[#007B6E]">SAR {selectedTier.totalSar.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-[#007B6E] hover:bg-[#00655A] disabled:bg-[#00C6AE]/50 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{isAr ? 'جاري معالجة الدفع...' : 'Processing Payment...'}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isAr 
                        ? `إتمام الدفع (SAR ${selectedTier.totalSar.toLocaleString()} عبر ${paymentMethods.find(m => m.id === selectedMethod)?.labelAr})`
                        : `Complete Payment (SAR ${selectedTier.totalSar.toLocaleString()} via ${paymentMethods.find(m => m.id === selectedMethod)?.labelEn})`}
                    </span>
                    <ArrowRight className={`w-5 h-5 transition-transform ${isAr ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="w-3 h-3" />
                <span>{isAr ? 'معاملة مشفرة وآمنة 100%' : '100% Secure Encrypted Transaction'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentCheckoutView;