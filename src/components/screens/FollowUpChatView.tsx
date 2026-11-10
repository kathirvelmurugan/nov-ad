import React, { useState, useEffect, useRef } from 'react';
import { ClinicalCase } from '../../types';
import {
  TEAL_PRIMARY,
  TEAL_SECONDARY,
  FEEDBACK_TAGS_AR,
  FEEDBACK_TAGS_EN,
  generateMockSHA256,
} from '../followup/followUpConstants';
import { FollowUpReportDownloadCard } from '../followup/FollowUpReportDownloadCard';
import { FollowUpChatThread, ChatMessage } from '../followup/FollowUpChatThread';
import { FollowUpSatisfactionWidget } from '../followup/FollowUpSatisfactionWidget';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

const FollowUpChatView: React.FC<Props> = ({ activeCase, onAdvanceStage, onUpdateCase }) => {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [personaId, setPersonaId] = useState<number>(1);
  const [daysRemaining, setDaysRemaining] = useState<number>(20);
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Re-hydrate the persisted relay loop: patient question -> consultant answer
    const persistedQ = (activeCase.metadata?.patientQuestions as string[]) || [];
    const persistedA = (activeCase.metadata?.consultantAnswers as string[]) || [];
    const seeded: ChatMessage[] = [];
    persistedQ.forEach((q, i) => {
      seeded.push({ id: `seed_q_${i}`, text: q, sender: 'patient', timestamp: new Date() });
      if (persistedA[i]) {
        seeded.push({ id: `seed_a_${i}`, text: `Indian consultant answer: ${persistedA[i]}`, sender: 'coordinator', timestamp: new Date() });
      }
    });
    return seeded;
  });
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<Set<number>>(new Set());
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadComplete, setDownloadComplete] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isRTL = lang === 'ar';
  const tags = isRTL ? FEEDBACK_TAGS_AR : FEEDBACK_TAGS_EN;

  useEffect(() => {
    const initialPatientQuestion = isRTL
      ? `السلام عليكم، أود التأكد بخصوص توصيات تقرير الرأي الطبي الأول الصادر اليوم بخصوص (${activeCase.diagnosisAr || activeCase.diagnosis})، ومتى يجب البدء في تنفيذ خطة العلاج؟`
      : `Hello, I would like to clarify the recommendations in today's second opinion report regarding (${activeCase.diagnosis}), and when we should initiate the recommended protocol?`;

    const initialCoordinatorReply = isRTL
      ? `أهلاً بك أخي الكريم، تم استلام استفسارك وإدراجه في ملف المتابعة السريرية المباشرة. نافذة المتابعة متاحة لك لمدة 21 يوماً مجاناً مع إشراف الفريق الاستشاري للإجابة على كافة تساؤلاتك.`
      : `Welcome. Your clinical follow-up question has been logged and shared with the medical board. Your 21-day complimentary follow-up window is active with continuous coordinator support.`;

    setMessages([
      {
        id: 'msg-seed-1',
        text: initialPatientQuestion,
        sender: 'patient',
        timestamp: new Date(Date.now() - 3600000 * 2)
      },
      {
        id: 'msg-seed-2',
        text: initialCoordinatorReply,
        sender: 'coordinator',
        timestamp: new Date(Date.now() - 3600000)
      }
    ]);
  }, [activeCase.id, isRTL]);

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
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: chatInput.trim(),
      sender: 'patient',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // Persist the patient's question so the coordinator relays THIS exact text (C09)
    const existingQ = (activeCase.metadata?.patientQuestions as string[]) || [];
    onUpdateCase({
      metadata: {
        ...(activeCase.metadata || {}),
        patientQuestions: [...existingQ, newMsg.text],
      },
    });

    setTimeout(() => {
      const coordinatorReply: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        text: isRTL
          ? 'تم استلام استفسارك. سيتم نقله مباشرة إلى الاستشاري الهندي عبر منسق رعاية ألو.'
          : 'Your inquiry has been received. It will be relayed directly to the Indian consultant via ALO care coordinator.',
        sender: 'coordinator',
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

  const handleRatingChange = (star: number) => {
    setRating(star);
    onUpdateCase({ metadata: { ...(activeCase.metadata || {}), rating: star } });
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
          type="button"
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
        <FollowUpReportDownloadCard
          activeCase={activeCase}
          isRTL={isRTL}
          isDownloading={isDownloading}
          downloadComplete={downloadComplete}
          onDownloadPDF={handleDownloadPDF}
        />

        <FollowUpChatThread
          isRTL={isRTL}
          daysRemaining={daysRemaining}
          messages={messages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          onSendMessage={handleSendMessage}
          chatEndRef={chatEndRef as React.RefObject<HTMLDivElement>}
        />

        <FollowUpSatisfactionWidget
          isRTL={isRTL}
          rating={rating}
          hoverRating={hoverRating}
          tags={tags}
          selectedTags={selectedTags}
          onRatingChange={handleRatingChange}
          setHoverRating={setHoverRating}
          onToggleTag={toggleTag}
          onCompleteFollowUp={handleCompleteFollowUp}
        />
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
export { FollowUpChatView };
