import React from 'react';
import { ClinicalCase, ClinicalStage } from '../../types';
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
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';
  const stage = activeCase.currentStage;
  const currentIndex = STAGES.findIndex((s) => s.stage === stage);

  const isCustomCase = activeCase.id.startsWith('TEST-') || activeCase.id.startsWith('REAL-');

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
        return {
          badgeAr: 'المرحلة 4 من 9 · الفاتورة الإلكترونية وبوابة السداد',
          badgeEn: 'Stage 4 of 9 · Invoice & Secure Checkout',
          titleAr: 'اعتمد الطبيب المعالج الإحالة! يرجى سداد رسوم الاستشارة للمتابعة',
          titleEn: 'Referral Approved! Please complete payment to initiate specialist review',
          descAr: 'أصدر منسق رعاية ألو الفاتورة الضريبية المعتمدة (ZATCA Phase-2). يمكنك اختيار باقة الرأي الطبي الثاني المناسبة (الفئة 1 تقرير مكتوب أو الفئة 2 مكالمة مرئية ومكتوب) وإتمام الدفع الآمن عبر مدى أو Apple Pay.',
          descEn: 'ALO Care Coordinator has generated your certified ZATCA tax invoice. Select your preferred tier (Tier 1 written only or Tier 2 video call + written) and pay securely via Mada or Apple Pay.',
          queueStatusAr: 'بانتظار تأكيد الدفع عبر بوابة Tap المعتمدة من ساما',
          queueStatusEn: 'Awaiting payment confirmation via SAMA-compliant Tap Gateway',
          nextRoleCode: 'P',
          nextRoleLabelAr: 'الانتقال إلى بوابة الدفع وسداد الفاتورة الآن →',
          nextRoleLabelEn: 'Open Payment Checkout & Complete Payment Now →',
          slaAr: 'الدفع الآمن: مدى · فيزا · أبل باي · تابي',
          slaEn: 'Payment Options: Mada · Visa · Apple Pay · Tabby',
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
          badgeAr: 'المرحلة 6 من 9 · الاستشارة المرئية ومراجعة التقرير',
          badgeEn: 'Stage 6 of 9 · Telehealth Session & Draft Review',
          titleAr: 'أنجز الاستشاري التقرير الثاني! رابط الجلسة المرئية ومراجعة التقرير',
          titleEn: 'Consultant Opinion Ready! Live Telehealth & Report Review',
          descAr: 'اكتملت صياغة الرأي الطبي الثاني. في حال اختيارك باقة المكالمة المرئية (الفئة 2)، يمكنك الانضمام للاتصال المرئي المشفر بحضور مترجمة التمريض الفورية للتواصل السلس مع الاستشاري.',
          descEn: 'Second opinion formulation complete. If you selected Tier 2 (Video Consultation), join the encrypted telehealth room with your live nurse interpreter.',
          queueStatusAr: 'الجلسة جاهزة للانعقاد مع الترجمة الطبية الفورية',
          queueStatusEn: 'Encrypted WebRTC Session ready with live clinical translation',
          nextRoleCode: 'P',
          nextRoleLabelAr: 'الدخول إلى قاعة الاستشارة المرئية الآن →',
          nextRoleLabelEn: 'Enter Video Telehealth Room Now →',
          slaAr: 'اتصال WebRTC مشفر بالكامل',
          slaEn: 'End-to-End Encrypted WebRTC',
        };
      case 'PARTNER_SERVICES':
        return {
          badgeAr: 'المرحلة 7 من 9 · استلام التقرير الطبي المعتمد (PDF 1)',
          badgeEn: 'Stage 7 of 9 · Certified Report Release (PDF 1)',
          titleAr: 'تم اعتماد وإصدار تقرير الرأي الطبي الثاني المعتمد بالتوازي! 🎉',
          titleEn: 'Certified Second Opinion Report Released Simultaneously! 🎉',
          descAr: 'قام منسق رعاية ألو باعتماد وختم التقرير الطبي الأول (PDF 1) وتوثيقه برمز QR الرقمي. تم تسليم التقرير في نفس اللحظة بالتوازي لكل من طبيبك السعودي المعالج ولك مباشرة.',
          descEn: 'ALO Coordinator has audited and cryptographically sealed your certified Second Opinion Report (PDF 1). It has been released simultaneously in parallel to your Saudi doctor and to you.',
          queueStatusAr: 'التقرير متاح الآن للتحميل، وبدأت نافذة المتابعة الطبية لـ 21 يوماً',
          queueStatusEn: 'Report available for download; 21-Day Clinical Follow-up window activated',
          nextRoleCode: 'C',
          nextRoleLabelAr: 'عرض شاشة منسق الرعاية (C08) للتحقق من التسليم بالتوازي →',
          nextRoleLabelEn: 'Switch to Coordinator View (C08) to audit parallel dispatch →',
          slaAr: 'تسليم متزامن ثنائي الطرفين (طبيب معالج ومريض)',
          slaEn: 'Dual-Parallel Synchronized Dispatch',
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
                {activeCase.id}
              </span>
              {isCustomCase && (
                <span className="bg-amber-500/20 text-amber-200 px-2.5 py-0.5 rounded text-xs font-bold border border-amber-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  {isAr ? 'حالة اختبار حية' : 'Live Test Case'}
                </span>
              )}
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

          {/* Quick Isolated Reset (for this patient only) */}
          {onResetActiveCase && (
            <button
              onClick={onResetActiveCase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 text-xs font-bold transition-all"
              title={isAr ? 'إعادة ضبط مسار هذا المريض فقط' : 'Reset this patient test case only'}
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

        {/* Tester Quick Handoff Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            {isAr ? 'للاختبار والمحاكاة: انتقل لدور الفريق الطبي المختص لمتابعة الدورة:' : 'Demo / Testing Action: Switch to the active clinical role to continue:'}
          </div>

          <button
            onClick={() => {
              if (stage === 'OPINION_READY' && onOpenTelehealth) {
                onOpenTelehealth();
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

    </div>
  );
};
