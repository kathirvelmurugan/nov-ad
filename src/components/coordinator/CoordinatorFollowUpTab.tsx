import React from 'react';
import { TEAL_PRIMARY, TEAL_ACCENT, TEAL_BG, getWhatsappButtonStyle } from './coordinatorStyles';

interface Props {
  lang: 'ar' | 'en';
  incomingQuestions: string[];
  relayMessage: string;
  setRelayMessage: (msg: string) => void;
  isProcessing: boolean;
  onRelayQuestion: () => void;
}

export const CoordinatorFollowUpTab: React.FC<Props> = ({
  lang,
  incomingQuestions,
  relayMessage,
  setRelayMessage,
  isProcessing,
  onRelayQuestion,
}) => {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const fontFamily = isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const t = {
    c09_title: isAr ? 'صندوق متابعة الـ 21 يوماً' : 'Follow-up 21 days',
    c09_incoming: isAr ? 'أسئلة المريض الواردة' : 'Incoming Patient Questions',
    c09_relay: isAr ? 'ترحيل السؤال إلى الاستشاري الهندي' : 'Relay question to Indian consultant',
    c09_placeholder: isAr ? 'اكتب رسالة إضافية...' : 'Type additional message...',
  };

  return (
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
  );
};
