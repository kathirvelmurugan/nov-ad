import { ClinicalCase } from '../../types';
import { CockpitRole } from './types';

export const WHATSAPP_CUES: Record<number, { ar: string; en: string }> = {
  1: {
    ar: '💬 واتساب (المريض ➔ التمريض): تم إرسال طلب الرأي الثاني للحالة ALO-2026-LIVE وهو بانتظار فرز التمريض.',
    en: '💬 WhatsApp (Patient ➔ Nurse): Second opinion request submitted for ALO-2026-LIVE awaiting nurse triage.',
  },
  2: {
    ar: '💬 واتساب (التمريض ➔ الطبيب المعالج): اكتمل فرز التمريض مع تدقيق العلامات الحيوية وحجب الهوية بنظام سدايا.',
    en: '💬 WhatsApp (Nurse ➔ Doctor): Triage complete with vitals and SDAIA PII masking. Ready for physician audit.',
  },
  3: {
    ar: '💬 واتساب (الطبيب ➔ المنسق والمريض): اعتمد د. عبدالله الشمري الإحالة وصاغ 3 أسئلة استشارية. رابط الدفع متاح.',
    en: '💬 WhatsApp (Doctor ➔ Coordinator): Referral approved by Dr. Al-Shammari with 3 focus questions. Payment link ready.',
  },
  4: {
    ar: '💬 واتساب (المنسق ➔ المريض): تم سداد الفاتورة الضريبية 250 ر.س عبر مدى. تم توجيه الملف للاستشاري بالهند.',
    en: '💬 WhatsApp (Coordinator ➔ Patient): Tax invoice 250 SAR paid via Mada. Dossier dispatched to Senior Consultant in India.',
  },
  5: {
    ar: '💬 واتساب (الاستشاري ➔ المنسق): اعتمد د. براديب كومار الرأي الثاني بناءً على فحص الأشعة 3D DICOM.',
    en: '💬 WhatsApp (Consultant ➔ Coordinator): Second opinion evaluated and signed based on 3D DICOM loop inspection.',
  },
  6: {
    ar: '💬 واتساب (المنسق ➔ المريض والطبيب): تم إصدار وتسليم التقرير الطبي الدولي المعتمد ثنائي اللغة بنجاح.',
    en: '💬 WhatsApp (Coordinator ➔ Patient & MD): Certified bilingual second opinion report released and delivered.',
  },
};

export interface CockpitSlotItem {
  role: CockpitRole;
  slotNum: number;
  unlockStage: number;
  titleAr: string;
  titleEn: string;
  icon: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  descAr: string;
  descEn: string;
}

export const SLOTS: CockpitSlotItem[] = [
  {
    role: 'Patient',
    slotNum: 1,
    unlockStage: 1,
    titleAr: 'المريض (تطبيق الجوال)',
    titleEn: 'Patient (Mobile App)',
    icon: '📱',
    deviceType: 'mobile',
    descAr: 'متاح للبدء الفوري',
    descEn: 'Active for intake',
  },
  {
    role: 'Alo Nurse',
    slotNum: 2,
    unlockStage: 2,
    titleAr: 'ممرضة ألو (جهاز لوحي)',
    titleEn: 'Alo Nurse (Tablet)',
    icon: '🩺',
    deviceType: 'tablet',
    descAr: 'يُفتح عند إرسال المريض للطلب (P01)',
    descEn: 'Unlocks upon Patient submission (P01)',
  },
  {
    role: 'Saudi treating doctor',
    slotNum: 3,
    unlockStage: 3,
    titleAr: 'الطبيب المعالج (بوابة الويب)',
    titleEn: 'Treating Doctor (Web Portal)',
    icon: '🇸🇦',
    deviceType: 'desktop',
    descAr: 'يُفتح بعد اكتمال فرز التمريض (N04)',
    descEn: 'Unlocks upon Triage completion (N04)',
  },
  {
    role: 'Alo Coordinator',
    slotNum: 4,
    unlockStage: 4,
    titleAr: 'منسق رعاية ألو (محطة العمل)',
    titleEn: 'Alo Coordinator (Console)',
    icon: '📋',
    deviceType: 'desktop',
    descAr: 'يُفتح بعد اعتماد الطبيب للإحالة (D10)',
    descEn: 'Unlocks upon Doctor approval (D10)',
  },
  {
    role: 'Indian consultant',
    slotNum: 5,
    unlockStage: 5,
    titleAr: 'الاستشاري الدولي (تطبيق الجوال)',
    titleEn: 'Senior Consultant (Mobile)',
    icon: '🇮🇳',
    deviceType: 'mobile',
    descAr: 'يُفتح بعد اعتماد المنسق للسداد (C06)',
    descEn: 'Unlocks upon Coordinator dispatch (C06)',
  },
];

