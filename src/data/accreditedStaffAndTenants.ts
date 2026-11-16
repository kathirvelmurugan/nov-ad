import { TenantHospital, StaffAccountRecord, RoleCode } from '../types';

export const DEFAULT_TENANT_HOSPITALS: TenantHospital[] = [
  {
    id: 'hosp-alo-riyadh-01',
    nameEn: 'Riyadh Care Medical Center',
    nameAr: 'مستشفى رعاية الرياض المعتمد',
    city: 'الرياض',
    cityAr: 'الرياض',
    mciLicenseNumber: 'MCI-SA-2024-8891',
    status: 'active',
    hospitalAdminName: 'David Nunez',
    hospitalAdminPhone: '+966504444444',
    doctorCount: 8,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
];

export const DEFAULT_STAFF_DIRECTORY: StaffAccountRecord[] = [];

export const normalizePhoneForComparison = (input: string): string => {
  if (!input) return '';
  const sanitized = input.replace(/[\s\-\(\)\.]/g, '');
  if (sanitized.startsWith('00')) {
    return `+${sanitized.slice(2)}`;
  }
  if (sanitized.startsWith('05') && !sanitized.startsWith('+')) {
    return `+966${sanitized.slice(1)}`;
  }
  if (!sanitized.startsWith('+')) {
    return `+${sanitized}`;
  }
  return sanitized;
};

export const lookupStaffByPhone = (phone: string): StaffAccountRecord | undefined => {
  const normalized = normalizePhoneForComparison(phone);
  return DEFAULT_STAFF_DIRECTORY.find(
    (entry) => normalizePhoneForComparison(entry.phone) === normalized
  );
};
