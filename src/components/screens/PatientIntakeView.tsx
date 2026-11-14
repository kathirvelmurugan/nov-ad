import React, { useState, useEffect } from 'react';
import { ClinicalCase } from '../../types';
import { UserSession } from '../../hooks/workflowConstants';
import { 
  Shield, 
  UserCheck, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  Sparkles,
  FileText,
  Video,
  Phone,
  FlaskConical,
  Pill,
  Building2,
  Activity,
} from 'lucide-react';
import { IntakeDoctorSelectionCard } from '../intake/IntakeDoctorSelectionCard';
import { IntakeSymptomsAndDiagnosisSection } from '../intake/IntakeSymptomsAndDiagnosisSection';
import { IntakePatientBeneficiarySection } from '../intake/IntakePatientBeneficiarySection';
import { IntakeUploadZone } from '../intake/IntakeUploadZone';
import { FieldError } from '../common/FieldError';
import { FormErrorSummary } from '../common/FormErrorSummary';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  lang?: 'ar' | 'en';
  selectedService?: string;
  onSelectService?: (serviceId: string) => void;
  onBackToLanding?: () => void;
  onBackToTimeline?: () => void;
  hasExistingCases?: boolean;
  onStartNewCase?: () => void;
  userSession?: UserSession | null;
}

const INTAKE_SERVICES = [
  { id: 'second-opinion', titleAr: 'الرأي الطبي الثاني (مكتوب)', titleEn: 'Second Opinion (Written)', icon: FileText, consultationType: 'written' as const },
  { id: 'video-consultation', titleAr: 'الاستشارة المرئية', titleEn: 'Video Consultation', icon: Video, consultationType: 'video' as const },
  { id: 'voice-consultation', titleAr: 'الاستشارة الصوتية', titleEn: 'Voice Consultation', icon: Phone, consultationType: 'voice' as const },
  { id: 'lab-tests', titleAr: 'الفحوصات المخبرية', titleEn: 'Lab Tests', icon: FlaskConical },
  { id: 'pharmacy', titleAr: 'الصيدلية والدواء', titleEn: 'Pharmacy', icon: Pill },
  { id: 'hospital-services', titleAr: 'خدمات المستشفيات', titleEn: 'Hospital Services', icon: Building2 },
];

