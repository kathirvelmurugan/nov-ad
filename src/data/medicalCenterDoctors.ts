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
    id: 'doc-01',
    name: 'د. عبدالله الشمري',
    nameEn: 'Dr. Abdullah Al-Shammari',
    specialty: 'أمراض وجراحة القلب',
    specialtyEn: 'Cardiology & Cardiac Surgery',
    hospital: 'مستشفى رعاية الرياض (Riyadh Care)',
    hospitalEn: 'Riyadh Care Hospital',
    city: 'الرياض',
    license: 'SCFHS-2018-9941',
    tier: 2,
    isOnDuty: true,
  },
  {
    id: 'doc-02',
    name: 'د. فيصل الغامدي',
    nameEn: 'Dr. Faisal Al-Ghamdi',
    specialty: 'قسطرة وتداخل جراحي',
    specialtyEn: 'Interventional Cardiology',
    hospital: 'مستشفى الدكتور سليمان فقيه',
    hospitalEn: 'Fakeeh Health Jeddah',
    city: 'جدة',
    license: 'SCFHS-2019-3821',
    tier: 2,
    isOnDuty: true,
  },
  {
    id: 'doc-03',
    name: 'د. عمر الملحم',
    nameEn: 'Dr. Omar Al-Mulhim',
    specialty: 'جراحة العظام والمفاصل',
    specialtyEn: 'Orthopedics & Joint Surgery',
    hospital: 'مستشفى بروكير رعاية',
    hospitalEn: 'Procare Riaya Hospital',
    city: 'الخبر',
    license: 'SCFHS-2017-4819',
    tier: 1,
    isOnDuty: true,
  },
  {
    id: 'doc-04',
    name: 'د. هند الحازمي',
    nameEn: 'Dr. Hind Al-Hazmi',
    specialty: 'أمراض قلب الأطفال',
    specialtyEn: 'Pediatric Cardiology',
    hospital: 'مركز الأمير سلطان لطب وجراحة القلب',
    hospitalEn: 'Prince Sultan Cardiac Center',
    city: 'الطائف',
    license: 'SCFHS-2020-1194',
    tier: 2,
    isOnDuty: true,
  },
  {
    id: 'doc-05',
    name: 'د. خالد الدوسري',
    nameEn: 'Dr. Khalid Al-Dossary',
    specialty: 'جراحة المخ والعمود الفقري',
    specialtyEn: 'Neurosurgery & Spine',
    hospital: 'مستشفى الموسى التخصصي',
    hospitalEn: 'Al-Moosa Specialist Hospital',
    city: 'الأحساء',
    license: 'SCFHS-2016-8832',
    tier: 2,
    isOnDuty: true,
  },
];
