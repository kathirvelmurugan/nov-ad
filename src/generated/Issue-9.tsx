import React, { useState, useRef, useEffect, useCallback } from 'react';

// --- Types & Interfaces ---
type PersonaId = 'P27' | 'P28' | 'P29' | 'W20';
type ChannelId = 'dr_abdullah' | 'dr_arjun';
type Language = 'ar' | 'en';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'doctor' | 'patient' | 'system';
  text: string;
  timestamp: Date;
  channelId: ChannelId;
}

interface PersonaProfile {
  id: PersonaId;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  avatarColor: string;
}

interface NPSState {
  isOpen: boolean;
  rating: number | null;
  feedback: string;
  submitted: boolean;
}

// --- Constants & Data ---
const TEAL_PRIMARY = '#007B6E';
const TEAL_SECONDARY = '#00C6AE';
const TEAL_BG = '#E6FAF7';
const WHATSAPP_GREEN = '#25D366';

const PERSONAS: Record<PersonaId, PersonaProfile> = {
  P27: { id: 'P27', nameAr: 'أحمد محمد', nameEn: 'Ahmed Mohammed', roleAr: 'مريض متابعة', roleEn: 'Follow-up Patient', avatarColor: TEAL_PRIMARY },
  P28: { id: 'P28', nameAr: 'سارة علي', nameEn: 'Sarah Ali', roleAr: 'مريضة متابعة', roleEn: 'Follow-up Patient', avatarColor: TEAL_SECONDARY },
  P29: { id: 'P29', nameAr: 'خالد عبدالله', nameEn: 'Khalid Abdullah', roleAr: 'مريض متابعة', roleEn: 'Follow-up Patient', avatarColor: '#005C52' },
  W20: { id: 'W20', nameAr: 'نورة سعد', nameEn: 'Noura Saad', roleAr: 'مريضة متابعة', roleEn: 'Follow-up Patient', avatarColor: WHATSAPP_GREEN },
};

const DOCTORS = {
  dr_abdullah: { id: 'dr_abdullah', nameAr: 'د. عبدالله', nameEn: 'Dr. Abdullah', roleAr: 'الطبيب المعالج (السعودية)', roleEn: 'Treating Doctor (Saudi Arabia)' },
  dr_arjun: { id: 'dr_arjun', nameAr: 'د. أرجون', nameEn: 'Dr. Arjun', roleAr: 'الطبيب الاستشاري (الهند)', roleEn: 'Consultant Doctor (India)' },
};

const UI_STRINGS = {
  ar: {
    stageTitle: 'المرحلة 8 و 9: متابعة 21 يوم وإغلاق الحالة',
    personaSwitcher: 'تبديل الملف الشخصي',
    channels: 'قنوات التواصل',
    saudiDoctor: 'الطبيب المعالج - د. عبدالله',
    indianConsultant: 'الاستشاري - د. أرجون',
    typeMessage: 'اكتب رسالتك...',
    send: 'إرسال',
    closeCase: 'إغلاق الحالة بنقرة واحدة',
    closeCaseConfirm: 'هل أنت متأكد من إغلاق هذه الحالة؟',
    caseClosed: 'تم إغلاق الحالة بنجاح',
    npsTitle: 'تقييم تجربة ALO DOCTOR',
    npsQuestion: 'ما مدى احتمالية أن توصي بخدماتنا؟',
    npsFeedback: 'أضف تعليقك (اختياري)',
    npsSubmit: 'إرسال التقييم',
    npsThanks: 'شكراً لتقييمك!',
    day21Badge: 'متابعة اليوم 21',
    systemClosure: 'تم إغلاق الحالة بواسطة النظام.',
  },
  en: {
    stageTitle: 'Stage 8 & 9: 21-Day Follow-Up & Case Closure',
    personaSwitcher: 'Switch Persona Profile',
    channels: 'Communication Channels',
    saudiDoctor: 'Treating Doctor - Dr. Abdullah',
    indianConsultant: 'Consultant - Dr. Arjun',
    typeMessage: 'Type your message...',
    send: 'Send',
    closeCase: '1-Click Case Closure',
    closeCaseConfirm: 'Are you sure you want to close this case?',
    caseClosed: 'Case closed successfully',
    npsTitle: 'Rate ALO DOCTOR Experience',
    npsQuestion: 'How likely are you to recommend our services?',
    npsFeedback: 'Add your feedback (optional)',
    npsSubmit: 'Submit Rating',
    npsThanks: 'Thank you for your rating!',
    day21Badge: 'Day 21 Follow-Up',
    systemClosure: 'Case has been closed by the system.',
  }
};

