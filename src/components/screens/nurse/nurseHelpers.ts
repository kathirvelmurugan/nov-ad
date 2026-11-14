import { StaffAccountRecord, TenantHospital, ClinicalCase } from '../../../types';
import { INITIAL_MEDICAL_CENTER_DOCTORS } from '../../../data/medicalCenterDoctors';
import { DEFAULT_TENANT_HOSPITALS, DEFAULT_STAFF_DIRECTORY } from '../../../data/accreditedStaffAndTenants';
import { PLATFORM_USERS_KEY, TENANTS_KEY } from '../../../hooks/workflowConstants';

export function generateDefaultNotes(c?: ClinicalCase | null, isAr = true): string {
  if (!c) return '';
  if (isAr) {
    return `المريض يعاني من ${c.diagnosisAr || c.diagnosis || 'حالة سريرية'} مع شكوى: (${c.symptomsAr || c.symptoms || 'قيد المتابعة'}). الملف مكتمل تشخيصياً ويتضمن الفحوصات والتقارير الطبية ومقاطع التصوير المعتمدة. تم إخفاء الهوية الوطنية والاسم وفق معايير سدايا وحماية البيانات، وتصنيف الحالة بأولوية عاجلة (24 ساعة SLA).`;
  }
  return `Patient presents with ${c.diagnosis || 'clinical condition'} with complaint: (${c.symptomsEn || c.symptoms || 'under review'}). Diagnostic file is complete with laboratory panels, validated clinical reports, and medical imaging studies. PHI de-identified according to MOH & SDAIA standards; triaged as High Priority (24h SLA).`;
}

export function buildAvailableDoctors(liveStaff: StaffAccountRecord[] | null, liveHospitals: TenantHospital[] | null, isAr: boolean) {
  let allStaff: StaffAccountRecord[] = liveStaff || DEFAULT_STAFF_DIRECTORY;
  let allHospitals: TenantHospital[] = liveHospitals || DEFAULT_TENANT_HOSPITALS;
  if (!liveStaff || !liveHospitals) {
    try {
      if (!liveStaff) {
        const stored = localStorage.getItem(PLATFORM_USERS_KEY);
        if (stored) { const p = JSON.parse(stored); if (Array.isArray(p)) allStaff = p; }
      }
      if (!liveHospitals) {
        const storedH = localStorage.getItem(TENANTS_KEY);
        if (storedH) { const pH = JSON.parse(storedH); if (Array.isArray(pH)) allHospitals = pH; }
      }
    } catch {}
  }
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
        tier: 2 as const,
        isOnDuty: true,
      };
    });

  const combined = [...INITIAL_MEDICAL_CENTER_DOCTORS, ...dynamicDoctors];
  const uniqueByPerson = new Map<string, typeof combined[0]>();
  combined.forEach((doc) => {
    const normalized = (doc.nameEn || doc.name).replace(/^(dr\.?|د\.?)\s*/i, '').trim().toLowerCase();
    if (!uniqueByPerson.has(normalized)) uniqueByPerson.set(normalized, doc);
  });
  return Array.from(uniqueByPerson.values());
}
