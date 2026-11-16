import crypto from 'node:crypto';

export const STAGE_ORDER = Object.freeze({
  INTAKE_RECEIVED: 1,
  NURSE_CHECK: 2,
  DOCTOR_REVIEW: 3,
  AWAITING_PAYMENT: 4,
  WITH_CONSULTANT: 5,
  OPINION_READY: 6,
  PARTNER_SERVICES: 7,
  FOLLOW_UP_21_DAYS: 8,
  CLOSED: 9
});

export let memoryTenants = [];
export let memoryUsers = [
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
];
export let memoryCases = [];
export let memoryAudit = [];

export const getTenants = () => [...memoryTenants];

export const setTenants = (tenants) => {
  if (!Array.isArray(tenants)) {
    throw new TypeError('Tenants payload must be an array');
  }
  memoryTenants = tenants.map((tenant) => ({ ...tenant }));
  return getTenants();
};

export const addTenant = (tenant) => {
  if (!tenant || typeof tenant !== 'object') {
    throw new TypeError('Tenant must be a valid object');
  }
  const record = { ...tenant, createdAt: new Date().toISOString() };
  memoryTenants.push(record);
  return { ...record };
};

export const updateTenant = (id, updates) => {
  const index = memoryTenants.findIndex((t) => t.id === id);
  if (index === -1) return null;
  memoryTenants[index] = {
    ...memoryTenants[index],
    ...updates,
    id: memoryTenants[index].id,
    updatedAt: new Date().toISOString()
  };
  return { ...memoryTenants[index] };
};

export const getUsers = () => memoryUsers.map((user) => ({ ...user }));

export const setUsers = (users) => {
  if (!Array.isArray(users)) {
    throw new TypeError('Users payload must be an array');
  }
  memoryUsers = users.map((user) => ({ ...user }));
  return getUsers();
};

export const addUser = (user) => {
  if (!user || typeof user !== 'object') {
    throw new TypeError('User must be a valid object');
  }
  const record = {
    ...user,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  memoryUsers.push(record);
  return { ...record };
};

export const updateUser = (id, updates) => {
  const index = memoryUsers.findIndex((u) => u.id === id);
  if (index === -1) return null;
  const sanitizedUpdates = { ...updates };
  delete sanitizedUpdates.id;
  memoryUsers[index] = {
    ...memoryUsers[index],
    ...sanitizedUpdates,
    updatedAt: new Date().toISOString()
  };
  return { ...memoryUsers[index] };
};

export const getUserById = (id) => {
  const user = memoryUsers.find((u) => u.id === id);
  return user ? { ...user } : null;
};

export const getCases = () => memoryCases.map((c) => ({ ...c }));

export const setCases = (cases) => {
  if (!Array.isArray(cases)) {
    throw new TypeError('Cases payload must be an array');
  }
  memoryCases = cases.map((caseItem) => ({ ...caseItem }));
  return getCases();
};

export const addCase = (caseRecord) => {
  if (!caseRecord || typeof caseRecord !== 'object') {
    throw new TypeError('Case must be a valid object');
  }
  const stageOrder = caseRecord.stage ? STAGE_ORDER[caseRecord.stage] || 0 : 1;
  const record = {
    ...caseRecord,
    stageOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  memoryCases.push(record);
  return { ...record };
};

export const updateCase = (id, updates) => {
  const index = memoryCases.findIndex((c) => c.id === id);
  if (index === -1) return null;
  const sanitizedUpdates = { ...updates };
  delete sanitizedUpdates.id;
  if (sanitizedUpdates.stage && STAGE_ORDER[sanitizedUpdates.stage]) {
    sanitizedUpdates.stageOrder = STAGE_ORDER[sanitizedUpdates.stage];
  }
  memoryCases[index] = {
    ...memoryCases[index],
    ...sanitizedUpdates,
    updatedAt: new Date().toISOString()
  };
  return { ...memoryCases[index] };
};

export const getCaseById = (id) => {
  const caseRecord = memoryCases.find((c) => c.id === id);
  return caseRecord ? { ...caseRecord } : null;
};

export const getAudit = () => memoryAudit.map((entry) => ({ ...entry }));

export const setAudit = (audit) => {
  if (!Array.isArray(audit)) {
    throw new TypeError('Audit payload must be an array');
  }
  memoryAudit = audit.map((entry) => ({ ...entry }));
  return getAudit();
};

export const addAuditEntry = (entry) => {
  if (!entry || typeof entry !== 'object') {
    throw new TypeError('Audit entry must be a valid object');
  }
  const record = {
    ...entry,
    timestamp: new Date().toISOString()
  };
  memoryAudit.push(record);
  return { ...record };
};

export const resetStore = () => {
  memoryTenants = [];
  memoryUsers = [
    {
      id: INITIAL_SUPER_ADMIN_ID,
      name: INITIAL_SUPER_ADMIN_NAME,
      role: INITIAL_SUPER_ADMIN_ROLE,
      pinHash: crypto.createHash('sha256').update(INITIAL_SUPER_ADMIN_PIN).digest('hex'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  memoryCases = [];
  memoryAudit = [];
};

export const resetInMemoryStore = resetStore;

export const updateInMemoryStore = (payload = {}) => {
  if (Array.isArray(payload.tenants)) memoryTenants = payload.tenants;
  if (Array.isArray(payload.users)) memoryUsers = payload.users;
  if (Array.isArray(payload.cases)) memoryCases = payload.cases;
  if (Array.isArray(payload.audit)) memoryAudit = payload.audit;
};

export const getStoreSnapshot = () => ({
  tenantsCount: memoryTenants.length,
  usersCount: memoryUsers.length,
  casesCount: memoryCases.length,
  auditCount: memoryAudit.length,
  stageOrder: { ...STAGE_ORDER }
});