import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, I18nManager } from 'react-native';

// ============================================================================
// SHARED TYPES & CONSTANTS (ALO DOCTOR v2.4 Saudi Edition)
// ============================================================================

const COLORS = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textMuted: '#666666',
  border: '#D1E8E5',
};

const isRTL = I18nManager.isRTL;

interface ServiceTrack {
  id: string;
  nameEn: string;
  nameAr: string;
  icon?: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
}

interface Allergy {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
}

interface PatientDossier {
  chiefComplaintEn: string;
  chiefComplaintAr: string;
  selectedDoctorNameEn: string;
  selectedDoctorNameAr: string;
  medications: Medication[];
  allergies: Allergy[];
  submittedAt: string;
}

interface TimelineEvent {
  id: string;
  type: 'status_update' | 'lab_result' | 'prescription' | 'note';
  titleEn: string;
  titleAr: string;
  timestamp: string;
}

type PersonaId = 
  | 'patient_saudi_en' | 'patient_saudi_ar' 
  | 'doctor_saudi_en' | 'doctor_saudi_ar'
  | 'admin_saudi_en' | 'admin_saudi_ar'
  | 'pharmacist_saudi_en' | 'pharmacist_saudi_ar'
  | 'nurse_saudi_en' | 'nurse_saudi_ar'
  | 'guest_en' | 'guest_ar';

interface UsePersonaReturn {
  personaId: PersonaId;
  language: 'en' | 'ar';
  isRTL: boolean;
  t: (key: string) => string;
}

// Mock hook for 11 persona profile switcher compatibility
const usePersona = (): UsePersonaReturn => {
  const [personaId] = useState<PersonaId>('patient_saudi_ar');
  const language = personaId.endsWith('_ar') ? 'ar' : 'en';
  return {
    personaId,
    language,
    isRTL: language === 'ar',
    t: (key: string) => key, // In production, this resolves from i18n dictionary
  };
};

// ============================================================================
// FILE 1: src/components/timeline/TimelineDossierSummaryCard.tsx
// ============================================================================

interface TimelineDossierSummaryCardProps {
  dossier: PatientDossier;
}

