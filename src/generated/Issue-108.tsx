import React, { useState, useCallback, useMemo } from 'react';

// --- Type Definitions ---
export type BeneficiaryMode = 'me' | 'family';
export type RelationshipType = 'parent' | 'child' | 'spouse' | 'guardian';
export type GenderType = 'male' | 'female';

export interface CaregiverInfo {
  isProxy: boolean;
  relationship?: RelationshipType;
  consentGiven?: boolean;
}

export interface BeneficiaryDetails {
  fullName?: string;
  nationalId?: string;
  age?: number;
  gender?: GenderType;
}

export interface ClinicalCase {
  id: string;
  beneficiaryMode: BeneficiaryMode;
  caregiver: CaregiverInfo;
  beneficiary?: BeneficiaryDetails;
  [key: string]: any;
}

export interface UserSession {
  userId: string;
  fullName: string;
  mobileNumber: string;
  nationalId: string;
  isVerified: boolean;
}

export interface IntakePatientBeneficiarySectionProps {
  activeCase: ClinicalCase;
  isAr: boolean;
  userSession?: UserSession | null;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

// --- Localization Dictionary ---
const DICT = {
  me: { ar: 'نفسي', en: 'Me' },
  family: { ar: 'أحد أفراد الأسرة', en: 'Family / Dependent' },
  verifiedBadge: { ar: 'حساب موثق', en: 'Verified Account' },
  linkedNote: {
    ar: 'سيتم ربط حالتك بسجلك الصحي الرقمي الوطني الموثق.',
    en: 'Your case will be linked to your verified national digital health record.',
  },
  patientName: { ar: 'الاسم الكامل للمريض', en: 'Patient Full Name' },
  patientId: { ar: 'رقم الهوية الوطنية / الإقامة', en: 'National ID / Iqama Number' },
  relationship: { ar: 'صلة القرابة بصاحب الحساب', en: 'Relationship to Account Holder' },
  parent: { ar: 'والد أو والدة', en: 'Parent' },
  child: { ar: 'ابن أو ابنة', en: 'Child' },
  spouse: { ar: 'زوج أو زوجة', en: 'Spouse' },
  guardian: { ar: 'وصي شرعي', en: 'Legal Guardian' },
  age: { ar: 'العمر', en: 'Age' },
  gender: { ar: 'الجنس', en: 'Gender' },
  male: { ar: 'ذكر', en: 'Male' },
  female: { ar: 'أنثى', en: 'Female' },
  consentLabel: {
    ar: 'أُقر بموجب قانون حماية البيانات الصحية السعودي بأنني مقدم الرعاية القانوني / الوكيل المعتمد لهذا المريض.',
    en: 'I declare under Saudi Health Data Protection Law that I am the authorized legal caregiver/family proxy for this patient.',
  },
  contactAnchor: {
    ar: 'سيبقى رقم هاتف صاحب الحساب كمرجع للفوترة وتنبيهات واتساب ورموز التحقق.',
    en: "The account holder's mobile number remains the billing, WhatsApp alert, and OTP communication anchor.",
  },
  nameError: { ar: 'يجب أن يكون الاسم 3 أحرف على الأقل', en: 'Name must be at least 3 characters' },
  idError: { ar: 'يجب أن يتكون الرقم من 10 أرقام', en: 'ID must be exactly 10 digits' },
};

const t = (key: keyof typeof DICT, isAr: boolean): string => {
  const val = DICT[key];
  return typeof val === 'string' ? val : isAr ? val.ar : val.en;
};

// --- Component ---
const IntakePatientBeneficiarySection: React.FC<IntakePatientBeneficiarySectionProps> = ({
  activeCase,
  isAr,
  userSession,
  onUpdateCase,
}) => {
  const [mode, setMode] = useState<BeneficiaryMode>(activeCase.beneficiaryMode || 'me');
  const [beneficiary, setBeneficiary] = useState<BeneficiaryDetails>(activeCase.beneficiary || {});
  const [relationship, setRelationship] = useState<RelationshipType | ''>(activeCase.caregiver?.relationship || '');
  const [consent, setConsent] = useState<boolean>(activeCase.caregiver?.consentGiven || false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dir = isAr ? 'rtl' : 'ltr';
  const fontClass = 'font-cairo';

  const handleModeChange = useCallback(
    (newMode: BeneficiaryMode) => {
      setMode(newMode);
      setErrors({});
      
      if (newMode === 'me') {
        onUpdateCase({
          beneficiaryMode: 'me',
          caregiver: { isProxy: false },
          beneficiary: undefined,
        });
      } else {
        onUpdateCase({
          beneficiaryMode: 'family',
          caregiver: { isProxy: true, relationship: relationship as RelationshipType, consentGiven: consent },
          beneficiary,
        });
      }
    },
    [onUpdateCase, beneficiary, relationship, consent]
  );

  const validateField = (name: string, value: string | number | undefined) => {
    let error = '';
    if (name === 'fullName' && value && String(value).trim().length < 3) {
      error = t('nameError', isAr);
    }
    if (name === 'nationalId' && value && !/^\d{10}$/.test(String(value))) {
      error = t('idError', isAr);
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleBeneficiaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? (value ? parseInt(value, 10) : undefined) : value;
    
    validateField(name, parsedValue as string | number);

    const updatedBeneficiary = { ...beneficiary, [name]: parsedValue };
    setBeneficiary(updatedBeneficiary);
    onUpdateCase({ beneficiary: updatedBeneficiary });
  };

  const handleRelationshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as RelationshipType;
    setRelationship(val);
    onUpdateCase({
      caregiver: { isProxy: true, relationship: val, consentGiven: consent },
    });
  };

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setConsent(val);
    onUpdateCase({
      caregiver: { isProxy: true, relationship: relationship as RelationshipType, consentGiven: val },
    });
  };

  const formatNationalIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    handleBeneficiaryChange(e);
  };

