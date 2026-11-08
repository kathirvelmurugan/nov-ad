import React, { useState, useEffect } from 'react';
import { ClinicalCase } from '../../types';
import { 
  FileUp, 
  Shield, 
  Stethoscope, 
  Video, 
  FileText, 
  CheckCircle2, 
  UserCheck, 
  Heart, 
  AlertTriangle, 
  Activity, 
  Pill, 
  Check, 
  Eye,
  ArrowLeft,
  ArrowRight,
  FlaskConical,
  Building2,
  Sparkles
} from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  lang?: 'ar' | 'en';
  selectedService?: string;
  onSelectService?: (serviceId: string) => void;
  onBackToLanding?: () => void;
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
  onAdvanceStage,
  onUpdateCase,
  lang = 'ar',
  selectedService = 'second-opinion',
  onSelectService,
  onBackToLanding,
}) => {
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<string | null>(null);
  const [isCaregiverMode, setIsCaregiverMode] = useState<boolean>(activeCase.caregiver?.isProxy ?? true);
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(true);
  const [activeServiceId, setActiveServiceId] = useState<string>(selectedService);

  const isAr = lang === 'ar';

  useEffect(() => {
    setActiveServiceId(selectedService);
  }, [selectedService]);

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
      {/* Top Breadcrumb & Return to Landing Page */}
      {onBackToLanding && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-xs font-black text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{isAr ? '← العودة إلى الصفحة الرئيسية واختيار الخدمات' : '← Back to Landing & Service Selection'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>{isAr ? 'الخدمة المختارة:' : 'Active Service:'}</span>
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full font-bold border border-emerald-300 dark:border-emerald-800 text-[11px]">
              <currentServiceMeta.icon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
              <span>{isAr ? currentServiceMeta.titleAr : currentServiceMeta.titleEn}</span>
            </span>
          </div>
        </div>
      )}

      {/* 6-Service Selection Bar (Allows seamless switching of services) */}
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
                value={activeCase.caregiver?.name || 'فاطمة العتيبي'}
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
                value={activeCase.caregiver?.relationship || (isAr ? 'ابنة المريض (Daughter)' : 'Daughter')}
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
                value={activeCase.caregiver?.nationalId || '1098452103'}
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

      {/* P04-B · Choose Saudi Treating Doctor */}
      <div className="card-clinical p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="bg-alo-mint text-alo-teal px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-teal-200">
              P04-B · {isAr ? 'الطبيب المعالج' : 'Saudi treating doctor'}
            </span>
            <Stethoscope className="w-4 h-4 text-alo-teal" />
            <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
              {isAr ? 'اختيار الطبيب السعودي المعالج المشرف على الحالة بالمملكة' : 'Select the Saudi treating doctor within KSA'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {isAr ? 'مستشفى مرجعي شريك' : 'Accredited Partner Hospital'}
          </span>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {isAr ? 'تحديد خيار الطبيب المعالج المشرف بالمملكة:' : 'Select Saudi Treating Doctor Assignment:'}
          </label>
          <select
            value={activeCase.doctorSelectionPreference === 'need_assistance' ? 'need_assistance' : activeCase.treatingDoctor.name}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'need_assistance') {
                onUpdateCase({
                  doctorSelectionPreference: 'need_assistance',
                  treatingDoctor: {
                    ...activeCase.treatingDoctor,
                    name: 'بانتظار فرز التمريض (ألو تختار الأنسب)',
                    hospital: 'شبكة المستشفيات المعتمدة (ALO Accredited Network)',
                    city: 'الرياض / المملكة'
                  }
                });
                return;
              }

              let hospital = activeCase.treatingDoctor.hospital;
              let city = activeCase.treatingDoctor.city;
              if (val.includes('عبدالله')) {
                hospital = 'مستشفى رعاية الرياض (Riyadh Care)';
                city = 'الرياض';
              } else if (val.includes('فيصل')) {
                hospital = 'مستشفى الدكتور سليمان فقيه (Fakeeh Health)';
                city = 'جدة';
              } else if (val.includes('عمر')) {
                hospital = 'مستشفى بروكير رعاية (Procare Riaya)';
                city = 'الخبر';
              } else if (val.includes('هند')) {
                hospital = 'مركز الأمير سلطان لطب وجراحة القلب';
                city = 'الطائف';
              } else if (val.includes('خالد')) {
                hospital = 'مستشفى الموسى التخصصي';
                city = 'الأحساء';
              }
              onUpdateCase({
                doctorSelectionPreference: 'specific_doctor',
                treatingDoctor: {
                  ...activeCase.treatingDoctor,
                  name: val,
                  hospital,
                  city
                }
              });
            }}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-alo-teal outline-none font-bold shadow-sm cursor-pointer"
          >
            <option value="need_assistance">✨ {isAr ? 'أحتاج مساعدة ألو في الاختيار (موصى به - مطابقة التمريض السريري)' : 'Need ALO Assistance to Choose (Recommended - Clinical Nurse Match)'}</option>
            <option value="د. عبدالله الشمري">د. عبدالله الشمري — مستشفى رعاية الرياض (Riyadh Care Hospital) · أمراض وجراحة القلب</option>
            <option value="د. فيصل الغامدي">د. فيصل الغامدي — مستشفى الدكتور سليمان فقيه (Fakeeh Health Jeddah) · قسطرة وتداخل جراحي</option>
            <option value="د. عمر الملحم">د. عمر الملحم — مستشفى بروكير رعاية (Procare Riaya Khobar) · جراحة العظام والمفاصل</option>
            <option value="د. هند الحازمي">د. هند الحازمي — مركز الأمير سلطان لطب وجراحة القلب (Taif) · أمراض قلب الأطفال</option>
            <option value="د. خالد الدوسري">د. خالد الدوسري — مستشفى الموسى التخصصي (Al-Ahsa) · جراحة المخ والعمود الفقري</option>
          </select>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            {isAr
              ? '💡 الخيار الافتراضي يتيح لممرضة ألو فرز تقاريرك وتعيين الطبيب الاستشاري الأنسب في مدينتك، مع إمكانية تحديد طبيب معين إذا رغبت.'
              : '💡 Default option enables ALO Nurse triage to match the best-suited Saudi consultant based on your clinical records and location.'}
          </p>
        </div>
      </div>

      {/* P05 & P06: Clinical Symptoms & Condition */}
      <div className="card-clinical p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="bg-alo-mint text-alo-teal px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-teal-200">
              P05 · {isAr ? 'التوصيف السريري' : 'Clinical Diagnosis'}
            </span>
            <Heart className="w-4 h-4 text-alo-teal" />
            <h3 className="text-base font-extrabold text-alo-navy dark:text-slate-100">
              {isAr ? 'التشخيص ووصف الأعراض الحالية' : 'Diagnosis & Clinical Symptoms'}
            </h3>
          </div>
          <span className="text-xs text-alo-teal font-bold bg-alo-mint px-3 py-1 rounded-lg border border-teal-200">
            {isAr ? (activeCase.specialtyAr || activeCase.specialty) : (activeCase.specialtyEn || activeCase.specialty)}
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {isAr ? 'التشخيص الطبي الحالي:' : 'Confirmed Medical Diagnosis:'}
          </label>
          <input
            type="text"
            value={isAr ? (activeCase.diagnosisAr || activeCase.diagnosis) : (activeCase.diagnosisEn || activeCase.diagnosis)}
            onChange={(e) => onUpdateCase(isAr ? { diagnosisAr: e.target.value, diagnosis: e.target.value } : { diagnosisEn: e.target.value, diagnosis: e.target.value })}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-alo-teal outline-none font-bold shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {isAr ? 'الأعراض والشكوى السريرية الحالية:' : 'Symptoms & Patient History:'}
          </label>
          <textarea
            rows={3}
            value={isAr ? (activeCase.symptomsAr || activeCase.symptoms) : (activeCase.symptomsEn || activeCase.symptoms)}
            onChange={(e) => onUpdateCase(isAr ? { symptomsAr: e.target.value, symptoms: e.target.value } : { symptomsEn: e.target.value, symptoms: e.target.value })}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-alo-teal outline-none leading-relaxed shadow-sm font-medium"
          />
        </div>

        {/* P06: Symptom Severity & Red Flags Checklist */}
        <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-mono font-bold">
              P06 · {isAr ? 'مؤشرات الخطورة' : 'Red-Flag Tags'}
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'العلامات السريرية الحرجة المصاحبة للحالة:' : 'Critical Associated Clinical Signs:'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-white dark:bg-slate-900 border border-amber-300 p-2 rounded-lg flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold shadow-sm">
              <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{isAr ? 'ضيق تنفس جهدي (NYHA III)' : 'Exertional Dyspnea (NYHA III)'}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-amber-300 p-2 rounded-lg flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold shadow-sm">
              <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{isAr ? 'نوبة إغماء حديثة (Syncope)' : 'Recent Syncope Episode'}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg flex items-center gap-1.5 text-slate-700 dark:text-slate-300 shadow-sm">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{isAr ? 'ألم ضاغط في الصدر (Angina)' : 'Exertional Angina'}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg flex items-center gap-1.5 text-slate-700 dark:text-slate-300 shadow-sm">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{isAr ? 'تسارع خفقان القلب' : 'Palpitations'}</span>
            </div>
          </div>
        </div>

        {/* P07 & P08: Diagnostic Scans & Echo Metrics */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="bg-alo-mint text-alo-teal px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-teal-200">
                P07 · {isAr ? 'الفحوصات والأشعة' : 'Diagnostic Scans'}
              </span>
              <FileUp className="w-4 h-4 text-alo-teal" />
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'الملفات المرفوعة (Echo · CINE Loops · DICOM):' : 'Uploaded Diagnostic Scans & DICOM Files:'}
              </label>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              ✓ 3 {isAr ? 'ملفات مكتملة' : 'Files Verified'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeCase.files.map((file) => (
              <div
                key={file.id}
                onClick={() => setSelectedFileForPreview(file.name)}
                className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-alo-teal p-3.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all hover:shadow-sm"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileUp className="w-4 h-4 text-alo-teal shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{file.size} · {file.type.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-alo-teal" />
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            ))}
          </div>

          {/* P08: Echo Lab Snapshot Metrics */}
          <div className="mt-3 bg-alo-mint/60 dark:bg-alo-mintDark/30 border border-teal-200 dark:border-teal-800 p-3.5 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-alo-teal dark:text-alo-aqua font-extrabold">
              <Activity className="w-4 h-4 text-alo-teal" />
              <span>P08 · {isAr ? 'قياسات الإيكو السريرية المعتمدة:' : 'Echo Lab Approved Metrics:'}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-800 dark:text-slate-200">
              <span>{isAr ? 'مساحة الصمام:' : 'Valve Area:'} <strong className="medical-term text-alo-teal font-extrabold">0.65 cm²</strong></span>
              <span>{isAr ? 'تدرج الضغط:' : 'Mean Gradient:'} <strong className="medical-term text-alo-teal font-extrabold">48 mmHg</strong></span>
              <span>{isAr ? 'سرعة التدفق:' : 'Peak Velocity:'} <strong className="medical-term text-alo-teal font-extrabold">4.4 m/s</strong></span>
              <span>{isAr ? 'كفاءة الضخ:' : 'LVEF:'} <strong className="medical-term text-emerald-700 dark:text-emerald-400 font-extrabold">55%</strong></span>
            </div>
          </div>
        </div>

        {/* P09 & P10: Medications & Allergy Tags */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-alo-teal bg-alo-mint px-2 py-0.5 rounded font-mono font-bold">
                P09 · {isAr ? 'الأدوية الحالية' : 'Current Medications'}
              </span>
              <Pill className="w-3.5 h-3.5 text-alo-teal" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {isAr ? 'الأدوية الموصوفة للمريض:' : 'Patient Prescriptions:'}
              </span>
            </div>
            <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 px-2 py-0.5 rounded font-bold">
              P10 · {isAr ? 'حساسية: البنسلين' : 'Allergy: Penicillin (Rash)'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
            <span className="medical-term bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded text-slate-800 dark:text-slate-200 font-semibold shadow-sm">
              Atorvastatin 40mg (OD)
            </span>
            <span className="medical-term bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded text-slate-800 dark:text-slate-200 font-semibold shadow-sm">
              Aspirin 100mg (OD)
            </span>
            <span className="medical-term bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded text-slate-800 dark:text-slate-200 font-semibold shadow-sm">
              Ramipril 5mg (OD)
            </span>
            <span className="medical-term bg-amber-50 border border-amber-300 px-2.5 py-1 rounded text-amber-800 font-semibold">
              {isAr ? 'حاصرات بيتا (موقفة)' : 'Beta-blockers (Held)'}
            </span>
          </div>
        </div>

        {/* P11 & P12: Consultation Format & Legal MOH Consent */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              P11 · {isAr ? 'صيغة الاستشارة المرغوبة:' : 'Consultation Format:'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdateCase({ consultationType: 'written' })}
                className={`text-xs px-3 py-1 rounded-lg font-extrabold flex items-center gap-1.5 shadow-sm border transition-colors ${
                  activeCase.consultationType === 'written'
                    ? 'bg-alo-mint border-teal-300 text-alo-teal'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isAr ? 'رأي مكتوب فقط' : 'Written opinion only'}</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateCase({ consultationType: 'video' })}
                className={`text-xs px-3 py-1 rounded-lg font-extrabold flex items-center gap-1.5 shadow-sm border transition-colors ${
                  activeCase.consultationType === 'video'
                    ? 'bg-alo-mint border-teal-300 text-alo-teal'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>{isAr ? 'مرئي + رأي مكتوب' : 'Video + written opinion'}</span>
              </button>
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <input
              type="checkbox"
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-alo-teal focus:ring-alo-teal"
            />
            <span className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              <strong className="text-alo-teal font-extrabold">
                P12 · {isAr ? 'إقرار الخصوصية والمشاركة الطبية:' : 'MOH Health Data Privacy Consent:'}
              </strong>{' '}
              {isAr
                ? 'أوافق على مشاركة ملفاتي الطبية مع منسقي التمريض في منصة ألو دكتور والاستشاري الدولي المعتمد لغرض إعداد الرأي الطبي الثاني، وفقاً لنظام حماية البيانات الصحية في المملكة العربية السعودية.'
                : 'I consent to sharing diagnostic records with ALO DOCTOR triage nurses and the accredited international consultant for the second opinion evaluation in compliance with Saudi Health Information Privacy Law.'}
            </span>
          </label>
        </div>

        {/* P13 & P14: Submission & WhatsApp Trigger Notification */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              P13 · {isAr ? 'عند الإرسال، سيتم توليد إشعار واتساب التلقائي (Template W01).' : 'Upon submission, WhatsApp Meta trigger W01 will be dispatched.'}
            </span>
          </div>

          <button
            onClick={onAdvanceStage}
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
