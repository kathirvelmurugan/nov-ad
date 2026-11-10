import React from 'react';
import { ClinicalCase, ClinicalStage } from '../../types';
import { BilingualReportModal } from '../cockpit/BilingualReportModal';
import { 
  ShieldCheck, 
  Clock, 
  Stethoscope, 
  CreditCard, 
  Globe2, 
  Video, 
  FileCheck2, 
  MessageSquare, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  RotateCcw,
  Sparkles,
  UserCheck,
  FileText,
  AlertCircle,
  Activity
} from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  onResetActiveCase?: () => void;
  onSelectRole?: (roleCode: string) => void;
  onBackToLanding?: () => void;
  onOpenTelehealth?: () => void;
  onOpenPayment?: () => void;
  lang?: 'ar' | 'en';
}

interface StageStep {
  stage: ClinicalStage;
  num: number;
  labelAr: string;
  labelEn: string;
}

const STAGES: StageStep[] = [
  { stage: 'INTAKE_RECEIVED', num: 1, labelAr: 'تسجيل الحالة', labelEn: 'Intake' },
  { stage: 'NURSE_CHECK', num: 2, labelAr: 'فرز التمريض', labelEn: 'Nurse Triage' },
  { stage: 'DOCTOR_REVIEW', num: 3, labelAr: 'الطبيب السعودي', labelEn: 'Saudi Doctor' },
  { stage: 'AWAITING_PAYMENT', num: 4, labelAr: 'السداد والفاتورة', labelEn: 'Payment' },
  { stage: 'WITH_CONSULTANT', num: 5, labelAr: 'الاستشاري الدولي', labelEn: 'Consultant' },
  { stage: 'OPINION_READY', num: 6, labelAr: 'الجلسة المرئية', labelEn: 'Telehealth' },
  { stage: 'PARTNER_SERVICES', num: 7, labelAr: 'استلام التقرير', labelEn: 'Report PDF 1' },
  { stage: 'FOLLOW_UP_21_DAYS', num: 8, labelAr: 'المتابعة 21 يوماً', labelEn: 'Follow-up' },
  { stage: 'CLOSED', num: 9, labelAr: 'إغلاق الملف', labelEn: 'Closed' },
];

