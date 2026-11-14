import crypto from 'node:crypto';

export const STAGE_ORDER = Object.freeze({
  INTAKE_RECEIVED: 1,
  NURSE_CHECK: 2,
  DOCTOR_REVIEW: 3,
  LAB_REQUESTED: 4,
  LAB_RESULTS: 5,
  IMAGING_REQUESTED: 6,
  IMAGING_RESULTS: 7,
  TREATMENT_PLAN: 8,
  CLOSED: 9
});

const generateId = () => crypto.randomUUID();

const createInitialSuperAdmin = () => ({
  id: generateId(),
  fullName: 'Adrian Lewis',
  staffId: 'staff-ad-01',
  role: 'AD',
  pinHash: '1234',
  tenantId: 'default',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

let memoryTenants = [];
let memoryUsers = [createInitialSuperAdmin()];
let memoryCases = [];
let memoryAudit = [];

export const getTenants = () => [...memoryTenants];

export const setTenants = (tenants) => {
  if (!Array.isArray(tenants)) {
    throw new TypeError('Tenants payload must be an array');
  }
  memoryTenants = tenants.map((tenant) => ({ ...tenant }));
  return getTenants();
};

export const addTenant = (tenant) => {
  const record = {
    id: tenant.id || generateId(),
    ...tenant,
    createdAt: tenant.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  memoryTenants.push(record);
  return { ...record };
};

export const updateTenant = (id, updates) => {
  const index = memoryTenants.findIndex((t) => t.id === id);
  if (index === -1) return null;
  memoryTenants[index] = {
    ...memoryTenants[index],
    ...updates,
    id,
    updatedAt: new Date().toISOString()
  };
  return { ...memoryTenants[index] };
};

export const removeTenant = (id) => {
  const index = memoryTenants.findIndex((t) => t.id === id);
  if (index === -1) return false;
  memoryTenants.splice(index, 1);
  return true;
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
  const record = {
    id: user.id || generateId(),
    ...user,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  memoryUsers.push(record);
  return { ...record };
};

export const updateUser = (id, updates) => {
  const index = memoryUsers.findIndex((u) => u.id === id);
  if (index === -1) return null;
  memoryUsers[index] = {
    ...memoryUsers[index],
    ...updates,
    id,
    updatedAt: new Date().toISOString()
  };
  return { ...memoryUsers[index] };
};

export const removeUser = (id) => {
  const index = memoryUsers.findIndex((u) => u.id === id);
  if (index === -1) return false;
  memoryUsers.splice(index, 1);
  return true;
};

export const findUserByStaffId = (staffId) => {
  const user = memoryUsers.find((u) => u.staffId === staffId);
  return user ? { ...user } : null;
};

export const getCases = () => memoryCases.map((c) => ({ ...c }));

export const setCases = (cases) => {
  if (!Array.isArray(cases)) {
    throw new TypeError('Cases payload must be an array');
  }
  memoryCases = cases.map((c) => ({ ...c }));
  return getCases();
};

export const addCase = (caseRecord) => {
  const record = {
    id: caseRecord.id || generateId(),
    stageOrder: caseRecord.stageOrder || STAGE_ORDER.INTAKE_RECEIVED,
    ...caseRecord,
    createdAt: caseRecord.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  memoryCases.push(record);
  return { ...record };
};

export const updateCase = (id, updates) => {
  const index = memoryCases.findIndex((c) => c.id === id);
  if (index === -1) return null;
  memoryCases[index] = {
    ...memoryCases[index],
    ...updates,
    id,
    updatedAt: new Date().toISOString()
  };
  return { ...memoryCases[index] };
};

export const removeCase = (id) => {
  const index = memoryCases.findIndex((c) => c.id === id);
  if (index === -1) return false;
  memoryCases.splice(index, 1);
  return true;
};

export const advanceCaseStage = (id) => {
  const index = memoryCases.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const currentStage = memoryCases[index].stageOrder || 1;
  const maxStage = Math.max(...Object.values(STAGE_ORDER));
  const nextStage = Math.min(currentStage + 1, maxStage);

  memoryCases[index] = {
    ...memoryCases[index],
    stageOrder: nextStage,
    updatedAt: new Date().toISOString()
  };
  return { ...memoryCases[index] };
};

export const getAudit = () => memoryAudit.map((entry) => ({ ...entry }));

export const setAudit = (entries) => {
  if (!Array.isArray(entries)) {
    throw new TypeError('Audit payload must be an array');
  }
  memoryAudit = entries.map((entry) => ({ ...entry }));
  return getAudit();
};

export const addAuditEntry = (entry) => {
  const record = {
    id: entry.id || generateId(),
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString()
  };
  memoryAudit.push(record);
  return { ...record };
};

export const clearAudit = () => {
  memoryAudit = [];
  return true;
};

export const resetStore = () => {
  memoryTenants = [];
  memoryUsers = [createInitialSuperAdmin()];
  memoryCases = [];
  memoryAudit = [];
};

export const getStoreSnapshot = () => ({
  tenants: getTenants(),
  users: getUsers(),
  cases: getCases(),
  audit: getAudit(),
  stageOrder: { ...STAGE_ORDER }
});