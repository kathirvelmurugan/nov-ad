import React, { useState } from 'react';
import { Database, Plus, Trash2, Stethoscope, TestTube2, Pill } from 'lucide-react';
import { AdminCatalogsState } from '../../../types';

interface SuperAdminCatalogsTabProps {
  isRTL: boolean;
  catalogs: AdminCatalogsState;
  onAddSpecialty: (specialty: string) => void;
  onRemoveSpecialty: (specialty: string) => void;
  onAddLabTest: (test: string) => void;
  onRemoveLabTest: (test: string) => void;
  onAddMedication: (med: string) => void;
  onRemoveMedication: (med: string) => void;
}

export const SuperAdminCatalogsTab: React.FC<SuperAdminCatalogsTabProps> = ({
  isRTL,
  catalogs,
  onAddSpecialty,
  onRemoveSpecialty,
  onAddLabTest,
  onRemoveLabTest,
  onAddMedication,
  onRemoveMedication,
}) => {
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newLab, setNewLab] = useState('');
  const [newMed, setNewMed] = useState('');

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
              <Database className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {isRTL ? 'كتالوجات المنصة الطبية' : 'Platform Medical Catalogs'}
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {isRTL
              ? 'إدارة التخصصات الطبية، الفحوصات المخبرية، وقائمة الأدوية المعتمدة (Formulary) مع حفظ مستمر عبر المنصة.'
              : 'Persisted specialties, laboratory test panels, and Saudi formulary medications.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Specialties Column */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-base">
                {isRTL ? 'التخصصات الطبية' : 'Clinical Specialties'}
              </h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold ml-auto">
                {catalogs.specialties.length}
              </span>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder={isRTL ? 'تخصص جديد...' : 'New specialty...'}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={() => {
                  if (newSpecialty.trim()) {
                    onAddSpecialty(newSpecialty.trim());
                    setNewSpecialty('');
                  }
                }}
                className="p-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {catalogs.specialties.map((spec) => (
                <div
                  key={spec}
                  className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100 group hover:border-slate-300 transition-colors"
                >
                  <span className="font-medium text-slate-800">{spec}</span>
                  <button
                    onClick={() => onRemoveSpecialty(spec)}
                    className="text-slate-400 hover:text-rose-600 opacity-60 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lab Tests Column */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <TestTube2 className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-slate-900 text-base">
                {isRTL ? 'الفحوصات المخبرية' : 'Lab Test Panels'}
              </h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold ml-auto">
                {catalogs.labTests.length}
              </span>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newLab}
                onChange={(e) => setNewLab(e.target.value)}
                placeholder={isRTL ? 'فحص مخبري جديد...' : 'New lab test panel...'}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={() => {
                  if (newLab.trim()) {
                    onAddLabTest(newLab.trim());
                    setNewLab('');
                  }
                }}
                className="p-1.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {catalogs.labTests.map((lab) => (
                <div
                  key={lab}
                  className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100 group hover:border-slate-300 transition-colors"
                >
                  <span className="font-medium text-slate-800">{lab}</span>
                  <button
                    onClick={() => onRemoveLabTest(lab)}
                    className="text-slate-400 hover:text-rose-600 opacity-60 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Medications Column */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Pill className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">
                {isRTL ? 'دليل الأدوية المعتمدة' : 'Formulary Medications'}
              </h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold ml-auto">
                {catalogs.medications.length}
              </span>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newMed}
                onChange={(e) => setNewMed(e.target.value)}
                placeholder={isRTL ? 'دواء أو تركيبة جديدة...' : 'New medication...'}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => {
                  if (newMed.trim()) {
                    onAddMedication(newMed.trim());
                    setNewMed('');
                  }
                }}
                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {catalogs.medications.map((med) => (
                <div
                  key={med}
                  className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100 group hover:border-slate-300 transition-colors"
                >
                  <span className="font-medium text-slate-800">{med}</span>
                  <button
                    onClick={() => onRemoveMedication(med)}
                    className="text-slate-400 hover:text-rose-600 opacity-60 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminCatalogsTab;
