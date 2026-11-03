import React, { useState, useCallback, useMemo } from 'react';

interface ReferralDossier {
  caseId: string;
  patientNameAr: string;
  patientNameEn: string;
  referringDoctorAr: string;
  referringDoctorEn: string;
  focusQuestionsAr: string[];
  focusQuestionsEn: string[];
  recommendedConsultantAr: string;
  recommendedConsultantEn: string;
  specialtyAr: string;
  specialtyEn: string;
}

interface FeeBreakdown {
  baseSar: number;
  vatRate: number;
  vatAmount: number;
  totalSar: number;
  tabbyMonthly: number;
}

const MOCK_DOSSIER: ReferralDossier = {
  caseId: 'ALO-CRD-2024-0892',
  patientNameAr: 'أحمد محمد العتيبي',
  patientNameEn: 'Ahmed Mohammed Al-Otaibi',
  referringDoctorAr: 'د. سارة الخالدي',
  referringDoctorEn: 'Dr. Sarah Al-Khalidi',
  focusQuestionsAr: [
    'هل الحالة تستدعي تدخلاً جراحياً فورياً أم يمكن تأجيله؟',
    'ما هي الخيارات العلاجية البديلة المتاحة دولياً؟',
    'هل توجد موانع طبية للتخدير العام بناءً على التاريخ المرضي؟'
  ],
  focusQuestionsEn: [
    'Does the condition require immediate surgical intervention or can it be delayed?',
    'What are the alternative treatment options available internationally?',
    'Are there any medical contraindications for general anesthesia based on history?'
  ],
  recommendedConsultantAr: 'د. جون سميث - استشاري جراحة دقيقة',
  recommendedConsultantEn: 'Dr. John Smith - Precision Surgery Consultant',
  specialtyAr: 'جراحة الأعصاب الدقيقة',
  specialtyEn: 'Micro-Neurosurgery'
};

const calculateFees = (base: number): FeeBreakdown => {
  const vatRate = 0.15;
  const vatAmount = base * vatRate;
  const totalSar = base + vatAmount;
  return {
    baseSar: base,
    vatRate,
    vatAmount,
    totalSar,
    tabbyMonthly: totalSar / 4
  };
};

type PortalStep = 'C01_REVIEW' | 'C03_FEES' | 'C04_DISPATCH' | 'C05_C06_VERIFY_FORWARD';

