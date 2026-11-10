import React from 'react';
import { TEAL_PRIMARY, TEAL_ACCENT, TEAL_BG, getBadgeStyle } from './coordinatorStyles';

interface Props {
  lang: 'ar' | 'en';
  proposedSlots: Array<{ id: string; time: string }>;
  confirmedSlotId?: string;
  isProcessing: boolean;
  onConfirmSlot: (slotId: string) => void;
}

export const CoordinatorTelehealthTab: React.FC<Props> = ({
  lang,
  proposedSlots,
  confirmedSlotId,
  isProcessing,
  onConfirmSlot,
}) => {
  const isAr = lang === 'ar';
  const fontFamily = isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const t = {
    c07_title: isAr ? 'تأكيد موعد المكالمة' : 'Call Slot Confirmation',
    c07_proposed: isAr ? 'الأوقات المقترحة من الاستشاري الهندي' : 'Proposed time slots from Indian consultant',
    c07_confirm: isAr ? 'تأكيد الموعد' : 'Confirm Slot',
    c07_confirmed: isAr ? 'تم التأكيد' : 'Confirmed',
  };

  return (
    <section aria-labelledby="c07-heading">
      <h2 id="c07-heading" style={{ fontSize: '20px', color: TEAL_PRIMARY, marginBottom: '8px', fontFamily }}>
        {t.c07_title}
      </h2>
      <p style={{ fontSize: '14px', color: '#4A5568', marginBottom: '24px', fontFamily }}>
        {t.c07_proposed}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {proposedSlots.map((slot) => {
          const isConfirmed = confirmedSlotId === slot.id;
          return (
            <div
              key={slot.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderRadius: '12px',
                border: `2px solid ${isConfirmed ? TEAL_ACCENT : TEAL_BG}`,
                backgroundColor: isConfirmed ? `${TEAL_BG}` : '#FFFFFF',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL_PRIMARY} strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{ fontWeight: 600, fontSize: '15px', fontFamily }}>{slot.time}</span>
              </div>
              {isConfirmed ? (
                <span style={getBadgeStyle('success', fontFamily)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t.c07_confirmed}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onConfirmSlot(slot.id)}
                  disabled={isProcessing || !!confirmedSlotId}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${TEAL_PRIMARY}`,
                    backgroundColor: 'transparent',
                    color: TEAL_PRIMARY,
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: confirmedSlotId ? 'not-allowed' : 'pointer',
                    opacity: confirmedSlotId ? 0.5 : 1,
                    fontFamily,
                  }}
                >
                  {t.c07_confirm}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
