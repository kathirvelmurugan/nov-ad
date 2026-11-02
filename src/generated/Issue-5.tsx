import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

export type Locale = 'ar' | 'en';

export const PERSONA_IDS = [
  'coordinator',
  'patient',
  'doctor',
  'nurse',
  'pharmacist',
  'lab',
  'radiology',
  'admin',
  'finance',
  'insurance',
  'support',
] as const;

export type PersonaId = typeof PERSONA_IDS[number];

export interface PersonaProfile {
  id: PersonaId;
  nameAr: string;
  nameEn: string;
}

export const PERSONAS: readonly PersonaProfile[] = [
  { id: 'coordinator', nameAr: 'منسق الرعاية', nameEn: 'Care Coordinator' },
  { id: 'patient', nameAr: 'المريض', nameEn: 'Patient' },
  { id: 'doctor', nameAr: 'الطبيب', nameEn: 'Doctor' },
  { id: 'nurse', nameAr: 'التمريض', nameEn: 'Nurse' },
  { id: 'pharmacist', nameAr: 'الصيدلي', nameEn: 'Pharmacist' },
  { id: 'lab', nameAr: 'المختبر', nameEn: 'Lab Specialist' },
  { id: 'radiology', nameAr: 'الأشعة', nameEn: 'Radiology Specialist' },
  { id: 'admin', nameAr: 'الإدارة', nameEn: 'Administrator' },
  { id: 'finance', nameAr: 'المالية', nameEn: 'Finance' },
  { id: 'insurance', nameAr: 'التأمين', nameEn: 'Insurance' },
  { id: 'support', nameAr: 'الدعم', nameEn: 'Support' },
];

export interface ServiceLine {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  unitPrice: number;
  qty: number;
}

export interface PaymentRequestModel {
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  coordinatorName: string;
  notes: string;
  lines: ServiceLine[];
}

export type PaymentMethod = 'mada' | 'applePay';
export type PaymentStage = 'request' | 'checkout' | 'processing' | 'success';

export interface PaymentAuthorization {
  method: PaymentMethod;
  transactionId: string;
  authCode: string;
  last4: string;
  walletToken: string;
  paidAt: string;
}

export interface ZatcaInvoiceLine {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  qty: number;
  unitPrice: number;
  taxableAmount: number;
  vatAmount: number;
  total: number;
}

