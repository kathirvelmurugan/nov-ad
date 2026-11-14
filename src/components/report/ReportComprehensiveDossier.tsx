import React from 'react';
import { ClinicalCase } from '../../types';
import { TEAL_PRIMARY } from '../cockpit/types';
import DossierClinicalSection from './dossier/DossierClinicalSection';
import DossierRecommendationsSection from './dossier/DossierRecommendationsSection';
import DossierEndorsementQrSection from './dossier/DossierEndorsementQrSection';

interface Props {
  activeCase: ClinicalCase;
  isAr: boolean;
  patientName: string;
  patientNameEn: string;
  treatingDocName: string;
  consultantName: string;
  invoiceNum: string;
}

export const ReportComprehensiveDossier: React.FC<Props> = ({
  activeCase,
  isAr,
  patientName,
  patientNameEn,
  treatingDocName,
  consultantName,
  invoiceNum,
}) => {
  const coordinatorName =
    (activeCase.metadata?.assignedCoordinatorName as string) ||
    (isAr ? 'سارة المهندس (منسق رعاية ألو)' : 'Sarah Al-Mohandis (ALO Care Coordinator)');

  const totalSar = activeCase.pricing?.totalSar || (activeCase.consultationType === 'video' ? 150 : 75);
  const baseSar = activeCase.pricing?.baseSar || (totalSar === 150 ? 130.43 : 65.22);
  const vatSar = activeCase.pricing?.vatSar || (totalSar === 150 ? 19.57 : 9.78);

  const archiveDate = activeCase.metadata?.pdf2Timestamp
    ? new Date(activeCase.metadata.pdf2Timestamp as string).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const lang = isAr ? 'ar' : 'en';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ── Top Official Dossier Cover Banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #007B6E 100%)',
          color: '#ffffff',
          borderRadius: '14px',
          padding: '24px 28px',
          boxShadow: '0 8px 24px rgba(0, 123, 110, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                backgroundColor: '#ffffff',
                color: TEAL_PRIMARY,
                fontWeight: 900,
                fontSize: '13px',
                padding: '4px 10px',
                borderRadius: '6px',
                letterSpacing: '1px',
              }}
            >
              ALO DOCTOR
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, opacity: 0.9 }}>
              {isAr ? 'المملكة العربية السعودية · رؤية 2030' : 'Kingdom of Saudi Arabia · Vision 2030'}
            </span>
          </div>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🔒</span>
            <span>
              {isAr
                ? 'الملف الطبي الشامل النهائي والمؤرشف (PDF 2)'
                : 'FINAL COMPREHENSIVE CLINICAL DOSSIER · PDF 2'}
            </span>
          </div>
        </div>

        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800 }}>
            {isAr
              ? 'الملف الطبي الشامل وسجل إغلاق الحالة الدائم'
              : 'Comprehensive Clinical Dossier & Permanent Archival Record'}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, lineHeight: 1.5 }}>
            {isAr
              ? 'وثيقة رسمية رقمية موحدة تتضمن الرأي الطبي الثاني المعتمد، ومداولات متابعة الـ 21 يوماً، وفاتورة هيئة الزكاة والضريبة والجمارك (ZATCA)، مع الختم الرقمي المشفر المعتمد من سدايا ومجلس الضمان الصحي.'
              : 'Consolidated official record incorporating the certified international second opinion, 21-day clinical follow-up proceedings, certified ZATCA tax receipt, and SDAIA cryptographic permanent archival seal.'}
          </p>
        </div>

        {/* Case Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.18)',
            padding: '14px 16px',
            borderRadius: '10px',
            fontSize: '11px',
          }}
        >
          <div>
            <span style={{ opacity: 0.75, display: 'block' }}>{isAr ? 'رقم الحالة السريرية:' : 'Case Reference:'}</span>
            <strong style={{ fontSize: '12px' }}>{activeCase.caseNumber || activeCase.id || 'ALO-2026-LIVE'}</strong>
          </div>
          <div>
            <span style={{ opacity: 0.75, display: 'block' }}>{isAr ? 'رقم فاتورة ZATCA:' : 'ZATCA Invoice #:'}</span>
            <strong style={{ fontSize: '12px' }}>{invoiceNum}</strong>
          </div>
          <div>
            <span style={{ opacity: 0.75, display: 'block' }}>{isAr ? 'حالة السجل:' : 'Archival Status:'}</span>
            <strong style={{ color: '#6EE7B7' }}>✓ {isAr ? 'مؤرشف ومغلق نهائياً' : 'Archived & Closed'}</strong>
          </div>
          <div>
            <span style={{ opacity: 0.75, display: 'block' }}>{isAr ? 'تاريخ الإغلاق والأرشفة:' : 'Closure Date:'}</span>
            <strong>{archiveDate}</strong>
          </div>
        </div>
      </div>

      {/* ── Subcomponent 1: Clinical Dossier & Primary Findings ── */}
      <DossierClinicalSection caseItem={activeCase} lang={lang} />

      {/* ── Subcomponent 2: International Specialist Recommendations ── */}
      <DossierRecommendationsSection
        caseItem={activeCase}
        lang={lang}
        consultantName={consultantName}
      />

      {/* ── Subcomponent 3: Saudi Treating Doctor Endorsement & QR Seal ── */}
      <DossierEndorsementQrSection
        caseItem={activeCase}
        lang={lang}
        doctorName={treatingDocName}
      />

      {/* ── ZATCA Phase 2 Official VAT Tax Invoice Card ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
          <span style={{ fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
            🧾 {isAr ? 'فاتورة ضريبة القيمة المضافة الرسمية (ZATCA Phase 2)' : 'Official ZATCA VAT Tax Invoice Record'}
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: TEAL_PRIMARY }}>
            {invoiceNum}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', fontSize: '11.5px' }}>
          <div>
            <span style={{ color: '#64748B', display: 'block' }}>{isAr ? 'باقة الاستشارة:' : 'Consultation Tier:'}</span>
            <strong>{activeCase.consultationType === 'video' ? 'Video + Written (Tier 2)' : 'Written (Tier 1)'}</strong>
          </div>
          <div>
            <span style={{ color: '#64748B', display: 'block' }}>{isAr ? 'المبلغ الأساسي:' : 'Base Amount:'}</span>
            <strong>{baseSar.toFixed(2)} SAR</strong>
          </div>
          <div>
            <span style={{ color: '#64748B', display: 'block' }}>{isAr ? 'ضريبة القيمة المضافة (15%):' : 'VAT (15%):'}</span>
            <strong>{vatSar.toFixed(2)} SAR</strong>
          </div>
          <div>
            <span style={{ color: '#64748B', display: 'block' }}>{isAr ? 'الإجمالي المسدد:' : 'Total Paid:'}</span>
            <strong style={{ color: '#059669', fontSize: '13px' }}>{totalSar.toFixed(2)} SAR</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReportComprehensiveDossier;
