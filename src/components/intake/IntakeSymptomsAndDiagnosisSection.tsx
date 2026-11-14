import React, { useState } from 'react';
import { Heart, AlertTriangle, Check, Pill, FileText, Video, Plus, X, ShieldAlert } from 'lucide-react';
import { ClinicalCase } from '../../types';

interface Props {
  activeCase: ClinicalCase;
  isAr: boolean;
  privacyAgreed: boolean;
  setPrivacyAgreed: (val: boolean) => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

const COMMON_RED_FLAGS = [
  { id: 'dyspnea', en: 'Severe Shortness of Breath', ar: 'ضيق تنفس حاد' },
  { id: 'syncope', en: 'Dizziness or Fainting', ar: 'دوخة أو إغماء' },
  { id: 'chest_pain', en: 'Severe Chest Pressure', ar: 'ألم ضاغط في الصدر' },
  { id: 'weight_loss', en: 'Unexplained Weight Loss', ar: 'فقدان وزن غير مبرر' },
  { id: 'fever', en: 'High Persistent Fever', ar: 'حمى شديدة ومستمرة' },
];

export const IntakeSymptomsAndDiagnosisSection: React.FC<Props> = ({
  activeCase,
  isAr,
  privacyAgreed,
  setPrivacyAgreed,
  onUpdateCase,
}) => {
  const [customFlagInput, setCustomFlagInput] = useState('');
  const [medInput, setMedInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');

  const activeFlags = activeCase.redFlags || [];
  const activeMeds = activeCase.currentMedications || [];
  const activeAllergies = activeCase.allergies || [];
  const isNkda = !!activeCase.noKnownAllergies;
  const isNoMeds = !!activeCase.noCurrentMedications;

  // Toggle or add red flag
  const toggleFlag = (flagName: string) => {
    const exists = activeFlags.includes(flagName);
    const updated = exists ? activeFlags.filter((f) => f !== flagName) : [...activeFlags, flagName];
    onUpdateCase({ redFlags: updated });
  };

  const handleAddCustomFlag = () => {
    const trimmed = customFlagInput.trim();
    if (trimmed && !activeFlags.includes(trimmed)) {
      onUpdateCase({ redFlags: [...activeFlags, trimmed] });
      setCustomFlagInput('');
    }
  };

  // Add medication
  const handleAddMedication = () => {
    const trimmed = medInput.trim();
    if (trimmed && !activeMeds.includes(trimmed)) {
      onUpdateCase({ currentMedications: [...activeMeds, trimmed], noCurrentMedications: false });
      setMedInput('');
    }
  };

  const handleRemoveMedication = (med: string) => {
    onUpdateCase({ currentMedications: activeMeds.filter((m) => m !== med) });
  };

  const handleToggleNoMeds = () => {
    if (!isNoMeds) {
      onUpdateCase({ noCurrentMedications: true, currentMedications: [] });
    } else {
      onUpdateCase({ noCurrentMedications: false });
    }
  };

  // Add allergy
  const handleAddAllergy = () => {
    const trimmed = allergyInput.trim();
    if (trimmed && !activeAllergies.includes(trimmed)) {
      onUpdateCase({ allergies: [...activeAllergies, trimmed], noKnownAllergies: false });
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (alg: string) => {
    onUpdateCase({ allergies: activeAllergies.filter((a) => a !== alg) });
  };

  const handleToggleNkda = () => {
    if (!isNkda) {
      onUpdateCase({ noKnownAllergies: true, allergies: [] });
    } else {
      onUpdateCase({ noKnownAllergies: false });
    }
  };

  return (
    <>
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
          {isAr ? (activeCase.specialtyAr || activeCase.specialty || 'استشارة عامة') : (activeCase.specialtyEn || activeCase.specialty || 'General')}
        </span>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          {isAr ? 'التشخيص الطبي الحالي:' : 'Confirmed Medical Diagnosis:'}
        </label>
        <input
          type="text"
          placeholder={isAr ? 'مثال: انزلاق غضروفي قطني، تضيق الصمام الأبهري...' : 'e.g. Lumbar disc herniation, aortic stenosis...'}
          value={isAr ? (activeCase.diagnosisAr || activeCase.diagnosis || '') : (activeCase.diagnosisEn || activeCase.diagnosis || '')}
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
          placeholder={isAr ? 'يرجى كتابة الشكوى الأساسية ومدتها بالتفصيل...' : 'Please describe your main symptoms and duration...'}
          value={isAr ? (activeCase.symptomsAr || activeCase.symptoms || '') : (activeCase.symptomsEn || activeCase.symptoms || '')}
          onChange={(e) => onUpdateCase(isAr ? { symptomsAr: e.target.value, symptoms: e.target.value } : { symptomsEn: e.target.value, symptoms: e.target.value })}
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-alo-teal outline-none leading-relaxed shadow-sm font-medium"
        />
      </div>

      {/* P06: Symptom Severity & Red Flags (Optional Interactive Checklist) */}
      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-mono font-bold">
              P06 · {isAr ? 'مؤشرات الخطورة' : 'Red-Flag Signs'}
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'العلامات السريرية المصاحبة (اختياري):' : 'Associated Critical Signs (Optional):'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {isAr ? 'انقر لتحديد أو إلغاء التحديد' : 'Click to select or deselect'}
          </span>
        </div>

        {/* Clickable Symptom Chips */}
        <div className="flex flex-wrap gap-2">
          {COMMON_RED_FLAGS.map((rf) => {
            const label = isAr ? rf.ar : rf.en;
            const isSelected = activeFlags.includes(label);
            return (
              <button
                key={rf.id}
                type="button"
                onClick={() => toggleFlag(label)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-sm border border-amber-600'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-amber-200/80 hover:border-amber-400'
                }`}
              >
                {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 text-amber-600" />}
                <span>{label}</span>
              </button>
            );
          })}

          {/* Custom Typed Flags */}
          {activeFlags
            .filter((f) => !COMMON_RED_FLAGS.some((rf) => (isAr ? rf.ar : rf.en) === f))
            .map((f, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-white border border-amber-600 shadow-sm"
              >
                <span>{f}</span>
                <button
                  type="button"
                  onClick={() => toggleFlag(f)}
                  className="hover:opacity-75 focus:outline-none cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
        </div>

        {/* Custom Symptom Input */}
        <div className="flex items-center gap-2 pt-1 max-w-md">
          <input
            type="text"
            placeholder={isAr ? 'أضف عرضاً إضافياً واضغط إضافة...' : 'Add another symptom and tap Add...'}
            value={customFlagInput}
            onChange={(e) => setCustomFlagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomFlag(); } }}
            className="flex-1 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-xs rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={handleAddCustomFlag}
            className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            {isAr ? '+ إضافة' : '+ Add'}
          </button>
        </div>
      </div>

      {/* P09: Dynamic Patient Medications */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-alo-teal bg-alo-mint px-2 py-0.5 rounded font-mono font-bold">
              P09 · {isAr ? 'الأدوية الحالية' : 'Current Medications'}
            </span>
            <Pill className="w-3.5 h-3.5 text-alo-teal" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'الأدوية التي تتناولها حالياً (اختياري):' : 'Current Prescriptions (Optional):'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleNoMeds}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              isNoMeds
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-slate-400'
            }`}
          >
            {isNoMeds ? (isAr ? '✓ لا أتناول أدوية حالياً' : '✓ No Current Medications') : (isAr ? 'لا أتناول أدوية' : 'No Current Medications')}
          </button>
        </div>

        {/* Render Medication Chips */}
        {!isNoMeds && (
          <>
            <div className="flex flex-wrap gap-2 min-h-[28px]">
              {activeMeds.length === 0 ? (
                <span className="text-slate-400 text-[11px] italic">
                  {isAr ? 'لم يتم إضافة أدوية بعد (اكتب اسم الدواء بالأسفل)...' : 'No medications added yet (type below to add)...'}
                </span>
              ) : (
                activeMeds.map((med, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-900 text-teal-900 dark:text-teal-200 shadow-xs"
                  >
                    <span>{med}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(med)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex items-center gap-2 max-w-md pt-1">
              <input
                type="text"
                placeholder={isAr ? 'اكتب اسم الدواء والجرعة (مثل: Panadol 500mg)...' : 'Type medication name & dose (e.g. Panadol 500mg)...'}
                value={medInput}
                onChange={(e) => setMedInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMedication(); } }}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-alo-teal"
              />
              <button
                type="button"
                onClick={handleAddMedication}
                className="px-3 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                {isAr ? '+ إضافة' : '+ Add'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* P10: Dynamic Patient Allergies */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 p-4 rounded-xl space-y-3 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-rose-800 bg-rose-100 dark:bg-rose-900/60 dark:text-rose-200 px-2 py-0.5 rounded font-mono font-bold">
              P10 · {isAr ? 'حساسية الأدوية' : 'Drug Allergies'}
            </span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'هل تعاني من حساسية تجاه أدوية معينة؟ (اختياري):' : 'Do you have known drug allergies? (Optional):'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleNkda}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              isNkda
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-slate-400'
            }`}
          >
            {isNkda ? (isAr ? '✓ لا توجد حساسية معروفة (NKDA)' : '✓ No Known Drug Allergies (NKDA)') : (isAr ? 'لا توجد حساسية معروفة' : 'No Known Allergies (NKDA)')}
          </button>
        </div>

        {/* Render Allergy Chips */}
        {!isNkda && (
          <>
            <div className="flex flex-wrap gap-2 min-h-[28px]">
              {activeAllergies.length === 0 ? (
                <span className="text-slate-400 text-[11px] italic">
                  {isAr ? 'لم تسجل أي حساسية دوائية بعد...' : 'No allergies recorded yet...'}
                </span>
              ) : (
                activeAllergies.map((alg, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200 border border-rose-300 dark:border-rose-800 shadow-xs"
                  >
                    <span>{alg}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(alg)}
                      className="text-rose-500 hover:text-rose-800 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex items-center gap-2 max-w-md pt-1">
              <input
                type="text"
                placeholder={isAr ? 'اكتب اسم المادة (مثل: البنسلين، أسبيرين)...' : 'Type allergy (e.g. Penicillin, Sulfa)...'}
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAllergy(); } }}
                className="flex-1 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                {isAr ? '+ إضافة' : '+ Add'}
              </button>
            </div>
          </>
        )}
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
              className={`text-xs px-3 py-1 rounded-lg font-extrabold flex items-center gap-1.5 shadow-sm border transition-colors cursor-pointer ${
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
              className={`text-xs px-3 py-1 rounded-lg font-extrabold flex items-center gap-1.5 shadow-sm border transition-colors cursor-pointer ${
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
    </>
  );
};
