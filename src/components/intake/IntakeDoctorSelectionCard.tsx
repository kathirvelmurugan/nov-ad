import React, { useEffect, useMemo, useState } from 'react';
import { Stethoscope } from 'lucide-react';
import { ClinicalCase, TenantHospital } from '../../types';
import { apiClient } from '../../services/apiClient';

interface DirectoryDoctor {
  id: string;
  fullName: string;
  fullNameAr?: string | null;
  hospitalId?: string | null;
  department?: string | null;
  scfhsLicense?: string | null;
}

interface Props {
  activeCase: ClinicalCase;
  isAr: boolean;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
}

export const IntakeDoctorSelectionCard: React.FC<Props> = ({
  activeCase,
  isAr,
  onUpdateCase,
}) => {
  // The directory is the real staff table (role D, active only). Bundled arrays and
  // a localStorage copy were removed: they silently hid that no doctor was enrolled.
  const [doctors, setDoctors] = useState<DirectoryDoctor[]>([]);
  const [tenants, setTenants] = useState<TenantHospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [doctorList, tenantList] = await Promise.all([
          apiClient.fetchDoctors(),
          apiClient.fetchTenants().catch(() => [] as TenantHospital[]),
        ]);
        if (cancelled) return;
        setDoctors(doctorList);
        setTenants(tenantList);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const availableDoctors = useMemo(() => {
    return doctors.map((d) => {
      const hospital = tenants.find((h) => h.id === d.hospitalId);
      return {
        id: d.id,
        name: isAr && d.fullNameAr ? d.fullNameAr : d.fullName,
        nameEn: d.fullName,
        specialty: d.department || (isAr ? 'استشاري' : 'Consultant'),
        specialtyEn: d.department || 'Consultant',
        hospital: hospital ? (isAr ? hospital.nameAr : hospital.nameEn) : (d.hospitalId || '—'),
        hospitalEn: hospital ? hospital.nameEn : (d.hospitalId || '—'),
        city: hospital ? (isAr ? (hospital.cityAr || hospital.city) : hospital.city) : '',
        license: d.scfhsLicense || '—',
      };
    });
  }, [doctors, tenants, isAr]);

  const currentDoctor = availableDoctors.find(
    (d) => d.name === activeCase.treatingDoctor?.name || d.nameEn === activeCase.treatingDoctor?.name
  );
  const selectValue =
    activeCase.doctorSelectionPreference === 'specific_doctor' && currentDoctor
      ? currentDoctor.id
      : 'need_assistance';

  return (
    <div className="card-clinical p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="bg-alo-mint text-alo-teal px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-teal-200">
            P04-B · {isAr ? 'الطبيب المعالج' : 'Saudi treating doctor'}
          </span>
          <Stethoscope className="w-4 h-4 text-alo-teal" />
          <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
            {isAr ? 'اختيار الطبيب السعودي المعالج المشرف على الحالة بالمملكة' : 'Select the Saudi treating doctor within KSA'}
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          {isAr ? 'مستشفى مرجعي شريك' : 'Accredited Partner Hospital'}
        </span>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {isAr ? 'تحديد خيار الطبيب المعالج المشرف بالمملكة:' : 'Select Saudi Treating Doctor Assignment:'}
        </label>
        <select
          value={selectValue}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'need_assistance') {
              onUpdateCase({
                doctorSelectionPreference: 'need_assistance',
                treatingDoctor: {
                  ...activeCase.treatingDoctor,
                  // Delegating to nurse triage clears the assignment: a leftover
                  // id would keep the case bound to the previously chosen doctor.
                  id: undefined,
                  name: isAr ? 'بانتظار فرز التمريض (ألو تختار الأنسب)' : 'Awaiting Nurse Triage Selection',
                  hospital: isAr ? 'شبكة المستشفيات المعتمدة (ALO Accredited Network)' : 'ALO Accredited Network',
                  city: isAr ? 'الرياض / المملكة' : 'Riyadh / KSA',
                },
              });
              return;
            }

            const selectedDoc = availableDoctors.find((d) => d.id === val);
            if (selectedDoc) {
              onUpdateCase({
                doctorSelectionPreference: 'specific_doctor',
                tier: 2,
                treatingDoctor: {
                  ...activeCase.treatingDoctor,
                  id: selectedDoc.id,
                  name: selectedDoc.name,
                  hospital: selectedDoc.hospital,
                  city: selectedDoc.city,
                },
              });
            }
          }}
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-alo-teal outline-none font-bold shadow-sm cursor-pointer"
        >
          <option value="need_assistance">
            ✨ {isAr ? 'أحتاج مساعدة ألو في الاختيار (موصى به - مطابقة التمريض السريري)' : 'Need ALO Assistance to Choose (Recommended - Clinical Nurse Match)'}
          </option>
          {availableDoctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {isAr
                ? `${doc.name} — ${doc.hospital} · ${doc.specialty} (${doc.license})`
                : `${doc.nameEn} — ${doc.hospitalEn} · ${doc.specialtyEn} (${doc.license})`}
            </option>
          ))}
        </select>

        {loading && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {isAr ? 'جارٍ تحميل الأطباء المسجلين...' : 'Loading enrolled doctors…'}
          </p>
        )}
        {!loading && loadError && (
          <p className="text-[11px] font-bold text-rose-600">
            {isAr
              ? 'تعذر تحميل دليل الأطباء. يمكنك المتابعة باختيار مساعدة ألو.'
              : 'Could not load the doctor directory. You can continue with ALO assistance.'}
          </p>
        )}
        {!loading && !loadError && availableDoctors.length === 0 && (
          <p className="text-[11px] font-bold text-amber-600">
            {isAr
              ? 'لا يوجد أطباء مسجلون بعد — ستقوم ممرضة ألو بالتعيين.'
              : 'No doctors enrolled yet — the ALO triage nurse will assign one.'}
          </p>
        )}

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
          {isAr
            ? '💡 الخيار الافتراضي يتيح لممرضة ألو فرز تقاريرك وتعيين الطبيب الاستشاري الأنسب في مدينتك، مع إمكانية تحديد طبيب معين إذا رغبت.'
            : '💡 Default option enables ALO Nurse triage to match the best-suited Saudi consultant based on your clinical records and location.'}
        </p>
      </div>
    </div>
  );
};

export default IntakeDoctorSelectionCard;
