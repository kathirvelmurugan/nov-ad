import React, { useState } from 'react';
import { ClinicalCase } from '../../types';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  lang: 'ar' | 'en';
}

const TEAL_PRIMARY = '#007B6E';
const TEAL_ACCENT = '#00C6AE';
const TEAL_BG = '#E6FAF7';
const WHATSAPP_GREEN = '#25D366';

const CoordinatorPortalView: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'C07' | 'C08' | 'C09' | 'C10'>('C07');
  const [isProcessing, setIsProcessing] = useState(false);
  const [relayMessage, setRelayMessage] = useState('');

  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const fontFamily = isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const t = {
    c07_title: isAr ? 'تأكيد موعد المكالمة' : 'Call Slot Confirmation',
    c07_proposed: isAr ? 'الأوقات المقترحة من الاستشاري الهندي' : 'Proposed Time Slots from Indian Consultant',
    c07_confirm: isAr ? 'تأكيد الموعد' : 'Confirm Slot',
    c07_confirmed: isAr ? 'تم التأكيد' : 'Confirmed',
    c08_title: isAr ? 'إصدار التقرير الأول' : 'Release Report PDF 1',
    c08_action: isAr ? 'إصدار تقرير الرأي الطبي الثاني المعتمد PDF 1 للمريض' : 'Release Certified Second Opinion Report PDF 1 to Patient',
    c08_qr: isAr ? 'رمز التحقق QR' : 'QR Verification Code',
    c08_vat: isAr ? 'إيصال ضريبة القيمة المضافة 15% (ZATCA)' : '15% VAT ZATCA Receipt',
    c09_title: isAr ? 'صندوق متابعة الـ 21 يوماً' : '21-Day Follow-Up Relay Box',
    c09_incoming: isAr ? 'أسئلة المريض الواردة' : 'Incoming Patient Questions',
    c09_relay: isAr ? 'ترحيل السؤال إلى الاستشاري الهندي' : 'Relay Question to Indian Consultant',
    c09_placeholder: isAr ? 'اكتب رسالة إضافية...' : 'Type additional message...',
    c10_title: isAr ? 'إغلاق الحالة وإصدار التقرير الثاني' : 'Case Closure & PDF 2',
    c10_action: isAr ? 'إصدار الملف الشامل النهائي PDF 2 وإغلاق الحالة' : 'Issue Final Comprehensive Dossier PDF 2 & Close Case',
    c10_archived: isAr ? 'الحالة مؤرشفة' : 'Case Archived',
    c10_active: isAr ? 'الحالة نشطة' : 'Case Active',
  };

  const handleConfirmSlot = (slotId: string) => {
    onUpdateCase({ 
      metadata: { 
        ...(activeCase.metadata || {}), 
        confirmedSlotId: slotId,
        stage: 'C08'
      } 
    });
    setActiveTab('C08');
    onAdvanceStage();
  };

  const handleReleasePDF1 = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      onUpdateCase({ 
        metadata: { 
          ...(activeCase.metadata || {}), 
          pdf1Released: true,
          pdf1Timestamp: new Date().toISOString(),
          stage: 'C09'
        } 
      });
      setActiveTab('C09');
      onAdvanceStage();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRelayQuestion = async () => {
    if (!relayMessage.trim()) return;
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const existingRelays = (activeCase.metadata?.relayedQuestions as string[]) || [];
      onUpdateCase({
        metadata: {
          ...(activeCase.metadata || {}),
          relayedQuestions: [...existingRelays, relayMessage],
        }
      });
      setRelayMessage('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIssuePDF2AndClose = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onUpdateCase({
        status: 'closed',
        metadata: {
          ...(activeCase.metadata || {}),
          pdf2Released: true,
          pdf2Timestamp: new Date().toISOString(),
          archived: true,
          stage: 'CLOSED'
        }
      });
      setActiveTab('C10');
      onAdvanceStage();
    } finally {
      setIsProcessing(false);
    }
  };

  const proposedSlots = (activeCase.metadata?.proposedSlots as Array<{ id: string; time: string }>) || [
    { id: 'slot_1', time: isAr ? 'غداً، 10:00 صباحاً بتوقيت الهند' : 'Tomorrow, 10:00 AM IST' },
    { id: 'slot_2', time: isAr ? 'غداً، 02:00 ظهراً بتوقيت الهند' : 'Tomorrow, 02:00 PM IST' },
    { id: 'slot_3', time: isAr ? 'بعد غد، 11:30 صباحاً بتوقيت الهند' : 'Day After, 11:30 AM IST' },
  ];

  const confirmedSlotId = activeCase.metadata?.confirmedSlotId as string | undefined;
  const pdf1Released = activeCase.metadata?.pdf1Released as boolean | undefined;
  const isArchived = activeCase.metadata?.archived as boolean | undefined;
  const incomingQuestions = (activeCase.metadata?.patientQuestions as string[]) || [
    isAr ? 'هل يمكنني تناول الدواء مع الحليب؟' : 'Can I take the medication with milk?',
    isAr ? 'متى يجب أن أبدأ العلاج الطبيعي؟' : 'When should I start physical therapy?',
  ];

  const containerStyle: React.CSSProperties = {
    direction: dir,
    fontFamily,
    backgroundColor: '#F4F7F6',
    minHeight: '100vh',
    padding: isAr ? '24px 32px' : '24px 32px',
    color: '#1A202C',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    borderBottom: `2px solid ${TEAL_BG}`,
    paddingBottom: '16px',
  };

  const tabNavStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  };

  const getTabStyle = (tab: 'C07' | 'C08' | 'C09' | 'C10'): React.CSSProperties => ({
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: activeTab === tab ? 'default' : 'pointer',
    backgroundColor: activeTab === tab ? TEAL_PRIMARY : '#FFFFFF',
    color: activeTab === tab ? '#FFFFFF' : TEAL_PRIMARY,
    fontWeight: 600,
    fontSize: '14px',
    fontFamily,
    boxShadow: activeTab === tab ? `0 4px 12px ${TEAL_PRIMARY}40` : '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
  });

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 24px rgba(0, 123, 110, 0.06)',
    border: `1px solid ${TEAL_BG}`,
    maxWidth: '900px',
    margin: '0 auto',
  };

  const primaryButtonStyle: React.CSSProperties = {
    backgroundColor: TEAL_PRIMARY,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily,
    cursor: isProcessing ? 'not-allowed' : 'pointer',
    opacity: isProcessing ? 0.7 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    width: '100%',
    justifyContent: 'center',
  };

  const whatsappButtonStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    backgroundColor: WHATSAPP_GREEN,
    marginTop: '12px',
  };

  const badgeStyle = (variant: 'success' | 'info' | 'warning'): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 700,
    fontFamily,
    backgroundColor: variant === 'success' ? '#D1FAE5' : variant === 'info' ? TEAL_BG : '#FEF3C7',
    color: variant === 'success' ? '#065F46' : variant === 'info' ? TEAL_PRIMARY : '#92400E',
    border: `1px solid ${variant === 'success' ? '#6EE7B7' : variant === 'info' ? TEAL_ACCENT : '#FCD34D'}`,
  });

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: TEAL_PRIMARY, fontFamily }}>
            {isAr ? 'بوابة المنسق الطبي' : 'Coordinator Portal'}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#718096', fontFamily }}>
            {isAr ? 'رقم الحالة: ' : 'Case ID: '}{activeCase.id || 'ALO-2024-001'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isArchived && (
            <span style={badgeStyle('success')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
              </svg>
              {t.c10_archived}
            </span>
          )}
          {!isArchived && activeTab !== 'C10' && (
            <span style={badgeStyle('info')}>
              {t.c10_active}
            </span>
          )}
        </div>
      </header>

      <nav style={tabNavStyle} role="tablist" aria-label={isAr ? 'مراحل التنسيق' : 'Coordination Stages'}>
        <button role="tab" aria-selected={activeTab === 'C07'} style={getTabStyle('C07')} onClick={() => setActiveTab('C07')}>
          C07 - {isAr ? 'المكالمة' : 'Call'}
        </button>
        <button role="tab" aria-selected={activeTab === 'C08'} style={getTabStyle('C08')} onClick={() => setActiveTab('C08')}>
          C08 - PDF 1
        </button>
        <button role="tab" aria-selected={activeTab === 'C09'} style={getTabStyle('C09')} onClick={() => setActiveTab('C09')}>
          C09 - {isAr ? 'المتابعة' : 'Follow-Up'}
        </button>
        <button role="tab" aria-selected={activeTab === 'C10'} style={getTabStyle('C10')} onClick={() => setActiveTab('C10')}>
          C10 - PDF 2
        </button>
      </nav>

      <main style={cardStyle} role="tabpanel">
        
        {/* SCREEN C07: Call Slot Confirmation */}
        {activeTab === 'C07' && (
          <section aria-labelledby="c07-heading">
            <h2 id="c07-heading" style={{ fontSize: '20px', color: TEAL_PRIMARY, marginBottom: '8px', fontFamily }}>
              {t.c07_title}
            </h2>
            <p style={{ fontSize: '14px', color: '#4A5568', marginBottom: '24px', fontFamily }}>
              {t.c07_proposed}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {proposedSlots.map((slot) => {
                const isConfirmed = confirmedSlotId === slot.id;
                return (
                  <div
                    key={slot.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: `2px solid ${isConfirmed ? TEAL_ACCENT : TEAL_BG}`,
                      backgroundColor: isConfirmed ? `${TEAL_BG}` : '#FFFFFF',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL_PRIMARY} strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span style={{ fontWeight: 600, fontSize: '15px', fontFamily }}>{slot.time}</span>
                    </div>
                    {isConfirmed ? (
                      <span style={badgeStyle('success')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {t.c07_confirmed}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConfirmSlot(slot.id)}
                        disabled={isProcessing || !!confirmedSlotId}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: `1px solid ${TEAL_PRIMARY}`,
                          backgroundColor: 'transparent',
                          color: TEAL_PRIMARY,
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: confirmedSlotId ? 'not-allowed' : 'pointer',
                          opacity: confirmedSlotId ? 0.5 : 1,
                          fontFamily,
                        }}
                      >
                        {t.c07_confirm}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SCREEN C08: Release Report PDF 1 */}
        {activeTab === 'C08' && (
          <section aria-labelledby="c08-heading">
            <h2 id="c08-heading" style={{ fontSize: '20px', color: TEAL_PRIMARY, marginBottom: '8px', fontFamily }}>
              {t.c08_title}
            </h2>
            
            <div style={{
              backgroundColor: TEAL_BG,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: isAr ? 'row-reverse' : 'row',
              gap: '24px',
              alignItems: 'center',
              border: `1px solid ${TEAL_ACCENT}30`,
            }}>
              {/* QR Code Placeholder */}
              <div style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${TEAL_ACCENT}`,
                flexShrink: 0,
              }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={TEAL_PRIMARY} strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="3" height="3" />
                  <rect x="18" y="14" width="3" height="3" />
                  <rect x="14" y="18" width="3" height="3" />
                  <rect x="18" y="18" width="3" height="3" />
                </svg>
              </div>
              
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '14px', color: TEAL_PRIMARY, fontFamily }}>
                  {t.c08_qr}
                </p>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#4A5568', fontFamily }}>
                  {isAr 
                    ? 'امسح رمز QR للتحقق من صحة التقرير وأصالة الرأي الطبي الثاني.' 
                    : 'Scan QR code to verify report authenticity and second opinion certification.'}
                </p>
                
                <a
                  href="#zatca-receipt"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: TEAL_PRIMARY,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    padding: '8px 14px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: `1px solid ${TEAL_ACCENT}`,
                    fontFamily,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  {t.c08_vat}
                </a>
              </div>
            </div>

            {pdf1Released ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <span style={badgeStyle('success')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {isAr ? 'تم إصدار التقرير بنجاح' : 'Report Released Successfully'}
                </span>
              </div>
            ) : (
              <button
                onClick={handleReleasePDF1}
                disabled={isProcessing}
                style={primaryButtonStyle}
                aria-busy={isProcessing}
              >
                {isProcessing ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                )}
                {t.c08_action}
              </button>
            )}
          </section>
        )}

        {/* SCREEN C09: 21-Day Follow-Up Relay Box */}
        {activeTab === 'C09' && (
          <section aria-labelledby="c09-heading">
            <h2 id="c09-heading" style={{ fontSize: '20px', color: TEAL_PRIMARY, marginBottom: '8px', fontFamily }}>
              {t.c09_title}
            </h2>
            <p style={{ fontSize: '14px', color: '#4A5568', marginBottom: '24px', fontFamily }}>
              {t.c09_incoming}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {incomingQuestions.map((question, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${TEAL_BG}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '16px',
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: TEAL_BG,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL_PRIMARY} strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: '#2D3748', fontFamily }}>
                      {question}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleRelayQuestion}
                    disabled={isProcessing}
                    style={whatsappButtonStyle}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {t.c09_relay}
                  </button>
                </div>
              ))}
            </div>

            <div style={{
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: TEAL_BG,
              border: `1px solid ${TEAL_ACCENT}30`,
            }}>
              <textarea
                value={relayMessage}
                onChange={(e) => setRelayMessage(e.target.value)}
                placeholder={t.c09_placeholder}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${TEAL_ACCENT}`,
                  fontFamily,
                  fontSize: '14px',
                  resize: 'vertical',
                  direction: dir,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                aria-label={t.c09_placeholder}
              />
            </div>
          </section>
        )}

        {/* SCREEN C10: Case Closure & PDF 2 */}
        {activeTab === 'C10' && (
          <section aria-labelledby="c10-heading">
            <h2 id="c10-heading" style={{ fontSize: '20px', color: TEAL_PRIMARY, marginBottom: '8px', fontFamily }}>
              {t.c10_title}
            </h2>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '32px',
              padding: '16px 20px',
              backgroundColor: isArchived ? '#D1FAE5' : TEAL_BG,
              borderRadius: '12px',
              border: `1px solid ${isArchived ? '#6EE7B7' : TEAL_ACCENT}`,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isArchived ? '#065F46' : TEAL_PRIMARY} strokeWidth="2">
                <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
              </svg>
              <span style={{
                fontWeight: 700,
                fontSize: '15px',
                color: isArchived ? '#065F46' : TEAL_PRIMARY,
                fontFamily,
              }}>
                {isArchived ? t.c10_archived : t.c10_active}
              </span>
              <span style={badgeStyle(isArchived ? 'success' : 'info')}>
                {activeCase.status === 'closed' 
                  ? (isAr ? 'مغلقة' : 'Closed') 
                  : (isAr ? 'مفتوحة' : 'Open')}
              </span>
            </div>

            {isArchived ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: `1px solid ${TEAL_BG}`,
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={TEAL_ACCENT} strokeWidth="1.5" style={{ marginBottom: '16px' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h3 style={{ margin: '0 0 8px', color: TEAL_PRIMARY, fontFamily, fontSize: '18px' }}>
                  {isAr ? 'تم إغلاق الحالة وأرشفتها بنجاح' : 'Case Successfully Closed & Archived'}
                </h3>
                <p style={{ margin: 0, color: '#718096', fontFamily, fontSize: '14px' }}>
                  {isAr 
                    ? 'الملف الشامل النهائي PDF 2 متاح للتحميل في سجل المريض.' 
                    : 'Final Comprehensive Dossier PDF 2 is available for download in patient records.'}
                </p>
              </div>
            ) : (
              <button
                onClick={handleIssuePDF2AndClose}
                disabled={isProcessing}
                style={{
                  ...primaryButtonStyle,
                  backgroundColor: TEAL_PRIMARY,
                  padding: '18px 32px',
                  fontSize: '17px',
                }}
                aria-busy={isProcessing}
              >
                {isProcessing ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                )}
                {t.c10_action}
              </button>
            )}
          </section>
        )}

      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        button:focus-visible {
          outline: 3px solid ${TEAL_ACCENT};
          outline-offset: 2px;
        }
        textarea:focus-visible {
          border-color: ${TEAL_PRIMARY};
          box-shadow: 0 0 0 3px ${TEAL_ACCENT}40;
        }
        a:hover {
          background-color: ${TEAL_BG} !important;
        }
      `}</style>
    </div>
  );
};

export default CoordinatorPortalView;export { CoordinatorPortalView };