export interface ZatcaInvoice {
  invoiceNumber: string;
  issueAt: string;
  paymentMethod: PaymentMethod;
  sellerName: string;
  sellerVatNumber: string;
  sellerAddress: string;
  buyerName: string;
  buyerPhone: string;
  appointmentId: string;
  lines: ZatcaInvoiceLine[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  qrBase64: string;
  authorization: PaymentAuthorization;
}

export interface PaymentCompletionResult {
  request: PaymentRequestModel;
  invoice: ZatcaInvoice;
  whatsAppUrl: string;
}

export interface Stage4PaymentSimulationProps {
  locale?: Locale;
  activePersona?: PersonaId;
  onPersonaChange?: (persona: PersonaId) => void;
  initialRequest?: Partial<PaymentRequestModel>;
  whatsappNumber?: string;
  sellerName?: string;
  sellerVatNumber?: string;
  sellerAddress?: string;
  onCompleted?: (result: PaymentCompletionResult) => void;
}

interface Labels {
  appTitle: string;
  stageTitle: string;
  persona: string;
  locale: string;
  requestHeading: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  coordinatorName: string;
  notes: string;
  serviceLines: string;
  item: string;
  qty: string;
  unitPrice: string;
  lineTotal: string;
  subtotal: string;
  vat15: string;
  total: string;
  createPaymentRequest: string;
  fillSample: string;
  checkoutHeading: string;
  paymentMethod: string;
  mada: string;
  applePay: string;
  payNow: string;
  processing: string;
  successHeading: string;
  invoiceHeading: string;
  invoiceNumber: string;
  issueAt: string;
  sellerName: string;
  sellerVatNumber: string;
  sellerAddress: string;
  buyerName: string;
  buyerPhone: string;
  paymentMethodLabel: string;
  zatcaQr: string;
  whatsappConfirmation: string;
  newPayment: string;
  copyInvoice: string;
  copied: string;
  errorRequired: string;
  errorPhone: string;
  linesEmpty: string;
  requestCreated: string;
  paymentApproved: string;
  whatsappHint: string;
  amountDue: string;
  coordinatorRequestNote: string;
  ariaPaymentStatus: string;
  switchPersona: string;
  switchLocale: string;
  invoiceSummary: string;
  authorization: string;
  transactionId: string;
  authCode: string;
  last4: string;
  paidAt: string;
  back: string;
  paymentRequest: string;
  status: string;
  lineVat: string;
  taxableAmount: string;
  totalWithVat: string;
}

const VAT_RATE = 0.15;

const DEFAULT_LINES: ServiceLine[] = [
  {
    id: 'consultation',
    code: 'DR-CONSULT',
    nameAr: 'كشف طبي',
    nameEn: 'Medical consultation',
    unitPrice: 180,
    qty: 1,
  },
  {
    id: 'lab-cbc',
    code: 'LAB-CBC',
    nameAr: 'تحليل دم شامل',
    nameEn: 'Complete blood count',
    unitPrice: 95,
    qty: 1,
  },
  {
    id: 'rx-medication',
    code: 'RX-MED',
    nameAr: 'وصفة دوائية',
    nameEn: 'Prescribed medication',
    unitPrice: 62.5,
    qty: 1,
  },
];

function getLabels(locale: Locale): Labels {
  if (locale === 'ar') {
    return {
      appTitle: 'ALO DOCTOR — المرحلة الرابعة',
      stageTitle: 'محاكاة الدفع وفاتورة ضريبة القيمة المضافة المتوافقة مع زاتكا',
      persona: 'الشخصية',
      locale: 'اللغة',
      requestHeading: 'طلب دفع منسق الرعاية',
      appointmentId: 'رقم الموعد',
      patientName: 'اسم المريض',
      patientPhone: 'رقم واتساب المريض',
      coordinatorName: 'اسم المنسق',
      notes: 'ملاحظات',
      serviceLines: 'الخدمات',
      item: 'البند',
      qty: 'الكمية',
      unitPrice: 'سعر الوحدة',
      lineTotal: 'إجمالي البند',
      subtotal: 'المجموع قبل الضريبة',
      vat15: 'ضريبة القيمة المضافة 15%',
      total: 'الإجمالي المستحق',
      createPaymentRequest: 'إنشاء طلب دفع المنسق',
      fillSample: 'تعبئة بيانات تجريبية',
      checkoutHeading: 'إتمام الدفع',
      paymentMethod: 'طريقة الدفع',
      mada: 'مدى',
      applePay: 'Apple Pay',
      payNow: 'ادفع الآن',
      processing: 'جارٍ معالجة الدفع…',
      successHeading: 'تم تأكيد الدفع',
      invoiceHeading: 'فاتورة ضريبية متوافقة مع زاتكا',
      invoiceNumber: 'رقم الفاتورة',
      issueAt: 'تاريخ الإصدار',
      sellerName: 'اسم البائع',
      sellerVatNumber: 'رقم التسجيل الضريبي',
      sellerAddress: 'عنوان البائع',
      buyerName: 'المريض / المشتري',
      buyerPhone: 'الهاتف',
      paymentMethodLabel: 'طريقة الدفع',
      zatcaQr: 'حمولة رمز الاستجابة السريعة (زاتكا)',
      whatsappConfirmation: 'تأكيد واتساب W06',
      newPayment: 'بدء دفعة جديدة',
      copyInvoice: 'نسخ ملخص الفاتورة',
      copied: 'تم النسخ',
      errorRequired: 'يرجى إدخال اسم المريض واختيار خدمة واحدة على الأقل.',
      errorPhone: 'يرجى إدخال رقم جوال سعودي صالح، مثال: 05XXXXXXXX.',
      linesEmpty: 'أضف خدمة واحدة على الأقل بكمية أكبر من صفر.',
      requestCreated: 'تم إنشاء طلب الدفع. اختر مدى أو Apple Pay.',
      paymentApproved: 'تمت الموافقة على الدفع وإنشاء فاتورة ضريبية.',
      whatsappHint: 'يفتح واتساب برسالة تأكيد W06 جاهزة للإرسال.',
      amountDue: 'المبلغ المستحق',
      coordinatorRequestNote: 'يمكن للمنسق إرسال طلب الدفع للمريض. هذه محاكاة ولا يتم خصم فعلي.',
      ariaPaymentStatus: 'حالة الدفع',
      switchPersona: 'تبديل الشخصية',
      switchLocale: 'تبديل اللغة',
      invoiceSummary: 'ملخص الفاتورة',
      authorization: 'الاعتماد',
      transactionId: 'رقم العملية',
      authCode: 'رمز التفويض',
      last4: 'آخر أربعة أرقام',
      paidAt: 'وقت الدفع',
      back: 'العودة إلى الطلب',
      paymentRequest: 'طلب الدفع',
      status: 'الحالة',
      lineVat: 'ضريبة البند',
      taxableAmount: 'المبلغ الخاضع للضريبة',
      totalWithVat: 'الإجمالي شامل الضريبة',
    };
  }

  return {
    appTitle: 'ALO DOCTOR — Stage 4',
    stageTitle: 'Payment simulation and ZATCA-compliant VAT invoice',
    persona: 'Persona',
    locale: 'Language',
    requestHeading: 'Coordinator payment request',
    appointmentId: 'Appointment ID',
    patientName: 'Patient name',
    patientPhone: 'Patient WhatsApp number',
    coordinatorName: 'Coordinator name',
    notes: 'Notes',
    serviceLines: 'Services',
    item: 'Item',
    qty: 'Quantity',
    unitPrice: 'Unit price',
    lineTotal: 'Line total',
    subtotal: 'Subtotal',
    vat15: 'VAT 15%',
    total: 'Total due',
    createPaymentRequest: 'Create coordinator payment request',
    fillSample: 'Fill sample patient',
    checkoutHeading: 'Checkout',
    paymentMethod: 'Payment method',
    mada: 'mada',
    applePay: 'Apple Pay',
    payNow: 'Pay now',
    processing: 'Processing payment…',
    successHeading: 'Payment confirmed',
    invoiceHeading: 'ZATCA-compliant VAT invoice',
    invoiceNumber: 'Invoice number',
    issueAt: 'Issue date',
    sellerName: 'Seller name',
    sellerVatNumber: 'VAT registration number',
    sellerAddress: 'Seller address',
    buyerName: 'Patient / buyer',
    buyerPhone: 'Phone',
    paymentMethodLabel: 'Payment method',
    zatcaQr: 'ZATCA QR payload',
    whatsappConfirmation: 'WhatsApp W06 confirmation',
    newPayment: 'Start new payment',
    copyInvoice: 'Copy invoice summary',
    copied: 'Copied',
    errorRequired: 'Enter the patient name and select at least one service.',
    errorPhone: 'Enter a valid Saudi mobile number, e.g. 05XXXXXXXX.',
    linesEmpty: 'Add at least one service with a quantity greater than zero.',
    requestCreated: 'Payment request created. Choose Mada or Apple Pay.',
    paymentApproved: 'Payment approved and VAT invoice generated.',
    whatsappHint: 'Opens WhatsApp with a ready-to-send W06 confirmation message.',
    amountDue: 'Amount due',
    coordinatorRequestNote: 'The coordinator can send the payment request to the patient. Simulation only; no real charge.',
    ariaPaymentStatus: 'Payment status',
    switchPersona: 'Switch persona',
    switchLocale: 'Switch language',
    invoiceSummary: 'Invoice summary',
    authorization: 'Authorization',
    transactionId: 'Transaction ID',
    authCode: 'Authorization code',
    last4: 'Last four digits',
    paidAt: 'Paid at',
    back: 'Back to request',
    paymentRequest: 'Payment request',
    status: 'Status',
    lineVat: 'Line VAT',
    taxableAmount: 'Taxable amount',
    totalWithVat: 'Total with VAT',
  };
}

export function round2(value: number): number {
  const safe = Number.isFinite(value) ? value : 0;
  return Math.round((safe + Number.EPSILON) * 100) / 100;
}

export function calculateTotals(lines: ServiceLine[]) {
  const subtotal = round2(
    lines.reduce((sum, line) => {
      const qty = Math.max(0, Math.floor(Number(line.qty) || 0));
      const unitPrice = Math.max(0, Number(line.unitPrice) || 0);
      return sum + qty * unitPrice;
    }, 0),
  );

  const vatAmount = round2(subtotal * VAT_RATE);
  const total = round2(subtotal + vatAmount);

  return { subtotal, vatAmount, total };
}

export function normalizeSaudiPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  let cleaned = digits;

