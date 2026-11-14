import React, { useState, useCallback, useMemo } from 'react';

export type BeneficiaryType = 'me' | 'family';
export type RelationshipType = 'parent' | 'child' | 'spouse' | 'guardian';
export type GenderType = 'male' | 'female';

export interface UserSession {
  userId: string;
  fullNameAr: string;
  fullNameEn: string;
  mobileNumber: string;
  nationalIdOrIqama: string;
  isVerified: boolean;
}

export interface BeneficiaryData {
  beneficiaryType: BeneficiaryType;
  patientFullName?: string;
  patientNationalIdOrIqama?: string;
  relationshipToAccountHolder?: RelationshipType;
  patientAge?: number;
  patientGender?: GenderType;
  legalProxyConsentGiven: boolean;
}

export interface ClinicalCase {
  caseId: string;
  status: string;
  beneficiary: BeneficiaryData;
  caregiver: {
    isProxy: boolean;
    accountId?: string;
    accountMobile?: string;
  };
  [key: string]: any;
}

export interface IntakePatientBeneficiarySectionProps {
  activeCase: ClinicalCase;
  isAr: boolean;
  userSession?: UserSession | null;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

const RELATIONSHIP_OPTIONS = {
  parent: { ar: 'والد أو والدة', en: 'Parent' },
  child: { ar: 'ابن أو ابنة', en: 'Child' },
  spouse: { ar: 'زوج أو زوجة', en: 'Spouse' },
  guardian: { ar: 'وصي شرعي', en: 'Legal Guardian' },
};

const GENDER_OPTIONS = {
  male: { ar: 'ذكر', en: 'Male' },
  female: { ar: 'أنثى', en: 'Female' },
};

const UI_TEXT = {
  sectionTitle: {
    ar: 'تحديد المستفيد من الخدمة',
    en: 'Beneficiary Selection',
  },
  toggleMe: {
    ar: 'نفسي',
    en: 'Me',
  },
  toggleFamily: {
    ar: 'أحد أفراد الأسرة',
    en: 'Family / Dependent',
  },
  verifiedBadge: {
    ar: 'حساب موثق',
    en: 'Verified Account',
  },
  meNote: {
    ar: 'سيتم ربط حالتك بسجلك الصحي الرقمي الوطني الموثق.',
    en: 'Your case will be linked to your verified national digital health record.',
  },
  patientNameLabel: {
    ar: 'الاسم الكامل للمريض',
    en: 'Patient Full Name',
  },
  patientNamePlaceholder: {
    ar: 'أدخل الاسم الرباعي كما في الهوية',
    en: 'Enter full name as in ID',
  },
  patientIdLabel: {
    ar: 'رقم الهوية الوطنية / الإقامة',
    en: 'National ID / Iqama Number',
  },
  patientIdPlaceholder: {
    ar: '10 أرقام',
    en: '10 digits',
  },
  relationshipLabel: {
    ar: 'صلة القرابة بصاحب الحساب',
    en: 'Relationship to Account Holder',
  },
  relationshipPlaceholder: {
    ar: 'اختر صلة القرابة',
    en: 'Select relationship',
  },
  ageLabel: {
    ar: 'العمر',
    en: 'Age',
  },
  genderLabel: {
    ar: 'الجنس',
    en: 'Gender',
  },
  consentLabel: {
    ar: 'أُقر بموجب نظام حماية البيانات الصحية السعودي بأنني مقدم الرعاية القانوني / الوكيل المعتمد لهذا المريض.',
    en: 'I declare under Saudi Health Data Protection Law that I am the authorized legal caregiver/family proxy for this patient.',
  },
  billingNote: {
    ar: 'سيبقى رقم جوال صاحب الحساب هو المرجع للفواتير وتنبيهات واتساب ورموز التحقق.',
    en: "The account holder's mobile number remains the billing, WhatsApp alert, and OTP communication anchor.",
  },
  validationName: {
    ar: 'يجب أن يكون الاسم 3 أحرف على الأقل',
    en: 'Name must be at least 3 characters',
  },
  validationId: {
    ar: 'يجب أن يتكون الرقم من 10 أرقام',
    en: 'ID must be exactly 10 digits',
  },
  validationConsent: {
    ar: 'يجب الموافقة على الإقرار القانوني للمتابعة',
    en: 'Legal proxy consent is required to proceed',
  },
};

const IntakePatientBeneficiarySection: React.FC<IntakePatientBeneficiarySectionProps> = ({
  activeCase,
  isAr,
  userSession,
  onUpdateCase,
}) => {
  const dir = isAr ? 'rtl' : 'ltr';
  const lang = isAr ? 'ar' : 'en';
  const t = (textObj: { ar: string; en: string }) => (isAr ? textObj.ar : textObj.en);

  const [beneficiaryType, setBeneficiaryType] = useState<BeneficiaryType>(
    activeCase.beneficiary?.beneficiaryType || 'me'
  );
  const [patientFullName, setPatientFullName] = useState<string>(
    activeCase.beneficiary?.patientFullName || ''
  );
  const [patientNationalId, setPatientNationalId] = useState<string>(
    activeCase.beneficiary?.patientNationalIdOrIqama || ''
  );
  const [relationship, setRelationship] = useState<RelationshipType | ''>(
    activeCase.beneficiary?.relationshipToAccountHolder || ''
  );
  const [patientAge, setPatientAge] = useState<string>(
    activeCase.beneficiary?.patientAge?.toString() || ''
  );
  const [patientGender, setPatientGender] = useState<GenderType | ''>(
    activeCase.beneficiary?.patientGender || ''
  );
  const [legalProxyConsent, setLegalProxyConsent] = useState<boolean>(
    activeCase.beneficiary?.legalProxyConsentGiven || false
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const emitUpdate = useCallback(
    (type: BeneficiaryType) => {
      const updatedBeneficiary: BeneficiaryData = {
        beneficiaryType: type,
        patientFullName: type === 'family' ? patientFullName : undefined,
        patientNationalIdOrIqama: type === 'family' ? patientNationalId : undefined,
        relationshipToAccountHolder: type === 'family' ? (relationship as RelationshipType) : undefined,
        patientAge: type === 'family' && patientAge ? parseInt(patientAge, 10) : undefined,
        patientGender: type === 'family' ? (patientGender as GenderType) : undefined,
        legalProxyConsentGiven: type === 'family' ? legalProxyConsent : false,
      };

      const updatedCaregiver = {
        isProxy: type === 'family',
        accountId: userSession?.userId,
        accountMobile: userSession?.mobileNumber,
      };

      onUpdateCase({
        beneficiary: updatedBeneficiary,
        caregiver: updatedCaregiver,
      });
    },
    [patientFullName, patientNationalId, relationship, patientAge, patientGender, legalProxyConsent, onUpdateCase, userSession]
  );

  const handleToggle = (type: BeneficiaryType) => {
    setBeneficiaryType(type);
    if (type === 'me') {
      setErrors({});
    }
    emitUpdate(type);
  };

  const validateField = (field: string, value: string | boolean) => {
    const newErrors = { ...errors };
    if (field === 'patientFullName') {
      if ((value as string).trim().length < 3) {
        newErrors.patientFullName = t(UI_TEXT.validationName);
      } else {
        delete newErrors.patientFullName;
      }
    }
    if (field === 'patientNationalId') {
      if (!/^\d{10}$/.test((value as string).replace(/\s/g, ''))) {
        newErrors.patientNationalId = t(UI_TEXT.validationId);
      } else {
        delete newErrors.patientNationalId;
      }
    }
    if (field === 'legalProxyConsent') {
      if (!value) {
        newErrors.legalProxyConsent = t(UI_TEXT.validationConsent);
      } else {
        delete newErrors.legalProxyConsent;
      }
    }
    setErrors(newErrors);
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPatientNationalId(val);
    validateField('patientNationalId', val);
    emitUpdate('family');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPatientFullName(val);
    validateField('patientFullName', val);
    emitUpdate('family');
  };

  const handleRelationshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as RelationshipType;
    setRelationship(val);
    emitUpdate('family');
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setPatientAge(val);
    emitUpdate('family');
  };

  const handleGenderChange = (val: GenderType) => {
    setPatientGender(val);
    emitUpdate('family');
  };

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setLegalProxyConsent(val);
    validateField('legalProxyConsent', val);
    emitUpdate('family');
  };

