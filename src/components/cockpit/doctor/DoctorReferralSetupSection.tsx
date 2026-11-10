import React from 'react';
import { ClinicalCase } from '../../../types';
import { TEAL_PRIMARY, TEAL_SECONDARY, TEAL_BG } from '../types';
import { INDIAN_CONSULTANTS } from './doctorConstants';

interface DoctorReferralSetupSectionProps {
  activeCase: ClinicalCase;
  isAr: boolean;
  selectedConsultantName: string;
  currentModality: string;
  focusQs: string[];
  cardInnerStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  handleLoadSampleQuestions: () => void;
  handleUpdateQuestion: (index: number, val: string) => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  onAdvanceStage: () => void;
}

export const DoctorReferralSetupSection: React.FC<DoctorReferralSetupSectionProps> = ({
  activeCase,
  isAr,
  selectedConsultantName,
  currentModality,
  focusQs,
  cardInnerStyle,
  labelStyle,
  handleLoadSampleQuestions,
  handleUpdateQuestion,
  onUpdateCase,
  onAdvanceStage,
}) => {
  return (
    <>
      {/* D04: Assign International Senior Consultant in India */}
      <div style={cardInnerStyle}>
        <span style={labelStyle}>D04 · {isAr ? 'تعيين الاستشاري الدولي بالهند' : 'Assign Indian Senior Consultant'}</span>
        <select
          disabled={activeCase.referralApproved}
          value={selectedConsultantName}
          onChange={(e) => {
            const found = INDIAN_CONSULTANTS.find((c) => c.name === e.target.value) || INDIAN_CONSULTANTS[0];
            onUpdateCase({
              consultant: {
                name: found.name,
                center: found.center,
                city: found.city,
              },
            });
          }}
          style={{
            width: '100%',
            padding: '9px 10px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '11px',
            backgroundColor: activeCase.referralApproved ? '#f1f5f9' : '#ffffff',
            outline: 'none',
            fontWeight: 700,
            color: '#0f172a',
            cursor: activeCase.referralApproved ? 'default' : 'pointer',
          }}
        >
          {INDIAN_CONSULTANTS.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} — {c.center}
            </option>
          ))}
        </select>
        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
          {isAr
            ? 'يحدد الطبيب السعودي المعالج الاستشاري الدولي الأنسب بناءً على طبيعة الحالة.'
            : 'Saudi treating doctor selects the optimal Indian subspecialist for this case.'}
        </div>
      </div>

      {/* D05–D06: Modality Selection (Strictly 2 Choices) */}
      <div style={cardInnerStyle}>
        <span style={labelStyle}>D05–D06 · {isAr ? 'اختيار نمط الاستشارة الدولية' : 'Modality Selection'}</span>
        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
          {[
            { id: 'Written', labelAr: 'تقرير كتابي معتمد', labelEn: 'Written Opinion Only', tier: 1 },
            { id: 'Video', labelAr: 'مكالمة فيديو + تقرير', labelEn: 'Video + Written', tier: 2 },
          ].map((m) => {
            const isSelected = (currentModality === 'Video' ? 'Video' : 'Written') === m.id;
            return (
              <button
                key={m.id}
                type="button"
                disabled={activeCase.referralApproved}
                onClick={() => onUpdateCase({ modality: m.id, consultationType: m.id === 'Video' ? 'video' : 'written', tier: m.tier })}
                style={{
                  flex: 1,
                  padding: '8px 6px',
                  borderRadius: '8px',
                  border: isSelected ? `2px solid ${TEAL_PRIMARY}` : '2px solid #e2e8f0',
                  backgroundColor: isSelected ? TEAL_BG : '#ffffff',
                  cursor: activeCase.referralApproved ? 'default' : 'pointer',
                  fontWeight: 800,
                  fontSize: '10px',
                  color: isSelected ? TEAL_PRIMARY : '#64748b',
                  transition: 'all 0.15s',
                  textAlign: 'center',
                }}
              >
                <div>{isAr ? m.labelAr : m.labelEn}</div>
                <div style={{ fontSize: '9px', fontWeight: 600, color: isSelected ? TEAL_SECONDARY : '#94a3b8', marginTop: '2px' }}>
                  {m.tier === 1 ? 'Tier 1 (250 SAR)' : 'Tier 2 (450 SAR)'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* D07–D09: 3 Focus Questions */}
      <div style={cardInnerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={labelStyle}>D07–D09 · {isAr ? '٣ أسئلة تركيز سريرية' : '3 Focus Questions'}</span>
          <button
            type="button"
            onClick={handleLoadSampleQuestions}
            style={{
              backgroundColor: '#f0fdfa',
              color: TEAL_PRIMARY,
              border: `1px solid ${TEAL_SECONDARY}`,
              borderRadius: '6px',
              padding: '2px 7px',
              fontSize: '10px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isAr ? '⚡ أسئلة نموذجية' : '⚡ Sample Qs'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              type="text"
              placeholder={`${isAr ? 'السؤال' : 'Focus Question'} ${i + 1}...`}
              value={focusQs[i] || ''}
              onChange={(e) => handleUpdateQuestion(i, e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '11px',
                outline: 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* D10: Approve Referral (Strict Single-Action Lock) */}
      <button
        type="button"
        disabled={activeCase.referralApproved}
        onClick={() => {
          onUpdateCase({
            referralApproved: true,
            currentStage: 'AWAITING_PAYMENT',
            stage: 4,
            invoiceIssued: false, // Enforce Alo Coordinator Gate 1!
            treatingDoctor: {
              ...(activeCase.treatingDoctor || {
                name: 'د. عبدالله الشمري',
                hospital: 'مستشفى رعاية الرياض',
                city: 'الرياض',
              }),
              focusQuestions: [focusQs[0], focusQs[1], focusQs[2]],
            },
            focusQuestions: [focusQs[0], focusQs[1], focusQs[2]],
          });
          onAdvanceStage();
        }}
        style={{
          backgroundColor: activeCase.referralApproved ? '#e2e8f0' : TEAL_PRIMARY,
          color: activeCase.referralApproved ? '#475569' : '#ffffff',
          border: activeCase.referralApproved ? '1px solid #cbd5e1' : 'none',
          borderRadius: '8px',
          padding: '12px',
          fontWeight: 800,
          fontSize: '11px',
          cursor: activeCase.referralApproved ? 'not-allowed' : 'pointer',
          opacity: activeCase.referralApproved ? 0.8 : 1,
          boxShadow: activeCase.referralApproved ? 'none' : '0 4px 12px rgba(0, 123, 110, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        {activeCase.referralApproved ? (
          <>
            <span>✓</span>
            <span>{isAr ? 'D10 · تم اعتماد الإحالة من الطبيب السعودي المعالج وتوجيهها للمنسق' : 'D10 · Referral Approved by Saudi Treating Doctor & Routed'}</span>
          </>
        ) : (
          <span>{isAr ? 'D10 · اعتماد الطبيب السعودي المعالج للإحالة وتوجيه الملف لمنسق ألو (C01)' : 'D10 · Saudi Treating Doctor Approves Referral & Routes to Alo Coordinator (C01)'}</span>
        )}
      </button>
    </>
  );
};