export const PatientIntakeView: React.FC<Props> = ({
  activeCase,
  onAdvanceStage: _onAdvanceStage,
  onUpdateCase,
  lang = 'ar',
  selectedService = 'second-opinion',
  onSelectService,
  onBackToLanding,
  onBackToTimeline,
  hasExistingCases = false,
  onStartNewCase,
  userSession,
}) => {
  const [, setSelectedFileForPreview] = useState<string | null>(null);
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const [activeServiceId, setActiveServiceId] = useState<string>(selectedService);

  const isAr = lang === 'ar';

  useEffect(() => {
    setActiveServiceId(selectedService);
  }, [selectedService]);

  // Clean draft mode: only register case upon explicit submit
  // (Auto-spawn on mount removed so empty cases are never generated)

  const handleSwitchService = (serviceId: string) => {
    setActiveServiceId(serviceId);
    if (onSelectService) {
      onSelectService(serviceId);
    }
    const matched = INTAKE_SERVICES.find((s) => s.id === serviceId);
    if (matched?.consultationType) {
      onUpdateCase({ consultationType: matched.consultationType });
    }
  };

  const currentServiceMeta = INTAKE_SERVICES.find((s) => s.id === activeServiceId) || INTAKE_SERVICES[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {Object.keys(validationErrors).length > 0 && (
        <FormErrorSummary errors={validationErrors} lang={lang} />
      )}
      {/* Top Breadcrumb & Return to Landing Page / Timeline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center gap-2 text-xs font-black text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{isAr ? '← الرئيسية واختيار الخدمات' : '← Home & Services'}</span>
            </button>
          )}
          {hasExistingCases && onBackToTimeline && (
            <button
              onClick={onBackToTimeline}
              className="inline-flex items-center gap-1.5 text-xs font-black text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/90 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/50 px-3.5 py-2 rounded-xl border border-teal-200 dark:border-teal-800 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <span>{isAr ? 'ملفاتي السابقة' : 'My Cases'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>{isAr ? 'الخدمة المختارة:' : 'Active Service:'}</span>
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full font-bold border border-emerald-300 dark:border-emerald-800 text-[11px]">
            <currentServiceMeta.icon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
            <span>{isAr ? currentServiceMeta.titleAr : currentServiceMeta.titleEn}</span>
          </span>
        </div>
      </div>

      {/* 6-Service Selection Bar (Compact Horizontal Scroll on Mobile) */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
              {isAr ? 'مسار الخدمة الصحية:' : 'Selected Healthcare Service Track:'}
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            {isAr ? 'انقر على أي خدمة لتحديث مسار الطلب' : 'Click to switch service track'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-6">
          {INTAKE_SERVICES.map((serv) => {
            const Icon = serv.icon;
            const isCurrent = activeServiceId === serv.id;

            return (
              <button
                key={serv.id}
                type="button"
                onClick={() => handleSwitchService(serv.id)}
                className={`px-3 py-2 sm:p-2.5 rounded-xl border transition-all flex items-center sm:flex-col sm:justify-center gap-2 text-center cursor-pointer shrink-0 sm:shrink ${
                  isCurrent
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-black shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300 font-semibold text-xs'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`} />
                <span className="text-[11px] leading-tight whitespace-nowrap sm:whitespace-normal">
                  {isAr ? serv.titleAr : serv.titleEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* P01, P02, P04 & P13: Master Beneficiary Selector (Me vs. Family) & Identity Banner */}
      <IntakePatientBeneficiarySection
        activeCase={activeCase}
        isAr={isAr}
        userSession={userSession}
        onUpdateCase={onUpdateCase}
      />

      {/* P04-B: Saudi Treating Doctor Selection */}
      <IntakeDoctorSelectionCard
        activeCase={activeCase}
        isAr={isAr}
        onUpdateCase={onUpdateCase}
      />

      {/* P05-P12: Clinical Symptoms, Medications, Scans & MOH Consent */}
      <div className="card-clinical p-6 space-y-5">
        <IntakeSymptomsAndDiagnosisSection
          activeCase={activeCase}
          isAr={isAr}
          privacyAgreed={privacyAgreed}
          setPrivacyAgreed={setPrivacyAgreed}
          onUpdateCase={onUpdateCase}
        />

        <IntakeUploadZone
          activeCase={activeCase}
          isAr={isAr}
          onUpdateCase={onUpdateCase}
          setSelectedFileForPreview={setSelectedFileForPreview}
        />

        {/* P13 & P14: Submission & WhatsApp Trigger Notification */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              P13 · {isAr ? 'عند الإرسال، سيتم توليد إشعار واتساب التلقائي (Template W01).' : 'Upon submission, WhatsApp Meta trigger W01 will be dispatched.'}
            </span>
          </div>

          <button
            onClick={() => {
              const errors: Record<string, string | undefined> = {};
              const symp = (activeCase.symptoms || activeCase.symptomsAr || activeCase.symptomsEn || '').trim();
              const diag = (activeCase.diagnosis || activeCase.diagnosisAr || activeCase.diagnosisEn || '').trim();

              if (!privacyAgreed) {
                errors.privacyConsent = isAr
                  ? 'يجب الموافقة على إقرار الخصوصية وحماية البيانات الصحية قبل إرسال الملف.'
                  : 'You must agree to the MOH Health Data Privacy Consent before submitting your case.';
              }
              if (!symp || symp.length < 10) {
                errors.symptoms = isAr
                  ? 'الأعراض والشكوى السريرية مطلوبة (10 أحرف على الأقل).'
                  : 'Clinical symptoms and chief complaint are required (minimum 10 characters).';
              }
              if (!diag || diag.length < 3) {
                errors.diagnosis = isAr
                  ? 'التشخيص الطبي الأولي مطلوب (3 أحرف على الأقل).'
                  : 'Medical Diagnosis is required (minimum 3 characters).';
              }

              if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
              }

              setValidationErrors({});
              const freshId = `case-${Date.now()}`;
              const freshCaseNum = `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
              const patPhone = userSession?.phone || activeCase.patientPhone || '';
              const patName = activeCase.patientName || userSession?.fullName || (isAr ? 'مريض ألو' : 'ALO Patient');
              onUpdateCase({
                id: freshId,
                caseNumber: freshCaseNum,
                patientPhone: patPhone,
                patientName: patName,
                patientNameAr: activeCase.patientNameAr || (isAr ? patName : undefined),
                patientNameEn: activeCase.patientNameEn || (!isAr ? patName : undefined),
                symptoms: symp,
                symptomsAr: isAr ? symp : (activeCase.symptomsAr || ''),
                symptomsEn: !isAr ? symp : (activeCase.symptomsEn || ''),
                diagnosis: diag,
                diagnosisAr: isAr ? diag : (activeCase.diagnosisAr || ''),
                diagnosisEn: !isAr ? diag : (activeCase.diagnosisEn || ''),
                specialty: activeCase.specialty || 'جراحة القلب والصدر',
                specialtyAr: activeCase.specialtyAr || 'جراحة القلب والصدر',
                specialtyEn: activeCase.specialtyEn || 'Cardiothoracic Surgery',
                redFlags: activeCase.redFlags || [],
                currentMedications: activeCase.currentMedications || [],
                allergies: activeCase.allergies || [],
                noKnownAllergies: !!activeCase.noKnownAllergies,
                noCurrentMedications: !!activeCase.noCurrentMedications,
                nationalIdMasked: activeCase.nationalIdMasked || '10********',
                age: activeCase.age || 58,
                gender: activeCase.gender || 'M',
                beneficiaryMode: activeCase.beneficiaryMode || 'me',
                caregiver: activeCase.caregiver,
                treatingDoctor: activeCase.treatingDoctor,
                files: activeCase.files || [],
                consultationType: activeCase.consultationType || 'written',
                currentStage: 'NURSE_CHECK',
                stage: 2,
                status: 'open',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-alo-teal to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-extrabold py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
          >
            <span>P14 · {isAr ? 'إرسال الملف إلى تمريض الفرز (Submit Case)' : 'Submit case to ALO nurse'}</span>
            <span>{isAr ? '←' : '→'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