  const isFormValid = useMemo(() => {
    if (beneficiaryType === 'me') return true;
    return (
      patientFullName.trim().length >= 3 &&
      /^\d{10}$/.test(patientNationalId) &&
      relationship !== '' &&
      patientAge !== '' &&
      patientGender !== '' &&
      legalProxyConsent === true
    );
  }, [beneficiaryType, patientFullName, patientNationalId, relationship, patientAge, patientGender, legalProxyConsent]);

  return (
    <section
      dir={dir}
      lang={lang}
      className="w-full max-w-3xl mx-auto p-6 rounded-2xl bg-white dark:bg-gray-900 border border-[#E6FAF7] dark:border-gray-700 shadow-sm font-cairo transition-colors duration-300"
      aria-label={t(UI_TEXT.sectionTitle)}
    >
      <h2 className="text-xl font-bold text-[#007B6E] dark:text-[#00C6AE] mb-6 text-center">
        {t(UI_TEXT.sectionTitle)}
      </h2>

      {/* P13 Master Toggle */}
      <div className="flex justify-center mb-8" role="radiogroup" aria-label={t(UI_TEXT.sectionTitle)}>
        <div className="inline-flex bg-[#E6FAF7] dark:bg-gray-800 rounded-full p-1 shadow-inner">
          <button
            type="button"
            role="radio"
            aria-checked={beneficiaryType === 'me'}
            onClick={() => handleToggle('me')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#007B6E] focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
              beneficiaryType === 'me'
                ? 'bg-[#007B6E] text-white shadow-md transform scale-105'
                : 'text-[#007B6E] dark:text-[#00C6AE] hover:bg-[#00C6AE]/10'
            }`}
          >
            {t(UI_TEXT.toggleMe)}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={beneficiaryType === 'family'}
            onClick={() => handleToggle('family')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#007B6E] focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
              beneficiaryType === 'family'
                ? 'bg-[#007B6E] text-white shadow-md transform scale-105'
                : 'text-[#007B6E] dark:text-[#00C6AE] hover:bg-[#00C6AE]/10'
            }`}
          >
            {t(UI_TEXT.toggleFamily)}
          </button>
        </div>
      </div>

