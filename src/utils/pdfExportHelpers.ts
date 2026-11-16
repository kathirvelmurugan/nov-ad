import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ClinicalCase {
  caseNumber: string;
  patientAge: number;
  patientGender: string;
  nationality: string;
  saudiDoctorEndorsement: string;
  indianSpecialistDiagnosis: string;
  clinicalHistory: string[];
  focusQuestions: string[];
  timelineMilestones: Array<{ date: string; event: string }>;
  qrValidationSeal: string;
  certifiedStamps: string[];
  createdAt: string;
}

const PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  accent: '#25D366',
  textDark: '#1A1A1A',
  textLight: '#FFFFFF'
};

async function generateCryptographicHash(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function applyDocumentHeader(doc: jsPDF, titleEn: string, titleAr: string) {
  doc.setFillColor(PALETTE.primary);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
  
  doc.setTextColor(PALETTE.textLight);
  doc.setFontSize(18);
  doc.text(titleEn, 14, 20);
  
  doc.setFontSize(14);
  const arabicWidth = doc.getTextWidth(titleAr);
  doc.text(titleAr, doc.internal.pageSize.getWidth() - 14 - arabicWidth, 20);
  
  doc.setDrawColor(PALETTE.secondary);
  doc.line(0, 40, doc.internal.pageSize.getWidth(), 40);
  doc.setDrawColor(PALETTE.accent);
  doc.line(0, 42, doc.internal.pageSize.getWidth(), 42);
  
  doc.setTextColor(PALETTE.textDark);
}

function applyFooterWithHash(doc: jsPDF, hash: string, pageNumber: number, totalPages: number) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(PALETTE.primary);
    
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.text(`SHA-256: ${hash.substring(0, 32)}...`, 14, footerY);
    doc.text(`ALO DOCTOR v2.4 Saudi Edition`, 14, footerY + 6);
    
    const pageText = `${i} / ${pageCount}`;
    const pageTextWidth = doc.getTextWidth(pageText);
    doc.text(pageText, doc.internal.pageSize.getWidth() - 14 - pageTextWidth, footerY);
  }
}

function drawQrSealPlaceholder(doc: jsPDF, qrData: string, x: number, y: number) {
  doc.setDrawColor(PALETTE.primary);
  doc.setFillColor(PALETTE.background);
  doc.roundedRect(x, y, 40, 40, 3, 3, 'FD');
  
  doc.setFillColor(PALETTE.secondary);
  doc.rect(x + 5, y + 5, 10, 10, 'F');
  doc.rect(x + 25, y + 5, 10, 10, 'F');
  doc.rect(x + 5, y + 25, 10, 10, 'F');
  doc.rect(x + 15, y + 15, 10, 10, 'F');
  doc.rect(x + 25, y + 25, 10, 10, 'F');
  
  doc.setFontSize(6);
  doc.setTextColor(PALETTE.primary);
  doc.text('QR VALIDATION SEAL', x + 2, y + 46);
  doc.text('ختم التحقق', x + 2, y + 52);
}

export async function exportExecutiveReportPdf(caseRecord: ClinicalCase): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  applyDocumentHeader(
    doc, 
    'Executive Summary Report', 
    'ملخص التقرير التنفيذي'
  );

  let yPos = 55;
  
  doc.setFontSize(12);
  doc.setTextColor(PALETTE.primary);
  doc.text('Patient Demographics / البيانات الديموغرافية للمريض', 14, yPos);
  yPos += 8;
  
  doc.setTextColor(PALETTE.textDark);
  doc.setFontSize(10);
  
  const demographicsData = [
    ['Case Number / رقم الحالة', caseRecord.caseNumber],
    ['Age / العمر', `${caseRecord.patientAge}`],
    ['Gender / الجنس', caseRecord.patientGender],
    ['Nationality / الجنسية', caseRecord.nationality],
    ['Generated / تاريخ الإنشاء', new Date(caseRecord.createdAt).toLocaleString('en-SA')]
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: demographicsData,
    theme: 'plain',
    styles: { fontSize: 10, textColor: PALETTE.textDark },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold', textColor: PALETTE.primary },
      1: { cellWidth: 100 }
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.section === 'body') {
        data.cell.styles.textColor = [PALETTE.textDark];
      }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(12);
  doc.setTextColor(PALETTE.primary);
  doc.text('Saudi Doctor Endorsement / مصادقة الطبيب السعودي', 14, yPos);
  yPos += 8;
  
  doc.setFillColor(PALETTE.background);
  doc.roundedRect(14, yPos, doc.internal.pageSize.getWidth() - 28, 30, 2, 2, 'F');
  doc.setDrawColor(PALETTE.secondary);
  doc.roundedRect(14, yPos, doc.internal.pageSize.getWidth() - 28, 30, 2, 2, 'S');
  
  doc.setTextColor(PALETTE.textDark);
  doc.setFontSize(10);
  const splitEndorsement = doc.splitTextToSize(caseRecord.saudiDoctorEndorsement, doc.internal.pageSize.getWidth() - 36);
  doc.text(splitEndorsement, 18, yPos + 8);
  
  yPos += 40;

  doc.setFontSize(12);
  doc.setTextColor(PALETTE.primary);
  doc.text('Indian Specialist Diagnosis / تشخيص الأخصائي الهندي', 14, yPos);
  yPos += 8;
  
  doc.setFillColor(PALETTE.background);
  doc.roundedRect(14, yPos, doc.internal.pageSize.getWidth() - 28, 30, 2, 2, 'F');
  doc.setDrawColor(PALETTE.accent);
  doc.roundedRect(14, yPos, doc.internal.pageSize.getWidth() - 28, 30, 2, 2, 'S');
  
  doc.setTextColor(PALETTE.textDark);
  doc.setFontSize(10);
  const splitDiagnosis = doc.splitTextToSize(caseRecord.indianSpecialistDiagnosis, doc.internal.pageSize.getWidth() - 36);
  doc.text(splitDiagnosis, 18, yPos + 8);

  drawQrSealPlaceholder(doc, caseRecord.qrValidationSeal, doc.internal.pageSize.getWidth() - 54, 55);

  const preliminaryBlob = doc.output('blob');
  const cryptographicHash = await generateCryptographicHash(preliminaryBlob);
  
  applyFooterWithHash(doc, cryptographicHash, 1, 1);

  const finalBlob = doc.output('blob');
  const fileName = `ALO-Executive-Summary-${caseRecord.caseNumber}.pdf`;
  
  triggerBrowserDownload(finalBlob, fileName);
  
  return finalBlob;
}

