import React, { useEffect, useState } from 'react';
import { ClinicalCase } from '../../../types';
import { TEAL_PRIMARY, TEAL_SECONDARY, TEAL_BG } from '../types';
import { apiClient } from '../../../services/apiClient';
import { tierById } from '../../../data/pricing';

interface ConsultantOption {
  id: string;
  name: string;
  center: string;
  city: string;
}

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
  currentModality,
  focusQs,
  cardInnerStyle,
  labelStyle,
  handleLoadSampleQuestions,
  handleUpdateQuestion,
  onUpdateCase,
  onAdvanceStage,
}) => {
  // The consultant directory is read from Postgres on mount, never from a bundled
  // constant. A list compiled into the build cannot contain a consultant enrolled
  // five minutes ago — and that is precisely who has to appear in this picker.
  const [consultants, setConsultants] = useState<ConsultantOption[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [directoryError, setDirectoryError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await apiClient.fetchDoctors(undefined, 'K');
        if (!cancelled) {
          setConsultants(
            rows.map((r) => ({ id: r.id, name: r.fullName, center: r.department || '', city: '' }))
          );
        }
      } catch {
        if (!cancelled) setDirectoryError(true);
      } finally {
        if (!cancelled) setDirectoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Selection is owned by the case (consultant.id), with the stored name as the
  // only legacy bridge. Nothing here invents a default consultant.
  const selectedConsultantId =
    activeCase.consultant?.id ||
    consultants.find((c) => c.name === activeCase.consultant?.name)?.id ||
    '';
  const consultantLocked = Boolean(activeCase.referralApproved);
  const canApprove = Boolean(selectedConsultantId) && !consultantLocked;

  return (
    <>
      {/* D04: Assign International Senior Consultant in India */}
      <div style={cardInnerStyle}>
        <span style={labelStyle}>D04 · {isAr ? 'تعيين الاستشاري الدولي بالهند' : 'Assign Indian Senior Consultant'}</span>
        <select
          disabled={consultantLocked || directoryLoading || consultants.length === 0}
          value={selectedConsultantId}
          onChange={(e) => {
            const chosen = consultants.find((c) => c.id === e.target.value);
            if (!chosen) return;
            onUpdateCase({
              consultant: {
                id: chosen.id,
                name: chosen.name,
                center: chosen.center,
                city: chosen.city,
              },
            });
          }}
          style={{
            width: '100%',
            padding: '9px 10px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '11px',
            backgroundColor: consultantLocked ? '#f1f5f9' : '#ffffff',
            outline: 'none',
            fontWeight: 700,
            color: '#0f172a',
            cursor: consultantLocked ? 'default' : 'pointer',
          }}
        >
          <option value="" disabled>
            {directoryLoading
              ? (isAr ? 'جارٍ تحميل الاستشاريين من قاعدة البيانات...' : 'Loading consultants from the database...')
              : (isAr ? 'اختر الاستشاري الدولي' : 'Select the International Consultant')}
          </option>
          {consultants.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.center ? ` — ${c.center}` : ''}
            </option>
          ))}
        </select>
        {directoryError && (
          <div style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 700, marginTop: '4px' }}>
            {isAr
              ? 'تعذر تحميل دليل الاستشاريين. لن تُقبل الإحالة دون استشاري مسجل.'
              : 'Could not load the consultant directory. A referral cannot be approved without an enrolled consultant.'}
          </div>
        )}
        {!directoryLoading && !directoryError && consultants.length === 0 && (
          <div style={{ fontSize: '10px', color: '#b45309', fontWeight: 700, marginTop: '4px' }}>
            {isAr
              ? 'لا يوجد استشاريون مسجلون — يجب على المشرف العام تسجيل استشاري دولي أولاً.'
              : 'No consultants enrolled yet — the Super Admin must enroll an international consultant first.'}
          </div>
        )}
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
                  {`Tier ${m.tier} (${tierById(m.tier).totalSar} SAR)`}
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
        disabled={!canApprove}
        onClick={() => {
          onUpdateCase({
            referralApproved: true,
            currentStage: 'AWAITING_PAYMENT',
            invoiceIssued: false, // Enforce Alo Coordinator Gate 1!
            treatingDoctor: {
              ...(activeCase.treatingDoctor || {
                name: '',
                hospital: '',
                city: '',
              }),
              focusQuestions: [focusQs[0], focusQs[1], focusQs[2]],
            },
            focusQuestions: [focusQs[0], focusQs[1], focusQs[2]],
          });
        }}
        style={{
          backgroundColor: canApprove ? TEAL_PRIMARY : '#e2e8f0',
          color: canApprove ? '#ffffff' : '#475569',
          border: canApprove ? 'none' : '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '12px',
          fontWeight: 800,
          fontSize: '11px',
          cursor: canApprove ? 'pointer' : 'not-allowed',
          opacity: canApprove ? 1 : 0.8,
          boxShadow: canApprove ? '0 4px 12px rgba(0, 123, 110, 0.3)' : 'none',
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
        ) : !selectedConsultantId ? (
          <span>{isAr ? 'D10 · اختر الاستشاري الدولي أولاً' : 'D10 · Select the International Consultant first'}</span>
        ) : (
          <span>{isAr ? 'D10 · اعتماد الطبيب السعودي المعالج للإحالة وتوجيه الملف لمنسق ألو (C01)' : 'D10 · Saudi Treating Doctor Approves Referral & Routes to Alo Coordinator (C01)'}</span>
        )}
      </button>
    </>
  );
};
