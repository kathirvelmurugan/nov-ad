import { useState, useCallback } from 'react';

export type WorkflowStage =
  | 'INTAKE'
  | 'TRIAGE'
  | 'AWAITING_PAYMENT'
  | 'PAYMENT_VERIFIED'
  | 'WITH_CONSULTANT'
  | 'COMPLETED';

export interface PaymentDetails {
  amount: number;
  currency: string;
  method: string;
  transactionReference: string;
}

export interface ActiveCase {
  caseId: string;
  patientId: string;
  stage: WorkflowStage;
  isPaid: boolean;
  isVerified: boolean;
  verifiedBy?: string;
  consultantToken?: string;
  tokenExpiresAt?: string;
  locale: 'ar' | 'en';
}

interface ApiClient {
  saveCase: (caseData: ActiveCase) => Promise<{ success: boolean; data: ActiveCase }>;
  payCase: (caseId: string, paymentDetails: PaymentDetails) => Promise<{ status: number; data: ActiveCase }>;
  verifyPayment: (caseId: string) => Promise<{ success: boolean; data: ActiveCase; consultantToken: string; tokenExpiresAt: string }>;
}

interface UseWorkflowStageTransitionsProps {
  activeCase: ActiveCase | null;
  apiClient: ApiClient;
  onCaseUpdate: (updatedCase: ActiveCase) => void;
  onAlert: (message: string, type: 'error' | 'success' | 'info') => void;
}

const isCasePaid = (c: ActiveCase): boolean => c.isPaid === true;
const isCaseVerified = (c: ActiveCase): boolean => c.isVerified === true && c.verifiedBy === 'C04';

const generate72hExpiry = (): string => {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 72);
  return expiryDate.toISOString();
};

export function useWorkflowStageTransitions({
  activeCase,
  apiClient,
  onCaseUpdate,
  onAlert,
}: UseWorkflowStageTransitionsProps) {
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const getBilingualMessage = useCallback((ar: string, en: string): string => {
    if (!activeCase) return en;
    return activeCase.locale === 'ar' ? ar : en;
  }, [activeCase]);

  const handleAdvanceStage = useCallback(async (targetStage: WorkflowStage) => {
    if (!activeCase || isTransitioning) return;

    setIsTransitioning(true);

    try {
      if (targetStage === 'WITH_CONSULTANT') {
        if (!isCasePaid(activeCase) || !isCaseVerified(activeCase)) {
          const alertMsgAr = "يجب تحقق منسق رعاية ألو من السداد أولاً قبل الانتقال للاستشاري الدولي.";
          const alertMsgEn = "ALO Coordinator must verify payment before connecting to the International Consultant.";
          
          const finalAlertMsg = getBilingualMessage(alertMsgAr, alertMsgEn);
          onAlert(finalAlertMsg, 'error');
          setIsTransitioning(false);
          return;
        }
      }

      const updatedCase: ActiveCase = {
        ...activeCase,
        stage: targetStage,
      };

      const response = await apiClient.saveCase(updatedCase);

      if (response.success) {
        onCaseUpdate(response.data);
        
        const successMsgAr = "تم تحديث مرحلة الحالة بنجاح.";
        const successMsgEn = "Case stage updated successfully.";
        onAlert(getBilingualMessage(successMsgAr, successMsgEn), 'success');
      } else {
        throw new Error('Backend persistence failed');
      }
    } catch (error) {
      const errorMsgAr = "حدث خطأ أثناء تحديث مرحلة الحالة. يرجى المحاولة مرة أخرى.";
      const errorMsgEn = "An error occurred while updating the case stage. Please try again.";
      onAlert(getBilingualMessage(errorMsgAr, errorMsgEn), 'error');
    } finally {
      setIsTransitioning(false);
    }
  }, [activeCase, isTransitioning, apiClient, onCaseUpdate, onAlert, getBilingualMessage]);

  const handleCompletePatientPayment = useCallback(async (paymentDetails: PaymentDetails) => {
    if (!activeCase || isTransitioning) return;

    setIsTransitioning(true);

    try {
      const response = await apiClient.payCase(activeCase.caseId, paymentDetails);

      if (response.status === 200) {
        const paidCase: ActiveCase = {
          ...response.data,
          isPaid: true,
          stage: 'PAYMENT_VERIFIED',
        };
        
        onCaseUpdate(paidCase);

        const successMsgAr = "تم إتمام عملية السداد بنجاح.";
        const successMsgEn = "Payment completed successfully.";
        onAlert(getBilingualMessage(successMsgAr, successMsgEn), 'success');
      } else {
        throw new Error(`Payment API returned status ${response.status}`);
      }
    } catch (error) {
      const errorMsgAr = "فشل في معالجة السداد. يرجى التحقق من بيانات الدفع.";
      const errorMsgEn = "Failed to process payment. Please verify payment details.";
      onAlert(getBilingualMessage(errorMsgAr, errorMsgEn), 'error');
    } finally {
      setIsTransitioning(false);
    }
  }, [activeCase, isTransitioning, apiClient, onCaseUpdate, onAlert, getBilingualMessage]);

  const handleVerifyPaymentAndDispatch = useCallback(async () => {
    if (!activeCase || isTransitioning) return;

    setIsTransitioning(true);

    try {
      const verificationResponse = await apiClient.verifyPayment(activeCase.caseId);

      if (!verificationResponse.success) {
        throw new Error('Payment verification failed at backend');
      }

      const tokenExpiresAt = generate72hExpiry();
      
      const dispatchedCase: ActiveCase = {
        ...activeCase,
        isVerified: true,
        verifiedBy: 'C04',
        consultantToken: verificationResponse.consultantToken,
        tokenExpiresAt: tokenExpiresAt,
        stage: 'WITH_CONSULTANT',
      };

      const persistenceResponse = await apiClient.saveCase(dispatchedCase);

      if (persistenceResponse.success) {
        onCaseUpdate(persistenceResponse.data);

        const successMsgAr = "تم التحقق من السداد بواسطة المنسق وتحويل الحالة للاستشاري الدولي.";
        const successMsgEn = "Payment verified by Coordinator and case dispatched to International Consultant.";
        onAlert(getBilingualMessage(successMsgAr, successMsgEn), 'success');
      } else {
        throw new Error('Failed to persist dispatched case state');
      }
    } catch (error) {
      const errorMsgAr = "فشل في التحقق من السداد أو تحويل الحالة. يرجى التواصل مع الدعم الفني.";
      const errorMsgEn = "Failed to verify payment or dispatch case. Please contact technical support.";
      onAlert(getBilingualMessage(errorMsgAr, errorMsgEn), 'error');
    } finally {
      setIsTransitioning(false);
    }
  }, [activeCase, isTransitioning, apiClient, onCaseUpdate, onAlert, getBilingualMessage]);

  return {
    handleAdvanceStage,
    handleCompletePatientPayment,
    handleVerifyPaymentAndDispatch,
    isTransitioning,
  };
}