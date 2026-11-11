import React, { useMemo } from 'react';
import { Stethoscope } from 'lucide-react';
import { ClinicalCase, StaffAccountRecord, TenantHospital } from '../../types';
import { INITIAL_MEDICAL_CENTER_DOCTORS } from '../../data/medicalCenterDoctors';
import { SEEDED_STAFF_DIRECTORY, SEEDED_TENANT_HOSPITALS } from '../../data/platformSeed';

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
  // Dynamically retrieve enrolled treating doctors (roleCode === 'D')
  const availableDoctors = useMemo(() => {
    let allStaff: StaffAccountRecord[] = SEEDED_STAFF_DIRECTORY;
    let allHospitals: TenantHospital[] = SEEDED_TENANT_HOSPITALS;

    try {
      const storedUsers = localStorage.getItem('alo_platform_users_v2.4');
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed)) allStaff = parsed;
      }
      const storedHospitals = localStorage.getItem('alo_tenants_v2.4');
      if (storedHospitals) {
        const parsedH = JSON.parse(storedHospitals);
        if (Array.isArray(parsedH)) allHospitals = parsedH;
      }
    } catch {}

    const dynamicDoctors = allStaff
      .filter((s) => s.roleCode === 'D' && s.status === 'active')
      .map((s) => {
        const hospital = allHospitals.find((h) => h.id === s.hospitalId);
        return {
          id: s.id,
          name: isAr && s.fullNameAr ? s.fullNameAr : s.fullName,
          nameEn: s.fullName,
          specialty: s.department || 'استشاري أمراض القلب',
          specialtyEn: s.department || 'Cardiology Consultant',
          hospital: hospital ? (isAr ? hospital.nameAr : hospital.nameEn) : 'المجمع الطبي الشريك',
          hospitalEn: hospital ? hospital.nameEn : 'Partner Medical Center',
          city: hospital ? hospital.city : 'الرياض',
          license: s.scfhsLicense || 'SCFHS-CERTIFIED',
          tier: (2 as const),
          isOnDuty: true,
        };
      });

    return [...dynamicDoctors, ...INITIAL_MEDICAL_CENTER_DOCTORS];
  }, [isAr]);

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
          value={activeCase.doctorSelectionPreference === 'need_assistance' ? 'need_assistance' : activeCase.treatingDoctor.name}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'need_assistance') {
              onUpdateCase({
                doctorSelectionPreference: 'need_assistance',
                treatingDoctor: {
                  ...activeCase.treatingDoctor,
                  name: isAr ? 'بانتظار فرز التمريض (ألو تختار الأنسب)' : 'Awaiting Nurse Triage Selection',
                  hospital: isAr ? 'شبكة المستشفيات المعتمدة (ALO Accredited Network)' : 'ALO Accredited Network',
                  city: isAr ? 'الرياض / المملكة' : 'Riyadh / KSA',
                },
              });
              return;
            }

            const selectedDoc = availableDoctors.find((d) => d.name === val || d.nameEn === val);
            if (selectedDoc) {
              onUpdateCase({
                doctorSelectionPreference: 'specific_doctor',
                tier: selectedDoc.tier,
                treatingDoctor: {
                  ...activeCase.treatingDoctor,
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
            <option key={doc.id} value={doc.name}>
              {isAr
                ? `${doc.name} — ${doc.hospital} · ${doc.specialty} (${doc.license})`
                : `${doc.nameEn} — ${doc.hospitalEn} · ${doc.specialtyEn} (${doc.license})`}
            </option>
          ))}
        </select>

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
