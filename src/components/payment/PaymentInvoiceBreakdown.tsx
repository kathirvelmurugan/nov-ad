import React from 'react';

interface PaymentInvoiceBreakdownProps {
  pricing?: any;
  lang: 'ar' | 'en';
  consultationType?: string;
  invoiceNumber?: string;
}

const PaymentInvoiceBreakdown: React.FC<PaymentInvoiceBreakdownProps> = ({
  pricing,
  lang,
  consultationType,
  invoiceNumber,
}) => {
  const isRTL = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  const baseAmount = Number(pricing?.base ?? pricing?.amount ?? 0);
  const vatRate = 0.15;
  const vatAmount = baseAmount * vatRate;
  const totalAmount = baseAmount + vatAmount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getConsultationLabel = () => {
    if (consultationType === 'tier2_video') {
      return isRTL ? 'استشارة فيديو - الفئة الثانية' : 'Tier 2 Video Consultation';
    }
    return isRTL ? 'استشارة كتابية - الفئة الأولى' : 'Tier 1 Written Consultation';
  };

  const labels = {
    taxInvoice: isRTL ? 'فاتورة ضريبية' : 'Tax Invoice',
    zatcaPhase2: isRTL ? 'المرحلة الثانية - زاتكا' : 'Phase 2 - ZATCA',
    invoiceNumber: isRTL ? 'رقم الفاتورة' : 'Invoice Number',
    packageDetails: isRTL ? 'تفاصيل الباقة' : 'Package Details',
    consultation: isRTL ? 'نوع الاستشارة' : 'Consultation Type',
    breakdown: isRTL ? 'التفصيل المالي' : 'Financial Breakdown',
    subtotal: isRTL ? 'المبلغ الأساسي' : 'Subtotal',
    vat: isRTL ? 'ضريبة القيمة المضافة (١٥٪)' : 'VAT (15%)',
    total: isRTL ? 'الإجمالي' : 'Total',
    aloDoctor: isRTL ? 'آلو دكتور' : 'ALO DOCTOR',
  };

  return (
    <div
      dir={dir}
      className="w-full max-w-2xl mx-auto font-cairo bg-[#E6FAF7] border border-[#00C6AE] rounded-2xl shadow-sm overflow-hidden"
      role="region"
      aria-label={labels.taxInvoice}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#007B6E] to-[#00C6AE] p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-white"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{labels.aloDoctor}</h2>
            <p className="text-sm text-white/80 font-medium">{labels.taxInvoice}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
          </span>
          <span className="text-xs font-semibold text-white tracking-wide uppercase">
            {labels.zatcaPhase2}
          </span>
        </div>
      </div>

      {/* Invoice Meta */}
      <div className="px-4 sm:px-6 py-4 border-b border-[#00C6AE]/30 bg-white/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2 text-[#007B6E]">
          <span className="text-sm font-semibold">{labels.invoiceNumber}:</span>
          <span className="text-sm font-mono bg-[#E6FAF7] px-2 py-0.5 rounded border border-[#00C6AE]/40 text-[#007B6E]">
            {invoiceNumber || (isRTL ? 'غير محدد' : 'N/A')}
          </span>
        </div>
        <div className="text-xs text-[#007B6E]/70 font-medium">
          {new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Package Details */}
        <section aria-labelledby="package-details-heading">
          <h3
            id="package-details-heading"
            className="text-sm font-bold text-[#007B6E] mb-3 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            {labels.packageDetails}
          </h3>
          <div className="bg-white rounded-xl border border-[#00C6AE]/30 p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#E6FAF7] flex items-center justify-center text-[#007B6E]">
                  {consultationType === 'tier2_video' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                      aria-hidden="true"
                    >
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                      aria-hidden="true"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{getConsultationLabel()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isRTL ? 'باقة استشارية طبية' : 'Medical Consultation Package'}
                  </p>
                </div>
              </div>
              <div className="text-left rtl:text-right">
                <p className="font-bold text-[#007B6E] text-sm">1x</p>
              </div>
            </div>
          </div>
        </section>

        {/* Financial Breakdown */}
        <section aria-labelledby="financial-breakdown-heading">
          <h3
            id="financial-breakdown-heading"
            className="text-sm font-bold text-[#007B6E] mb-3 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            {labels.breakdown}
          </h3>
          <div className="bg-white rounded-xl border border-[#00C6AE]/30 overflow-hidden shadow-sm">
            <ul className="divide-y divide-gray-100">
              {/* Subtotal */}
              <li className="flex justify-between items-center p-4 hover:bg-[#E6FAF7]/30 transition-colors">
                <span className="text-sm font-medium text-gray-600">{labels.subtotal}</span>
                <span className="text-sm font-semibold text-gray-800 tabular-nums">
                  {formatCurrency(baseAmount)}
                </span>
              </li>

              {/* VAT */}
              <li className="flex justify-between items-center p-4 hover:bg-[#E6FAF7]/30 transition-colors">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                  {labels.vat}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E6FAF7] text-[#007B6E] border border-[#00C6AE]/30">
                    ZATCA
                  </span>
                </span>
                <span className="text-sm font-semibold text-gray-800 tabular-nums">
                  {formatCurrency(vatAmount)}
                </span>
              </li>

              {/* Total */}
              <li className="flex justify-between items-center p-4 bg-[#007B6E]/5">
                <span className="text-base font-bold text-[#007B6E]">{labels.total}</span>
                <span className="text-lg font-extrabold text-[#007B6E] tabular-nums">
                  {formatCurrency(totalAmount)}
                </span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 bg-[#007B6E]/10 border-t border-[#00C6AE]/30 flex items-center justify-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" aria-hidden="true" />
        <p className="text-[10px] font-medium text-[#007B6E]/80 text-center">
          {isRTL
            ? 'تم إصدار هذه الفاتورة إلكترونياً وفقاً لاشتراطات هيئة الزكاة والضريبة والجمارك'
            : 'This invoice was issued electronically in compliance with ZATCA e-invoicing regulations'}
        </p>
        <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" aria-hidden="true" />
      </div>
    </div>
  );
};

export default PaymentInvoiceBreakdown;