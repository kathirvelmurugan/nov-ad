import React from 'react';
import { ClinicalCase } from '../../types';
import { TEAL_PRIMARY, TEAL_ACCENT, TEAL_BG, WHATSAPP_GREEN, getWhatsappButtonStyle } from './coordinatorStyles';

interface Props {
  lang: 'ar' | 'en';
  activeCase?: ClinicalCase;
  incomingQuestions: string[];
  followUpAnswers?: string[];
  relayMessage: string;
  setRelayMessage: (msg: string) => void;
  isProcessing: boolean;
  onRelayQuestion: () => void;
  onEndFollowUpForDoctor?: () => void;
}

export const CoordinatorFollowUpTab: React.FC<Props> = ({
  lang,
  activeCase,
  incomingQuestions,
  followUpAnswers = [],
  relayMessage,
  setRelayMessage,
  isProcessing,
  onRelayQuestion,
  onEndFollowUpForDoctor,
}) => {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const fontFamily = isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const patientEndedFollowUp = Boolean(
    activeCase?.metadata?.patientEndedFollowUp ||
    activeCase?.metadata?.patientRequestedClosure
  );

  const coordinatorEndedFollowUp = Boolean(activeCase?.metadata?.coordinatorEndedFollowUp);
  const doctorAnswered = Boolean(
    activeCase?.metadata?.doctorAnsweredFollowUp ||
    followUpAnswers.some((a) => (a || '').trim().length > 0)
  );

  const t = {
    c09_title: isAr ? 'صندوق متابعة الـ 21 يوماً (C09)' : '21-Day Follow-Up & Consultation Relays (C09)',
    c09_desc: isAr
      ? 'استقبال استفسارات المريض المستمرة طوال 21 يوماً وترحيلها للاستشاري، وعند انتهاء المريض يتم إنهاء المتابعة للطبيب للانتقال لإغلاق الحالة'
      : 'Continuous 21-day follow-up hub: relay patient questions to consultant, receive clinical answers, and conclude for doctor once patient is done',
    c09_incoming: isAr ? 'سجل أسئلة المريض وإجابات الاستشاري:' : 'Patient Questions & Specialist Answers Log:',
    c09_relay: isAr ? 'ترحيل الأسئلة للاستشاري الهندي' : 'Relay to Indian Consultant',
    c09_placeholder: isAr ? 'اكتب ملاحظة أو استفساراً إضافياً لترحيله للاستشاري...' : 'Type additional question or note to relay to consultant...',
    c09_patient_done_alert: isAr
      ? 'أكد المريض إنهاء فترة المتابعة ("أرغب في إنهاء المتابعة"). يمكنك الآن إنهاء المتابعة للاستشاري والتوجه لإغلاق الحالة وإصدار PDF 2.'
      : 'Patient has confirmed conclusion of follow-up ("I want to end this follow-up"). You can now end follow-up for the doctor and proceed to Case Closure & PDF 2.',
    c09_end_for_doctor: isAr
      ? 'إنهاء المتابعة للطبيب والانتقال إلى إغلاق الحالة (C10) ←'
      : 'End Follow-Up for Doctor & Proceed to Case Closure (C10) →',
  };

  return (
    <section aria-labelledby="c09-heading" style={{ direction: dir }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 id="c09-heading" style={{ fontSize: '20px', color: TEAL_PRIMARY, margin: 0, fontFamily }}>
          {t.c09_title}
        </h2>
        <span
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: coordinatorEndedFollowUp ? '#FEF3C7' : '#D1FAE5',
            color: coordinatorEndedFollowUp ? '#92400E' : '#065F46',
            fontSize: '12px',
            fontWeight: 700,
            fontFamily,
          }}
        >
          {coordinatorEndedFollowUp
            ? (isAr ? 'تم إنهاء المتابعة للطبيب' : 'Follow-Up Ended for Doctor')
            : (isAr ? 'المتابعة مستمرة (21 يوماً)' : 'Continuous 21-Day Active')}
        </span>
      </div>

      <p style={{ fontSize: '14px', color: '#4A5568', marginBottom: '20px', fontFamily, lineHeight: 1.6 }}>
        {t.c09_desc}
      </p>

      {/* Patient Ended Follow-Up Alert & Action */}
      {patientEndedFollowUp && (
        <div
          role="region"
          aria-label="Patient completed follow-up banner"
          style={{
            backgroundColor: '#EFF6FF',
            border: '1.5px solid #3B82F6',
            borderRadius: '12px',
            padding: '18px 20px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🔔</span>
            <div>
              <strong style={{ color: '#1E3A8A', fontSize: '15px', fontFamily }}>
                {isAr ? 'تنبيه: المريض أنهى المتابعة' : 'Notice: Patient Concluded Follow-Up'}
              </strong>
              <p style={{ margin: '4px 0 0', color: '#1E40AF', fontSize: '13px', lineHeight: 1.6, fontFamily }}>
                {t.c09_patient_done_alert}
              </p>
            </div>
          </div>

          {onEndFollowUpForDoctor && (
            <div style={{ display: 'flex', justifyContent: isAr ? 'flex-start' : 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                onClick={onEndFollowUpForDoctor}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  backgroundColor: TEAL_PRIMARY,
                  color: '#FFFFFF',
                  border: 'none',
                  fontFamily,
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 123, 110, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{t.c09_end_for_doctor}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Questions & Doctor Answers List */}
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginBottom: '12px', fontFamily }}>
        {t.c09_incoming}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
        {incomingQuestions.length === 0 && (
          <div style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px dashed #CBD5E1', textAlign: 'center', color: '#64748B', fontFamily }}>
            {isAr ? 'لا توجد استفسارات مرسلة من المريض حتى الآن.' : 'No patient follow-up inquiries submitted yet.'}
          </div>
        )}

        {incomingQuestions.map((question, idx) => {
          const answer = followUpAnswers[idx] || '';
          return (
            <div
              key={idx}
              style={{
                padding: '18px 20px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: TEAL_BG,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: TEAL_PRIMARY,
                    fontWeight: 800,
                    fontSize: '13px',
                  }}
                >
                  Q{idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '2px', fontFamily }}>
                    {isAr ? 'استفسار المريض:' : 'Patient Inquiry:'}
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#1E293B', fontWeight: 600, fontFamily }}>
                    {question}
                  </p>
                </div>
              </div>

              {/* Specialist Answer if present */}
              {answer ? (
                <div
                  style={{
                    marginRight: isAr ? '44px' : 0,
                    marginLeft: isAr ? 0 : '44px',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '4px', fontFamily }}>
                    ↳ 👨‍⚕️ {isAr ? 'إجابة وتوضيح الاستشاري الهندي:' : 'Indian Specialist Clinical Answer:'}
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#15803D', lineHeight: 1.6, fontFamily }}>
                    {answer}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    marginRight: isAr ? '44px' : 0,
                    marginLeft: isAr ? 0 : '44px',
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#92400E',
                    fontFamily,
                  }}
                >
                  ⏳ {isAr ? 'بانتظار إفادة الاستشاري الهندي' : 'Awaiting consultant response'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Relay Section */}
      <div
        style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: TEAL_BG,
          border: `1px solid ${TEAL_ACCENT}40`,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '14px', color: TEAL_PRIMARY, fontFamily }}>
          💬 {isAr ? 'ترحيل الاستفسارات إلى الاستشاري الطبي (WhatsApp):' : 'Relay Inquiries to Indian Consultant (WhatsApp):'}
        </div>

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
            backgroundColor: '#FFFFFF',
          }}
          aria-label={t.c09_placeholder}
        />

        <div style={{ display: 'flex', justifyContent: isAr ? 'flex-start' : 'flex-end' }}>
          <button
            type="button"
            onClick={onRelayQuestion}
            disabled={isProcessing}
            style={getWhatsappButtonStyle(isProcessing, fontFamily)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t.c09_relay}
          </button>
        </div>
      </div>
    </section>
  );
};
