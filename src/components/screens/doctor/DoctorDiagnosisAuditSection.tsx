import React from 'react';
import { FileCheck2 } from 'lucide-react';

export interface DoctorDiagnosisAuditSectionProps {
  activeCase: any;
  isAr: boolean;
}

const DoctorDiagnosisAuditSection: React.FC<DoctorDiagnosisAuditSectionProps> = ({ activeCase, isAr }) => {
  if (!activeCase) return null;

  const dir = isAr ? 'rtl' : 'ltr';
  const diagnosis = isAr
    ? activeCase.diagnosisAr || activeCase.diagnosis || 'لا يوجد تشخيص'
    : activeCase.diagnosis || activeCase.diagnosisAr || 'No diagnosis available';

  const symptoms = isAr
    ? activeCase.symptomsAr || activeCase.symptoms || 'لا توجد أعراض مسجلة'
    : activeCase.symptoms || activeCase.symptomsAr || 'No symptoms recorded';

  const scansTitle = isAr ? 'فحوصات سريرية موثقة (D02-D04)' : 'Verified Clinical Scans (D02-D04)';
  const diagnosisLabel = isAr ? 'التشخيص' : 'Diagnosis';
  const symptomsLabel = isAr ? 'الأعراض' : 'Symptoms';
  const noScans = isAr ? 'لا توجد فحوصات متاحة' : 'No scans available';

  const hasScans = activeCase.scans && Array.isArray(activeCase.scans) && activeCase.scans.length > 0;

  return (
    <section dir={dir} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'Cairo, sans-serif' }}>
      <div style={{ background: '#E6FAF7', borderRadius: '12px', padding: '1.25rem', border: '1px solid #00C6AE' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#007B6E', fontSize: '1.1rem', fontWeight: 700 }}>
          {diagnosisLabel}
        </h3>
        <p style={{ margin: 0, color: '#1a1a1a', lineHeight: 1.7, fontSize: '0.95rem' }}>
          {diagnosis}
        </p>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E6FAF7' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#007B6E', fontSize: '1.1rem', fontWeight: 700 }}>
          {symptomsLabel}
        </h3>
        <p style={{ margin: 0, color: '#333333', lineHeight: 1.7, fontSize: '0.95rem' }}>
          {symptoms}
        </p>
      </div>

      {/* Dynamic Medications & Allergies if recorded */}
      {((activeCase.currentMedications && activeCase.currentMedications.length > 0) || (activeCase.allergies && activeCase.allergies.length > 0) || (activeCase.redFlags && activeCase.redFlags.length > 0)) && (
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {activeCase.redFlags && activeCase.redFlags.length > 0 && (
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', display: 'block', marginBottom: '0.25rem' }}>
                {isAr ? 'علامات ومؤشرات الخطورة المحددة:' : 'Reported Red-Flag Signs:'}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {activeCase.redFlags.map((f: string, i: number) => (
                  <span key={i} style={{ fontSize: '0.75rem', fontWeight: 600, background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #fde68a' }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
          {activeCase.currentMedications && activeCase.currentMedications.length > 0 && (
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f766e', display: 'block', marginBottom: '0.25rem' }}>
                {isAr ? 'الأدوية الحالية للمريض:' : 'Active Patient Prescriptions:'}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {activeCase.currentMedications.map((m: string, i: number) => (
                  <span key={i} style={{ fontSize: '0.75rem', fontWeight: 600, background: '#f0fdfa', color: '#115e59', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #ccfbf1' }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
          {activeCase.allergies && activeCase.allergies.length > 0 && (
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#be123c', display: 'block', marginBottom: '0.25rem' }}>
                {isAr ? 'الحساسية الدوائية المسجلة:' : 'Known Drug Allergies:'}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {activeCase.allergies.map((a: string, i: number) => (
                  <span key={i} style={{ fontSize: '0.75rem', fontWeight: 600, background: '#fff1f2', color: '#9f1239', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #fecdd3' }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #007B6E' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <FileCheck2 size={22} color="#007B6E" strokeWidth={2.5} />
          <h3 style={{ margin: 0, color: '#007B6E', fontSize: '1.1rem', fontWeight: 700 }}>
            {scansTitle}
          </h3>
        </div>
        {hasScans ? (
          <ul style={{ margin: 0, padding: isAr ? '0 1.25rem 0 0' : '0 0 0 1.25rem', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {activeCase.scans.map((scan: any, index: number) => (
              <li key={scan.id || index} style={{ color: '#333333', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {isAr ? scan.nameAr || scan.name : scan.name || scan.nameAr}
                {scan.code && (
                  <span style={{ color: '#00C6AE', fontWeight: 600, marginInlineStart: '0.5rem' }}>
                    [{scan.code}]
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, color: '#666666', fontSize: '0.9rem' }}>{noScans}</p>
        )}
      </div>
    </section>
  );
};

export default DoctorDiagnosisAuditSection;