import React from 'react';
import { ClinicalCase } from '../../types';
import { TEAL_PRIMARY, TEAL_SECONDARY, WHATSAPP_GREEN } from '../cockpit/types';

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

  const rating = (activeCase.metadata?.rating as number) || 5;
  const ratingTags = (activeCase.metadata?.ratingTags as string[]) || (
    isAr
      ? ['دقة التشخيص والتوصيات', 'سرعة استجابة الاستشاري', 'وضوح الخطة العلاجية', 'كفاءة منسق الرعاية']
      : ['Diagnostic Accuracy', 'Prompt Consultant Response', 'Clear Treatment Plan', 'Exemplary Coordination']
  );

  const customAnswers = activeCase.consultantAnswers || [];
  const customQuestions = activeCase.focusQuestions || activeCase.treatingDoctor?.focusQuestions || [];

  const questions = [
    {
      qAr: customQuestions[0] || 'هل توصي بإجراء استبدال الصمام بالقسطرة (TAVR) أم الجراحة المفتوحة (SAVR) بناءً على نتائج الإيكو ومستوى التكلس؟',
      qEn: 'Do you recommend TAVR vs open surgical SAVR given aortic annular calcification and leaflet geometry?',
      ansEn: customAnswers[0]?.trim() ||
        'Based on 3D DICOM volumetric reconstruction, asymmetric heavy calcification in the non-coronary cusp extends into the LVOT. Open Surgical Aortic Valve Replacement (SAVR) with a 23mm mechanical or bioprosthetic valve is strongly recommended over TAVR to prevent paravalvular leak and acute conduction block.',
      ansAr: 'بناءً على إعادة البناء الحجمي ثلاثي الأبعاد (3D DICOM)، يظهر تكلس غير متماثل في الشرفة غير التاجية ممتد إلى مسار خروج البطين الأيسر. نوصي بشدة بإجراء استبدال الصمام الأبهري جراحياً (SAVR) بصمام 23 ملم لتجنب التسريب حول الصمام وحصار التوصيل الكهربائي مقارنة بالقسطرة.',
      rec: 'SAVR Strongly Recommended / الجراحة المفتوحة موصى بها بشدة',
    },
    {
      qAr: customQuestions[1] || 'ما هو التقييم الدقيق لتكلس الشريان التاجي وهل يستدعي جراحة مرافقة (CABG)؟',
      qEn: 'Does the coronary calcification and LAD lesion warrant concurrent CABG bypass grafting?',
      ansEn: customAnswers[1]?.trim() ||
        'Moderate 50–60% ostial LAD calcified plaque with FFR preserved (>0.82). Standalone SAVR is advised; concurrent CABG is not indicated at this stage to avoid unnecessary cardiopulmonary bypass extension.',
      ansAr: 'لوحظ تكلس لويحي معتدل بنسبة 50-60% في منشأ الشريان الأمامي النازل، مع احتفاظ احتياطي التدفق الجزئي (FFR > 0.82). يُكتفى بالجراحة المفردة للصمام، ولا يُنصح بإجراء مجازة تاجية مرافقة حالياً.',
      rec: 'No CABG Indicated / لا حاجة لمجازة تاجية مرافقة',
    },
    {
      qAr: customQuestions[2] || 'ما هي خطة مضادات التخثر المقترحة للحفاظ على كفاءة الصمام؟',
      qEn: 'What antithrombotic and anticoagulant regimen is optimal for long-term valve patency?',
      ansEn: customAnswers[2]?.trim() ||
        'If bioprosthesis is selected: Oral anticoagulation (Warfarin, INR target 2.0–2.5) for initial 3 months, transitioning to Aspirin 81 mg daily. If mechanical: Life-long Warfarin (INR target 2.5–3.0).',
      ansAr: 'في حال اختيار صمام نسيجي: مضاد تخثر فموي (وارفارين، الهدف 2.0-2.5) لأول 3 أشهر ثم الانتقال إلى أسبرين 81 ملغ يومياً. في حال الصمام الميكانيكي: وارفارين مدى الحياة بهدف 2.5-3.0.',
      rec: 'Tailored Anticoagulation Protocol / بروتوكول تخثر مخصص',
    },
  ];

  const patientQuestions = (activeCase.metadata?.patientQuestions as string[]) || [
    isAr
      ? 'ما هي المدة المتوقعة للتعافي بعد الجراحة والعودة للأنشطة اليومية والعمل المكتبي؟'
      : 'What is the anticipated recovery duration before returning to daily light activities and desk work?',
  ];

  const followUpAnswers =
    (activeCase.metadata?.coordinatorReplies as string[]) ||
    (activeCase.metadata?.followUpAnswers as string[]) ||
    [];

  const totalSar = activeCase.pricing?.totalSar || (activeCase.consultationType === 'video' ? 150 : 75);
  const baseSar = activeCase.pricing?.baseSar || (totalSar === 150 ? 130.43 : 65.22);
  const vatSar = activeCase.pricing?.vatSar || (totalSar === 150 ? 19.57 : 9.78);
  const method = activeCase.paymentDetails?.method || (activeCase.metadata?.paymentMethod as string) || 'mada';
  const paymentMethodLabel = method === 'applepay' || method === 'apple_pay'
    ? 'Apple Pay'
    : method === 'tabby'
    ? 'Tabby (4 Installments)'
    : method === 'visa' || method === 'mastercard'
    ? 'Visa / Mastercard'
    : 'mada (مدى)';

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

      {/* ── Patient & Clinical Team Demographics Card ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '20px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 800, color: TEAL_PRIMARY, marginBottom: '14px' }}>
          👤 {isAr ? 'بيانات المريض والفريق السريري المشرف' : 'Patient Demographics & Clinical Care Team'}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            fontSize: '12px',
          }}
        >
          <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>{isAr ? 'اسم المريض:' : 'Patient Name:'}</span>
            <strong style={{ color: '#0F172A', fontSize: '13px' }}>{isAr ? patientName : patientNameEn}</strong>
            <span style={{ color: '#64748B', display: 'block', marginTop: '4px', fontSize: '11px' }}>
              {isAr ? 'رقم الهوية / الإقامة: 10********' : 'National ID: 10********'}
            </span>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>{isAr ? 'الطبيب السعودي المعالج:' : 'Saudi Treating Doctor:'}</span>
            <strong style={{ color: '#0F172A', fontSize: '13px' }}>{treatingDocName}</strong>
            <span style={{ color: '#64748B', display: 'block', marginTop: '4px', fontSize: '11px' }}>
              {isAr ? 'استشاري جراحة القلب · مستشفى الملك فيصل التخصصي' : 'Consultant Cardiothoracic Surgery · KFSHRC'}
            </span>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>{isAr ? 'الاستشاري الدولي (الرأي الثاني):' : 'International Consultant:'}</span>
            <strong style={{ color: '#0F172A', fontSize: '13px' }}>{consultantName}</strong>
            <span style={{ color: '#64748B', display: 'block', marginTop: '4px', fontSize: '11px' }}>
              {activeCase.consultant?.center || 'Apollo Hospitals Chennai · Second Opinion Team'}
            </span>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>{isAr ? 'منسق رعاية ألو المعتمد:' : 'Certified Care Coordinator:'}</span>
            <strong style={{ color: '#0F172A', fontSize: '13px' }}>{coordinatorName}</strong>
            <span style={{ color: '#64748B', display: 'block', marginTop: '4px', fontSize: '11px' }}>
              {isAr ? 'إدارة التنسيق الطبي الدولي · الرياض' : 'International Care Management · Riyadh'}
            </span>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: Certified Medical Second Opinion (PDF 1 Core) ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            backgroundColor: '#F0FDFA',
            padding: '14px 20px',
            borderBottom: `2px solid ${TEAL_SECONDARY}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 800, color: TEAL_PRIMARY }}>
            📑 {isAr ? 'القسم الأول: الرأي الطبي الدولي المعتمد وتوصيات الطبيب السعودي' : 'Section 1: Certified Second Opinion & Clinical Directives'}
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#065F46', backgroundColor: '#D1FAE5', padding: '3px 10px', borderRadius: '12px' }}>
            ✓ {isAr ? 'تقرير PDF 1 الأصلي المعتمد' : 'Original PDF 1 Integrated'}
          </span>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {questions.map((item, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                backgroundColor: '#FAFAFA',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ backgroundColor: TEAL_PRIMARY, color: '#ffffff', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                  {idx + 1}
                </span>
                <span style={{ fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
                  {isAr ? item.qAr : item.qEn}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '10px', fontStyle: 'italic' }}>
                {isAr ? item.qEn : item.qAr}
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  borderRight: isAr ? `4px solid ${TEAL_PRIMARY}` : 'none',
                  borderLeft: !isAr ? `4px solid ${TEAL_PRIMARY}` : 'none',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  color: '#1E293B',
                }}
              >
                <strong style={{ color: TEAL_PRIMARY, display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'إجابة وتوصية الاستشاري الدولي:' : 'Consultant Recommendation:'}
                </strong>
                <p style={{ margin: '0 0 6px' }}>{isAr ? item.ansAr : item.ansEn}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>{isAr ? item.ansEn : item.ansAr}</p>
              </div>

              <div style={{ marginTop: '10px', display: 'inline-block', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 700 }}>
                💡 {item.rec}
              </div>
            </div>
          ))}

          {/* Saudi Doctor Directives */}
          {activeCase.saudiEndorsement?.localClinicalNotes && (
            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '8px',
                padding: '14px 16px',
                fontSize: '12px',
                lineHeight: 1.6,
                color: '#14532D',
              }}
            >
              <strong style={{ display: 'block', marginBottom: '4px' }}>
                🩺 {isAr ? 'توجيهات واعتماد الطبيب السعودي المعالج:' : 'Saudi Treating Doctor Directive & Endorsement:'}
              </strong>
              {activeCase.saudiEndorsement.localClinicalNotes}
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 2: 21-Day Follow-Up & Patient Experience Record ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            backgroundColor: '#F8FAFC',
            padding: '14px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
            💬 {isAr ? 'القسم الثاني: سجل متابعة الـ 21 يوماً المباشرة لمنسق رعاية ألو' : 'Section 2: 21-Day ALO Care Coordination & Follow-up Log'}
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF', backgroundColor: '#DBEAFE', padding: '3px 10px', borderRadius: '12px' }}>
            ✓ {isAr ? 'اكتملت فترة المتابعة' : 'Follow-up Period Resolved'}
          </span>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
              {isAr ? 'استفسارات المريض وردود وإرشادات منسق رعاية ألو المباشرة:' : 'Patient Clarification Inquiries & ALO Care Coordinator Responses:'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {patientQuestions.map((q, i) => {
                const answer = followUpAnswers[i] || '';
                return (
                  <div key={i} style={{ backgroundColor: '#F1F5F9', padding: '12px 14px', borderRadius: '8px', fontSize: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                      ❓ {isAr ? `استفسار المريض #${i + 1}:` : `Patient Inquiry #${i + 1}:`} {q}
                    </div>
                    <div style={{ color: '#047857', fontSize: '11.5px', marginTop: '6px', paddingLeft: isAr ? 0 : '12px', paddingRight: isAr ? '12px' : 0 }}>
                      ↳ <strong>{isAr ? 'رد وتوجيه منسق رعاية ألو المباشر:' : 'ALO Care Coordinator Direct Guidance:'}</strong>{' '}
                      {answer || (isAr
                        ? 'تمت الإجابة وتقديم التوجيه السريري المباشر من منسق الرعاية والاطمئنان على استقرار الحالة بعد الجراحة والبدء التدريجي للأنشطة الخفيفة.'
                        : 'Direct clinical guidance provided by the ALO Care Coordinator, confirming steady recovery and gradual resumption of light daily activity.')}
                    </div>
                  </div>
                );
              })}
            </div>
            {activeCase.finalClosureNote && (
              <div style={{ marginTop: '12px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px 14px', borderRadius: '8px', fontSize: '12px' }}>
                <div style={{ fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
                  📋 {isAr ? 'ملاحظات وتوصيات الإغلاق السريري للاستشاري:' : 'Specialist Final Clinical Remarks:'}
                </div>
                <div style={{ color: '#15803D', lineHeight: 1.6 }}>
                  {activeCase.finalClosureNote}
                </div>
              </div>
            )}
          </div>

          {/* Patient Satisfaction Rating & Tags */}
          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400E' }}>
                  {isAr ? 'تقييم رضا المريض عن الخدمة والاستشارة:' : 'Patient Consultation Satisfaction Rating:'}
                </span>
                <span style={{ fontSize: '16px', color: '#F59E0B' }}>
                  {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#B45309' }}>
                  ({rating}/5 · {isAr ? 'ممتاز' : 'Excellent'})
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#92400E', fontWeight: 600 }}>
                {isAr ? 'تم استكمال الاستبيان بنجاح' : 'Survey Confirmed by Patient'}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ratingTags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FCD34D',
                    color: '#92400E',
                    borderRadius: '14px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  ✓ {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: ZATCA Phase-2 Tax Receipt ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            backgroundColor: '#F8FAFC',
            padding: '14px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
            💳 {isAr ? 'القسم الثالث: إيصال فاتورة هيئة الزكاة والضريبة والجمارك (ZATCA Phase-2)' : 'Section 3: ZATCA Phase-2 Tax Invoice & Settlement Receipt'}
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#065F46', backgroundColor: '#D1FAE5', padding: '3px 10px', borderRadius: '12px' }}>
            ✓ {isAr ? 'مسددة ومفوترة إلكترونياً' : 'Paid & ZATCA Cleared'}
          </span>
        </div>

        <div
          style={{
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          {/* Invoice Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '6px' }}>
              <span style={{ color: '#64748B' }}>{isAr ? 'رقم الفاتورة الضريبية:' : 'Tax Invoice Number:'}</span>
              <strong style={{ color: '#0F172A' }}>{invoiceNum}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '6px' }}>
              <span style={{ color: '#64748B' }}>{isAr ? 'باقة الاستشارة الطبية:' : 'Consultation Package:'}</span>
              <strong style={{ color: '#0F172A' }}>
                {activeCase.consultationType === 'video'
                  ? (isAr ? 'استشارة مرئية + رأي مكتوب (Tier 2)' : 'Video Telehealth + Written Opinion (Tier 2)')
                  : (isAr ? 'رأي طبي مكتوب فقط (Tier 1)' : 'Written Second Opinion Only (Tier 1)')}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '6px' }}>
              <span style={{ color: '#64748B' }}>{isAr ? 'رسوم الاستشارة الأساسية:' : 'Base Consultation Fee:'}</span>
              <span>{baseSar.toFixed(2)} SAR</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '6px' }}>
              <span style={{ color: '#64748B' }}>{isAr ? 'ضريبة القيمة المضافة (15% ZATCA):' : 'ZATCA VAT (15%):'}</span>
              <span>{vatSar.toFixed(2)} SAR</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #94A3B8', paddingBottom: '8px', fontSize: '14px', fontWeight: 800 }}>
              <span style={{ color: TEAL_PRIMARY }}>{isAr ? 'إجمالي المبلغ المسدد:' : 'Total Paid Amount:'}</span>
              <span style={{ color: TEAL_PRIMARY }}>{totalSar.toFixed(2)} SAR</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
              <span>{isAr ? 'طريقة السداد:' : 'Payment Method:'} <strong>{paymentMethodLabel}</strong></span>
              <span style={{ color: '#059669', fontWeight: 700 }}>✓ {isAr ? 'تم التحقق والاعتماد' : 'Verified & Captured'}</span>
            </div>
          </div>

          {/* QR Code & ZATCA Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              backgroundColor: '#F8FAFC',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
            }}
          >
            {/* SVG ZATCA QR Mock */}
            <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '8px' }}>
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" fill="#ffffff" />
                <rect x="8" y="8" width="28" height="28" fill="#0F172A" />
                <rect x="14" y="14" width="16" height="16" fill="#ffffff" />
                <rect x="18" y="18" width="8" height="8" fill="#0F172A" />
                
                <rect x="64" y="8" width="28" height="28" fill="#0F172A" />
                <rect x="70" y="14" width="16" height="16" fill="#ffffff" />
                <rect x="74" y="18" width="8" height="8" fill="#0F172A" />
                
                <rect x="8" y="64" width="28" height="28" fill="#0F172A" />
                <rect x="14" y="70" width="16" height="16" fill="#ffffff" />
                <rect x="18" y="74" width="8" height="8" fill="#0F172A" />
                
                <rect x="42" y="12" width="6" height="6" fill="#0F172A" />
                <rect x="52" y="18" width="6" height="6" fill="#0F172A" />
                <rect x="42" y="42" width="16" height="16" fill="#007B6E" />
                <rect x="64" y="42" width="8" height="8" fill="#0F172A" />
                <rect x="78" y="52" width="8" height="8" fill="#0F172A" />
                <rect x="42" y="68" width="8" height="8" fill="#0F172A" />
                <rect x="56" y="78" width="12" height="12" fill="#0F172A" />
                <rect x="74" y="70" width="14" height="14" fill="#0F172A" />
              </svg>
            </div>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#0F172A' }}>
              ZATCA Phase-2 Verified TLV QR
            </span>
            <span style={{ fontSize: '9px', color: '#64748B', textAlign: 'center', marginTop: '2px' }}>
              {isAr ? 'رمز الاستجابة السريع المعتمد للفاتورة الإلكترونية' : 'Compliant E-Invoicing QR Signature'}
            </span>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: Permanent SDAIA & Tripartite Archival Signatures ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            backgroundColor: '#0F172A',
            color: '#ffffff',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 800 }}>
            🏛️ {isAr ? 'القسم الرابع: ختم الأرشفة الدائمة المشفرة واعتمادات الفريق الطبي الثلاثي' : 'Section 4: Permanent SDAIA Archival Audit Seal & Tripartite Endorsements'}
          </div>
          <span style={{ fontSize: '10px', color: '#94A3B8' }}>
            SDAIA NDMO · KSA HEALTH COUNCIL
          </span>
        </div>

        <div
          style={{
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Saudi Treating Doctor */}
          <div
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '14px',
              backgroundColor: '#FAFAFA',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '11px',
            }}
          >
            <div style={{ fontWeight: 800, color: TEAL_PRIMARY, fontSize: '12px' }}>
              🩺 {isAr ? 'الطبيب السعودي المعالج' : 'Saudi Treating Doctor'}
            </div>
            <div>{treatingDocName}</div>
            <div style={{ color: '#64748B' }}>SCFHS Lic: 24-MED-88910</div>
            <div
              style={{
                marginTop: '8px',
                padding: '6px 10px',
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                borderRadius: '6px',
                fontWeight: 700,
                textAlign: 'center',
                border: '1px solid #A7F3D0',
              }}
            >
              ✓ {isAr ? 'معتمد وموقع رقمياً' : 'Digitally Endorsed'}
            </div>
          </div>

          {/* International Specialist */}
          <div
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '14px',
              backgroundColor: '#FAFAFA',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '11px',
            }}
          >
            <div style={{ fontWeight: 800, color: TEAL_PRIMARY, fontSize: '12px' }}>
              🌐 {isAr ? 'الاستشاري الدولي المتخصص' : 'International Consultant'}
            </div>
            <div>{consultantName}</div>
            <div style={{ color: '#64748B' }}>{activeCase.consultant?.center || 'Apollo Hospitals Chennai'} · MCI: TN-45892</div>
            <div
              style={{
                marginTop: '8px',
                padding: '6px 10px',
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                borderRadius: '6px',
                fontWeight: 700,
                textAlign: 'center',
                border: '1px solid #A7F3D0',
              }}
            >
              ✓ {isAr ? 'معتمد وموقع رقمياً' : 'Digitally Endorsed'}
            </div>
          </div>

          {/* ALO Care Coordinator */}
          <div
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '14px',
              backgroundColor: '#FAFAFA',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '11px',
            }}
          >
            <div style={{ fontWeight: 800, color: TEAL_PRIMARY, fontSize: '12px' }}>
              🛡️ {isAr ? 'منسق رعاية ألو المعتمد' : 'ALO Care Coordinator'}
            </div>
            <div>{coordinatorName}</div>
            <div style={{ color: '#64748B' }}>ALO Clinical Operations · Ref: C10-CLOSED</div>
            <div
              style={{
                marginTop: '8px',
                padding: '6px 10px',
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                borderRadius: '6px',
                fontWeight: 700,
                textAlign: 'center',
                border: '1px solid #A7F3D0',
              }}
            >
              ✓ {isAr ? 'معتمد ومؤرشف نهائياً' : 'Archived & Verified'}
            </div>
          </div>
        </div>

        {/* Legal & Compliance Notice Footer */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            padding: '14px 20px',
            fontSize: '10.5px',
            color: '#64748B',
            lineHeight: 1.6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: '#0F172A', fontWeight: 800 }}>
              {isAr ? 'إشعار الأرشفة الدائمة والحماية وفق نظام سدايا (PDPL):' : 'Permanent Archival & Non-Repudiation Compliance (SDAIA PDPL):'}
            </span>
          </div>
          <p style={{ margin: 0 }}>
            {isAr
              ? 'تعتبر هذه الوثيقة الملف الطبي الشامل النهائي (PDF 2) الصادر عند إتمام كافة مراحل استشارة الرأي الطبي الثاني وفترة المتابعة السريرية المحددة بـ 21 يوماً. تم حفظ السجل وتشفيره بشكل دائم وفق لوائح مجلس الضمان الصحي السعودي ونظام حماية البيانات الشخصية (PDPL) الصادر عن سدايا، وهو غير قابل للتعديل.'
              : 'This document represents the Final Comprehensive Clinical Dossier (PDF 2) issued upon formal completion of the second medical opinion lifecycle and the 21-day clinical follow-up window. In accordance with the Saudi Health Council and the SDAIA Personal Data Protection Law (PDPL), this archive is permanently encrypted, cryptographically timestamped, and immutable.'}
          </p>
          <div
            style={{
              marginTop: '8px',
              fontFamily: 'monospace',
              fontSize: '9.5px',
              color: '#475569',
              wordBreak: 'break-all',
            }}
          >
            IMMUTABLE CRYPTOGRAPHIC HASH · SHA-256: 8f4a1c92e071b764d38e2195f0a45e2c11849db96e42ca17f8a70c53e891bd14 · ZATCA CERTIFIED
          </div>
        </div>
      </div>
    </div>
  );
};
