import React from 'react';
import { TEAL_PRIMARY, TEAL_SECONDARY, TEAL_BG, WHATSAPP_GREEN } from './followUpConstants';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'patient' | 'coordinator';
  timestamp: Date;
}

interface Props {
  isRTL: boolean;
  daysRemaining: number;
  messages: ChatMessage[];
  chatInput: string;
  setChatInput: (val: string) => void;
  onSendMessage: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export const FollowUpChatThread: React.FC<Props> = ({
  isRTL,
  daysRemaining,
  messages,
  chatInput,
  setChatInput,
  onSendMessage,
  chatEndRef,
}) => {
  return (
    <section
      aria-label={isRTL ? 'نافذة المتابعة الطبية' : 'Medical Follow-Up Window'}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1A2E35' }}>
          {isRTL ? 'نافذة المتابعة الطبية المجانية' : 'Free Medical Follow-Up Window'}
        </h3>
        <div
          role="timer"
          aria-live="polite"
          aria-label={isRTL ? 'الوقت المتبقي للمتابعة' : 'Time remaining for follow-up'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '24px',
            backgroundColor: daysRemaining <= 3 ? '#FEF2F2' : TEAL_BG,
            border: `1.5px solid ${daysRemaining <= 3 ? '#FECACA' : TEAL_SECONDARY}`,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={daysRemaining <= 3 ? '#DC2626' : TEAL_PRIMARY} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: daysRemaining <= 3 ? '#DC2626' : TEAL_PRIMARY,
            }}
          >
            {isRTL
              ? `متبقي ${daysRemaining} يوماً من نافذة المتابعة الطبية المجانية`
              : `${daysRemaining} days remaining in free follow-up window`}
          </span>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div
        role="log"
        aria-label={isRTL ? 'سجل المحادثة' : 'Chat Log'}
        style={{
          height: '280px',
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#F8FAFB',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '20px',
            }}
          >
            <p style={{ margin: 0, fontSize: '14px', color: '#94A3B8', lineHeight: 1.8 }}>
              {isRTL
                ? 'ابدأ بكتابة استفسارك أدناه. سيقوم منسق رعاية ألو بنقله مباشرة إلى الاستشاري الهندي.'
                : 'Start typing your inquiry below. ALO care coordinator will relay it directly to the Indian consultant.'}
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'patient' ? (isRTL ? 'flex-start' : 'flex-end') : isRTL ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                padding: '12px 16px',
                borderRadius: msg.sender === 'patient' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                backgroundColor: msg.sender === 'patient' ? TEAL_PRIMARY : '#FFFFFF',
                color: msg.sender === 'patient' ? '#FFFFFF' : '#1A2E35',
                border: msg.sender === 'coordinator' ? '1px solid #E2E8F0' : 'none',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                fontSize: '14px',
                lineHeight: 1.6,
                fontWeight: 500,
              }}
            >
              <p style={{ margin: 0 }}>{msg.text}</p>
              <span
                style={{
                  display: 'block',
                  marginTop: '6px',
                  fontSize: '11px',
                  opacity: 0.7,
                  textAlign: isRTL ? 'left' : 'right',
                }}
              >
                {msg.timestamp.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Notification Banner */}
      <div
        role="note"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          backgroundColor: '#FFFBEB',
          borderRadius: '10px',
          border: '1px solid #FDE68A',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#92400E', lineHeight: 1.5 }}>
          {isRTL
            ? 'يتم إرسال استفساراتك إلى منسق رعاية ألو لنقلها مباشرة إلى الاستشاري الهندي'
            : 'Your inquiries are sent to ALO care coordinator to be relayed directly to the Indian consultant'}
        </span>
      </div>

      {/* Secure Chat Input */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder={isRTL ? 'اكتب استفسارك الطبي هنا...' : 'Type your medical inquiry here...'}
            aria-label={isRTL ? 'حقل إدخال الرسالة' : 'Message input field'}
            rows={2}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1.5px solid #CBD5E1`,
              backgroundColor: '#FFFFFF',
              fontFamily: "'Cairo', sans-serif",
              fontSize: '14px',
              color: '#1A2E35',
              resize: 'none',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = TEAL_PRIMARY)}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
          />
        </div>
        <button
          type="button"
          onClick={onSendMessage}
          disabled={!chatInput.trim()}
          aria-label={isRTL ? 'إرسال الرسالة' : 'Send Message'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: chatInput.trim() ? WHATSAPP_GREEN : '#E2E8F0',
            color: chatInput.trim() ? '#FFFFFF' : '#94A3B8',
            cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isRTL ? 'rotate(180deg)' : 'none',
            }}
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </section>
  );
};
