import { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================================
// 1. src/hooks/useSlaCountdown.ts
// ============================================================================

export type ClinicalStage = 
  | 'triage' 
  | 'nurse' 
  | 'doctor' 
  | 'consultant' 
  | 'lab' 
  | 'pharmacy' 
  | 'followup';

interface UseSlaCountdownOptions {
  stage: ClinicalStage;
  patientId: string;
  startedAt?: number; // Unix timestamp in ms
  onComplete?: () => void;
}

interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  formatted: string;
  percentageRemaining: number;
}

const STAGE_DURATIONS_MS: Record<ClinicalStage, number> = {
  triage: 15 * 60 * 1000,         // 15 minutes
  nurse: 4 * 60 * 60 * 1000,      // 4 hours
  doctor: 24 * 60 * 60 * 1000,    // 24 hours
  consultant: 48 * 60 * 60 * 1000,// 48 hours
  lab: 30 * 60 * 1000,            // 30 minutes
  pharmacy: 45 * 60 * 1000,       // 45 minutes
  followup: 21 * 24 * 60 * 60 * 1000, // 21 days
};

const STORAGE_KEY_PREFIX = 'alo_sla_timer_';

export function useSlaCountdown({ stage, patientId, startedAt, onComplete }: UseSlaCountdownOptions): CountdownState {
  const storageKey = `${STORAGE_KEY_PREFIX}${patientId}_${stage}`;
  
  const getTargetTime = useCallback((): number => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return parseInt(stored, 10);
    }
    
    const baseTime = startedAt || Date.now();
    const duration = STAGE_DURATIONS_MS[stage];
    const target = baseTime + duration;
    localStorage.setItem(storageKey, target.toString());
    return target;
  }, [storageKey, startedAt, stage]);

  const calculateState = useCallback((targetTime: number): CountdownState => {
    const now = Date.now();
    const diff = Math.max(0, targetTime - now);
    const totalSeconds = Math.floor(diff / 1000);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const isExpired = totalSeconds <= 0;
    const durationMs = STAGE_DURATIONS_MS[stage];
    const percentageRemaining = Math.min(100, Math.max(0, (diff / durationMs) * 100));

    const pad = (n: number) => n.toString().padStart(2, '0');
    let formatted = '';
    
    if (stage === 'followup') {
      const days = Math.floor(totalSeconds / 86400);
      const remHours = Math.floor((totalSeconds % 86400) / 3600);
      formatted = `${days}d ${pad(remHours)}:${pad(minutes)}:${pad(seconds)}`;
    } else {
      formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    return { hours, minutes, seconds, totalSeconds, isExpired, formatted, percentageRemaining };
  }, [stage]);

  const [targetTime] = useState<number>(getTargetTime);
  const [state, setState] = useState<CountdownState>(() => calculateState(targetTime));

  useEffect(() => {
    if (state.isExpired) {
      onComplete?.();
      return;
    }

    const intervalId = setInterval(() => {
      const newState = calculateState(targetTime);
      setState(newState);
      if (newState.isExpired) {
        clearInterval(intervalId);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetTime, state.isExpired, calculateState, onComplete]);

  return state;
}


// ============================================================================
// SHARED UI COMPONENTS & CONSTANTS
// ============================================================================

const TEAL_PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  danger: '#D93025',
  warning: '#F9AB00',
  textDark: '#1A1A1A',
  textLight: '#FFFFFF',
};

const ClockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

interface LiveTimerBadgeProps {
  stage: ClinicalStage;
  patientId: string;
  startedAt?: number;
  lang: 'ar' | 'en';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline';
}

export function LiveTimerBadge({ stage, patientId, startedAt, lang, size = 'md', variant = 'solid' }: LiveTimerBadgeProps) {
  const timer = useSlaCountdown({ stage, patientId, startedAt });
  const isRtl = lang === 'ar';

  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2 font-semibold',
  };

  const colorClass = timer.isExpired 
    ? (variant === 'solid' ? `bg-red-100 text-[${TEAL_PALETTE.danger}] border border-red-200` : `border border-[${TEAL_PALETTE.danger}] text-[${TEAL_PALETTE.danger}]`)
    : timer.percentageRemaining < 20
    ? (variant === 'solid' ? `bg-orange-50 text-[${TEAL_PALETTE.warning}] border border-orange-200` : `border border-[${TEAL_PALETTE.warning}] text-[${TEAL_PALETTE.warning}]`)
    : (variant === 'solid' ? `bg-[${TEAL_PALETTE.background}] text-[${TEAL_PALETTE.primary}] border border-[${TEAL_PALETTE.secondary}]` : `border border-[${TEAL_PALETTE.primary}] text-[${TEAL_PALETTE.primary}]`);

  const expiredText = isRtl ? 'منتهي' : 'Expired';

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`inline-flex items-center rounded-full font-cairo transition-all duration-300 ${sizeClasses[size]} ${colorClass}`}
      role="timer"
      aria-live="polite"
      aria-label={`${isRtl ? 'الوقت المتبقي' : 'Time remaining'}: ${timer.formatted}`}
    >
      <ClockIcon className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} ${!timer.isExpired ? 'animate-pulse' : ''}`} />
      <span className="tabular-nums tracking-wider font-mono">
        {timer.isExpired ? expiredText : timer.formatted}
      </span>
    </div>
  );
}


// ============================================================================
// 2. src/components/screens/PatientStatusTimelineView.tsx
// ============================================================================

interface TimelineStage {
  id: string;
  stage: ClinicalStage;
  titleAr: string;
  titleEn: string;
  status: 'completed' | 'active' | 'pending';
  startedAt?: number;
}

interface PatientStatusTimelineViewProps {
  patientId: string;
  patientNameAr: string;
  patientNameEn: string;
  stages: TimelineStage[];
  lang: 'ar' | 'en';
  currentPersona: string;
}

export function PatientStatusTimelineView({ patientId, patientNameAr, patientNameEn, stages, lang, currentPersona }: PatientStatusTimelineViewProps) {
  const isRtl = lang === 'ar';
  const name = isRtl ? patientNameAr : patientNameEn;

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100 font-cairo"
    >
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#007B6E]">
            {isRtl ? 'المسار السريري للمريض' : 'Patient Clinical Timeline'}
          </h2>
          <p className="text-gray-600 mt-1">{name} • ID: {patientId}</p>
        </div>
        <div className="px-3 py-1 bg-[#E6FAF7] text-[#007B6E] rounded-lg text-sm font-medium">
          {currentPersona}
        </div>
      </header>

      <div className="relative">
        {/* Vertical Line */}
        <div className={`absolute top-0 bottom-0 w-0.5 bg-[#E6FAF7] ${isRtl ? 'right-6' : 'left-6'}`} />

        <ul className="space-y-6" role="list">
          {stages.map((item) => (
            <li key={item.id} className="relative flex items-start gap-4">
              {/* Node Indicator */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 shrink-0 ${
                item.status === 'completed' 
                  ? 'bg-[#00C6AE] border-[#E6FAF7]' 
                  : item.status === 'active' 
                  ? 'bg-white border-[#007B6E] shadow-md' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                {item.status === 'completed' ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : item.status === 'active' ? (
                  <div className="w-3 h-3 bg-[#007B6E] rounded-full animate-ping absolute" />
                ) : null}
              </div>

              {/* Content */}
              <div className="flex-1 pt-2 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">
                      {isRtl ? item.titleAr : item.titleEn}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {item.status === 'active' ? (isRtl ? 'قيد التنفيذ' : 'In Progress') : item.status === 'completed' ? (isRtl ? 'مكتمل' : 'Completed') : (isRtl ? 'في الانتظار' : 'Pending')}
                    </p>
                  </div>

                  {/* Dynamic Timer Integration */}
                  {item.status === 'active' && item.startedAt && (
                    <LiveTimerBadge 
                      stage={item.stage} 
                      patientId={patientId} 
                      startedAt={item.startedAt} 
                      lang={lang} 
                      size="lg" 
                    />
                  )}
                  {item.status === 'pending' && (
                    <span className="text-sm text-gray-400 italic">
                      {isRtl ? 'لم يبدأ العد التنازلي' : 'Countdown not started'}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


// ============================================================================
// 3. src/components/screens/hospital/HospitalQueuesMonitorTab.tsx
// ============================================================================

interface QueueItem {
  queueId: string;
  patientId: string;
  patientNameAr: string;
  patientNameEn: string;
  department: ClinicalStage;
  enteredQueueAt: number;
  priority: 'normal' | 'urgent' | 'critical';
}

interface HospitalQueuesMonitorTabProps {
  queues: QueueItem[];
  lang: 'ar' | 'en';
  currentPersona: string;
}

export function HospitalQueuesMonitorTab({ queues, lang, currentPersona }: HospitalQueuesMonitorTabProps) {
  const isRtl = lang === 'ar';

  const sortedQueues = useMemo(() => {
    return [...queues].sort((a, b) => {
      const priorityWeight = { critical: 3, urgent: 2, normal: 1 };
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return a.enteredQueueAt - b.enteredQueueAt;
    });
  }, [queues]);

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="w-full h-full bg-[#F8FDFA] p-6 font-cairo"
    >
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#007B6E]">
              {isRtl ? 'مراقبة طوابير المستشفى' : 'Hospital Queues Monitor'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isRtl ? 'تتبع مباشر لأوقات الانتظار ومؤشرات مستوى الخدمة' : 'Real-time tracking of wait times and SLA indicators'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-[#E6FAF7] text-[#007B6E] rounded-lg text-sm font-medium border border-[#00C6AE]/30">
              {currentPersona}
            </span>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C6AE] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#007B6E]"></span>
              </span>
              <span className="text-sm font-medium text-gray-700">{isRtl ? 'بث مباشر' : 'Live Feed'}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedQueues.map((item) => (
            <article 
              key={item.queueId}
              className={`bg-white rounded-xl p-5 border-l-4 shadow-sm hover:shadow-md transition-shadow ${
                item.priority === 'critical' ? 'border-l-red-500' : 
                item.priority === 'urgent' ? 'border-l-[#F9AB00]' : 
                'border-l-[#00C6AE]'
              } ${isRtl ? 'border-l-0 border-r-4' : ''}`}
              style={isRtl ? {
                borderRightColor: item.priority === 'critical' ? TEAL_PALETTE.danger : item.priority === 'urgent' ? TEAL_PALETTE.warning : TEAL_PALETTE.secondary
              } : {}}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-[#1A1A1A]">
                    {isRtl ? item.patientNameAr : item.patientNameEn}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {item.patientId}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  item.priority === 'critical' ? 'bg-red-100 text-red-700' :
                  item.priority === 'urgent' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-[#E6FAF7] text-[#007B6E]'
                }`}>
                  {isRtl && item.priority === 'critical' ? 'حرج' : item.priority}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-600 capitalize">
                  {item.department}
                </span>
                
                {/* Real-Time SLA Countdown */}
                <LiveTimerBadge 
                  stage={item.department} 
                  patientId={item.patientId} 
                  startedAt={item.enteredQueueAt} 
                  lang={lang} 
                  size="md" 
                  variant="outline"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// 4. src/components/followup/FollowUpChatThread.tsx
// ============================================================================

interface ChatMessage {
  id: string;
  sender: 'patient' | 'provider' | 'system';
  contentAr: string;
  contentEn: string;
  timestamp: number;
}

interface FollowUpChatThreadProps {
  patientId: string;
  consultationId: string;
  messages: ChatMessage[];
  followUpStartedAt: number;
  lang: 'ar' | 'en';
  currentPersona: string;
  onSendMessage: (content: string) => void;
}

export function FollowUpChatThread({ 
  patientId, 
  consultationId, 
  messages, 
  followUpStartedAt, 
  lang, 
  currentPersona,
  onSendMessage 
}: FollowUpChatThreadProps) {
  const isRtl = lang === 'ar';
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="flex flex-col h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden font-cairo"
    >
      {/* Header with 21-Day Countdown */}
      <header className="bg-gradient-to-r from-[#007B6E] to-[#00C6AE] p-4 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <div>
            <h2 className="font-bold text-lg">
              {isRtl ? 'متابعة الاستشارة' : 'Consultation Follow-Up'}
            </h2>
            <p className="text-white/80 text-xs">#{consultationId} • {currentPersona}</p>
          </div>
        </div>

        {/* 21-Day Dynamic Timer */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase tracking-widest text-white/70 font-bold">
            {isRtl ? 'ينتهي خلال' : 'Expires In'}
          </span>
          <LiveTimerBadge 
            stage="followup" 
            patientId={patientId} 
            startedAt={followUpStartedAt} 
            lang={lang} 
            size="md" 
          />
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FDFA]">
        {messages.map((msg) => {
          const isProvider = msg.sender === 'provider';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="px-3 py-1 bg-[#E6FAF7] text-[#007B6E] text-xs rounded-full border border-[#00C6AE]/30">
                  {isRtl ? msg.contentAr : msg.contentEn}
                </span>
              </div>
            );
          }

          return (
            <div 
              key={msg.id} 
              className={`flex ${isProvider ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                  isProvider 
                    ? 'bg-white text-[#1A1A1A] rounded-tr-none border border-gray-100' 
                    : 'bg-[#007B6E] text-white rounded-tl-none'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {isRtl ? msg.contentAr : msg.contentEn}
                </p>
                <span className={`text-[10px] mt-1 block ${isProvider ? 'text-gray-400' : 'text-white/60'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSubmit}
        className="p-4 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isRtl ? 'اكتب رسالة متابعة...' : 'Type a follow-up message...'}
          className="flex-1 bg-[#F8FDFA] border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C6AE] focus:border-transparent transition-all placeholder:text-gray-400"
          dir={isRtl ? 'rtl' : 'ltr'}
          aria-label={isRtl ? 'حقل إدخال الرسالة' : 'Message input field'}
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:bg-[#20BD5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          aria-label={isRtl ? 'إرسال عبر واتساب' : 'Send via WhatsApp'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </form>
    </div>
  );
}


// ============================================================================
// 5. src/components/screens/PartnerServicesView.tsx
// ============================================================================

interface PartnerServiceOrder {
  orderId: string;
  patientId: string;
  partnerNameAr: string;
  partnerNameEn: string;
  serviceType: 'lab' | 'pharmacy';
  status: 'processing' | 'ready' | 'dispatched';
  createdAt: number;
}

interface PartnerServicesViewProps {
  orders: PartnerServiceOrder[];
  lang: 'ar' | 'en';
  currentPersona: string;
}

export function PartnerServicesView({ orders, lang, currentPersona }: PartnerServicesViewProps) {
  const isRtl = lang === 'ar';

  const labOrders = orders.filter(o => o.serviceType === 'lab');
  const pharmacyOrders = orders.filter(o => o.serviceType === 'pharmacy');

  const renderOrderCard = (order: PartnerServiceOrder) => (
    <div 
      key={order.orderId}
      className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-[#1A1A1A] group-hover:text-[#007B6E] transition-colors">
            {isRtl ? order.partnerNameAr : order.partnerNameEn}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            {isRtl ? 'رقم الطلب' : 'Order'}: #{order.orderId}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          order.status === 'processing' ? 'bg-blue-50 text-blue-600' :
          order.status === 'ready' ? 'bg-[#E6FAF7] text-[#007B6E]' :
          'bg-purple-50 text-purple-600'
        }`}>
          {isRtl && order.status === 'processing' ? 'قيد المعالجة' : 
           isRtl && order.status === 'ready' ? 'جاهز' : 
           isRtl && order.status === 'dispatched' ? 'تم الإرسال' : order.status}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <ClockIcon className="w-3.5 h-3.5" />
          <span>{isRtl ? 'الوقت المتبقي لـ SLA' : 'SLA Remaining'}</span>
        </div>
        
        {/* Dynamic Lab (30m) or Pharmacy (45m) Timer */}
        <LiveTimerBadge 
          stage={order.serviceType} 
          patientId={order.patientId} 
          startedAt={order.createdAt} 
          lang={lang} 
          size="sm" 
          variant="solid"
        />
      </div>
    </div>
  );

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="w-full max-w-6xl mx-auto p-6 font-cairo"
    >
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#007B6E]">
            {isRtl ? 'خدمات الشركاء' : 'Partner Services'}
          </h2>
          <p className="text-gray-600 mt-1 text-sm">
            {isRtl ? 'تتبع مباشر لطلبات المختبر والصيدلية' : 'Live tracking of lab and pharmacy requests'}
          </p>
        </div>
        <div className="px-3 py-1.5 bg-[#E6FAF7] text-[#007B6E] rounded-lg text-sm font-medium border border-[#00C6AE]/20">
          {currentPersona}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Laboratory Section */}
        <section aria-labelledby="lab-heading">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#E6FAF7] flex items-center justify-center text-[#007B6E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <div>
              <h3 id="lab-heading" className="text-lg font-bold text-[#1A1A1A]">
                {isRtl ? 'طلبات المختبر' : 'Laboratory Orders'}
              </h3>
              <p className="text-xs text-gray-500">
                {isRtl ? 'اتفاقية مستوى الخدمة: 30 دقيقة' : 'SLA: 30 Minutes'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {labOrders.length > 0 ? labOrders.map(renderOrderCard) : (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-400">{isRtl ? 'لا توجد طلبات مختبر نشطة' : 'No active lab orders'}</p>
              </div>
            )}
          </div>
        </section>

        {/* Pharmacy Section */}
        <section aria-labelledby="pharmacy-heading">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#E6FAF7] flex items-center justify-center text-[#007B6E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <div>
              <h3 id="pharmacy-heading" className="text-lg font-bold text-[#1A1A1A]">
                {isRtl ? 'طلبات الصيدلية' : 'Pharmacy Orders'}
              </h3>
              <p className="text-xs text-gray-500">
                {isRtl ? 'اتفاقية مستوى الخدمة: 45 دقيقة' : 'SLA: 45 Minutes'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {pharmacyOrders.length > 0 ? pharmacyOrders.map(renderOrderCard) : (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-400">{isRtl ? 'لا توجد طلبات صيدلية نشطة' : 'No active pharmacy orders'}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}