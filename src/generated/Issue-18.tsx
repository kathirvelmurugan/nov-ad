import React, { useState, useCallback, useMemo } from 'react';

// --- Types & Interfaces ---
export type PersonaId = 
  | 'patient' | 'caregiver' | 'saudi_doctor' | 'int_doctor' 
  | 'case_manager' | 'insurance' | 'admin' | 'translator' 
  | 'pharmacist' | 'lab_tech' | 'billing';

export interface SaudiDoctor {
  id: string;
  nameEn: string;
  nameAr: string;
  specialtyEn: string;
  specialtyAr: string;
  hospitalEn: string;
  hospitalAr: string;
}

export interface CaregiverProxy {
  isCaregiver: boolean;
  name: string;
  relation: string;
  contact: string;
}

export interface IntakeFormData {
  selectedDoctorId: string | null;
  caregiver: CaregiverProxy;
  chiefComplaint: string;
}

interface PatientIntakeViewProps {
  activePersona: PersonaId;
  onDirectionChange?: (dir: 'rtl' | 'ltr') => void;
}

// --- Mock Data (Standardized to PDF v2.4) ---
const SAUDI_DOCTORS_DB: SaudiDoctor[] = [
  {
    id: 'dr-001',
    nameEn: 'Dr. Ahmed Al-Farsi',
    nameAr: 'د. أحمد الفارسي',
    specialtyEn: 'Internal Medicine',
    specialtyAr: 'الطب الباطني',
    hospitalEn: 'King Faisal Specialist Hospital',
    hospitalAr: 'مستشفى الملك فيصل التخصصي',
  },
  {
    id: 'dr-002',
    nameEn: 'Dr. Sarah Al-Otaibi',
    nameAr: 'د. سارة العتيبي',
    specialtyEn: 'Pediatrics',
    specialtyAr: 'طب الأطفال',
    hospitalEn: 'National Guard Hospital',
    hospitalAr: 'مستشفى الحرس الوطني',
  },
  {
    id: 'dr-003',
    nameEn: 'Dr. Khalid Al-Dosari',
    nameAr: 'د. خالد الدوسري',
    specialtyEn: 'Cardiology',
    specialtyAr: 'أمراض القلب',
    hospitalEn: 'King Fahad Medical City',
    hospitalAr: 'مدينة الملك فهد الطبية',
  },
];

const RELATION_OPTIONS_AR = ['مرافق', 'وكيل شرعي', 'أب', 'أم', 'ابن', 'ابنة', 'زوج', 'زوجة', 'أخ', 'أخت'];
const RELATION_OPTIONS_EN = ['Companion', 'Legal Guardian', 'Father', 'Mother', 'Son', 'Daughter', 'Husband', 'Wife', 'Brother', 'Sister'];

