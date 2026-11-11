import { TenantHospital, StaffAccountRecord } from '../types';

/**
 * Clean Slate: Zero seeded tenant hospitals.
 * All hospitals are registered dynamically via the Super Admin portal.
 */
export const SEEDED_TENANT_HOSPITALS: TenantHospital[] = [];

/**
 * Clean Slate: Only the Platform Super Admin account is pre-seeded.
 * All Hospital Admins, ALO Nurses, ALO Coordinators, Saudi Treating Doctors,
 * and Indian Consultants are enrolled dynamically through the governance portals.
 */
export const SEEDED_STAFF_DIRECTORY: StaffAccountRecord[] = [
  // Super Admin (ALO Master)
  {
    id: 'staff-ad-01',
    staffCode: '00001',
    fullName: 'Adrian Lewis',
    fullNameAr: 'المشرف العام أدريان لويس',
    roleCode: 'AD',
    phone: '+966500000001',
    pin: '1234',
    hasCustomPin: true,
    department: 'Platform Operations',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  // ALO Triage Nurse (N)
  {
    id: 'staff-n-01',
    staffCode: '00301',
    fullName: 'Sara Al-Dossary, RN',
    fullNameAr: 'سارة الدوسري (تمريض ألو)',
    roleCode: 'N',
    phone: '+966503333333',
    pin: '1234',
    hasCustomPin: false,
    department: 'Clinical Triage',
    status: 'active',
    createdAt: '2026-01-05T08:00:00Z',
  },
  // ALO Care Coordinator (C)
  {
    id: 'staff-c-01',
    staffCode: '00501',
    fullName: 'Abdulrahman Al-Shehri',
    fullNameAr: 'عبدالرحمن الشهري',
    roleCode: 'C',
    phone: '+966505555555',
    pin: '1234',
    hasCustomPin: false,
    department: 'Care Coordination',
    status: 'active',
    createdAt: '2026-01-05T08:00:00Z',
  },
  // Saudi Treating Doctor (D)
  {
    id: 'staff-d-01',
    staffCode: '10201',
    fullName: 'Dr. Abdullah Al-Shammari',
    fullNameAr: 'د. عبدالله الشمري',
    roleCode: 'D',
    phone: '+966502222222',
    pin: '1234',
    hasCustomPin: false,
    scfhsLicense: 'SCFHS-2018-9941',
    department: 'Cardiology',
    status: 'active',
    createdAt: '2026-01-15T08:00:00Z',
  },
  // Hospital Admin (HA)
  {
    id: 'staff-ha-01',
    staffCode: '10001',
    fullName: 'Dr. Fahad Al-Otaibi',
    fullNameAr: 'د. فهد العتيبي',
    roleCode: 'HA',
    phone: '+966504444444',
    pin: '1234',
    hasCustomPin: false,
    department: 'Hospital Administration',
    status: 'active',
    createdAt: '2026-01-15T08:00:00Z',
  },
];
