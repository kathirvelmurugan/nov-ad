import React, { useState, useMemo } from 'react';
import { Search, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

export interface ConsultantPortalHeaderProps {
  activeCase: any;
  validCases: any[];
  isCaseClosed: boolean;
  tealPrimary: string;
  onSelectCase?: (caseId: string) => void;
}

const ConsultantPortalHeader: React.FC<ConsultantPortalHeaderProps> = ({
  activeCase,
  validCases,
  isCaseClosed,
  tealPrimary,
  onSelectCase,
}) => {
  const [filterTab, setFilterTab] = useState<'pending' | 'completed' | 'all'>('pending');
  const [search, setSearch] = useState('');

  const pendingCases = useMemo(() => {
    return (validCases || []).filter((c) => c.currentStage === 'WITH_CONSULTANT');
  }, [validCases]);

  const completedCases = useMemo(() => {
    return (validCases || []).filter((c) => c.currentStage !== 'WITH_CONSULTANT');
  }, [validCases]);

  const displayedCases = useMemo(() => {
    let list = filterTab === 'pending' ? pendingCases : filterTab === 'completed' ? completedCases : (validCases || []);
    if (list.length === 0 && filterTab === 'pending' && completedCases.length > 0) {
      list = completedCases; // Smart fallback when no pending reviews
    }
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((c) => {
      const num = (c.caseNumber || c.id || '').toLowerCase();
      const name = (c.patientName || c.patientNameEn || c.patientNameAr || '').toLowerCase();
      const diag = (c.diagnosis || c.specialty || '').toLowerCase();
      return num.includes(q) || name.includes(q) || diag.includes(q);
    });
  }, [filterTab, pendingCases, completedCases, validCases, search]);

  return (
    <header
      style={{
        direction: 'ltr',
        fontFamily: "'Cairo', sans-serif",
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
        marginBottom: '16px',
      }}
      role="banner"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #EDF2F7', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#E6FAF7', color: '#007B6E', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, border: '1px solid #A7F3D0' }}>
              <ShieldCheck size={14} /> International Specialist Telehealth Portal
            </span>
            <span style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>Apollo / KIMS Specialist Network</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
            Dr. V. Prasanth, MBBS, MS, MCh (Spine & Neuro)
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {activeCase?.caseNumber && (
            <span style={{ fontSize: '0.8125rem', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', padding: '4px 12px', borderRadius: '8px', fontWeight: 700, color: '#334155' }}>
              Active Case: <strong style={{ color: '#007B6E' }}>{activeCase.caseNumber}</strong>
            </span>
          )}
          {isCaseClosed && (
            <span style={{ backgroundColor: '#059669', color: '#FFFFFF', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700 }}>
              CLOSED ARCHIVE
            </span>
          )}
        </div>
      </div>

      {/* Caseload Manager: Tabs & Search */}
      {validCases && validCases.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setFilterTab('pending')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: filterTab === 'pending' ? '1px solid #007B6E' : '1px solid #E2E8F0',
                  backgroundColor: filterTab === 'pending' ? '#007B6E' : '#F8FAFC',
                  color: filterTab === 'pending' ? '#FFFFFF' : '#475569',
                }}
              >
                <Clock size={13} /> Pending My Review ({pendingCases.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('completed')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: filterTab === 'completed' ? '1px solid #007B6E' : '1px solid #E2E8F0',
                  backgroundColor: filterTab === 'completed' ? '#007B6E' : '#F8FAFC',
                  color: filterTab === 'completed' ? '#FFFFFF' : '#475569',
                }}
              >
                <CheckCircle2 size={13} /> Completed Opinions ({completedCases.length})
              </button>
            </div>

            {validCases.length > 2 && (
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '10px', color: '#94A3B8' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by case #..."
                  style={{
                    width: '100%',
                    padding: '6px 12px 6px 30px',
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                  }}
                />
              </div>
            )}
          </div>

          {/* Case Pills Carousel */}
          <nav
            aria-label="Consultant Cases"
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '8px',
              paddingBottom: '4px',
              scrollbarWidth: 'thin',
            }}
          >
            {displayedCases.map((c) => {
              const isActive = c.id === activeCase?.id;
              const isClosed = c.currentStage === 'CLOSED';
              const isActionable = c.currentStage === 'WITH_CONSULTANT';
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCase?.(c.id)}
                  style={{
                    flexShrink: 0,
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: `1.5px solid ${isActive ? '#007B6E' : '#CBD5E1'}`,
                    backgroundColor: isActive ? '#007B6E' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#1E293B',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(0, 123, 110, 0.25)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>{c.caseNumber || c.id}</span>
                  <span style={{ opacity: 0.6 }}>·</span>
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.patientNameEn || c.patientName || 'Patient'}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      backgroundColor: isActive ? '#005a50' : isActionable ? '#FEF3C7' : isClosed ? '#DCFCE7' : '#E2E8F0',
                      color: isActive ? '#A7F3D0' : isActionable ? '#92400E' : isClosed ? '#166534' : '#475569',
                    }}
                  >
                    {isActionable ? 'Pending' : isClosed ? 'Closed' : 'Ready'}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default ConsultantPortalHeader;