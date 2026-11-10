import React from 'react';
import { ClinicalCase } from '../../types';
import { CockpitRole, TEAL_PRIMARY } from './types';

interface CockpitHeaderProps {
  activeCase: ClinicalCase;
  stageNum: number;
  isAr: boolean;
  expandedDevice: CockpitRole | null;
  onResetActiveCase?: () => void;
  onSwitchToWorkstation?: () => void;
  onCollapseExpandedDevice: () => void;
}

export const CockpitHeader: React.FC<CockpitHeaderProps> = ({
  activeCase,
  stageNum,
  isAr,
  expandedDevice,
  onResetActiveCase,
  onSwitchToWorkstation,
  onCollapseExpandedDevice,
}) => {
  return (
    <header
      style={{
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto 12px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: TEAL_PRIMARY,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span
            style={{
              backgroundColor: TEAL_PRIMARY,
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            ALO DOCTOR
          </span>
          <span>{isAr ? 'استوديو قمرة القيادة الخماسية' : '5-Role Studio Cockpit'}</span>
        </h1>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 600 }}>
          {isAr
            ? `الحالة النشطة: ${activeCase.caseNumber || activeCase.id} · ${activeCase.patientNameAr || activeCase.patientName} · المرحلة السريرية: ${Math.min(Math.max(stageNum, 1), 9)} من 9`
            : `Active Case: ${activeCase.caseNumber || activeCase.id} · ${activeCase.patientNameEn || activeCase.patientName} · Clinical Stage: ${Math.min(Math.max(stageNum, 1), 9)} of 9`}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onResetActiveCase && (
          <button
            onClick={onResetActiveCase}
            style={{
              backgroundColor: '#ffffff',
              color: '#dc2626',
              border: '1.5px solid #fecaca',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
            }}
            title={isAr ? 'بدء جولة حية جديدة من المرحلة 1' : 'Start a fresh live run from Stage 1'}
          >
            <span>🔄</span>
            <span>{isAr ? 'بدء جولة جديدة' : 'Fresh Live Run'}</span>
          </button>
        )}

        {onSwitchToWorkstation && (
          <button
            onClick={onSwitchToWorkstation}
            style={{
              backgroundColor: '#ffffff',
              color: TEAL_PRIMARY,
              border: `1px solid ${TEAL_PRIMARY}`,
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isAr ? '🖥️ وضع المحطة الفردية' : '🖥️ Single Workstation'}
          </button>
        )}

        {expandedDevice && (
          <button
            onClick={onCollapseExpandedDevice}
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isAr ? 'عرض كافة الشاشات الخمس' : 'View All 5 Devices'}
          </button>
        )}

        {onResetActiveCase && (
          <button
            onClick={onResetActiveCase}
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
            title={isAr ? 'تصفير بيانات الحالة والبدء من جديد' : 'Reset case data back to clean slate'}
          >
            {isAr ? '🔄 تصفير الحالة والبدء من جديد' : '🔄 Reset Case to Blank Slate'}
          </button>
        )}
      </div>
    </header>
  );
};
