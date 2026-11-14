import React from 'react';
import { ShieldCheck, Timer } from 'lucide-react';

export interface DoctorHeaderBarProps {
  activeCase: any;
  doctorName: string;
  partnerHospital: string;
  slaFormatted: string;
  isAr: boolean;
}

const DoctorHeaderBar: React.FC<DoctorHeaderBarProps> = ({
  activeCase,
  doctorName,
  partnerHospital,
  slaFormatted,
  isAr,
}) => {
  const dir = isAr ? 'rtl' : 'ltr';
  const fontClass = isAr ? 'font-cairo' : 'font-sans';
  const patient = activeCase?.patient || {};
  const maskedId = patient.nationalId
    ? `${patient.nationalId.slice(0, 3)}****${patient.nationalId.slice(-2)}`
    : '---';

  return (
    <header
      dir={dir}
      className={`${fontClass} flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#00C6AE] bg-[#E6FAF7] p-4 shadow-sm`}
      style={{ fontFamily: isAr ? 'Cairo, sans-serif' : 'system-ui, sans-serif' }}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-bold text-[#007B6E]">{doctorName}</h1>
        <span className="text-sm text-[#007B6E]/80">{partnerHospital}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {patient.legalName && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#007B6E] shadow-sm">
            <ShieldCheck size={14} className="text-[#00C6AE]" />
            {patient.legalName}
          </span>
        )}

        <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-[#007B6E] shadow-sm">
          {isAr ? 'هوية' : 'ID'}: {maskedId}
        </span>

        {activeCase?.egressToken && (
          <span className="inline-flex items-center rounded-full bg-[#007B6E] px-3 py-1 text-xs font-medium text-white shadow-sm">
            {isAr ? 'رمز التصدير' : 'Egress'}: {activeCase.egressToken}
          </span>
        )}

        {(patient.specialty || patient.city) && (
          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs text-[#007B6E] shadow-sm">
            {[patient.specialty, patient.city].filter(Boolean).join(' • ')}
          </span>
        )}
      </div>

      <div
        data-testid="doctor-sla-timer"
        className="inline-flex items-center gap-2 rounded-lg bg-[#007B6E] px-4 py-2 text-sm font-bold text-white shadow-md"
      >
        <Timer size={16} className="text-[#00C6AE]" />
        <span>{slaFormatted}</span>
      </div>
    </header>
  );
};

export default DoctorHeaderBar;