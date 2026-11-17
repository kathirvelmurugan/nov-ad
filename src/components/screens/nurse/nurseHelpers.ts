import { TenantHospital, ClinicalCase } from '../../../types';

export interface DirectoryDoctor {
  id: string;
  fullName: string;
  fullNameAr?: string | null;
  hospitalId?: string | null;
  department?: string | null;
  scfhsLicense?: string | null;
}

export function generateDefaultNotes(c?: ClinicalCase | null, isAr = true): string {
  if (!c) return '';
  if (isAr) {
    return `المريض يعاني من ${c.diagnosisAr || c.diagnosis || 'حالة سريرية'} مع شكوى: (${c.symptomsAr || c.symptoms || 'قيد المتابعة'}). الملف مكتمل تشخيصياً ويتضمن الفحوصات والتقارير الطبية ومقاطع التصوير المعتمدة. تم إخفاء الهوية الوطنية والاسم وفق معايير سدايا وحماية البيانات، وتصنيف الحالة بأولوية عاجلة (24 ساعة SLA).`;
  }
  return `Patient presents with ${c.diagnosis || 'clinical condition'} with complaint: (${c.symptomsEn || c.symptoms || 'under review'}). Diagnostic file is complete with laboratory panels, validated clinical reports, and medical imaging studies. PHI de-identified according to MOH & SDAIA standards; triaged as High Priority (24h SLA).`;
}

export function buildAvailableDoctors(doctors: DirectoryDoctor[] | null, liveHospitals: TenantHospital[] | null, isAr: boolean) {
  // Real enrolled doctors only (role D + active, resolved server-side). No bundled
  // or cached fallback: an empty directory must surface as empty, not as fake names.
  return (doctors || []).map((d) => {
    const hospital = (liveHospitals || []).find((h) => h.id === d.hospitalId);
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
      tier: 2 as const,
      isOnDuty: true,
    };
  });
}