export function deriveStageNum(activeCase: ClinicalCase): number {
  const STAGE_NUM_MAP: Record<string, number> = {
    INTAKE_RECEIVED: 1,
    NURSE_CHECK: 2,
    DOCTOR_REVIEW: 3,
    AWAITING_PAYMENT: 4,
    WITH_CONSULTANT: 5,
    OPINION_READY: 6,
    PARTNER_SERVICES: 7,
    FOLLOW_UP_21_DAYS: 8,
    CLOSED: 9,
  };

  const baseStage = STAGE_NUM_MAP[activeCase.currentStage] || 1;
  return (activeCase.paymentVerified && baseStage < 5)
    ? 5
    : (activeCase.stage && activeCase.stage > baseStage ? activeCase.stage : baseStage);
}

export function getCurrentCue(stageNum: number, activeCase: ClinicalCase): { ar: string; en: string } {
  if (stageNum === 1) {
    return {
      ar: '💬 واتساب (المريض ➔ التمريض): تم إرسال طلب الرأي الثاني للحالة ALO-2026-LIVE وهو بانتظار فرز التمريض.',
      en: '💬 WhatsApp (Patient ➔ Nurse): Second opinion request submitted for ALO-2026-LIVE awaiting nurse triage.',
    };
  }
  if (stageNum === 2) {
    return {
      ar: '💬 واتساب (التمريض ➔ الطبيب المعالج): اكتمل فرز التمريض مع تدقيق العلامات الحيوية وحجب الهوية بنظام سدايا.',
      en: '💬 WhatsApp (Nurse ➔ Doctor): Triage complete with vitals and SDAIA PII masking. Ready for physician audit.',
    };
  }
  if (stageNum === 3) {
    return {
      ar: '💬 واتساب (الطبيب ➔ منسق ألو): اعتمد د. عبدالله الشمري الإحالة وصاغ ٣ أسئلة استشارية. بانتظار مراجعة المنسق.',
      en: '💬 WhatsApp (Doctor ➔ Coordinator): Referral approved by Dr. Al-Shammari with 3 focus questions. Pending invoice.',
    };
  }
  if (stageNum === 4) {
    if (!activeCase.invoiceIssued) {
      return {
        ar: '💬 واتساب (منسق ألو ➔ الحالة): يراجع المنسق خطة الإحالة ويصدر فاتورة ZATCA الضريبية (C02-C04)...',
        en: '💬 WhatsApp (Coordinator ➔ Case): Alo Coordinator is issuing ZATCA tax invoice (C02-C04)...',
      };
    }
    if (!activeCase.pricing?.paid) {
      return {
        ar: '💬 واتساب (منسق ألو ➔ المريض): تم إصدار الفاتورة الضريبية INV-2026-001 ورابط السداد بانتظار دفع المريض.',
        en: '💬 WhatsApp (Coordinator ➔ Patient): Tax invoice INV-2026-001 issued. Payment checkout unlocked for patient.',
      };
    }
    return {
      ar: '💬 واتساب (المنسق ➔ المريض): تم استلام سداد مدى بنجاح. المنسق يتحقق ويوجه الملف للاستشاري في الهند (C06).',
      en: '💬 WhatsApp (Coordinator ➔ Patient): Mada payment received. Coordinator verifying transaction to dispatch to India (C06).',
    };
  }
  if (stageNum === 5) {
    if (!activeCase.secondOpinionSubmitted) {
      return {
        ar: '💬 واتساب (منسق ألو ➔ استشاري الهند): تم تسليم الملف الكامل للأشعة 3D والأسئلة الثلاثة لدراسة د. براديب كومار.',
        en: '💬 WhatsApp (Coordinator ➔ India): Full 3D DICOM dossier and focus questions delivered to Dr. Pradeep Kumar.',
      };
    }
    return {
      ar: '💬 واتساب (الاستشاري ➔ المنسق): سلّم د. براديب كومار الرأي الإنجليزي لمنسق ألو لتعريبه ومطابقة المصطلحات الطبية.',
      en: '💬 WhatsApp (Consultant ➔ Coordinator): English opinion delivered to Alo Coordinator for certified Arabic localization.',
    };
  }
  if (!activeCase.coordinatorForwardedToDoctor) {
    return {
      ar: '💬 واتساب (منسق ألو ➔ التعريب): يجري منسق رعاية ألو التعريب والتدقيق المعتمد تمهيداً لإحالته للطبيب المعالج (C08).',
      en: '💬 WhatsApp (Coordinator ➔ Translation): Alo Coordinator localizing bilingual dossier for treating doctor routing (C08).',
    };
  }
  if (!activeCase.doctorReleasedToPatient) {
    return {
      ar: '💬 واتساب (المنسق ➔ الطبيب المعالج): تم تسليم الملف المعرب لد. عبدالله الشمري للمصادقة السريرية قبل إتاحته للمريض.',
      en: '💬 WhatsApp (Coordinator ➔ Saudi Doctor): Localized dossier routed to Dr. Al-Shammari for final clinical sign-off.',
    };
  }
  return {
    ar: '💬 واتساب (د. عبدالله الشمري ➔ المريض): اعتمد الطبيب السعودي المعالج التقرير النهائي ثنائي اللغة وتم تسليمه للمريض.',
    en: '💬 WhatsApp (Saudi Doctor ➔ Patient): Dr. Al-Shammari endorsed the certified bilingual report and released it to the patient.',
  };
}
