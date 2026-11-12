import { TenantHospital, StaffAccountRecord } from '../types';

export const DEFAULT_TENANT_HOSPITALS: TenantHospital[] = [];

export const DEFAULT_STAFF_DIRECTORY: StaffAccountRecord[] = [
  {
    id: 'staff-10001',
    staffCode: '10001',
    fullName: 'Adrian Lewis',
    fullNameAr: 'أدريان لويس (المشرف العام)',
    roleCode: 'AD',
    phone: '+966500000001',
    pin: '1234',
    hasCustomPin: true,
    department: 'Platform Governance & Super Admin',
    status: 'active',
    createdAt: '2026-01-01T08:00:00.000Z',
  },
];