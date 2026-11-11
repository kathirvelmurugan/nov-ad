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
    department: 'Platform Operations',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
];