export async function exportFullDossierPdf(caseRecord: ClinicalCase): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  applyDocumentHeader(
    doc, 
    'Full Clinical Dossier', 
    'الملف السريري الشامل'
  );

  let yPos = 55;

  doc.setFontSize(12);
  doc.setTextColor(PALETTE.primary);
  doc.text('Clinical History / التاريخ السريري', 14, yPos);
  yPos += 8;

  if (caseRecord.clinicalHistory.length > 0) {
    const historyBody = caseRecord.clinicalHistory.map((item, index) => [`${index + 1}`, item]);
    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Event / الحدث']],
      body: historyBody,
      headStyles: { fillColor: PALETTE.primary, textColor: PALETTE.textLight, fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: PALETTE.textDark },
      alternateRowStyles: { fillColor: PALETTE.background },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 15, fontStyle: 'bold', textColor: PALETTE.secondary },
        1: { cellWidth: 'auto' }
      }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  if (yPos > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setTextColor(PALETTE.primary);
  doc.text('Focus Questions / أسئلة التركيز', 14, yPos);
  yPos += 8;

  if (caseRecord.focusQuestions.length > 0) {
    const questionsBody = caseRecord.focusQuestions.map((q, index) => [`Q${index + 1}`, q]);
    autoTable(doc, {
      startY: yPos,
      head: [['Ref', 'Question / السؤال']],
      body: questionsBody,
      headStyles: { fillColor: PALETTE.secondary, textColor: PALETTE.textLight, fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: PALETTE.textDark },
      alternateRowStyles: { fillColor: PALETTE.background },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold', textColor: PALETTE.primary },
        1: { cellWidth: 'auto' }
      }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  if (yPos > doc.internal.pageSize.getHeight() - 80) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setTextColor(PALETTE.primary);
  doc.text('Timeline Milestones / المعالم الزمنية', 14, yPos);
  yPos += 8;

  if (caseRecord.timelineMilestones.length > 0) {
    const timelineBody = caseRecord.timelineMilestones.map(m => [m.date, m.event]);
    autoTable(doc, {
      startY: yPos,
      head: [['Date / التاريخ', 'Milestone / المعلم']],
      body: timelineBody,
      headStyles: { fillColor: PALETTE.primary, textColor: PALETTE.textLight, fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: PALETTE.textDark },
      alternateRowStyles: { fillColor: PALETTE.background },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold', textColor: PALETTE.secondary },
        1: { cellWidth: 'auto' }
      }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  if (yPos > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setTextColor(PALETTE.primary);
  doc.text('Certified Stamps / الأختام المعتمدة', 14, yPos);
  yPos += 8;

  doc.setDrawColor(PALETTE.accent);
  doc.setLineWidth(0.5);
  
  caseRecord.certifiedStamps.forEach((stamp, index) => {
    if (yPos > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(PALETTE.background);
    doc.roundedRect(14, yPos, doc.internal.pageSize.getWidth() - 28, 18, 2, 2, 'FD');
    
    doc.setTextColor(PALETTE.primary);
    doc.setFontSize(10);
    doc.text(stamp, 20, yPos + 11);
    
    doc.setDrawColor(PALETTE.accent);
    doc.circle(doc.internal.pageSize.getWidth() - 28, yPos + 9, 5, 'S');
    doc.setFontSize(6);
    doc.text('CERTIFIED', doc.internal.pageSize.getWidth() - 35, yPos + 10);
    
    yPos += 24;
  });

  const preliminaryBlob = doc.output('blob');
  const cryptographicHash = await generateCryptographicHash(preliminaryBlob);
  
  applyFooterWithHash(doc, cryptographicHash, 1, doc.internal.getNumberOfPages());

  const finalBlob = doc.output('blob');
  const fileName = `ALO-Full-Dossier-${caseRecord.caseNumber}.pdf`;
  
  triggerBrowserDownload(finalBlob, fileName);
  
  return finalBlob;
}

function triggerBrowserDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = 'none';
  anchor.setAttribute('aria-label', `Download ${fileName}`);
  anchor.setAttribute('role', 'button');
  
  document.body.appendChild(anchor);
  anchor.click();
  
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 150);
}