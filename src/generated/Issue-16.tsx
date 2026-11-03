import React, { useContext, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { DynamicCaseContext } from '../context/DynamicCaseContext';
import { PersonaContext } from '../context/PersonaContext';

const COLORS = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textLight: '#4A4A4A',
};

type Role = 'P' | 'K' | 'N' | 'D' | 'R' | 'A' | 'L' | 'S' | 'T' | 'M' | 'O';

interface Consultant {
  id: string;
  name: string;
  nameAr: string;
  specialty: string;
  specialtyAr: string;
}

interface LabVitals {
  label: string;
  labelAr: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

interface ActiveCase {
  caseNumber: string;
  patientNameEn: string;
  patientNameAr: string;
  consultant: Consultant;
  specialty: string;
  specialtyAr: string;
  labVitals: LabVitals[];
  primaryQuestionEn: string;
  primaryQuestionAr: string;
}

interface Persona {
  role: Role;
  lang: 'ar' | 'en';
}

export const TopProfileSwitcher: React.FC = () => {
  const { activeCase, cases } = useContext(DynamicCaseContext);
  const { persona, setPersonaRole } = useContext(PersonaContext);
  const isRTL = persona.lang === 'ar';

  const roleLabel = useMemo(() => {
    if (!activeCase) return '';
    switch (persona.role) {
      case 'P':
        const firstNameEn = activeCase.patientNameEn.split(' ')[0];
        const firstNameAr = activeCase.patientNameAr.split(' ')[0];
        return isRTL ? `المريض (${firstNameAr})` : `Patient (${firstNameEn})`;
      case 'K':
        return isRTL ? `الاستشاري (${activeCase.consultant.nameAr})` : `Consultant (${activeCase.consultant.name})`;
      case 'N':
        return isRTL ? 'التمريض' : 'Nurse';
      case 'D':
        return isRTL ? 'الطبيب' : 'Doctor';
      default:
        return isRTL ? 'الملف الشخصي' : 'Profile';
    }
  }, [persona.role, persona.lang, activeCase, isRTL]);

  const caseReference = useMemo(() => {
    if (!activeCase) return '';
    return `${activeCase.caseNumber} · ${isRTL ? activeCase.patientNameAr : activeCase.patientNameEn}`;
  }, [activeCase, isRTL]);

  if (!activeCase) return null;

  return (
    <View style={[styles.headerContainer, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <View style={styles.topRow}>
        <View style={[styles.casePill, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.casePillText}>{caseReference}</Text>
        </View>
        <Text style={[styles.roleLabel, { fontFamily: isRTL ? 'Cairo-Bold' : 'Cairo-Bold' }]}>
          {roleLabel}
        </Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.switcherScroll}
        contentContainerStyle={styles.switcherContent}
      >
        {(['P', 'K', 'N', 'D'] as Role[]).map((role) => (
          <Pressable
            key={role}
            onPress={() => setPersonaRole(role)}
            style={({ pressed }) => [
              styles.roleButton,
              persona.role === role && styles.roleButtonActive,
              pressed && styles.roleButtonPressed,
            ]}
          >
            <Text style={[
              styles.roleButtonText,
              persona.role === role && styles.roleButtonTextActive
            ]}>
              {role}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export const FollowUpChatView: React.FC = () => {
  const { activeCase } = useContext(DynamicCaseContext);
  const { persona } = useContext(PersonaContext);
  const isRTL = persona.lang === 'ar';

  if (!activeCase) return null;

  const patientLabel = isRTL ? `المريض (${activeCase.patientNameAr})` : `Patient (${activeCase.patientNameEn})`;
  const consultantLabel = isRTL ? `توصية ${activeCase.consultant.nameAr}` : `Recommendation by ${activeCase.consultant.name}`;

  const chatHistory = [
    { id: '1', sender: 'patient', text: isRTL ? 'مرحباً، أريد متابعة حالتي.' : 'Hello, I would like to follow up on my case.', label: patientLabel },
    { id: '2', sender: 'consultant', text: isRTL ? 'بناءً على الفحوصات، نوصي بالخطة التالية.' : 'Based on the labs, we recommend the following plan.', label: consultantLabel },
  ];

  return (
    <View style={[styles.screenContainer, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <Text style={[styles.screenTitle, { fontFamily: 'Cairo-Bold' }]}>
        {isRTL ? 'متابعة المحادثة' : 'Follow-up Chat'}
      </Text>
      
      <View style={styles.chatList}>
        {chatHistory.map((msg) => (
          <View 
            key={msg.id} 
            style={[
              styles.chatBubble, 
              msg.sender === 'patient' ? styles.bubblePatient : styles.bubbleConsultant
            ]}
          >
            <Text style={[styles.chatSender, { color: COLORS.primary, fontFamily: 'Cairo-Bold' }]}>
              {msg.label}
            </Text>
            <Text style={[styles.chatText, { fontFamily: 'Cairo-Regular' }]}>
              {msg.text}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.vitalsSummary}>
        <Text style={[styles.vitalsTitle, { fontFamily: 'Cairo-Bold' }]}>
          {isRTL ? 'العلامات الحيوية الأخيرة' : 'Recent Lab Vitals'}
        </Text>
        <View style={styles.vitalsGrid}>
          {activeCase.labVitals.map((vital, idx) => (
            <View key={idx} style={styles.vitalCard}>
              <Text style={[styles.vitalLabel, { fontFamily: 'Cairo-Regular' }]}>
                {isRTL ? vital.labelAr : vital.label}
              </Text>
              <Text style={[
                styles.vitalValue, 
                { fontFamily: 'Cairo-Bold', color: vital.status === 'critical' ? '#D32F2F' : COLORS.textDark }
              ]}>
                {vital.value} {vital.unit}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export const DoctorReviewView: React.FC = () => {
  const { activeCase } = useContext(DynamicCaseContext);
  const { persona } = useContext(PersonaContext);
  const isRTL = persona.lang === 'ar';

  if (!activeCase) return null;

  const questionLabel = isRTL 
    ? 'السؤال السريري الأول (خطة التدخل والعلاج)' 
    : 'Primary Clinical Question (Intervention & Treatment Strategy)';

  return (
    <View style={[styles.screenContainer, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <Text style={[styles.screenTitle, { fontFamily: 'Cairo-Bold' }]}>
        {isRTL ? 'مراجعة الطبيب' : 'Doctor Review'}
      </Text>
      
      <View style={styles.reviewCard}>
        <Text style={[styles.reviewLabel, { color: COLORS.primary, fontFamily: 'Cairo-Bold' }]}>
          {questionLabel}
        </Text>
        <Text style={[styles.reviewDetail, { fontFamily: 'Cairo-Regular' }]}>
          {isRTL ? activeCase.primaryQuestionAr : activeCase.primaryQuestionEn}
        </Text>
      </View>

      <View style={styles.reviewCard}>
        <Text style={[styles.reviewLabel, { fontFamily: 'Cairo-Bold' }]}>
          {isRTL ? 'الاستشاري المسؤول' : 'Assigned Consultant'}
        </Text>
        <Text style={[styles.reviewDetail, { fontFamily: 'Cairo-Regular' }]}>
          {isRTL ? activeCase.consultant.nameAr : activeCase.consultant.name} - {isRTL ? activeCase.consultant.specialtyAr : activeCase.consultant.specialty}
        </Text>
      </View>

      <View style={styles.reviewCard}>
        <Text style={[styles.reviewLabel, { fontFamily: 'Cairo-Bold' }]}>
          {isRTL ? 'رقم الحالة' : 'Case Number'}
        </Text>
        <Text style={[styles.reviewDetail, { fontFamily: 'Cairo-Regular' }]}>
          {activeCase.caseNumber}
        </Text>
      </View>
    </View>
  );
};

export const NurseTriageView: React.FC = () => {
  const { activeCase } = useContext(DynamicCaseContext);
  const { persona } = useContext(PersonaContext);
  const isRTL = persona.lang === 'ar';

  if (!activeCase) return null;

  const auditNote = isRTL
    ? `ملاحظة تدقيق التمريض للحالة ${activeCase.caseNumber}: تم مراجعة العلامات الحيوية والفحوصات المخبرية لقسم ${activeCase.specialtyAr}. المريض ${activeCase.patientNameAr} مستقر.`
    : `Nurse Audit Note for Case ${activeCase.caseNumber}: Reviewed vitals and lab parameters for ${activeCase.specialty} department. Patient ${activeCase.patientNameEn} is stable.`;

  return (
    <View style={[styles.screenContainer, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <Text style={[styles.screenTitle, { fontFamily: 'Cairo-Bold' }]}>
        {isRTL ? 'فرز التمريض' : 'Nurse Triage'}
      </Text>

      <View style={styles.triageHeader}>
        <View style={styles.triageInfo}>
          <Text style={[styles.triagePatient, { fontFamily: 'Cairo-Bold' }]}>
            {isRTL ? activeCase.patientNameAr : activeCase.patientNameEn}
          </Text>
          <Text style={[styles.triageCase, { fontFamily: 'Cairo-Regular', color: COLORS.textLight }]}>
            {activeCase.caseNumber} · {isRTL ? activeCase.specialtyAr : activeCase.specialty}
          </Text>
        </View>
      </View>

      <View style={styles.auditCard}>
        <Text style={[styles.auditTitle, { fontFamily: 'Cairo-Bold', color: COLORS.primary }]}>
          {isRTL ? 'ملاحظة التدقيق' : 'Audit Note'}
        </Text>
        <Text style={[styles.auditText, { fontFamily: 'Cairo-Regular' }]}>
          {auditNote}
        </Text>
      </View>

      <View style={styles.vitalsSummary}>
        <Text style={[styles.vitalsTitle, { fontFamily: 'Cairo-Bold' }]}>
          {isRTL ? 'العلامات الحيوية للتقييم' : 'Triage Vitals'}
        </Text>
        <View style={styles.vitalsGrid}>
          {activeCase.labVitals.map((vital, idx) => (
            <View key={idx} style={[
              styles.vitalCard,
              vital.status === 'critical' && styles.vitalCardCritical,
              vital.status === 'warning' && styles.vitalCardWarning
            ]}>
              <Text style={[styles.vitalLabel, { fontFamily: 'Cairo-Regular' }]}>
                {isRTL ? vital.labelAr : vital.label}
              </Text>
              <Text style={[
                styles.vitalValue, 
                { fontFamily: 'Cairo-Bold' }
              ]}>
                {vital.value} {vital.unit}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.white,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  casePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  casePillText: {
    color: COLORS.white,
    fontSize: 13,
    fontFamily: 'Cairo-Bold',
  },
  roleLabel: {
    fontSize: 16,
    color: COLORS.textDark,
  },
  switcherScroll: {
    flexGrow: 0,
  },
  switcherContent: {
    gap: 8,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roleButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.primary,
  },
  roleButtonPressed: {
    opacity: 0.8,
  },
  roleButtonText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontFamily: 'Cairo-SemiBold',
  },
  roleButtonTextActive: {
    color: COLORS.white,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  screenTitle: {
    fontSize: 22,
    color: COLORS.primary,
    marginBottom: 20,
  },
  chatList: {
    gap: 12,
    marginBottom: 24,
  },
  chatBubble: {
    padding: 16,
    borderRadius: 12,
    maxWidth: '85%',
  },
  bubblePatient: {
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  bubbleConsultant: {
    backgroundColor: COLORS.white,
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.whatsapp,
  },
  chatSender: {
    fontSize: 12,
    marginBottom: 6,
  },
  chatText: {
    fontSize: 15,
    color: COLORS.textDark,
    lineHeight: 22,
  },
  vitalsSummary: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  vitalsTitle: {
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 12,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalCard: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    minWidth: '45%',
    flex: 1,
  },
  vitalCardCritical: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#D32F2F',
  },
  vitalCardWarning: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#F57C00',
  },
  vitalLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 16,
    color: COLORS.textDark,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  reviewDetail: {
    fontSize: 16,
    color: COLORS.textDark,
    lineHeight: 24,
  },
  triageHeader: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triageInfo: {
    flex: 1,
  },
  triagePatient: {
    fontSize: 18,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  triageCase: {
    fontSize: 14,
  },
  auditCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderRightWidth: 4,
    borderRightColor: COLORS.secondary,
  },
  auditTitle: {
    fontSize: 15,
    marginBottom: 8,
  },
  auditText: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 22,
  },
});