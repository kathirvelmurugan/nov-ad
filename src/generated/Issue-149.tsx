import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';

const COLORS = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textLight: '#4A4A4A',
  error: '#D32F2F',
  border: '#B2DFDB'
};

type PersonaId = string;
type CaseStage = 1 | 2 | 3 | 4 | 5;
type ConsultationTier = 'TIER_1_WRITTEN' | 'TIER_2_VIDEO';

interface MilestoneEvent {
  code: string;
  timestamp: string;
  actor: string;
  descriptionEn: string;
  descriptionAr: string;
}

interface ZATCAInvoiceMetadata {
  invoiceNumber: string;
  issueDate: string;
  sellerName: string;
  vatRate: number;
  subtotal: number;
  vatAmount: number;
  totalWithVat: number;
  currency: string;
}

interface ClinicalFocusAnswers {
  indication: string;
  medication: string;
  followUp: string;
}

interface CaseRecord {
  caseId: string;
  patientId: string;
  stage: CaseStage;
  triageNotes: string;
  milestones: MilestoneEvent[];
  selectedTier?: ConsultationTier;
  clinicalAnswers?: ClinicalFocusAnswers;
  zatcaMetadata?: ZATCAInvoiceMetadata;
}

interface DoctorReviewViewProps {
  currentPersonaId: PersonaId;
  isRTL: boolean;
  language: 'ar' | 'en';
  caseData: CaseRecord;
  onCaseUpdate: (updatedCase: CaseRecord) => void;
}

const TIER_PRICING = {
  TIER_1_WRITTEN: {
    base: 65.22,
    vatRate: 0.15,
    total: 75.00,
    labelEn: 'Written Second Opinion',
    labelAr: 'رأي طبي ثانٍ مكتوب'
  },
  TIER_2_VIDEO: {
    base: 750.00,
    vatRate: 0.00,
    total: 750.00,
    labelEn: 'Comprehensive Multi-Disciplinary Video',
    labelAr: 'استشارة فيديو شاملة متعددة التخصصات'
  }
};

const getSaudiASTTimestamp = (): string => {
  return new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh', hour12: false });
};

const generateZATCAMetadata = (tier: ConsultationTier): ZATCAInvoiceMetadata => {
  const pricing = TIER_PRICING[tier];
  const vatAmount = Number((pricing.base * pricing.vatRate).toFixed(2));
  return {
    invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    issueDate: getSaudiASTTimestamp(),
    sellerName: 'ALO DOCTOR Medical Services',
    vatRate: pricing.vatRate * 100,
    subtotal: pricing.base,
    vatAmount: vatAmount,
    totalWithVat: pricing.total,
    currency: 'SAR'
  };
};

