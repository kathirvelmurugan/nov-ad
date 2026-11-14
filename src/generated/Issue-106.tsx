import React, { useState, useRef, useCallback } from 'react';

// --- Design Tokens (Pinterest-Teal Palette) ---
const COLORS = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textMuted: '#5F6368',
  border: '#D1E3E1',
  danger: '#D93025',
  dangerBg: '#FCE8E6',
};

// --- Shared Styles & Types ---
interface PersonaContext {
  language: 'ar' | 'en';
  direction: 'rtl' | 'ltr';
  fontClass: string;
}

const usePersona = (): PersonaContext => {
  // In production, this would consume the 11-persona profile switcher context
  return {
    language: 'ar',
    direction: 'rtl',
    fontClass: 'font-cairo',
  };
};

const translations = {
  ar: {
    redFlags: 'الأعراض التحذيرية (الرايات الحمراء)',
    selectSymptoms: 'اختر الأعراض التي تعاني منها:',
    customSymptom: 'أضف عرض مخصص...',
    add: 'إضافة',
    severePain: 'ألم شديد',
    weightLoss: 'فقدان وزن غير مبرر',
    shortnessOfBreath: 'ضيق في التنفس',
    dizziness: 'دوخة / إغماء',
    highFever: 'حمى شديدة',
    medications: 'الأدوية الحالية',
    medPlaceholder: 'اكتب اسم الدواء واضغط Enter...',
    noMeds: 'لا توجد أدوية حالية',
    allergies: 'الحساسية',
    allergyPlaceholder: 'اكتب نوع الحساسية واضغط Enter...',
    nkda: 'لا توجد حساسية معروفة للأدوية (NKDA)',
    diagnostics: 'الملفات التشخيصية والمرفقات',
    uploadPrompt: 'اسحب وأفلت الملفات هنا أو انقر للاختيار',
    uploadHint: 'يدعم صور الأشعة، تقارير المختبر، أو ملخصات الفحوصات (PDF, JPG, PNG)',
    remove: 'إزالة',
  },
  en: {
    redFlags: 'Red Flag Symptoms',
    selectSymptoms: 'Select symptoms you are experiencing:',
    customSymptom: 'Add custom symptom...',
    add: 'Add',
    severePain: 'Severe Pain',
    weightLoss: 'Unexplained Weight Loss',
    shortnessOfBreath: 'Shortness of Breath',
    dizziness: 'Dizziness / Syncope',
    highFever: 'High Fever',
    medications: 'Current Medications',
    medPlaceholder: 'Type medication name and press Enter...',
    noMeds: 'No current medications',
    allergies: 'Allergies',
    allergyPlaceholder: 'Type allergy and press Enter...',
    nkda: 'No Known Drug Allergies (NKDA)',
    diagnostics: 'Diagnostic Scans & Attachments',
    uploadPrompt: 'Drag and drop files here or click to browse',
    uploadHint: 'Supports scan images, lab reports, or diagnostic summaries (PDF, JPG, PNG)',
    remove: 'Remove',
  }
};

// --- Subcomponents ---

