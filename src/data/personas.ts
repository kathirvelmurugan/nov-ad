import { Persona } from '../types';

export const PERSONAS: Persona[] = [
  {
    code: 'P',
    name: 'سالم العامري',
    title: 'المريض (Patient: Salem A.)',
    badge: '👤 مريض',
    avatar: '👨‍💼',
    surface: 'patient-mobile',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'D',
    name: 'د. عبدالله الشمري',
    title: 'الطبيب السعودي المعالج (Riyadh Care)',
    badge: '🩺 طبيب معالج',
    avatar: '👨‍⚕️',
    surface: 'portal-web',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'N',
    name: 'نورة الدوسري',
    title: 'ممرضة ألو (ALO Triage Nurse)',
    badge: '👩‍⚕️ تمريض فرز',
    avatar: '👩‍⚕️',
    surface: 'portal-web',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'C',
    name: 'سارة القحطاني',
    title: 'منسقة الحالة والترجمة المعتمدة (Coordinator)',
    badge: '📋 منسقة ألو',
    avatar: '👩‍💼',
    surface: 'portal-web',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'K',
    name: 'Dr. Arjun Mehta',
    title: 'Senior Cardiac Consultant (KIMS, Hyderabad)',
    badge: '🌍 Consultant',
    avatar: '👨‍⚕️',
    surface: 'consultant-mobile',
    isRtl: false,
    lang: 'en'
  },
  {
    code: 'L',
    name: 'فهد المطيري',
    title: 'أخصائي المختبر (Lab Tech - Riyadh Care)',
    badge: '🧪 مختبر',
    avatar: '🔬',
    surface: 'partner-portal',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'H',
    name: 'د. خالد الزهراني',
    title: 'صيدلي معتمد (Pharmacist - Partner)',
    badge: '💊 صيدلي',
    avatar: '💊',
    surface: 'partner-portal',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'T',
    name: 'أحمد العنزي',
    title: 'أخصائي علاج طبيعي وتأهيل (Physiotherapist)',
    badge: '🏃 علاج طبيعي',
    avatar: '🏃',
    surface: 'partner-portal',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'V',
    name: 'مريم العتيبي',
    title: 'أخصائية التمريض المنزلي (Home Nursing - Riyadh)',
    badge: '🏡 تمريض منزلي',
    avatar: '🩺',
    surface: 'partner-portal',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'HA',
    name: 'إدارة مستشفى رعاية الرياض',
    title: 'مدير الشريك الطبي (Medical Center Partner Admin)',
    badge: '🏥 إدارة شريك',
    avatar: '🏢',
    surface: 'admin-portal',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'AD',
    name: 'مدير النظام التنفيذي',
    title: 'مدير منصة ألو دكتور (ALO Super Admin)',
    badge: '⚙️ مشرف عام',
    avatar: '⚡',
    surface: 'admin-portal',
    isRtl: true,
    lang: 'ar'
  }
];
