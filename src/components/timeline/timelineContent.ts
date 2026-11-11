import { ClinicalCase, ClinicalStage } from '../../types';

export interface StageStep {
  stage: ClinicalStage;
  num: number;
  labelAr: string;
  labelEn: string;
}

export const STAGES: StageStep[] = [
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

export interface StageContentData {
  badgeAr: string;
  badgeEn: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  queueStatusAr: string;
  queueStatusEn: string;
  nextRoleCode: string;
  nextRoleLabelAr: string;
  nextRoleLabelEn: string;
  slaAr: string;
  slaEn: string;
}

const METHOD_NAMES: Record<string, { ar: string; en: string }> = {
  mada: { ar: 'مدى', en: 'Mada' },
  applepay: { ar: 'Apple Pay', en: 'Apple Pay' },
  visa: { ar: 'فيزا / ماستركارد', en: 'Visa' },
  tabby: { ar: 'تابي', en: 'Tabby' },
};

export function getStageContent(
  stage: ClinicalStage,
  activeCase: ClinicalCase,
  isAr: boolean,
  isInvoiceIssued: boolean,
  isPaid: boolean,
  isPaymentVerified: boolean,
  isReportReleased: boolean
): StageContentData {
  const assignedMethodsLabelEn = (activeCase.allowedPaymentMethods || []).map((m) => METHOD_NAMES[m]?.en || m).join(' · ');
  const assignedMethodsLabelAr = (activeCase.allowedPaymentMethods || []).map((m) => METHOD_NAMES[m]?.ar || m).join(' · ');

  switch (stage) {
    case 'NURSE_CHECK':
      return {
        badgeAr: 'المرحلة 2 من 9 · قيد فرز التمريض',
        badgeEn: 'Stage 2 of 9 · Under Nurse Triage',
        titleAr: 'طلبك قيد المراجعة والفرز السريري لدى تمريض ألو دكتور',
        titleEn: 'Your dossier is currently undergoing ALO Clinical Nurse Triage',
        descAr: 'يقوم كادر التمريض السريري بتدقيق المؤشرات الحيوية، مطابقة المرفقات المخبرية وفحوصات الأشعة السابقة، وتطبيق نظام حجب الهوية الآلي لحماية خصوصيتك وفق اشتراطات سدايا (SDAIA) قبل العرض على الطبيب.',
        descEn: 'The certified clinical triage nurse is reviewing vital parameters, validating diagnostic imaging files, and applying automated SDAIA-compliant de-identification before routing to the treating physician.',
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
        descAr: `يقوم طبيبك السعودي المعالج (${activeCase.treatingDoctor?.name || 'الطبيب المعالج'} - ${activeCase.treatingDoctor?.hospital || 'المستشفى الشريك'}) بمراجعة ملفك المشفر، تدقيق الأشعة، واختيار الاستشاري الهندي المناسب وتحديد 3 أسئلة تخصصية دقيقة.`,
        descEn: `Your Saudi treating doctor (${activeCase.treatingDoctor?.name || 'Treating Doctor'} at ${activeCase.treatingDoctor?.hospital || 'Partner Hospital'}) is reviewing your de-identified dossier, checking imaging slices, selecting the Indian consultant, and framing 3 focus questions.`,
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
}
