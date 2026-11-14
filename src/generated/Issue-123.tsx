import React, { useMemo } from 'react';
import CoordinatorPortalView from '../views/CoordinatorPortalView';
import ConsultantMobileView from '../views/ConsultantMobileView';
import PatientDashboardView from '../views/PatientDashboardView';
import DoctorWorkspaceView from '../views/DoctorWorkspaceView';
import AdminControlView from '../views/AdminControlView';
import NurseStationView from '../views/NurseStationView';
import PharmacistDispensaryView from '../views/PharmacistDispensaryView';
import LabTechnicianView from '../views/LabTechnicianView';
import RadiologistView from '../views/RadiologistView';
import BillingClerkView from '../views/BillingClerkView';
import GuestLandingView from '../views/GuestLandingView';

export type StandardRoleCode = 
  | 'CO' | 'CN' | 'PT' | 'DR' | 'AD' | 'NR' | 'PH' | 'LT' | 'RD' | 'BC' | 'GS'
  | 'C' | 'K';

export interface ScreenRouterProps {
  role: StandardRoleCode | string;
  personaId?: string;
  lang?: 'ar' | 'en';
}

const normalizeRole = (rawRole: string): StandardRoleCode => {
  const upper = rawRole.trim().toUpperCase();
  if (upper === 'C' || upper === 'CO') return 'CO';
  if (upper === 'K' || upper === 'CN') return 'CN';
  if (['PT', 'DR', 'AD', 'NR', 'PH', 'LT', 'RD', 'BC', 'GS'].includes(upper)) {
    return upper as StandardRoleCode;
  }
  return 'GS';
};

const ScreenRouter: React.FC<ScreenRouterProps> = ({ role, personaId, lang = 'ar' }) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const fontFamily = 'Cairo, sans-serif';
  
  const normalizedRole = useMemo(() => normalizeRole(role), [role]);

  const containerStyle: React.CSSProperties = {
    direction: dir,
    fontFamily,
    minHeight: '100vh',
    backgroundColor: '#E6FAF7',
    color: '#007B6E',
    margin: 0,
    padding: 0,
  };

  const renderScreen = () => {
    switch (normalizedRole) {
      case 'CO':
        return <CoordinatorPortalView personaId={personaId} lang={lang} />;
      case 'CN':
        return <ConsultantMobileView personaId={personaId} lang={lang} />;
      case 'PT':
        return <PatientDashboardView personaId={personaId} lang={lang} />;
      case 'DR':
        return <DoctorWorkspaceView personaId={personaId} lang={lang} />;
      case 'AD':
        return <AdminControlView personaId={personaId} lang={lang} />;
      case 'NR':
        return <NurseStationView personaId={personaId} lang={lang} />;
      case 'PH':
        return <PharmacistDispensaryView personaId={personaId} lang={lang} />;
      case 'LT':
        return <LabTechnicianView personaId={personaId} lang={lang} />;
      case 'RD':
        return <RadiologistView personaId={personaId} lang={lang} />;
      case 'BC':
        return <BillingClerkView personaId={personaId} lang={lang} />;
      case 'GS':
      default:
        return <GuestLandingView lang={lang} />;
    }
  };

  return (
    <div style={containerStyle} data-testid="alo-screen-router" aria-label="ALO DOCTOR Screen Router">
      {renderScreen()}
    </div>
  );
};

export default ScreenRouter;

export type PermissionLevel = 'none' | 'read' | 'write' | 'admin';

export interface RbacPermissions {
  dashboard: PermissionLevel;
  patients: PermissionLevel;
  appointments: PermissionLevel;
  medicalRecords: PermissionLevel;
  prescriptions: PermissionLevel;
  billing: PermissionLevel;
  systemSettings: PermissionLevel;
  telemedicine: PermissionLevel;
  labResults: PermissionLevel;
  consultations: PermissionLevel;
}

export type RbacMatrixRecord = Record<string, RbacPermissions>;

const baseDeny: RbacPermissions = {
  dashboard: 'none',
  patients: 'none',
  appointments: 'none',
  medicalRecords: 'none',
  prescriptions: 'none',
  billing: 'none',
  systemSettings: 'none',
  telemedicine: 'none',
  labResults: 'none',
  consultations: 'none',
};