      {/* Me Active State */}
      {beneficiaryType === 'me' && userSession && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between p-4 bg-[#E6FAF7] dark:bg-gray-800 rounded-xl border border-[#00C6AE]/30">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {isAr ? userSession.fullNameAr : userSession.fullNameEn}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-mono tracking-wider" dir="ltr">
                {userSession.mobileNumber}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-mono tracking-wider" dir="ltr">
                {userSession.nationalIdOrIqama}
              </span>
            </div>
            {userSession.isVerified && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#007B6E] text-white rounded-full text-xs font-bold shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {t(UI_TEXT.verifiedBadge)}
              </div>
            )}
          </div>
          <p className="text-sm text-[#007B6E] dark:text-[#00C6AE] bg-[#E6FAF7]/50 dark:bg-gray-800/50 p-3 rounded-lg border border-[#00C6AE]/20 text-center leading-relaxed">
            {t(UI_TEXT.meNote)}
          </p>
        </div>
      )}

      {/* Family Active State */}
      {beneficiaryType === 'family' && (
        <div className="space-y-6 animate-fade-in">
          {userSession && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
              {t(UI_TEXT.billingNote)}
              <span className="font-mono block mt-1 text-[#007B6E] dark:text-[#00C6AE]" dir="ltr">
                {userSession.mobileNumber}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Full Name */}
            <div className="md:col-span-2">
              <label htmlFor="patientFullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t(UI_TEXT.patientNameLabel)} <span className="text-red-500">*</span>
              </label>
              <input
                id="patientFullName"
                type="text"
                required
                minLength={3}
                value={patientFullName}
                onChange={handleNameChange}
                placeholder={t(UI_TEXT.patientNamePlaceholder)}
                aria-invalid={!!errors.patientFullName}
                aria-describedby={errors.patientFullName ? 'error-patientFullName' : undefined}
                className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.patientFullName
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-[#00C6AE] focus:border-[#007B6E]'
                }`}
              />
              {errors.patientFullName && (
                <p id="error-patientFullName" className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
                  {errors.patientFullName}
                </p>
              )}
            </div>

            {/* Patient National ID / Iqama */}
            <div>
              <label htmlFor="patientNationalId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t(UI_TEXT.patientIdLabel)} <span className="text-red-500">*</span>
              </label>
              <input
                id="patientNationalId"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                required
                value={patientNationalId}
                onChange={handleIdChange}
                placeholder={t(UI_TEXT.patientIdPlaceholder)}
                dir="ltr"
                className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 font-mono tracking-widest text-center ${
                  errors.patientNationalId
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-[#00C6AE] focus:border-[#007B6E]'
                }`}
                aria-invalid={!!errors.patientNationalId}
                aria-describedby={errors.patientNationalId ? 'error-patientNationalId' : undefined}
              />
              {errors.patientNationalId && (
                <p id="error-patientNationalId" className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
                  {errors.patientNationalId}
                </p>
              )}
            </div>

            {/* Relationship */}
            <div>
              <label htmlFor="relationship" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t(UI_TEXT.relationshipLabel)} <span className="text-red-500">*</span>
              </label>
              <select
                id="relationship"
                value={relationship}
                onChange={handleRelationshipChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00C6AE] focus:border-[#007B6E] transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  {t(UI_TEXT.relationshipPlaceholder)}
                </option>
                {(Object.keys(RELATIONSHIP_OPTIONS) as RelationshipType[]).map((key) => (
                  <option key={key} value={key}>
                    {isAr ? RELATIONSHIP_OPTIONS[key].ar : RELATIONSHIP_OPTIONS[key].en}
                  </option>
                ))}
              </select>
            </div>

            {/* Age */}
            <div>
              <label htmlFor="patientAge" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t(UI_TEXT.ageLabel)} <span className="text-red-500">*</span>
              </label>
              <input
                id="patientAge"
                type="number"
                min="0"
                max="120"
                inputMode="numeric"
                required
                value={patientAge}
                onChange={handleAgeChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00C6AE] focus:border-[#007B6E] transition-all duration-200 text-center font-mono"
              />
            </div>

            {/* Gender */}
            <div>
              <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {t(UI_TEXT.genderLabel)} <span className="text-red-500">*</span>
              </span>
              <div className="flex gap-4" role="radiogroup" aria-label={t(UI_TEXT.genderLabel)}>
                {(Object.keys(GENDER_OPTIONS) as GenderType[]).map((genderKey) => (
                  <label
                    key={genderKey}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      patientGender === genderKey
                        ? 'border-[#007B6E] bg-[#E6FAF7] dark:bg-[#007B6E]/20 text-[#007B6E] dark:text-[#00C6AE] ring-2 ring-[#00C6AE]'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-[#00C6AE]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="patientGender"
                      value={genderKey}
                      checked={patientGender === genderKey}
                      onChange={() => handleGenderChange(genderKey)}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold">
                      {isAr ? GENDER_OPTIONS[genderKey].ar : GENDER_OPTIONS[genderKey].en}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* P04 Legal Proxy Consent Checkbox */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <label
              htmlFor="legalProxyConsent"
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                legalProxyConsent
                  ? 'border-[#007B6E] bg-[#E6FAF7] dark:bg-[#007B6E]/10'
                  : errors.legalProxyConsent
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-[#00C6AE]'
              }`}
            >
              <div className="flex items-center h-6 mt-0.5">
                <input
                  id="legalProxyConsent"
                  type="checkbox"
                  checked={legalProxyConsent}
                  onChange={handleConsentChange}
                  required
                  aria-invalid={!!errors.legalProxyConsent}
                  aria-describedby={errors.legalProxyConsent ? 'error-consent' : undefined}
                  className="w-5 h-5 text-[#007B6E] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 rounded focus:ring-[#00C6AE] focus:ring-2 cursor-pointer accent-[#007B6E]"
                />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed select-none">
                {t(UI_TEXT.consentLabel)}
              </span>
            </label>
            {errors.legalProxyConsent && (
              <p id="error-consent" className="mt-2 text-xs text-red-500 font-medium ps-12" role="alert">
                {errors.legalProxyConsent}
              </p>
            )}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        .font-cairo { font-family: 'Cairo', sans-serif; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </section>
  );
};

export default IntakePatientBeneficiarySection;