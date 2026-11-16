import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Users, User, CheckCircle2, Phone, AlertCircle } from 'lucide-react';
import { ClinicalCase } from '../../types';
import { UserSession } from '../../hooks/workflowConstants';
import { clampAge, maskNationalId, validateNationalId } from '../../utils/phoneValidation';

/** Placeholder identity of the logged-in account holder (verified at login, never retyped here). */
const ACCOUNT_HOLDER_NATIONAL_ID = '1029384756';

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

  // Sync mode changes
  const handleModeChange = (newMode: 'me' | 'family') => {
    setMode(newMode);
    if (newMode === 'me') {
      const selfName = userSession?.fullName || 'سامي الحربي (Sami Al-Harbi)';
      onUpdateCase({
        beneficiaryMode: 'me',
        patientName: selfName,
        patientNameAr: isAr ? selfName : activeCase.patientNameAr,
        patientNameEn: !isAr ? selfName : activeCase.patientNameEn,
        age: 58,
        gender: 'M',
        caregiver: {
          isProxy: false,
          name: '',
          relationship: '',
          nationalId: '',
          phone: '',
          hasLegalConsent: true,
        },
      });
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
          nationalId: ACCOUNT_HOLDER_NATIONAL_ID,
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
        nationalId: ACCOUNT_HOLDER_NATIONAL_ID,
        phone: userSession?.phone || activeCase.patientPhone,
        hasLegalConsent: nextConsent,
      },
    });
  };

  const accountName = userSession?.fullName || (isAr ? 'سامي الحربي' : 'Sami Al-Harbi');
  const accountPhone = userSession?.phone || activeCase.patientPhone || '+966 50 000 0099';
  const accountId = ACCOUNT_HOLDER_NATIONAL_ID;
  const idCheck = beneficiaryId ? validateNationalId(beneficiaryId) : null;

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

        {/* Mode 1: Self (Me) Banner */}
        {mode === 'me' ? (
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-5 rounded-xl border border-teal-800/60 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-bold mb-1.5 text-xs text-teal-300">
                <span className="bg-teal-500/20 text-teal-200 px-2 py-0.5 rounded text-[10px] font-mono border border-teal-500/30">
                  P01 · {isAr ? 'الهوية الوطنية المعتمدة' : 'National ID Verified'}
                </span>
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>{isAr ? 'الملف الطبي مرتبط بحسابك الموثق مباشرة' : 'Linked to your verified health record'}</span>
              </div>
              <h2 className="text-xl font-black tracking-tight">{accountName}</h2>
              <p className="text-slate-300 text-xs mt-1">
                {isAr ? 'الهوية الوطنية / الإقامة:' : 'National ID:'} <span className="font-mono text-teal-300 font-bold">{accountId.slice(0, 2)}********</span> · {isAr ? 'العمر: 58' : 'Age: 58'} · {isAr ? 'الجنس: ذكر' : 'Gender: Male'} · {isAr ? 'الهاتف:' : 'Phone:'} <span className="font-mono text-teal-300 font-bold" dir="ltr">{accountPhone}</span>
              </p>
            </div>

            <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl text-center shrink-0">
              <span className="text-[10px] text-teal-200 block font-mono">P02 · {isAr ? 'رقم التتبع' : 'Case Number'}</span>
              <span className="text-base font-mono font-black text-teal-300">{activeCase.caseNumber}</span>
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
                    placeholder={isAr ? 'مثال: فهد الحربي' : 'e.g. Fahad Al-Harbi'}
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
