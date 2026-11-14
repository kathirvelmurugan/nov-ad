import React from 'react';
import { X } from 'lucide-react';

export interface CoordinatorCaseHeaderProps {
  currentCase: any;
  stageMeta: any;
  isArchived: boolean;
  activeTab: string;
  isAr: boolean;
  fontFamily: string;
  onClose: () => void;
}

const CoordinatorCaseHeader: React.FC<CoordinatorCaseHeaderProps> = ({
  currentCase,
  stageMeta,
  isArchived,
  activeTab,
  isAr,
  fontFamily,
  onClose,
}) => {
  const dir = isAr ? 'rtl' : 'ltr';
  const portalTitle = isAr ? 'بوابة المنسق الطبي' : 'Coordinator Portal';
  const closeLabel = isAr ? 'إغلاق التفاصيل' : 'Close Details';
  const archiveLabel = isAr ? 'مؤرشف' : 'Archived';
  const activeLabel = isAr ? 'نشط' : 'Active';

  return (
    <header
      dir={dir}
      style={{
        fontFamily,
        direction: dir,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        backgroundColor: '#E6FAF7',
        borderBottom: '2px solid #00C6AE',
        borderRadius: '8px 8px 0 0',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#007B6E' }}>
            {portalTitle}
          </h2>
          {currentCase?.caseNumber && (
            <span
              style={{
                backgroundColor: '#007B6E',
                color: '#FFFFFF',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              #{currentCase.caseNumber}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A1A' }}>
            {(isAr ? (currentCase?.patientNameAr || currentCase?.patientName) : (currentCase?.patientNameEn || currentCase?.patientName)) || currentCase?.patientLegalName || '—'}
          </span>
          {currentCase?.specialty && (
            <span
              style={{
                fontSize: '12px',
                color: '#007B6E',
                border: '1px solid #00C6AE',
                padding: '1px 8px',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
              }}
            >
              {currentCase.specialty}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {stageMeta?.label && (
          <span
            style={{
              backgroundColor: '#00C6AE',
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {stageMeta.label}
          </span>
        )}

        {isArchived ? (
          <span
            style={{
              backgroundColor: '#9CA3AF',
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {archiveLabel}
          </span>
        ) : (
          <span
            style={{
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {activeLabel}
          </span>
        )}

        <button
          onClick={onClose}
          aria-label={closeLabel}
          title={closeLabel}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: 'transparent',
            border: '1px solid #007B6E',
            color: '#007B6E',
            borderRadius: '6px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily,
            transition: 'background-color 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#007B6E';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#007B6E';
          }}
        >
          <X size={16} strokeWidth={2.5} />
          <span>{closeLabel}</span>
        </button>
      </div>
    </header>
  );
};

export default CoordinatorCaseHeader;