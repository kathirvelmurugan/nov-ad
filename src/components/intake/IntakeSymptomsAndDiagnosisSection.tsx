import React, { useState } from 'react';
import { Heart, AlertTriangle, Check, Pill, FileText, Video, Phone, Plus, X, ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';
import { ClinicalCase } from '../../types';

interface Props {
  activeCase: ClinicalCase;
  isAr: boolean;
  privacyAgreed: boolean;
  setPrivacyAgreed: (val: boolean) => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  isReadOnly?: boolean;
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
  isReadOnly = false,
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
          id="intake-diagnosis-input"
          data-testid="intake-diagnosis-input"
          placeholder={isAr ? 'مثال: انزلاق غضروفي قطني، تضيق الصمام الأبهري...' : 'e.g. Lumbar disc herniation, aortic stenosis...'}
          value={isAr ? (activeCase.diagnosisAr || activeCase.diagnosis || '') : (activeCase.diagnosisEn || activeCase.diagnosis || '')}
          onChange={(e) => onUpdateCase(isAr ? { diagnosisAr: e.target.value, diagnosis: e.target.value } : { diagnosisEn: e.target.value, diagnosis: e.target.value })}
          className="w-full bg-white dark:bg-slate-900 border-2 border-emerald-400 dark:border-emerald-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-alo-teal outline-none font-bold shadow-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          {isAr ? 'الأعراض والشكوى السريرية الحالية:' : 'Symptoms & Patient History:'}
        </label>
        <textarea
          rows={3}
          id="intake-symptoms-input"
          data-testid="intake-symptoms-input"
          placeholder={isAr ? 'يرجى كتابة الشكوى الأساسية ومدتها بالتفصيل...' : 'Please describe your main symptoms and duration...'}
          value={isAr ? (activeCase.symptomsAr || activeCase.symptoms || '') : (activeCase.symptomsEn || activeCase.symptoms || '')}
          onChange={(e) => onUpdateCase(isAr ? { symptomsAr: e.target.value, symptoms: e.target.value } : { symptomsEn: e.target.value, symptoms: e.target.value })}
          className="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-alo-teal outline-none leading-relaxed shadow-sm font-medium"
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

      {/* P12: Consultation Format & Service Tier Selection */}
      {(() => {
        const isSubmitted = Boolean(isReadOnly);

        const formats = [
          {
            id: 'written' as const,
            titleAr: 'رأي طبي مكتوب فقط',
            titleEn: 'Written Opinion Only',
            priceSar: 400,
            icon: FileText,
            descAr: 'تقرير طبي تخصصي مفصل ومترجم',
            descEn: 'Comprehensive translated medical dossier',
          },
          {
            id: 'video' as const,
            titleAr: 'مرئي + رأي مكتوب',
            titleEn: 'Video Call + Written',
            priceSar: 750,
            icon: Video,
            descAr: 'مكالمة فيديو مرئية وترجمة تمريض ألو',
            descEn: 'Live telehealth video with nurse interpreter',
          },
          {
            id: 'voice' as const,
            titleAr: 'صوتي + رأي مكتوب',
            titleEn: 'Voice Call + Written',
            priceSar: 550,
            icon: Phone,
            descAr: 'مكالمة هاتفية تخصصية مع الاستشاري',
            descEn: 'Direct phone tele-consultation + report',
          },
        ];

        return (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                    P12 · {isAr ? 'صيغة الاستشارة وتفضيل المسار السريري' : 'Consultation Format & Service Tier:'}
                  </span>
                  {isSubmitted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300">
                      <Lock className="w-3 h-3" />
                      {isAr ? 'مغلق بعد الإرسال' : 'Locked Post-Submit'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isAr
                    ? 'تفضيلك المبدئي · يعتمده الطبيب السعودي المعالج (D06) قبل الدفع'
                    : 'Your initial preference · Confirmed by your Saudi treating doctor (D06)'}
                </p>
              </div>

              {!isSubmitted && (
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                  {isAr ? '✓ يمكنك التبديل بحرية أثناء كتابة الطلب' : '✓ Switch anytime before submitting'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {formats.map((f) => {
                const Icon = f.icon;
                const isSelected = (activeCase.consultationType || 'written') === f.id;

                return (
                  <button
                    key={f.id}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => {
                      if (!isSubmitted) {
                        onUpdateCase({ consultationType: f.id });
                      }
                    }}
                    className={`relative p-3 rounded-xl border text-start transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    } ${isSubmitted ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer active:scale-98'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                          {isAr ? f.titleAr : f.titleEn}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </div>

                    <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {isAr ? f.descAr : f.descEn}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 font-mono shrink-0">
                        {f.priceSar} {isAr ? 'ر.س' : 'SAR'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {isSubmitted && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  {isAr
                    ? 'تم إرسال المسار المفضل مع ملفك الطبي. سيقوم الطبيب السعودي المعالج (D06) بمراجعته واعتماده قبل إصدار رابط الدفع.'
                    : 'Consultation modality submitted with your medical file. Saudi treating doctor (D06) will confirm before the coordinator issues the payment link.'}
                </span>
              </div>
            )}

            <label 
              id="intake-privacy-card"
              data-testid="intake-privacy-card"
              className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all mt-3 ${privacyAgreed ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm ring-1 ring-emerald-500" : "bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 hover:border-emerald-400"}`}
            >
              <input
                type="checkbox"
                id="intake-privacy-checkbox"
                data-testid="intake-privacy-checkbox"
                checked={privacyAgreed}
                onChange={(e) => setPrivacyAgreed(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded-lg border-2 border-emerald-500 text-alo-teal focus:ring-alo-teal cursor-pointer shrink-0"
              />
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-black text-emerald-900 dark:text-emerald-200 text-xs uppercase tracking-wide">
                    {isAr ? '✓ إقرار الخصوصية وحماية البيانات الصحية (MOH Consent)' : '✓ MOH Health Data Privacy Consent:'}
                  </span>
                  <span className="bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {isAr ? 'مطلوب إلزامي' : 'Mandatory'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium m-0">
                  {isAr
                    ? 'أوافق على مشاركة ملفاتي الطبية مع منسقي التمريض في منصة ألو دكتور والاستشاري الدولي المعتمد لغرض إعداد الرأي الطبي الثاني، وفقاً لنظام حماية البيانات الصحية في المملكة العربية السعودية.'
                    : 'I consent to sharing diagnostic records with ALO DOCTOR triage nurses and the accredited international consultant for the second opinion evaluation in compliance with Saudi Health Information Privacy Law.'}
                </p>
              </div>
            </label>
          </div>
        );
      })()}
    </>
  );
};
