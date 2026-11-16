import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface MemoryUser {
  id: string;
  name: string;
  role: string;
  phone: string;
  altPhone?: string;
  pin: string;
  hospitalId?: string;
}

export interface MemoryTenant {
  id: string;
  name: string;
  region: string;
}

export interface CaseMilestone {
  id: string;
  status: string;
  timestamp: string;
  note?: string;
}

export interface MedicalCase {
  id: string;
  patientName: string;
  tenantId: string;
  assignedStaffId: string;
  status: string;
  milestones: CaseMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface ResponseEnvelope<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  timestamp: string;
}

const getSaudiASTTimestamp = (): string => {
  return new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' });
};

const generateId = (): string => {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const initialMemoryUsers: MemoryUser[] = [
  { id: 'staff-ad-01', name: 'Adrian Lewis', role: 'AD', phone: '+966500000001', pin: '1234' },
  { id: 'staff-ha-01', name: 'David Nunez', role: 'HA', phone: '+966504444444', pin: '1234', hospitalId: 'hosp-alo-riyadh-01' },
  { id: 'staff-c-01', name: 'Emmanuel Arcon Gonzalez', role: 'C', phone: '+966500000003', pin: '1234' },
  { id: 'staff-n-01', name: 'Sara Al-Qahtani', role: 'N', phone: '+966500000004', pin: '1234' },
  { id: 'staff-d-01', name: 'Dr. Fahad Al-Harbi', role: 'D', phone: '+966502222222', pin: '1234', hospitalId: 'hosp-alo-riyadh-01' },
  { id: 'staff-k-01', name: 'Dr. V. Prasanth', role: 'K', phone: '+919876543210', altPhone: '+966500000006', pin: '1234' },
  { id: 'staff-l-01', name: 'Omar Al-Zahrani', role: 'L', phone: '+966500000007', pin: '1234' },
  { id: 'staff-ph-01', name: 'Noura Al-Dosari', role: 'PH', phone: '+966500000008', pin: '1234' },
  { id: 'staff-rec-01', name: 'Marcus Vance', role: 'REC', phone: '+966500000009', pin: '1234' }
];

const initialMemoryTenants: MemoryTenant[] = [
  { id: 'hosp-alo-riyadh-01', name: 'Riyadh Care Medical Center', region: 'Riyadh' }
];

interface StoreContextType {
  users: MemoryUser[];
  tenants: MemoryTenant[];
  cases: MedicalCase[];
  findUserByPhone: (phone: string) => ResponseEnvelope<MemoryUser>;
  findUserById: (id: string) => ResponseEnvelope<MemoryUser>;
  getTenantById: (id: string) => ResponseEnvelope<MemoryTenant>;
  lookupCasesByStaff: (staffId: string) => ResponseEnvelope<MedicalCase[]>;
  lookupCasesByTenant: (tenantId: string) => ResponseEnvelope<MedicalCase[]>;
  mutateCaseStatus: (caseId: string, newStatus: string) => ResponseEnvelope<MedicalCase>;
  appendMilestone: (caseId: string, status: string, note?: string) => ResponseEnvelope<MedicalCase>;
  createCase: (c: Omit<MedicalCase, 'id' | 'milestones' | 'createdAt' | 'updatedAt'>) => ResponseEnvelope<MedicalCase>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const useAloStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useAloStore must be used within an AloStoreProvider');
  }
  return context;
};

const wrapResponse = <T,>(success: boolean, data: T | null, error: string | null): ResponseEnvelope<T> => ({
  success,
  data,
  error,
  timestamp: getSaudiASTTimestamp()
});

