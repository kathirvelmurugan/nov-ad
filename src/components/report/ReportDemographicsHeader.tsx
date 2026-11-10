import React from 'react';
import { ClinicalCase } from '../../types';
import { TEAL_PRIMARY, TEAL_SECONDARY, WHATSAPP_GREEN } from '../cockpit/types';

interface ReportDemographicsHeaderProps {
  activeCase: ClinicalCase;
  isAr: boolean;
  patientName: string;
  patientNameEn: string;
  treatingDocName: string;
  consultantName: string;
  invoiceNum: string;
}

export const ReportDemographicsHeader: React.FC<ReportDemographicsHeaderProps> = ({
  activeCase,
  isAr,
  patientName,
  patientNameEn,
  treatingDocName,
  consultantName,
  invoiceNum,
}) => {
  return (
    <>
      {/* Document Official Header */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '20px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                backgroundColor: TEAL_PRIMARY,
                color: '#ffffff',
                padding: '3px 8px',
                borderRadius: '4px',
                fontWeight: 900,
                fontSize: '13px',
                letterSpacing: '1px',
              }}
            >
              ALO DOCTOR
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
              {isAr ? 'منصة الاستشارات الطبية الدولية المعتمدة' : 'Certified International Second Opinion Service'}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            المملكة العربية السعودية · المركز السعودي للرعاية الصحية الاتصالية وحجب الهوية (SDAIA Clean Room)
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span
            style={{
              backgroundColor: '#dcfce7',
              color: '#166534',
              border: '1px solid #86efac',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>✓</span>
            <span>SDAIA Art. 29 Tokenized ({activeCase.egressToken || 'ALO-KSA-9482'})</span>
          </span>
          <span
            style={{
              backgroundColor: '#f0fdfa',
              color: TEAL_PRIMARY,
              border: `1px solid ${TEAL_SECONDARY}`,
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 800,
            }}
          >
            MOH Telehealth Certified
          </span>
        </div>
      </div>

      {/* Patient & Referring Facility Demographics */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          fontSize: '11px',
        }}
      >
        <div>
          <span style={{ color: '#64748b', display: 'block' }}>{isAr ? 'اسم المريض:' : 'Patient Name:'}</span>
          <strong style={{ color: '#0f172a', fontSize: '13px' }}>{patientName}</strong>
          <div style={{ color: '#94a3b8', fontSize: '10px' }}>{patientNameEn} · 48Y / Male</div>
        </div>

        <div>
          <span style={{ color: '#64748b', display: 'block' }}>{isAr ? 'الطبيب السعودي المعالج (المملكة):' : 'Saudi Treating Doctor (KSA):'}</span>
          <strong style={{ color: '#0f172a', fontSize: '12px' }}>{treatingDocName}</strong>
          <div style={{ color: '#94a3b8', fontSize: '10px' }}>مستشفى رعاية الرياض / KFSHRC</div>
        </div>

        <div>
          <span style={{ color: '#64748b', display: 'block' }}>{isAr ? 'الاستشاري الدولي المعين (الهند):' : 'Assigned Senior Consultant (India):'}</span>
          <strong style={{ color: TEAL_PRIMARY, fontSize: '12px' }}>{consultantName}</strong>
          <div style={{ color: '#94a3b8', fontSize: '10px' }}>{activeCase.consultant?.center || 'Apollo Hospitals'} · {activeCase.consultant?.city || 'India'}</div>
        </div>

        <div>
          <span style={{ color: '#64748b', display: 'block' }}>{isAr ? 'نمط الاستشارة والفاتورة:' : 'Modality & ZATCA Invoice:'}</span>
          <strong style={{ color: '#0f172a', fontSize: '12px' }}>
            {activeCase.modality === 'Video' ? 'Video + Written (Tier 2)' : 'Written Opinion (Tier 1)'}
          </strong>
          <div style={{ color: WHATSAPP_GREEN, fontSize: '10px', fontWeight: 700 }}>
            ✓ {invoiceNum} · مدفوعة بالكامل عبر مدى
          </div>
        </div>
      </div>

      {/* Diagnostic Imaging Audit Summary */}
      <div
        style={{
          backgroundColor: '#f0fdf4',
          borderRadius: '12px',
          padding: '14px 18px',
          border: `1.5px solid ${WHATSAPP_GREEN}`,
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
          🔬 {isAr ? 'فحص التصوير الطبي ثلاثي الأبعاد (3D Volumetric DICOM Audit)' : '3D Volumetric DICOM Audit'}
        </div>
        <div style={{ fontSize: '11px', color: '#334155', lineHeight: 1.5 }}>
          {isAr
            ? 'تمت معاينة ومطابقة مقاطع الأشعة المقطعية متعددة الشرائح ورنين القلب المغناطيسي (سلسلة ٤: تكلسات الشرفة وحلقة الصمام الأبهري) من قبل د. براديب كومار في مستشفى أبولو بالهند.'
            : 'Multi-slice CT cardiac volumetric imaging and transesophageal echocardiography (Series #4: Annular and leaflet calcification) thoroughly reviewed by Dr. Pradeep Kumar at Apollo Hospitals.'}
        </div>
      </div>
    </>
  );
};