  return (
    <section
      dir={dir}
      className={`w-full max-w-2xl mx-auto p-6 rounded-2xl bg-white dark:bg-gray-900 border border-[#E6FAF7] dark:border-gray-700 shadow-sm transition-all duration-300 ${fontClass}`}
      aria-label={isAr ? 'قسم تحديد المستفيد' : 'Beneficiary Selection Section'}
    >
      {/* P13 Master Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 bg-[#E6FAF7] dark:bg-gray-800 rounded-full shadow-inner" role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'me'}
            onClick={() => handleModeChange('me')}
            className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007B6E] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
              mode === 'me'
                ? 'bg-[#007B6E] text-white shadow-md transform scale-105'
                : 'text-[#007B6E] dark:text-[#00C6AE] hover:bg-[#00C6AE]/10'
            }`}
          >
            {t('me', isAr)}
          </button>
          <button
            role="tab"
            aria-selected={mode === 'family'}
            onClick={() => handleModeChange('family')}
            className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007B6E] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
              mode === 'family'
                ? 'bg-[#007B6E] text-white shadow-md transform scale-105'
                : 'text-[#007B6E] dark:text-[#00C6AE] hover:bg-[#00C6AE]/10'
            }`}
          >
            {t('family', isAr)}
          </button>
        </div>
      </div>

      {/* Mode Content */}
      <div className="min-h-[300px]">
        {mode === 'me' ? (
          <div className="space-y-6 animate-fade-in" role="tabpanel">
            {/* Verified Badge & Info */}
            <div className="p-5 bg-[#E6FAF7] dark:bg-gray-800 rounded-xl border border-[#00C6AE]/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#007B6E] text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-[#007B6E] dark:text-[#00C6AE] uppercase tracking-wider">
                  {t('verifiedBadge', isAr)}
                </span>
              </div>

              {userSession ? (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400 font-medium">{isAr ? 'الاسم' : 'Full Name'}</dt>
                    <dd className="text-gray-900 dark:text-white font-semibold mt-1">{userSession.fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400 font-medium">{isAr ? 'رقم الجوال' : 'Mobile Number'}</dt>
                    <dd className="text-gray-900 dark:text-white font-semibold mt-1 font-mono tracking-wide" dir="ltr">
                      {userSession.mobileNumber}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500 dark:text-gray-400 font-medium">{isAr ? 'رقم الهوية / الإقامة' : 'National ID / Iqama'}</dt>
                    <dd className="text-gray-900 dark:text-white font-semibold mt-1 font-mono tracking-widest" dir="ltr">
                      {userSession.nationalId}
                    </dd>
                  </div>
                </dl>
              ) : (
                <div className="h-20 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#007B6E]"></div>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed px-1 italic">
              {t('linkedNote', isAr)}
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in" role="tabpanel">
            {/* Contact Anchor Note */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200 leading-relaxed">
                {t('contactAnchor', isAr)}
                {userSession?.mobileNumber && (
                  <span className="block mt-1 font-mono text-amber-900 dark:text-amber-100" dir="ltr">
                    {userSession.mobileNumber}
                  </span>
                )}
              </p>
            </div>

            {/* Beneficiary Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Patient Full Name */}
              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor="beneficiary-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t('patientName', isAr)} <span className="text-red-500">*</span>
                </label>
                <input
                  id="beneficiary-name"
                  name="fullName"
                  type="text"
                  required
                  minLength={3}
                  value={beneficiary.fullName || ''}
                  onChange={handleBeneficiaryChange}
                  className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.fullName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-[#00C6AE] focus:border-[#007B6E]'
                  }`}
                  placeholder={isAr ? 'أدخل اسم المريض الرباعي' : 'Enter patient full name'}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'name-error' : undefined}
                />
                {errors.fullName && (
                  <p id="name-error" className="text-xs text-red-500 font-medium mt-1" role="alert">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Patient National ID / Iqama */}
              <div className="space-y-1.5">
                <label htmlFor="beneficiary-id" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t('patientId', isAr)} <span className="text-red-500">*</span>
                </label>
                <input
                  id="beneficiary-id"
                  name="nationalId"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{10}"
                  maxLength={10}
                  required
                  value={beneficiary.nationalId || ''}
                  onChange={formatNationalIdInput}
                  dir="ltr"
                  className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono tracking-widest text-center focus:outline-none focus:ring-2 transition-colors ${
                    errors.nationalId
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-[#00C6AE] focus:border-[#007B6E]'
                  }`}
                  placeholder="0000000000"
                  aria-invalid={!!errors.nationalId}
                  aria-describedby={errors.nationalId ? 'id-error' : undefined}
                />
                {errors.nationalId && (
                  <p id="id-error" className="text-xs text-red-500 font-medium mt-1" role="alert">
                    {errors.nationalId}
                  </p>
                )}
              </div>

              {/* Relationship */}
              <div className="space-y-1.5">
                <label htmlFor="beneficiary-relationship" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t('relationship', isAr)} <span className="text-red-500">*</span>
                </label>
                <select
                  id="beneficiary-relationship"
                  value={relationship}
                  onChange={handleRelationshipChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AE] focus:border-[#007B6E] transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    {isAr ? 'اختر صلة القرابة' : 'Select relationship'}
                  </option>
                  <option value="parent">{t('parent', isAr)}</option>
                  <option value="child">{t('child', isAr)}</option>
                  <option value="spouse">{t('spouse', isAr)}</option>
                  <option value="guardian">{t('guardian', isAr)}</option>
                </select>
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label htmlFor="beneficiary-age" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t('age', isAr)}
                </label>
                <input
                  id="beneficiary-age"
                  name="age"
                  type="number"
                  min={0}
                  max={120}
                  value={beneficiary.age || ''}
                  onChange={handleBeneficiaryChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AE] focus:border-[#007B6E] transition-colors"
                  placeholder={isAr ? 'العمر بالسنوات' : 'Age in years'}
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t('gender', isAr)}
                </span>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={beneficiary.gender === 'male'}
                      onChange={handleBeneficiaryChange}
                      className="w-4 h-4 text-[#007B6E] border-gray-300 focus:ring-[#00C6AE] dark:border-gray-600 dark:bg-gray-800 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-[#007B6E] transition-colors">
                      {t('male', isAr)}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={beneficiary.gender === 'female'}
                      onChange={handleBeneficiaryChange}
                      className="w-4 h-4 text-[#007B6E] border-gray-300 focus:ring-[#00C6AE] dark:border-gray-600 dark:bg-gray-800 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-[#007B6E] transition-colors">
                      {t('female', isAr)}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* P04 Legal Proxy Consent Checkbox */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center pt-0.5">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={handleConsentChange}
                    required
                    className="peer sr-only"
                    aria-describedby="consent-description"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded peer-checked:border-[#007B6E] peer-checked:bg-[#007B6E] transition-all duration-200 flex items-center justify-center group-hover:border-[#00C6AE]">
                    {consent && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span
                  id="consent-description"
                  className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
                >
                  {t('consentLabel', isAr)}
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .font-cairo {
          font-family: 'Cairo', sans-serif;
        }
      `}</style>
    </section>
  );
};

export default IntakePatientBeneficiarySection;