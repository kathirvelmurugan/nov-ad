import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';

// ALO DOCTOR v2.4 Saudi Edition - ScreenRouter Tenant Partitioning
// Pinterest-Teal Palette: #007B6E, #00C6AE, #E6FAF7, #25D366

export type UserRole = 'STAFF' | 'D' | 'N' | 'P' | 'C' | 'AD';

export interface ConsultantRef {
  id: string;
  name?: string;
}

export interface TreatingDoctorRef {
  id?: string;
  hospital?: string;
  name?: string;
}

export interface ClinicalCase {
  id: string;
  tenantId: string;
  patientPhone: string;
  treatingDoctor?: TreatingDoctorRef;
  consultant?: ConsultantRef;
  status: string;
  [key: string]: any;
}

export interface UserSession {
  userId: string;
  role: UserRole;
  hospitalId?: string;
  hospitalName?: string;
  phone?: string;
  personaProfileId?: string;
}

export interface ScreenRouterProps {
  cases: ClinicalCase[];
  userSession: UserSession | null;
  isLoading?: boolean;
  DoctorReviewScreen: React.ComponentType<{ cases: ClinicalCase[] }>;
  NurseTriageScreen: React.ComponentType<{ cases: ClinicalCase[] }>;
  HospitalAdminScreen: React.ComponentType<{ cases: ClinicalCase[] }>;
  PatientPortalScreen: React.ComponentType<{ cases: ClinicalCase[] }>;
  ConsultantDashboardScreen: React.ComponentType<{ cases: ClinicalCase[] }>;
  SuperAdminGovernanceScreen: React.ComponentType<{ cases: ClinicalCase[] }>;
}

const partitionCasesByTenantAndRole = (
  rawCases: ClinicalCase[],
  session: UserSession
): ClinicalCase[] => {
  if (!session || !session.role) return [];

  switch (session.role) {
    case 'STAFF':
    case 'D':
    case 'N': {
      const hId = session.hospitalId?.trim().toLowerCase();
      const hName = session.hospitalName?.trim().toLowerCase();

      return rawCases.filter((c) => {
        const matchesTenantId = hId && c.tenantId?.trim().toLowerCase() === hId;
        const matchesHospitalName =
          hName && c.treatingDoctor?.hospital?.trim().toLowerCase() === hName;
        return matchesTenantId || matchesHospitalName;
      });
    }

    case 'P': {
      const patientPhone = session.phone?.trim();
      if (!patientPhone) return [];
      return rawCases.filter(
        (c) => c.patientPhone?.trim() === patientPhone
      );
    }

    case 'C': {
      const consultantId = session.userId?.trim();
      if (!consultantId) return [];
      return rawCases.filter(
        (c) => c.consultant?.id?.trim() === consultantId
      );
    }

    case 'AD': {
      return rawCases;
    }

    default:
      return [];
  }
};

const ScreenRouter: React.FC<ScreenRouterProps> = ({
  cases,
  userSession,
  isLoading = false,
  DoctorReviewScreen,
  NurseTriageScreen,
  HospitalAdminScreen,
  PatientPortalScreen,
  ConsultantDashboardScreen,
  SuperAdminGovernanceScreen,
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const scopedCases = useMemo<ClinicalCase[]>(() => {
    if (!userSession) return [];
    return partitionCasesByTenantAndRole(cases, userSession);
  }, [cases, userSession]);

  const renderActiveScreen = (): React.ReactNode => {
    if (!userSession) return null;

    switch (userSession.role) {
      case 'D':
        return <DoctorReviewScreen cases={scopedCases} />;
      case 'N':
        return <NurseTriageScreen cases={scopedCases} />;
      case 'STAFF':
        return <HospitalAdminScreen cases={scopedCases} />;
      case 'P':
        return <PatientPortalScreen cases={scopedCases} />;
      case 'C':
        return <ConsultantDashboardScreen cases={scopedCases} />;
      case 'AD':
        return <SuperAdminGovernanceScreen cases={scopedCases} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007B6E" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { direction: isRTL ? 'rtl' : 'ltr' } as any,
      ]}
      accessibilityLabel="ALO DOCTOR Secure Screen Router"
    >
      {renderActiveScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6FAF7',
    fontFamily: 'Cairo',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(ScreenRouter);