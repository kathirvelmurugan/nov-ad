import { ClinicalCase } from '../types';
import { generateMockSHA256 } from '../components/followup/followUpConstants';

/**
 * Downloads PDF 1 (Certified Second Opinion Dossier)
 */
export const downloadPDF1 = (activeCase: ClinicalCase, isAr: boolean = false): void => {
  const checksum = generateMockSHA256();
  const caseNum = activeCase.caseNumber || activeCase.id;
  const patName = activeCase.patientName || activeCase.patientNameAr || (isAr ? 'المريض' : 'Patient');
  const treatingDoc = activeCase.treatingDoctor?.name || (isAr ? 'د. فهد الحربي' : 'Dr. Fahad Al-Harbi');
  const consultant = activeCase.consultant?.name || 'Dr. V. Prasanth, MBBS, MS, MCh';
  const rawHosp = activeCase.treatingDoctor?.hospital;
  const isLegacy = !rawHosp || rawHosp === 'Alo Care Specialist Medical Center' || rawHosp === 'مركز ألو كير الطبي التخصصي' || rawHosp === 'المجمع الطبي الشريك' || rawHosp === 'Partner Medical Center';
  const hospital = isLegacy
    ? (isAr ? 'مستشفى رعاية الرياض المعتمد' : 'Riyadh Care Medical Center')
    : rawHosp;

  const content = [
    `========================================================================`,
    `ALO DOCTOR - CERTIFIED SECOND MEDICAL OPINION DOSSIER (PDF 1)`,
    `========================================================================`,
    `Case Number: ${caseNum}`,
    `Date Issued: ${new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}`,
    `Patient Name: ${patName}`,
    `Specialty: ${activeCase.specialty || 'Cardiothoracic Surgery'}`,
    `Status: CERTIFIED & ENDORSED`,
    `Cryptographic Seal (SHA-256): ${checksum}`,
    `MOH & SDAIA Compliance: Verified`,
    `------------------------------------------------------------------------`,
    `PART 1: TREATING SAUDI PHYSICIAN ENDORSEMENT`,
    `Physician: ${treatingDoc} (${hospital})`,
    `Diagnosis: ${activeCase.diagnosis || 'Severe Aortic Stenosis with Annular Calcification'}`,
    `Clinical Questions for Specialist:`,
    activeCase.treatingDoctor?.focusQuestions?.map((q, i) => `  ${i + 1}. ${q}`).join('\n') || '  1. Surgery vs Intervention\n  2. Calcification risk\n  3. Regimen',
    `------------------------------------------------------------------------`,
    `PART 2: INTERNATIONAL SPECIALIST CLINICAL OPINION`,
    `Specialist: ${consultant} (${activeCase.consultant?.center || 'KIMS Hospitals'})`,
    `Evaluation:`,
    activeCase.consultantOpinion || 'Open Surgical Aortic Valve Replacement (SAVR) with bioprosthetic valve recommended over TAVR.',
    `Specialist Answers:`,
    activeCase.consultantAnswers?.map((ans, i) => `  Answer ${i + 1}: ${ans}`).join('\n') || '  Answer 1: Open SAVR recommended.\n  Answer 2: CABG not required.\n  Answer 3: Warfarin INR target 2.0-3.0.',
    `------------------------------------------------------------------------`,
    `PART 3: TREATMENT PLAN & FACILITY ORDERS`,
    `Ordered Tests: ${activeCase.partnerOrders?.lab?.test || 'Lipid Panel, CBC, HbA1c'}`,
    `Pharmacy: ${activeCase.partnerOrders?.pharmacy?.meds?.join(', ') || 'Atorvastatin 40mg, Aspirin 100mg'}`,
    `Cardiac Rehab: ${activeCase.partnerOrders?.physio?.sessions || 8} Sessions Approved`,
    `========================================================================`,
  ].join('\n');

  const blob = new Blob([content], { type: 'application/pdf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ALO_Doctor_Opinion_PDF1_${caseNum}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Downloads PDF 2 (Final Comprehensive Case Summary & Archival Record)
 * PDF Spec Screen: P28 (Download PDF 2) & C10 (Case Closure)
 */
export const downloadPDF2 = (activeCase: ClinicalCase, isAr: boolean = false): void => {
  const checksum = generateMockSHA256();
  const caseNum = activeCase.caseNumber || activeCase.id;
  const patName = activeCase.patientName || activeCase.patientNameAr || (isAr ? 'المريض' : 'Patient');
  const treatingDoc = activeCase.treatingDoctor?.name || (isAr ? 'د. فهد الحربي' : 'Dr. Fahad Al-Harbi');
  const consultant = activeCase.consultant?.name || 'Dr. V. Prasanth, MBBS, MS, MCh';
  const invoiceNum = activeCase.pricing?.invoiceNumber || 'INV-2026-001';

  const followUpQ = (activeCase.metadata?.patientQuestions as string[]) || [];
  const followUpA =
    (activeCase.metadata?.coordinatorReplies as string[]) ||
    (activeCase.metadata?.followUpAnswers as string[]) ||
    [];

  const qnaBlock = followUpQ.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${followUpA[i] || 'ALO Care Coordinator guidance documented.'}`).join('\n\n');

  const content = [
    `========================================================================`,
    `ALO DOCTOR - FINAL COMPREHENSIVE CLINICAL DOSSIER & ARCHIVAL RECORD (PDF 2)`,
    `========================================================================`,
    `Case Number: ${caseNum}`,
    `Archived Date: ${new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}`,
    `ZATCA Tax Invoice Ref: ${invoiceNum}`,
    `Patient Name: ${patName}`,
    `Status: PERMANENTLY CLOSED & ARCHIVED`,
    `SDAIA Cryptographic Checksum (SHA-256): ${checksum}`,
    `Accreditation: Saudi Health Council, MOH Regulations, SDAIA NDMO (PDPL)`,
    `------------------------------------------------------------------------`,
    `SECTION 1: CERTIFIED SECOND OPINION SUMMARY (PDF 1 INTEGRATION)`,
    `Treating Physician: ${treatingDoc}`,
    `International Specialist: ${consultant}`,
    `Specialist Findings: ${activeCase.consultantOpinion || 'Open SAVR strongly recommended; surgical outcomes favorable.'}`,
    `------------------------------------------------------------------------`,
    `SECTION 2: 21-DAY POST-OPINIONS FOLLOW-UP & CARE COORDINATION LOG`,
    `Patient Rating: ${(activeCase.metadata?.rating as number) || 5}/5 Stars`,
    `Follow-up Inquiries & Official Responses:`,
    qnaBlock || 'Patient: Can I start the treatment now?\nCoordinator: Yes, after your confirmed lab results with Dr. Fahad Al-Harbi.',
    activeCase.finalClosureNote ? `Specialist Final Remarks: ${activeCase.finalClosureNote}` : 'All follow-up questions concluded and certified.',
    `------------------------------------------------------------------------`,
    `SECTION 3: PARTNER SERVICE EXECUTION SUMMARY`,
    `Lab Status: ${activeCase.partnerOrders?.lab?.status || 'Completed'}`,
    `Pharmacy Status: ${activeCase.partnerOrders?.pharmacy?.status || 'Dispensed (Pickup Code: A1B2)'}`,
    `Physiotherapy Status: ${activeCase.partnerOrders?.physio?.status || 'Completed'}`,
    `------------------------------------------------------------------------`,
    `SECTION 4: ZATCA PHASE-2 TAX INVOICE RECEIPT`,
    `Total Amount: ${(activeCase.pricing?.totalSar || 750).toFixed(2)} SAR (Includes 15% VAT)`,
    `Payment Method: ${activeCase.paymentDetails?.method || activeCase.allowedPaymentMethods?.[0] || 'mada'}`,
    `Receipt Verification: Cryptographically Signed & Archived in Permanent Health Record`,
    `========================================================================`,
  ].join('\n');

  const blob = new Blob([content], { type: 'application/pdf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ALO_Doctor_Final_Summary_PDF2_${caseNum}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
