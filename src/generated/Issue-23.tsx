import React, { useState, useEffect, useRef } from 'react';
import { ClinicalCase } from '../../types';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
}

const TEAL_PRIMARY = '#007B6E';
const TEAL_SECONDARY = '#00C6AE';
const TEAL_BG = '#E6FAF7';
const WHATSAPP_GREEN = '#25D366';

const FEEDBACK_TAGS_AR = ['دقة التشخيص', 'وضوح التفسير الطبي', 'سرعة الاستجابة', 'التعامل الراقي', 'جودة التقرير'];
const FEEDBACK_TAGS_EN = ['Diagnostic Accuracy', 'Clear Explanation', 'Fast Response', 'Professionalism', 'Report Quality'];

const FollowUpChatView: React.FC<Props> = ({ activeCase, onAdvanceStage }) => {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [personaId, setPersonaId] = useState<number>(1);
  const [daysRemaining, setDaysRemaining] = useState<number>(20);
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'patient' | 'coordinator'; timestamp: Date }>>([]);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<Set<number>>(new Set());
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadComplete, setDownloadComplete] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isRTL = lang === 'ar';
  const tags = isRTL ? FEEDBACK_TAGS_AR : FEEDBACK_TAGS_EN;

  useEffect(() => {
    const interval = setInterval(() => {
      setDaysRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 86400000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const generateMockSHA256 = (): string => {
    const chars = 'abcdef0123456789';
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const checksum = generateMockSHA256();
    const blob = new Blob(
      [
        `ALO DOCTOR v2.4 Saudi Edition - Certified Medical Opinion\nCase ID: ${activeCase.id}\nSHA256: ${checksum}\nMOH Seal: VERIFIED\n\nThis document represents a certified medical opinion relayed through ALO DOCTOR's secure infrastructure.`,
      ],
      { type: 'application/pdf' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ALO_Doctor_Report_PDF1_${activeCase.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsDownloading(false);
    setDownloadComplete(true);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      id: `msg_${Date.now()}`,
      text: chatInput.trim(),
      sender: 'patient' as const,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    setTimeout(() => {
      const coordinatorReply = {
        id: `msg_${Date.now() + 1}`,
        text: isRTL
          ? 'تم استلام استفسارك. سيتم نقله مباشرة إلى الاستشاري الهندي عبر منسق رعاية ألو.'
          : 'Your inquiry has been received. It will be relayed directly to the Indian consultant via ALO care coordinator.',
        sender: 'coordinator' as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, coordinatorReply]);
    }, 1200);
  };

  const toggleTag = (index: number) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleCompleteFollowUp = () => {
    onAdvanceStage();
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        fontFamily: "'Cairo', sans-serif",
        direction: isRTL ? 'rtl' : 'ltr',
        minHeight: '100vh',
        backgroundColor: '#F4F7F6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px',
      }}
    >
      {/* Persona & Language Switcher */}
      <div
        style={{
          width: '100%',
          maxWidth: '800px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: TEAL_PRIMARY }}>
            {isRTL ? 'الملف الشخصي:' : 'Persona:'}
          </span>
          <select
            value={personaId}
            onChange={(e) => setPersonaId(Number(e.target.value))}
            aria-label={isRTL ? 'تبديل الملف الشخصي' : 'Switch Persona Profile'}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${TEAL_SECONDARY}`,
              backgroundColor: '#FFFFFF',
              color: TEAL_PRIMARY,
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {Array.from({ length: 11 }, (_, i) => i + 1).map((p) => (
              <option key={p} value={p}>
                P{p}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          aria-label={isRTL ? 'Switch to English' : 'التبديل إلى العربية'}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: `2px solid ${TEAL_PRIMARY}`,
            backgroundColor: 'transparent',
            color: TEAL_PRIMARY,
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = TEAL_PRIMARY;
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = TEAL_PRIMARY;
          }}
        >
          {isRTL ? 'English' : 'العربية'}
        </button>
      </div>

      <main
        style={{
          width: '100%',
          maxWidth: '800px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Screen P25: Report PDF 1 Download Card */}
        <section
          aria-label={isRTL ? 'بطاقة تحميل التقرير الطبي' : 'Medical Report Download Card'}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: `2px solid ${TEAL_SECONDARY}`,
            boxShadow: `0 8px 32px rgba(0, 123, 110, 0.12)`,
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              [isRTL ? 'right' : 'left']: 0,
              width: '100%',
              height: '4px',
              background: `linear-gradient(90deg, ${TEAL_PRIMARY}, ${TEAL_SECONDARY}, ${WHATSAPP_GREEN})`,
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: TEAL_BG,
              padding: '6px 16px',
              borderRadius: '24px',
              marginBottom: '16px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL_PRIMARY} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 700, color: TEAL_PRIMARY }}>
              {isRTL ? 'التقرير الطبي المعتمد متاح للتحميل (PDF 1)' : 'Certified Medical Opinion Available (PDF 1)'}
            </span>
          </div>

          <h2
            style={{
              margin: '0 0 8px 0',
              fontSize: '20px',
              fontWeight: 800,
              color: '#1A2E35',
            }}
          >
            {isRTL ? 'تقرير الرأي الطبي الثاني - الهند' : 'Second Medical Opinion Report - India'}
          </h2>
          <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#5F7A84', lineHeight: 1.6 }}>
            {isRTL
              ? `رقم الحالة: ${activeCase.id} | تم الاعتماد من قبل وزارة الصحة السعودية وختم MOH`
              : `Case ID: ${activeCase.id} | Certified by Saudi MOH with official seal`}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              aria-label={isRTL ? 'تحميل التقرير الطبي PDF' : 'Download Medical Report PDF'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 28px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: isDownloading ? '#9CA3AF' : downloadComplete ? WHATSAPP_GREEN : TEAL_PRIMARY,
                color: '#FFFFFF',
                fontFamily: "'Cairo', sans-serif",
                fontSize: '15px',
                fontWeight: 700,
                cursor: isDownloading ? 'wait' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 14px ${isDownloading ? 'rgba(0,0,0,0.1)' : downloadComplete ? 'rgba(37,211,102,0.3)' : 'rgba(0,123,110,0.3)'}`,
              }}
            >
              {isDownloading ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                  {isRTL ? 'جاري التحميل...' : 'Downloading...'}
                </>
              ) : downloadComplete ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {isRTL ? 'تم التحميل بنجاح' : 'Downloaded Successfully'}
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {isRTL ? 'تحميل التقرير' : 'Download Report'}
                </>
              )}
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                backgroundColor: '#F0FDF4',
                borderRadius: '8px',
                border: '1px solid #BBF7D0',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={WHATSAPP_GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#166534' }}>
                {isRTL ? 'ختم MOH معتمد | SHA256 محمي' : 'MOH Sealed | SHA256 Protected'}
              </span>
            </div>
          </div>
        </section>

        {/* Screen P27-P28: 21-Day Follow-Up Relay */}
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
                    handleSendMessage();
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
              onClick={handleSendMessage}
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

        {/* Screen P29: Consultation Satisfaction Rating */}
        <section
          aria-label={isRTL ? 'تقييم الاستشارة' : 'Consultation Rating'}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1A2E35', textAlign: 'center' }}>
            {isRTL ? 'تقييم رضاك عن الاستشارة' : 'Consultation Satisfaction Rating'}
          </h3>

          {/* 5-Star Rating Widget */}
          <div
            role="radiogroup"
            aria-label={isRTL ? 'تقييم من 5 نجوم' : '5-star rating'}
            style={{
              display: 'flex',
              gap: '8px',
              direction: 'ltr',
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = star <= (hoverRating || rating);
              return (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star} ${isRTL ? 'نجوم' : 'stars'}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onFocus={() => setHoverRating(star)}
                  onBlur={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                    transform: isActive ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill={isActive ? '#F59E0B' : 'none'}
                    stroke={isActive ? '#F59E0B' : '#CBD5E1'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              );
            })}
          </div>

          {rating > 0 && (
            <p style={{ margin: '-8px 0 0 0', fontSize: '14px', fontWeight: 600, color: TEAL_PRIMARY }}>
              {rating === 5
                ? isRTL
                  ? 'ممتاز!'
                  : 'Excellent!'
                : rating === 4
                ? isRTL
                  ? 'جيد جداً'
                  : 'Very Good'
                : rating === 3
                ? isRTL
                  ? 'جيد'
                  : 'Good'
                : rating === 2
                ? isRTL
                  ? 'مقبول'
                  : 'Fair'
                : isRTL
                ? 'يحتاج تحسين'
                : 'Needs Improvement'}
            </p>
          )}

          {/* Quick Feedback Tags */}
          <div
            role="group"
            aria-label={isRTL ? 'علامات التغذية الراجعة السريعة' : 'Quick feedback tags'}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            {tags.map((tag, index) => {
              const isSelected = selectedTags.has(index);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleTag(index)}
                  aria-pressed={isSelected}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '24px',
                    border: `1.5px solid ${isSelected ? TEAL_PRIMARY : '#CBD5E1'}`,
                    backgroundColor: isSelected ? TEAL_BG : '#FFFFFF',
                    color: isSelected ? TEAL_PRIMARY : '#64748B',
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isSelected && (
                    <span style={{ [isRTL ? 'marginLeft' : 'marginRight']: '6px' }}>✓</span>
                  )}
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Complete Follow-Up Action Button */}
          <button
            onClick={handleCompleteFollowUp}
            disabled={rating === 0}
            aria-label={isRTL ? 'إتمام المتابعة والانتقال للخطوة التالية' : 'Complete follow-up and advance stage'}
            style={{
              marginTop: '8px',
              padding: '14px 40px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: rating === 0 ? '#CBD5E1' : TEAL_PRIMARY,
              color: '#FFFFFF',
              fontFamily: "'Cairo', sans-serif",
              fontSize: '16px',
              fontWeight: 700,
              cursor: rating === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: rating > 0 ? `0 4px 16px rgba(0, 123, 110, 0.3)` : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
            onMouseEnter={(e) => {
              if (rating > 0) e.currentTarget.style.backgroundColor = '#005F55';
            }}
            onMouseLeave={(e) => {
              if (rating > 0) e.currentTarget.style.backgroundColor = TEAL_PRIMARY;
            }}
          >
            {isRTL ? 'إتمام المتابعة' : 'Complete Follow-Up'}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }}
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </section>
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * {
          box-sizing: border-box;
        }
        textarea::placeholder {
          color: #94A3B8;
          font-family: 'Cairo', sans-serif;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>
    </div>
  );
};

export default FollowUpChatView;