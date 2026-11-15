import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import CaseMilestoneHUD from '../CaseMilestoneHUD';

type ConsultationType = 'written' | 'video' | 'voice' | string;

interface ActiveCase {
  id: string;
  consultationType?: ConsultationType;
  createdAt?: string;
  patientPhone?: string;
  status?: string;
}

interface UserSession {
  phone?: string;
  name?: string;
}

interface PatientStatusTimelineViewProps {
  activeCase?: ActiveCase | null;
  lang: 'ar' | 'en';
  isAr: boolean;
  userSession?: UserSession | null;
  currentPersonaId?: string;
}

const formatTimeAST = (isoString: string, lang: 'ar' | 'en'): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '--';
  }
};

const getStageSixLabel = (consultationType: ConsultationType | undefined): { en: string; ar: string } => {
  switch (consultationType) {
    case 'written':
      return { en: 'Second Opinion', ar: 'الرأي الطبي الاستشاري' };
    case 'voice':
      return { en: 'Voice Call', ar: 'الاستشارة الصوتية' };
    case 'video':
    default:
      return { en: 'Telehealth', ar: 'الاستشارة المرئية' };
  }
};

const STAGES_BASE = [
  { en: 'Intake', ar: 'استقبال البيانات' },
  { en: 'Triage', ar: 'التصنيف الطبي' },
  { en: 'Matching', ar: 'مطابقة الطبيب' },
  { en: 'Review', ar: 'المراجعة السريرية' },
  { en: 'Prep', ar: 'التحضير' },
];

const PatientStatusTimelineView: React.FC<PatientStatusTimelineViewProps> = ({
  activeCase,
  lang,
  isAr,
  userSession,
}) => {
  const direction = isAr ? 'rtl' : 'ltr';
  const writingDirection = isAr ? 'rtl' : 'ltr';
  const textAlign = isAr ? 'right' : 'left';

  const stages = useMemo(() => {
    const stageSix = getStageSixLabel(activeCase?.consultationType);
    return [...STAGES_BASE, stageSix];
  }, [activeCase?.consultationType]);

  const submissionTime = useMemo(
    () => (activeCase?.createdAt ? formatTimeAST(activeCase.createdAt, lang) : '--'),
    [activeCase?.createdAt, lang]
  );

  const contactPhone = activeCase?.patientPhone || userSession?.phone || '0501111111';

  const uiText = useMemo(
    () => ({
      summaryTitle: isAr ? 'ملخص الاستبيان السريري المقدم' : 'Summary of Your Submitted Clinical Intake',
      submittedAt: isAr ? 'وقت الإرسال (توقيت السعودية)' : 'Submitted At (AST)',
      contactNumber: isAr ? 'رقم التواصل' : 'Contact Phone',
      timelineHeader: isAr ? 'مسار حالة المريض' : 'Patient Status Timeline',
      stageProgress: isAr ? 'تقدم المراحل' : 'Stage Progression',
    }),
    [isAr]
  );

  return (
    <ScrollView
      style={[styles.container, { direction }]}
      contentContainerStyle={[styles.contentContainer, { direction }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hudWrapper}>
        <CaseMilestoneHUD activeCase={activeCase as any} lang={lang} isRTL={isAr} />
      </View>

      <View style={styles.headerCard}>
        <Text style={[styles.headerTitle, { textAlign, writingDirection }]}>
          {uiText.timelineHeader}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={[styles.summaryTitle, { textAlign, writingDirection }]}>
          {uiText.summaryTitle}
        </Text>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { textAlign, writingDirection }]}>
            {uiText.submittedAt}
          </Text>
          <Text style={[styles.summaryValue, { textAlign, writingDirection }]}>
            {submissionTime}
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { textAlign, writingDirection }]}>
            {uiText.contactNumber}
          </Text>
          <Text style={[styles.summaryValue, { textAlign, writingDirection, direction: 'ltr' }]}>
            {contactPhone}
          </Text>
        </View>
      </View>

      <View style={styles.stepperSection}>
        <Text style={[styles.stepperTitle, { textAlign, writingDirection }]}>
          {uiText.stageProgress}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stepperScroll}
          contentContainerStyle={[
            styles.stepperContent,
            { flexDirection: isAr ? 'row-reverse' : 'row' },
          ]}
        >
          {stages.map((stage, index) => {
            const stepNumber = index + 1;
            const isActive = true; // Bind to actual case progress state in production
            const label = isAr ? stage.ar : stage.en;

            return (
              <React.Fragment key={`stage-${stepNumber}`}>
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      isActive ? styles.stepCircleActive : styles.stepCircleInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNumberText,
                        isActive ? styles.stepNumberTextActive : styles.stepNumberTextInactive,
                      ]}
                    >
                      {stepNumber}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      { textAlign: 'center', writingDirection },
                      isActive ? styles.stepLabelActive : styles.stepLabelInactive,
                    ]}
                    numberOfLines={2}
                  >
                    {label}
                  </Text>
                </View>

                {index < stages.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      isActive ? styles.stepConnectorActive : styles.stepConnectorInactive,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6FAF7',
  },
  contentContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  hudWrapper: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#007B6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerCard: {
    backgroundColor: '#007B6E',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 20,
    shadowColor: '#007B6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  headerTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#00C6AE',
    shadowColor: '#00C6AE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    color: '#007B6E',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 14,
    color: '#4A5568',
    flex: 1,
  },
  summaryValue: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: '#1A202C',
    flex: 1,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E6FAF7',
    marginVertical: 8,
  },
  stepperSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    shadowColor: '#007B6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepperTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    color: '#007B6E',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  stepperScroll: {
    flexGrow: 0,
  },
  stepperContent: {
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    maxWidth: 100,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
  },
  stepCircleActive: {
    backgroundColor: '#007B6E',
    borderColor: '#007B6E',
  },
  stepCircleInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00C6AE',
  },
  stepNumberText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
  },
  stepNumberTextActive: {
    color: '#FFFFFF',
  },
  stepNumberTextInactive: {
    color: '#00C6AE',
  },
  stepLabel: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 12,
    lineHeight: 18,
  },
  stepLabelActive: {
    color: '#007B6E',
  },
  stepLabelInactive: {
    color: '#718096',
  },
  stepConnector: {
    height: 2,
    width: 32,
    marginTop: -30,
    alignSelf: 'center',
  },
  stepConnectorActive: {
    backgroundColor: '#007B6E',
  },
  stepConnectorInactive: {
    backgroundColor: '#00C6AE',
  },
});

export default PatientStatusTimelineView;