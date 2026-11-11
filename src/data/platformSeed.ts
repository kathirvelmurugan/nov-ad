import { TenantHospital, StaffAccountRecord } from '../types';

/**
 * Clean-Slate Production Mode:
 * Zero seeded hospitals or demo cases. All tenant hospitals and clinical staff
 * are dynamically enrolled by the ALO Super Admin through the central governance portal.
 */
export const SEEDED_TENANT_HOSPITALS: TenantHospital[] = [];

export const DEFAULT_PLATFORM_SUPER_ADMIN: StaffAccountRecord = {
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
};

export const SEEDED_STAFF_DIRECTORY: StaffAccountRecord[] = [DEFAULT_PLATFORM_SUPER_ADMIN];
