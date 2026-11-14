import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export interface DrillDownJourneyTabProps {
  caseItem: any;
  stageMeta: any;
  isRTL: boolean;
}

const STAGES = ['Intake', 'Saudi Doctor', 'ZATCA Payment', 'Consultant', 'Follow-Up', 'Closed'];

const DrillDownJourneyTab: React.FC<DrillDownJourneyTabProps> = ({ caseItem, stageMeta, isRTL }) => {
  const dir = isRTL ? 'rtl' : 'ltr';
  const currentIdx = STAGES.indexOf(stageMeta?.currentStage || 'Intake');

  return (
    <div dir={dir} style={{ fontFamily: 'Cairo, sans-serif', padding: '1.5rem', background: '#E6FAF7', borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
        {STAGES.map((stage, idx) => {
          const done = idx <= currentIdx;
          return (
            <div key={stage} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', margin: '0 auto 0.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? '#007B6E' : '#fff', border: `2px solid ${done ? '#007B6E' : '#00C6AE'}`,
                color: done ? '#fff' : '#007B6E'
              }}>
                {done ? <CheckCircle2 size={18} /> : <Clock size={18} />}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#007B6E', fontWeight: 600 }}>{stage}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, borderRight: isRTL ? '4px solid #007B6E' : 'none', borderLeft: !isRTL ? '4px solid #007B6E' : 'none' }}>
          <h4 style={{ margin: '0 0 0.5rem', color: '#007B6E', fontSize: '0.9rem' }}>Current Stage</h4>
          <p style={{ margin: 0, fontWeight: 700, color: '#1a1a1a' }}>{stageMeta?.currentStage || 'Intake'}</p>
        </div>

        <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, borderRight: isRTL ? '4px solid #00C6AE' : 'none', borderLeft: !isRTL ? '4px solid #00C6AE' : 'none' }}>
          <h4 style={{ margin: '0 0 0.5rem', color: '#007B6E', fontSize: '0.9rem' }}>Cross-Border Egress Token</h4>
          <p style={{ margin: 0, fontWeight: 700, color: '#1a1a1a', fontFamily: 'monospace' }}>{caseItem?.egressToken || 'N/A'}</p>
        </div>

        <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, borderRight: isRTL ? '4px solid #25D366' : 'none', borderLeft: !isRTL ? '4px solid #25D366' : 'none' }}>
          <h4 style={{ margin: '0 0 0.5rem', color: '#007B6E', fontSize: '0.9rem' }}>Registered Date</h4>
          <p style={{ margin: 0, fontWeight: 700, color: '#1a1a1a' }}>{caseItem?.registeredDate || new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
        </div>
      </div>
    </div>
  );
};

export default DrillDownJourneyTab;