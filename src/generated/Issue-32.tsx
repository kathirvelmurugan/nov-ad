import React, { useState, useRef, useEffect, useCallback } from 'react';

interface FocusQuestion {
  id: string;
  questionAr: string;
  questionEn: string;
}

interface ConsultantAnswer {
  questionId: string;
  text: string;
  voiceNoteUri?: string;
}

interface ActiveCase {
  id: string;
  stage: string;
  focusQuestions: FocusQuestion[];
  consultantAnswers: ConsultantAnswer[];
  consultantOpinion: string;
}

interface ConsultantTokenState {
  otpVerified: boolean;
  sessionCookieActive: boolean;
  tokenString: string;
}

interface ConsultantMobileViewProps {
  activeCase: ActiveCase;
  consultantToken: ConsultantTokenState;
  onAdvanceStage: (caseId: string, answers: ConsultantAnswer[], opinion: string) => void;
  onUpdateToken: (tokenState: ConsultantTokenState) => void;
  currentLang: 'ar' | 'en';
  activePersona: string;
}

const TEAL_PRIMARY = '#007B6E';
const TEAL_ACCENT = '#00C6AE';
const TEAL_BG = '#E6FAF7';
const WHATSAPP_GREEN = '#25D366';

const DEV_OTP = '123456';
const SESSION_COOKIE_KEY = 'alo_doctor_consultant_session_v24';

