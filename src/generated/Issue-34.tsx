import React, { useState, useCallback, useMemo } from 'react';

// --- Types & Interfaces ---
type PersonaId = 'patient' | 'doctor' | 'nurse' | 'lab_tech' | 'pharmacist' | 'receptionist' | 'admin' | 'paramedic' | 'family' | 'billing' | 'system';

interface PersonaProfile {
  id: PersonaId;
  labelAr: string;
  labelEn: string;
}

interface LabRequisition {
  id: string;
  testName: string;
  testNameAr: string;
  status: 'ordered' | 'sample_collected' | 'results_uploaded';
  orderedBy: string;
}

interface PharmacyOrder {
  id: string;
  medication: string;
  medicationAr: string;
  dosage: string;
  status: 'ordered' | 'verified' | 'dispensed';
}

interface ReceptionTicket {
  id: string;
  aloCode: string;
  caseRef: string;
  patientName: string;
  patientNameAr: string;
  slaStatus: 'pending' | 'arrived' | 'room_assigned';
  room?: string;
}

// --- Constants ---
const TEAL_PRIMARY = '#007B6E';
const TEAL_ACCENT = '#00C6AE';
const TEAL_BG = '#E6FAF7';
const WHATSAPP_GREEN = '#25D366';

const PERSONAS: PersonaProfile[] = [
  { id: 'patient', labelAr: 'المريض', labelEn: 'Patient' },
  { id: 'doctor', labelAr: 'الطبيب المعالج', labelEn: 'Treating Doctor' },
  { id: 'nurse', labelAr: 'الممرض', labelEn: 'Nurse' },
  { id: 'lab_tech', labelAr: 'فني المختبر', labelEn: 'Lab Technician' },
  { id: 'pharmacist', labelAr: 'الصيدلي', labelEn: 'Pharmacist' },
  { id: 'receptionist', labelAr: 'موظف الاستقبال', labelEn: 'Receptionist' },
  { id: 'admin', labelAr: 'إدارة المركز', labelEn: 'Admin' },
  { id: 'paramedic', labelAr: 'المسعف', labelEn: 'Paramedic' },
  { id: 'family', labelAr: 'مرافق المريض', labelEn: 'Family Member' },
  { id: 'billing', labelAr: 'الفوترة', labelEn: 'Billing' },
  { id: 'system', labelAr: 'النظام', labelEn: 'System' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; labelAr: string; labelEn: string }> = {
  ordered: { bg: '#FEF3C7', text: '#92400E', labelAr: 'تم الطلب', labelEn: 'Ordered' },
  sample_collected: { bg: '#DBEAFE', text: '#1E40AF', labelAr: 'تم سحب العينة', labelEn: 'Sample Collected' },
  results_uploaded: { bg: TEAL_BG, text: TEAL_PRIMARY, labelAr: 'تم رفع النتائج', labelEn: 'Results Uploaded' },
  verified: { bg: '#E0E7FF', text: '#3730A3', labelAr: 'تم التحقق', labelEn: 'Verified' },
  dispensed: { bg: TEAL_BG, text: TEAL_PRIMARY, labelAr: 'تم الصرف', labelEn: 'Dispensed' },
  pending: { bg: '#F3F4F6', text: '#374151', labelAr: 'في الانتظار', labelEn: 'Pending' },
  arrived: { bg: '#DCFCE7', text: '#166534', labelAr: 'وصل', labelEn: 'Arrived' },
  room_assigned: { bg: TEAL_BG, text: TEAL_PRIMARY, labelAr: 'تم تخصيص الغرفة', labelEn: 'Room Assigned' },
};

// --- Component ---
const PartnerServicesView: React.FC = () => {
  const [isRtl, setIsRtl] = useState<boolean>(true);
  const [activePersona, setActivePersona] = useState<PersonaId>('admin');
  const [caseStage, setCaseStage] = useState<'IN_HOUSE_PROCESSING' | 'FOLLOW_UP_21_DAYS'>('IN_HOUSE_PROCESSING');

  // Mock State Data
  const [labQueue, setLabQueue] = useState<LabRequisition[]>([
    { id: 'L01-REQ-01', testName: 'Troponin-I', testNameAr: 'تروبونين-آي', status: 'ordered', orderedBy: 'Dr. Abdullah' },
    { id: 'L01-REQ-02', testName: 'CBC', testNameAr: 'تحليل دم شامل', status: 'sample_collected', orderedBy: 'Dr. Abdullah' },
    { id: 'L01-REQ-03', testName: 'Renal Panel', testNameAr: 'وظائف الكلى', status: 'ordered', orderedBy: 'Dr. Abdullah' },
  ]);

  const [pharmacyQueue, setPharmacyQueue] = useState<PharmacyOrder[]>([
    { id: 'PH01-RX-01', medication: 'Aspirin', medicationAr: 'أسبرين', dosage: '81mg', status: 'ordered' },
    { id: 'PH01-RX-02', medication: 'Atorvastatin', medicationAr: 'أتورفاستاتين', dosage: '40mg', status: 'verified' },
  ]);

  const [receptionQueue, setReceptionQueue] = useState<ReceptionTicket[]>([
    { id: 'REC01-T-01', aloCode: 'ALO-RC-8812', caseRef: 'CASE-SARAT-992', patientName: 'Mohammed Ali', patientNameAr: 'محمد علي', slaStatus: 'pending' },
  ]);

  // Handlers
  const handleAdvanceLabStatus = useCallback((id: string) => {
    setLabQueue(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (item.status === 'ordered') return { ...item, status: 'sample_collected' };
      if (item.status === 'sample_collected') return { ...item, status: 'results_uploaded' };
      return item;
    }));
  }, []);

  const handleAdvancePharmacyStatus = useCallback((id: string) => {
    setPharmacyQueue(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (item.status === 'ordered') return { ...item, status: 'verified' };
      if (item.status === 'verified') return { ...item, status: 'dispensed' };
      return item;
    }));
  }, []);

  const handleReceptionCheckIn = useCallback((id: string) => {
    setReceptionQueue(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (item.slaStatus === 'pending') return { ...item, slaStatus: 'arrived' };
      if (item.slaStatus === 'arrived') return { ...item, slaStatus: 'room_assigned', room: 'Clinic Room 4B' };
      return item;
    }));
  }, []);

  const handleActivate21DayWindow = useCallback(() => {
    setCaseStage('FOLLOW_UP_21_DAYS');
  }, []);

  const dir = isRtl ? 'rtl' : 'ltr';
  const lang = isRtl ? 'ar' : 'en';
  const t = (ar: string, en: string) => isRtl ? ar : en;

  return (
    <div
      dir={dir}
      lang={lang}
      style={{
        fontFamily: "'Cairo', sans-serif",
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        padding: '24px',
        color: '#1E293B',
      }}
    >
      {/* Global Styles for Cairo Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
        button { cursor: pointer; font-family: 'Cairo', sans-serif; transition: all 0.2s ease; }
        button:hover { opacity: 0.9; transform: translateY(-1px); }
        button:active { transform: translateY(0); }
      `}</style>

      {/* Header & Controls */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
        backgroundColor: '#FFFFFF',
        padding: '20px 24px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: `1px solid ${TEAL_BG}`
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: TEAL_PRIMARY, margin: 0 }}>
            {t('مركز الخدمات الداخلية للمنشأة الطبية', 'Medical Center In-House Facility Hub')}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0' }}>
            {t('المرحلة السادسة · إدارة الطوابير والمتابعة', 'Phase 6 · Queues & Follow-Up Management')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* 11 Persona Switcher */}
          <select
            value={activePersona}
            onChange={(e) => setActivePersona(e.target.value as PersonaId)}
            aria-label={t('تبديل الشخصية', 'Switch Persona')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid #CBD5E1`,
              backgroundColor: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              color: TEAL_PRIMARY,
              outline: 'none',
              minWidth: '160px'
            }}
          >
            {PERSONAS.map(p => (
              <option key={p.id} value={p.id}>
                {isRtl ? p.labelAr : p.labelEn}
              </option>
            ))}
          </select>

          {/* Language Toggle */}
          <button
            onClick={() => setIsRtl(!isRtl)}
            aria-label="Toggle Language Direction"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${TEAL_ACCENT}`,
              backgroundColor: TEAL_BG,
              color: TEAL_PRIMARY,
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            {isRtl ? 'English' : 'عربي'}
          </button>
        </div>
      </header>

      {caseStage === 'FOLLOW_UP_21_DAYS' ? (
        <div style={{
          backgroundColor: TEAL_BG,
          border: `2px solid ${TEAL_ACCENT}`,
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          marginTop: '40px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ color: TEAL_PRIMARY, fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0' }}>
            {t('تم تفعيل نافذة المتابعة لمدة 21 يوماً', '21-Day Follow-Up Window Activated')}
          </h2>
          <p style={{ color: '#475569', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
            {t('تم تسليم التقرير المعتمد بنجاح. الحالة الآن في مرحلة المتابعة.', 'Endorsed report delivered successfully. Case is now in follow-up stage.')}
          </p>
        </div>
      ) : (
        <>
          {/* Grid Layout for Queues */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            
            {/* 1. Facility Laboratory (L01) */}
            <section
              aria-labelledby="lab-heading"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: TEAL_BG, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: TEAL_PRIMARY, fontWeight: 800, fontSize: '14px'
                }}>
                  L01
                </div>
                <div>
                  <h2 id="lab-heading" style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    {t('مختبر المنشأة الداخلي', 'Facility Laboratory')}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    {t('طلبات الفحوصات المعتمدة من الطبيب المعالج', 'Requisitions ordered by Treating Doctor')}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {labQueue.map(req => {
                  const statusStyle = STATUS_STYLES[req.status];
                  return (
                    <div key={req.id} style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #F1F5F9',
                      backgroundColor: '#FAFAFA'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#1E293B' }}>
                            {isRtl ? req.testNameAr : req.testName}
                          </h3>
                          <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>ID: {req.id}</p>
                        </div>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          whiteSpace: 'nowrap'
                        }}>
                          {isRtl ? statusStyle.labelAr : statusStyle.labelEn}
                        </span>
                      </div>
                      
                      {req.status !== 'results_uploaded' && (
                        <button
                          onClick={() => handleAdvanceLabStatus(req.id)}
                          aria-label={t(`تحديث حالة ${req.testNameAr}`, `Update ${req.testName} status`)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: TEAL_PRIMARY,
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>🔬</span>
                          {req.status === 'ordered' 
                            ? t('تأكيد سحب العينة', 'Confirm Specimen Drawn') 
                            : t('رفع نتائج PDF المعتمدة', 'Upload Verified Results PDF')}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 2. Facility Outpatient Pharmacy (PH01) */}
            <section
              aria-labelledby="pharmacy-heading"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#166534', fontWeight: 800, fontSize: '12px'
                }}>
                  PH01
                </div>
                <div>
                  <h2 id="pharmacy-heading" style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    {t('صيدلية العيادات الخارجية', 'Outpatient Pharmacy')}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    {t('التحقق من جرعات SFDA وصرف الأدوية', 'SFDA Dosage Verification & Dispensing')}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {pharmacyQueue.map(rx => {
                  const statusStyle = STATUS_STYLES[rx.status];
                  return (
                    <div key={rx.id} style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #F1F5F9',
                      backgroundColor: '#FAFAFA'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#1E293B' }}>
                            {isRtl ? rx.medicationAr : rx.medication} <span style={{ color: TEAL_ACCENT, fontWeight: 800 }}>{rx.dosage}</span>
                          </h3>
                          <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>ID: {rx.id}</p>
                        </div>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          whiteSpace: 'nowrap'
                        }}>
                          {isRtl ? statusStyle.labelAr : statusStyle.labelEn}
                        </span>
                      </div>
                      
                      {rx.status !== 'dispensed' && (
                        <button
                          onClick={() => handleAdvancePharmacyStatus(rx.id)}
                          aria-label={t(`تحديث حالة ${rx.medicationAr}`, `Update ${rx.medication} status`)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: WHATSAPP_GREEN,
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 700,
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>💊</span>
                          {rx.status === 'ordered' 
                            ? t('تحقق من جرعة SFDA واعتمادها', 'Verify SFDA Dosage & Approve') 
                            : t('صرف لاستلام المريض / التوصيل', 'Dispense for Pickup / Courier')}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. Hospital Reception & Check-In Desk (REC01) */}
            <section
              aria-labelledby="reception-heading"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#1E40AF', fontWeight: 800, fontSize: '11px'
                }}>
                  REC01
                </div>
                <div>
                  <h2 id="reception-heading" style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    {t('مكتب الاستقبال والتسجيل', 'Reception & Check-In Desk')}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    {t('اتفاقية مستوى الخدمة SLA ساعتين وتخصيص الغرف', '2-Hour SLA & Room Assignment')}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {receptionQueue.map(ticket => {
                  const statusStyle = STATUS_STYLES[ticket.slaStatus];
                  return (
                    <div key={ticket.id} style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #F1F5F9',
                      backgroundColor: '#FAFAFA'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#1E293B' }}>
                            {isRtl ? ticket.patientNameAr : ticket.patientName}
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <p style={{ fontSize: '12px', color: '#64748B', margin: 0, fontWeight: 600 }}>
                              ALO: <span style={{ color: TEAL_PRIMARY, fontFamily: 'monospace' }}>{ticket.aloCode}</span>
                            </p>
                            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                              Ref: {ticket.caseRef}
                            </p>
                          </div>
                        </div>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          whiteSpace: 'nowrap'
                        }}>
                          {isRtl ? statusStyle.labelAr : statusStyle.labelEn}
                        </span>
                      </div>

                      {ticket.slaStatus === 'room_assigned' && ticket.room && (
                        <div style={{
                          padding: '8px 12px',
                          backgroundColor: TEAL_BG,
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: TEAL_PRIMARY,
                          marginBottom: '12px',
                          textAlign: 'center',
                          border: `1px dashed ${TEAL_ACCENT}`
                        }}>
                          {t('الغرفة المخصصة:', 'Assigned Room:')} {ticket.room}
                        </div>
                      )}
                      
                      {ticket.slaStatus !== 'room_assigned' && (
                        <button
                          onClick={() => handleReceptionCheckIn(ticket.id)}
                          aria-label={t(`تحديث حالة استقبال ${ticket.patientNameAr}`, `Update check-in for ${ticket.patientName}`)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: `1px solid ${TEAL_PRIMARY}`,
                            backgroundColor: 'transparent',
                            color: TEAL_PRIMARY,
                            fontSize: '13px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>🏥</span>
                          {ticket.slaStatus === 'pending' 
                            ? t('تأكيد الوصول (SLA ساعتين)', 'Confirm Arrival (2hr SLA)') 
                            : t('تخصيص غرفة العيادة', 'Assign Clinic Room')}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* 21-Day Follow-Up Delivery Launch Action */}
          <footer style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
            border: `2px solid ${TEAL_ACCENT}`,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative Background Element */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              [isRtl ? 'left' : 'right']: '-50px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              backgroundColor: TEAL_BG,
              opacity: 0.5,
              zIndex: 0
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#64748B',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {t('الخطوة النهائية للمرحلة السادسة', 'Phase 6 Final Step')}
              </h3>
              
              <button
                onClick={handleActivate21DayWindow}
                aria-label={t('تسليم التقرير المعتمد وتفعيل نافذة متابعة الـ 21 يوماً', 'Deliver Endorsed Report & Activate 21-Day Window')}
                style={{
                  padding: '18px 36px',
                  borderRadius: '12px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${TEAL_PRIMARY} 0%, ${TEAL_ACCENT} 100%)`,
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 800,
                  boxShadow: `0 4px 14px 0 rgba(0, 123, 110, 0.3)`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  maxWidth: '800px',
                  width: '100%',
                  lineHeight: 1.5
                }}
              >
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 800
                }}>
                  D13
                </span>
                <span>
                  {t('تسليم التقرير المعتمد وتفعيل نافذة متابعة الـ 21 يوماً', 'Deliver Endorsed Report & Activate 21-Day Window')}
                </span>
                <span style={{ fontSize: '20px' }}>🚀</span>
              </button>

              <p style={{
                fontSize: '13px',
                color: '#94A3B8',
                marginTop: '16px',
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                {t('سيؤدي هذا الإجراء إلى إغلاق طوابير المنشأة الداخلية ونقل الحالة إلى مسار المتابعة السريرية لمدة 21 يوماً.', 'This action will close in-house facility queues and advance the case to the 21-day clinical follow-up pathway.')}
              </p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default PartnerServicesView;