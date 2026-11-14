import React from 'react';
import { Stethoscope, CheckCircle2, Info } from 'lucide-react';

export interface DoctorItem {
  id: string;
  name: string;
  nameEn?: string;
  specialty: string;
  specialtyEn?: string;
  hospital: string;
  hospitalEn?: string;
  city: string;
  license: string;
  tier: 1 | 2;
  isOnDuty: boolean;
}

export interface NurseDoctorAssignmentSectionProps {
  activeCase: any;
  availableDoctors: DoctorItem[];
  isCurrentStageTriage: boolean;
  isAr: boolean;
  onUpdateCase: (updated: any) => void;
}

const NurseDoctorAssignmentSection: React.FC<NurseDoctorAssignmentSectionProps> = ({
  activeCase,
  availableDoctors,
  isCurrentStageTriage,
  isAr,
  onUpdateCase,
}) => {
  const dir = isAr ? 'rtl' : 'ltr';
  const fontFamily = 'Cairo, sans-serif';

  const handleAssign = (doctor: DoctorItem) => {
    if (!activeCase || !isCurrentStageTriage) return;
    onUpdateCase({
      tier: doctor.tier,
      treatingDoctor: {
        ...activeCase?.treatingDoctor,
        name: doctor.name,
        hospital: doctor.hospital,
        city: doctor.city,
      },
      doctorSelectionPreference: 'specific_doctor',
    });
  };

  const t = (ar: string, en: string) => (isAr ? ar : en);

  return (
    <section dir={dir} style={{ fontFamily, padding: '1rem', background: '#E6FAF7', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Stethoscope size={20} color="#007B6E" />
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#007B6E' }}>
          {t('تعيين الطبيب المعالج', 'Assign Treating Doctor')}
        </h3>
      </div>

      {!isCurrentStageTriage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#007B6E', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <Info size={14} />
          <span>{t('التعيين متاح فقط في مرحلة الفرز', 'Assignment available only during triage stage')}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {availableDoctors.map((doc) => {
          const isAssigned = activeCase?.assignedDoctorId === doc.id;
          return (
            <article
              key={doc.id}
              role="button"
              className={isCurrentStageTriage ? "cursor-pointer" : ""}
              tabIndex={isCurrentStageTriage ? 0 : -1}
              aria-label={`${t('تعيين', 'Assign')} ${isAr ? doc.name : doc.nameEn ?? doc.name}`}
              onClick={() => handleAssign(doc)}
              onKeyDown={(e) => e.key === 'Enter' && handleAssign(doc)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                padding: '0.75rem',
                borderRadius: '8px',
                border: `2px solid ${isAssigned ? '#00C6AE' : '#007B6E33'}`,
                background: isAssigned ? '#00C6AE1A' : '#FFFFFF',
                cursor: isCurrentStageTriage ? 'pointer' : 'not-allowed',
                opacity: isCurrentStageTriage ? 1 : 0.6,
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#007B6E', fontSize: '0.95rem' }}>
                  {isAr ? doc.name : doc.nameEn ?? doc.name}
                </span>
                {isAssigned && <CheckCircle2 size={18} color="#25D366" aria-hidden="true" />}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#333' }}>
                {isAr ? doc.specialty : doc.specialtyEn ?? doc.specialty}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#555' }}>
                {isAr ? doc.hospital : doc.hospitalEn ?? doc.hospital} — {doc.city}
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.7rem' }}>
                <span style={{ color: '#007B6E' }}>{t('رخصة', 'Lic')}: {doc.license}</span>
                <span style={{
                  padding: '0 0.35rem',
                  borderRadius: '4px',
                  background: doc.isOnDuty ? '#25D36622' : '#007B6E11',
                  color: doc.isOnDuty ? '#25D366' : '#007B6E',
                  fontWeight: 600,
                }}>
                  {doc.isOnDuty ? t('متاح', 'On Duty') : t('غير متاح', 'Off Duty')}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default NurseDoctorAssignmentSection;