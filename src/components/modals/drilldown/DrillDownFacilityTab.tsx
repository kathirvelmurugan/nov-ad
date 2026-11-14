import React from 'react';
import { QrCode } from 'lucide-react';

export interface CaseItem {
  id: string;
  checkInCode?: string;
  invoiceNumber?: string;
  packageTier?: string;
  baseAmountSAR?: number;
  vatAmountSAR?: number;
  totalPaidSAR?: number;
  [key: string]: any;
}

export interface DrillDownFacilityTabProps {
  caseItem: CaseItem;
  lang: 'ar' | 'en';
  hospitalName: string;
}

const DrillDownFacilityTab: React.FC<DrillDownFacilityTabProps> = ({
  caseItem,
  lang,
  hospitalName,
}) => {
  const isRTL = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  const labels = {
    ar: {
      facilityOrders: 'أوامر المنشأة وفواتير هيئة الزكاة والضريبة والجمارك',
      receptionCheckIn: 'رمز تسجيل الدخول - استقبال المستشفى',
      hospital: 'المنشأة الصحية',
      checkInCode: 'رمز الدخول',
      scanQr: 'امسح الرمز عند الوصول',
      zatcaInvoice: 'سجل الفاتورة الضريبية (ZATCA)',
      invoiceNumber: 'رقم الفاتورة',
      packageTier: 'فئة الباقة',
      baseAmount: 'المبلغ الأساسي (ريال سعودي)',
      vat15: 'ضريبة القيمة المضافة ١٥٪ (ريال سعودي)',
      totalPaid: 'الإجمالي المدفوع (ريال سعودي)',
      noData: 'لا توجد بيانات متاحة',
    },
    en: {
      facilityOrders: 'Facility Orders & ZATCA Billing',
      receptionCheckIn: 'Hospital Reception Check-in Code',
      hospital: 'Healthcare Facility',
      checkInCode: 'Check-in Code',
      scanQr: 'Scan code upon arrival',
      zatcaInvoice: 'ZATCA VAT Tax Invoice Record',
      invoiceNumber: 'Invoice Number',
      packageTier: 'Package Tier',
      baseAmount: 'Base Amount (SAR)',
      vat15: '15% VAT (SAR)',
      totalPaid: 'Total Paid (SAR)',
      noData: 'No data available',
    },
  };

  const t = labels[lang];

  const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) return t.noData;
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div
      dir={dir}
      className="w-full h-full flex flex-col gap-6 p-4 md:p-6 font-cairo"
      style={{ fontFamily: 'Cairo, sans-serif' }}
    >
      <h2
        className={`text-xl md:text-2xl font-bold text-[#007B6E] ${
          isRTL ? 'text-right' : 'text-left'
        }`}
      >
        {t.facilityOrders}
      </h2>

      {/* Hospital Reception Check-in Code Card */}
      <section
        className="bg-white rounded-2xl shadow-sm border border-[#E6FAF7] overflow-hidden transition-all hover:shadow-md"
        aria-label={t.receptionCheckIn}
      >
        <div className="bg-[#E6FAF7] px-5 py-4 border-b border-[#00C6AE]/20 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#007B6E] flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#00C6AE]" aria-hidden="true" />
            {t.receptionCheckIn}
          </h3>
        </div>

        <div className="p-5 flex flex-col md:flex-row items-center gap-6">
          <div
            className={`flex-shrink-0 w-32 h-32 bg-[#E6FAF7] rounded-xl border-2 border-dashed border-[#00C6AE] flex items-center justify-center ${
              isRTL ? 'md:ml-6' : 'md:mr-6'
            }`}
          >
            <QrCode className="w-16 h-16 text-[#007B6E]" aria-hidden="true" />
          </div>

          <div className={`flex-1 w-full ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500 mb-1">
                {t.hospital}
              </span>
              <span className="block text-base font-semibold text-gray-800">
                {hospitalName || t.noData}
              </span>
            </div>

            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500 mb-1">
                {t.checkInCode}
              </span>
              <span
                className="inline-block px-4 py-2 bg-[#E6FAF7] text-[#007B6E] font-mono text-lg font-bold rounded-lg tracking-widest border border-[#00C6AE]/30"
                dir="ltr"
              >
                {caseItem?.checkInCode || t.noData}
              </span>
            </div>

            <p className="text-sm text-gray-500 italic">{t.scanQr}</p>
          </div>
        </div>
      </section>

      {/* ZATCA VAT Tax Invoice Record Card */}
      <section
        className="bg-white rounded-2xl shadow-sm border border-[#E6FAF7] overflow-hidden transition-all hover:shadow-md"
        aria-label={t.zatcaInvoice}
      >
        <div className="bg-[#007B6E] px-5 py-4">
          <h3 className="text-lg font-semibold text-white">
            {t.zatcaInvoice}
          </h3>
        </div>

        <div className="p-5">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {/* Invoice Number */}
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
              <dt className="text-sm font-medium text-gray-500 mb-1">
                {t.invoiceNumber}
              </dt>
              <dd
                className="text-base font-semibold text-gray-900 bg-[#E6FAF7] px-3 py-1.5 rounded-md font-mono"
                dir="ltr"
              >
                {caseItem?.invoiceNumber || t.noData}
              </dd>
            </div>

            {/* Package Tier */}
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
              <dt className="text-sm font-medium text-gray-500 mb-1">
                {t.packageTier}
              </dt>
              <dd className="text-base font-semibold text-[#007B6E] bg-[#E6FAF7] px-3 py-1.5 rounded-md">
                {caseItem?.packageTier || t.noData}
              </dd>
            </div>

            {/* Base SAR */}
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
              <dt className="text-sm font-medium text-gray-500 mb-1">
                {t.baseAmount}
              </dt>
              <dd className="text-base font-semibold text-gray-900" dir="ltr">
                {formatCurrency(caseItem?.baseAmountSAR)}{' '}
                <span className="text-sm font-normal text-gray-500">SAR</span>
              </dd>
            </div>

            {/* 15% VAT */}
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
              <dt className="text-sm font-medium text-gray-500 mb-1">
                {t.vat15}
              </dt>
              <dd className="text-base font-semibold text-[#00C6AE]" dir="ltr">
                {formatCurrency(caseItem?.vatAmountSAR)}{' '}
                <span className="text-sm font-normal text-gray-500">SAR</span>
              </dd>
            </div>
          </dl>

          {/* Total Paid Divider */}
          <div className="mt-6 pt-5 border-t-2 border-dashed border-[#E6FAF7]">
            <div
              className={`flex items-center justify-between ${
                isRTL ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <span className="text-lg font-bold text-[#007B6E]">
                {t.totalPaid}
              </span>
              <span
                className="text-2xl font-extrabold text-[#007B6E] bg-[#E6FAF7] px-5 py-2 rounded-xl border border-[#00C6AE]/30"
                dir="ltr"
              >
                {formatCurrency(caseItem?.totalPaidSAR)}{' '}
                <span className="text-base font-semibold">SAR</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DrillDownFacilityTab;