export default function CoordinatorPortalView() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [currentStep, setCurrentStep] = useState<PortalStep>('C01_REVIEW');
  const [isDispatching, setIsDispatching] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const isRtl = lang === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';
  const fontFamily = isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif";
  const fees = useMemo(() => calculateFees(4500), []);
  const dossier = MOCK_DOSSIER;

  const t = useCallback((ar: string, en: string) => (isRtl ? ar : en), [isRtl]);

  const handleGenerateLink = async () => {
    setIsDispatching(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsDispatching(false);
    setCurrentStep('C05_C06_VERIFY_FORWARD');
  };

  const handleVerifyPayment = () => {
    setPaymentVerified(true);
  };

  const handleForwardCase = async () => {
    setIsForwarding(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsForwarding(false);
    alert(t('تم تفعيل نافذة الـ 48 ساعة بنجاح!', '48h SLA window activated successfully!'));
  };

  const containerStyle: React.CSSProperties = {
    direction: dir,
    fontFamily,
    backgroundColor: '#E6FAF7',
    minHeight: '100vh',
    padding: isRtl ? '2rem 2rem 2rem 2rem' : '2rem',
    color: '#1A1A1A'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 24px rgba(0, 123, 110, 0.08)',
    border: '1px solid #00C6AE33',
    marginBottom: '24px'
  };

  const primaryBtnStyle: React.CSSProperties = {
    backgroundColor: '#007B6E',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    width: '100%'
  };

  const whatsappBtnStyle: React.CSSProperties = {
    ...primaryBtnStyle,
    backgroundColor: '#25D366'
  };

  const secondaryBtnStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: '#007B6E',
    border: '2px solid #007B6E',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily,
    transition: 'all 0.2s ease'
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: paymentVerified ? '#E6FAF7' : '#FEF3C7',
    color: paymentVerified ? '#007B6E' : '#D97706',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 700,
    border: `1px solid ${paymentVerified ? '#00C6AE' : '#FCD34D'}`
  };

  return (
    <div style={containerStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', maxWidth: '900px', margin: '0 auto 32px auto' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#007B6E', margin: 0 }}>
            {t('بوابة منسق آلو', 'ALO Coordinator Portal')}
          </h1>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            {t('إدارة ملف الإحالة والتسعير', 'Referral Dossier & Pricing Management')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setLang('ar')}
            style={{
              ...secondaryBtnStyle,
              padding: '8px 16px',
              fontSize: '13px',
              backgroundColor: lang === 'ar' ? '#007B6E' : 'transparent',
              color: lang === 'ar' ? '#FFF' : '#007B6E',
              border: lang === 'ar' ? '2px solid #007B6E' : '2px solid #007B6E'
            }}
            aria-label="Switch to Arabic"
          >
            عربي
          </button>
          <button
            onClick={() => setLang('en')}
            style={{
              ...secondaryBtnStyle,
              padding: '8px 16px',
              fontSize: '13px',
              backgroundColor: lang === 'en' ? '#007B6E' : 'transparent',
              color: lang === 'en' ? '#FFF' : '#007B6E',
              border: lang === 'en' ? '2px solid #007B6E' : '2px solid #007B6E'
            }}
            aria-label="Switch to English"
          >
            EN
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Progress Indicator */}
        <nav aria-label="Portal Steps" style={{ display: 'flex', gap: '4px', marginBottom: '32px' }}>
          {['C01_REVIEW', 'C03_FEES', 'C04_DISPATCH', 'C05_C06_VERIFY_FORWARD'].map((step, idx) => {
            const stepKeys = ['C01_REVIEW', 'C03_FEES', 'C04_DISPATCH', 'C05_C06_VERIFY_FORWARD'];
            const currentIdx = stepKeys.indexOf(currentStep);
            const isActive = idx <= currentIdx;
            return (
              <div
                key={step}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: isActive ? '#00C6AE' : '#D1FAE5',
                  transition: 'background-color 0.3s ease'
                }}
                role="presentation"
              />
            );
          })}
        </nav>

        {/* C01: Review Doctor Referral Dossier */}
        {(currentStep === 'C01_REVIEW' || currentStep === 'C03_FEES' || currentStep === 'C04_DISPATCH' || currentStep === 'C05_C06_VERIFY_FORWARD') && (
          <section style={cardStyle} aria-labelledby="c01-heading">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 id="c01-heading" style={{ fontSize: '20px', fontWeight: 700, color: '#007B6E', margin: '0 0 4px 0' }}>
                  {t('ملف الإحالة الطبي', 'Medical Referral Dossier')}
                </h2>
                <span style={{ fontSize: '13px', color: '#666', backgroundColor: '#E6FAF7', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                  {dossier.caseId}
                </span>
              </div>
              <span style={badgeStyle}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                {t('تمت المراجعة', 'Reviewed')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', backgroundColor: '#F8FFFE', borderRadius: '12px', border: '1px solid #E6FAF7' }}>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0', fontWeight: 600 }}>{t('اسم المريض', 'Patient Name')}</p>
                <p style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#1A1A1A' }}>{isRtl ? dossier.patientNameAr : dossier.patientNameEn}</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#F8FFFE', borderRadius: '12px', border: '1px solid #E6FAF7' }}>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0', fontWeight: 600 }}>{t('الطبيب المحيل', 'Referring Doctor')}</p>
                <p style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#1A1A1A' }}>{isRtl ? dossier.referringDoctorAr : dossier.referringDoctorEn}</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#F8FFFE', borderRadius: '12px', border: '1px solid #E6FAF7' }}>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0', fontWeight: 600 }}>{t('التخصص المطلوب', 'Required Specialty')}</p>
                <p style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#1A1A1A' }}>{isRtl ? dossier.specialtyAr : dossier.specialtyEn}</p>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#007B6E', marginBottom: '12px' }}>
                {t('أسئلة التركيز الثلاث', '3 Focus Questions')}
              </h3>
              <ol style={{ margin: 0, paddingInlineStart: isRtl ? '0' : '20px', paddingInlineEnd: isRtl ? '20px' : '0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(isRtl ? dossier.focusQuestionsAr : dossier.focusQuestionsEn).map((q, i) => (
                  <li key={i} style={{ fontSize: '15px', lineHeight: 1.6, color: '#333', backgroundColor: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E6FAF7' }}>
                    {q}
                  </li>
                ))}
              </ol>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#007B6E', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#00C6AE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#A7F3D0', margin: '0 0 2px 0', fontWeight: 600 }}>{t('الاستشاري الدولي الموصى به', 'Recommended International Consultant')}</p>
                <p style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>{isRtl ? dossier.recommendedConsultantAr : dossier.recommendedConsultantEn}</p>
              </div>
            </div>

            {currentStep === 'C01_REVIEW' && (
              <div style={{ marginTop: '24px' }}>
                <button
                  style={primaryBtnStyle}
                  onClick={() => setCurrentStep('C03_FEES')}
                  aria-label={t('متابعة لتأكيد الرسوم', 'Proceed to fee confirmation')}
                >
                  {t('متابعة لمراجعة الرسوم', 'Proceed to Fee Review')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            )}
          </section>
        )}

        {/* C03: Service Fee Confirmation Card */}
        {(currentStep === 'C03_FEES' || currentStep === 'C04_DISPATCH' || currentStep === 'C05_C06_VERIFY_FORWARD') && (
          <section style={cardStyle} aria-labelledby="c03-heading">
            <h2 id="c03-heading" style={{ fontSize: '20px', fontWeight: 700, color: '#007B6E', margin: '0 0 20px 0' }}>
              {t('تأكيد رسوم الخدمة', 'Service Fee Confirmation')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px dashed #E6FAF7' }}>
                <span style={{ fontSize: '15px', color: '#666', fontWeight: 500 }}>{t('الرسوم الأساسية', 'Base Fee')}</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>{fees.baseSar.toLocaleString()} {t('ر.س', 'SAR')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px dashed #E6FAF7' }}>
                <span style={{ fontSize: '15px', color: '#666', fontWeight: 500 }}>{t('ضريبة القيمة المضافة (15%)', 'VAT (15%)')}</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>{fees.vatAmount.toLocaleString()} {t('ر.س', 'SAR')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#E6FAF7', borderRadius: '12px' }}>
                <span style={{ fontSize: '18px', color: '#007B6E', fontWeight: 800 }}>{t('الإجمالي', 'Total')}</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#007B6E' }}>{fees.totalSar.toLocaleString()} {t('ر.س', 'SAR')}</span>
              </div>
            </div>

            <div style={{ padding: '20px', backgroundColor: '#F8FFFE', borderRadius: '12px', border: '1px solid #00C6AE33' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C6AE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#007B6E', margin: 0 }}>{t('تقسيط عبر تابي (4 أشهر)', 'Tabby Installment (4 Months)')}</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[1, 2, 3, 4].map(month => (
                  <div key={month} style={{ textAlign: 'center', padding: '12px 8px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E6FAF7' }}>
                    <p style={{ fontSize: '11px', color: '#666', margin: '0 0 4px 0', fontWeight: 600 }}>{t(`شهر ${month}`, `Month ${month}`)}</p>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: '#007B6E', margin: 0 }}>{fees.tabbyMonthly.toFixed(2)} {t('ر.س', 'SAR')}</p>
                  </div>
                ))}
              </div>
            </div>

            {currentStep === 'C03_FEES' && (
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button style={{ ...secondaryBtnStyle, flex: 1 }} onClick={() => setCurrentStep('C01_REVIEW')}>
                  {t('رجوع', 'Back')}
                </button>
                <button style={{ ...primaryBtnStyle, flex: 2 }} onClick={() => setCurrentStep('C04_DISPATCH')}>
                  {t('تأكيد ومتابعة للدفع', 'Confirm & Proceed to Payment')}
                </button>
              </div>
            )}
          </section>
        )}

        {/* C04: Action Button Generate & Dispatch ZATCA Link */}
        {currentStep === 'C04_DISPATCH' && (
          <section style={cardStyle} aria-labelledby="c04-heading">
            <h2 id="c04-heading" style={{ fontSize: '20px', fontWeight: 700, color: '#007B6E', margin: '0 0 12px 0' }}>
              {t('إرسال رابط الدفع', 'Dispatch Payment Link')}
            </h2>
            <p style={{ fontSize: '15px', color: '#666', margin: '0 0 24px 0', lineHeight: 1.6 }}>
              {t('سيتم إنشاء رابط دفع متوافق مع هيئة الزكاة والضريبة والجمارك (ZATCA) وإرساله للمريض عبر واتساب أو رسالة نصية.', 'A ZATCA-compliant payment link will be generated and dispatched to the patient via WhatsApp or SMS.')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                style={{ ...whatsappBtnStyle, opacity: isDispatching ? 0.7 : 1 }}
                onClick={handleGenerateLink}
                disabled={isDispatching}
                aria-busy={isDispatching}
              >
                {isDispatching ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                    {t('جاري الإنشاء والإرسال...', 'Generating & Dispatching...')}
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    {t('إنشاء وإرسال رابط ZATCA عبر واتساب / SMS', 'Generate & Dispatch ZATCA Link via WhatsApp/SMS')}
                  </>
                )}
              </button>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </section>
        )}

        {/* C05-C06: Payment Receipt Verification & Forward Case */}
        {currentStep === 'C05_C06_VERIFY_FORWARD' && (
          <section style={cardStyle} aria-labelledby="c05-heading">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 id="c05-heading" style={{ fontSize: '20px', fontWeight: 700, color: '#007B6E', margin: 0 }}>
                {t('التحقق من الاستلام وتحويل الملف', 'Receipt Verification & Case Forwarding')}
              </h2>
              <span style={badgeStyle}>
                {paymentVerified ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    {t('تم التحقق من الدفع', 'Payment Verified')}
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {t('في انتظار الدفع', 'Pending Payment')}
                  </>
                )}
              </span>
            </div>

            {!paymentVerified ? (
              <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#FEF3C7', borderRadius: '12px', border: '1px solid #FCD34D' }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#92400E', margin: '0 0 16px 0' }}>
                  {t('لم يتم استلام تأكيد الدفع بعد. يرجى التحقق من بوابة الدفع ثم النقر أدناه.', 'Payment confirmation not yet received. Please verify via the payment gateway then click below.')}
                </p>
                <button
                  style={{ ...primaryBtnStyle, backgroundColor: '#D97706', maxWidth: '300px', margin: '0 auto' }}
                  onClick={handleVerifyPayment}
                >
                  {t('تأكيد استلام الدفعة', 'Confirm Payment Receipt')}
                </button>
              </div>
            ) : (
              <div style={{ padding: '24px', backgroundColor: '#E6FAF7', borderRadius: '16px', border: '2px solid #00C6AE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#00C6AE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#007B6E', margin: '0 0 4px 0' }}>
                      {t('تم استلام الدفعة بنجاح', 'Payment Successfully Received')}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#007B6E', margin: 0, fontWeight: 500 }}>
                      {t('المبلغ:', 'Amount:')} {fees.totalSar.toLocaleString()} {t('ر.س', 'SAR')} • {t('رقم العملية:', 'Txn ID:')} ZATCA-{Date.now().toString().slice(-6)}
                    </p>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #00C6AE', paddingTop: '20px', marginTop: '8px' }}>
                  <p style={{ fontSize: '15px', color: '#333', margin: '0 0 16px 0', lineHeight: 1.6, fontWeight: 500 }}>
                    {t('يمكنك الآن تحويل الملف للاستشاري الدولي. سيؤدي هذا الإجراء إلى تفعيل نافذة اتفاقية مستوى الخدمة (SLA) لمدة 48 ساعة.', 'You may now forward the case to the International Consultant. This action will activate the 48-hour SLA window.')}
                  </p>
                  
                  <button
                    style={{
                      ...primaryBtnStyle,
                      backgroundColor: '#007B6E',
                      opacity: isForwarding ? 0.8 : 1,
                      boxShadow: '0 4px 14px rgba(0, 123, 110, 0.3)'
                    }}
                    onClick={handleForwardCase}
                    disabled={isForwarding}
                    aria-busy={isForwarding}
                  >
                    {isForwarding ? (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                        {t('جاري التحويل...', 'Forwarding...')}
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        {t('تحويل الملف للاستشاري الدولي (تفعيل SLA 48 ساعة)', 'Forward Case to International Consultant (Activate 48h SLA)')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer style={{ maxWidth: '900px', margin: '40px auto 0 auto', textAlign: 'center', padding: '20px', borderTop: '1px solid #00C6AE33' }}>
        <p style={{ fontSize: '13px', color: '#666', margin: 0, fontWeight: 500 }}>
          ALO DOCTOR v2.4 Saudi Edition • {t('بوابة المنسق', 'Coordinator Portal')} • {t('جميع الحقوق محفوظة', 'All Rights Reserved')} © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}