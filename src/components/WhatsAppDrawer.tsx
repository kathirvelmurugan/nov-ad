import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink, CheckCheck } from 'lucide-react';
import { ClinicalCase } from '../types';

interface Props {
  activeCase: ClinicalCase;
}

export const WhatsAppDrawer: React.FC<Props> = ({ activeCase }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Derive relevant WhatsApp template based on current stage
  const getTemplate = () => {
    switch (activeCase.currentStage) {
      case 'INTAKE_RECEIVED':
        return {
          code: 'W02',
          title: 'استلام الحالة (Case Received)',
          body: `مرحباً بك في ألو دكتور. تم استلام ملفك الطبي ورقم الحالة هو ${activeCase.caseNumber}. جارٍ الآن تدقيق التقارير الطبية من قبل التمريض.`,
          button: 'تتبع مسار الحالة (Track Case)',
        };
      case 'NURSE_CHECK':
        return {
          code: 'W03',
          title: 'تدقيق المستندات (Files Audit)',
          body: `أهلاً بك. ممرضة ألو دكتور تقوم بمطابقة الأشعة والتقارير لحالة ${activeCase.caseNumber}. في حال طلب مستند إضافي ستصلك رسالة فورية.`,
          button: 'عرض المستندات المرفقة',
        };
      case 'DOCTOR_REVIEW':
        return {
          code: 'W01',
          title: 'مراجعة الطبيب السعودي (Doctor Review)',
          body: `يقوم الآن ${activeCase.treatingDoctor.name} في ${activeCase.treatingDoctor.hospital} بدراسة تقاريرك وتحديد الاستشاري الدولي الأنسب.`,
          button: 'متابعة الحالة',
        };
      case 'AWAITING_PAYMENT':
        return {
          code: 'W05',
          title: 'رابط سداد الرأي الطبي (Payment Link)',
          body: `تم اعتماد خطة الاستشارة لحالة ${activeCase.caseNumber}. إجمالي المبلغ: ${activeCase.pricing.totalSar} ر.س شامل ضريبة القيمة المضافة 15%. يُرجى السداد للمتابعة.`,
          button: 'ادفع بأمان عبر مدى / أبل باي (Pay Securely)',
        };
      case 'WITH_CONSULTANT':
        return {
          code: 'W07',
          title: 'بدء الاستشارة الدولية (Consultant Active)',
          body: `تم استلام الحالة من قبل الاستشاري الدولي ${activeCase.consultant.name} في ${activeCase.consultant.center}. جارٍ تجهيز المواعيد المتاحة للاتصال المرئي.`,
          button: 'متابعة جدول المواعيد',
        };
      case 'OPINION_READY':
        return {
          code: 'W10',
          title: 'صدور الرأي والتقرير المعتمد (Opinion Ready)',
          body: `صدر الرأي الطبي الثاني لحالة ${activeCase.caseNumber} معتمد ومترجم باللغتين العربية والإنجليزية، ومختوم رسمياً من ألو دكتور.`,
          button: 'تحميل التقرير الطبي المعتمد (View Opinion)',
        };
      case 'PARTNER_SERVICES':
        return {
          code: 'W11',
          title: 'الخدمات الموصى بها (Partner Orders)',
          body: `أضاف طبيبك المعالج توصيات طبية تكميلية تشمل تحاليل مخبرية وتمريضاً منزلياً. يمكنك تأكيد وتتبع المواعيد الآن.`,
          button: 'حجز الخدمات الطبية',
        };
      case 'FOLLOW_UP_21_DAYS':
        return {
          code: 'W18',
          title: 'متابعة الـ 21 يوماً (21-Day Direct Line)',
          body: `نافذة التواصل المباشر مفتوحة لمدة 21 يوماً مع طبيبك المعالج وممرضة ألو دكتور لطرح أي استفسارات توضيحية.`,
          button: 'فتح المحادثة الطبية',
        };
      case 'CLOSED':
      default:
        return {
          code: 'W20',
          title: 'إغلاق الحالة وتقييم التجربة (Case Closed & NPS)',
          body: `تم إغلاق ملف الاستشارة بنجاح. نأمل أن نكون قد قدمنا لك الاطمئنان والرأي الموثوق. يُرجى تقييم تجربتك معنا.`,
          button: 'تقييم الخدمة (5 نجوم)',
        };
    }
  };

  const tpl = getTemplate();

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 left-5 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-full shadow-2xl flex items-center gap-2 border-2 border-emerald-400/40 transition-all hover:scale-105"
        title="محاكي إشعارات واتساب الرسمية (Meta WhatsApp Drawer)"
      >
        <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
        <span className="text-xs font-bold hidden sm:inline">WhatsApp Meta ({tpl.code})</span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-y-0 left-0 z-50 w-84 sm:w-96 bg-slate-900/98 backdrop-blur-xl border-r border-slate-700 shadow-2xl p-4 flex flex-col text-slate-100 animate-in slide-in-from-left duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white">
                <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-400">ALO DOCTOR WhatsApp</h4>
                <p className="text-[10px] text-slate-400">Meta-Verified Business Account</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* WhatsApp Chat Frame Simulation */}
          <div className="my-auto py-4 flex flex-col gap-3">
            <div className="text-center">
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full">
                اليوم · قالب معتمد {tpl.code}
              </span>
            </div>

            <div className="bg-emerald-950/70 border border-emerald-800/80 rounded-2xl rounded-tr-none p-3.5 shadow-lg relative text-right">
              <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-emerald-800/40">
                <span className="text-xs font-bold text-emerald-300">{tpl.title}</span>
                <span className="text-[10px] text-emerald-500 font-mono font-semibold">{tpl.code}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{tpl.body}</p>

              <div className="mt-3 pt-2 border-t border-emerald-800/50">
                <button
                  onClick={() => alert(`تم النقر على الرابط الذكي: ${tpl.button}`)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <span>{tpl.button}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-emerald-400/80">
                <span>17:02</span>
                <CheckCheck className="w-3 h-3 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
            قوالب Meta الرسمية تشتمل فقط على روابط سريعة بدون نصوص تقارير داخل المحادثة حفاظاً على سرية البيانات الطبية.
          </div>
        </div>
      )}
    </>
  );
};
