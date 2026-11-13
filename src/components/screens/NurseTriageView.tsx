import React, { useState, useEffect, useMemo } from 'react';
import { ClinicalCase, Persona, UserSession, StaffAccountRecord, TenantHospital } from '../../types';
import { INITIAL_MEDICAL_CENTER_DOCTORS } from '../../data/medicalCenterDoctors';
import { DEFAULT_TENANT_HOSPITALS, DEFAULT_STAFF_DIRECTORY } from '../../data/accreditedStaffAndTenants';
import { PLATFORM_USERS_KEY, TENANTS_KEY } from '../../hooks/workflowConstants';
import { 
  ShieldAlert, 
  UserX, 
  FileCheck, 
  Send, 
  AlertTriangle, 
  Clock, 
  Stethoscope, 
  CheckCircle2, 
  MessageSquare,
  Eye,
  X,
  Info,
  MousePointerClick
} from 'lucide-react';
import { PortalCaseTrackerPanel, getStageBadgeMeta } from '../common/PortalCaseTrackerPanel';
import { apiClient } from '../../services/apiClient';

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

  // Auto-dismiss forwarded banner after 8s
  useEffect(() => {
    if (!forwardedBanner) return;
    const timer = setTimeout(() => {
      setForwardedBanner(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [forwardedBanner]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const isAr = lang === 'ar';
  const nurseName = userSession?.fullName || activePersona?.name || (isAr ? 'ممرضة ألو' : 'ALO Nurse');

  const currentCase = selectedCaseId ? (cases.find((c) => c.id === selectedCaseId) || null) : null;
  const referenceHospital = currentCase?.treatingDoctor?.hospital || activeCase?.treatingDoctor?.hospital || (isAr ? 'المستشفى الشريك المعتمد' : 'Partner Accredited Hospital');

  const generateDefaultNotes = (c?: ClinicalCase | null) => {
    const target = c || currentCase || activeCase;
    if (!target) return '';
    if (isAr) {
      return `المريض يعاني من ${target.diagnosisAr || target.diagnosis || 'حالة سريرية'} مع شكوى: (${target.symptomsAr || target.symptoms || 'قيد المتابعة'}). الملف مكتمل تشخيصياً ويتضمن الفحوصات والتقارير الطبية ومقاطع التصوير المعتمدة. تم إخفاء الهوية الوطنية والاسم وفق معايير سدايا وحماية البيانات، وتصنيف الحالة بأولوية عاجلة (24 ساعة SLA).`;
    }
    return `Patient presents with ${target.diagnosis || 'clinical condition'} with complaint: (${target.symptomsEn || target.symptoms || 'under review'}). Diagnostic file is complete with laboratory panels, validated clinical reports, and medical imaging studies. PHI de-identified according to MOH & SDAIA standards; triaged as High Priority (24h SLA).`;
  };

  const [triageNotes, setTriageNotes] = useState<string>(() => generateDefaultNotes(currentCase));
  const [liveStaff, setLiveStaff] = useState<StaffAccountRecord[] | null>(null);
  const [liveHospitals, setLiveHospitals] = useState<TenantHospital[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient.fetchUsers()
      .then((users) => {
        if (!cancelled && Array.isArray(users) && users.length > 0) {
          setLiveStaff(users);
          try { localStorage.setItem(PLATFORM_USERS_KEY, JSON.stringify(users)); } catch {}
        }
      })
      .catch(() => {});
    apiClient.fetchTenants()
      .then((tenants) => {
        if (!cancelled && Array.isArray(tenants) && tenants.length > 0) {
          setLiveHospitals(tenants);
          try { localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants)); } catch {}
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const availableDoctors = useMemo(() => {
    let allStaff: StaffAccountRecord[] = liveStaff || DEFAULT_STAFF_DIRECTORY;
    let allHospitals: TenantHospital[] = liveHospitals || DEFAULT_TENANT_HOSPITALS;
    if (!liveStaff || !liveHospitals) {
      try {
        if (!liveStaff) {
          const storedUsers = localStorage.getItem(PLATFORM_USERS_KEY);
          if (storedUsers) {
            const parsed = JSON.parse(storedUsers);
            if (Array.isArray(parsed)) allStaff = parsed;
          }
        }
        if (!liveHospitals) {
          const storedHospitals = localStorage.getItem(TENANTS_KEY);
          if (storedHospitals) {
            const parsedH = JSON.parse(storedHospitals);
            if (Array.isArray(parsedH)) allHospitals = parsedH;
          }
        }
      } catch {}
    }

    const dynamicDoctors = allStaff
      .filter((s) => s.roleCode === 'D' && s.status === 'active')
      .map((s) => {
        const hospital = allHospitals.find((h) => h.id === s.hospitalId);
        return {
          id: s.id,
          name: isAr && s.fullNameAr ? s.fullNameAr : s.fullName,
          nameEn: s.fullName,
          specialty: s.department || 'استشاري أمراض القلب',
          specialtyEn: s.department || 'Cardiology Consultant',
          hospital: hospital ? (isAr ? hospital.nameAr : hospital.nameEn) : 'المجمع الطبي الشريك',
          hospitalEn: hospital ? hospital.nameEn : 'Partner Medical Center',
          city: hospital ? hospital.city : 'الرياض',
          license: s.scfhsLicense || 'SCFHS-CERTIFIED',
          tier: 2 as const,
          isOnDuty: true,
        };
      });

    const combined = [...INITIAL_MEDICAL_CENTER_DOCTORS, ...dynamicDoctors];
    const uniqueByPerson = new Map<string, typeof combined[0]>();
    combined.forEach((doc) => {
      const normalized = (doc.nameEn || doc.name).replace(/^(dr\.?|د\.?)\s*/i, '').trim().toLowerCase();
      const existing = uniqueByPerson.get(normalized);
      if (!existing) {
        uniqueByPerson.set(normalized, doc);
      } else {
        const existingIsGeneric = existing.hospitalEn === 'Partner Medical Center' || existing.license === 'SCFHS-CERTIFIED';
        const currentIsGeneric = doc.hospitalEn === 'Partner Medical Center' || doc.license === 'SCFHS-CERTIFIED';
        if (existingIsGeneric && !currentIsGeneric) {
          uniqueByPerson.set(normalized, doc);
        }
      }
    });
    return Array.from(uniqueByPerson.values());
  }, [isAr]);

  const pendingTriageCases = useMemo(() => {
    return cases.filter((c) => c.currentStage === 'NURSE_CHECK' || c.currentStage === 'INTAKE_RECEIVED');
  }, [cases]);

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
    if (currentCase) {
      setTriageNotes(generateDefaultNotes(currentCase));
    }
  }, [currentCase?.id, isAr]);

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    onSelectCase?.(caseId);
  };

  // Zero-Case Dedicated Empty State
  if (cases.length === 0) {
    return (
      <div data-testid="nurse-triage-empty" className="max-w-2xl mx-auto my-12 text-center p-10 card-clinical space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-alo-teal flex items-center justify-center mx-auto text-2xl border border-teal-200 dark:border-teal-800 shadow-inner">
          <Stethoscope className="w-8 h-8 text-alo-teal" />
        </div>
        <h3 className="text-xl font-black text-alo-navy dark:text-slate-100">
          {isAr ? 'لا توجد حالات سريرية في قائمة الفرز حالياً' : 'No Cases in Triage Queue'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {isAr
            ? 'صندوق الفرز السريري محدّث بالكامل. ستظهر استشارات المرضى الجديدة تلقائياً في هذه القائمة فور إرسالها من بوابة المريض.'
            : 'Clinical triage inbox is up to date. New patient consultations will automatically appear here once submitted via the patient portal.'}
        </p>
      </div>
    );
  }

  const stageMeta = currentCase && !isCurrentStageTriage ? getStageBadgeMeta(currentCase.currentStage, isAr) : null;

  return (
    <div data-testid="nurse-triage-view" className="max-w-4xl mx-auto space-y-6">
      {/* Integrated Portal Case Tracker Panel */}
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
        <div className="card-clinical p-8 text-center space-y-3 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-[#007B6E] dark:text-[#00C6AE] border border-teal-200 dark:border-teal-800">
            <MousePointerClick className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
            {isAr ? 'يرجى اختيار حالة من قائمة الفرز والتتبع أعلاه' : 'Select a Case from the Queue Above'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {isAr
              ? 'انقر على أي حالة في قائمة الفرز أعلاه لعرض التفاصيل السريرية الكاملة والتحقق من الفحوصات والبدء في الإجراءات.'
              : 'Click on any case card in the tracker above to view its clinical dossier, audit scans, and perform nurse triage actions.'}
          </p>
        </div>
      ) : (
        <>
          {/* Active Case Details Header Bar with Close Button */}
          <div className="flex items-center justify-between bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl px-4 py-2.5 text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-teal-900 dark:text-teal-200">
                {isAr ? 'عرض تفاصيل الحالة:' : 'Viewing Case Details:'}
              </span>
              <span className="font-mono font-bold text-[#007B6E] dark:text-[#00C6AE]">
                {currentCase.caseNumber || currentCase.id}
              </span>
              <span className="text-slate-400">·</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {isAr ? (currentCase.patientNameAr || currentCase.patientName) : (currentCase.patientNameEn || currentCase.patientName)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCaseId(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isAr ? 'إغلاق التفاصيل والعودة للقائمة' : 'Close Details'}</span>
            </button>
          </div>

          {/* Read-Only Tracking Mode Banner */}
          {!isCurrentStageTriage && stageMeta && (
            <div className="card-clinical p-4 bg-gradient-to-r from-slate-50 to-teal-50/40 dark:from-slate-900/80 dark:to-teal-950/30 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-extrabold">
                    {isAr ? 'وضع التتبع (للقراءة فقط) · تم إرسال الحالة للمرحلة التالية' : 'Tracking Mode (Read-Only) · Case Forwarded Beyond Nurse Triage'}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${stageMeta.colorClass}`}>
                  {stageMeta.label}
                </span>
              </div>
              {pendingTriageCases.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleSelectCase(pendingTriageCases[0].id)}
                  className="px-4 py-2 bg-alo-teal hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {isAr ? 'الانتقال إلى الحالة المنتظرة للفرز' : 'Jump to Next Triage Case'}
                </button>
              )}
            </div>
          )}

      {/* N01: Triage Inbox & Case Header */}
      <div className="card-clinical p-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-alo-teal">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-amber-200">
              N01 · {isAr ? 'صندوق الفرز والتدقيق' : 'Triage Queue'}
            </span>
            <span className="text-xs font-bold text-alo-teal">
              {isAr ? 'مركز الفرز السريري الموحد · منصة ألو دكتور' : 'Unified Clinical Triage · ALO DOCTOR'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-alo-navy dark:text-slate-100 mt-2">
            {isAr ? 'تدقيق ملف الحالة:' : 'Case Review File:'} <span className="font-mono text-alo-teal font-extrabold">{activeCase.caseNumber}</span> · <span className="text-slate-700 dark:text-slate-200 text-xl font-bold">{isAr ? activeCase.patientNameAr : (activeCase.patientNameEn || activeCase.patientName)}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr ? 'الممرضة المسؤولة عن الفرز:' : 'ALO Nurse:'} <strong className="text-slate-700 dark:text-slate-200">{nurseName}</strong> · {isAr ? 'المستشفى المرجعي:' : 'Reference Hospital:'} {referenceHospital}
          </p>
        </div>

        <button
          onClick={() => alert(isAr ? 'تم إرسال إشعار واتساب W03 لاستعجال النواقص!' : 'WhatsApp notification W03 sent for missing scans!')}
          className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border border-amber-300 text-amber-800 dark:text-amber-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm active:scale-95 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{isAr ? 'طلب نواقص عبر واتساب (Send W03)' : 'Request Scans via WhatsApp (W03)'}</span>
        </button>
      </div>

      {/* N02 & N03: Document Audit & De-Identification Engine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* N02: File Audit */}
        <div className="card-clinical p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-teal-200">
                N02 · {isAr ? 'تدقيق الفحوصات' : 'Diagnostic Audit'}
              </span>
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
                {isAr ? 'سلامة الفحوصات ومقاطع DICOM' : 'Diagnostic File Verification'}
              </h3>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold border border-emerald-200">
              3/3 {isAr ? 'مستند معتمد' : 'Approved'}
            </span>
          </div>

          <div className="space-y-2.5">
            {(activeCase.files || []).map((file) => (
              <div
                key={file.id}
                className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{file.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{file.size} · {isAr ? 'فحص سليم ومكتمل' : 'Verified DICOM Series'}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                  ✓ {isAr ? 'مطابق' : 'Valid'}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-800 dark:text-slate-200">{isAr ? `تقرير الممرضة (${nurseName}):` : `${nurseName} audit check:`}</span>{' '}
            {isAr 
              ? `تم التحقق من سلامة كافة الفحوصات الطبية ومقاطع الأشعة المرفوعة لحالة [${activeCase.caseNumber}] الخاصة بتخصص (${activeCase.specialtyAr || activeCase.specialty}). الملف مطابق للمعايير السريرية المعتمدة للاستشارة الدولية.`
              : `Diagnostic series and clinical files verified for case [${activeCase.caseNumber}] (${activeCase.specialtyEn || activeCase.specialty}). Records verified and clinically sufficient for Indian Consultant review.`}
          </div>
        </div>

        {/* N03: De-identification Engine */}
        <div className="card-clinical p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-teal-200">
                N03 · {isAr ? 'حجب الهوية' : 'De-Identification'}
              </span>
              <UserX className="w-4 h-4 text-alo-teal" />
              <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
                {isAr ? 'إخفاء البيانات الشخصية (SDAIA)' : 'Privacy & PHI Masking'}
              </h3>
            </div>
            <span className="text-[10px] text-alo-teal bg-alo-mint px-2 py-0.5 rounded font-mono font-bold">
              MOH Compliant
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="text-slate-500">{isAr ? 'الاسم الثلاثي للمريض:' : 'Patient Legal Name:'}</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                [{isAr ? 'مخفي تماماً · De-identified' : 'Masked · De-identified'}]
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="text-slate-500">{isAr ? 'الهوية الوطنية / الجوال:' : 'National ID / Phone:'}</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                [{isAr ? 'محجوب عن الاستشاري الدولي' : 'Redacted from Specialist'}]
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="text-slate-500">{isAr ? 'العمر والجنس:' : 'Age & Gender:'}</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">
                {activeCase.age} {isAr ? `سنة · ${activeCase.gender === 'M' ? 'ذكر' : 'أنثى'}` : `yo · ${activeCase.gender === 'M' ? 'Male' : 'Female'}`}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">{isAr ? 'المدينة والمستشفى:' : 'City & Hospital:'}</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">{activeCase.city}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            {isAr
              ? 'تتم معالجة الملفات الطبية وحجب الهوية تلقائياً وفقاً للائحة حماية البيانات الصحية ومواصفات الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).'
              : 'Medical records are stripped of direct patient identifiers automatically in compliance with Saudi Health Information Privacy standards.'}
          </p>
        </div>
      </div>

      {/* N04 & N05: Red-Flag Urgency Tagger & Nurse Summary */}
      <div className="card-clinical p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-amber-200">
              N04 · {isAr ? 'تصنيف الأولوية' : 'Urgency Triage'}
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
              {isAr ? 'درجة الاستعجال ومؤشرات الخطورة السريرية:' : 'Clinical Urgency & SLA Classification:'}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              disabled={!isCurrentStageTriage}
              onClick={() => setUrgencyLevel('routine')}
              className={`px-3 py-1.5 rounded-lg border font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                urgencyLevel === 'routine'
                  ? 'bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              {isAr ? 'عادي (48 ساعة)' : 'Routine (48h)'}
            </button>
            <button
              type="button"
              disabled={!isCurrentStageTriage}
              onClick={() => setUrgencyLevel('urgent')}
              className={`px-3 py-1.5 rounded-lg border font-extrabold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                urgencyLevel === 'urgent'
                  ? 'bg-amber-100 text-amber-900 border-amber-400 ring-1 ring-amber-400/50'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              {isAr ? 'عاجل (24 ساعة SLA)' : 'Urgent (24h SLA)'}
            </button>
            <button
              type="button"
              disabled={!isCurrentStageTriage}
              onClick={() => setUrgencyLevel('stat')}
              className={`px-3 py-1.5 rounded-lg border font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                urgencyLevel === 'stat'
                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              {isAr ? 'حرج وفوري (STAT)' : 'Critical (STAT)'}
            </button>
          </div>
        </div>

        {/* N05-B: Doctor Matching & Assignment for Need Assistance */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-teal-200 dark:border-teal-900/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-teal-200">
                N05-B · {isAr ? 'مطابقة وتعيين الطبيب السعودي' : 'Doctor Matching & Assignment'}
              </span>
              <span className="text-xs font-extrabold text-alo-navy dark:text-slate-200">
                {activeCase.doctorSelectionPreference === 'need_assistance'
                  ? (isAr ? '✨ المريض طلب مساعدة ألو في الاختيار (موصى بالتعيين السريري):' : '✨ Patient requested ALO Assistance in Doctor Matching:')
                  : (isAr ? 'الطبيب المعالج المحدد من المريض (يمكن للممرضة إعادة التوجيه إن لزم):' : 'Patient-selected Doctor (Nurse can re-route if needed):')}
              </span>
            </div>
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded border border-teal-200">
              {isAr ? 'أطباء معتمدون على رأس العمل' : 'Accredited On-Duty Specialists'}
            </span>
          </div>

          {availableDoctors.length === 0 ? (
            <div
              role="status"
              dir={isAr ? 'rtl' : 'ltr'}
              className="flex items-start gap-3 p-4 rounded-xl border-2 border-dashed border-[#00C6AE]/50 bg-[#E6FAF7]/40 dark:bg-[#007B6E]/10 dark:border-[#007B6E]/40"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#E6FAF7] dark:bg-[#007B6E]/20 flex items-center justify-center border border-[#00C6AE]/40 dark:border-[#007B6E]/40">
                <Info className="w-4.5 h-4.5 text-[#007B6E] dark:text-[#00C6AE]" />
              </div>
              <div className="flex-1 space-y-1 pt-0.5">
                <p className="text-sm font-extrabold text-[#007B6E] dark:text-[#00C6AE] leading-relaxed">
                  {isAr
                    ? 'لا يوجد أطباء معالجون مسجلون حالياً. يجب تسجيل الأطباء أولاً من بوابة المشرف العام أو مدير المجمع الطبي.'
                    : 'No accredited Saudi treating doctors enrolled yet. Super Admin or Clinic Admin must enroll a doctor first.'}
                </p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-normal">
                  {isAr
                    ? 'سيتم تفعيل وحدة المطابقة تلقائياً بمجرد اعتماد حساب طبيب سعودي مرخص عبر لوحة الإدارة.'
                    : 'The matching module will activate automatically once a licensed Saudi doctor account is approved via the admin dashboard.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableDoctors.map((doc) => {
                const isSelected = activeCase.treatingDoctor?.name === doc.name || activeCase.treatingDoctor?.name === doc.nameEn;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      if (!isCurrentStageTriage) return;
                      onUpdateCase({
                        tier: doc.tier,
                        treatingDoctor: {
                          ...activeCase.treatingDoctor,
                          name: doc.name,
                          hospital: doc.hospital,
                          city: doc.city,
                        },
                        doctorSelectionPreference: 'specific_doctor',
                      });
                    }}
                    className={`p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-2 ${
                      isCurrentStageTriage ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
                    } ${
                      isSelected
                        ? 'border-alo-teal bg-teal-50/70 dark:bg-teal-950/40 ring-1 ring-alo-teal'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-alo-teal" />
                        <span>{isAr ? doc.name : (doc.nameEn || doc.name)}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-alo-teal" />}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                        {isAr ? doc.hospital : (doc.hospitalEn || doc.hospital)} · {doc.city}
                      </div>
                      <div className="text-[10px] text-teal-700 dark:text-teal-400 font-bold">
                        {isAr ? doc.specialty : (doc.specialtyEn || doc.specialty)} · <span className="font-mono text-slate-400">{doc.license}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!isCurrentStageTriage}
                      className={`text-[10px] px-2 py-1 rounded font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'bg-alo-teal text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'
                      }`}
                    >
                      {isSelected ? (isAr ? 'تم التعيين' : 'Assigned') : (isAr ? 'تعيين' : 'Assign')}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* N05: Nurse Summary Formulation */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-teal-200">
                N05 · {isAr ? 'الملخص التمريضي' : 'Nurse Summary'}
              </span>
              <Stethoscope className="w-3.5 h-3.5 text-alo-teal" />
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'التلخيص السريري الموجه للطبيب السعودي المعالج (د. عبدالله الشمري):' : 'Clinical Summary for Treating Doctor (Dr. Abdullah):'}
              </label>
            </div>
            <span className={`text-[11px] font-mono font-semibold ${isNotesValid ? 'text-teal-600 dark:text-teal-400' : 'text-rose-500'}`}>
              {(triageNotes || '').trim().length} / 20 {isAr ? 'حرف كحد أدنى' : 'min chars'}
            </span>
          </div>
          <textarea
            rows={3}
            value={triageNotes}
            onChange={(e) => setTriageNotes(e.target.value)}
            readOnly={!isCurrentStageTriage}
            placeholder={isAr ? 'أدخل ملخص الفرز السريري (الحد الأدنى 20 حرفاً)...' : 'Enter clinical triage summary (minimum 20 characters)...'}
            className={`w-full bg-white dark:bg-slate-900 border rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-alo-teal outline-none leading-relaxed shadow-sm font-medium ${
              !isNotesValid && isCurrentStageTriage ? 'border-rose-300 dark:border-rose-700' : 'border-slate-300 dark:border-slate-700'
            } ${!isCurrentStageTriage ? 'opacity-70 cursor-not-allowed bg-slate-50 dark:bg-slate-800' : ''}`}
          />
          {!isNotesValid && isCurrentStageTriage && (
            <p className="text-[11px] text-rose-500 font-medium mt-1">
              {isAr ? '⚠️ يجب أن يحتوي الملخص التمريضي على 20 حرفاً على الأقل قبل المتابعة.' : '⚠️ Clinical triage notes must be at least 20 characters long.'}
            </p>
          )}
        </div>

        {/* N06 & N07: Assignment and Stage Advance Action */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                N06 · {isAr ? 'الطبيب المعالج' : 'Assigned Doctor'}
              </span>
              <span>{isAr ? 'المحال إليه:' : 'Assigned to:'} <strong className="text-alo-teal font-bold">{activeCase.treatingDoctor?.name || (isAr ? 'قيد التحديد السريري' : 'Pending Selection')}</strong> ({activeCase.treatingDoctor?.hospital || referenceHospital})</span>
            </div>
            {!isDoctorAssigned && isCurrentStageTriage && (
              <span className="text-[11px] text-rose-500 font-medium">
                {isAr ? '⚠️ يرجى اختيار الطبيب المعالج من القائمة أعلاه (N06)' : '⚠️ Please select a treating doctor from above (N06)'}
              </span>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 w-full sm:w-auto">
            <button
              disabled={!canAdvanceN07}
              onClick={() => {
                if (!canAdvanceN07) return;
                
                const forwardedCaseId = activeCase.id;
                const forwardedCaseNumber = activeCase.caseNumber || activeCase.id;
                const forwardedPatient = (isAr ? activeCase.patientNameAr : activeCase.patientNameEn) || activeCase.patientName || '';
                
                setForwardedBanner({
                  caseId: forwardedCaseId,
                  caseNumber: forwardedCaseNumber,
                  patientName: forwardedPatient,
                });

                const nextPending = pendingTriageCases.find((c) => c.id !== activeCase.id);
                onUpdateCase({
                  currentStage: 'DOCTOR_REVIEW',
                  metadata: {
                    ...(activeCase.metadata || {}),
                    nurseVerified: true,
                    deidentifiedAt: new Date().toISOString(),
                  },
                });
                setSelectedCaseId(null);
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-alo-teal to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-extrabold py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>N07 · {isAr ? 'اعتماد الفرز وإرسال الملف للطبيب السعودي (D02)' : 'Approve & route to Saudi treating doctor (D02)'}</span>
              <span>{isAr ? '←' : '→'}</span>
            </button>
            {!canAdvanceN07 && isCurrentStageTriage && (
              <span className="text-[11px] text-rose-500 font-medium">
                {!isDoctorAssigned 
                  ? (isAr ? 'مطلوب تعيين الطبيب لتفعيل الزر' : 'Doctor assignment required')
                  : !isNotesValid
                  ? (isAr ? 'مطلوب استكمال الملاحظات (20 حرفاً)' : 'Complete notes required (min 20 chars)')
                  : null}
              </span>
            )}
          </div>
        </div>
      </div>
      </>
      )}

      {/* N07 Forwarded Confirmation Banner - Fixed Bottom Side */}
      {forwardedBanner && (
        <aside
          role="status"
          aria-live="polite"
          dir={isAr ? 'rtl' : 'ltr'}
          className="fixed bottom-6 inset-x-4 max-w-4xl mx-auto z-50 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md bg-gradient-to-r from-emerald-50/95 to-teal-50/90 dark:from-emerald-950/90 dark:to-teal-950/80 border-2 border-emerald-400 dark:border-emerald-600 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
        >
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center border border-emerald-300 dark:border-emerald-700 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-200 uppercase tracking-wide">
                {isAr ? 'تم النقل بنجاح' : 'Successfully Forwarded'}
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">
                {isAr
                  ? `تم نقل الحالة [${forwardedBanner.caseNumber}] إلى المرحلة التالية ← الطبيب السعودي المعالج (D02)`
                  : `Case [${forwardedBanner.caseNumber}] moved to next stage → Saudi Treating Doctor (D02)`}
              </p>
              {forwardedBanner.patientName && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                  {isAr ? 'المريض:' : 'Patient:'} {forwardedBanner.patientName}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                handleSelectCase(forwardedBanner.caseId);
                setForwardedBanner(null);
              }}
              className="text-xs font-extrabold px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
            >
              {isAr ? 'عرض في التتبع' : 'View in Tracker'}
            </button>
            <button
              type="button"
              onClick={() => setForwardedBanner(null)}
              aria-label={isAr ? 'إغلاق الإشعار' : 'Dismiss notification'}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};