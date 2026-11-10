import React, { useEffect, useState, useRef } from 'react';
import { MessageCircle, ExternalLink, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { ClinicalCase } from '../types';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onOpenDrawer: () => void;
  lang?: 'ar' | 'en';
}

interface ToastPayload {
  code: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
}

export const WhatsAppToast: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
  onOpenDrawer,
  lang = 'ar',
}) => {
  const [visible, setVisible] = useState(false);
  const [currentPayload, setCurrentPayload] = useState<ToastPayload | null>(null);
  const isAr = lang === 'ar';
  const isFirstMount = useRef(true);

  // Map each stage to its official Meta Cloud WhatsApp template
  useEffect(() => {
    // Suppress premature toast on initial page load / screen mount before submission
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    let payload: ToastPayload | null = null;

    switch (activeCase.currentStage) {
      case 'INTAKE_RECEIVED':
        payload = {
          code: 'W01',
          titleAr: 'تأكيد استلام الطلب',
          titleEn: 'Intake Confirmed',
          bodyAr: `تم استلام ملف الحالة ${activeCase.caseNumber} وجارٍ بدء فرز التمريض.`,
          bodyEn: `Case ${activeCase.caseNumber} received. Nurse triage initiated.`,
        };
        break;
      case 'NURSE_CHECK':
        payload = {
          code: 'W04',
          titleAr: 'اكتمال التدقيق وحجب الهوية',
          titleEn: 'Triage & De-Identification Complete',
          bodyAr: `أتمت ممرضة ألو دكتور تدقيق الفحوصات وحجب الهوية بنظام سدايا بنجاح.`,
          bodyEn: `Nurse audit complete; dual-token de-identification applied per SDAIA Art. 29.`,
        };
        break;
      case 'DOCTOR_REVIEW':
        payload = {
          code: 'W05',
          titleAr: 'مراجعة الطبيب السعودي وصياغة الأسئلة',
          titleEn: 'Doctor Review & Referral',
          bodyAr: `اعتمد ${activeCase.treatingDoctor?.name || 'د. عبدالله الشمري'} الإحالة وصاغ الأسئلة السريرية. الفاتورة جاهزة.`,
          bodyEn: `${activeCase.treatingDoctor?.name || 'Dr. Al-Shammari'} reviewed case and formulated clinical focus questions.`,
        };
        break;
      case 'AWAITING_PAYMENT': {
        const isPaidNow = !!activeCase.pricing?.paid || activeCase.paymentDetails?.status === 'completed';
        if (!activeCase.invoiceIssued) {
          payload = {
            code: 'W05',
            titleAr: 'إحالة لمنسق رعاية ألو',
            titleEn: 'Routed to ALO Coordinator',
            bodyAr: `اعتمد الطبيب المعالج الإحالة. يقوم منسق رعاية ألو بإعداد الفاتورة وتحديد طرق الدفع.`,
            bodyEn: `Doctor approved referral. ALO Coordinator is preparing your invoice and payment options.`,
          };
        } else if (!isPaidNow) {
          payload = {
            code: 'W06',
            titleAr: 'فاتورة سداد الرأي الطبي الثاني',
            titleEn: 'Payment Invoice & Options Ready',
            bodyAr: `صدرت فاتورة الباقة (${activeCase.pricing.totalSar} ر.س شامل الضريبة) بطرق الدفع المحددة.`,
            bodyEn: `Invoice issued (${activeCase.pricing.totalSar} SAR incl. VAT) with your assigned payment options.`,
          };
        } else {
          payload = {
            code: 'W07',
            titleAr: 'تم استلام الدفع · بانتظار تحقق المنسق',
            titleEn: 'Payment Received · Verification Pending',
            bodyAr: `تم استلام سدادك بنجاح. يتحقق منسق ألو من العملية قبل إرسال الملف للاستشاري الدولي.`,
            bodyEn: `Payment received. ALO Coordinator is verifying payment before connecting the Indian specialist.`,
          };
        }
        break;
      }
      case 'WITH_CONSULTANT':
        payload = {
          code: 'W08',
          titleAr: 'إحالة الملف للاستشاري الدولي',
          titleEn: 'Consultant Assigned',
          bodyAr: `تم تفعيل الرمز ${activeCase.egressToken || 'ALO-KSA-9482'} وإحالة الملف إلى ${activeCase.consultant.name} في ${activeCase.consultant.center}.`,
          bodyEn: `Dossier token ${activeCase.egressToken || 'ALO-KSA-9482'} dispatched to ${activeCase.consultant.name} at ${activeCase.consultant.center}.`,
        };
        break;
      case 'OPINION_READY':
        payload = {
          code: 'W12',
          titleAr: 'وصول رأي الاستشاري للطبيب السعودي',
          titleEn: 'Opinion Ready for Saudi Doctor Review',
          bodyAr: `أرسل الاستشاري الدولي رأيه الطبي. يراجع ${activeCase.treatingDoctor?.name || 'الطبيب المعالج'} الرأي لاعتماده.`,
          bodyEn: `Indian Consultant submitted opinion. Routed to ${activeCase.treatingDoctor?.name || 'Saudi Treating Doctor'} for review & approval.`,
        };
        break;
      case 'PARTNER_SERVICES':
        if (!activeCase.reportReleased && !activeCase.metadata?.pdf1Released) {
          payload = {
            code: 'W13',
            titleAr: 'اعتماد الطبيب السعودي · قيد إسناد المنسق',
            titleEn: 'Doctor Approved · Pending Coordinator Report',
            bodyAr: `اعتمد الطبيب السعودي الرأي وأحاله لمنسق رعاية ألو لإسناد التقرير المعتمد للمريض.`,
            bodyEn: `Saudi Doctor endorsed the opinion. ALO Coordinator is preparing the final report (PDF 1) for the patient.`,
          };
        } else {
          payload = {
            code: 'W14',
            titleAr: 'تم إسناد وإتاحة التقرير المعتمد (PDF 1)',
            titleEn: 'Certified Report Assigned to Patient',
            bodyAr: `أسند منسق رعاية ألو التقرير الطبي المعتمد لحساب المريض وأصبح جاهزاً للعرض والطباعة.`,
            bodyEn: `ALO Coordinator released certified bilingual report (PDF 1) to the patient portal.`,
          };
        }
        break;
      case 'FOLLOW_UP_21_DAYS':
        payload = {
          code: 'W18',
          titleAr: 'فتح نافذة المتابعة المباشرة (21 يوماً)',
          titleEn: 'Follow-up 21 days',
          bodyAr: `نافذة التواصل السريري المباشر مفتوحة مع الطبيب المعالج وممرضة الفرز.`,
          bodyEn: `Direct clinical chat channel open with treating team for 21 days.`,
        };
        break;
      case 'CLOSED':
      default:
        payload = {
          code: 'W20',
          titleAr: 'إغلاق ملف الاستشارة وتقييم الخدمة',
          titleEn: 'Case Completed & Survey',
          bodyAr: `شكراً لثقتكم في ألو دكتور. نرجو تقييم تجربتك معنا.`,
          bodyEn: `Thank you for trusting ALO DOCTOR. Please rate your experience.`,
        };
        break;
    }

    setCurrentPayload(payload);
    setVisible(true);

    // Auto dismiss after 10 seconds unless clicked
    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [
    activeCase.currentStage,
    activeCase.caseNumber,
    activeCase.invoiceIssued,
    activeCase.pricing?.paid,
    activeCase.paymentVerified,
    activeCase.saudiEndorsement?.status,
    activeCase.reportReleased,
    activeCase.coordinatorForwardedToDoctor,
    activeCase.doctorReleasedToPatient,
  ]);

  if (!visible || !currentPayload) return null;

  return (
    <div
      className={`fixed bottom-20 z-50 transition-all duration-300 animate-in slide-in-from-bottom-5 ${
        isAr ? 'left-5 sm:left-8' : 'right-5 sm:right-8'
      }`}
      style={{ maxWidth: '380px' }}
    >
      <div className="bg-white dark:bg-alo-darkCard border-2 border-emerald-500/80 shadow-2xl rounded-2xl p-4 text-slate-800 dark:text-slate-100 flex flex-col gap-2.5">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-sm shrink-0">
              <MessageCircle className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-emerald-700 dark:text-emerald-400">
                  {isAr ? 'إشعار واتساب فوري' : 'Live WhatsApp Trigger'}
                </span>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] px-1.5 py-0.2 rounded font-bold">
                  {currentPayload.code}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">+966 50 123 4567</p>
            </div>
          </div>

          <button
            onClick={() => setVisible(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Preview */}
        <div>
          <h4 className="text-xs font-black text-alo-navy dark:text-white">
            {isAr ? currentPayload.titleAr : currentPayload.titleEn}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {isAr ? currentPayload.bodyAr : currentPayload.bodyEn}
          </p>
        </div>

        {/* 1-Click Action to Advance Flow */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => {
              onOpenDrawer();
            }}
            className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAr ? 'عرض القالب الكامل' : 'View Template'}</span>
          </button>

          <button
            onClick={() => {
              onAdvanceStage();
              setVisible(false);
            }}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>{isAr ? 'المتابعة للمرحلة التالية' : 'Next Stage'}</span>
            {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
