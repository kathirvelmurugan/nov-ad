import React from 'react';
import { AlertTriangle, Stethoscope, Send } from 'lucide-react';

export interface NurseTriageFormSectionProps {
  activeCase: any;
  isCurrentStageTriage: boolean;
  urgencyLevel: 'routine' | 'urgent' | 'stat';
  setUrgencyLevel: (level: 'routine' | 'urgent' | 'stat') => void;
  triageNotes: string;
  setTriageNotes: (notes: string) => void;
  isNotesValid: boolean;
  isDoctorAssigned: boolean;
  canAdvanceN07: boolean;
  referenceHospital: string;
  isAr: boolean;
  pendingTriageCases: any[];
  onUpdateCase: (updated: any) => void;
  onAdvanceStage: () => void;
  setSelectedCaseId: (id: string | null) => void;
  setForwardedBanner: (banner: any) => void;
}

const NurseTriageFormSection: React.FC<NurseTriageFormSectionProps> = ({
  activeCase,
  isCurrentStageTriage,
  urgencyLevel,
  setUrgencyLevel,
  triageNotes,
  setTriageNotes,
  isNotesValid,
  isDoctorAssigned,
  canAdvanceN07,
  referenceHospital,
  isAr,
  pendingTriageCases,
  onUpdateCase,
  onAdvanceStage,
  setSelectedCaseId,
  setForwardedBanner,
}) => {
  if (!isCurrentStageTriage || !activeCase) return null;

  const dir = isAr ? 'rtl' : 'ltr';
  const fontFamily = isAr ? 'Cairo, sans-serif' : 'system-ui, sans-serif';

  const handleN07Advance = () => {
    const forwardedCaseId = activeCase.id;
    const forwardedCaseNumber = activeCase.caseNumber || activeCase.id;
    const forwardedPatient = (isAr ? activeCase.patientNameAr : activeCase.patientNameEn) || activeCase.patientName || '';

    setForwardedBanner({
      caseId: forwardedCaseId,
      caseNumber: forwardedCaseNumber,
      patientName: forwardedPatient,
    });

    onUpdateCase({
      currentStage: 'DOCTOR_REVIEW',
      metadata: {
        ...(activeCase.metadata || {}),
        nurseVerified: true,
        deidentifiedAt: new Date().toISOString(),
      },
    });
    setSelectedCaseId(null);
  };

  const urgencyOptions = [
    { value: 'routine' as const, labelEn: 'Routine (48h)', labelAr: 'روتيني (٤٨ ساعة)', color: '#007B6E' },
    { value: 'urgent' as const, labelEn: 'Urgent (24h SLA)', labelAr: 'عاجل (٢٤ ساعة)', color: '#00C6AE' },
    { value: 'stat' as const, labelEn: 'Critical STAT', labelAr: 'حرج فوري', color: '#DC2626' },
  ];

  return (
    <section
      dir={dir}
      style={{ fontFamily, direction: dir, padding: '1.5rem', backgroundColor: '#E6FAF7', borderRadius: '12px' }}
      aria-label={isAr ? 'قسم تصنيف التمريض' : 'Nurse Triage Form Section'}
    >
      {/* N04 Urgency Classification */}
      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 1.5rem 0' }}>
        <legend style={{ fontSize: '1rem', fontWeight: 700, color: '#007B6E', marginBottom: '0.75rem' }}>
          <AlertTriangle size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginInlineEnd: '0.5rem' }} />
          {isAr ? 'N04 - تصنيف الاستعجال' : 'N04 - Urgency Classification'}
        </legend>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {urgencyOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setUrgencyLevel(opt.value)}
              aria-pressed={urgencyLevel === opt.value}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: urgencyLevel === opt.value ? `2px solid ${opt.color}` : '2px solid transparent',
                backgroundColor: urgencyLevel === opt.value ? opt.color : '#FFFFFF',
                color: urgencyLevel === opt.value ? '#FFFFFF' : '#333333',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily,
                transition: 'all 0.2s ease',
              }}
            >
              {isAr ? opt.labelAr : opt.labelEn}
            </button>
          ))}
        </div>
      </fieldset>

      {/* N05 Triage Notes */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label
          htmlFor="triage-notes-n05"
          style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#007B6E', marginBottom: '0.5rem' }}
        >
          {isAr ? 'N05 - ملاحظات التصنيف' : 'N05 - Triage Notes'}
        </label>
        <textarea
          id="triage-notes-n05"
          value={triageNotes}
          onChange={(e) => setTriageNotes(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder={isAr ? 'أدخل ملخص التقييم السريري...' : 'Enter clinical assessment summary...'}
          aria-invalid={!isNotesValid}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: isNotesValid ? '1px solid #00C6AE' : '2px solid #DC2626',
            fontFamily,
            fontSize: '0.95rem',
            resize: 'vertical',
            boxSizing: 'border-box',
            backgroundColor: '#FFFFFF',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem', fontSize: '0.8rem' }}>
          <span style={{ color: !isNotesValid ? '#DC2626' : '#666666' }}>
            {!isNotesValid && (isAr ? 'ملاحظات التصنيف مطلوبة' : 'Triage notes are required')}
          </span>
          <span style={{ color: '#666666' }}>{triageNotes.length}/500</span>
        </div>
      </div>

      {/* N06 Doctor Check */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem',
          backgroundColor: isDoctorAssigned ? '#E6FAF7' : '#FEF2F2',
          borderRadius: '8px',
          border: `1px solid ${isDoctorAssigned ? '#00C6AE' : '#FCA5A5'}`,
          marginBottom: '1.5rem',
        }}
        role="status"
        aria-live="polite"
      >
        <Stethoscope size={20} color={isDoctorAssigned ? '#007B6E' : '#DC2626'} />
        <span style={{ fontWeight: 600, color: isDoctorAssigned ? '#007B6E' : '#DC2626', fontFamily }}>
          {isAr
            ? isDoctorAssigned
              ? 'N06 - تم تعيين طبيب معالج'
              : 'N06 - لم يتم تعيين طبيب بعد'
            : isDoctorAssigned
              ? 'N06 - Treating doctor assigned'
              : 'N06 - No doctor assigned yet'}
        </span>
      </div>

      {/* N07 Stage Advance */}
      <button
        type="button"
        onClick={handleN07Advance}
        disabled={!canAdvanceN07}
        aria-label={isAr ? 'N07 اعتماد وتحويل للطبيب المعالج السعودي' : 'N07 Approve & route to Saudi treating doctor (D02)'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.625rem',
          width: '100%',
          padding: '0.875rem 1.5rem',
          backgroundColor: canAdvanceN07 ? '#25D366' : '#CBD5E1',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '10px',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: canAdvanceN07 ? 'pointer' : 'not-allowed',
          fontFamily,
          transition: 'background-color 0.2s ease',
        }}
      >
        <Send size={18} />
        {isAr ? 'N07 - اعتماد وتحويل للطبيب المعالج السعودي (D02)' : 'N07 - Approve & route to Saudi treating doctor (D02)'}
      </button>
    </section>
  );
};

export default NurseTriageFormSection;