const RemovablePill: React.FC<{
  label: string;
  onRemove: () => void;
  dir: 'rtl' | 'ltr';
  variant?: 'default' | 'danger';
}> = ({ label, onRemove, dir, variant = 'default' }) => {
  const isDanger = variant === 'danger';
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${isDanger ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-[#E6FAF7] text-[#007B6E] border border-[#00C6AE]'}`}
      style={{ fontFamily: 'Cairo, sans-serif' }}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className={`flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDanger ? 'focus:ring-red-500' : 'focus:ring-[#007B6E]'}`}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
};

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  dir: 'rtl' | 'ltr';
}> = ({ checked, onChange, label, dir }) => (
  <label className="inline-flex items-center gap-3 cursor-pointer select-none group" dir={dir}>
    <div className="relative">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:ring-2 peer-focus:ring-[#00C6AE]/50 transition-colors peer-checked:bg-[#007B6E]" />
      <div
        className={`absolute top-0.5 ${dir === 'rtl' ? 'right-0.5 peer-checked:-translate-x-5' : 'left-0.5 peer-checked:translate-x-5'} w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200`}
      />
    </div>
    <span className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#007B6E] transition-colors" style={{ fontFamily: 'Cairo, sans-serif' }}>
      {label}
    </span>
  </label>
);

// --- Main Components ---

export const IntakeSymptomsAndDiagnosisSection: React.FC = () => {
  const { language, direction, fontClass } = usePersona();
  const t = translations[language];

  // Red Flags State
  const predefinedFlags = [
    { id: 'severe_pain', label: t.severePain },
    { id: 'weight_loss', label: t.weightLoss },
    { id: 'sob', label: t.shortnessOfBreath },
    { id: 'dizziness', label: t.dizziness },
    { id: 'fever', label: t.highFever },
  ];
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [customFlags, setCustomFlags] = useState<string[]>([]);
  const [customFlagInput, setCustomFlagInput] = useState('');

  // Medications State
  const [medications, setMedications] = useState<string[]>([]);
  const [medInput, setMedInput] = useState('');
  const [noMeds, setNoMeds] = useState(false);

  // Allergies State
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [nkda, setNkda] = useState(false);

  const toggleFlag = (id: string) => {
    setSelectedFlags((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleAddCustomFlag = () => {
    const val = customFlagInput.trim();
    if (val && !customFlags.includes(val)) {
      setCustomFlags((prev) => [...prev, val]);
      setCustomFlagInput('');
    }
  };

  const handleAddMedication = () => {
    const val = medInput.trim();
    if (val && !medications.includes(val)) {
      setMedications((prev) => [...prev, val]);
      setMedInput('');
    }
  };

  const handleAddAllergy = () => {
    const val = allergyInput.trim();
    if (val && !allergies.includes(val)) {
      setAllergies((prev) => [...prev, val]);
      setAllergyInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <section className={`w-full space-y-8 ${fontClass}`} dir={direction}>
      
      {/* P06: Interactive Red Flags */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6FAF7]">
        <h3 className="text-lg font-bold text-[#007B6E] mb-2 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          {t.redFlags}
        </h3>
        <p className="text-sm text-[#5F6368] mb-4">{t.selectSymptoms}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {predefinedFlags.map((flag) => {
            const isSelected = selectedFlags.includes(flag.id);
            return (
              <button
                key={flag.id}
                type="button"
                onClick={() => toggleFlag(flag.id)}
                aria-pressed={isSelected}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00C6AE] ${
                  isSelected
                    ? 'bg-[#007B6E] text-white border-[#007B6E] shadow-md'
                    : 'bg-white text-[#007B6E] border-[#00C6AE] hover:bg-[#E6FAF7]'
                }`}
              >
                {flag.label}
              </button>
            );
          })}
          {customFlags.map((flag, idx) => (
            <RemovablePill
              key={`custom-${idx}`}
              label={flag}
              variant="danger"
              dir={direction}
              onRemove={() => setCustomFlags((prev) => prev.filter((_, i) => i !== idx))}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={customFlagInput}
            onChange={(e) => setCustomFlagInput(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleAddCustomFlag)}
            placeholder={t.customSymptom}
            className="flex-1 px-4 py-2 text-sm border border-[#D1E3E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C6AE] focus:border-transparent bg-[#E6FAF7]/30 placeholder:text-[#5F6368]/60"
          />
          <button
            type="button"
            onClick={handleAddCustomFlag}
            disabled={!customFlagInput.trim()}
            className="px-4 py-2 bg-[#00C6AE] text-white text-sm font-bold rounded-xl hover:bg-[#007B6E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#007B6E]"
          >
            {t.add}
          </button>
        </div>
      </div>

      {/* P09: Interactive Medications */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6FAF7]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-[#007B6E] flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/></svg>
            {t.medications}
          </h3>
          <ToggleSwitch checked={noMeds} onChange={setNoMeds} label={t.noMeds} dir={direction} />
        </div>

        {!noMeds && (
          <>
            <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
              {medications.map((med, idx) => (
                <RemovablePill
                  key={`med-${idx}`}
                  label={med}
                  dir={direction}
                  onRemove={() => setMedications((prev) => prev.filter((_, i) => i !== idx))}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={medInput}
                onChange={(e) => setMedInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleAddMedication)}
                placeholder={t.medPlaceholder}
                className="flex-1 px-4 py-2 text-sm border border-[#D1E3E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C6AE] focus:border-transparent bg-[#E6FAF7]/30 placeholder:text-[#5F6368]/60"
              />
              <button
                type="button"
                onClick={handleAddMedication}
                disabled={!medInput.trim()}
                className="px-4 py-2 bg-[#00C6AE] text-white text-sm font-bold rounded-xl hover:bg-[#007B6E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#007B6E]"
              >
                + {t.add}
              </button>
            </div>
          </>
        )}
      </div>

      {/* P10: Interactive Allergies */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6FAF7]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-[#007B6E] flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            {t.allergies}
          </h3>
          <ToggleSwitch checked={nkda} onChange={setNkda} label={t.nkda} dir={direction} />
        </div>

        {!nkda && (
          <>
            <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
              {allergies.map((allergy, idx) => (
                <RemovablePill
                  key={`allergy-${idx}`}
                  label={allergy}
                  variant="danger"
                  dir={direction}
                  onRemove={() => setAllergies((prev) => prev.filter((_, i) => i !== idx))}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleAddAllergy)}
                placeholder={t.allergyPlaceholder}
                className="flex-1 px-4 py-2 text-sm border border-[#D1E3E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C6AE] focus:border-transparent bg-[#E6FAF7]/30 placeholder:text-[#5F6368]/60"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                disabled={!allergyInput.trim()}
                className="px-4 py-2 bg-[#00C6AE] text-white text-sm font-bold rounded-xl hover:bg-[#007B6E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#007B6E]"
              >
                + {t.add}
              </button>
            </div>
          </>
        )}
      </div>

    </section>
  );
};


export const IntakeUploadZone: React.FC = () => {
  const { language, direction, fontClass } = usePersona();
  const t = translations[language];
  
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
      // Reset input value to allow re-uploading the same file if removed
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <section className={`w-full ${fontClass}`} dir={direction}>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6FAF7]">
        <h3 className="text-lg font-bold text-[#007B6E] mb-4 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          {t.diagnostics}
        </h3>

        <div
          role="button"
          tabIndex={0}
          aria-label={t.uploadPrompt}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00C6AE] focus:ring-offset-2 ${
            isDragging
              ? 'border-[#007B6E] bg-[#E6FAF7] scale-[1.02]'
              : 'border-[#00C6AE] bg-[#E6FAF7]/20 hover:bg-[#E6FAF7]/50 hover:border-[#007B6E]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
          />
          
          <div className={`p-4 rounded-full mb-3 transition-colors ${isDragging ? 'bg-[#007B6E]/20' : 'bg-[#00C6AE]/20'}`}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isDragging ? COLORS.primary : COLORS.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          
          <p className="text-sm font-semibold text-[#007B6E] text-center px-4">
            {t.uploadPrompt}
          </p>
          <p className="text-xs text-[#5F6368] mt-2 text-center px-4">
            {t.uploadHint}
          </p>
        </div>

        {/* File Previews */}
        {files.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 p-3 bg-[#E6FAF7] rounded-xl border border-[#00C6AE]/30 group transition-all hover:shadow-sm"
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-[#00C6AE]/20 text-[#007B6E]">
                  {file.type.startsWith('image/') ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-[#5F6368]">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  aria-label={`${t.remove} ${file.name}`}
                  className="flex-shrink-0 p-1.5 text-[#5F6368] hover:text-[#D93025] hover:bg-[#FCE8E6] rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#D93025]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};