export const DoctorFocusQuestionsSection: React.FC<{
  isRTL: boolean;
  language: 'ar' | 'en';
  answers: ClinicalFocusAnswers;
  onAnswersChange: (answers: ClinicalFocusAnswers) => void;
  disabled: boolean;
}> = ({ isRTL, language, answers, onAnswersChange, disabled }) => {
  const questions = useMemo(() => [
    {
      key: 'indication' as keyof ClinicalFocusAnswers,
      en: '1. Indication for procedure / TAVR / decompression',
      ar: '١. دواعي الإجراء / استبدال الصمام الأبهري عبر القسطرة / تخفيف الضغط'
    },
    {
      key: 'medication' as keyof ClinicalFocusAnswers,
      en: '2. Post-procedure medication / antithrombotic protocol',
      ar: '٢. الأدوية بعد الإجراء / بروتوكول مضادات التخثر'
    },
    {
      key: 'followUp' as keyof ClinicalFocusAnswers,
      en: '3. Follow-up imaging & rehabilitation schedule',
      ar: '٣. جدول التصوير والمتابعة وإعادة التأهيل'
    }
  ], []);

  const handleChange = (key: keyof ClinicalFocusAnswers, value: string) => {
    onAnswersChange({ ...answers, [key]: value });
  };

  return (
    <View style={[styles.sectionContainer, isRTL && styles.rtlContainer]}>
      <Text style={[styles.sectionTitle, isRTL && styles.rtlText, { color: COLORS.primary }]}>
        {language === 'ar' ? 'الأسئلة السريرية المركزة' : 'Clinical Focus Questions'}
      </Text>
      <Text style={[styles.mandatoryNotice, isRTL && styles.rtlText, { color: COLORS.error }]}>
        {language === 'ar' ? '* جميع الحقول إلزامية للمتابعة' : '* All fields are mandatory to proceed'}
      </Text>
      
      {questions.map((q) => (
        <View key={q.key} style={styles.questionBlock}>
          <Text style={[styles.questionLabel, isRTL && styles.rtlText, { color: COLORS.textDark }]}>
            {language === 'ar' ? q.ar : q.en}
          </Text>
          <TextInput
            style={[
              styles.textArea,
              isRTL && styles.rtlText,
              disabled && styles.disabledInput,
              { borderColor: COLORS.border, textAlign: isRTL ? 'right' : 'left' }
            ]}
            multiline
            numberOfLines={4}
            value={answers[q.key]}
            onChangeText={(text) => handleChange(q.key, text)}
            editable={!disabled}
            placeholder={language === 'ar' ? 'أدخل التقييم السريري...' : 'Enter clinical assessment...'}
            placeholderTextColor={COLORS.textLight}
            accessibilityLabel={language === 'ar' ? q.ar : q.en}
          />
        </View>
      ))}
    </View>
  );
};

