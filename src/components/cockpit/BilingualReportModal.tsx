import React, { useState, useEffect } from 'react';
import { ClinicalCase } from '../../types';
import { TEAL_PRIMARY } from './types';
import { ReportDemographicsHeader } from '../report/ReportDemographicsHeader';
import { ReportQuestionsSection, QuestionAndAnswerItem } from '../report/ReportQuestionsSection';
import { ReportSignaturesFooter } from '../report/ReportSignaturesFooter';
import { ReportComprehensiveDossier } from '../report/ReportComprehensiveDossier';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeCase: ClinicalCase;
  lang?: 'ar' | 'en';
  reportType?: 'pdf1' | 'pdf2';
}

export const BilingualReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeCase,
  lang = 'ar',
  reportType,
}) => {
  const isCaseClosedOrArchived =
    activeCase?.currentStage === 'CLOSED' ||
    Boolean(activeCase?.metadata?.pdf2Released) ||
    Boolean(activeCase?.metadata?.archived) ||
    activeCase?.status === 'closed';

  const defaultType: 'pdf1' | 'pdf2' = reportType || (isCaseClosedOrArchived ? 'pdf2' : 'pdf1');
  const [activeTab, setActiveTab] = useState<'pdf1' | 'pdf2'>(defaultType);

  useEffect(() => {
    if (reportType) {
      setActiveTab(reportType);
    } else if (isCaseClosedOrArchived) {
      setActiveTab('pdf2');
    }
  }, [reportType, isCaseClosedOrArchived, isOpen]);

  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const patientName = activeCase.patientName || activeCase.patientNameAr || (isAr ? 'المريض' : 'Patient');
  const patientNameEn = activeCase.patientName || activeCase.patientNameEn || 'Patient';
  const treatingDocName = activeCase.treatingDoctor?.name || 'د. عبدالله الشمري';
  const consultantName = activeCase.consultant?.name || 'Dr. Pradeep Kumar, MBBS, MS, MCh (CTVS)';
  const invoiceNum = activeCase.pricing?.invoiceNumber || 'INV-2026-001';

  const customAnswers = activeCase.consultantAnswers || [];
  const customQuestions = activeCase.focusQuestions || activeCase.treatingDoctor?.focusQuestions || [];

  const questionsAndAnswers: QuestionAndAnswerItem[] = [
    {
      num: 1,
      qAr: customQuestions[0] || 'هل توصي بإجراء استبدال الصمام بالقسطرة (TAVR) أم الجراحة المفتوحة (SAVR) بناءً على نتائج الإيكو ومستوى التكلس؟',
      qEn: 'Do you recommend TAVR vs open surgical SAVR given aortic annular calcification and leaflet geometry?',
      ansEn:
        customAnswers[0]?.trim() ||
        'Based on 3D DICOM volumetric reconstruction, asymmetric heavy calcification in the non-coronary cusp extends into the LVOT. Open Surgical Aortic Valve Replacement (SAVR) with a 23mm mechanical or bioprosthetic valve is strongly recommended over TAVR to prevent paravalvular leak and acute conduction block.',
      ansAr:
        'بناءً على إعادة البناء الحجمي ثلاثي الأبعاد (3D DICOM)، يظهر تكلس غير متماثل في الشرفة غير التاجية ممتد إلى مسار خروج البطين الأيسر. نوصي بشدة بإجراء استبدال الصمام الأبهري جراحياً (SAVR) بصمام 23 ملم لتجنب التسريب حول الصمام وحصار التوصيل الكهربائي مقارنة بالقسطرة.',
      clinicalRecommendation: 'SAVR Strongly Recommended / الجراحة المفتوحة موصى بها بشدة',
    },
    {
      num: 2,
      qAr: customQuestions[1] || 'ما هو التقييم الدقيق لتكلس الشريان التاجي وهل يستدعي جراحة مرافقة (CABG)؟',
      qEn: 'Does the coronary calcification and LAD lesion warrant concurrent CABG bypass grafting?',
      ansEn:
        customAnswers[1]?.trim() ||
        'Moderate 50–60% ostial LAD calcified plaque with FFR preserved (>0.82). Standalone SAVR is advised; concurrent CABG is not indicated at this stage to avoid unnecessary cardiopulmonary bypass extension.',
      ansAr:
        'لوحظ تكلس لويحي معتدل بنسبة 50-60% في منشأ الشريان الأمامي النازل، مع احتفاظ احتياطي التدفق الجزئي (FFR > 0.82). يُكتفى بالجراحة المفردة للصمام، ولا يُنصح بإجراء مجازة تاجية مرافقة حالياً.',
      clinicalRecommendation: 'No CABG Indicated / لا حاجة لمجازة تاجية مرافقة',
    },
    {
      num: 3,
      qAr: customQuestions[2] || 'ما هي خطة مضادات التخثر المقترحة للحفاظ على كفاءة الصمام؟',
      qEn: 'What antithrombotic and anticoagulant regimen is optimal for long-term valve patency?',
      ansEn:
        customAnswers[2]?.trim() ||
        'If bioprosthesis is selected: Oral anticoagulation (Warfarin, INR target 2.0–2.5) for initial 3 months, transitioning to Aspirin 81 mg daily. If mechanical: Life-long Warfarin (INR target 2.5–3.0).',
      ansAr:
        'في حال اختيار صمام نسيجي: مضاد تخثر فموي (وارفارين، الهدف 2.0-2.5) لأول 3 أشهر ثم الانتقال إلى أسبرين 81 ملغ يومياً. في حال الصمام الميكانيكي: وارفارين مدى الحياة بهدف 2.5-3.0.',
      clinicalRecommendation: 'Tailored Anticoagulation Protocol / بروتوكول تخثر مخصص',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          direction: isAr ? 'rtl' : 'ltr',
          fontFamily: isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif",
          border: `2px solid ${TEAL_PRIMARY}`,
        }}
      >
        {/* Modal Action Bar (Sticky Top) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>{activeTab === 'pdf2' ? '📑' : '📄'}</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>
                {activeTab === 'pdf2'
                  ? (isAr ? 'الملف الطبي الشامل النهائي (PDF 2) · أرشفة دائمة' : 'Final Comprehensive Clinical Dossier (PDF 2) · Archive')
                  : (isAr ? 'تقرير الرأي الطبي الثاني المعتمد (PDF 1)' : 'Certified Medical Second Opinion Report (PDF 1)')}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                Case Ref: {activeCase.caseNumber || activeCase.id || 'ALO-2026-LIVE'} · ZATCA Ref: {invoiceNum}
              </div>
            </div>
          </div>

          {/* Report Type Selector Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1e293b',
              padding: '3px',
              borderRadius: '8px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('pdf1')}
              style={{
                backgroundColor: activeTab === 'pdf1' ? TEAL_PRIMARY : 'transparent',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              📄 {isAr ? 'التقرير الأول (PDF 1)' : 'Report (PDF 1)'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pdf2')}
              style={{
                backgroundColor: activeTab === 'pdf2' ? TEAL_PRIMARY : 'transparent',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              📑 {isAr ? 'الملف الشامل (PDF 2)' : 'Final Dossier (PDF 2)'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                backgroundColor: TEAL_PRIMARY,
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🖨️</span>
              <span>{isAr ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#334155',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              aria-label={isAr ? 'إغلاق' : 'Close'}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Surface */}
        <div
          style={{
            padding: '28px 32px',
            overflowY: 'auto',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {activeTab === 'pdf2' ? (
            <ReportComprehensiveDossier
              activeCase={activeCase}
              isAr={isAr}
              patientName={patientName}
              patientNameEn={patientNameEn}
              treatingDocName={treatingDocName}
              consultantName={consultantName}
              invoiceNum={invoiceNum}
            />
          ) : (
            <>
              <ReportDemographicsHeader
                activeCase={activeCase}
                isAr={isAr}
                patientName={patientName}
                patientNameEn={patientNameEn}
                treatingDocName={treatingDocName}
                consultantName={consultantName}
                invoiceNum={invoiceNum}
              />

              <ReportQuestionsSection
                questionsAndAnswers={questionsAndAnswers}
                isAr={isAr}
              />

              <ReportSignaturesFooter
                activeCase={activeCase}
                isAr={isAr}
                treatingDocName={treatingDocName}
                consultantName={consultantName}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default BilingualReportModal;
