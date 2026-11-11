import React, { useState } from 'react';
import { ClinicalCase } from '../types';
import { X, Sparkles, UserPlus, ShieldCheck, Stethoscope, Building2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddCase: (newCase: ClinicalCase) => void;
  existingCount: number;
  lang?: 'ar' | 'en';
}

export const NewCaseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddCase,
  existingCount,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';
  const dynamicId = `TEST-KSA-${String(existingCount + 1).padStart(2, '0')}`;

  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nationalId, setNationalId] = useState('1098765432');
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [city, setCity] = useState(isAr ? 'الرياض' : 'Riyadh');
  const [specialty, setSpecialty] = useState(isAr ? 'جراحة العمود الفقري والعظام' : 'Spine & Orthopedic Surgery');
  const [complaint, setComplaint] = useState('');
  const [hospital, setHospital] = useState(isAr ? 'مستشفى الدكتور سليمان الحبيب' : 'Dr. Sulaiman Al-Habib Hospital');
  const [doctorName, setDoctorName] = useState(isAr ? 'د. محمد الشمري' : 'Dr. Mohammed Al-Shammari');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pNameAr = nameAr.trim() || (isAr ? 'مريض تجريبي جديد' : 'Test Patient');
    const pNameEn = nameEn.trim() || 'Test Patient';
    const pComplaint = complaint.trim() || (isAr ? 'ألم مزمن في أسفل الظهر مع خدر ممتد للساقين يستدعي رأياً جراحياً ثانياً' : 'Chronic lumbar radiculopathy requiring surgical second opinion');

    const newCase: ClinicalCase = {
      id: dynamicId,
      caseNumber: `SA-2026-${dynamicId.replace('TEST-', '')}`,
      patientName: pNameAr,
      patientNameAr: pNameAr,
      patientNameEn: pNameEn,
      nationalIdMasked: '10********',
      age: Number(age) || 45,
      gender,
      city,
      cityAr: city,
      cityEn: city === 'الرياض' ? 'Riyadh' : city === 'جدة' ? 'Jeddah' : city,
      specialty,
      specialtyAr: specialty,
      specialtyEn: specialty,
      diagnosis: pComplaint,
      diagnosisAr: pComplaint,
      diagnosisEn: pComplaint,
      symptoms: pComplaint,
      symptomsAr: pComplaint,
      symptomsEn: pComplaint,
      consultationType: 'written', // Default, tester can choose in Tier checkout
      currentStage: 'INTAKE_RECEIVED',
      treatingDoctor: {
        name: doctorName,
        hospital,
        city,
        focusQuestions: ['', '', ''], // Blank slate!
        focusQuestionsEn: ['', '', ''],
      },
      consultant: undefined,
      pricing: {
        tier: 1,
        tierName: isAr ? 'الرأي الطبي المكتوب (Tier 1)' : 'Written Second Opinion Report (Tier 1)',
        baseSar: 65.22,
        vatPercent: 15,
        vatSar: 9.78,
        totalSar: 75,
        paid: false,
      },
      files: [],
      partnerOrders: undefined,
      metadata: {
        isTestPatient: true,
        createdAt: new Date().toISOString(),
      },
    };

    onAddCase(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-alo-darkCard border border-slate-200 dark:border-alo-darkBorder rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh]"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 dark:from-teal-950/40 dark:via-slate-900 dark:to-teal-950/40 border-b border-teal-200/60 dark:border-teal-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-alo-navy dark:text-white">
                  {isAr ? 'إضافة حالة مريض جديدة للاختبار' : 'Add New Patient Case (Live Test)'}
                </h3>
                <span className="font-mono text-xs font-black bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 px-2 py-0.5 rounded">
                  {dynamicId}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isAr
                  ? 'ملف اختبار جديد ببيانات فارغة للمراحل القادمة (Clean Slate)'
                  : 'Fresh unstarted test case with clean downstream stages'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Patient Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'اسم المريض (بالعربية):' : 'Patient Name (Arabic):'}
              </label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder={isAr ? 'مثال: عبدالمحسن الحربي' : 'e.g. Abdulmohsen Al-Harbi'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'اسم المريض (بالإنجليزية):' : 'Patient Name (English):'}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Abdulmohsen Al-Harbi"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 font-semibold"
              />
            </div>
          </div>

          {/* Age, Gender, City */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'العمر:' : 'Age:'}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'الجنس:' : 'Gender:'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              >
                <option value="M">{isAr ? 'ذكر' : 'Male'}</option>
                <option value="F">{isAr ? 'أنثى' : 'Female'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'المدينة:' : 'City:'}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isAr ? 'التخصص الطبي المطلوب:' : 'Clinical Specialty:'}
            </label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            >
              <option value="جراحة العمود الفقري والعظام">{isAr ? 'جراحة العمود الفقري والعظام' : 'Spine & Orthopedic Surgery'}</option>
              <option value="طب الأورام وسرطان الجهاز الهضمي">{isAr ? 'طب الأورام وسرطان الجهاز الهضمي' : 'GI Oncology & Tumors'}</option>
              <option value="جراحة القلب والصمامات">{isAr ? 'جراحة القلب والصمامات' : 'Cardiac Surgery & Valve Repair'}</option>
              <option value="أمراض وجراحة المخ والأعصاب">{isAr ? 'أمراض وجراحة المخ والأعصاب' : 'Neurosurgery & Stroke'}</option>
              <option value="جراحة السمنة والتمثيل الغذائي">{isAr ? 'جراحة السمنة والتمثيل الغذائي' : 'Bariatric & Metabolic Surgery'}</option>
            </select>
          </div>

          {/* Chief Complaint / Symptoms */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isAr ? 'الشكوى السريرية الأولية / التشخيص السابق:' : 'Chief Clinical Complaint / Symptoms:'}
            </label>
            <textarea
              rows={3}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder={
                isAr
                  ? 'اكتب الأعراض والشكوى السريرية التي يتقدم بها المريض لطلب الرأي الطبي الثاني...'
                  : 'Enter patient chief complaint and symptoms requiring second opinion...'
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              required
            />
          </div>

          {/* Partner Hospital & Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'المستشفى السعودي الشريك:' : 'Partner Hospital:'}
              </label>
              <input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'الطبيب المعالج:' : 'Treating Doctor:'}
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-alo-teal to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'إنشاء الحالة وبدء الاختبار (المرحلة 1) ←' : 'Create & Start Stage 1 →'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
