import React from 'react';
import { PaymentMethodId } from '../../types';

export const TEAL_PRIMARY = '#007B6E';
export const TEAL_ACCENT = '#00C6AE';
export const TEAL_BG = '#E6FAF7';
export const WHATSAPP_GREEN = '#25D366';

export const ALL_PAYMENT_METHODS: Array<{ id: PaymentMethodId; labelEn: string; labelAr: string; descEn: string; descAr: string }> = [
  { id: 'mada', labelEn: 'mada', labelAr: 'مدى', descEn: 'Saudi Debit Network', descAr: 'شبكة المدفوعات السعودية' },
  { id: 'applepay', labelEn: 'Apple Pay', labelAr: 'Apple Pay', descEn: '1-Click Express', descAr: 'دفع فوري بنقرة واحدة' },
  { id: 'visa', labelEn: 'Visa / Mastercard', labelAr: 'فيزا / ماستركارد', descEn: 'Credit & Debit Cards', descAr: 'البطاقات الائتمانية' },
  { id: 'tabby', labelEn: 'Tabby (4 Installments)', labelAr: 'تابي (4 دفعات)', descEn: '0% Interest Split', descAr: 'تقسيط بدون فوائد' },
];

export const getPrimaryButtonStyle = (isProcessing = false, fontFamily: string): React.CSSProperties => ({
  backgroundColor: TEAL_PRIMARY,
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '12px',
  padding: '14px 28px',
  fontSize: '16px',
  fontWeight: 700,
  fontFamily,
  cursor: isProcessing ? 'not-allowed' : 'pointer',
  opacity: isProcessing ? 0.7 : 1,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  transition: 'all 0.2s ease',
  width: '100%',
  justifyContent: 'center',
});

export const getWhatsappButtonStyle = (isProcessing = false, fontFamily: string): React.CSSProperties => ({
  ...getPrimaryButtonStyle(isProcessing, fontFamily),
  backgroundColor: WHATSAPP_GREEN,
  marginTop: '12px',
});

export const getBadgeStyle = (variant: 'success' | 'info' | 'warning', fontFamily: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 14px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 700,
  fontFamily,
  backgroundColor: variant === 'success' ? '#D1FAE5' : variant === 'info' ? TEAL_BG : '#FEF3C7',
  color: variant === 'success' ? '#065F46' : variant === 'info' ? TEAL_PRIMARY : '#92400E',
  border: `1px solid ${variant === 'success' ? '#6EE7B7' : variant === 'info' ? TEAL_ACCENT : '#FCD34D'}`,
});
