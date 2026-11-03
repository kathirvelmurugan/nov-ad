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
    title: 'ممرضة ألو للفرز السريري (ALO Nurse: Sara N.)',
    badge: '🩺 ALO Nurse',
    avatar: '👩‍⚕️',
    surface: 'portal-web',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'D',
    name: 'د. عبدالله الشمري',
    title: 'الطبيب السعودي المعالج (Saudi Treating Doctor: Dr. Abdullah)',
    badge: '👨‍⚕️ Saudi Doctor',
    avatar: '👨‍⚕️',
    surface: 'portal-web',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'C',
    name: 'عبدالرحمن الشهري',
    title: 'منسق رعاية ألو (ALO Care Coordinator: Abdulrahman)',
    badge: '👔 ALO Coordinator',
    avatar: '👔',
    surface: 'portal-web',
    isRtl: true,
    lang: 'ar'
  },
  {
    code: 'K',
    name: 'Dr. Arjun Mehta',
    title: 'الاستشاري الهندي (Indian Consultant: Dr. Arjun)',
    badge: '🇮🇳 Indian Consultant',
    avatar: '👨‍⚕️',
    surface: 'consultant-mobile',
    isRtl: false,
    lang: 'en'
  }
];
