import React, { useState, useEffect, useMemo } from 'react';

interface Consultant {
  name: string;
  center: string;
}

interface CaseRecord {
  id: string;
  caseNumber: string;
  patientName: string;
  status: string;
  consultant?: Consultant;
  milestones: Array<{ id: string; label: string; completed: boolean }>;
}

interface DoctorReviewViewProps {
  cases: CaseRecord[];
  personaId?: string;
}

const DOCTOR_REVIEW_STRINGS = {
  ar: {
    title: 'مراجعة الطبيب',
    consultantOpinion: 'رأي الاستشاري الدولي',
    noCases: 'لا توجد حالات للمراجعة',
    loading: 'جاري التحميل...',
  },
  en: {
    title: 'Doctor Review',
    consultantOpinion: 'International Consultant Opinion',
    noCases: 'No cases available for review',
    loading: 'Loading...',
  },
};

export const DoctorReviewView: React.FC<DoctorReviewViewProps> = ({ cases, personaId }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [dir, setDir] = useState<'rtl' | 'ltr'>('rtl');

  useEffect(() => {
    const root = document.documentElement;
    const currentDir = root.getAttribute('dir') as 'rtl' | 'ltr' || 'rtl';
    const currentLang = currentDir === 'rtl' ? 'ar' : 'en';
    setDir(currentDir);
    setLang(currentLang);
  }, [personaId]);

  const t = DOCTOR_REVIEW_STRINGS[lang];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = new URLSearchParams(window.location.search);
    const qCase = search.get('caseId') || search.get('case_id');
    if (qCase && cases.length > 0) {
      const match = cases.find((c) => c.id === qCase || c.caseNumber === qCase);
      if (match && selectedCaseId !== match.id) {
        setSelectedCaseId(match.id);
      }
    } else if (!qCase && cases.length > 0 && !selectedCaseId) {
      setSelectedCaseId(cases[0].id);
    }
  }, [cases, selectedCaseId]);

  const activeCase = useMemo(() => {
    if (!selectedCaseId) return null;
    return cases.find((c) => c.id === selectedCaseId) || null;
  }, [cases, selectedCaseId]);

  const pendingDoctorCases = useMemo(() => {
    return cases.filter((c) => c.status === 'pending_review' || c.status === 'active');
  }, [cases]);

  const displayCase = activeCase || (pendingDoctorCases.length > 0 ? pendingDoctorCases[0] : null);

  return (
    <div
      dir={dir}
      style={{
        fontFamily: 'Cairo, sans-serif',
        direction: dir,
        backgroundColor: '#E6FAF7',
        minHeight: '100vh',
        padding: '24px',
        color: '#1A1A1A',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          borderBottom: '2px solid #00C6AE',
          paddingBottom: '16px',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#007B6E', margin: 0 }}>
          {t.title}
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#007B6E', fontWeight: 600 }}>
            ALO DOCTOR v2.4
          </span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        <aside
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #00C6AE',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 123, 110, 0.05)',
          }}
        >
          <div
            style={{
              backgroundColor: '#007B6E',
              color: '#FFFFFF',
              padding: '16px',
              fontWeight: 700,
              fontSize: '16px',
            }}
          >
            {lang === 'ar' ? 'قائمة الحالات' : 'Case Queue'}
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {cases.length === 0 && (
              <li style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                {t.loading}
              </li>
            )}
            {cases.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSelectedCaseId(c.id)}
                  aria-pressed={selectedCaseId === c.id}
                  style={{
                    width: '100%',
                    textAlign: dir === 'rtl' ? 'right' : 'left',
                    padding: '16px',
                    border: 'none',
                    borderBottom: '1px solid #E6FAF7',
                    backgroundColor: selectedCaseId === c.id ? '#E6FAF7' : 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'Cairo, sans-serif',
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#007B6E', fontSize: '14px' }}>
                    {c.caseNumber}
                  </span>
                  <span style={{ fontSize: '13px', color: '#333' }}>{c.patientName}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #00C6AE',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 123, 110, 0.05)',
          }}
        >
          {!displayCase ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '400px',
                color: '#007B6E',
                fontWeight: 600,
              }}
            >
              {t.noCases}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <section>
                <h2 style={{ fontSize: '22px', color: '#007B6E', marginBottom: '16px', fontWeight: 700 }}>
                  {displayCase.caseNumber} - {displayCase.patientName}
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {displayCase.milestones.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: m.completed ? '#E6FAF7' : '#F9F9F9',
                        border: `1px solid ${m.completed ? '#00C6AE' : '#E0E0E0'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: m.completed ? '#25D366' : '#CCC',
                        }}
                        aria-hidden="true"
                      />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section
                style={{
                  backgroundColor: '#E6FAF7',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #00C6AE',
                }}
                aria-label={t.consultantOpinion}
              >
                <h3
                  style={{
                    fontSize: '18px',
                    color: '#007B6E',
                    marginBottom: '16px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007B6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {t.consultantOpinion}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>
                    {displayCase.consultant?.name || 'Dr. V. Prasanth'}
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#007B6E', fontWeight: 600 }}>
                    {displayCase.consultant?.center || 'Apollo Hospitals / Cross-Border Specialist Center'}
                  </p>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

interface CoordinatorPortalViewProps {
  cases: CaseRecord[];
  personaId?: string;
}

const COORDINATOR_STRINGS = {
  ar: {
    title: 'بوابة المنسق',
    tabs: {
      c08: 'C08 - PDF 1',
      c10: 'C10 - PDF 2 (الإغلاق)',
    },
    actions: {
      releasePdf2: 'إصدار PDF 2 وإغلاق الحالة',
      closeCompletely: 'إغلاق نهائي',
    },
    noCases: 'لا توجد حالات نشطة للتنسيق',
  },
  en: {
    title: 'Coordinator Portal',
    tabs: {
      c08: 'C08 - PDF 1',
      c10: 'C10 - PDF 2 (Closure)',
    },
    actions: {
      releasePdf2: 'Release PDF 2 & Close Case',
      closeCompletely: 'Close Completely',
    },
    noCases: 'No active cases for coordination',
  },
};

type CoordinatorTab = 'c08' | 'closure';

export const CoordinatorPortalView: React.FC<CoordinatorPortalViewProps> = ({ cases, personaId }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CoordinatorTab>('c08');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [dir, setDir] = useState<'rtl' | 'ltr'>('rtl');

  useEffect(() => {
    const root = document.documentElement;
    const currentDir = root.getAttribute('dir') as 'rtl' | 'ltr' || 'rtl';
    const currentLang = currentDir === 'rtl' ? 'ar' : 'en';
    setDir(currentDir);
    setLang(currentLang);
  }, [personaId]);

  const t = COORDINATOR_STRINGS[lang];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = new URLSearchParams(window.location.search);
    const qCase = search.get('caseId') || search.get('case_id');
    if (qCase && cases.length > 0) {
      const match = cases.find((c) => c.id === qCase || c.caseNumber === qCase);
      if (match && selectedCaseId !== match.id) {
        setSelectedCaseId(match.id);
      }
    } else if (!qCase && cases.length > 0 && !selectedCaseId) {
      setSelectedCaseId(cases[0].id);
    }
  }, [cases, selectedCaseId]);

  const activeCase = useMemo(() => {
    if (!selectedCaseId) return null;
    return cases.find((c) => c.id === selectedCaseId) || null;
  }, [cases, selectedCaseId]);

  const handleReleasePDF2 = () => {
    if (!activeCase) return;
    setActiveTab('closure');
  };

  const handleCloseCaseCompletely = () => {
    if (!activeCase) return;
    setActiveTab('closure');
  };

  return (
    <div
      dir={dir}
      style={{
        fontFamily: 'Cairo, sans-serif',
        direction: dir,
        backgroundColor: '#E6FAF7',
        minHeight: '100vh',
        padding: '24px',
        color: '#1A1A1A',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          borderBottom: '2px solid #00C6AE',
          paddingBottom: '16px',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#007B6E', margin: 0 }}>
          {t.title}
        </h1>
        <span style={{ fontSize: '14px', color: '#007B6E', fontWeight: 600 }}>
          ALO DOCTOR v2.4
        </span>
      </header>

      <nav
        role="tablist"
        aria-label={lang === 'ar' ? 'تبويبات التنسيق' : 'Coordination Tabs'}
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '2px solid #00C6AE',
          paddingBottom: '0',
        }}
      >
        <button
          role="tab"
          aria-selected={activeTab === 'c08'}
          onClick={() => setActiveTab('c08')}
          style={{
            padding: '12px 24px',
            fontFamily: 'Cairo, sans-serif',
            fontWeight: 700,
            fontSize: '15px',
            border: 'none',
            borderBottom: activeTab === 'c08' ? '3px solid #007B6E' : '3px solid transparent',
            backgroundColor: activeTab === 'c08' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'c08' ? '#007B6E' : '#666',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '-2px',
            borderRadius: '8px 8px 0 0',
          }}
        >
          {t.tabs.c08}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'closure'}
          onClick={() => setActiveTab('closure')}
          style={{
            padding: '12px 24px',
            fontFamily: 'Cairo, sans-serif',
            fontWeight: 700,
            fontSize: '15px',
            border: 'none',
            borderBottom: activeTab === 'closure' ? '3px solid #25D366' : '3px solid transparent',
            backgroundColor: activeTab === 'closure' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'closure' ? '#007B6E' : '#666',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '-2px',
            borderRadius: '8px 8px 0 0',
          }}
        >
          {t.tabs.c10}
        </button>
      </nav>

      <main
        role="tabpanel"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #00C6AE',
          padding: '32px',
          boxShadow: '0 4px 6px rgba(0, 123, 110, 0.05)',
          minHeight: '400px',
        }}
      >
        {!activeCase ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
              color: '#007B6E',
              fontWeight: 600,
              fontSize: '16px',
            }}
          >
            {t.noCases}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '16px',
                borderBottom: '1px solid #E6FAF7',
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#007B6E', fontWeight: 700 }}>
                  {activeCase.caseNumber}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                  {activeCase.patientName}
                </p>
              </div>
              <span
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  backgroundColor: activeTab === 'closure' ? '#25D366' : '#00C6AE',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                {activeTab === 'closure'
                  ? lang === 'ar'
                    ? 'مغلق'
                    : 'Closed'
                  : lang === 'ar'
                  ? 'نشط'
                  : 'Active'}
              </span>
            </div>

            {activeTab === 'c08' && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '18px', color: '#1A1A1A', fontWeight: 700, margin: 0 }}>
                  {lang === 'ar' ? 'مراجعة المستند الأول' : 'PDF 1 Review'}
                </h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, margin: 0 }}>
                  {lang === 'ar'
                    ? 'تم إصدار المستند الأول بنجاح. يمكنك المتابعة لإصدار المستند الثاني وإغلاق الحالة.'
                    : 'PDF 1 has been successfully released. You may proceed to release PDF 2 and close the case.'}
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    onClick={handleReleasePDF2}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#007B6E',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontFamily: 'Cairo, sans-serif',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#005C52')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007B6E')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    {t.actions.releasePdf2}
                  </button>
                </div>
              </section>
            )}

            {activeTab === 'closure' && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '18px', color: '#1A1A1A', fontWeight: 700, margin: 0 }}>
                  {lang === 'ar' ? 'ملف الإغلاق النهائي' : 'Final Sealed Archival Dossier'}
                </h3>
                <div
                  style={{
                    padding: '24px',
                    backgroundColor: '#E6FAF7',
                    borderRadius: '12px',
                    border: '1px solid #00C6AE',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#25D366',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#007B6E', fontSize: '16px' }}>
                        {lang === 'ar' ? 'تم إغلاق الحالة بنجاح' : 'Case Successfully Closed'}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                        {lang === 'ar'
                          ? 'تم إصدار المستند الثاني وأرشفتة الملف بالكامل.'
                          : 'PDF 2 released and dossier fully archived.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    onClick={handleCloseCaseCompletely}
                    disabled
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#E0E0E0',
                      color: '#666',
                      border: 'none',
                      borderRadius: '8px',
                      fontFamily: 'Cairo, sans-serif',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'not-allowed',
                    }}
                    aria-disabled="true"
                  >
                    {t.actions.closeCompletely}
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};