export const DoctorReviewView: React.FC<DoctorReviewViewProps> = ({
  currentPersonaId,
  isRTL,
  language,
  caseData,
  onCaseUpdate
}) => {
  const [clinicalAnswers, setClinicalAnswers] = useState<ClinicalFocusAnswers>(
    caseData.clinicalAnswers || { indication: '', medication: '', followUp: '' }
  );
  const [selectedTier, setSelectedTier] = useState<ConsultationTier | null>(caseData.selectedTier || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthorizedDoctor = currentPersonaId === '+966502222222';
  const isAwaitingReview = caseData.stage === 3;
  const isPaymentPending = caseData.stage === 4;

  const isFormValid = useMemo(() => {
    return (
      clinicalAnswers.indication.trim().length > 0 &&
      clinicalAnswers.medication.trim().length > 0 &&
      clinicalAnswers.followUp.trim().length > 0 &&
      selectedTier !== null
    );
  }, [clinicalAnswers, selectedTier]);

  const handleEndorseReferral = useCallback(async () => {
    if (!isAuthorizedDoctor || !isFormValid || !selectedTier) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إكمال جميع الحقول الإلزامية واختيار باقة الاستشارة.' : 'Please complete all mandatory fields and select a consultation tier.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const astTimestamp = getSaudiASTTimestamp();
      const zatcaMetadata = generateZATCAMetadata(selectedTier);

      const m03Milestone: MilestoneEvent = {
        code: 'M03',
        timestamp: astTimestamp,
        actor: currentPersonaId,
        descriptionEn: 'Referral Endorsed (D10) - Awaiting Payment',
        descriptionAr: 'اعتماد الإحالة (D10) - في انتظار الدفع'
      };

      const updatedCase: CaseRecord = {
        ...caseData,
        stage: 4,
        clinicalAnswers,
        selectedTier,
        zatcaMetadata,
        milestones: [...caseData.milestones, m03Milestone]
      };

      onCaseUpdate(updatedCase);

      Alert.alert(
        language === 'ar' ? 'تم الاعتماد' : 'Endorsed',
        language === 'ar' 
          ? `تم اعتماد الإحالة وإصدار الفاتورة. إجمالي المبلغ: ${zatcaMetadata.totalWithVat} ريال سعودي` 
          : `Referral endorsed and invoice issued. Total: ${zatcaMetadata.totalWithVat} SAR`
      );
    } catch (error) {
      Alert.alert(
        language === 'ar' ? 'فشل النظام' : 'System Error',
        language === 'ar' ? 'حدث خطأ أثناء معالجة الاعتماد.' : 'An error occurred while processing the endorsement.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthorizedDoctor, isFormValid, selectedTier, clinicalAnswers, caseData, currentPersonaId, language, onCaseUpdate]);

  if (!isAuthorizedDoctor) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: COLORS.background }]}>
        <Text style={[styles.accessDenied, isRTL && styles.rtlText, { color: COLORS.error }]}>
          {language === 'ar' ? 'غير مصرح بالوصول إلى هذا السجل السريري.' : 'Unauthorized access to this clinical record.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: COLORS.background }]} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerCard, isRTL && styles.rtlContainer]}>
        <Text style={[styles.headerTitle, isRTL && styles.rtlText, { color: COLORS.primary }]}>
          {language === 'ar' ? 'مراجعة الحالة السريرية' : 'Clinical Case Review'}
        </Text>
        <Text style={[styles.headerSubtitle, isRTL && styles.rtlText, { color: COLORS.textLight }]}>
          {language === 'ar' ? 'مراجعة الإحالة الواردة من الفرز التمريضي' : 'Review incoming case from nurse triage'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: isPaymentPending ? COLORS.whatsapp : COLORS.secondary }]}>
          <Text style={styles.statusText}>
            {isPaymentPending 
              ? (language === 'ar' ? 'في انتظار الدفع' : 'AWAITING_PAYMENT') 
              : (language === 'ar' ? 'قيد المراجعة' : 'UNDER_REVIEW')}
          </Text>
        </View>
      </View>

      <View style={[styles.triageCard, isRTL && styles.rtlContainer]}>
        <Text style={[styles.cardTitle, isRTL && styles.rtlText, { color: COLORS.primary }]}>
          {language === 'ar' ? 'ملاحظات الفرز التمريضي' : 'Nurse Triage Notes'}
        </Text>
        <Text style={[styles.triageText, isRTL && styles.rtlText, { color: COLORS.textDark }]}>
          {caseData.triageNotes || (language === 'ar' ? 'لا توجد ملاحظات فرز متاحة.' : 'No triage notes available.')}
        </Text>
      </View>

      {!isPaymentPending && (
        <>
          <DoctorFocusQuestionsSection
            isRTL={isRTL}
            language={language}
            answers={clinicalAnswers}
            onAnswersChange={setClinicalAnswers}
            disabled={isSubmitting}
          />

          <View style={[styles.sectionContainer, isRTL && styles.rtlContainer]}>
            <Text style={[styles.sectionTitle, isRTL && styles.rtlText, { color: COLORS.primary }]}>
              {language === 'ar' ? 'اختيار صيغة الاستشارة' : 'Select Consultation Format'}
            </Text>

            <TouchableOpacity
              style={[
                styles.tierCard,
                selectedTier === 'TIER_1_WRITTEN' && styles.tierCardSelected,
                isRTL && styles.rtlContainer
              ]}
              onPress={() => !isSubmitting && setSelectedTier('TIER_1_WRITTEN')}
              disabled={isSubmitting}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedTier === 'TIER_1_WRITTEN' }}
              accessibilityLabel={language === 'ar' ? TIER_PRICING.TIER_1_WRITTEN.labelAr : TIER_PRICING.TIER_1_WRITTEN.labelEn}
            >
              <View style={styles.tierHeader}>
                <Text style={[styles.tierTitle, isRTL && styles.rtlText, { color: COLORS.textDark }]}>
                  {language === 'ar' ? TIER_PRICING.TIER_1_WRITTEN.labelAr : TIER_PRICING.TIER_1_WRITTEN.labelEn}
                </Text>
                <View style={[styles.radioOuter, selectedTier === 'TIER_1_WRITTEN' && { borderColor: COLORS.primary }]}>
                  {selectedTier === 'TIER_1_WRITTEN' && <View style={[styles.radioInner, { backgroundColor: COLORS.primary }]} />}
                </View>
              </View>
              <Text style={[styles.tierPrice, isRTL && styles.rtlText, { color: COLORS.primary }]}>
                {TIER_PRICING.TIER_1_WRITTEN.total.toFixed(2)} SAR
              </Text>
              <Text style={[styles.tierVat, isRTL && styles.rtlText, { color: COLORS.textLight }]}>
                {language === 'ar' 
                  ? `(يشمل ضريبة القيمة المضافة ١٥٪ - الأساس: ${TIER_PRICING.TIER_1_WRITTEN.base.toFixed(2)} ريال)` 
                  : `(Includes 15% VAT - Base: ${TIER_PRICING.TIER_1_WRITTEN.base.toFixed(2)} SAR)`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tierCard,
                selectedTier === 'TIER_2_VIDEO' && styles.tierCardSelected,
                isRTL && styles.rtlContainer
              ]}
              onPress={() => !isSubmitting && setSelectedTier('TIER_2_VIDEO')}
              disabled={isSubmitting}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedTier === 'TIER_2_VIDEO' }}
              accessibilityLabel={language === 'ar' ? TIER_PRICING.TIER_2_VIDEO.labelAr : TIER_PRICING.TIER_2_VIDEO.labelEn}
            >
              <View style={styles.tierHeader}>
                <Text style={[styles.tierTitle, isRTL && styles.rtlText, { color: COLORS.textDark }]}>
                  {language === 'ar' ? TIER_PRICING.TIER_2_VIDEO.labelAr : TIER_PRICING.TIER_2_VIDEO.labelEn}
                </Text>
                <View style={[styles.radioOuter, selectedTier === 'TIER_2_VIDEO' && { borderColor: COLORS.primary }]}>
                  {selectedTier === 'TIER_2_VIDEO' && <View style={[styles.radioInner, { backgroundColor: COLORS.primary }]} />}
                </View>
              </View>
              <Text style={[styles.tierPrice, isRTL && styles.rtlText, { color: COLORS.primary }]}>
                {TIER_PRICING.TIER_2_VIDEO.total.toFixed(2)} SAR
              </Text>
              <Text style={[styles.tierVat, isRTL && styles.rtlText, { color: COLORS.textLight }]}>
                {language === 'ar' ? '(معفى من ضريبة القيمة المضافة)' : '(VAT Exempt)'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.endorseButton,
              (!isFormValid || isSubmitting) && styles.endorseButtonDisabled,
              isRTL && styles.rtlContainer
            ]}
            onPress={handleEndorseReferral}
            disabled={!isFormValid || isSubmitting}
            accessibilityRole="button"
            accessibilityLabel={language === 'ar' ? 'اعتماد الإحالة وطلب الدفع' : 'Endorse Referral & Request Payment'}
            accessibilityHint={language === 'ar' ? 'ينقل الحالة إلى مرحلة انتظار الدفع' : 'Advances case to awaiting payment stage'}
          >
            <Text style={styles.endorseButtonText}>
              {isSubmitting 
                ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...') 
                : (language === 'ar' ? 'اعتماد الإحالة وطلب الدفع (D10)' : 'Endorse Referral & Request Payment (D10)')}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {isPaymentPending && caseData.zatcaMetadata && (
        <View style={[styles.invoiceCard, isRTL && styles.rtlContainer]}>
          <Text style={[styles.cardTitle, isRTL && styles.rtlText, { color: COLORS.primary }]}>
            {language === 'ar' ? 'بيانات فاتورة هيئة الزكاة والضريبة والجمارك' : 'ZATCA Invoice Metadata'}
          </Text>
          <View style={styles.invoiceRow}>
            <Text style={[styles.invoiceLabel, isRTL && styles.rtlText]}>{language === 'ar' ? 'رقم الفاتورة:' : 'Invoice No:'}</Text>
            <Text style={[styles.invoiceValue, isRTL && styles.rtlText]}>{caseData.zatcaMetadata.invoiceNumber}</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={[styles.invoiceLabel, isRTL && styles.rtlText]}>{language === 'ar' ? 'التاريخ (توقيت السعودية):' : 'Date (AST):'}</Text>
            <Text style={[styles.invoiceValue, isRTL && styles.rtlText]}>{caseData.zatcaMetadata.issueDate}</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={[styles.invoiceLabel, isRTL && styles.rtlText]}>{language === 'ar' ? 'الإجمالي مع الضريبة:' : 'Total w/ VAT:'}</Text>
            <Text style={[styles.invoiceValue, isRTL && styles.rtlText, { color: COLORS.primary, fontWeight: '700' }]}>
              {caseData.zatcaMetadata.totalWithVat.toFixed(2)} {caseData.zatcaMetadata.currency}
            </Text>
          </View>
        </View>
      )}

      {caseData.milestones.length > 0 && (
        <View style={[styles.sectionContainer, isRTL && styles.rtlContainer]}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText, { color: COLORS.primary }]}>
            {language === 'ar' ? 'سجل الأحداث' : 'Milestone Events'}
          </Text>
          {caseData.milestones.map((milestone, index) => (
            <View key={`${milestone.code}-${index}`} style={[styles.milestoneItem, { borderRightColor: isRTL ? COLORS.secondary : 'transparent', borderLeftColor: !isRTL ? COLORS.secondary : 'transparent' }]}>
              <Text style={[styles.milestoneCode, { color: COLORS.primary }]}>{milestone.code}</Text>
              <Text style={[styles.milestoneDesc, isRTL && styles.rtlText, { color: COLORS.textDark }]}>
                {language === 'ar' ? milestone.descriptionAr : milestone.descriptionEn}
              </Text>
              <Text style={[styles.milestoneTime, isRTL && styles.rtlText, { color: COLORS.textLight }]}>
                {milestone.timestamp}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  rtlContainer: {
    direction: 'rtl',
  },
  rtlText: {
    writingDirection: 'rtl',
    textAlign: 'right',
    fontFamily: 'Cairo-Regular',
  },
  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Cairo-SemiBold',
  },
  triageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Cairo-Bold',
    marginBottom: 12,
  },
  triageText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Cairo-Regular',
  },
  sectionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Cairo-Bold',
    marginBottom: 16,
  },
  mandatoryNotice: {
    fontSize: 12,
    fontFamily: 'Cairo-Medium',
    marginBottom: 16,
  },
  questionBlock: {
    marginBottom: 20,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    minHeight: 100,
    backgroundColor: COLORS.white,
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  tierCard: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: COLORS.white,
  },
  tierCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Cairo-SemiBold',
    flex: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tierPrice: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  tierVat: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
  },
  endorseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  endorseButtonDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  endorseButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Cairo-Bold',
  },
  invoiceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderLeftWidth: 4,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  invoiceLabel: {
    fontSize: 14,
    fontFamily: 'Cairo-Medium',
    color: COLORS.textLight,
  },
  invoiceValue: {
    fontSize: 14,
    fontFamily: 'Cairo-SemiBold',
    color: COLORS.textDark,
  },
  milestoneItem: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginBottom: 16,
    paddingVertical: 4,
  },
  milestoneCode: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  milestoneDesc: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    marginBottom: 2,
  },
  milestoneTime: {
    fontSize: 11,
    fontFamily: 'Cairo-Light',
  },
  accessDenied: {
    fontSize: 16,
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'center',
  }
});

export default DoctorReviewView;