export const TimelineDossierSummaryCard: React.FC<TimelineDossierSummaryCardProps> = ({ dossier }) => {
  const { language, isRTL: dirRTL } = usePersona();
  const [isExpanded, setIsExpanded] = useState(false);

  const chiefComplaint = language === 'ar' ? dossier.chiefComplaintAr : dossier.chiefComplaintEn;
  const doctorName = language === 'ar' ? dossier.selectedDoctorNameAr : dossier.selectedDoctorNameEn;
  
  const toggleLabel = language === 'ar' 
    ? (isExpanded ? 'إخفاء تفاصيل الاستقبال الكاملة' : 'عرض تفاصيل الاستقبال الكاملة المقدمة')
    : (isExpanded ? 'Hide Full Submitted Intake Details' : 'View Full Submitted Intake Details');

  const hasMedications = dossier.medications && dossier.medications.length > 0;
  const hasAllergies = dossier.allergies && dossier.allergies.length > 0;
  const hasExpandableContent = hasMedications || hasAllergies;

  return (
    <View style={styles.dossierCard} accessibilityRole="summary" accessibilityLabel={language === 'ar' ? 'ملف المريض المقدم' : 'Submitted Patient Dossier'}>
      {/* Always Visible Core Info */}
      <View style={styles.dossierHeader}>
        <Text style={[styles.dossierTitle, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
          {language === 'ar' ? 'الملف المقدم' : 'Submitted Dossier'}
        </Text>
        <Text style={[styles.dossierDate, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
          {new Date(dossier.submittedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
        </Text>
      </View>

      <View style={styles.dossierCoreInfo}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
            {language === 'ar' ? 'الشكوى الرئيسية:' : 'Chief Complaint:'}
          </Text>
          <Text style={[styles.infoValue, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
            {chiefComplaint}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
            {language === 'ar' ? 'الطبيب المختار:' : 'Selected Doctor:'}
          </Text>
          <Text style={[styles.infoValue, styles.doctorName, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
            {doctorName}
          </Text>
        </View>

        {/* Inline Chips Preview when collapsed */}
        {!isExpanded && (hasMedications || hasAllergies) && (
          <View style={styles.chipsPreviewContainer}>
            {hasMedications && (
              <View style={styles.previewChip}>
                <Text style={styles.previewChipText}>
                  {dossier.medications.length} {language === 'ar' ? 'أدوية' : 'Meds'}
                </Text>
              </View>
            )}
            {hasAllergies && (
              <View style={[styles.previewChip, styles.allergyPreviewChip]}>
                <Text style={styles.previewChipText}>
                  {dossier.allergies.length} {language === 'ar' ? 'حساسية' : 'Allergies'}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Collapsible Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {hasMedications && (
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
                {language === 'ar' ? 'الأدوية النشطة' : 'Active Medications'}
              </Text>
              <View style={styles.chipsGrid}>
                {dossier.medications.map((med) => (
                  <View key={med.id} style={styles.medicationChip} accessibilityLabel={`${med.name} ${med.dosage}`}>
                    <Text style={[styles.chipText, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
                      {med.name} ({med.dosage})
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {hasAllergies && (
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
                {language === 'ar' ? 'الحساسية' : 'Allergies'}
              </Text>
              <View style={styles.chipsGrid}>
                {dossier.allergies.map((allergy) => (
                  <View 
                    key={allergy.id} 
                    style={[
                      styles.allergyChip, 
                      allergy.severity === 'severe' && styles.allergySevereChip
                    ]}
                    accessibilityLabel={`${allergy.name}, ${allergy.severity}`}
                  >
                    <Text style={[
                      styles.chipText, 
                      allergy.severity === 'severe' && styles.allergySevereText,
                      { writingDirection: dirRTL ? 'rtl' : 'ltr' }
                    ]}>
                      {allergy.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Toggle Button */}
      {hasExpandableContent && (
        <TouchableOpacity 
          style={styles.toggleButton} 
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          accessibilityHint={toggleLabel}
        >
          <Text style={[styles.toggleText, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
            {toggleLabel}
          </Text>
          <Text style={styles.toggleIcon}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};


// ============================================================================
// FILE 2: src/components/screens/PatientIntakeView.tsx
// ============================================================================

interface PatientIntakeViewProps {
  serviceTracks: ServiceTrack[];
  selectedTrackId: string | null;
  onSelectTrack: (id: string) => void;
  onSubmit: () => void;
}

export const PatientIntakeView: React.FC<PatientIntakeViewProps> = ({
  serviceTracks,
  selectedTrackId,
  onSelectTrack,
  onSubmit,
}) => {
  const { language, isRTL: dirRTL } = usePersona();
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to selected item on mount or change
  useEffect(() => {
    if (selectedTrackId && scrollRef.current) {
      const index = serviceTracks.findIndex(t => t.id === selectedTrackId);
      if (index >= 0) {
        // Approximate scroll offset based on chip width
        scrollRef.current.scrollTo({ x: index * 140, animated: true });
      }
    }
  }, [selectedTrackId, serviceTracks]);

  return (
    <View style={styles.intakeContainer}>
      {/* Header */}
      <View style={styles.intakeHeader}>
        <Text style={[styles.intakeTitle, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
          {language === 'ar' ? 'تسجيل الدخول' : 'Patient Intake'}
        </Text>
      </View>

      {/* Compact Horizontal Service Track Selector */}
      <View style={styles.trackSelectorWrapper}>
        <Text style={[styles.trackLabel, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
          {language === 'ar' ? 'مسار الخدمة الصحية المختار' : 'Selected Healthcare Service Track'}
        </Text>
        
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trackScrollContent}
          style={styles.trackScrollView}
          // RTL support for horizontal scroll
          inverted={dirRTL && Platform.OS !== 'web'}
        >
          {serviceTracks.map((track) => {
            const isSelected = track.id === selectedTrackId;
            const trackName = language === 'ar' ? track.nameAr : track.nameEn;
            
            return (
              <TouchableOpacity
                key={track.id}
                style={[
                  styles.trackChip,
                  isSelected && styles.trackChipSelected,
                ]}
                onPress={() => onSelectTrack(track.id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={trackName}
              >
                <Text 
                  style={[
                    styles.trackChipText,
                    isSelected && styles.trackChipTextSelected,
                    { writingDirection: dirRTL ? 'rtl' : 'ltr' }
                  ]}
                  numberOfLines={1}
                >
                  {trackName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Rest of intake form would go here... */}
      
      <TouchableOpacity style={styles.submitButton} onPress={onSubmit} accessibilityRole="button">
        <Text style={styles.submitButtonText}>
          {language === 'ar' ? 'إرسال الملف' : 'Submit Dossier'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};


// ============================================================================
// FILE 3: src/components/screens/PatientStatusTimelineView.tsx
// ============================================================================

interface PatientStatusTimelineViewProps {
  patientNameEn: string;
  patientNameAr: string;
  caseId: string;
  dossier: PatientDossier;
  events: TimelineEvent[];
}

export const PatientStatusTimelineView: React.FC<PatientStatusTimelineViewProps> = ({
  patientNameEn,
  patientNameAr,
  caseId,
  dossier,
  events,
}) => {
  const { language, isRTL: dirRTL } = usePersona();
  const patientName = language === 'ar' ? patientNameAr : patientNameEn;

  return (
    <ScrollView 
      style={styles.timelineScreen} 
      contentContainerStyle={styles.timelineContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Patient Case Header Banner */}
      <View style={styles.caseBanner} accessibilityRole="header">
        <View style={styles.bannerTopRow}>
          <Text style={[styles.patientName, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
            {patientName}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {language === 'ar' ? 'نشط' : 'Active'}
            </Text>
          </View>
        </View>
        <Text style={[styles.caseIdText, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
          {language === 'ar' ? `رقم الحالة: ${caseId}` : `Case ID: ${caseId}`}
        </Text>
      </View>

      {/* 2. Prominent Submitted Dossier (Moved to TOP directly below banner) */}
      <View style={styles.dossierWrapper}>
        <TimelineDossierSummaryCard dossier={dossier} />
      </View>

      {/* 3. Timeline Events */}
      <View style={styles.timelineList}>
        <Text style={[styles.timelineSectionTitle, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
          {language === 'ar' ? 'سجل التحديثات' : 'Status Updates'}
        </Text>
        
        {events.map((event, index) => {
          const isLast = index === events.length - 1;
          const title = language === 'ar' ? event.titleAr : event.titleEn;
          
          return (
            <View key={event.id} style={styles.timelineItem}>
              {/* Vertical Line */}
              {!isLast && <View style={styles.timelineLine} />}
              
              {/* Node */}
              <View style={styles.timelineNode}>
                <View style={styles.nodeInner} />
              </View>
              
              {/* Content */}
              <View style={styles.timelineItemContent}>
                <Text style={[styles.eventTitle, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
                  {title}
                </Text>
                <Text style={[styles.eventTime, { writingDirection: dirRTL ? 'rtl' : 'ltr' }]}>
                  {new Date(event.timestamp).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};


// ============================================================================
// STYLESHEET (Pinterest-Teal Palette, Cairo Font, Zero Artificial Gates)
// ============================================================================

const styles = StyleSheet.create({
  // --- Shared / Global ---
  timelineScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  timelineContent: {
    paddingBottom: 40,
  },

  // --- Patient Status Timeline View ---
  caseBanner: {
    backgroundColor: COLORS.primary,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  patientName: {
    fontFamily: 'Cairo-Bold',
    fontSize: 22,
    color: COLORS.white,
  },
  statusBadge: {
    backgroundColor: COLORS.whatsapp,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 12,
    color: COLORS.white,
  },
  caseIdText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: COLORS.secondary,
    opacity: 0.9,
  },
  dossierWrapper: {
    paddingHorizontal: 16,
    marginTop: -12, // Slight overlap with banner for sleekness
    zIndex: 10,
  },
  timelineList: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  timelineSectionTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 70,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: 24,
    bottom: -10,
    left: 15,
    right: 15, // Handled by node alignment
    width: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },
  timelineNode: {
    width: 32,
    alignItems: 'center',
    paddingTop: 4,
    zIndex: 2,
  },
  nodeInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  timelineItemContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginLeft: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  eventTitle: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  eventTime: {
    fontFamily: 'Cairo-Regular',
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // --- Timeline Dossier Summary Card ---
  dossierCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    ...Platform.select({
      ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  dossierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    paddingBottom: 8,
  },
  dossierTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 15,
    color: COLORS.primary,
  },
  dossierDate: {
    fontFamily: 'Cairo-Regular',
    fontSize: 11,
    color: COLORS.textMuted,
  },
  dossierCoreInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  infoLabel: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 13,
    color: COLORS.textMuted,
    minWidth: 100,
  },
  infoValue: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: COLORS.textDark,
    flex: 1,
  },
  doctorName: {
    color: COLORS.primary,
    fontFamily: 'Cairo-Bold',
  },
  chipsPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    marginTop: 8,
  },
  previewChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  allergyPreviewChip: {
    borderColor: '#FFB3B3',
    backgroundColor: '#FFF0F0',
  },
  previewChipText: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 11,
    color: COLORS.primary,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    gap: 16,
  },
  sectionContainer: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 13,
    color: COLORS.textDark,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  medicationChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  allergyChip: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFB3B3',
  },
  allergySevereChip: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF4D4D',
  },
  chipText: {
    fontFamily: 'Cairo-Medium',
    fontSize: 12,
    color: COLORS.primary,
  },
  allergySevereText: {
    color: '#D32F2F',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  toggleText: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 12,
    color: COLORS.primary,
  },
  toggleIcon: {
    fontSize: 10,
    color: COLORS.primary,
  },

  // --- Patient Intake View ---
  intakeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  intakeHeader: {
    marginBottom: 24,
  },
  intakeTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 24,
    color: COLORS.primary,
  },
  trackSelectorWrapper: {
    marginBottom: 24,
  },
  trackLabel: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  trackScrollView: {
    flexGrow: 0,
    // Hides scrollbar natively
    ...(Platform.OS === 'web' ? { scrollbarWidth: 'none' } as any : {}),
  },
  trackScrollContent: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    paddingVertical: 4,
    gap: 8,
    paddingRight: 16,
    paddingLeft: 4,
  },
  trackChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 100,
    maxWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...Platform.select({
      ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  trackChipText: {
    fontFamily: 'Cairo-Medium',
    fontSize: 13,
    color: COLORS.textDark,
  },
  trackChipTextSelected: {
    color: COLORS.white,
    fontFamily: 'Cairo-Bold',
  },
  submitButton: {
    backgroundColor: COLORS.whatsapp,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    ...Platform.select({
      ios: { shadowColor: COLORS.whatsapp, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  submitButtonText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    color: COLORS.white,
  },
});