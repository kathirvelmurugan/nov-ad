import { Persona } from '../types';

export const PERSONAS: Persona[] = [
  {
    code: 'P',
    name: 'سالم بن عبد العزيز العامري',
    title: 'المريض (Patient)',
    badge: '👤 Patient',
    avatar: '👨‍💼',
    surface: 'patient-mobile',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'N',
    name: 'سارة الدوسري',
    title: 'ممرضة ألو للفرز السريري (ALO nurse: Sara N.)',
    badge: '🩺 ALO nurse',
    avatar: '👩‍⚕️',
    surface: 'portal-web',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'D',
    name: 'د. عبدالله الشمري',
    title: 'الطبيب السعودي المعالج (Saudi treating doctor: Dr. Abdullah)',
    badge: '👨‍⚕️ Saudi treating doctor',
    avatar: '👨‍⚕️',
    surface: 'portal-web',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'C',
    name: 'عبدالرحمن الشهري',
    title: 'منسق رعاية ألو (ALO coordinator: Abdulrahman)',
    badge: '👔 ALO coordinator',
    avatar: '👔',
    surface: 'portal-web',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'K',
    name: 'Dr. Arjun Mehta',
    title: 'الاستشاري الهندي (Indian consultant: Dr. Arjun)',
    badge: '🇮🇳 Indian consultant',
    avatar: '👨‍⚕️',
    surface: 'consultant-mobile',
    isRtl: false,
    lang: 'en'
  }
];