export const PatientStatusTimelineView: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
  onResetActiveCase,
  onSelectRole,
  onBackToLanding,
  onOpenTelehealth,
  onOpenPayment,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';
  const stage = activeCase.currentStage;
  const currentIndex = STAGES.findIndex((s) => s.stage === stage);
  const isDemoMode = typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('demo') === '1' || window.location.hash === '#cockpit');
  const isCustomCase = activeCase.id.startsWith('TEST-') || activeCase.id.startsWith('REAL-');
  const isInvoiceIssued = !!activeCase.invoiceIssued && Array.isArray(activeCase.allowedPaymentMethods) && activeCase.allowedPaymentMethods.length > 0;
  const isPaid = !!activeCase.pricing?.paid || activeCase.paymentDetails?.status === 'completed';
  const isPaymentVerified = !!activeCase.paymentVerified || !!activeCase.metadata?.paymentVerified;
  const isReportReleased =
    !!activeCase.reportReleased ||
    !!activeCase.metadata?.pdf1Released ||
    !!activeCase.doctorReleasedToPatient;
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);

  const METHOD_NAMES: Record<string, { ar: string; en: string }> = {
    mada: { ar: 'مدى', en: 'Mada' },
    applepay: { ar: 'Apple Pay', en: 'Apple Pay' },
    visa: { ar: 'فيزا / ماستركارد', en: 'Visa' },
    tabby: { ar: 'تابي', en: 'Tabby' },
  };
  const assignedMethodsLabelEn = (activeCase.allowedPaymentMethods || []).map((m) => METHOD_NAMES[m]?.en || m).join(' · ');
  const assignedMethodsLabelAr = (activeCase.allowedPaymentMethods || []).map((m) => METHOD_NAMES[m]?.ar || m).join(' · ');

  // Stage-specific Dynamic Timeline Content
  const getStageContent = () => {
    switch (stage) {
      case 'NURSE_CHECK':
        return {
          badgeAr: 'المرحلة 2 من 9 · قيد فرز التمريض',
          badgeEn: 'Stage 2 of 9 · Under Nurse Triage',
          titleAr: 'طلبك قيد المراجعة والفرز السريري لدى تمريض ألو دكتور',
          titleEn: 'Your dossier is currently undergoing ALO Clinical Nurse Triage',
          descAr: 'تقوم ممرضة الرعاية (سارة) بتدقيق المؤشرات الحيوية، مطابقة المرفقات المخبرية وفحوصات الأشعة السابقة، وتطبيق نظام حجب الهوية الآلي لحماية خصوصيتك وفق اشتراطات سدايا (SDAIA) قبل العرض على الطبيب.',
          descEn: 'Nurse Sara is reviewing vital parameters, validating diagnostic imaging files, and applying automated SDAIA-compliant de-identification before routing to the treating physician.',
          queueStatusAr: 'أنت الآن في صدارة قائمة التدقيق · الوقت المتوقع للاكتمال: أقل من 90 دقيقة',
          queueStatusEn: 'Status: Front of review queue · Estimated completion: < 90 minutes',
          nextRoleCode: 'N',
          nextRoleLabelAr: 'الانتقال إلى شاشة التمريض (N01) لإجراء الفرز وحجب الهوية →',
          nextRoleLabelEn: 'Switch to Nurse View (N01) to complete triage →',
          slaAr: 'SLA التمريض: أقل من 4 ساعات',
          slaEn: 'Nurse Triage SLA: Under 4 hours',
        };
      case 'DOCTOR_REVIEW':
        return {
          badgeAr: 'المرحلة 3 من 9 · لدى الطبيب السعودي المعالج',
          badgeEn: 'Stage 3 of 9 · Saudi Treating Physician Review',
          titleAr: 'اكتمل الفرز التمريضي وحجب الهوية بنجاح ✓ · الملف الآن لدى طبيبك المعالج',
          titleEn: 'Triage complete & PII masked ✓ · Dossier is with your Saudi Treating Doctor',
          descAr: `يقوم طبيبك السعودي المعالج (${isAr ? activeCase.treatingDoctor.name : (activeCase.treatingDoctor.name || 'Treating Doctor, MD')} - ${isAr ? activeCase.treatingDoctor.hospital : (activeCase.treatingDoctor.hospital || 'Partner Hospital')}) بمراجعة ملفك المشفر، تدقيق الأشعة، واختيار الاستشاري الهندي المناسب وتحديد 3 أسئلة تخصصية دقيقة.`,
          descEn: `Your Saudi treating doctor (${activeCase.treatingDoctor.name} at ${activeCase.treatingDoctor.hospital}) is reviewing your de-identified dossier, checking imaging slices, selecting the Indian consultant, and framing 3 focus questions.`,
          queueStatusAr: 'تمت إحالة الحالة بنجاح · يجري إعداد الأسئلة التخصصية',
          queueStatusEn: 'Referral routed successfully · Targeted clinical questions being formulated',
          nextRoleCode: 'D',
          nextRoleLabelAr: 'الانتقال إلى شاشة الطبيب السعودي المعالج (D01) لاعتماد الإحالة →',
          nextRoleLabelEn: 'Switch to Saudi Doctor View (D01) to approve referral →',
          slaAr: 'SLA الطبيب المعالج: 24 ساعة',
          slaEn: 'Treating Doctor SLA: 24 hours',
        };
      case 'AWAITING_PAYMENT':
        if (!isInvoiceIssued) {
          return {
            badgeAr: 'المرحلة 4 من 9 · قيد إعداد منسق رعاية ألو',
            badgeEn: 'Stage 4 of 9 · Pending ALO Coordinator',
            titleAr: 'تمت موافقة الطبيب السعودي — يقوم منسق رعاية ألو بإعداد فاتورتك وطرق الدفع',
            titleEn: 'Your referral is approved — ALO Coordinator is preparing your invoice and payment options.',
            descAr: 'اعتمد طبيبك السعودي الإحالة الطبية بنجاح. يقوم منسق رعاية ألو الآن بمراجعة الطلب وتحديد طرق الدفع المتاحة وإصدار فاتورة ZATCA قبل فتح بوابة الدفع.',
            descEn: 'Your Saudi treating doctor has approved your referral. The ALO Care Coordinator is preparing your ZATCA invoice and selecting your payment options. Payment remains locked until assigned.',
            queueStatusAr: 'بوابة الدفع مقفلة حالياً — بانتظار إسناد منسق رعاية ألو (C01–C04)',
            queueStatusEn: 'Payment locked — awaiting ALO Coordinator invoice & payment method assignment',
            nextRoleCode: 'C',
            nextRoleLabelAr: 'الانتقال إلى منسق رعاية ألو (C01) لتحديد طرق الدفع وإسناد الفاتورة →',
            nextRoleLabelEn: 'Switch to ALO Coordinator (C01) to select payment methods & assign →',
            slaAr: 'الدفع مقفل لحين إسناد المنسق',
            slaEn: 'Payment Locked Until Assigned',
          };
        }
        if (isPaid && !isPaymentVerified) {
          return {
            badgeAr: 'المرحلة 4 من 9 · تم السداد وبانتظار تحقق المنسق',
            badgeEn: 'Stage 4 of 9 · Payment Received — Verification Pending',
            titleAr: 'تم استلام الدفع — يتحقق منسق رعاية ألو من السداد ويرسل ملفك للاستشاري الدولي',
            titleEn: 'Payment received — ALO Coordinator is verifying your payment and sending your file to the international specialist.',
            descAr: 'تم تسجيل دفعتك بنجاح وإصدار الفاتورة الضريبية. يقوم منسق رعاية ألو حالياً بالتحقق من العملية وتجهيل الهوية وفق اشتراطات سدايا قبل توصيل ملفك للاستشاري الدولي.',
            descEn: 'Your payment has been received. The ALO Care Coordinator is verifying the payment confirmation and applying SDAIA de-identification before connecting your case to the Indian specialist.',
            queueStatusAr: 'تم تأكيد السداد · الاستشاري مقفل لحين تحقق منسق رعاية ألو (C05–C06)',
            queueStatusEn: 'Consultant locked until ALO Coordinator verifies payment (C05–C06)',
            nextRoleCode: 'C',
            nextRoleLabelAr: 'الانتقال إلى منسق رعاية ألو (C05–C06) للتحقق من الدفع وتوصيل الاستشاري →',
            nextRoleLabelEn: 'Switch to ALO Coordinator (C05–C06) to verify payment & connect specialist →',
            slaAr: 'تحقق منسق ألو وتجهيل الهوية',
            slaEn: 'Coordinator Verification Pending',
          };
        }
        return {
          badgeAr: 'المرحلة 4 من 9 · الفاتورة الإلكترونية وبوابة السداد',
          badgeEn: 'Stage 4 of 9 · Invoice & Secure Checkout',
          titleAr: 'أصدر منسق ألو الفاتورة! يرجى إتمام السداد للمتابعة',
          titleEn: 'Invoice & Payment Options Ready! Please complete payment to proceed',
          descAr: 'أصدر منسق رعاية ألو الفاتورة الضريبية المعتمدة (ZATCA Phase-2) وحدد طرق الدفع المتاحة لك لإتمام رسوم الاستشارة بأمان.',
          descEn: 'ALO Care Coordinator has issued your certified ZATCA tax invoice and enabled your assigned payment options. Complete checkout to proceed.',
          queueStatusAr: 'بانتظار إتمام الدفع عبر طرق الدفع المعتمدة من المنسق',
          queueStatusEn: 'Awaiting payment via your Coordinator-assigned payment options',
          nextRoleCode: 'P',
          nextRoleLabelAr: 'الانتقال إلى بوابة الدفع وسداد الفاتورة الآن →',
          nextRoleLabelEn: 'Open Payment Checkout & Complete Payment Now →',
          slaAr: `طرق الدفع المتاحة: ${assignedMethodsLabelAr}`,
          slaEn: `Payment Options: ${assignedMethodsLabelEn}`,
        };
      case 'WITH_CONSULTANT':
        return {
          badgeAr: 'المرحلة 5 من 9 · دراسة الاستشاري الدولي',
          badgeEn: 'Stage 5 of 9 · International Specialist Review',
          titleAr: 'تم تأكيد السداد ✓ · الملف قيد دراسة الاستشاري الهندي',
          titleEn: 'Payment Confirmed ✓ · Dossier with Indian Specialist',
          descAr: `يقوم الاستشاري الدولي (${activeCase.consultant.name || 'Dr. Arjun Mehta'} - ${activeCase.consultant.center || 'Fortis Healthcare, India'}) بفحص مقاطع الأشعة DICOM وإعداد الرأي الطبي الثاني المفصل والإجابة عن الأسئلة السريرية.`,
          descEn: `International consultant (${activeCase.consultant.name || 'Dr. Arjun Mehta'} at ${activeCase.consultant.center || 'Fortis Healthcare'}) is inspecting DICOM images and preparing the certified second opinion addressing your doctor's questions.`,
          queueStatusAr: 'الاستشاري يدرس الحالة حالياً · نافذة الـ 48 ساعة قيد التشغيل (متبقي 38 ساعة)',
          queueStatusEn: 'Specialist actively reviewing · 48-Hour SLA active (38 hours remaining)',
          nextRoleCode: 'K',
          nextRoleLabelAr: 'الانتقال إلى شاشة الاستشاري الدولي (K01) لتسجيل الرأي الطبي →',
          nextRoleLabelEn: 'Switch to International Consultant View (K01) →',
          slaAr: 'SLA الاستشاري: 48 ساعة للإنجاز',
          slaEn: 'Consultant SLA: 48-Hour Delivery',
        };
      case 'OPINION_READY':
        return {
          badgeAr: 'المرحلة 6 من 9 · بانتظار اعتماد الطبيب السعودي المعالج',
          badgeEn: 'Stage 6 of 9 · Saudi Doctor Opinion Review',
          titleAr: 'أنهى الاستشاري الدولي رأيه — يراجع طبيبك السعودي التقرير لاعتماده',
          titleEn: 'Indian specialist submitted opinion — awaiting Saudi Doctor endorsement',
          descAr: 'أتم الاستشاري الدولي دراسة الحالة والإجابة على الأسئلة السريرية. يقوم طبيبك السعودي المعالج الآن بمراجعة الرأي واعتماده وإرساله لمنسق رعاية ألو قبل تسليم التقرير النهائي.',
          descEn: 'Your Indian Consultant has completed the second opinion review. Your Saudi Treating Doctor is reviewing and endorsing the opinion before sending it to the ALO Coordinator.',
          queueStatusAr: 'التقرير مقفل حالياً — بانتظار مراجعة واعتماد الطبيب السعودي المعالج (D11–D12)',
          queueStatusEn: 'Report locked — awaiting Saudi Treating Doctor review & endorsement (D11–D12)',
          nextRoleCode: 'D',
          nextRoleLabelAr: 'الانتقال إلى شاشة الطبيب السعودي (D11–D12) لمراجعة واعتماد الرأي →',
          nextRoleLabelEn: 'Switch to Saudi Doctor (D11–D12) to review & approve opinion →',
          slaAr: 'مراجعة الطبيب السعودي المعالج',
          slaEn: 'Saudi Physician Endorsement Pending',
        };
      case 'PARTNER_SERVICES':
        if (!isReportReleased) {
          return {
            badgeAr: 'المرحلة 7 من 9 · قيد إسناد التقرير من منسق ألو',
            badgeEn: 'Stage 7 of 9 · Pending Coordinator Report Assignment',
            titleAr: 'اعتمد الطبيب السعودي الرأي — يقوم منسق ألو بتجهيز وإسناد التقرير لك',
            titleEn: 'Saudi Doctor approved the opinion — ALO Coordinator is assigning your report',
            descAr: 'تمت مصادقة طبيبك السعودي المعالج على رأي الاستشاري الدولي. يقوم منسق رعاية ألو الآن بتوثيق التقرير المعتمد (PDF 1) برمز QR وإتاحته في حسابك.',
            descEn: 'Your Saudi Treating Doctor has endorsed the specialist opinion. The ALO Care Coordinator is finalizing the certified PDF report and assigning it to your account.',
            queueStatusAr: 'التقرير مقفل حالياً — بانتظار إسناد التقرير من منسق رعاية ألو (C08)',
            queueStatusEn: 'Report locked — awaiting ALO Coordinator report assignment (C08)',
            nextRoleCode: 'C',
            nextRoleLabelAr: 'الانتقال إلى منسق ألو (C08) لإسناد وإرسال التقرير للمريض →',
            nextRoleLabelEn: 'Switch to ALO Coordinator (C08) to assign report to Patient →',
            slaAr: 'توثيق التقرير وإتاحته للمريض',
            slaEn: 'Coordinator Report Assignment Pending',
          };
        }
        return {
          badgeAr: 'المرحلة 7 من 9 · تم إسناد وإصدار التقرير الطبي المعتمد (PDF 1)',
          badgeEn: 'Stage 7 of 9 · Certified Report Assigned & Released (PDF 1)',
          titleAr: 'تم إسناد وإتاحة تقرير الرأي الطبي الثاني المعتمد لك! 🎉',
          titleEn: 'Certified Second Opinion Report Assigned & Ready! 🎉',
          descAr: 'قام منسق رعاية ألو بإسناد التقرير الطبي المعتمد (PDF 1) لحسابك بعد مصادقة الطبيب السعودي. يمكنك عرض التقرير وطباعته الآن.',
          descEn: 'The ALO Coordinator has assigned your certified Second Opinion Report (PDF 1) after Saudi Doctor endorsement. View or print your report below.',
          queueStatusAr: 'التقرير متاح الآن للعرض والطباعة، ونافذة المتابعة جاهزة',
          queueStatusEn: 'Report available to view & print; follow-up options ready',
          nextRoleCode: 'P',
          nextRoleLabelAr: 'عرض وطباعة التقرير الطبي المعتمد (PDF 1) →',
          nextRoleLabelEn: 'View & Print Certified Report (PDF 1) →',
          slaAr: 'معتمد من الطبيب السعودي ومنسق ألو',
          slaEn: 'Certified & Assigned to Patient',
        };
      case 'FOLLOW_UP_21_DAYS':
        return {
          badgeAr: 'المرحلة 8 من 9 · نافذة المتابعة السريرية (21 يوماً)',
          badgeEn: 'Stage 8 of 9 · 21-Day Active Clinical Follow-up',
          titleAr: 'قناة المتابعة الطبية المباشرة مع طبيبك المعالج مفتوحة',
          titleEn: 'Direct 21-Day Asynchronous Follow-up Channel Active',
          descAr: 'يمكنك طرح أي استفسارات تخص التقرير، جرعات الأدوية، أو الفحوصات الإضافية وسيقوم طبيبك المعالج بالتنسيق مع الاستشاري بالإجابة عبر منصة ألو دكتور.',
          descEn: 'Ask follow-up questions regarding medications, scan interpretations, or recovery protocols directly through the verified ALO follow-up line.',
          queueStatusAr: 'المتابعة مجانية ومتاحة لمدة 21 يوماً من تاريخ صدور التقرير',
          queueStatusEn: 'Complimentary async follow-up active for 21 days from report issue date',
          nextRoleCode: 'P',
          nextRoleLabelAr: 'فتح شاشة محادثة المتابعة الطبية الآن →',
          nextRoleLabelEn: 'Open Clinical Follow-up Chat →',
          slaAr: 'رد خلال 24 ساعة من الطبيب المعالج',
          slaEn: 'Response SLA: Within 24 hours',
        };
      case 'CLOSED':
      default:
        return {
          badgeAr: 'المرحلة 9 من 9 · تم إغلاق الملف وحفظه بنجاح',
          badgeEn: 'Stage 9 of 9 · Case Archived & Closed',
          titleAr: 'اكتملت استشارة الرأي الطبي الثاني وتمت أرشفة الملف بأمان',
          titleEn: 'Second Opinion Cycle Successfully Completed & Archived',
          descAr: 'تم إصدار الملف الشامل النهائي (PDF 2) وحفظ كافة المداولات والتقارير الطبية وإيصالات ضريبة القيمة المضافة (ZATCA) في سجلك الصحي الرقمي الدائم.',
          descEn: 'Final comprehensive clinical dossier (PDF 2) generated and archived with full cryptographic audit trail and ZATCA tax receipt.',
          queueStatusAr: 'الملف محفوظ ومتاح للرجوع إليه في أي وقت',
          queueStatusEn: 'Dossier securely archived in compliance with Saudi Health Council regulations',
          nextRoleCode: 'C',
          nextRoleLabelAr: 'عرض سجل الأرشفة النهائية للمنسق (C10) →',
          nextRoleLabelEn: 'View Final Coordinator Archive Record (C10) →',
          slaAr: 'أرشفة دائمة مشفرة وفق معايير سدايا',
          slaEn: 'Permanent SDAIA-Compliant Encrypted Archival',
        };
    }
  };

  const content = getStageContent();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Return to Landing Page Breadcrumb */}
      {onBackToLanding && (
        <div className="flex items-center justify-between pb-1">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-xs font-black text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            <span>{isAr ? '← العودة إلى الصفحة الرئيسية واختيار الخدمات' : '← Back to Patient Landing Page'}</span>
          </button>
        </div>
      )}
      
      {/* 1. Header: Patient Journey Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-6 rounded-2xl border border-teal-800/60 shadow-lg text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-teal-500/20 text-teal-200 px-2.5 py-0.5 rounded text-xs font-mono font-bold border border-teal-500/30">
                {activeCase.caseNumber || activeCase.id}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {isAr ? 'بوابة متابعة المريض المباشرة' : 'Live Patient Portal'}
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight">
              {isAr ? activeCase.patientNameAr : (activeCase.patientNameEn || activeCase.patientName)}
            </h2>
            <p className="text-xs text-teal-200/80 mt-1 flex flex-wrap items-center gap-2">
              <span>{isAr ? 'الهوية الوطنية: 10********' : 'National ID: 10********'}</span>
              <span>·</span>
              <span>{isAr ? (activeCase.specialtyAr || activeCase.specialty) : (activeCase.specialtyEn || activeCase.specialty)}</span>
              <span>·</span>
              <span>{activeCase.treatingDoctor.city}</span>
            </p>
          </div>

          {/* Quick Isolated Reset (QA Only) */}
          {isDemoMode && onResetActiveCase && (
            <button
              onClick={onResetActiveCase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 text-xs font-bold transition-all"
              title={isAr ? 'إعادة ضبط مسار هذا المريض فقط' : 'Reset this patient case only'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة ضبط هذه الحالة فقط' : 'Reset This Case'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Visual Stepper: Patient Journey Progress Pipeline */}
      <div className="bg-white dark:bg-alo-darkCard border border-slate-200 dark:border-alo-darkBorder rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {STAGES.map((s, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={s.stage} className="flex items-center shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-alo-mint text-alo-teal border border-teal-300 font-extrabold ring-1 ring-teal-400/40 shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-50 text-slate-400 dark:bg-slate-900/30 dark:text-slate-500'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold bg-white dark:bg-slate-800">
                    {isCompleted ? '✓' : s.num}
                  </span>
                  <span>{isAr ? s.labelAr : s.labelEn}</span>
                </div>
                {idx < STAGES.length - 1 && (
                  <span className="text-slate-300 dark:text-slate-600 mx-1">
                    {isAr ? '←' : '→'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2.5 In-Person Physical Examination Required Alert (Universal for Written & Video) */}
      {activeCase.inPersonExamRequired && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-100/30 dark:from-amber-950/40 dark:to-amber-900/20 border-2 border-amber-400 dark:border-amber-700/80 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                <Stethoscope className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-black text-amber-950 dark:text-amber-200">
                  {isAr ? '🏥 يلزم فحص سريري حضوري بالمجمع الطبي' : '🏥 Medical Center In-Person Exam Required'}
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold mt-0.5">
                  {isAr ? 'قرار الطبيب السعودي المعالج (ينطبق على الاستشارة المكتوبة والمرئية)' : 'Treating Physician Order (Applies to both Written & Video)'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black font-mono bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700">
              {activeCase.internalOrders?.reception?.checkinCode || 'ALO-RC-8812'}
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {isAr
              ? `قرر طبيبك المعالج (${activeCase.treatingDoctor.name} - ${activeCase.treatingDoctor.hospital}) ضرورة الحضور لإجراء الفحص البدني السريري: ${activeCase.inPersonExamReason || 'تقييم العلامات الحيوية والمدى الحركي وموضع الألم'}. تم حجز مقعدك بالاستقبال.`
              : `Your treating physician (${activeCase.treatingDoctor.name} at ${activeCase.treatingDoctor.hospital}) requires a hands-on physical exam: ${activeCase.inPersonExamReason || 'Assessment of vitals, ROM, and palpation'}. Reception slot booked.`}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-amber-200 dark:border-amber-800/60">
            <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
              📅 {isAr ? 'الموعد المحدد:' : 'Slot:'} <span className="font-mono">{activeCase.inPersonAppointmentSlot || (isAr ? 'غداً - 10:30 صباحاً' : 'Tomorrow - 10:30 AM')}</span>
            </div>
            <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800">
              ✓ {isAr ? 'مسار الرأي الدولي مستمر بالتوازي' : 'Parallel to International Review'}
            </span>
          </div>
        </div>
      )}

      {/* 3. Central Stage Tracker Card */}
      <div className="bg-white dark:bg-alo-darkCard border border-slate-200 dark:border-alo-darkBorder rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Stage Status Badge & SLA */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-teal-50 text-alo-teal border border-teal-200 dark:bg-teal-950/50 dark:text-teal-300">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
            {isAr ? content.badgeAr : content.badgeEn}
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            {isAr ? content.slaAr : content.slaEn}
          </span>
        </div>

        {/* Headline & Description */}
        <div className="space-y-3">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            {isAr ? content.titleAr : content.titleEn}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {isAr ? content.descAr : content.descEn}
          </p>
        </div>

        {/* Live Queue / Progress Callout */}
        <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-sky-800 dark:text-sky-300">
              {isAr ? 'حالة التتبع المباشر للطلب:' : 'Live Request Tracking Status:'}
            </div>
            <div className="text-xs text-sky-700 dark:text-sky-400 mt-0.5 font-medium">
              {isAr ? content.queueStatusAr : content.queueStatusEn}
            </div>
          </div>
        </div>

        {/* Released Certified Report Summary (Shown ONLY after Coordinator assigns report) */}
        {isReportReleased && (
          <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-500/60 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                {isAr ? 'ملخص تقرير الرأي الطبي الثاني المعتمد:' : 'Certified Second Opinion Report Summary:'}
              </span>
              <span className="text-[11px] font-bold bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ✓ {isAr ? 'معتمد من الطبيب السعودي ومنسق ألو' : 'Saudi MD Endorsed & Coordinator Released'}
              </span>
            </div>

            {activeCase.consultantOpinion && (
              <div dir="ltr" className="text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800 leading-relaxed text-left">
                <strong className="block text-alo-teal mb-1">
                  {activeCase.consultant?.name || 'International Consultant'} ({activeCase.consultant?.center || 'Specialist Center'}):
                </strong>
                {activeCase.consultantOpinion}
              </div>
            )}

            {activeCase.saudiEndorsement?.localClinicalNotes && (
              <div className="text-xs text-emerald-900 dark:text-emerald-200 bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800">
                <strong>{isAr ? 'توجيهات طبيبك السعودي: ' : 'Saudi Doctor Directives: '}</strong>
                {activeCase.saudiEndorsement.localClinicalNotes}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-alo-teal hover:bg-teal-800 text-white text-xs font-extrabold shadow-sm cursor-pointer"
              >
                📄 {isAr ? 'فتح وطباعة التقرير الطبي الكامل (PDF 1)' : 'Open & Print Full Certified Report (PDF 1)'}
              </button>
              {activeCase.consultationType === 'video' && onOpenTelehealth && (
                <button
                  type="button"
                  onClick={onOpenTelehealth}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-alo-teal border border-teal-300 text-xs font-extrabold cursor-pointer"
                >
                  🎥 {isAr ? 'الدخول لقاعة الاستشارة المرئية' : 'Join Video Telehealth Call'}
                </button>
              )}
              {stage === 'PARTNER_SERVICES' && (
                <button
                  type="button"
                  onClick={onAdvanceStage}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer"
                >
                  💬 {isAr ? 'الانتقال لمتابعة الـ 21 يوماً →' : 'Proceed to 21-Day Follow-up →'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Clinical Next Step Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            {isDemoMode
              ? (isAr ? 'للاختبار والمحاكاة: انتقل لدور الفريق الطبي المختص لمتابعة الدورة:' : 'Demo / Testing Action: Switch to the active clinical role to continue:')
              : (isAr ? 'الإجراء السريري لمتابعة مسار الحالة:' : 'Current Clinical Milestone Action:')
            }
          </div>

          {((stage === 'AWAITING_PAYMENT' && (!isInvoiceIssued || (isPaid && !isPaymentVerified))) ||
            (stage === 'OPINION_READY') ||
            (stage === 'PARTNER_SERVICES' && !isReportReleased)) && !isDemoMode ? (
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-xs font-extrabold">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>
                {stage === 'AWAITING_PAYMENT' && !isInvoiceIssued
                  ? (isAr ? 'بانتظار إعداد الفاتورة وطرق الدفع من منسق رعاية ألو' : 'Awaiting ALO Coordinator payment setup')
                  : stage === 'AWAITING_PAYMENT'
                  ? (isAr ? 'تم السداد — بانتظار تحقق منسق ألو وتوصيل الاستشاري' : 'Paid — awaiting ALO Coordinator verification')
                  : stage === 'OPINION_READY'
                  ? (isAr ? 'بانتظار مراجعة واعتماد الطبيب السعودي المعالج' : 'Awaiting Saudi Treating Doctor endorsement')
                  : (isAr ? 'بانتظار إسناد التقرير المعتمد من منسق رعاية ألو' : 'Awaiting ALO Coordinator report assignment')}
              </span>
            </span>
          ) : (
            <button
              onClick={() => {
                if (stage === 'PARTNER_SERVICES' && isReportReleased) {
                  setIsReportModalOpen(true);
                } else if (stage === 'AWAITING_PAYMENT' && isInvoiceIssued && !isPaid && onOpenPayment) {
                  onOpenPayment();
                } else if (onSelectRole) {
                  onSelectRole(content.nextRoleCode);
                } else {
                  onAdvanceStage();
                }
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-alo-teal to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-extrabold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs active:scale-95"
            >
              <span>{isAr ? content.nextRoleLabelAr : content.nextRoleLabelEn}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Patient Dossier Summary Card (What the patient submitted) */}
      <div className="bg-slate-50 dark:bg-alo-darkCard/50 border border-slate-200 dark:border-alo-darkBorder rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
            <FileText className="w-4 h-4 text-alo-teal" />
            <span>{isAr ? 'ملخص البيانات المسجلة من قبلك في الطلب (Stage 1 Intake):' : 'Summary of Your Submitted Intake Dossier:'}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
            ✓ {isAr ? 'طلب مكتمل' : 'Intake Complete'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="font-bold text-slate-500 block mb-1">
              {isAr ? 'الشكوى السريرية الرئيسية والأعراض:' : 'Chief Clinical Complaint:'}
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {isAr ? (activeCase.diagnosisAr || activeCase.diagnosis) : (activeCase.diagnosisEn || activeCase.diagnosis)}
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="font-bold text-slate-500 block mb-1">
              {isAr ? 'المستشفى الشريك والطبيب المعالج المختار:' : 'Selected Partner Hospital & Doctor:'}
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {activeCase.treatingDoctor.hospital} · {activeCase.treatingDoctor.name} ({activeCase.treatingDoctor.city})
            </span>
          </div>
        </div>
      </div>

      <BilingualReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        activeCase={activeCase}
        lang={lang}
      />
    </div>
  );
};
