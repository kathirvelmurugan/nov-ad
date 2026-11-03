import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink, CheckCheck } from 'lucide-react';
import { ClinicalCase } from '../types';

interface Props {
  activeCase: ClinicalCase;
  externalOpen?: boolean;
  onSetExternalOpen?: (open: boolean) => void;
}

export const WhatsAppDrawer: React.FC<Props> = ({ activeCase, externalOpen, onSetExternalOpen }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = onSetExternalOpen || setInternalOpen;

  // Derive relevant WhatsApp template based on current stage
  const getTemplate = () => {
    switch (activeCase.currentStage) {
      case 'INTAKE_RECEIVED':
        return {
          code: 'W01',
          title: 'تأكيد استلام الطلب (Intake Confirmation)',
          body: `مرحباً بك في ألو دكتور. تم استلام طلب الرأي الطبي الثاني بنجاح، ورقم ملفك الطبي هو ${activeCase.caseNumber}. جارٍ مراجعة وتدقيق المستندات بواسطة تمريض الفرز.`,
          button: 'تتبع مسار الحالة (Track Case)',
        };
      case 'NURSE_CHECK':
        return {
          code: 'W04',
          title: 'اكتمال التدقيق وحجب الهوية (De-identification Complete)',
          body: `أهلاً بك. أتمت ممرضة ألو دكتور تدقيق كافة الفحوصات ومطابقتها للمعايير السريرية، وحجب الهوية لضمان الخصوصية. أحيل الملف للطبيب السعودي المعالج.`,
          button: 'عرض حالة التدقيق',
        };
      case 'DOCTOR_REVIEW':
        return {
          code: 'W05',
          title: 'مراجعة الطبيب السعودي وصياغة الأسئلة (Doctor Review)',
          body: `يقوم الآن ${activeCase.treatingDoctor.name} في ${activeCase.treatingDoctor.hospital} بصياغة الأسئلة السريرية التخصصية للاستشاري الدولي.`,
          button: 'متابعة الحالة',
        };
      case 'AWAITING_PAYMENT':
        return {
          code: 'W06',
          title: 'رابط سداد باقة الرأي الطبي (Payment Link)',
          body: `اعتمد طبيبك المعالج خطة الاستشارة لحالة ${activeCase.caseNumber}. إجمالي المبلغ: ${activeCase.pricing.totalSar} ر.س شامل ضريبة القيمة المضافة 15%. ادفع عبر مدى أو أبل باي أو قسّطها مع تابّي.`,
          button: 'ادفع بأمان عبر Tap Payments (Mada / Apple Pay)',
        };
      case 'WITH_CONSULTANT':
        return {
          code: 'W08',
          title: 'إحالة الملف للاستشاري الدولي (Consultant Assigned)',
          body: `تم تعيين ${activeCase.consultant.name} في ${activeCase.consultant.center} لدراسة ملفك وإعداد التقرير التخصصي.`,
          button: 'متابعة جدول المواعيد',
        };
      case 'OPINION_READY':
        return {
          code: 'W14',
          title: 'صدور التقرير الطبي الثاني المعتمد (Bilingual Report Ready)',
          body: `صدر الرأي الطبي الثاني لحالة ${activeCase.caseNumber} معتمداً باللغتين العربية والإنجليزية ومختوماً رسمياً من ألو دكتور.`,
          button: 'تحميل التقرير الطبي المعتمد (Download PDF)',
        };
      case 'PARTNER_SERVICES':
        return {
          code: 'W15',
          title: 'تفعيل الخدمات العلاجية المساندة (Partner Dispatch)',
          body: `تم إرسال توصيات الفحوصات المخبرية والتمريض المنزلي المرافقة لخطة الرأي الثاني إلى الشركاء المعتمدين لترتيب المواعيد.`,
          button: 'حجز ومتابعة الخدمات الطبية',
        };
      case 'FOLLOW_UP_21_DAYS':
        return {
          code: 'W18',
          title: 'نافذة المتابعة المباشرة (Follow-up 21 days)',
          body: `نافذة التواصل المباشر مفتوحة لمدة 21 يوماً مع طبيبك المعالج وممرضة ألو دكتور لطرح أي استفسارات توضيحية حول التقرير.`,
          button: 'فتح المحادثة السريرية المباشرة',
        };
      case 'CLOSED':
      default:
        return {
          code: 'W20',
          title: 'إغلاق الحالة وتقييم التجربة (Case Closed & NPS Survey)',
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
