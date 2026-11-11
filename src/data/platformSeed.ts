import { TenantHospital, StaffAccountRecord } from '../types';

/**
 * Clean-slate initial state:
 * - Zero seeded hospitals (created dynamically by Super Admin).
 * - Single persistent Super Admin anchor account.
 */
export const SEEDED_TENANT_HOSPITALS: TenantHospital[] = [];

export const SEEDED_STAFF_DIRECTORY: StaffAccountRecord[] = [
  // Super Admin (ALO Master) — Single Clean-Slate System Anchor
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
