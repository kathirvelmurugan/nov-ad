export interface IndianConsultantItem {
  name: string;
  center: string;
  city: string;
  specialtyAr: string;
  specialtyEn: string;
}

export const INDIAN_CONSULTANTS: IndianConsultantItem[] = [
  {
    name: 'Dr. Pradeep Kumar, MBBS, MS, MCh (CTVS)',
    center: 'Apollo Hospitals',
    city: 'Bengaluru, India',
    specialtyAr: 'جراحة القلب والصدر والشرايين التاجية',
    specialtyEn: 'Cardiothoracic & Vascular Surgery',
  },
  {
    name: 'Dr. Devi Shetty, MS, FRCS',
    center: 'Narayana Health City',
    city: 'Bengaluru, India',
    specialtyAr: 'جراحة القلب المعقدة واستبدال الصمامات',
    specialtyEn: 'Complex Cardiac & Valvular Surgery',
  },
  {
    name: 'Dr. Arjun Mehta, MD, DM',
    center: 'KIMS Heart Institute',
    city: 'Hyderabad, India',
    specialtyAr: 'قسطرة القلب والشرايين التداخلية',
    specialtyEn: 'Interventional Cardiology & Valve Therapy',
  },
  {
    name: 'Dr. Sandeep Vaishya, MS, MCh',
    center: 'Fortis Memorial Research Institute',
    city: 'Gurugram, India',
    specialtyAr: 'جراحة المخ والأعصاب وقاع الجمجمة',
    specialtyEn: 'Neurosurgery & Skull Base Surgery',
  },
];