  if (cleaned.startsWith('00966')) {
    cleaned = cleaned.slice(2);
  }

  if (cleaned.startsWith('966')) {
    return /^9665\d{8}$/.test(cleaned) ? cleaned : '';
  }

  if (cleaned.startsWith('05') && cleaned.length === 10) {
    return `966${cleaned.slice(1)}`;
  }

  if (cleaned.startsWith('5') && cleaned.length === 9) {
    return `966${cleaned}`;
  }

  return '';
}

export function formatCurrency(value: number, locale: Locale): string {
  const safe = Number.isFinite(value) ? value : 0;

  try {
    const loc = locale === 'ar' ? 'ar-SA-u-nu-latn' : 'en-SA-u-nu-latn';
    return new Intl.NumberFormat(loc, {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(round2(safe));
  } catch {
    return `${round2(safe).toFixed(2)} SAR`;
  }
}

export function formatDateTime(locale: Locale, iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  try {
    const loc = locale === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB-u-ca-gregory-nu-latn';
    return new Intl.DateTimeFormat(loc, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return iso;
  }
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, '0');
  return `INV-${ymd}-${random}`;
}

export function generateTransactionId(): string {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0');
  return `TX-${time}-${random}`;
}

function truncateToBytes(value: string, maxBytes = 255): string {
  const encoder = new TextEncoder();
  let result = value;

  while (encoder.encode(result).length > maxBytes && result.length > 0) {
    result = result.slice(0, -1);
  }

  return result;
}

function encodeTlv(tag: number, value: string): Uint8Array {
  const safeValue = truncateToBytes(value, 255);
  const bytes = new TextEncoder().encode(safeValue);
  const output = new Uint8Array(2 + bytes.length);
  output[0] = tag;
  output[1] = bytes.length;
  output.set(bytes, 2);
  return output;
}

function concatBytes(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, item) => sum + item.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  arrays.forEach((item) => {
    output.set(item, offset);
    offset += item.length;
  });

  return output;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  const globalRef = globalThis as unknown as {
    btoa?: (value: string) => string;
    Buffer?: { from: (value: Uint8Array) => { toString: (encoding: string) => string } };
  };

  if (typeof globalRef.btoa === 'function') {
    return globalRef.btoa(binary);
  }

  if (typeof globalRef.Buffer !== 'undefined') {
    return globalRef.Buffer.from(bytes).toString('base64');
  }

  return binary;
}

export function buildZatcaQrPayload(
  sellerName: string,
  vatNumber: string,
  issueAt: string,
  total: number,
  vatAmount: number,
): string {
  try {
    const payload = concatBytes([
      encodeTlv(1, sellerName),
      encodeTlv(2, vatNumber),
      encodeTlv(3, issueAt),
      encodeTlv(4, total.toFixed(2)),
      encodeTlv(5, vatAmount.toFixed(2)),
    ]);

    return bytesToBase64(payload);
  } catch {
    return '';
  }
}

export function createAuthorization(method: PaymentMethod): PaymentAuthorization {
  const now = new Date();

  return {
    method,
    transactionId: generateTransactionId(),
    authCode: String(Math.floor(100000 + Math.random() * 900000)),
    last4: method === 'mada' ? '4688' : '4431',
    walletToken: method === 'mada' ? 'MADA-SIMULATED-TOKEN' : 'APPLE-SIMULATED-TOKEN',
    paidAt: now.toISOString(),
  };
}

export function createZatcaInvoice(
  request: PaymentRequestModel,
  authorization: PaymentAuthorization,
  locale: Locale,
  sellerName: string,
  sellerVatNumber: string,
  sellerAddress: string,
): ZatcaInvoice {
  const totals = calculateTotals(request.lines);

  const lines: ZatcaInvoiceLine[] = request.lines
    .filter((line) => Math.max(0, Math.floor(Number(line.qty) || 0)) > 0)
    .map((line) => {
      const qty = Math.max(0, Math.floor(Number(line.qty) || 0));
      const unitPrice = round2(Math.max(0, Number(line.unitPrice) || 0));
      const taxableAmount = round2(qty * unitPrice);
      const vatAmount = round2(taxableAmount * VAT_RATE);
      const total = round2(taxableAmount + vatAmount);

      return {
        id: line.id,
        code: line.code,
        nameAr: line.nameAr,
        nameEn: line.nameEn,
        qty,
        unitPrice,
        taxableAmount,
        vatAmount,
        total,
      };
    });

  const invoiceNumber = generateInvoiceNumber();
  const qrBase64 = buildZatcaQrPayload(
    sellerName,
    sellerVatNumber,
    authorization.paidAt,
    totals.total,
    totals.vatAmount,
  );

  return {
    invoiceNumber,
    issueAt: authorization.paidAt,
    paymentMethod: authorization.method,
    sellerName,
    sellerVatNumber,
    sellerAddress,
    buyerName: request.patientName.trim(),
    buyerPhone: request.patientPhone,
    appointmentId: request.appointmentId,
    lines,
    subtotal: totals.subtotal,
    vatRate: VAT_RATE,
    vatAmount: totals.vatAmount,
    total: totals.total,
    qrBase64,
    authorization,
  };
}

function getInvoiceLineName(line: ZatcaInvoiceLine, locale: Locale): string {
  return locale === 'ar' ? line.nameAr : line.nameEn;
}

export function buildInvoiceText(
  locale: Locale,
  labels: Labels,
  invoice: ZatcaInvoice,
  request: PaymentRequestModel,
): string {
  const method = invoice.paymentMethod === 'mada' ? labels.mada : labels.applePay;

  const lines = invoice.lines
    .map((line, index) => {
      const name = getInvoiceLineName(line, locale);
      return `${index + 1}. ${name} × ${line.qty} = ${formatCurrency(line.total, locale)}`;
    })
    .join('\n');

  return [
    labels.invoiceHeading,
    `${labels.invoiceNumber}: ${invoice.invoiceNumber}`,
    `${labels.issueAt}: ${formatDateTime(locale, invoice.issueAt)}`,
    `${labels.appointmentId}: ${invoice.appointmentId}`,
    `${labels.sellerName}: ${invoice.sellerName}`,
    `${labels.sellerVatNumber}: ${invoice.sellerVatNumber}`,
    `${labels.sellerAddress}: ${invoice.sellerAddress}`,
    `${labels.buyerName}: ${invoice.buyerName}`,
    `${labels.buyerPhone}: ${invoice.buyerPhone}`,
    `${labels.coordinatorName}: ${request.coordinatorName}`,
    `${labels.paymentMethodLabel}: ${method}`,
    `${labels.transactionId}: ${invoice.authorization.transactionId}`,
    `${labels.authCode}: ${invoice.authorization.authCode}`,
    `${labels.last4}: ${invoice.authorization.last4}`,
    '',
    lines,
    '',
    `${labels.subtotal}: ${formatCurrency(invoice.subtotal, locale)}`,
    `${labels.vat15}: ${formatCurrency(invoice.vatAmount, locale)}`,
    `${labels.total}: ${formatCurrency(invoice.total, locale)}`,
    `${labels.zatcaQr}: ${invoice.qrBase64.slice(0, 72)}...`,
  ].join('\n');
}

export function buildWhatsAppUrl(
  locale: Locale,
  labels: Labels,
  invoice: ZatcaInvoice,
  request: PaymentRequestModel,
  preferredNumber?: string,
): string {
  const phone = normalizeSaudiPhone(preferredNumber || invoice.buyerPhone || request.patientPhone);
  const message = [`ALO DOCTOR W06`, buildInvoiceText(locale, labels, invoice, request)].join('\n\n');
  const encoded = encodeURIComponent(message);

  return phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof document === 'undefined') {
    return false;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to legacy fallback.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');

.alo-stage4 {
  min-height: 100%;
  padding: 16px;
  background: linear-gradient(180deg, #E6FAF7 0%, #FFFFFF 36%, #FFFFFF 100%);
  color: #073B34;
}

.alo-shell {
  max-width: 1080px;
  margin-inline: auto;
  display: grid;
  gap: 16px;
}

.alo-card {
  background: #FFFFFF;
  border: 1px solid #9AD8CF;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 12px 30px rgba(0, 123, 110, 0.08);
}

.alo-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.alo-title {
  margin: 0;
  color: #007B6E;
  font-size: 1.4rem;
  line-height: 1.4;
}

.alo-muted {
  margin: 6px 0 0;
  color: #466660;
  font-size: 0.95rem;
  line-height: 1.6;
}

.alo-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.alo-field {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.alo-field > label,
.alo-field > .alo-label {
  font-weight: 700;
  color: #007B6E;
}

.alo-input,
.alo-select {
  width: 100%;
  min-height: 46px;
  border: 1px solid #9AD8CF;
  border-radius: 12px;
  padding: 10px 12px;
  font: inherit;
  background: #FFFFFF;
  color: inherit;
}

.alo-input:focus-visible,
.alo-select:focus-visible,
.alo-button:focus-visible,
.alo-status:focus-visible {
  outline: 3px solid #00C6AE;
  outline-offset: 2px;
}

.alo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.alo-table-wrap {
  overflow-x: auto;
  border: 1px solid #CDEEE8;
  border-radius: 14px;
}

.alo-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 620px;
}

.alo-table th,
.alo-table td {
  padding: 10px;
  border-bottom: 1px solid #CDEEE8;
  text-align: start;
  vertical-align: middle;
}

.alo-table th {
  color: #007B6E;
  background: #E6FAF7;
  font-weight: 700;
}

.alo-table td .alo-line-code {
  display: block;
  color: #466660;
  font-size: 0.85rem;
}

.alo-qty {
  max-width: 96px;
}

.alo-summary {
  margin: 16px 0 0;
  display: grid;
  gap: 8px;
}

.alo-summary div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px dashed #CDEEE8;
  padding-bottom: 6px;
}

.alo-summary dt {
  color: #466660;
  font-weight: 600;
}

.alo-summary dd {
  margin: 0;
  font-weight: 700;
}

.alo-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.alo-button {
  border: 0;
  border-radius: 12px;
  min-height: 46px;
  padding: 10px 16px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  background: #007B6E;
  color: #FFFFFF;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.alo-button.secondary {
  background: #E6FAF7;
  color: #007B6E;
  border: 1px solid #007B6E;
}

.alo-button.whatsapp {
  background: #25D366;
  color: #053B2E;
}

.alo-button:disabled {
  opacity: 0.65;
  cursor: progress;
}

.alo-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  background: #FFFFFF;
  border: 1px solid #9AD8CF;
  border-radius: 14px;
  padding: 12px 14px;
  font-weight: 600;
}

.alo-pill {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 4px 12px;
  border-radius: 999px;
  background: #E6FAF7;
  border: 1px solid #00C6AE;
  color: #007B6E;
  font-weight: 700;
}

.alo-error {
  margin: 0;
  color: #B42318;
  font-weight: 700;
  background: #FFF4F4;
  border: 1px solid #F1B8B8;
  border-radius: 12px;
  padding: 12px;
}

.alo-fieldset {
  border: 1px solid #9AD8CF;
  border-radius: 14px;
  padding: 14px;
  margin: 0;
}

.alo-fieldset legend {
  padding-inline: 8px;
  font-weight: 700;
  color: #007B6E;
}

.alo-method {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.alo-method-option {
  display: grid;
  gap: 6px;
  border: 2px solid #9AD8CF;
  border-radius: 14px;
  padding: 12px;
  cursor: pointer;
  background: #FFFFFF;
}

.alo-method-option.selected {
  border-color: #007B6E;
  background: #E6FAF7;
}

.alo-method-option input {
  accent-color: #007B6E;
  width: 18px;
  height: 18px;
}

.alo-method-title {
  font-weight: 700;
  color: #007B6E;
}

.alo-qr {
  margin-top: 16px;
  display: grid;
  gap: 8px;
  border: 1px dashed #00C6AE;
  background: #F4FFFD;
  border-radius: 14px;
  padding: 12px;
}

.alo-qr code {
  display: block;
  word-break: break-word;
  white-space: pre-wrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.88rem;
  color: #073B34;
}

.alo-visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`;

export function Stage4PaymentSimulation({
  locale: localeProp,
  activePersona: personaProp,
  onPersonaChange,
  initialRequest,
  whatsappNumber,
  sellerName = 'ALO DOCTOR Medical Center',
  sellerVatNumber = '310123456700003',
  sellerAddress = 'Riyadh, Saudi Arabia',
  onCompleted,
}: Stage4PaymentSimulationProps) {
  const uid = useId();
  const id = useCallback((name: string) => `${uid}-${name}`, [uid]);

  const [locale, setLocale] = useState<Locale>(localeProp ?? 'ar');
  const [persona, setPersona] = useState<PersonaId>(personaProp ?? 'coordinator');
  const [stage, setStage] = useState<PaymentStage>('request');
  const [method, setMethod] = useState<PaymentMethod>('mada');
  const [error, setError] = useState<string | null>(null);
  const [authorization, setAuthorization] = useState<PaymentAuthorization | null>(null);
  const [invoice, setInvoice] = useState<ZatcaInvoice | null>(null);
  const [copied, setCopied] = useState(false);

  const timerRef = useRef<number | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const labels = useMemo(() => getLabels(locale), [locale]);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const activePersonaProfile = useMemo(
    () => PERSONAS.find((item) => item.id === persona) ?? PERSONAS[0],
    [persona],
  );

  const activePersonaLabel = locale === 'ar' ? activePersonaProfile.nameAr : activePersonaProfile.nameEn;

  const createInitialRequest = useCallback((): PaymentRequestModel => {
    return {
      appointmentId: initialRequest?.appointmentId ?? 'APT-2024-0001',
      patientName: initialRequest?.patientName ?? '',
      patientPhone: initialRequest?.patientPhone ?? '',
      coordinatorName: initialRequest?.coordinatorName ?? 'Care Coordinator',
      notes: initialRequest?.notes ?? '',
      lines:
        initialRequest?.lines && initialRequest.lines.length > 0
          ? initialRequest.lines.map((line) => ({ ...line }))
          : DEFAULT_LINES.map((line) => ({ ...line })),
    };
  }, [initialRequest]);

  const [request, setRequest] = useState<PaymentRequestModel>(createInitialRequest);

  const totals = useMemo(() => calculateTotals(request.lines), [request.lines]);

  const statusMessage = useMemo(() => {
    if (stage === 'processing') return labels.processing;
    if (stage === 'success') return labels.paymentApproved;
    if (stage === 'checkout') return labels.requestCreated;
    return labels.coordinatorRequestNote;
  }, [stage, labels]);

  const whatsAppUrl = useMemo(() => {
    if (!invoice) return '';
    return buildWhatsAppUrl(locale, labels, invoice, request, whatsappNumber);
  }, [invoice, locale, labels, request, whatsappNumber]);

  useEffect(() => {
    if (localeProp) setLocale(localeProp);
  }, [localeProp]);

  useEffect(() => {
    if (personaProp) setPersona(personaProp);
  }, [personaProp]);

  useEffect(() => {
    if (stage !== 'request') {
      statusRef.current?.focus();
    }
  }, [stage]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handlePersonaChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextPersona = event.target.value as PersonaId;
      setPersona(nextPersona);
      onPersonaChange?.(nextPersona);
    },
    [onPersonaChange],
  );

  const handleLocaleChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(event.target.value as Locale);
  }, []);

  const updateRequest = useCallback((patch: Partial<PaymentRequestModel>) => {
    setRequest((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateLineQty = useCallback((lineId: string, rawValue: string) => {
    const parsed = Number(rawValue);
    const qty = Number.isFinite(parsed) ? Math.max(0, Math.min(99, Math.floor(parsed))) : 0;

    setRequest((prev) => ({
      ...prev,
      lines: prev.lines.map((line) => (line.id === lineId ? { ...line, qty } : line)),
    }));
  }, []);

  const fillSample = useCallback(() => {
    setRequest((prev) => ({
      ...prev,
      appointmentId: prev.appointmentId || 'APT-2024-0001',
      patientName: prev.patientName || (locale === 'ar' ? 'سارة العتيبي' : 'Sarah Al-Otaibi'),
      patientPhone: prev.patientPhone || '0551234567',
      coordinatorName: prev.coordinatorName || activePersonaLabel,
      notes: prev.notes || (locale === 'ar' ? 'محاكاة المرحلة الرابعة' : 'Stage 4 simulation'),
    }));
    setError(null);
  }, [locale, activePersonaLabel]);

  const handleCreateRequest = useCallback(() => {
    const phone = normalizeSaudiPhone(request.patientPhone);

    const hasLines = request.lines.some((line) => {
      const qty = Math.max(0, Math.floor(Number(line.qty) || 0));
      const unitPrice = Math.max(0, Number(line.unitPrice) || 0);
      return qty > 0 && unitPrice > 0;
    });

    if (!request.patientName.trim() || !hasLines) {
      setError(labels.errorRequired);
      return;
    }

    if (!phone) {
      setError(labels.errorPhone);
      return;
    }

    const coordinatorName = request.coordinatorName.trim() || activePersonaLabel;

    setRequest((prev) => ({
      ...prev,
      patientName: prev.patientName.trim(),
      patientPhone: phone,
      coordinatorName,
    }));

    setError(null);
    setStage('checkout');
  }, [request, labels, activePersonaLabel]);

  const handlePay = useCallback(() => {
    if (stage === 'processing') return;

    setStage('processing');
    setError(null);

    timerRef.current = window.setTimeout(() => {
      const nextAuthorization = createAuthorization(method);
      const nextInvoice = createZatcaInvoice(
        request,
        nextAuthorization,
        locale,
        sellerName,
        sellerVatNumber,
        sellerAddress,
      );

      const nextWhatsAppUrl = buildWhatsAppUrl(locale, labels, nextInvoice, request, whatsappNumber);

      setAuthorization(nextAuthorization);
      setInvoice(nextInvoice);
      setStage('success');

      onCompleted?.({
        request,
        invoice: nextInvoice,
        whatsAppUrl: nextWhatsAppUrl,
      });
    }, 1400);
  }, [
    stage,
    method,
    request,
    locale,
    sellerName,
    sellerVatNumber,
    sellerAddress,
    labels,
    whatsappNumber,
    onCompleted,
  ]);

  const handleReset = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    setStage('request');
    setError(null);
    setAuthorization(null);
    setInvoice(null);
    setCopied(false);
    setRequest(createInitialRequest());
  }, [createInitialRequest]);

  const handleCopy = useCallback(async () => {
    if (!invoice) return;

    const text = buildInvoiceText(locale, labels, invoice, request);
    const ok = await copyToClipboard(text);

    if (ok) {
      setCopied(true);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }
  }, [invoice, locale, labels, request]);

  return (
    <section className="alo-stage4" dir={dir} lang={locale}>
      <style>{STYLES}</style>

      <div className="alo-shell">
        <header className="alo-card alo-header">
          <div>
            <h1 className="alo-title">{labels.appTitle}</h1>
            <p className="alo-muted">{labels.stageTitle}</p>
          </div>

          <div className="alo-controls">
            <div className="alo-field">
              <label className="alo-visually-hidden" htmlFor={id('persona-switcher')}>
                {labels.switchPersona}
              </label>
              <select
                id={id('persona-switcher')}
                className="alo-select"
                value={persona}
                onChange={handlePersonaChange}
                aria-label={labels.switchPersona}
              >
                {PERSONAS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {locale === 'ar' ? item.nameAr : item.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="alo-field">
              <label className="alo-visually-hidden" htmlFor={id('locale-switcher')}>
                {labels.switchLocale}
              </label>
              <select
                id={id('locale-switcher')}
                className="alo-select"
                value={locale}
                onChange={handleLocaleChange}
                aria-label={labels.switchLocale}
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </header>

        <div
          ref={statusRef}
          className="alo-status"
          role="status"
          aria-live="polite"
          aria-label={labels.ariaPaymentStatus}
          tabIndex={-1}
        >
          <span className="alo-pill">{activePersonaLabel}</span>
          <span>{statusMessage}</span>
        </div>

        {error ? (
          <p className="alo-error" role="alert">
            {error}
          </p>
        ) : null}

        {stage === 'request' ? (
          <section className="alo-card" aria-labelledby={id('request-heading')}>
            <h2 id={id('request-heading')}>{labels.requestHeading}</h2>

            <div className="alo-grid">
              <div className="alo-field">
                <label htmlFor={id('appointmentId')}>{labels.appointmentId}</label>
                <input
                  id={id('appointmentId')}
                  className="alo-input"
                  value={request.appointmentId}
                  onChange={(event) => updateRequest({ appointmentId: event.target.value })}
                />
              </div>

              <div className="alo-field">
                <label htmlFor={id('patientName')}>{labels.patientName}</label>
                <input
                  id={id('patientName')}
                  className="alo-input"
                  value={request.patientName}
                  onChange={(event) => updateRequest({ patientName: event.target.value })}
                  autoComplete="name"
                />
              </div>

              <div className="alo-field">
                <label htmlFor={id('patientPhone')}>{labels.patientPhone}</label>
                <input
                  id={id('patientPhone')}
                  className="alo-input"
                  dir="ltr"
                  inputMode="tel"
                  value={request.patientPhone}
                  onChange={(event) => updateRequest({ patientPhone: event.target.value })}
                  placeholder="05XXXXXXXX"
                />
              </div>

              <div className="alo-field">
                <label htmlFor={id('coordinatorName')}>{labels.coordinatorName}</label>
                <input
                  id={id('coordinatorName')}
                  className="alo-input"
                  value={request.coordinatorName}
                  onChange={(event) => updateRequest({ coordinatorName: event.target.value })}
                />
              </div>
            </div>

            <div className="alo-field" style={{ marginTop: 12 }}>
              <label htmlFor={id('notes')}>{labels.notes}</label>
              <textarea
                id={id('notes')}
                className="alo-input"
                rows={2}
                value={request.notes}
                onChange={(event) => updateRequest({ notes: event.target.value })}
              />
            </div>

            <h3 style={{ color: '#007B6E' }}>{labels.serviceLines}</h3>

            <div className="alo-table-wrap">
              <table className="alo-table">
                <thead>
                  <tr>
                    <th scope="col">{labels.item}</th>
                    <th scope="col">{labels.unitPrice}</th>
                    <th scope="col">{labels.qty}</th>
                    <th scope="col">{labels.lineTotal}</th>
                  </tr>
                </thead>
                <tbody>
                  {request.lines.map((line) => {
                    const lineName = locale === 'ar' ? line.nameAr : line.nameEn;
                    const lineTotal = round2(Math.max(0, line.qty) * Math.max(0, line.unitPrice));

                    return (
                      <tr key={line.id}>
                        <td>
                          {lineName}
                          <span className="alo-line-code">{line.code}</span>
                        </td>
                        <td>{formatCurrency(line.unitPrice, locale)}</td>
                        <td>
                          <input
                            type="number"
                            className="alo-input alo-qty"
                            min={0}
                            max={99}
                            step={1}
                            inputMode="numeric"
                            value={line.qty}
                            onChange={(event) => updateLineQty(line.id, event.target.value)}
                            aria-label={`${lineName} ${labels.qty}`}
                          />
                        </td>
                        <td>{formatCurrency(lineTotal, locale)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <dl className="alo-summary">
              <div>
                <dt>{labels.subtotal}</dt>
                <dd>{formatCurrency(totals.subtotal, locale)}</dd>
              </div>
              <div>
                <dt>{labels.vat15}</dt>
                <dd>{formatCurrency(totals.vatAmount, locale)}</dd>
              </div>
              <div>
                <dt>{labels.total}</dt>
                <dd>{formatCurrency(totals.total, locale)}</dd>
              </div>
            </dl>

            <div className="alo-actions">
              <button type="button" className="alo-button secondary" onClick={fillSample}>
                {labels.fillSample}
              </button>
              <button type="button" className="alo-button" onClick={handleCreateRequest}>
                {labels.createPaymentRequest}
              </button>
            </div>
          </section>
        ) : null}

        {stage === 'checkout' || stage === 'processing' ? (
          <section className="alo-card" aria-labelledby={id('checkout-heading')}>
            <h2 id={id('checkout-heading')}>{labels.checkoutHeading}</h2>

            <dl className="alo-summary">
              <div>
                <dt>{labels.appointmentId}</dt>
                <dd>{request.appointmentId}</dd>
              </div>
              <div>
                <dt>{labels.patientName}</dt>
                <dd>{request.patientName}</dd>
              </div>
              <div>
                <dt>{labels.patientPhone}</dt>
                <dd dir="ltr">{request.patientPhone}</dd>
              </div>
              <div>
                <dt>{labels.coordinatorName}</dt>
                <dd>{request.coordinatorName}</dd>
              </div>
              <div>
                <dt>{labels.amountDue}</dt>
                <dd>{formatCurrency(totals.total, locale)}</dd>
              </div>
            </dl>

            <fieldset className="alo-fieldset" disabled={stage === 'processing'}>
              <legend>{labels.paymentMethod}</legend>

              <div className="alo-method">
                <label className={`alo-method-option ${method === 'mada' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name={`${uid}-payment-method`}
                    value="mada"
                    checked={method === 'mada'}
                    onChange={() => setMethod('mada')}
                  />
                  <span className="alo-method-title">{labels.mada}</span>
                  <span className="alo-muted">Mada network simulation</span>
                </label>

                <label className={`alo-method-option ${method === 'applePay' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name={`${uid}-payment-method`}
                    value="applePay"
                    checked={method === 'applePay'}
                    onChange={() => setMethod('applePay')}
                  />
                  <span className="alo-method-title">{labels.applePay}</span>
                  <span className="alo-muted">Apple Pay wallet simulation</span>
                </label>
              </div>
            </fieldset>

            <div className="alo-actions">
              <button
                type="button"
                className="alo-button secondary"
                onClick={() => setStage('request')}
                disabled={stage === 'processing'}
              >
                {labels.back}
              </button>

              <button
                type="button"
                className="alo-button"
                onClick={handlePay}
                disabled={stage === 'processing'}
                aria-busy={stage === 'processing'}
              >
                {stage === 'processing'
                  ? labels.processing
                  : `${labels.payNow} — ${formatCurrency(totals.total, locale)}`}
              </button>
            </div>
          </section>
        ) : null}

        {stage === 'success' && invoice && authorization ? (
          <section className="alo-card" aria-labelledby={id('success-heading')}>
            <h2 id={id('success-heading')}>{labels.successHeading}</h2>
            <h3 style={{ color: '#007B6E' }}>{labels.invoiceHeading}</h3>

            <dl className="alo-summary">
              <div>
                <dt>{labels.invoiceNumber}</dt>
                <dd>{invoice.invoiceNumber}</dd>
              </div>
              <div>
                <dt>{labels.issueAt}</dt>
                <dd>{formatDateTime(locale, invoice.issueAt)}</dd>
              </div>
              <div>
                <dt>{labels.appointmentId}</dt>
                <dd>{invoice.appointmentId}</dd>
              </div>
              <div>
                <dt>{labels.sellerName}</dt>
                <dd>{invoice.sellerName}</dd>
              </div>
              <div>
                <dt>{labels.sellerVatNumber}</dt>
                <dd dir="ltr">{invoice.sellerVatNumber}</dd>
              </div>
              <div>
                <dt>{labels.sellerAddress}</dt>
                <dd>{invoice.sellerAddress}</dd>
              </div>
              <div>
                <dt>{labels.buyerName}</dt>
                <dd>{invoice.buyerName}</dd>
              </div>
              <div>
                <dt>{labels.buyerPhone}</dt>
                <dd dir="ltr">{invoice.buyerPhone}</dd>
              </div>
              <div>
                <dt>{labels.paymentMethodLabel}</dt>
                <dd>{invoice.paymentMethod === 'mada' ? labels.mada : labels.applePay}</dd>
              </div>
              <div>
                <dt>{labels.transactionId}</dt>
                <dd dir="ltr">{invoice.authorization.transactionId}</dd>
              </div>
              <div>
                <dt>{labels.authCode}</dt>
                <dd dir="ltr">{invoice.authorization.authCode}</dd>
              </div>
              <div>
                <dt>{labels.last4}</dt>
                <dd dir="ltr">{invoice.authorization.last4}</dd>
              </div>
              <div>
                <dt>{labels.paidAt}</dt>
                <dd>{formatDateTime(locale, invoice.authorization.paidAt)}</dd>
              </div>
            </dl>

            <div className="alo-table-wrap" style={{ marginTop: 16 }}>
              <table className="alo-table">
                <thead>
                  <tr>
                    <th scope="col">{labels.item}</th>
                    <th scope="col">{labels.qty}</th>
                    <th scope="col">{labels.unitPrice}</th>
                    <th scope="col">{labels.taxableAmount}</th>
                    <th scope="col">{labels.lineVat}</th>
                    <th scope="col">{labels.totalWithVat}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines.map((line) => (
                    <tr key={line.id}>
                      <td>
                        {getInvoiceLineName(line, locale)}
                        <span className="alo-line-code">{line.code}</span>
                      </td>
                      <td>{line.qty}</td>
                      <td>{formatCurrency(line.unitPrice, locale)}</td>
                      <td>{formatCurrency(line.taxableAmount, locale)}</td>
                      <td>{formatCurrency(line.vatAmount, locale)}</td>
                      <td>{formatCurrency(line.total, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="alo-summary">
              <div>
                <dt>{labels.subtotal}</dt>
                <dd>{formatCurrency(invoice.subtotal, locale)}</dd>
              </div>
              <div>
                <dt>{labels.vat15}</dt>
                <dd>{formatCurrency(invoice.vatAmount, locale)}</dd>
              </div>
              <div>
                <dt>{labels.total}</dt>
                <dd>{formatCurrency(invoice.total, locale)}</dd>
              </div>
            </dl>

            <div className="alo-qr">
              <strong>{labels.zatcaQr}</strong>
              <code dir="ltr">{invoice.qrBase64}</code>
            </div>

            <div className="alo-actions">
              <a className="alo-button whatsapp" href={whatsAppUrl} target="_blank" rel="noreferrer">
                {labels.whatsappConfirmation}
              </a>

              <button type="button" className="alo-button secondary" onClick={handleCopy}>
                {copied ? labels.copied : labels.copyInvoice}
              </button>

              <button type="button" className="alo-button secondary" onClick={handleReset}>
                {labels.newPayment}
              </button>
            </div>

            <p className="alo-muted">{labels.whatsappHint}</p>
          </section>
        ) : null}
      </div>
    </section>
  );
}

export default Stage4PaymentSimulation;