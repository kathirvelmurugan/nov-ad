export interface MedicalCenterDoctor {
  id: string;
  name: string;
  nameEn: string;
  specialty: string;
  specialtyEn: string;
  hospital: string;
  hospitalEn: string;
  city: string;
  license: string;
  tier: 1 | 2;
  isOnDuty: boolean;
}

export const INITIAL_MEDICAL_CENTER_DOCTORS: MedicalCenterDoctor[] = [
  {
    id: 'doc-praveen-01',
    name: 'د. برافين',
    nameEn: 'Dr. Praveen',
    specialty: 'استشاري أمراض وجراحة القلب',
    specialtyEn: 'Cardiology Consultant',
    hospital: 'مستشفى الحمادي - النزهة (الرياض)',
    hospitalEn: 'Al-Hammadi Hospital Al-Nuzha (Riyadh)',
    city: 'الرياض',
    license: 'SCFHS-2024-KSA-8821',
    tier: 1,
    isOnDuty: true,
  },
  {
    id: 'doc-tariq-02',
    name: 'د. طارق العتيبي',
    nameEn: 'Dr. Tariq Al-Otaibi',
    specialty: 'استشاري قسطرة الشرايين التداخلية',
    specialtyEn: 'Interventional Cardiology Consultant',
    hospital: 'مستشفى الحمادي - النزهة (الرياض)',
    hospitalEn: 'Al-Hammadi Hospital Al-Nuzha (Riyadh)',
    city: 'الرياض',
    license: 'SCFHS-2023-KSA-5519',
    tier: 1,
    isOnDuty: true,
  },
  {
    id: 'doc-faisal-03',
    name: 'د. فيصل الشهري',
    nameEn: 'Dr. Faisal Al-Shehri',
    specialty: 'استشاري جراحة القلب والصدر',
    specialtyEn: 'Cardiothoracic Surgery Consultant',
    hospital: 'مستشفى د. سليمان الحبيب - العليا (الرياض)',
    hospitalEn: 'Dr. Sulaiman Al-Habib Hospital - Olaya (Riyadh)',
    city: 'الرياض',
    license: 'SCFHS-2022-KSA-3341',
    tier: 1,
    isOnDuty: true,
  },
  {
    id: 'doc-huda-04',
    name: 'د. هدى المنصور',
    nameEn: 'Dr. Huda Al-Mansoor',
    specialty: 'استشارية طب القلب والتصوير المتقدم',
    specialtyEn: 'Advanced Cardiac Imaging Consultant',
    hospital: 'مستشفى د. سليمان الحبيب - العليا (الرياض)',
    hospitalEn: 'Dr. Sulaiman Al-Habib Hospital - Olaya (Riyadh)',
    city: 'الرياض',
    license: 'SCFHS-2024-KSA-7782',
    tier: 2,
    isOnDuty: true,
  },
  {
    id: 'doc-maha-05',
    name: 'د. مها الزهراني',
    nameEn: 'Dr. Maha Al-Zahrani',
    specialty: 'استشارية فشل وزراعة القلب',
    specialtyEn: 'Heart Failure & Transplant Consultant',
    hospital: 'مستشفى الملك فيصل التخصصي ومركز الأبحاث (الرياض)',
    hospitalEn: 'King Faisal Specialist Hospital & Research Centre (Riyadh)',
    city: 'الرياض',
    license: 'SCFHS-2021-KSA-9912',
    tier: 1,
    isOnDuty: true,
  },
];
