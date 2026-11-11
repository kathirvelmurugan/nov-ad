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

/**
 * Clean slate: zero seeded doctors. Doctors are enrolled dynamically via Super Admin or Hospital Admin.
 */
export const INITIAL_MEDICAL_CENTER_DOCTORS: MedicalCenterDoctor[] = [];
