import { useMemo } from 'react';

export type PersonaRole =
  | 'AD'
  | 'HA'
  | 'C'
  | 'N'
  | 'D'
  | 'K'
  | 'L'
  | 'PH'
  | 'REC';

export interface StaffDirectoryEntry {
  readonly id: string;
  readonly displayNameEn: string;
  readonly displayNameAr: string;
  readonly role: PersonaRole;
  readonly phone: string;
  readonly pin: string;
  readonly hospitalId?: string;
  readonly isActive: boolean;
}

export interface TenantHospital {
  readonly id: string;
  readonly nameEn: string;
  readonly nameAr: string;
  readonly mciLicense: string;
  readonly region: string;
}

export const DEFAULT_TENANT_HOSPITALS: ReadonlyArray<TenantHospital> = [
  {
    id: 'hosp-alo-riyadh-01',
    nameEn: 'Riyadh Care Medical Center',
    nameAr: 'مركز رعاية الرياض الطبي',
    mciLicense: 'MCI-SA-2024-8891',
    region: 'Riyadh',
  },
] as const;

export const DEFAULT_STAFF_DIRECTORY: ReadonlyArray<StaffDirectoryEntry> = [
  {
    id: 'staff-10001',
    displayNameEn: 'Adrian Lewis',
    displayNameAr: 'أدريان لويس',
    role: 'AD',
    phone: '+966500000001',
    pin: '1234',
    isActive: true,
  },
  {
    id: 'staff-10002',
    displayNameEn: 'David Nunez',
    displayNameAr: 'ديفيد نونيز',
    role: 'HA',
    phone: '+966504444444',
    pin: '1234',
    hospitalId: 'hosp-alo-riyadh-01',
    isActive: true,
  },
  {
    id: 'staff-10003',
    displayNameEn: 'Emmanuel Arcon Gonzalez',
    displayNameAr: 'إيمانويل أركون غونزاليس',
    role: 'C',
    phone: '+966500000003',
    pin: '1234',
    isActive: true,
  },
  {
    id: 'staff-10004',
    displayNameEn: 'Sara Al-Qahtani',
    displayNameAr: 'سارة القحطاني',
    role: 'N',
    phone: '+966500000004',
    pin: '1234',
    isActive: true,
  },
  {
    id: 'staff-10005',
    displayNameEn: 'Dr. Fahad Al-Harbi',
    displayNameAr: 'د. فهد الحربي',
    role: 'D',
    phone: '+966502222222',
    pin: '1234',
    hospitalId: 'hosp-alo-riyadh-01',
    isActive: true,
  },
  {
    id: 'staff-10006',
    displayNameEn: 'Dr. V. Prasanth',
    displayNameAr: 'د. في. براسانث',
    role: 'K',
    phone: '+919876543210',
    pin: '1234',
    isActive: true,
  },
  {
    id: 'staff-10007',
    displayNameEn: 'Omar Al-Zahrani',
    displayNameAr: 'عمر الزهراني',
    role: 'L',
    phone: '+966500000007',
    pin: '1234',
    isActive: true,
  },
  {
    id: 'staff-10008',
    displayNameEn: 'Noura Al-Dosari',
    displayNameAr: 'نورة الدوسري',
    role: 'PH',
    phone: '+966500000008',
    pin: '1234',
    isActive: true,
  },
  {
    id: 'staff-10009',
    displayNameEn: 'Marcus Vance',
    displayNameAr: 'ماركوس فانس',
    role: 'REC',
    phone: '+966500000009',
    pin: '1234',
    isActive: true,
  },
] as const;

const normalizePhoneForComparison = (input: string): string => {
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

export const lookupStaffByPhone = (phone: string): StaffDirectoryEntry | undefined => {
  const normalizedInput = normalizePhoneForComparison(phone);
  return DEFAULT_STAFF_DIRECTORY.find(
    (entry) => normalizePhoneForComparison(entry.phone) === normalizedInput
  );
};

export const getTenantHospitalById = (hospitalId: string): TenantHospital | undefined => {
  return DEFAULT_TENANT_HOSPITALS.find((hospital) => hospital.id === hospitalId);
};

export const getActiveStaffByRole = (role: PersonaRole): ReadonlyArray<StaffDirectoryEntry> => {
  return DEFAULT_STAFF_DIRECTORY.filter((entry) => entry.role === role && entry.isActive);
};

export interface PersonaProfileSwitcherProps {
  readonly currentStaffId: string | null;
  readonly onPersonaSelect: (staffEntry: StaffDirectoryEntry) => void;
  readonly direction: 'rtl' | 'ltr';
}

export const PersonaProfileSwitcher: React.FC<PersonaProfileSwitcherProps> = ({
  currentStaffId,
  onPersonaSelect,
  direction,
}) => {
  const isRtl = direction === 'rtl';

  const containerStyle: React.CSSProperties = useMemo(
    () => ({
      display: 'flex',
      flexDirection: isRtl ? 'row-reverse' : 'row',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '16px',
      backgroundColor: '#E6FAF7',
      borderRadius: '12px',
      fontFamily: isRtl ? 'Cairo, sans-serif' : 'system-ui, -apple-system, sans-serif',
      direction: isRtl ? 'rtl' : 'ltr',
    }),
    [isRtl]
  );

  const buttonBaseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '48px',
    minHeight: '48px',
    padding: '8px 16px',
    borderRadius: '24px',
    border: '2px solid transparent',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '14px',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
  };

  return (
    <nav aria-label={isRtl ? 'مبدل ملفات التعريف' : 'Persona Profile Switcher'} style={containerStyle}>
      {DEFAULT_STAFF_DIRECTORY.filter((s) => s.isActive).map((staff) => {
        const isSelected = staff.id === currentStaffId;
        const buttonStyle: React.CSSProperties = {
          ...buttonBaseStyle,
          backgroundColor: isSelected ? '#007B6E' : '#FFFFFF',
          color: isSelected ? '#FFFFFF' : '#007B6E',
          borderColor: isSelected ? '#007B6E' : '#00C6AE',
          boxShadow: isSelected ? '0 4px 12px rgba(0, 123, 110, 0.25)' : 'none',
        };

        const displayName = isRtl ? staff.displayNameAr : staff.displayNameEn;

        return (
          <button
            key={staff.id}
            type="button"
            style={buttonStyle}
            onClick={() => onPersonaSelect(staff)}
            aria-pressed={isSelected}
            aria-label={`${isRtl ? 'تحديد الملف الشخصي' : 'Select profile'}: ${displayName}`}
            title={`${displayName} (${staff.role})`}
          >
            <span aria-hidden="true" style={{ marginInlineEnd: '8px' }}>
              {staff.role}
            </span>
            <span>{displayName}</span>
          </button>
        );
      })}
    </nav>
  );
};