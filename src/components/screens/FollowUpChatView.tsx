import React, { useState } from 'react';
import { ClinicalCase } from '../../types';
import { MessageSquare, Send, CheckCircle2, Star, ShieldCheck } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
}

export const FollowUpChatView: React.FC<Props> = ({ activeCase, onAdvanceStage }) => {
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string; role: string }>>([
    {
      sender: 'المريض (سالم العامري)',
      text: 'السلام عليكم يا دكتور، هل يمكنني الاستمرار على مسيل الدم قبل موعد العملية بأسبوع؟',
      time: '10:15 ص',
      role: 'patient',
    },
    {
      sender: 'د. عبدالله الشمري (الطبيب المعالج)',
      text: 'أهلاً بك أخي سالم. بناءً على توصية د. أرجون، سيتم إيقاف الأسبرين قبل الجراحة بـ 5 أيام واستبداله بحقن الهيبارين تحت إشراف التمريض المنزلي.',
      time: '10:22 ص',
      role: 'doctor',
    },
    {
      sender: 'نورة الدوسري (ممرضة ألو)',
      text: 'تم جدولة زيارة التمريض المنزلي لحي الملقا لتنفيذ الخطة ومتابعة العلامات الحيوية يوم الأحد بإذن الله.',
      time: '10:30 ص',
      role: 'nurse',
    },
  ]);

  const [inputVal, setInputVal] = useState('');

  const handleSendMessage = () => {
    if (!inputVal.trim()) return;
    setMessages([
      ...messages,
      {
        sender: 'المريض (سالم العامري)',
        text: inputVal,
        time: 'الآن',
        role: 'patient',
      },
    ]);
    setInputVal('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 21-Day Direct Line Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-400 bg-teal-950/60 border border-teal-800 px-2.5 py-1 rounded-full">
            💬 نافذة المتابعة المباشرة (21-Day Follow-Up P27)
          </span>
          <h2 className="text-xl font-bold text-white mt-2">
            محادثة الحالة: <span className="font-mono text-teal-400">{activeCase.caseNumber}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            قناة مشفرة بين المريض، الطبيب السعودي المعالج، وممرضة التنسيق الطبي
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-center">
          <span className="text-[10px] text-slate-400 block">فترة المتابعة المتبقية:</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">18 يوماً متبقية</span>
        </div>
      </div>

      {/* Chat Thread */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-2xl text-xs max-w-lg ${
                m.role === 'patient'
                  ? 'bg-teal-950/70 border border-teal-800/60 mr-auto text-right'
                  : m.role === 'doctor'
                  ? 'bg-sky-950/70 border border-sky-800/60 ml-auto text-right'
                  : 'bg-slate-950 border border-slate-800 text-right'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-slate-200">{m.sender}</span>
                <span className="text-[10px] text-slate-500">{m.time}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{m.text}</p>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="اكتب استفسارك الطبي التوضيحي هنا..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:ring-1 focus:ring-teal-500 outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="bg-teal-600 hover:bg-teal-500 text-white p-2.5 rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Case Archival & W20 Closure */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-200">إتمام الاستشارة وإغلاق الملف (Stage 9)</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            عند إغلاق الحالة، يتم أرشفة السجلات وإرسال استبيان رضا المرضى (W20) عبر واتساب.
          </p>
        </div>

        <button
          onClick={onAdvanceStage}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>إغلاق الحالة وإرسال استبيان W20 (Close Case)</span>
        </button>
      </div>
    </div>
  );
};
