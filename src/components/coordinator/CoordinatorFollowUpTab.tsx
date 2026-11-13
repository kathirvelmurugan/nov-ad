import React, { useState } from 'react';
import { ClinicalCase } from '../../types';
import { TEAL_PRIMARY, TEAL_ACCENT, TEAL_BG } from './coordinatorStyles';

interface Props {
  lang: 'ar' | 'en';
  activeCase?: ClinicalCase;
  incomingQuestions: string[];
  followUpAnswers?: string[];
  relayMessage: string;
  setRelayMessage: (msg: string) => void;
  isProcessing: boolean;
  onSendReplyToPatient?: (questionIdx?: number, replyText?: string) => void;
  onEndFollowUp?: () => void;
  onRelayQuestion?: () => void;
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
  onSendReplyToPatient,
  onEndFollowUp,
  onRelayQuestion,
  onEndFollowUpForDoctor,
}) => {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const fontFamily = isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const [draftReplies, setDraftReplies] = useState<Record<number, string>>({});
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const patientEndedFollowUp = Boolean(
    activeCase?.metadata?.patientEndedFollowUp ||
    activeCase?.metadata?.patientRequestedClosure
  );

  const coordinatorEndedFollowUp = Boolean(activeCase?.metadata?.coordinatorEndedFollowUp);

  const handleEndFollowUpAction = () => {
    if (onEndFollowUp) {
      onEndFollowUp();
    } else if (onEndFollowUpForDoctor) {
      onEndFollowUpForDoctor();
    }
  };

  const handleSendReply = (idx?: number, customText?: string) => {
    const textToSend = customText !== undefined ? customText : (idx !== undefined ? draftReplies[idx] : relayMessage);
    if (!textToSend || !textToSend.trim()) return;

    if (onSendReplyToPatient) {
      onSendReplyToPatient(idx, textToSend.trim());
      if (idx !== undefined) {
        setDraftReplies((prev) => ({ ...prev, [idx]: '' }));
        setEditingIdx(null);
      }
    } else if (onRelayQuestion) {
      onRelayQuestion();
    }
  };

  const t = {
    c09_title: isAr ? 'متابعة الـ 21 يوماً المباشرة مع المريض (C09)' : '21-Day Direct Patient Follow-Up Hub (C09)',
    c09_desc: isAr
      ? 'متابعة سريرية مباشرة ومستمرة طوال 21 يوماً بين المريض ومنسق رعاية ألو المباشر. استقبل استفسارات المريض، وقدم الإرشادات والردود مباشرة دون الحاجة لإشراك الاستشاري الهندي، ثم قم بإصدار التقرير الطبي الشامل (PDF 2) عند إغلاق الحالة.'
      : 'Continuous 21-day direct follow-up between the patient and ALO Care Coordinator. Receive inquiries, provide guidance directly without Indian consultant involvement, and issue the final dossier (PDF 2) at case closure.',
    c09_badge_active: isAr ? 'متابعة مباشرة نشطة (21 يوماً)' : 'Direct 21-Day Active',
    c09_badge_ended: isAr ? 'تم إنهاء المتابعة' : 'Follow-Up Concluded',
    c09_incoming: isAr ? 'سجل استفسارات المريض وردود منسق الرعاية المباشرة:' : 'Patient Inquiries & Care Coordinator Responses Log:',
    c09_patient_done_alert: isAr
      ? 'أكد المريض إنهاء فترة المتابعة بنجاح ("أرغب في إنهاء المتابعة"). يمكنك الآن إنهاء مرحلة المتابعة والتوجه لإصدار الملف الطبي الشامل (PDF 2) وإغلاق الحالة نهائياً.'
      : 'Patient has confirmed conclusion of follow-up ("I want to end this follow-up"). You can now conclude follow-up and proceed to Case Closure & Final Dossier (PDF 2).',
    c09_end_button: isAr
      ? 'إنهاء المتابعة والانتقال إلى إغلاق الحالة (C10) ←'
      : 'End Follow-Up & Proceed to Case Closure (C10) →',
    c09_send_reply: isAr ? 'إرسال الرد للمريض' : 'Send Reply to Patient',
    c09_edit_reply: isAr ? 'تعديل الرد' : 'Edit Reply',
    c09_reply_placeholder: isAr ? 'اكتب رد وتوجيه منسق الرعاية للمريض...' : 'Type coordinator guidance / response for the patient...',
    c09_general_box_title: isAr ? 'إرسال رد أو إرشادات جديدة للمريض:' : 'Send New Guidance / Reply to Patient:',
    c09_general_box_placeholder: isAr ? 'اكتب رد أو إرشادات سريرية مباشرة للمريض...' : 'Type clinical follow-up guidance directly to the patient...',
    c09_send_general: isAr ? 'إرسال التوجيه للمريض مباشرة' : 'Send Guidance Directly to Patient',
  };

  return (
    <section aria-labelledby="c09-heading" style={{ direction: dir }}>
      {/* Header */}
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
          {coordinatorEndedFollowUp ? t.c09_badge_ended : t.c09_badge_active}
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
                {isAr ? 'تنبيه: المريض أكد اكتمال المتابعة' : 'Notice: Patient Concluded Follow-Up'}
              </strong>
              <p style={{ margin: '4px 0 0', color: '#1E40AF', fontSize: '13px', lineHeight: 1.6, fontFamily }}>
                {t.c09_patient_done_alert}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: isAr ? 'flex-start' : 'flex-end', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handleEndFollowUpAction}
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
              <span>{t.c09_end_button}</span>
            </button>
          </div>
        </div>
      )}

      {/* Questions & Coordinator Direct Answers List */}
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
          const isEditing = editingIdx === idx;
          const currentDraft = draftReplies[idx] !== undefined ? draftReplies[idx] : (isEditing ? answer : '');

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
              {/* Question Row */}
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

              {/* Coordinator Answer or Inline Reply Form */}
              {answer && !isEditing ? (
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', fontFamily }}>
                      ↳ 🩺 {isAr ? 'رد وتوجيه منسق رعاية ألو المباشر:' : 'ALO Care Coordinator Direct Reply:'}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIdx(idx);
                        setDraftReplies((prev) => ({ ...prev, [idx]: answer }));
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: TEAL_PRIMARY,
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '2px 6px',
                        fontFamily,
                      }}
                    >
                      ✏️ {t.c09_edit_reply}
                    </button>
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
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 700, color: TEAL_PRIMARY, fontFamily }}>
                    ✍️ {isAr ? `كتابة رد منسق الرعاية على السؤال #${idx + 1}:` : `Compose Coordinator Reply to Q#${idx + 1}:`}
                  </div>
                  <textarea
                    rows={2}
                    value={currentDraft}
                    onChange={(e) => setDraftReplies((prev) => ({ ...prev, [idx]: e.target.value }))}
                    placeholder={t.c09_reply_placeholder}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontFamily,
                      fontSize: '13px',
                      resize: 'vertical',
                      direction: dir,
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: isAr ? 'flex-start' : 'flex-end', gap: '8px' }}>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setEditingIdx(null)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontFamily,
                        }}
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isProcessing || !currentDraft.trim()}
                      onClick={() => handleSendReply(idx, currentDraft)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '6px',
                        backgroundColor: currentDraft.trim() ? TEAL_PRIMARY : '#94A3B8',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: currentDraft.trim() ? 'pointer' : 'not-allowed',
                        fontFamily,
                      }}
                    >
                      {isProcessing ? '...' : t.c09_send_reply}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* General Follow-Up Guidance Box */}
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
          💬 {t.c09_general_box_title}
        </div>

        <textarea
          value={relayMessage}
          onChange={(e) => setRelayMessage(e.target.value)}
          placeholder={t.c09_general_box_placeholder}
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
          aria-label={t.c09_general_box_placeholder}
        />

        <div style={{ display: 'flex', justifyContent: isAr ? 'flex-start' : 'flex-end' }}>
          <button
            type="button"
            onClick={() => handleSendReply(undefined, relayMessage)}
            disabled={isProcessing || !relayMessage.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: relayMessage.trim() ? TEAL_PRIMARY : '#94A3B8',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontFamily,
              fontSize: '14px',
              fontWeight: 700,
              cursor: relayMessage.trim() ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: relayMessage.trim() ? '0 2px 8px rgba(0, 123, 110, 0.25)' : 'none',
            }}
          >
            <span>✉️ {isProcessing ? '...' : t.c09_send_general}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
