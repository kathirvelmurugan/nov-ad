import React, { useState } from 'react';
import { INITIAL_MEDICAL_CENTER_DOCTORS } from '../../data/medicalCenterDoctors';
import { Plus, Trash2, CheckCircle2, UserPlus, FileSpreadsheet, Stethoscope, Pill } from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'staff' | 'specialties' | 'lab' | 'formulary'>('staff');

  // Dynamic Staff state seeded from Medical Center Doctors Catalog
  const [staffList, setStaffList] = useState([
    ...INITIAL_MEDICAL_CENTER_DOCTORS.map((d) => ({
      id: d.id,
      name: d.name,
      role: 'Saudi treating doctor',
      specialty: d.specialty,
      license: d.license,
      hospital: d.hospital,
    })),
    { id: 'cons-01', name: 'Dr. Arjun Mehta', role: 'Indian consultant', specialty: 'Cardiac Surgery', license: 'MCI-99421', hospital: 'KIMS Hyderabad' },
    { id: 'nurse-01', name: 'سارة الدوسري', role: 'ALO nurse', specialty: 'Triage & Interpretation', license: 'SCFHS-2021-4412', hospital: 'ALO Central Hub' },
  ]);

  // Dynamic Specialties state
  const [specialties, setSpecialties] = useState([
    { id: '1', nameAr: 'أمراض وجراحة القلب', nameEn: 'Cardiology & Cardiac Surgery', doctorsCount: 8 },
    { id: '2', nameAr: 'المخ والأعصاب والعمود الفقري', nameEn: 'Neurology & Spine', doctorsCount: 6 },
    { id: '3', nameAr: 'علاج الأورام وأمراض الدم', nameEn: 'Oncology & Hematology', doctorsCount: 11 },
    { id: '4', nameAr: 'جراحة العظام والمفاصل', nameEn: 'Orthopedics & Joint Replacement', doctorsCount: 9 },
  ]);

  // Dynamic Lab Catalog state
  const [labTests, setLabTests] = useState([
    { id: '1', name: 'تحليل وظائف كلى وشوارد (U&E)', category: 'Blood Chemistry', hours: 4, priceSar: 180 },
    { id: '2', name: 'زمن التخثر والتخثر المشترك (PT / INR)', category: 'Hematology', hours: 2, priceSar: 120 },
    { id: '3', name: 'الرنين المغناطيسي للقلب (Cardiac MRI)', category: 'Radiology / Imaging', hours: 24, priceSar: 2400 },
  ]);

  // Dynamic Formulary state
  const [formulary, setFormulary] = useState([
    { id: '1', generic: 'Bisoprolol Fumarate', brand: 'Concor', dosage: '5mg oral', subAllowed: true },
    { id: '2', generic: 'Atorvastatin Calcium', brand: 'Lipitor', dosage: '40mg oral', subAllowed: true },
    { id: '3', generic: 'Aspirin Enteric Coated', brand: 'Aspocid', dosage: '81mg oral', subAllowed: false },
  ]);

  // Form input states for adding items dynamically
  const [newStaff, setNewStaff] = useState({ name: '', role: 'Saudi treating doctor', specialty: '', license: '', hospital: '' });
  const [newSpecialty, setNewSpecialty] = useState({ nameAr: '', nameEn: '' });
  const [newLabTest, setNewLabTest] = useState({ name: '', category: 'Blood Chemistry', hours: 4, priceSar: 200 });
  const [newDrug, setNewDrug] = useState({ generic: '', brand: '', dosage: '', subAllowed: true });

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.specialty) return;
    setStaffList([...staffList, { ...newStaff, id: Date.now().toString() }]);
    setNewStaff({ name: '', role: 'Saudi treating doctor', specialty: '', license: '', hospital: '' });
    alert('تمت إضافة الطبيب / العضو إلى قاعدة البيانات بنجاح!');
  };

  const handleAddSpecialty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecialty.nameAr) return;
    setSpecialties([...specialties, { ...newSpecialty, id: Date.now().toString(), doctorsCount: 1 }]);
    setNewSpecialty({ nameAr: '', nameEn: '' });
    alert('تمت إضافة التخصص الطبي إلى خيارات المرضى فوراً!');
  };

  const handleAddLabTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabTest.name) return;
    setLabTests([...labTests, { ...newLabTest, id: Date.now().toString() }]);
    setNewLabTest({ name: '', category: 'Blood Chemistry', hours: 4, priceSar: 200 });
    alert('تمت إضافة الفحص المخبري إلى كتالوج الشركاء!');
  };

  const handleAddDrug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrug.generic) return;
    setFormulary([...formulary, { ...newDrug, id: Date.now().toString() }]);
    setNewDrug({ generic: '', brand: '', dosage: '', subAllowed: true });
    alert('تمت إضافة الدواء إلى دليل الأدوية والصيدلية!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2.5 py-1 rounded-full">
            ⚙️ لوحة الإعدادات الديناميكية (AD01–AD03 / HA01)
          </span>
          <h2 className="text-xl font-bold text-white mt-2">
            إدارة الكتالوجات والكوادر الطبية بدون تعديل الكود
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إضافة أطباء جدد، تخصصات طبية، فحوصات مخبرية، وأدوية مع حفظ فوري في قاعدة البيانات
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'staff', label: 'الأطباء والكوادر', icon: <UserPlus className="w-3.5 h-3.5" /> },
            { id: 'specialties', label: 'التخصصات', icon: <Stethoscope className="w-3.5 h-3.5" /> },
            { id: 'lab', label: 'المختبر', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
            { id: 'formulary', label: 'الأدوية', icon: <Pill className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Staff & Doctors */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Add Staff Form */}
          <form onSubmit={handleAddStaff} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-400" />
              <span>إضافة طبيب أو عضو جديد فوراً</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: د. محمد السعدي"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الدور الوظيفي:</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Saudi treating doctor">طبيب سعودي معالج (Saudi treating doctor)</option>
                  <option value="Indian consultant">استشاري هندي (Indian consultant)</option>
                  <option value="ALO nurse">ممرضة ألو (ALO nurse)</option>
                  <option value="Pharmacist">صيدلي (Pharmacist)</option>
                  <option value="Lab Tech">أخصائي مختبر (Lab Tech)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">التخصص الدقيق:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Interventional Cardiology"
                  value={newStaff.specialty}
                  onChange={(e) => setNewStaff({ ...newStaff, specialty: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ترخيص هيئة التخصصات (SCFHS):</label>
                <input
                  type="text"
                  placeholder="SCFHS-2024-XXXX"
                  value={newStaff.license}
                  onChange={(e) => setNewStaff({ ...newStaff, license: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">المستشفى / المركز المعتمد:</label>
                <input
                  type="text"
                  placeholder="مستشفى د. سليمان الحبيب"
                  value={newStaff.hospital}
                  onChange={(e) => setNewStaff({ ...newStaff, hospital: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>حفظ وإتاحة فورية</span>
                </button>
              </div>
            </div>
          </form>

          {/* Current Staff Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-x-auto">
            <h3 className="text-sm font-bold text-slate-200 mb-3">قائمة الأطباء والكوادر المعتمدة:</h3>
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2.5">الاسم</th>
                  <th className="p-2.5">الدور</th>
                  <th className="p-2.5">التخصص</th>
                  <th className="p-2.5">الترخيص</th>
                  <th className="p-2.5">المركز الطبي</th>
                  <th className="p-2.5 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold text-white">{s.name}</td>
                    <td className="p-2.5 text-teal-400">{s.role}</td>
                    <td className="p-2.5 text-slate-300">{s.specialty}</td>
                    <td className="p-2.5 font-mono text-slate-400">{s.license}</td>
                    <td className="p-2.5 text-slate-300">{s.hospital}</td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => setStaffList(staffList.filter((x) => x.id !== s.id))}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Medical Specialties */}
      {activeTab === 'specialties' && (
        <div className="space-y-6">
          <form onSubmit={handleAddSpecialty} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-end gap-3 text-xs">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-slate-400 mb-1">اسم التخصص (عربي):</label>
              <input
                type="text"
                required
                placeholder="مثال: جراحة الصدر والرئة"
                value={newSpecialty.nameAr}
                onChange={(e) => setNewSpecialty({ ...newSpecialty, nameAr: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-slate-400 mb-1">اسم التخصص (English):</label>
              <input
                type="text"
                placeholder="Thoracic & Lung Surgery"
                value={newSpecialty.nameEn}
                onChange={(e) => setNewSpecialty({ ...newSpecialty, nameEn: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:ring-1 focus:ring-teal-500 font-sans"
              />
            </div>
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة التخصص</span>
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {specialties.map((sp) => (
              <div key={sp.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm">{sp.nameAr}</h4>
                  <p className="text-slate-400 font-sans">{sp.nameEn}</p>
                </div>
                <button
                  onClick={() => setSpecialties(specialties.filter((x) => x.id !== sp.id))}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Lab Tests */}
      {activeTab === 'lab' && (
        <div className="space-y-6">
          <form onSubmit={handleAddLabTest} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">اسم الفحص الطبي:</label>
              <input
                type="text"
                required
                placeholder="مثال: Troponin I High Sensitivity"
                value={newLabTest.name}
                onChange={(e) => setNewLabTest({ ...newLabTest, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">التصنيف المخبري:</label>
              <input
                type="text"
                value={newLabTest.category}
                onChange={(e) => setNewLabTest({ ...newLabTest, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">السعر (ر.س):</label>
              <input
                type="number"
                value={newLabTest.priceSar}
                onChange={(e) => setNewLabTest({ ...newLabTest, priceSar: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:ring-1 focus:ring-teal-500 font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة الفحص للكتالوج</span>
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {labTests.map((t) => (
              <div key={t.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-[10px] text-slate-400">{t.category} · {t.hours}h TAT</p>
                  <p className="text-teal-400 font-mono font-bold mt-1">{t.priceSar} SAR</p>
                </div>
                <button
                  onClick={() => setLabTests(labTests.filter((x) => x.id !== t.id))}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Medication Formulary */}
      {activeTab === 'formulary' && (
        <div className="space-y-6">
          <form onSubmit={handleAddDrug} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">الاسم العلمي (Generic):</label>
              <input
                type="text"
                required
                placeholder="Amlodipine Besylate"
                value={newDrug.generic}
                onChange={(e) => setNewDrug({ ...newDrug, generic: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:ring-1 focus:ring-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">الاسم التجاري (Brand):</label>
              <input
                type="text"
                placeholder="Norvasc 5mg"
                value={newDrug.brand}
                onChange={(e) => setNewDrug({ ...newDrug, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">الجرعة والشكل الصيدلاني:</label>
              <input
                type="text"
                placeholder="5mg oral tablet"
                value={newDrug.dosage}
                onChange={(e) => setNewDrug({ ...newDrug, dosage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة للدليل الدوائي</span>
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {formulary.map((d) => (
              <div key={d.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white font-mono">{d.generic}</h4>
                  <p className="text-[11px] text-slate-300">{d.brand} ({d.dosage})</p>
                  <p className="text-[10px] text-amber-400 mt-1">
                    {d.subAllowed ? 'استبدال جنيس مسموح (X20)' : 'لا يُسمح بالاستبدال'}
                  </p>
                </div>
                <button
                  onClick={() => setFormulary(formulary.filter((x) => x.id !== d.id))}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
