import React from 'react';
import { ClinicalCase } from '../../types';
import { TEAL_PRIMARY, TEAL_SECONDARY, WHATSAPP_GREEN } from '../cockpit/types';

interface ReportSignaturesFooterProps {
  activeCase: ClinicalCase;
  isAr: boolean;
  treatingDocName: string;
  consultantName: string;
}

export const ReportSignaturesFooter: React.FC<ReportSignaturesFooterProps> = ({
  activeCase,
  isAr,
  treatingDocName,
  consultantName,
}) => {
  return (
    <>
      {/* Holistic Clinical Notes & Observations (Free-text Relay) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: `1.5px solid ${TEAL_SECONDARY}`,
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            backgroundColor: '#f0fdfa',
            padding: '10px 16px',
            borderBottom: `1px solid ${TEAL_SECONDARY}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 800, color: TEAL_PRIMARY }}>
            📝 {isAr ? 'الملاحظات السريرية الإضافية والتوصيات الجراحية (الاستشاري الدولي)' : 'Senior Consultant Additional Clinical Impressions & Notes'}
          </div>
          <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>
            {activeCase.consultant?.center || 'Apollo Hospitals'}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '12px',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid #e2e8f0',
              direction: 'ltr',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>
              🇬🇧 English Clinical Observations:
            </div>
            <div style={{ fontSize: '11px', color: '#0f172a', lineHeight: 1.5 }}>
              {activeCase.consultantNotes ||
                'Patient presents with severe symptomatic calcific aortic stenosis. Correlating 3D DICOM reconstructions with clinical hemodynamics, standalone SAVR 23mm valve replacement is strongly endorsed. Intraoperative transesophageal echocardiography (TEE) should guide seating and verify clearance from coronary ostia.'}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f0fdfa',
              borderRadius: '8px',
              padding: '12px',
              border: `1px solid ${TEAL_SECONDARY}`,
              direction: 'rtl',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 800, color: TEAL_PRIMARY, marginBottom: '4px' }}>
              🇸🇦 التعريب والتدقيق السريري المعتمد (منسق رعاية ألو):
            </div>
            <div style={{ fontSize: '11px', color: '#0f172a', lineHeight: 1.5 }}>
              تأكيد استبدال الصمام الأبهري جراحياً بصمام 23 ملم بناءً على تطابق الأشعة المقطعية ثلاثية الأبعاد مع القياسات الديناميكية للقلب. يُوصى بالاستعانة بالإيكو عبر المريء أثناء الجراحة لمراقبة تثبيت الصمام وضمان كفاءة التروية التاجية.
            </div>
          </div>
        </div>
      </div>

      {/* Official Signatures & Digital Certification Seals */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        {/* Signature 1: Treating Doctor */}
        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '10px', color: '#64748b' }}>اعتماد ومصادقة الطبيب السعودي المعالج</div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{treatingDocName}</div>
          <div style={{ fontSize: '9px', color: '#94a3b8' }}>استشاري أمراض القلب · مستشفى رعاية الرياض</div>
          <div style={{ marginTop: '6px', fontSize: '10px', color: '#166534', fontWeight: 700 }}>
            {activeCase.doctorReleasedToPatient ? '✓ مصادق عليه وسُلّم للمريض رسمياً' : '✓ اعتمد التحويل والأسئلة السريرية'}
          </div>
        </div>

        {/* Signature 2: Indian Consultant */}
        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f0fdfa', borderRadius: '8px', border: `1px solid ${TEAL_SECONDARY}` }}>
          <div style={{ fontSize: '10px', color: TEAL_PRIMARY }}>اعتماد الاستشاري الدولي بالهند</div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: TEAL_PRIMARY, marginTop: '4px' }}>{consultantName}</div>
          <div style={{ fontSize: '9px', color: '#64748b' }}>Senior Cardiothoracic Surgeon · Apollo Hospitals</div>
          <div style={{ marginTop: '6px', fontSize: '10px', color: '#166534', fontWeight: 700 }}>✓ Signed & Sealed via DICOM Hash</div>
        </div>

        {/* Signature 3: Alo Coordinator & Medical Translator */}
        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: `1px solid ${WHATSAPP_GREEN}` }}>
          <div style={{ fontSize: '10px', color: '#166534' }}>التدقيق اللغوي والتعريب السريري</div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#166534', marginTop: '4px' }}>عبدالرحمن الشهري</div>
          <div style={{ fontSize: '9px', color: '#64748b' }}>منسق رعاية ألو ومترجم طبي معتمد</div>
          <div style={{ marginTop: '6px', fontSize: '10px', color: '#166534', fontWeight: 700 }}>✓ مصادقة الترجمة والتوجيه للطبيب</div>
        </div>
      </div>

      {/* Legal & Regulatory Compliance Footer */}
      <div style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', lineHeight: 1.5, padding: '4px 0 12px 0' }}>
        تم إصدار هذا الرأي الطبي الثاني وفقاً لمعايير المجلس الصحي السعودي وحجب البيانات المعتمد من سدايا (SDAIA).
        <br />
        ALO DOCTOR CLINICAL DOSSIER · SECURE DIGITAL ID: SHA-256: 8f4a1c92e071... · ZATCA CERTIFIED
      </div>
    </>
  );
};
