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

export const INITIAL_MEDICAL_CENTER_DOCTORS: MedicalCenterDoctor[] = [];