export const AloStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<MemoryUser[]>(initialMemoryUsers);
  const [tenants] = useState<MemoryTenant[]>(initialMemoryTenants);
  const [cases, setCases] = useState<MedicalCase[]>([]);

  const findUserByPhone = useCallback((phone: string): ResponseEnvelope<MemoryUser> => {
    const user = users.find(u => u.phone === phone || u.altPhone === phone);
    if (!user) return wrapResponse(false, null, 'User not found by phone');
    return wrapResponse(true, user, null);
  }, [users]);

  const findUserById = useCallback((id: string): ResponseEnvelope<MemoryUser> => {
    const user = users.find(u => u.id === id);
    if (!user) return wrapResponse(false, null, 'User not found by ID');
    return wrapResponse(true, user, null);
  }, [users]);

  const getTenantById = useCallback((id: string): ResponseEnvelope<MemoryTenant> => {
    const tenant = tenants.find(t => t.id === id);
    if (!tenant) return wrapResponse(false, null, 'Tenant not found');
    return wrapResponse(true, tenant, null);
  }, [tenants]);

  const lookupCasesByStaff = useCallback((staffId: string): ResponseEnvelope<MedicalCase[]> => {
    const filtered = cases.filter(c => c.assignedStaffId === staffId);
    return wrapResponse(true, filtered, null);
  }, [cases]);

  const lookupCasesByTenant = useCallback((tenantId: string): ResponseEnvelope<MedicalCase[]> => {
    const filtered = cases.filter(c => c.tenantId === tenantId);
    return wrapResponse(true, filtered, null);
  }, [cases]);

  const mutateCaseStatus = useCallback((caseId: string, newStatus: string): ResponseEnvelope<MedicalCase> => {
    let updatedCase: MedicalCase | null = null;
    const now = getSaudiASTTimestamp();
    
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        updatedCase = { ...c, status: newStatus, updatedAt: now };
        return updatedCase;
      }
      return c;
    }));

    if (!updatedCase) return wrapResponse(false, null, 'Case not found for status mutation');
    return wrapResponse(true, updatedCase, null);
  }, []);

  const appendMilestone = useCallback((caseId: string, status: string, note?: string): ResponseEnvelope<MedicalCase> => {
    let updatedCase: MedicalCase | null = null;
    const now = getSaudiASTTimestamp();
    const milestone: CaseMilestone = {
      id: generateId(),
      status,
      timestamp: now,
      note
    };

    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        updatedCase = {
          ...c,
          status,
          milestones: [...c.milestones, milestone],
          updatedAt: now
        };
        return updatedCase;
      }
      return c;
    }));

    if (!updatedCase) return wrapResponse(false, null, 'Case not found for milestone append');
    return wrapResponse(true, updatedCase, null);
  }, []);

  const createCase = useCallback((c: Omit<MedicalCase, 'id' | 'milestones' | 'createdAt' | 'updatedAt'>): ResponseEnvelope<MedicalCase> => {
    const now = getSaudiASTTimestamp();
    const newCase: MedicalCase = {
      ...c,
      id: generateId(),
      milestones: [{ id: generateId(), status: c.status, timestamp: now, note: 'Case initialized' }],
      createdAt: now,
      updatedAt: now
    };
    setCases(prev => [...prev, newCase]);
    return wrapResponse(true, newCase, null);
  }, []);

  const value = useMemo(() => ({
    users,
    tenants,
    cases,
    findUserByPhone,
    findUserById,
    getTenantById,
    lookupCasesByStaff,
    lookupCasesByTenant,
    mutateCaseStatus,
    appendMilestone,
    createCase
  }), [
    users, tenants, cases, findUserByPhone, findUserById, getTenantById,
    lookupCasesByStaff, lookupCasesByTenant, mutateCaseStatus, appendMilestone, createCase
  ]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export const PersonaSwitcher: React.FC = () => {
  const { users, findUserById } = useAloStore();
  const [activePersona, setActivePersona] = useState<string>('staff-ad-01');
  const [dir, setDir] = useState<'rtl' | 'ltr'>('rtl');

  const handleSwitch = (userId: string) => {
    const response = findUserById(userId);
    if (response.success && response.data) {
      setActivePersona(userId);
    }
  };

  const toggleDirection = () => {
    setDir(prev => prev === 'rtl' ? 'ltr' : 'rtl');
  };

  return (
    <div 
      dir={dir} 
      style={{
        fontFamily: 'Cairo, sans-serif',
        backgroundColor: '#E6FAF7',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #00C6AE',
        maxWidth: '800px',
        margin: '20px auto',
        direction: dir
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#007B6E', margin: 0, fontSize: '20px', fontWeight: 700 }}>
          {dir === 'rtl' ? 'مبدل ملفات التعريف' : 'Persona Profile Switcher'}
        </h2>
        <button
          onClick={toggleDirection}
          style={{
            backgroundColor: '#007B6E',
            color: '#FFFFFF',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Cairo, sans-serif',
            fontWeight: 600
          }}
          aria-label="Toggle Language Direction"
        >
          {dir === 'rtl' ? 'English LTR' : 'عربي RTL'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
        {users.map(user => (
          <button
            key={user.id}
            onClick={() => handleSwitch(user.id)}
            aria-pressed={activePersona === user.id}
            style={{
              backgroundColor: activePersona === user.id ? '#007B6E' : '#FFFFFF',
              color: activePersona === user.id ? '#FFFFFF' : '#007B6E',
              border: `2px solid ${activePersona === user.id ? '#007B6E' : '#00C6AE'}`,
              padding: '16px',
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: dir === 'rtl' ? 'right' : 'left',
              fontFamily: 'Cairo, sans-serif',
              transition: 'all 0.2s ease-in-out',
              boxShadow: activePersona === user.id ? '0 4px 12px rgba(0, 123, 110, 0.2)' : 'none'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{user.name}</div>
            <div style={{ fontSize: '12px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                backgroundColor: activePersona === user.id ? 'rgba(255,255,255,0.2)' : '#E6FAF7',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 800
              }}>
                {user.role}
              </span>
              <span>{user.phone}</span>
            </div>
            {user.hospitalId && (
              <div style={{ fontSize: '10px', marginTop: '6px', opacity: 0.7 }}>
                {dir === 'rtl' ? 'المستشفى:' : 'Hospital:'} {user.hospitalId}
              </div>
            )}
          </button>
        ))}
      </div>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        borderLeft: dir === 'ltr' ? '4px solid #25D366' : 'none',
        borderRight: dir === 'rtl' ? '4px solid #25D366' : 'none',
      }}>
        <p style={{ margin: 0, color: '#007B6E', fontSize: '14px', fontWeight: 600 }}>
          {dir === 'rtl' ? 'الملف النشط: ' : 'Active Profile: '} 
          <span style={{ color: '#25D366' }}>{findUserById(activePersona).data?.name}</span>
        </p>
      </div>
    </div>
  );
};

export default AloStoreProvider;