export const ConsultantMobileView: React.FC<ConsultantMobileViewProps> = ({
  activeCase,
  consultantToken,
  onAdvanceStage,
  onUpdateToken,
  currentLang,
  activePersona
}) => {
  const isRtl = currentLang === 'ar';
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(activeCase.stage === 'writing_report' || activeCase.stage === 'OPINION_READY');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_COOKIE_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.expiry > Date.now() && parsed.tokenString === consultantToken.tokenString) {
          onUpdateToken({ ...consultantToken, otpVerified: true, sessionCookieActive: true });
        } else {
          localStorage.removeItem(SESSION_COOKIE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(SESSION_COOKIE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (activeCase.consultantAnswers && activeCase.consultantAnswers.length > 0) {
      const initialAnswers: Record<string, string> = {};
      activeCase.consultantAnswers.forEach(ans => {
        initialAnswers[ans.questionId] = ans.text;
      });
      setAnswers(initialAnswers);
    }
  }, [activeCase.consultantAnswers]);

  const handleOtpSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === DEV_OTP) {
      setOtpError(false);
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const sessionData = {
        tokenString: consultantToken.tokenString,
        expiry: Date.now() + thirtyDaysMs,
        verifiedAt: new Date().toISOString()
      };
      
      localStorage.setItem(SESSION_COOKIE_KEY, JSON.stringify(sessionData));
      
      onUpdateToken({
        otpVerified: true,
        sessionCookieActive: true,
        tokenString: consultantToken.tokenString
      });
    } else {
      setOtpError(true);
      setOtpInput('');
      otpInputRef.current?.focus();
    }
  }, [otpInput, consultantToken.tokenString, onUpdateToken]);

  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const toggleVoiceRecording = useCallback(async (questionId: string) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        console.log(`Voice note recorded for question ${questionId}:`, audioUrl);
      };

      mediaRecorder.start();
    } catch (err) {
      console.error('Microphone access denied or unavailable:', err);
    }
  }, []);

  const handleSubmitOpinion = useCallback(async () => {
    const allAnswered = activeCase.focusQuestions.every(q => answers[q.id]?.trim().length > 0);
    
    if (!allAnswered) {
      alert(isRtl ? 'يرجى الإجابة على جميع الأسئلة الثلاثة قبل الإرسال.' : 'Please answer all 3 focus questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    const formattedAnswers: ConsultantAnswer[] = activeCase.focusQuestions.map(q => ({
      questionId: q.id,
      text: answers[q.id] || ''
    }));

    const combinedOpinion = formattedAnswers.map((ans, idx) => 
      `Q${idx + 1}: ${activeCase.focusQuestions[idx][isRtl ? 'questionAr' : 'questionEn']}\nA: ${ans.text}`
    ).join('\n\n');

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      onAdvanceStage(activeCase.id, formattedAnswers, combinedOpinion);
      setIsLocked(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, activeCase, isRtl, onAdvanceStage]);

  const containerStyle: React.CSSProperties = {
    direction: isRtl ? 'rtl' : 'ltr',
    fontFamily: "'Cairo', sans-serif",
    backgroundColor: '#F4F7F6',
    minHeight: '100vh',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 4px 24px rgba(0, 123, 110, 0.08)',
    marginBottom: '20px',
    border: `1px solid ${TEAL_BG}`
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: TEAL_BG,
    color: TEAL_PRIMARY,
    padding: '8px 16px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    marginBottom: '20px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    fontSize: '24px',
    textAlign: 'center',
    letterSpacing: '12px',
    border: `2px solid ${otpError ? '#EF4444' : TEAL_ACCENT}`,
    borderRadius: '12px',
    outline: 'none',
    fontFamily: "'Cairo', monospace",
    fontWeight: 700,
    color: TEAL_PRIMARY,
    backgroundColor: TEAL_BG,
    transition: 'border-color 0.2s ease'
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    backgroundColor: TEAL_PRIMARY,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer',
    marginTop: '16px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '120px',
    padding: '16px',
    border: `1.5px solid ${TEAL_BG}`,
    borderRadius: '12px',
    fontSize: '15px',
    fontFamily: "'Cairo', sans-serif",
    lineHeight: 1.7,
    resize: 'vertical',
    outline: 'none',
    color: '#1F2937',
    backgroundColor: '#FAFAFA',
    transition: 'border-color 0.2s ease'
  };

  const voiceButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: 'transparent',
    border: `1.5px solid ${WHATSAPP_GREEN}`,
    color: WHATSAPP_GREEN,
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'all 0.2s ease'
  };

  const cookieIndicatorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#F0FDF4',
    border: `1px solid #BBF7D0`,
    borderRadius: '10px',
    fontSize: '13px',
    color: '#166534',
    fontWeight: 600,
    marginTop: '16px'
  };

  if (!consultantToken.otpVerified) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              backgroundColor: TEAL_BG, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px' 
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={TEAL_PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 800, 
              color: TEAL_PRIMARY, 
              margin: '0 0 8px 0',
              fontFamily: "'Cairo', sans-serif"
            }}>
              {isRtl ? 'التحقق من هوية الاستشاري' : 'Consultant Identity Verification'}
            </h2>
            <p style={{ 
              fontSize: '14px', 
              color: '#6B7280', 
              margin: 0,
              fontFamily: "'Cairo', sans-serif"
            }}>
              {isRtl ? 'أدخل رمز التحقق لمرة واحدة للوصول إلى الملف السريري' : 'Enter OTP to access the clinical dossier securely'}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={badgeStyle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Magic Token: ALO-REV-72H-TOKEN
            </div>
          </div>

          <form onSubmit={handleOtpSubmit}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: 700, 
              color: '#374151', 
              marginBottom: '8px',
              fontFamily: "'Cairo', sans-serif"
            }}>
              {isRtl ? 'رمز التحقق (6 أرقام)' : 'Verification Code (6 Digits)'}
            </label>
            <input
              ref={otpInputRef}
              type="text"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]*"
              value={otpInput}
              onChange={(e) => {
                setOtpInput(e.target.value.replace(/[^0-9]/g, ''));
                setOtpError(false);
              }}
              style={inputStyle}
              placeholder="• • • • • •"
              aria-label={isRtl ? 'رمز التحقق المكون من 6 أرقام' : '6-digit verification code'}
              autoComplete="one-time-code"
              disabled={isSubmitting}
            />
            
            {otpError && (
              <p style={{ 
                color: '#EF4444', 
                fontSize: '13px', 
                marginTop: '8px', 
                textAlign: 'center',
                fontWeight: 600,
                fontFamily: "'Cairo', sans-serif"
              }}>
                {isRtl ? 'رمز التحقق غير صحيح. الرمز الافتراضي للتطوير: 123456' : 'Invalid OTP. Dev default: 123456'}
              </p>
            )}

            <button
              type="submit"
              style={{
                ...buttonStyle,
                opacity: otpInput.length === 6 ? 1 : 0.5,
                pointerEvents: otpInput.length === 6 ? 'auto' : 'none'
              }}
              disabled={otpInput.length !== 6}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
              {isRtl ? 'تحقق وافتح الملف السريري' : 'Verify & Unlock Dossier'}
            </button>
          </form>

          <div style={cookieIndicatorStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            {isRtl 
              ? 'جلسة مشفرة نشطة لمدة 30 يومًا - لا حاجة لتسجيل الدخول المتكرر' 
              : '30-Day Encrypted Session Active - No repetitive logins required'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 800, 
              color: TEAL_PRIMARY, 
              margin: '0 0 4px 0',
              fontFamily: "'Cairo', sans-serif"
            }}>
              {isRtl ? 'إجابات أسئلة التركيز' : 'Focus Questions Answers'}
            </h2>
            <p style={{ 
              fontSize: '13px', 
              color: '#6B7280', 
              margin: 0,
              fontFamily: "'Cairo', sans-serif"
            }}>
              {isRtl ? 'الخطوة K06 - إجابة الاستشاري الهندي' : 'Step K06 - Indian Consultant Response'}
            </p>
          </div>
          
          <div style={{
            ...badgeStyle,
            backgroundColor: isLocked ? '#F3F4F6' : TEAL_BG,
            color: isLocked ? '#6B7280' : TEAL_PRIMARY
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isLocked ? (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </>
              ) : (
                <>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </>
              )}
            </svg>
            {isLocked 
              ? (isRtl ? 'تم القفل - الرأي جاهز' : 'Locked - Opinion Ready') 
              : (isRtl ? 'قيد المراجعة' : 'In Review')}
          </div>
        </div>

        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: TEAL_BG, 
          borderRadius: '10px', 
          marginBottom: '24px',
          borderLeft: isRtl ? 'none' : `4px solid ${TEAL_ACCENT}`,
          borderRight: isRtl ? `4px solid ${TEAL_ACCENT}` : 'none'
        }}>
          <p style={{ 
            fontSize: '13px', 
            color: TEAL_PRIMARY, 
            margin: 0, 
            fontWeight: 600,
            fontFamily: "'Cairo', sans-serif",
            lineHeight: 1.6
          }}>
            {isRtl 
              ? 'ملاحظة: هذه الأسئلة صاغها الطبيب المعالج السعودي في الخطوة 3. يرجى تقديم إجابات سريرية مفصلة لكل سؤال.' 
              : 'Note: These questions were formulated by the Saudi Treating Doctor in Step 3. Please provide detailed clinical answers for each.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {activeCase.focusQuestions.map((question, index) => (
            <div 
              key={question.id} 
              style={{
                padding: '20px',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: `1.5px solid ${TEAL_BG}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginBottom: '14px' 
              }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: TEAL_PRIMARY,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 800,
                  fontFamily: "'Cairo', sans-serif",
                  flexShrink: 0
                }}>
                  {index + 1}
                </span>
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#1F2937',
                  margin: 0,
                  fontFamily: "'Cairo', sans-serif",
                  lineHeight: 1.6
                }}>
                  {isRtl ? question.questionAr : question.questionEn}
                </h3>
              </div>

              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder={isRtl ? 'اكتب إجابتك السريرية هنا...' : 'Type your clinical answer here...'}
                style={{
                  ...textareaStyle,
                  borderColor: answers[question.id]?.trim() ? TEAL_ACCENT : '#E5E7EB',
                  cursor: isLocked ? 'not-allowed' : 'text',
                  opacity: isLocked ? 0.7 : 1
                }}
                disabled={isLocked}
                dir={isRtl ? 'rtl' : 'ltr'}
                aria-label={`Answer to question ${index + 1}`}
              />

              {!isLocked && (
                <button
                  type="button"
                  onClick={() => toggleVoiceRecording(question.id)}
                  style={voiceButtonStyle}
                  aria-label={isRtl ? 'تسجيل ملاحظة صوتية' : 'Record voice note'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  {isRtl ? 'إملاء صوتي' : 'Voice Dictation'}
                </button>
              )}
            </div>
          ))}
        </div>

        {!isLocked && (
          <div style={{ marginTop: '32px' }}>
            <button
              type="button"
              onClick={handleSubmitOpinion}
              disabled={isSubmitting || activeCase.focusQuestions.some(q => !answers[q.id]?.trim())}
              style={{
                ...buttonStyle,
                backgroundColor: isSubmitting || activeCase.focusQuestions.some(q => !answers[q.id]?.trim()) 
                  ? '#9CA3AF' 
                  : TEAL_PRIMARY,
                cursor: isSubmitting || activeCase.focusQuestions.some(q => !answers[q.id]?.trim()) 
                  ? 'not-allowed' 
                  : 'pointer',
                padding: '18px 16px',
                fontSize: '17px'
              }}
            >
              {isSubmitting ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  {isRtl ? 'جاري الإرسال والتأمين...' : 'Submitting & Securing...'}
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                  {isRtl ? 'إرسال الرأي والانتقال للمنسق' : 'Submit Opinion & Advance to Coordinator'}
                </>
              )}
            </button>

            <p style={{
              fontSize: '12px',
              color: '#9CA3AF',
              textAlign: 'center',
              marginTop: '12px',
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 500
            }}>
              {isRtl 
                ? 'سيؤدي الإرسال إلى قفل المراجعة ونقل الحالة إلى مرحلة "كتابة التقرير" (OPINION_READY)' 
                : 'Submission will lock the review and advance the case to "writing_report" stage (OPINION_READY)'}
            </p>
          </div>
        )}

        {isLocked && (
          <div style={{
            marginTop: '32px',
            padding: '20px',
            backgroundColor: '#F0FDF4',
            borderRadius: '14px',
            border: `1.5px solid #BBF7D0`,
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 800,
              color: '#166534',
              margin: '0 0 6px 0',
              fontFamily: "'Cairo', sans-serif"
            }}>
              {isRtl ? 'تم إرسال الرأي بنجاح' : 'Opinion Successfully Submitted'}
            </h3>
            <p style={{
              fontSize: '13px',
              color: '#15803D',
              margin: 0,
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 500,
              lineHeight: 1.6
            }}>
              {isRtl 
                ? 'تم تأمين المراجعة وإحالتها إلى المنسق للتركيب ثنائي اللغة (الخطوة 6).' 
                : 'Review secured and forwarded to Coordinator for Bilingual Synthesis (Step 6).'}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        * {
          box-sizing: border-box;
        }
        
        input:focus, textarea:focus {
          border-color: ${TEAL_PRIMARY} !important;
          box-shadow: 0 0 0 3px ${TEAL_BG};
        }
        
        button:hover:not(:disabled) {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        ::placeholder {
          color: #9CA3AF;
          font-family: 'Cairo', sans-serif;
        }
        
        @media (max-width: 480px) {
          .consultant-card {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ConsultantMobileView;