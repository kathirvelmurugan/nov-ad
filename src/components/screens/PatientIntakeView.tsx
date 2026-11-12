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
  FlaskConical,
  Pill,
  Building2,
  Activity,
} from 'lucide-react';
import { IntakeDoctorSelectionCard } from '../intake/IntakeDoctorSelectionCard';
import { IntakeSymptomsAndDiagnosisSection } from '../intake/IntakeSymptomsAndDiagnosisSection';
import { IntakeUploadZone } from '../intake/IntakeUploadZone';

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
  { id: 'second-opinion', titleAr: 'الرأي الطبي الثاني', titleEn: 'Second Opinion', icon: FileText, consultationType: 'written' as const },
  { id: 'video-consultation', titleAr: 'الاستشارة المرئية', titleEn: 'Video Consultation', icon: Video, consultationType: 'video' as const },
  { id: 'lab-tests', titleAr: 'الفحوصات المخبرية', titleEn: 'Lab Tests', icon: FlaskConical },
  { id: 'pharmacy', titleAr: 'الصيدلية والدواء', titleEn: 'Pharmacy', icon: Pill },
  { id: 'hospital-services', titleAr: 'خدمات المستشفيات', titleEn: 'Hospital Services', icon: Building2 },
  { id: 'other-services', titleAr: 'رعاية صحية إضافية', titleEn: 'Other Healthcare', icon: Activity },
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
  const [isCaregiverMode, setIsCaregiverMode] = useState<boolean>(activeCase.caregiver?.isProxy ?? true);
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(true);
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

      {/* 6-Service Selection Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
              {isAr ? 'مسار الخدمة الصحية للطلب السريري:' : 'Selected Healthcare Service Track:'}
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {isAr ? 'انقر على أي خدمة لتحديث مسار الطلب' : 'Click to switch service track'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {INTAKE_SERVICES.map((serv) => {
            const Icon = serv.icon;
            const isCurrent = activeServiceId === serv.id;

            return (
              <button
                key={serv.id}
                type="button"
                onClick={() => handleSwitchService(serv.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-black shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300 font-semibold text-xs'
                }`}
              >
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`} />
                <span className="text-[11px] leading-tight block">
                  {isAr ? serv.titleAr : serv.titleEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* P01 & P02: Patient Identity Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-6 rounded-2xl border border-teal-800/60 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 font-bold mb-1.5 text-xs text-teal-300">
            <span className="bg-teal-500/20 text-teal-200 px-2 py-0.5 rounded text-[10px] font-mono border border-teal-500/30">
              P01 · {isAr ? 'الهوية الوطنية المعتمدة' : 'National ID Verified'}
            </span>
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>{isAr ? 'طلب استشارة رأي طبي ثانٍ معتمد · ألو دكتور' : 'Accredited Second Opinion · ALO DOCTOR'}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {isAr ? (activeCase.patientNameAr || activeCase.patientName) : (activeCase.patientNameEn || activeCase.patientName)}
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            {isAr ? 'الهوية الوطنية / الإقامة:' : 'National ID:'} <span className="font-mono text-teal-300 font-bold">{activeCase.nationalIdMasked}</span> · {isAr ? 'العمر:' : 'Age:'} {activeCase.age} · {isAr ? 'الجنس: ذكر' : 'Gender: Male'} · {isAr ? (activeCase.cityAr || activeCase.city) : (activeCase.cityEn || activeCase.city)}
          </p>
        </div>

        <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl text-center shrink-0">
          <span className="text-[11px] text-teal-200 block font-mono">P02 · {isAr ? 'رقم التتبع' : 'Case Number'}</span>
          <span className="text-lg font-mono font-black text-teal-300">{activeCase.caseNumber}</span>
        </div>
      </div>

      {/* P03 & P04: Caregiver / Legal Proxy Section */}
      <div className="card-clinical p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-alo-mint text-alo-teal px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-teal-200">
              P03 · {isAr ? 'الوكيل الشرعي' : 'Caregiver Proxy'}
            </span>
            <UserCheck className="w-4 h-4 text-alo-teal" />
            <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
              {isAr ? 'تقديم الطلب عبر مرافق / وكيل شرعي مرخص' : 'Application via Authorized Caregiver / Legal Proxy'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCaregiverMode(!isCaregiverMode)}
            className={`text-xs px-3 py-1 rounded-full font-bold transition-all border ${
              isCaregiverMode
                ? 'bg-alo-mint border-teal-300 text-alo-teal font-extrabold'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
          >
            {isCaregiverMode ? (isAr ? 'مفعل (مرافق مخول)' : 'Active (Proxy Mode)') : (isAr ? 'المريض نفسه' : 'Self Patient')}
          </button>
        </div>

        {isCaregiverMode && (
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-1">
                {isAr ? 'اسم المرافق / الوكيل:' : 'Caregiver Full Name:'}
              </span>
              <input
                type="text"
                value={activeCase.caregiver?.name || ''}
                placeholder={isAr ? 'الاسم الكامل للوكيل' : 'Full Name'}
                onChange={(e) => onUpdateCase({
                  caregiver: { ...activeCase.caregiver!, name: e.target.value }
                })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 outline-none focus:border-alo-teal font-bold shadow-sm"
              />
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-1">
                {isAr ? 'صلة القرابة:' : 'Relationship:'}
              </span>
              <input
                type="text"
                value={activeCase.caregiver?.relationship || ''}
                placeholder={isAr ? 'صلة القرابة' : 'e.g. Son, Daughter, Spouse'}
                onChange={(e) => onUpdateCase({
                  caregiver: { ...activeCase.caregiver!, relationship: e.target.value }
                })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 outline-none focus:border-alo-teal shadow-sm"
              />
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-1">
                {isAr ? 'رقم الهوية الوطنية للوكيل:' : 'Caregiver National ID:'}
              </span>
              <input
                type="text"
                value={activeCase.caregiver?.nationalId || ''}
                placeholder="10XXXXXXXX"
                onChange={(e) => onUpdateCase({
                  caregiver: { ...activeCase.caregiver!, nationalId: e.target.value }
                })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-alo-teal dark:text-teal-300 outline-none focus:border-alo-teal font-bold shadow-sm"
              />
            </div>
            <div className="md:col-span-3 flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-alo-teal bg-alo-mint px-2 py-0.5 rounded font-mono font-bold">
                P04 · {isAr ? 'تفويض شرعي' : 'Consent Proxy'}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                {isAr 
                  ? 'أقر بصفتي وكيلاً شرعياً بامتلاك الصلاحية النظامية لرفع الملف الطبي ومتابعة الاستشارة حسب اشتراطات وزارة الصحة السعودية.'
                  : 'I declare under legal healthcare proxy authority that I am authorized to upload records and request consultation per Saudi MOH regulations.'}
              </span>
            </div>
          </div>
        )}
      </div>

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
              const symp = (activeCase.symptoms || activeCase.symptomsAr || activeCase.symptomsEn || '').trim();
              if (!symp) {
                alert(isAr ? 'يرجى كتابة الشكوى أو الأعراض السريرية قبل إرسال الحالة إلى التمريض.' : 'Please describe your clinical symptoms before submitting.');
                return;
              }
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
                diagnosis: activeCase.diagnosis || '',
                diagnosisAr: activeCase.diagnosisAr || '',
                diagnosisEn: activeCase.diagnosisEn || '',
                specialty: activeCase.specialty || 'جراحة القلب والصدر',
                specialtyAr: activeCase.specialtyAr || 'جراحة القلب والصدر',
                specialtyEn: activeCase.specialtyEn || 'Cardiothoracic Surgery',
                currentStage: 'NURSE_CHECK',
                stage: 2,
                status: 'open',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }}
            disabled={!privacyAgreed}
            className="w-full sm:w-auto bg-gradient-to-r from-alo-teal to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 text-white font-extrabold py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
          >
            <span>P14 · {isAr ? 'إرسال الملف إلى تمريض الفرز (Submit Case)' : 'Submit case to ALO nurse'}</span>
            <span>{isAr ? '←' : '→'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
