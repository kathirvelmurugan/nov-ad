import React, { useState, useEffect, useMemo } from 'react';
import { ClinicalCase, Persona, UserSession, StaffAccountRecord, TenantHospital } from '../../types';
import { PLATFORM_USERS_KEY, TENANTS_KEY } from '../../hooks/workflowConstants';
import { Stethoscope, CheckCircle2, Eye, X, MousePointerClick } from 'lucide-react';
import { PortalCaseTrackerPanel, getStageBadgeMeta } from '../common/PortalCaseTrackerPanel';
import { apiClient } from '../../services/apiClient';
import NurseCaseHeader from './nurse/NurseCaseHeader';
import NurseAuditDeidSection from './nurse/NurseAuditDeidSection';
import NurseDoctorAssignmentSection from './nurse/NurseDoctorAssignmentSection';
import NurseTriageFormSection from './nurse/NurseTriageFormSection';
import { generateDefaultNotes, buildAvailableDoctors } from './nurse/nurseHelpers';

interface Props {
  activeCase?: ClinicalCase;
  cases?: ClinicalCase[];
  onSelectCase?: (caseId: string) => void;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  lang?: 'ar' | 'en';
  userSession?: UserSession | null;
  activePersona?: Persona;
}

export const NurseTriageView: React.FC<Props> = ({ 
  activeCase, 
  cases = [],
  onSelectCase,
  onAdvanceStage, 
  onUpdateCase, 
  lang = 'ar',
  userSession,
  activePersona
}) => {
  const [urgencyLevel, setUrgencyLevel] = useState<'routine' | 'urgent' | 'stat'>('urgent');
  const [forwardedBanner, setForwardedBanner] = useState<{ caseId: string; caseNumber: string; patientName: string } | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const isAr = lang === 'ar';
  const nurseName = userSession?.fullName || activePersona?.name || (isAr ? 'ممرضة ألو' : 'ALO Nurse');

  useEffect(() => {
    if (!forwardedBanner) return;
    const timer = setTimeout(() => setForwardedBanner(null), 8000);
    return () => clearTimeout(timer);
  }, [forwardedBanner]);

  const pendingTriageCases = useMemo(() => {
    return cases.filter((c) => c.currentStage === 'NURSE_CHECK' || c.currentStage === 'INTAKE_RECEIVED');
  }, [cases]);

  // Intelligent Caseload Auto-Selection: Auto-default to the first pending triage case
  const defaultActionableCase = pendingTriageCases[0] || (activeCase?.id ? activeCase : cases[0]);
  const effectiveCaseId = selectedCaseId !== null ? selectedCaseId : defaultActionableCase?.id || null;
  const currentCase = effectiveCaseId ? (cases.find((c) => c.id === effectiveCaseId) || null) : null;
  const referenceHospital = currentCase?.treatingDoctor?.hospital || activeCase?.treatingDoctor?.hospital || (isAr ? 'المستشفى الشريك المعتمد' : 'Partner Accredited Hospital');

  const [triageNotes, setTriageNotes] = useState<string>(() => generateDefaultNotes(currentCase || activeCase, isAr));
  const [liveStaff, setLiveStaff] = useState<StaffAccountRecord[] | null>(null);
  const [liveHospitals, setLiveHospitals] = useState<TenantHospital[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient.fetchUsers().then((users) => {
      if (!cancelled && Array.isArray(users) && users.length > 0) {
        setLiveStaff(users);
        try { localStorage.setItem(PLATFORM_USERS_KEY, JSON.stringify(users)); } catch {}
      }
    }).catch(() => {});
    apiClient.fetchTenants().then((tenants) => {
      if (!cancelled && Array.isArray(tenants) && tenants.length > 0) {
        setLiveHospitals(tenants);
        try { localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants)); } catch {}
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const availableDoctors = useMemo(() => buildAvailableDoctors(liveStaff, liveHospitals, isAr), [isAr, liveStaff, liveHospitals]);

  const activeCaseObj = currentCase || activeCase;
  const isCurrentStageTriage = currentCase ? (currentCase.currentStage === 'NURSE_CHECK' || currentCase.currentStage === 'INTAKE_RECEIVED') : false;

  const isDoctorAssigned = Boolean(
    activeCaseObj?.treatingDoctor?.name &&
    activeCaseObj.treatingDoctor.name.trim().length > 0 &&
    activeCaseObj.treatingDoctor.name !== 'Pending Selection' &&
    activeCaseObj.treatingDoctor.name !== 'قيد التحديد السريري'
  );
  const isNotesValid = (triageNotes || '').trim().length >= 20;
  const canAdvanceN07 = Boolean(currentCase && isCurrentStageTriage && isDoctorAssigned && isNotesValid);

  useEffect(() => {
    if (currentCase) setTriageNotes(generateDefaultNotes(currentCase, isAr));
  }, [currentCase?.id, isAr]);

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    onSelectCase?.(caseId);
  };

  if (cases.length === 0) {
    return (
      <div data-testid="nurse-triage-empty" className="max-w-2xl mx-auto my-12 text-center p-10 card-clinical space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-alo-teal flex items-center justify-center mx-auto text-2xl border border-teal-200">
          <Stethoscope className="w-8 h-8 text-alo-teal" />
        </div>
        <h3 className="text-xl font-black text-alo-navy dark:text-slate-100">{isAr ? 'لا توجد حالات سريرية في قائمة الفرز حالياً' : 'No Cases in Triage Queue'}</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">{isAr ? 'صندوق الفرز السريري محدّث بالكامل.' : 'Clinical triage inbox is up to date.'}</p>
      </div>
    );
  }

  const stageMeta = currentCase && !isCurrentStageTriage ? getStageBadgeMeta(currentCase.currentStage, isAr) : null;

  return (
    <div data-testid="nurse-triage-view" className="max-w-4xl mx-auto space-y-6">
      <div className="w-full">
        <PortalCaseTrackerPanel
          cases={cases}
          activeCaseId={selectedCaseId || ''}
          onSelectCase={handleSelectCase}
          lang={lang}
          portalTitleAr="صندوق الفرز وتتبع الحالات · التمريض"
          portalTitleEn="Nurse Triage Queue & Case Tracking"
          actionablePredicate={(c) => c.currentStage === 'NURSE_CHECK' || c.currentStage === 'INTAKE_RECEIVED'}
        />
      </div>

      {!currentCase ? (
        <div className="card-clinical p-8 text-center space-y-3 bg-white dark:bg-slate-900 border border-dashed border-slate-300 rounded-2xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 flex items-center justify-center text-[#007B6E]">
            <MousePointerClick className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-800 dark:text-slate-100">{isAr ? 'يرجى اختيار حالة من قائمة الفرز والتتبع أعلاه' : 'Select a Case from the Queue Above'}</h3>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 rounded-xl px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-teal-900 dark:text-teal-200">{isAr ? 'عرض تفاصيل الحالة:' : 'Viewing Case:'}</span>
              <span className="font-mono font-bold text-[#007B6E]">{currentCase.caseNumber || currentCase.id}</span>
              <span className="text-slate-400">·</span>
              <span className="font-bold text-slate-700">{isAr ? (currentCase.patientNameAr || currentCase.patientName) : (currentCase.patientNameEn || currentCase.patientName)}</span>
            </div>
            <button type="button" onClick={() => setSelectedCaseId(null)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold cursor-pointer">
              <X className="w-3.5 h-3.5" />
              <span>{isAr ? 'إغلاق التفاصيل' : 'Close Details'}</span>
            </button>
          </div>

          {!isCurrentStageTriage && stageMeta && (
            <div className="card-clinical p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-extrabold">{isAr ? 'وضع التتبع (للقراءة فقط)' : 'Tracking Mode (Read-Only)'}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${stageMeta.colorClass}`}>{stageMeta.label}</span>
              </div>
              {pendingTriageCases.length > 0 && (
                <button type="button" onClick={() => handleSelectCase(pendingTriageCases[0].id)} className="px-4 py-2 bg-alo-teal text-white text-xs font-bold rounded-lg cursor-pointer">
                  {isAr ? 'الانتقال إلى الحالة المنتظرة للفرز' : 'Jump to Next Triage Case'}
                </button>
              )}
            </div>
          )}

          <NurseCaseHeader activeCase={activeCaseObj} nurseName={nurseName} referenceHospital={referenceHospital} isAr={isAr} />
          <NurseAuditDeidSection activeCase={activeCaseObj} nurseName={nurseName} isAr={isAr} />
          <NurseDoctorAssignmentSection activeCase={activeCaseObj} availableDoctors={availableDoctors} isCurrentStageTriage={isCurrentStageTriage} isAr={isAr} onUpdateCase={onUpdateCase} />
          <NurseTriageFormSection
            activeCase={activeCaseObj}
            isCurrentStageTriage={isCurrentStageTriage}
            urgencyLevel={urgencyLevel}
            setUrgencyLevel={setUrgencyLevel}
            triageNotes={triageNotes}
            setTriageNotes={setTriageNotes}
            isNotesValid={isNotesValid}
            isDoctorAssigned={isDoctorAssigned}
            canAdvanceN07={canAdvanceN07}
            referenceHospital={referenceHospital}
            isAr={isAr}
            pendingTriageCases={pendingTriageCases}
            onUpdateCase={onUpdateCase}
            onAdvanceStage={onAdvanceStage}
            setSelectedCaseId={setSelectedCaseId}
            setForwardedBanner={setForwardedBanner}
          />
        </>
      )}

      {forwardedBanner && (
        <aside role="status" dir={isAr ? 'rtl' : 'ltr'} className="fixed bottom-6 inset-x-4 max-w-4xl mx-auto z-50 p-4 bg-white/95 border-2 border-emerald-400 rounded-2xl flex items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="text-xs font-extrabold text-emerald-800 uppercase">{isAr ? 'تم النقل بنجاح' : 'Forwarded'}</span>
              <p className="text-sm font-bold text-slate-800">
                {isAr ? `تم نقل الحالة [${forwardedBanner.caseNumber}] إلى المرحلة التالية ← الطبيب السعودي` : `Case [${forwardedBanner.caseNumber}] moved to Saudi Doctor`}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => setForwardedBanner(null)} className="w-8 h-8 flex items-center justify-center text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}
    </div>
  );
};