export const rbacMatrix: RbacMatrixRecord = {
  CO: {
    ...baseDeny,
    dashboard: 'read',
    patients: 'read',
    appointments: 'admin',
    medicalRecords: 'read',
    billing: 'read',
    telemedicine: 'write',
    consultations: 'write',
  },
  CN: {
    ...baseDeny,
    dashboard: 'read',
    patients: 'read',
    medicalRecords: 'write',
    prescriptions: 'write',
    telemedicine: 'admin',
    labResults: 'read',
    consultations: 'admin',
  },
  C: {
    ...baseDeny,
    dashboard: 'read',
    patients: 'read',
    appointments: 'admin',
    medicalRecords: 'read',
    billing: 'read',
    telemedicine: 'write',
    consultations: 'write',
  },
  K: {
    ...baseDeny,
    dashboard: 'read',
    patients: 'read',
    medicalRecords: 'write',
    prescriptions: 'write',
    telemedicine: 'admin',
    labResults: 'read',
    consultations: 'admin',
  },
  PT: {
    ...baseDeny,
    dashboard: 'read',
    appointments: 'write',
    medicalRecords: 'read',
    prescriptions: 'read',
    billing: 'read',
    telemedicine: 'write',
    labResults: 'read',
  },
  DR: {
    ...baseDeny,
    dashboard: 'read',
    patients: 'read',
    appointments: 'write',
    medicalRecords: 'admin',
    prescriptions: 'admin',
    telemedicine: 'admin',
    labResults: 'read',
    consultations: 'write',
  },
  AD: {
    ...baseDeny,
    dashboard: 'admin',
    patients: 'admin',
    appointments: 'admin',
    medicalRecords: 'admin',
    prescriptions: 'admin',
    billing: 'admin',
    systemSettings: 'admin',
    telemedicine: 'admin',
    labResults: 'admin',
    consultations: 'admin',
  },
  NR: {
    ...baseDeny,
    dashboard: 'read',
    patients: 'read',
    appointments: 'read',
    medicalRecords: 'write',
    prescriptions: 'read',
    telemedicine: 'write',
    labResults: 'read',
  },
  PH: {
    ...baseDeny,
    dashboard: 'read',
    patients: 'read',
    prescriptions: 'admin',
    billing: 'read',
  },
  LT: {
    ...baseDeny,
    dashboard: 'read',
    patients: 'read',
    labResults: 'admin',
  },
  RD: {
    ...baseDeny,
    dashboard: 'read',
    patients: 'read',
    medicalRecords: 'write',
    labResults: 'admin',
  },
  BC: {
    ...baseDeny,
    dashboard: 'read',
    patients: 'read',
    billing: 'admin',
  },
  GS: {
    ...baseDeny,
    dashboard: 'read',
  },
};

export const getPermissions = (roleCode: string): RbacPermissions => {
  const normalized = roleCode.trim().toUpperCase();
  if (normalized === 'C' || normalized === 'CO') return rbacMatrix['CO'];
  if (normalized === 'K' || normalized === 'CN') return rbacMatrix['CN'];
  return rbacMatrix[normalized] || baseDeny;
};

export const hasPermission = (
  roleCode: string,
  resource: keyof RbacPermissions,
  requiredLevel: PermissionLevel
): boolean => {
  const permissions = getPermissions(roleCode);
  const currentLevel = permissions[resource];
  
  const hierarchy: Record<PermissionLevel, number> = {
    none: 0,
    read: 1,
    write: 2,
    admin: 3,
  };

  return hierarchy[currentLevel] >= hierarchy[requiredLevel];
};

export const ROLE_LABELS_AR: Record<string, string> = {
  CO: 'منسق ألو',
  CN: 'استشاري دولي',
  PT: 'مريض',
  DR: 'طبيب',
  AD: 'مدير النظام',
  NR: 'ممرض',
  PH: 'صيدلي',
  LT: 'فني مختبر',
  RD: 'أخصائي أشعة',
  BC: 'محاسب',
  GS: 'زائر',
  C: 'منسق ألو',
  K: 'استشاري دولي',
};

export const ROLE_LABELS_EN: Record<string, string> = {
  CO: 'ALO Coordinator',
  CN: 'International Consultant',
  PT: 'Patient',
  DR: 'Doctor',
  AD: 'System Admin',
  NR: 'Nurse',
  PH: 'Pharmacist',
  LT: 'Lab Technician',
  RD: 'Radiologist',
  BC: 'Billing Clerk',
  GS: 'Guest',
  C: 'ALO Coordinator',
  K: 'International Consultant',
};