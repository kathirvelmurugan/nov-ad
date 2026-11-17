import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Users, User, CheckCircle2, Phone, AlertCircle } from 'lucide-react';
import { ClinicalCase } from '../../types';
import { USER_SESSION_KEY, UserSession } from '../../hooks/workflowConstants';
import { clampAge, isPlaceholderPatientName, maskNationalId, validateNationalId } from '../../utils/phoneValidation';
import { apiClient } from '../../services/apiClient';

interface Props {
  activeCase: ClinicalCase;
  isAr: boolean;
  userSession?: UserSession | null;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

export const IntakePatientBeneficiarySection: React.FC<Props> = ({
  activeCase,
  isAr,
  userSession,
  onUpdateCase,
}) => {
  const initialMode = activeCase.beneficiaryMode || (activeCase.caregiver?.isProxy ? 'family' : 'me');
  const [mode, setMode] = useState<'me' | 'family'>(initialMode);

  // Beneficiary state (when mode === 'family')
  const [beneficiaryName, setBeneficiaryName] = useState(
    mode === 'family' ? (activeCase.patientName || '') : ''
  );
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [relationship, setRelationship] = useState(activeCase.caregiver?.relationship || 'Parent');
  const [beneficiaryAge, setBeneficiaryAge] = useState<number>(activeCase.age || 58);
  const [beneficiaryGender, setBeneficiaryGender] = useState<'M' | 'F'>(activeCase.gender || 'M');
  const [proxyConsent, setProxyConsent] = useState(activeCase.caregiver?.hasLegalConsent ?? true);

  // Self identity (mode === 'me'). A patient who signed up with a phone number
  // owns nothing else: the account is stored as full_name 'Patient' with no age
  // and no national ID, so this is the only place those facts can be captured.
  const [selfName, setSelfName] = useState(
    !isPlaceholderPatientName(activeCase.patientName)
      ? String(activeCase.patientName)
      : !isPlaceholderPatientName(userSession?.fullName)
        ? String(userSession?.fullName)
        : ''
  );
  const [selfId, setSelfId] = useState('');
  const [selfAge, setSelfAge] = useState<number>(activeCase.age || 0);
  const [selfGender, setSelfGender] = useState<'M' | 'F'>(activeCase.gender || 'M');

  const handleUpdateSelf = (updates: { name?: string; id?: string; age?: number; gender?: 'M' | 'F' }) => {
    const nextName = updates.name !== undefined ? updates.name : selfName;
    const nextId = updates.id !== undefined ? updates.id : selfId;
    const nextAge = updates.age !== undefined ? updates.age : selfAge;
    const nextGender = updates.gender !== undefined ? updates.gender : selfGender;

    if (updates.name !== undefined) setSelfName(nextName);
    if (updates.id !== undefined) setSelfId(nextId);
    if (updates.age !== undefined) setSelfAge(nextAge);
    if (updates.gender !== undefined) setSelfGender(nextGender);

    onUpdateCase({
      beneficiaryMode: 'me',
      patientName: nextName,
      patientNameAr: isAr ? nextName : activeCase.patientNameAr,
      patientNameEn: !isAr ? nextName : activeCase.patientNameEn,
      nationalIdMasked: nextId ? maskNationalId(nextId) : activeCase.nationalIdMasked,
      age: nextAge,
      gender: nextGender,
      caregiver: {
        isProxy: false,
        name: '',
        relationship: '',
        nationalId: '',
        phone: '',
        hasLegalConsent: true,
      },
    });
  };

  // Writing the name back to the account stops the next case from greeting the
  // patient as the placeholder word 'Patient'. The stored session is updated in
  // lockstep so the header does not disagree with the database.
  const persistSelfName = () => {
    const name = selfName.trim();
    if (name.length < 2 || name === userSession?.fullName) return;
    apiClient
      .updateMyProfile(name)
      .then((saved) => {
        if (!saved) return;
        try {
          const raw = localStorage.getItem(USER_SESSION_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.fullName = name;
            localStorage.setItem(USER_SESSION_KEY, JSON.stringify(parsed));
          }
        } catch (e) {}
        // Refresh the in-memory session so the header name follows the database.
        window.dispatchEvent(new CustomEvent('alo:profile-updated', { detail: { fullName: name } }));
      })
      .catch(() => {});
  };

  // Sync mode changes
  const handleModeChange = (newMode: 'me' | 'family') => {
    setMode(newMode);
    if (newMode === 'me') {
      // Re-apply the facts the patient already typed instead of resetting them
      // to the session/case defaults: switching tabs must not erase identity.
      handleUpdateSelf({});
    } else {
      onUpdateCase({
        beneficiaryMode: 'family',
        patientName: beneficiaryName || (isAr ? 'المريض المستفيد' : 'Patient Beneficiary'),
        age: beneficiaryAge,
        gender: beneficiaryGender,
        caregiver: {
          isProxy: true,
          name: userSession?.fullName || 'المرافق المفوض',
          relationship: relationship,
          nationalId: '',
          phone: userSession?.phone || activeCase.patientPhone,
          hasLegalConsent: proxyConsent,
        },
      });
    }
  };

  const handleUpdateBeneficiary = (updates: Partial<{
    name: string;
    id: string;
    rel: string;
    age: number;
    gender: 'M' | 'F';
    consent: boolean;
  }>) => {
    const nextName = updates.name !== undefined ? updates.name : beneficiaryName;
    const nextId = updates.id !== undefined ? updates.id : beneficiaryId;
    const nextRel = updates.rel !== undefined ? updates.rel : relationship;
    const nextAge = updates.age !== undefined ? updates.age : beneficiaryAge;
    const nextGender = updates.gender !== undefined ? updates.gender : beneficiaryGender;
    const nextConsent = updates.consent !== undefined ? updates.consent : proxyConsent;

    const idValidation = validateNationalId(nextId);

    if (updates.name !== undefined) setBeneficiaryName(nextName);
    if (updates.id !== undefined) setBeneficiaryId(idValidation.value);
    if (updates.rel !== undefined) setRelationship(nextRel);
    if (updates.age !== undefined) setBeneficiaryAge(nextAge);
    if (updates.gender !== undefined) setBeneficiaryGender(nextGender);
    if (updates.consent !== undefined) setProxyConsent(nextConsent);

    // Only a complete 10-digit ID produces a mask; partial input must never pass the submit gate.
    const maskedId = maskNationalId(nextId);

    onUpdateCase({
      beneficiaryMode: 'family',
      patientName: nextName,
      patientNameAr: isAr ? nextName : activeCase.patientNameAr,
      patientNameEn: !isAr ? nextName : activeCase.patientNameEn,
      nationalIdMasked: maskedId,
      age: nextAge,
      gender: nextGender,
      caregiver: {
        isProxy: true,
        name: userSession?.fullName || (isAr ? 'المرافق المفوض' : 'Caregiver Proxy'),
        relationship: nextRel,
        nationalId: '',
        phone: userSession?.phone || activeCase.patientPhone,
        hasLegalConsent: nextConsent,
      },
    });
  };

  const accountName = userSession?.fullName || activeCase.patientName || (isAr ? 'صاحب الحساب' : 'Account Holder');
  const accountPhone = userSession?.phone || activeCase.patientPhone || '';
  const accountId = activeCase.nationalIdMasked || '';
  const idCheck = beneficiaryId ? validateNationalId(beneficiaryId) : null;
  const selfIdCheck = selfId ? validateNationalId(selfId) : null;

  return (
    <div className="space-y-4">
      {/* P13 Master Segmented Toggle: Me vs. Family Member */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>P13 · {isAr ? 'من هو المستفيد من الاستشارة الطبية؟' : 'Who is this consultation for?'}</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr
                ? 'اختر ما إذا كان الطلب لنفسك أو لأحد أفراد العائلة / تحت وصايتك'
                : 'Select whether the request is for yourself or a family dependent/ward'}
            </p>
          </div>

          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => handleModeChange('me')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'me'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{isAr ? 'نفسي (صاحب الحساب)' : 'Me (Account Holder)'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('family')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'family'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isAr ? 'أحد أفراد الأسرة (مرافق)' : 'Family / Dependent'}</span>
            </button>
          </div>
        </div>

        {/* Mode 1: Self (Me) — a phone-only account holds no name, age or
            national ID, so those facts are captured here and written back to the
            account and the case. */}
        {mode === 'me' ? (
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-5 rounded-xl border border-teal-800/60 shadow-md text-white space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 font-bold text-xs text-teal-300">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    accountId
                      ? 'bg-teal-500/20 text-teal-200 border-teal-500/30'
                      : 'bg-amber-500/15 text-amber-200 border-amber-500/30'
                  }`}
                >
                  P01 ·{' '}
                  {accountId
                    ? (isAr ? 'الهوية الوطنية مسجلة' : 'National ID Recorded')
                    : (isAr ? 'الهوية الوطنية مطلوبة' : 'National ID Required')}
                </span>
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>{isAr ? 'البيانات تُحفظ في ملفك الطبي' : 'Saved to your medical record'}</span>
              </div>

              <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl text-center shrink-0">
                <span className="text-[10px] text-teal-200 block font-mono">P02 · {isAr ? 'رقم التتبع' : 'Case Number'}</span>
                <span className="text-base font-mono font-black text-teal-300">{activeCase.caseNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* Own Full Name */}
              <div className="sm:col-span-2 md:col-span-2">
                <label htmlFor="self-full-name" className="block mb-1 font-bold text-teal-100">
                  {isAr ? 'اسمك بالكامل (كما في الهوية):' : 'Your Full Name (As in ID):'} *
                </label>
                <input
                  id="self-full-name"
                  type="text"
                  value={selfName}
                  placeholder={isAr ? 'مثال: محمد العتيبي' : 'e.g. Mohammed Al-Otaibi'}
                  onChange={(e) => handleUpdateSelf({ name: e.target.value })}
                  onBlur={persistSelfName}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder:text-slate-400 font-bold outline-none focus:border-teal-400 shadow-xs"
                />
              </div>

              {/* Own National ID */}
              <div>
                <label htmlFor="self-national-id" className="block mb-1 font-bold text-teal-100">
                  {isAr ? 'رقم الهوية الوطنية / الإقامة:' : 'National ID / Iqama:'}
                </label>
                <input
                  id="self-national-id"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={selfId}
                  placeholder="10XXXXXXXX"
                  aria-invalid={!!selfIdCheck && !selfIdCheck.isValid}
                  onChange={(e) => handleUpdateSelf({ id: e.target.value })}
                  className={`w-full bg-white/10 border rounded-xl px-3 py-2 font-mono font-bold text-white placeholder:text-slate-400 outline-none shadow-xs ${
                    selfIdCheck && !selfIdCheck.isValid
                      ? 'border-rose-400'
                      : 'border-white/20 focus:border-teal-400'
                  }`}
                />
                {selfIdCheck && !selfIdCheck.isValid && (
                  <p className="mt-1 text-[10px] font-bold text-rose-300" role="alert">
                    {isAr ? selfIdCheck.issue?.ar : selfIdCheck.issue?.en}
                  </p>
                )}
              </div>

              {/* Own Age */}
              <div>
                <label htmlFor="self-age" className="block mb-1 font-bold text-teal-100">
                  {isAr ? 'العمر:' : 'Age:'} *
                </label>
                <input
                  id="self-age"
                  type="number"
                  min={1}
                  max={120}
                  value={selfAge || ''}
                  onChange={(e) => handleUpdateSelf({ age: clampAge(e.target.value, selfAge) })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 font-mono font-bold text-white outline-none focus:border-teal-400 shadow-xs"
                />
              </div>

              {/* Own Gender */}
              <div>
                <span className="block mb-1 font-bold text-teal-100">{isAr ? 'الجنس:' : 'Gender:'}</span>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateSelf({ gender: 'M' })}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs border transition-all ${
                      selfGender === 'M'
                        ? 'bg-teal-400 text-slate-900 border-teal-400'
                        : 'bg-white/10 text-slate-200 border-white/20 hover:border-teal-400'
                    }`}
                  >
                    {isAr ? 'ذكر' : 'Male'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateSelf({ gender: 'F' })}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs border transition-all ${
                      selfGender === 'F'
                        ? 'bg-teal-400 text-slate-900 border-teal-400'
                        : 'bg-white/10 text-slate-200 border-white/20 hover:border-teal-400'
                    }`}
                  >
                    {isAr ? 'أنثى' : 'Female'}
                  </button>
                </div>
              </div>

              {/* Verified login phone — read only, it is the account identity */}
              <div className="sm:col-span-2 md:col-span-3 self-end flex flex-wrap items-center gap-x-2 gap-y-1 pb-2 text-[11px] text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-teal-400" />
                  {isAr ? 'الهاتف الموثق:' : 'Verified phone:'}{' '}
                  <span className="font-mono text-teal-300 font-bold" dir="ltr">{accountPhone}</span>
                </span>
                <span className="text-slate-500">·</span>
                <span>{isAr ? 'الاسم يُحفظ في حسابك ويُستخدم في كل حالة جديدة.' : 'Your name is saved to your account and reused on every new case.'}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Mode 2: Family Member / Caregiver Form */
          <div className="space-y-3 pt-2">
            {/* Communication Anchor Notice */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200">
              <Phone className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong>{isAr ? 'قناة التواصل والفوترة:' : 'Communication & Billing Anchor:'}</strong>{' '}
                {isAr
                  ? `أنت مسجل كمرافق مفوض باسم (${accountName}). سيتم إرسال كافة روابط الدفع، وإشعارات الواتساب، وتحديثات الحالة إلى رقم جوالك الموثق (${accountPhone}).`
                  : `You are logged in as the authorized caregiver (${accountName}). All WhatsApp notifications, payment links, and call schedules will be sent to your phone (${accountPhone}).`}
              </div>
            </div>

            {/* Beneficiary Clinical Details Card */}
            <div className="card-clinical p-4 space-y-3 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'بيانات المريض المستفيد (المراد تقييمه طبياً):' : 'Patient Beneficiary Details (To Be Clinically Evaluated):'}</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                  P04 · {isAr ? 'مستفيد تابع' : 'Dependent Profile'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {/* Patient Full Name */}
                <div className="sm:col-span-2">
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-bold">
                    {isAr ? 'اسم المريض بالكامل (كما في الهوية):' : 'Patient Full Name (As in ID):'} *
                  </label>
                  <input
                    type="text"
                    value={beneficiaryName}
                    placeholder={isAr ? 'مثال: محمد العتيبي' : 'e.g. Mohammed Al-Otaibi'}
                    onChange={(e) => handleUpdateBeneficiary({ name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold outline-none focus:border-emerald-600 shadow-xs"
                  />
                </div>

                {/* Patient National ID */}
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-bold">
                    {isAr ? 'رقم الهوية الوطنية / الإقامة:' : 'National ID / Iqama:'} *
                  </label>
                  <input
                    id="field-nationalId"
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={beneficiaryId}
                    placeholder="10XXXXXXXX"
                    aria-invalid={!!idCheck && !idCheck.isValid}
                    onChange={(e) => handleUpdateBeneficiary({ id: e.target.value })}
                    className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-2 font-mono font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-600 shadow-xs ${
                      idCheck && !idCheck.isValid ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {idCheck && !idCheck.isValid && (
                    <p className="mt-1 text-[10px] font-bold text-rose-600" role="alert">
                      {isAr ? idCheck.issue?.ar : idCheck.issue?.en}
                    </p>
                  )}
                </div>

                {/* Relationship */}
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-bold">
                    {isAr ? 'صلة القرابة بصاحب الحساب:' : 'Relationship:'} *
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => handleUpdateBeneficiary({ rel: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold outline-none focus:border-emerald-600 shadow-xs"
                  >
                    <option value="Parent">{isAr ? 'والد / والدة (Parent)' : 'Parent'}</option>
                    <option value="Child">{isAr ? 'ابن / ابنة (Child)' : 'Child'}</option>
                    <option value="Spouse">{isAr ? 'زوج / زوجة (Spouse)' : 'Spouse'}</option>
                    <option value="Legal Guardian">{isAr ? 'وصي شرعي معتمد (Guardian)' : 'Legal Guardian'}</option>
                  </select>
                </div>

                {/* Age */}
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-bold">
                    {isAr ? 'عمر المريض:' : 'Patient Age:'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={beneficiaryAge}
                    onChange={(e) => handleUpdateBeneficiary({ age: clampAge(e.target.value, beneficiaryAge) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-600 shadow-xs"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-bold">
                    {isAr ? 'الجنس:' : 'Gender:'}
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateBeneficiary({ gender: 'M' })}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs border transition-all ${
                        beneficiaryGender === 'M'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isAr ? 'ذكر' : 'Male'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateBeneficiary({ gender: 'F' })}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs border transition-all ${
                        beneficiaryGender === 'F'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isAr ? 'أنثى' : 'Female'}
                    </button>
                  </div>
                </div>

                {/* Tracking Code Badge */}
                <div className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 font-bold">
                    {isAr ? 'رقم ملف الحالة المولد:' : 'Generated Case Tracking:'}
                  </span>
                  <span className="font-mono text-xs font-black text-emerald-800 dark:text-emerald-300">
                    {activeCase.caseNumber}
                  </span>
                </div>
              </div>

              {/* Legal Proxy Consent Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
                <input
                  type="checkbox"
                  checked={proxyConsent}
                  onChange={(e) => handleUpdateBeneficiary({ consent: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {isAr ? 'إقرار التفويض الشرعي (P04):' : 'Legal Caregiver Authorization (P04):'}
                  </strong>{' '}
                  {isAr
                    ? 'أقر بصفتي وكيلاً شرعياً / مرافقاً مرخصاً بأن لدي الموافقة القانونية لطلب الرأي الطبي الثاني وإدارة الملف الصحي لهذا المريض بموجب نظام حماية البيانات الصحية في المملكة العربية السعودية.'
                    : 'I declare that as an authorized legal caregiver/family proxy, I have legal authorization to initiate this second opinion and manage health records for this patient in accordance with Saudi Health Information Privacy Law.'}
                </span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