// --- Component ---
const PatientIntakeView: React.FC<PatientIntakeViewProps> = ({ activePersona }) => {
  // Zero artificial gates: Language/Direction derived purely from persona state
  const isRtl = useMemo(() => {
    const rtlPersonas: PersonaId[] = ['patient', 'caregiver', 'saudi_doctor', 'case_manager', 'admin'];
    return rtlPersonas.includes(activePersona);
  }, [activePersona]);

  const dir = isRtl ? 'rtl' : 'ltr';
  const lang = isRtl ? 'ar' : 'en';
  const fontClass = 'font-cairo';

  const [formData, setFormData] = useState<IntakeFormData>({
    selectedDoctorId: '',
    caregiver: {
      isCaregiver: false,
      name: '',
      relation: '',
      contact: '',
    },
    chiefComplaint: '',
  });

  const handleDoctorChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, selectedDoctorId: e.target.value }));
  }, []);

  const handleCaregiverToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      caregiver: { ...prev.caregiver, isCaregiver: e.target.checked }
    }));
  }, []);

  const handleCaregiverFieldChange = useCallback((field: keyof Omit<CaregiverProxy, 'isCaregiver'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      caregiver: { ...prev.caregiver, [field]: value }
    }));
  }, []);

  const selectedDoctor = SAUDI_DOCTORS_DB.find(d => d.id === formData.selectedDoctorId);

  // Standardized Clinical Headers (PDF v2.4)
  const t = {
    intakeHeader: isRtl ? 'نموذج استقبال المريض (P07–P17)' : 'Patient Intake Form (P07–P17)',
    saudiDoctorHeader: isRtl ? 'الطبيب السعودي المعالج داخل المملكة' : 'Saudi Treating Doctor (Inside Kingdom)',
    selectDoctor: isRtl ? 'اختر الطبيب المعالج' : 'Select Treating Doctor',
    specialty: isRtl ? 'التخصص' : 'Specialty',
    hospital: isRtl ? 'المستشفى' : 'Hospital',
    caregiverHeader: isRtl ? 'تقديم الطلب نيابة عن قريب (مرافق/وكيل شرعي)' : 'Submit request on behalf of a relative (Caregiver/Legal Proxy)',
    caregiverName: isRtl ? 'اسم المرافق / الوكيل الشرعي' : 'Caregiver / Legal Proxy Name',
    relation: isRtl ? 'صلة القرابة / الصفة' : 'Relation / Capacity',
    contact: isRtl ? 'رقم التواصل' : 'Contact Number',
    clinicalNotes: isRtl ? 'الشكوى الرئيسية / الملاحظات السريرية' : 'Chief Complaint / Clinical Notes',
    required: isRtl ? '(إلزامي)' : '(Mandatory)',
  };

  return (
    <div 
      dir={dir} 
      lang={lang} 
      className={`${fontClass} min-h-screen w-full flex justify-center items-start py-8 px-4 sm:px-6 lg:px-8`}
      style={{ backgroundColor: '#E6FAF7' }}
    >
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden border border-[#00C6AE]/20">
        
        {/* Header */}
        <div 
          className="px-6 py-5 border-b border-[#00C6AE]/20 flex items-center justify-between"
          style={{ backgroundColor: '#007B6E' }}
        >
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            {t.intakeHeader}
          </h1>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
            ALO DOCTOR v2.4
          </span>
        </div>

        <form className="p-6 md:p-8 space-y-8" onSubmit={(e) => e.preventDefault()}>
          
          {/* Section 1: Saudi Treating Doctor Selector (Mandatory) */}
          <section aria-labelledby="saudi-doctor-heading" className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-[#00C6AE]">
              <svg className="w-5 h-5 text-[#007B6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 id="saudi-doctor-heading" className="text-lg font-bold text-[#007B6E]">
                {t.saudiDoctorHeader} <span className="text-red-500 text-sm">*</span>
              </h2>
            </div>

            <div className="space-y-2">
              <label htmlFor="doctor-select" className="block text-sm font-semibold text-gray-700">
                {t.selectDoctor} {t.required}
              </label>
              <select
                id="doctor-select"
                value={formData.selectedDoctorId || ''}
                onChange={handleDoctorChange}
                required
                aria-required="true"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#00C6AE] focus:ring-4 focus:ring-[#00C6AE]/20 outline-none transition-all bg-white text-gray-900 font-medium"
              >
                <option value="" disabled>{isRtl ? '-- اختر الطبيب --' : '-- Select Doctor --'}</option>
                {SAUDI_DOCTORS_DB.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {isRtl ? doc.nameAr : doc.nameEn} - {isRtl ? doc.hospitalAr : doc.hospitalEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Inline Doctor Details Display */}
            {selectedDoctor && (
              <div 
                className="p-4 rounded-xl border border-[#00C6AE]/30 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in"
                style={{ backgroundColor: '#E6FAF7' }}
                role="status"
                aria-live="polite"
              >
                <div>
                  <span className="block text-xs font-bold text-[#007B6E]/70 uppercase tracking-wider mb-1">{t.specialty}</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {isRtl ? selectedDoctor.specialtyAr : selectedDoctor.specialtyEn}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#007B6E]/70 uppercase tracking-wider mb-1">{t.hospital}</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {isRtl ? selectedDoctor.hospitalAr : selectedDoctor.hospitalEn}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* Section 2: Caregiver Proxy Inline Fields */}
          <section aria-labelledby="caregiver-heading" className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-[#00C6AE]">
              <svg className="w-5 h-5 text-[#007B6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 id="caregiver-heading" className="text-lg font-bold text-[#007B6E]">
                {isRtl ? 'بيانات الوكيل / المرافق' : 'Caregiver / Proxy Information'}
              </h2>
            </div>

            {/* Checkbox Trigger */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer group">
              <div className="flex items-center h-6 mt-0.5">
                <input
                  id="caregiver-toggle"
                  type="checkbox"
                  checked={formData.caregiver.isCaregiver}
                  onChange={handleCaregiverToggle}
                  className="w-5 h-5 rounded border-gray-300 text-[#007B6E] focus:ring-[#00C6AE] cursor-pointer transition"
                  aria-controls="caregiver-fields"
                />
              </div>
              <label 
                htmlFor="caregiver-toggle" 
                className="text-sm md:text-base font-semibold text-gray-700 group-hover:text-[#007B6E] transition-colors cursor-pointer leading-relaxed"
              >
                {t.caregiverHeader}
              </label>
            </div>

            {/* Inline Caregiver Fields (Zero artificial gates, clean accessible state) */}
            {formData.caregiver.isCaregiver && (
              <div 
                id="caregiver-fields"
                className="mt-4 p-5 rounded-xl border-2 border-[#00C6AE]/40 bg-white space-y-5 shadow-sm animate-fade-in"
                role="group"
                aria-labelledby="caregiver-toggle"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Caregiver Name */}
                  <div className="space-y-2">
                    <label htmlFor="cg-name" className="block text-sm font-bold text-gray-700">
                      {t.caregiverName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="cg-name"
                      type="text"
                      required={formData.caregiver.isCaregiver}
                      value={formData.caregiver.name}
                      onChange={(e) => handleCaregiverFieldChange('name', e.target.value)}
                      placeholder={isRtl ? 'أدخل الاسم الرباعي' : 'Enter full name'}
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#00C6AE] focus:ring-4 focus:ring-[#00C6AE]/20 outline-none transition-all text-sm"
                    />
                  </div>

                  {/* Relation */}
                  <div className="space-y-2">
                    <label htmlFor="cg-relation" className="block text-sm font-bold text-gray-700">
                      {t.relation} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="cg-relation"
                      required={formData.caregiver.isCaregiver}
                      value={formData.caregiver.relation}
                      onChange={(e) => handleCaregiverFieldChange('relation', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#00C6AE] focus:ring-4 focus:ring-[#00C6AE]/20 outline-none transition-all text-sm bg-white"
                    >
                      <option value="" disabled>{isRtl ? '-- اختر الصلة --' : '-- Select Relation --'}</option>
                      {(isRtl ? RELATION_OPTIONS_AR : RELATION_OPTIONS_EN).map((rel, idx) => (
                        <option key={idx} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <label htmlFor="cg-contact" className="block text-sm font-bold text-gray-700">
                    {t.contact} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="cg-contact"
                      type="tel"
                      required={formData.caregiver.isCaregiver}
                      value={formData.caregiver.contact}
                      onChange={(e) => handleCaregiverFieldChange('contact', e.target.value)}
                      placeholder="05XXXXXXXX"
                      dir="ltr"
                      className={`w-full px-4 py-2.5 ${isRtl ? 'pr-16' : 'pl-16'} rounded-lg border-2 border-gray-200 focus:border-[#00C6AE] focus:ring-4 focus:ring-[#00C6AE]/20 outline-none transition-all text-sm text-left`}
                    />
                    <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} h-full px-4 flex items-center justify-center bg-gray-50 border-${isRtl ? 'l' : 'r'}-2 border-gray-200 rounded-${isRtl ? 'r' : 'l'}-lg`}>
                      <span className="text-sm font-bold text-gray-500">+966</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Section 3: Clinical Notes (Standardized Terms) */}
          <section aria-labelledby="clinical-heading" className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-[#00C6AE]">
              <svg className="w-5 h-5 text-[#007B6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 id="clinical-heading" className="text-lg font-bold text-[#007B6E]">
                {t.clinicalNotes}
              </h2>
            </div>
            <textarea
              rows={4}
              value={formData.chiefComplaint}
              onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
              placeholder={isRtl ? 'اكتب الشكوى الرئيسية أو الملاحظات السريرية هنا...' : 'Type the chief complaint or clinical notes here...'}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#00C6AE] focus:ring-4 focus:ring-[#00C6AE]/20 outline-none transition-all text-sm resize-y"
            />
          </section>

          {/* Action Footer */}
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-end border-t border-gray-100">
            <button
              type="button"
              className="px-6 py-3 rounded-lg font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              {isRtl ? 'حفظ كمسودة' : 'Save as Draft'}
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-lg font-bold text-sm text-white shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-[#00C6AE]/40 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#25D366' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {isRtl ? 'إرسال الطلب' : 'Submit Request'}
            </button>
          </div>

        </form>
      </div>

      {/* Scoped Styles for Animations and Cairo Font Enforcement */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        .font-cairo { font-family: 'Cairo', sans-serif; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.25s ease-out forwards; }
        
        /* Custom Checkbox Styling for Pinterest-Teal Palette */
        input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          background-color: #fff;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        input[type="checkbox"]:checked {
          background-color: #007B6E;
          border-color: #007B6E;
          background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
          background-size: 100% 100%;
          background-position: center;
          background-repeat: no-repeat;
        }
        input[type="checkbox"]:focus {
          box-shadow: 0 0 0 4px rgba(0, 198, 174, 0.2);
          border-color: #00C6AE;
        }
      `}} />
    </div>
  );
};

export default PatientIntakeView;