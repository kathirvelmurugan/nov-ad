import { Persona } from '../types';

export const PERSONAS: Persona[] = [
  {
    code: 'P',
    name: 'سالم العتيبي',
    title: 'المريض (Patient: Salem A.)',
    badge: '👤 مريض',
    avatar: '👨‍💼',
    surface: 'patient-mobile',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'F',
    name: 'فاطمة العتيبي',
    title: 'مقدم الطلب / المرافقة (Caregiver Proxy: Fatima A.)',
    badge: '👩‍👧 مرافق مخول',
    avatar: '👩‍💼',
    surface: 'patient-mobile',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'N',
    name: 'سارة الدوسري',
    title: 'ممرضة ألو للفرز السريري (Nurse Triage: Sara N.)',
    badge: '👩‍⚕️ تمريض فرز',
    avatar: '👩‍⚕️',
    surface: 'portal-web',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'D',
    name: 'د. عبدالله الشمري',
    title: 'الطبيب السعودي المعالج (Riyadh Care: Dr. Abdullah)',
    badge: '🩺 طبيب معالج',
    avatar: '👨‍⚕️',
    surface: 'portal-web',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'K',
    name: 'Dr. Arjun Mehta',
    title: 'Senior Cardiac Consultant (KIMS Hyderabad: Dr. Arjun)',
    badge: '🌍 Consultant',
    avatar: '👨‍⚕️',
    surface: 'consultant-mobile',
    isRtl: false,
    lang: 'en'
  },
  {
    code: 'L',
    name: 'مختبرات ألفا الرياض',
    title: 'شريك الفحوصات التشخيصية (Alpha Labs)',
    badge: '🧪 مختبر',
    avatar: '🔬',
    surface: 'partner-portal',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'H',
    name: 'سند للرعاية المنزلية',
    title: 'شريك التمريض المنزلي (Sanad Home Health)',
    badge: '🏡 رعاية منزلية',
    avatar: '🩺',
    surface: 'partner-portal',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'T',
    name: 'الفرسان للسياحة الطبية',
    title: 'شريك السفر والتأشيرة العلاجية (Al-Fursan Medical Travel)',
    badge: '✈️ سفر وتأشيرات',
    avatar: '🛫',
    surface: 'partner-portal',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'V',
    name: 'بوبا / التعاونية للتأمين',
    title: 'الموافقات التأمينية والتغطية (Insurance Approvals)',
    badge: '🛡️ تأمين',
    avatar: '📋',
    surface: 'partner-portal',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'HA',
    name: 'مستشفى رعاية الرياض',
    title: 'إدارة المستشفى الشريك (Hospital Admin: Riyadh Care)',
    badge: '🏥 إدارة مستشفى',
    avatar: '🏢',
    surface: 'admin-portal',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'AD',
    name: 'الإدارة العامة لمنصة ألو',
    title: 'المشرف العام للمنصة (Platform Super Admin: ALO HQ)',
    badge: '⚙️ مشرف عام',
    avatar: '⚡',
    surface: 'admin-portal',
    isRtl: true,
    lang: 'ar'
  }
];
