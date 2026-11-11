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
];