// --- Helper Components ---

const StarRating: React.FC<{ rating: number; onRate: (r: number) => void; disabled: boolean }> = ({ rating, onRate, disabled }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-2 justify-center my-4" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onRate(star)}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
          className={`text-4xl transition-all duration-200 focus:outline-none ${
            star <= (hover || rating) ? 'scale-110' : 'opacity-40 scale-90'
          }`}
          style={{ color: star <= (hover || rating) ? '#FFB800' : '#CBD5E1' }}
          aria-label={`${star} Star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

// --- Main Component ---

const Stage8FollowUpChat: React.FC = () => {
  // State Management
  const [lang, setLang] = useState<Language>('ar');
  const [activePersona, setActivePersona] = useState<PersonaId>('P27');
  const [activeChannel, setActiveChannel] = useState<ChannelId>('dr_abdullah');
  const [isCaseClosed, setIsCaseClosed] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const [messages, setMessages] = useState<Record<ChannelId, Message[]>>({
    dr_abdullah: [
      {
        id: 'init-ab-1',
        senderId: 'dr_abdullah',
        senderName: lang === 'ar' ? DOCTORS.dr_abdullah.nameAr : DOCTORS.dr_abdullah.nameEn,
        senderRole: 'doctor',
        text: lang === 'ar' ? 'مرحباً، هذا د. عبدالله. نحن في متابعة اليوم 21. كيف تشعر اليوم؟' : 'Hello, this is Dr. Abdullah. We are at the 21-day follow-up. How are you feeling today?',
        timestamp: new Date(Date.now() - 3600000),
        channelId: 'dr_abdullah'
      }
    ],
    dr_arjun: [
      {
        id: 'init-ar-1',
        senderId: 'dr_arjun',
        senderName: lang === 'ar' ? DOCTORS.dr_arjun.nameAr : DOCTORS.dr_arjun.nameEn,
        senderRole: 'doctor',
        text: lang === 'ar' ? 'مرحباً، معك د. أرجون من الهند. لقد راجعت تقاريرك الأخيرة. هل لديك أي استفسارات؟' : 'Hello, Dr. Arjun here from India. I have reviewed your recent reports. Do you have any questions?',
        timestamp: new Date(Date.now() - 7200000),
        channelId: 'dr_arjun'
      }
    ]
  });

  const [nps, setNps] = useState<NPSState>({
    isOpen: false,
    rating: null,
    feedback: '',
    submitted: false
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = UI_STRINGS[lang];
  const currentPersona = PERSONAS[activePersona];
  const isRTL = lang === 'ar';

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  // Sync language direction and font
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.style.fontFamily = "'Cairo', sans-serif";
  }, [lang, isRTL]);

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || isCaseClosed) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: activePersona,
      senderName: lang === 'ar' ? currentPersona.nameAr : currentPersona.nameEn,
      senderRole: 'patient',
      text: inputValue.trim(),
      timestamp: new Date(),
      channelId: activeChannel
    };

    setMessages(prev => ({
      ...prev,
      [activeChannel]: [...prev[activeChannel], newMsg]
    }));
    setInputValue('');
  }, [inputValue, isCaseClosed, activePersona, activeChannel, currentPersona, lang]);

  const handleCloseCase = useCallback(() => {
    if (window.confirm(t.closeCaseConfirm)) {
      setIsCaseClosed(true);
      
      const closureMsg: Message = {
        id: `sys-${Date.now()}`,
        senderId: 'system',
        senderName: 'ALO DOCTOR System',
        senderRole: 'system',
        text: t.systemClosure,
        timestamp: new Date(),
        channelId: activeChannel
      };

      setMessages(prev => ({
        ...prev,
        [activeChannel]: [...prev[activeChannel], closureMsg]
      }));

      // Trigger NPS Modal after short delay
      setTimeout(() => {
        setNps(prev => ({ ...prev, isOpen: true }));
      }, 1500);
    }
  }, [t, activeChannel]);

  const handleNPSSubmit = useCallback(() => {
    if (nps.rating === null) return;
    setNps(prev => ({ ...prev, submitted: true }));
    setTimeout(() => {
      setNps({ isOpen: false, rating: null, feedback: '', submitted: false });
    }, 3000);
  }, [nps.rating]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center p-4 md:p-8 transition-colors duration-300"
      style={{ backgroundColor: '#F4F7F6', fontFamily: "'Cairo', sans-serif", direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Global Styles Injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: ${TEAL_SECONDARY}; border-radius: 10px; }
        .chat-bubble-patient {
          background-color: ${TEAL_BG};
          color: #0F172A;
          border-radius: ${isRTL ? '16px 4px 16px 16px' : '4px 16px 16px 16px'};
        }
        .chat-bubble-doctor {
          background-color: #FFFFFF;
          color: #1E293B;
          border: 1px solid #E2E8F0;
          border-radius: ${isRTL ? '4px 16px 16px 16px' : '16px 4px 16px 16px'};
        }
        .chat-bubble-system {
          background-color: #F1F5F9;
          color: #64748B;
          border-radius: 8px;
          font-size: 0.85rem;
        }
      `}</style>

      {/* Header & Controls */}
      <header className="w-full max-w-6xl mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: TEAL_PRIMARY }}>
              8
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{t.stageTitle}</h1>
              <span 
                className="inline-block mt-1 px-3 py-1 text-xs font-semibold text-white rounded-full"
                style={{ backgroundColor: WHATSAPP_GREEN }}
              >
                {t.day21Badge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
              className="px-4 py-2 text-sm font-semibold rounded-lg border transition-all hover:bg-gray-50"
              style={{ borderColor: TEAL_PRIMARY, color: TEAL_PRIMARY }}
              aria-label="Toggle Language"
            >
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>

            {/* 11 Persona Switcher Compatibility (Showing subset P27-P29, W20 as requested) */}
            <div className="relative">
              <select
                value={activePersona}
                onChange={(e) => setActivePersona(e.target.value as PersonaId)}
                className="appearance-none pl-10 pr-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 cursor-pointer"
                style={{ focusRingColor: TEAL_SECONDARY } as any}
                aria-label={t.personaSwitcher}
              >
                {Object.values(PERSONAS).map(p => (
                  <option key={p.id} value={p.id}>
                    {lang === 'ar' ? p.nameAr : p.nameEn} ({p.id})
                  </option>
                ))}
                {/* Placeholders for remaining 7 personas of the 11-persona architecture */}
                <option disabled>──────────</option>
                <option disabled>+7 more personas available in v2.4</option>
              </select>
              <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} pointer-events-none`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL_PRIMARY} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Layout */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar: Channels & Actions */}
        <aside className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100" style={{ backgroundColor: TEAL_BG }}>
              <h2 className="font-bold text-gray-700 text-sm">{t.channels}</h2>
            </div>
            
            {/* Channel Buttons */}
            <div className="p-2 flex flex-col gap-2">
              {(Object.keys(DOCTORS) as ChannelId[]).map((chId) => {
                const doc = DOCTORS[chId];
                const isActive = activeChannel === chId;
                return (
                  <button
                    key={chId}
                    onClick={() => setActiveChannel(chId)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                      isActive ? 'shadow-md' : 'hover:bg-gray-50'
                    }`}
                    style={isActive ? { backgroundColor: TEAL_PRIMARY, color: 'white' } : {}}
                    aria-pressed={isActive}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ 
                        backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : TEAL_BG,
                        color: isActive ? 'white' : TEAL_PRIMARY 
                      }}
                    >
                      {chId === 'dr_abdullah' ? 'ع' : 'A'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-sm truncate">
                        {lang === 'ar' ? doc.nameAr : doc.nameEn}
                      </p>
                      <p className={`text-xs truncate ${isActive ? 'text-teal-100' : 'text-gray-500'}`}>
                        {chId === 'dr_abdullah' ? t.saudiDoctor : t.indianConsultant}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Case Closure Action */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mt-auto">
            {!isCaseClosed ? (
              <button
                onClick={handleCloseCase}
                className="w-full py-3 px-4 rounded-xl font-bold text-white transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                style={{ backgroundColor: TEAL_PRIMARY }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                {t.closeCase}
              </button>
            ) : (
              <div 
                className="w-full py-3 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 opacity-80 cursor-not-allowed"
                style={{ backgroundColor: '#64748B' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                {t.caseClosed}
              </div>
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <section className="lg:col-span-9 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[70vh]">
          
          {/* Chat Header */}
          <div 
            className="p-4 flex items-center justify-between border-b border-gray-100 shrink-0"
            style={{ backgroundColor: TEAL_BG }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: TEAL_PRIMARY }}
              >
                {activeChannel === 'dr_abdullah' ? 'ع' : 'A'}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">
                  {lang === 'ar' ? DOCTORS[activeChannel].nameAr : DOCTORS[activeChannel].nameEn}
                </h3>
                <p className="text-xs text-gray-600">
                  {activeChannel === 'dr_abdullah' ? t.saudiDoctor : t.indianConsultant}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-medium text-gray-600">
                {lang === 'ar' ? 'متصل' : 'Online'}
              </span>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-gray-50/50">
            {messages[activeChannel].map((msg) => {
              const isPatient = msg.senderRole === 'patient';
              const isSystem = msg.senderRole === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-4">
                    <span className="chat-bubble-system px-4 py-2 text-center max-w-md">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col max-w-[85%] md:max-w-[70%] ${
                    isPatient ? (isRTL ? 'mr-auto ml-0 items-end' : 'ml-auto mr-0 items-end') : (isRTL ? 'ml-auto mr-0 items-start' : 'mr-auto ml-0 items-start')
                  }`}
                >
                  <span className={`text-[10px] font-semibold mb-1 px-1 ${isPatient ? 'text-gray-500' : ''}`} style={!isPatient ? { color: TEAL_PRIMARY } : {}}>
                    {msg.senderName}
                  </span>
                  <div className={`px-4 py-3 shadow-sm ${isPatient ? 'chat-bubble-patient' : 'chat-bubble-doctor'}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 bg-white shrink-0">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex items-end gap-3"
            >
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={t.typeMessage}
                  disabled={isCaseClosed}
                  rows={1}
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ focusRingColor: TEAL_SECONDARY } as any}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  aria-label={t.typeMessage}
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isCaseClosed}
                className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-md"
                style={{ backgroundColor: TEAL_PRIMARY }}
                aria-label={t.send}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }}
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* NPS Survey Modal */}
      {nps.isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nps-title"
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div 
              className="p-6 text-center text-white"
              style={{ background: `linear-gradient(135deg, ${TEAL_PRIMARY} 0%, ${TEAL_SECONDARY} 100%)` }}
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
              <h2 id="nps-title" className="text-2xl font-bold mb-1">{t.npsTitle}</h2>
              <p className="text-sm opacity-90 font-light">{t.npsQuestion}</p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {!nps.submitted ? (
                <>
                  <StarRating 
                    rating={nps.rating || 0} 
                    onRate={(r) => setNps(prev => ({ ...prev, rating: r }))} 
                    disabled={false} 
                  />
                  
                  <div className="mt-6">
                    <label htmlFor="nps-feedback" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.npsFeedback}
                    </label>
                    <textarea
                      id="nps-feedback"
                      value={nps.feedback}
                      onChange={(e) => setNps(prev => ({ ...prev, feedback: e.target.value }))}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
                      style={{ focusRingColor: TEAL_SECONDARY } as any}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>

                  <button
                    onClick={handleNPSSubmit}
                    disabled={nps.rating === null}
                    className="w-full mt-6 py-3.5 rounded-xl font-bold text-white text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98]"
                    style={{ backgroundColor: TEAL_PRIMARY }}
                  >
                    {t.npsSubmit}
                  </button>
                </>
              ) : (
                <div className="py-8 text-center animate-fade-in">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: TEAL_BG }}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={TEAL_PRIMARY} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{t.npsThanks}</h3>
                  <p className="text-sm text-gray-500">
                    {lang === 'ar' ? 'سيتم إغلاق هذه النافذة تلقائياً...' : 'This window will close automatically...'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="w-full max-w-6xl mt-8 text-center pb-4">
        <p className="text-xs font-semibold text-gray-400 tracking-wide">
          ALO DOCTOR <span style={{ color: TEAL_PRIMARY }}>v2.4</span> Saudi Edition • Stage 8 & 9 Follow-Up Engine
        </p>
      </footer>
    </div>
  );
};

export default Stage8FollowUpChat;