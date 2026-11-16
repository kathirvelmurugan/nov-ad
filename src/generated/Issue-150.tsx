import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image, Platform, I18nManager } from 'react-native';

const COLORS = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textMuted: '#666666',
  border: '#D1E8E5',
  error: '#D32F2F'
};

type PaymentMethod = 'mada' | 'apple_pay' | 'credit_card' | 'tabby';
type PersonaId = string;

interface PricingSummary {
  baseAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
}

interface InvoiceData {
  invoiceNumber: string;
  transactionReference: string;
  timestamp: string;
  qrCodeBase64: string;
  sellerName: string;
  buyerName: string;
}

interface PaymentCheckoutViewProps {
  caseId: string;
  personaId: PersonaId;
  pricing: PricingSummary;
  patientName: string;
  apiClient: any;
  onPaymentSuccess?: (invoice: InvoiceData) => void;
  onBack?: () => void;
}

const isRTL = I18nManager.isRTL;

const formatCurrency = (amount: number, currency: string = 'SAR'): string => {
  return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const generateZatcaQR = (invoice: InvoiceData): string => {
  const tlvs = [
    { tag: 1, value: invoice.sellerName },
    { tag: 2, value: '310123456700003' },
    { tag: 3, value: invoice.timestamp },
    { tag: 4, value: invoice.totalAmount.toString() },
    { tag: 5, value: invoice.vatAmount.toString() }
  ];
  
  let hexString = '';
  tlvs.forEach(tlv => {
    const valBytes = Buffer.from(tlv.value, 'utf-8');
    hexString += tlv.tag.toString(16).padStart(2, '0');
    hexString += valBytes.length.toString(16).padStart(2, '0');
    hexString += valBytes.toString('hex');
  });
  
  return Buffer.from(hexString, 'hex').toString('base64');
};

export const PaymentCheckoutView: React.FC<PaymentCheckoutViewProps> = ({
  caseId,
  personaId,
  pricing,
  patientName,
  apiClient,
  onPaymentSuccess,
  onBack
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mada');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [pricingPaid, setPricingPaid] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paymentMethods: { id: PaymentMethod; labelAr: string; labelEn: string; icon: string; disabled?: boolean }[] = useMemo(() => [
    { id: 'mada', labelAr: 'مدى', labelEn: 'Mada', icon: '💳' },
    { id: 'apple_pay', labelAr: 'أبل باي', labelEn: 'Apple Pay', icon: '🍏', disabled: Platform.OS !== 'ios' },
    { id: 'credit_card', labelAr: 'بطاقة ائتمان', labelEn: 'Credit Card', icon: '💳' },
    { id: 'tabby', labelAr: 'تابي (4 دفعات)', labelEn: 'Tabby (4 installments)', icon: '🛍️' }
  ], []);

  const handleCompletePatientPayment = useCallback(async () => {
    if (isProcessing || pricingPaid) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const paymentPayload = {
        caseId,
        method: selectedMethod,
        amount: pricing.totalAmount,
        currency: pricing.currency || 'SAR',
        timestamp: new Date().toISOString(),
        metadata: {
          personaId,
          platform: Platform.OS,
          zatcaCompliant: true
        }
      };

      const response = await apiClient.payCase(caseId, paymentPayload);

      const generatedInvoice: InvoiceData = {
        invoiceNumber: `ALO-${caseId}-${Date.now()}`,
        transactionReference: response?.transactionRef || `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        qrCodeBase64: '',
        sellerName: 'ALO DOCTOR Medical Services',
        buyerName: patientName
      };

      generatedInvoice.qrCodeBase64 = generateZatcaQR({
        ...generatedInvoice,
        totalAmount: pricing.totalAmount,
        vatAmount: pricing.vatAmount
      } as any);

      setPricingPaid(true);
      setPaymentVerified(false);
      setInvoiceData(generatedInvoice);

      if (onPaymentSuccess) {
        onPaymentSuccess(generatedInvoice);
      }
    } catch (err: any) {
      setError(err?.message || (isRTL ? 'فشل في معالجة الدفع. يرجى المحاولة مرة أخرى.' : 'Payment processing failed. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  }, [apiClient, caseId, isProcessing, onPaymentSuccess, patientName, personaId, pricing, pricingPaid, selectedMethod]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel={isRTL ? 'رجوع' : 'Go back'}>
          <Text style={styles.backButtonText}>{isRTL ? '→' : '←'}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>
        {isRTL ? 'إتمام الدفع' : 'Complete Payment'}
      </Text>
      <Text style={styles.headerSubtitle}>
        {isRTL ? 'حالة رقم' : 'Case No.'} {caseId}
      </Text>
    </View>
  );

  const renderZatcaInvoiceSummary = () => (
    <View style={styles.invoiceCard}>
      <Text style={styles.sectionTitle}>
        {isRTL ? 'ملخص الفاتورة الضريبية (ZATCA)' : 'Tax Invoice Summary (ZATCA)'}
      </Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{isRTL ? 'المبلغ الأساسي' : 'Base Amount'}</Text>
        <Text style={styles.summaryValue}>{formatCurrency(pricing.baseAmount, pricing.currency)}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{isRTL ? `ضريبة القيمة المضافة (${pricing.vatRate * 100}%)` : `VAT (${pricing.vatRate * 100}%)`}</Text>
        <Text style={styles.summaryValue}>{formatCurrency(pricing.vatAmount, pricing.currency)}</Text>
      </View>
      
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>{isRTL ? 'الإجمالي' : 'Total'}</Text>
        <Text style={styles.totalValue}>{formatCurrency(pricing.totalAmount, pricing.currency)}</Text>
      </View>
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={styles.methodsContainer}>
      <Text style={styles.sectionTitle}>
        {isRTL ? 'طريقة الدفع' : 'Payment Method'}
      </Text>
      
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodCard,
            selectedMethod === method.id && styles.methodCardSelected,
            method.disabled && styles.methodCardDisabled
          ]}
          onPress={() => !method.disabled && setSelectedMethod(method.id)}
          disabled={method.disabled || pricingPaid}
          accessibilityRole="radio"
          accessibilityState={{ selected: selectedMethod === method.id, disabled: method.disabled }}
          accessibilityLabel={isRTL ? method.labelAr : method.labelEn}
        >
          <View style={styles.methodIconContainer}>
            <Text style={styles.methodIcon}>{method.icon}</Text>
          </View>
          <View style={styles.methodInfo}>
            <Text style={[styles.methodLabel, selectedMethod === method.id && styles.methodLabelSelected]}>
              {isRTL ? method.labelAr : method.labelEn}
            </Text>
            {method.id === 'tabby' && (
              <Text style={styles.methodSubtext}>
                {isRTL ? 'بدون فوائد - 4 دفعات' : 'Interest-free - 4 payments'}
              </Text>
            )}
          </View>
          <View style={[
            styles.radioOuter,
            selectedMethod === method.id && styles.radioOuterSelected
          ]}>
            {selectedMethod === method.id && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPayButton = () => (
    <View style={styles.actionContainer}>
      {error && (
        <View style={styles.errorContainer} accessibilityRole="alert">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {!pricingPaid ? (
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handleCompletePatientPayment}
          disabled={isProcessing}
          accessibilityRole="button"
          accessibilityLabel={isRTL ? 'سداد الآن' : 'Pay Now'}
          accessibilityState={{ busy: isProcessing }}
        >
          {isProcessing ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.payButtonText}>
              {isRTL ? 'سداد الآن' : 'Pay Now'}
            </Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successText}>
            {isRTL ? 'تم استلام الدفعة بنجاح' : 'Payment received successfully'}
          </Text>
          <Text style={styles.pendingVerificationText}>
            {isRTL ? 'في انتظار التحقق من منسق ALO' : 'Awaiting ALO Coordinator reconciliation'}
          </Text>
        </View>
      )}
    </View>
  );

  const renderInvoiceStamp = () => {
    if (!pricingPaid || !invoiceData) return null;

    return (
      <View style={styles.invoiceStampContainer}>
        <View style={styles.stampBorder}>
          <Text style={styles.stampTitle}>
            {isRTL ? 'فاتورة ضريبية مبسطة' : 'Simplified Tax Invoice'}
          </Text>
          
          <View style={styles.stampDivider} />
          
          <View style={styles.invoiceDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{isRTL ? 'رقم الفاتورة:' : 'Invoice No:'}</Text>
              <Text style={styles.detailValue}>{invoiceData.invoiceNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{isRTL ? 'المرجع:' : 'Reference:'}</Text>
              <Text style={styles.detailValue}>{invoiceData.transactionReference}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{isRTL ? 'التاريخ:' : 'Date:'}</Text>
              <Text style={styles.detailValue}>{new Date(invoiceData.timestamp).toLocaleString(isRTL ? 'ar-SA' : 'en-US')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{isRTL ? 'المريض:' : 'Patient:'}</Text>
              <Text style={styles.detailValue}>{invoiceData.buyerName}</Text>
            </View>
          </View>

          <View style={styles.stampDivider} />

          <View style={styles.verificationBadge}>
            <Text style={styles.verificationText}>
              {isRTL ? 'الدفع مسجل - بانتظار التحقق' : 'Payment Recorded - Pending Verification'}
            </Text>
            <Text style={styles.verificationStatus}>
              paymentVerified: {paymentVerified ? 'true' : 'false'}
            </Text>
          </View>

          {invoiceData.qrCodeBase64 && (
            <View style={styles.qrContainer}>
              <Text style={styles.qrLabel}>ZATCA QR Code</Text>
              <Image 
                source={{ uri: `data:image/png;base64,${invoiceData.qrCodeBase64}` }}
                style={styles.qrImage}
                accessibilityLabel={isRTL ? 'رمز الاستجابة السريعة للفاتورة' : 'Invoice QR Code'}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {renderHeader()}
      {renderZatcaInvoiceSummary()}
      {!pricingPaid && renderPaymentMethods()}
      {renderPayButton()}
      {renderInvoiceStamp()}
      
      <View style={styles.footerSpacer} />
    </ScrollView>
  );
};

export const PatientPaymentGateCard: React.FC<{
  caseId: string;
  personaId: PersonaId;
  pricing: PricingSummary;
  patientName: string;
  apiClient: any;
  onNavigateToCheckout: () => void;
}> = ({ caseId, personaId, pricing, patientName, apiClient, onNavigateToCheckout }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={gateStyles.card}>
      <TouchableOpacity 
        style={gateStyles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        accessibilityRole="button"
        accessibilityLabel={isRTL ? 'توسيع تفاصيل الدفع' : 'Expand payment details'}
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={gateStyles.titleContainer}>
          <Text style={gateStyles.icon}>💰</Text>
          <Text style={gateStyles.title}>
            {isRTL ? 'بوابة الدفع' : 'Payment Gate'}
          </Text>
        </View>
        <Text style={gateStyles.amount}>
          {formatCurrency(pricing.totalAmount, pricing.currency)}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={gateStyles.body}>
          <View style={gateStyles.infoRow}>
            <Text style={gateStyles.infoLabel}>{isRTL ? 'الحالة:' : 'Case:'}</Text>
            <Text style={gateStyles.infoValue}>{caseId}</Text>
          </View>
          <View style={gateStyles.infoRow}>
            <Text style={gateStyles.infoLabel}>{isRTL ? 'المريض:' : 'Patient:'}</Text>
            <Text style={gateStyles.infoValue}>{patientName}</Text>
          </View>
          <View style={gateStyles.infoRow}>
            <Text style={gateStyles.infoLabel}>{isRTL ? 'الأساس:' : 'Base:'}</Text>
            <Text style={gateStyles.infoValue}>{formatCurrency(pricing.baseAmount, pricing.currency)}</Text>
          </View>
          <View style={gateStyles.infoRow}>
            <Text style={gateStyles.infoLabel}>{isRTL ? 'الضريبة:' : 'VAT:'}</Text>
            <Text style={gateStyles.infoValue}>{formatCurrency(pricing.vatAmount, pricing.currency)}</Text>
          </View>

          <TouchableOpacity
            style={gateStyles.proceedButton}
            onPress={onNavigateToCheckout}
            accessibilityRole="button"
            accessibilityLabel={isRTL ? 'المتابعة للدفع' : 'Proceed to checkout'}
          >
            <Text style={gateStyles.proceedButtonText}>
              {isRTL ? 'المتابعة للدفع الآمن' : 'Proceed to Secure Checkout'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    direction: isRTL ? 'rtl' : 'ltr'
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 20
  },
  backButton: {
    position: 'absolute',
    [isRTL ? 'right' : 'left']: 16,
    top: Platform.OS === 'ios' ? 60 : 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  backButtonText: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '600'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'Cairo-Bold',
    textAlign: 'center'
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center'
  },
  invoiceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
    fontFamily: 'Cairo-Bold'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: 'Cairo-Regular'
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.textDark,
    fontFamily: 'Cairo-SemiBold',
    fontWeight: '600'
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: 12,
    marginTop: 4
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'Cairo-Bold'
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    fontFamily: 'Cairo-ExtraBold'
  },
  methodsContainer: {
    marginBottom: 24
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  methodCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.background
  },
  methodCardDisabled: {
    opacity: 0.5
  },
  methodIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isRTL ? 0 : 12,
    marginLeft: isRTL ? 12 : 0
  },
  methodIcon: {
    fontSize: 22
  },
  methodInfo: {
    flex: 1
  },
  methodLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    fontFamily: 'Cairo-SemiBold'
  },
  methodLabelSelected: {
    color: COLORS.primary
  },
  methodSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    fontFamily: 'Cairo-Regular'
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioOuterSelected: {
    borderColor: COLORS.secondary
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.secondary
  },
  actionContainer: {
    marginBottom: 24
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6
  },
  payButtonDisabled: {
    opacity: 0.7
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Cairo-Bold'
  },
  errorContainer: {
    backgroundColor: '#FDECEA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.error
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center'
  },
  successContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary
  },
  successIcon: {
    fontSize: 48,
    color: COLORS.whatsapp,
    marginBottom: 12,
    fontWeight: '700'
  },
  successText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'Cairo-Bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  pendingVerificationText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center'
  },
  invoiceStampContainer: {
    marginTop: 8,
    alignItems: 'center'
  },
  stampBorder: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center'
  },
  stampTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    fontFamily: 'Cairo-ExtraBold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  stampDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '100%',
    marginVertical: 16
  },
  invoiceDetails: {
    width: '100%'
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: 'Cairo-Regular'
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.textDark,
    fontFamily: 'Cairo-SemiBold',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: isRTL ? 'left' : 'right'
  },
  verificationBadge: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16
  },
  verificationText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: 'Cairo-SemiBold',
    fontWeight: '600'
  },
  verificationStatus: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    marginTop: 4
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 8
  },
  qrLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 8,
    fontFamily: 'Cairo-Regular'
  },
  qrImage: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  footerSpacer: {
    height: 40
  }
});

const gateStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    fontSize: 20,
    marginRight: isRTL ? 0 : 8,
    marginLeft: isRTL ? 8 : 0
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'Cairo-Bold'
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'Cairo-ExtraBold'
  },
  body: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: 'Cairo-Regular'
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.textDark,
    fontFamily: 'Cairo-SemiBold',
    fontWeight: '600'
  },
  proceedButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16
  },
  proceedButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Cairo-Bold'
  }
});

export default PaymentCheckoutView;