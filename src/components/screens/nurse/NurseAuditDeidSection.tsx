import React from 'react';
import { FileCheck, UserX } from 'lucide-react';

export interface NurseAuditDeidSectionProps {
  activeCase: any;
  nurseName: string;
  isAr: boolean;
}

const NurseAuditDeidSection: React.FC<NurseAuditDeidSectionProps> = ({ activeCase, nurseName, isAr }) => {
  const dir = isAr ? 'rtl' : 'ltr';
  const fontClass = 'font-[Cairo]';

  const files = activeCase?.files || [
    { name: 'lab_results.pdf', size: '2.4 MB', valid: true },
    { name: 'imaging_scan.dcm', size: '14.1 MB', valid: true }
  ];

  const patient = activeCase?.patient || {};
  const maskedName = patient.name ? `${patient.name.charAt(0)}***` : '***';
  const maskedNid = patient.nationalId ? `****${patient.nationalId.slice(-4)}` : '*********';
  const maskedPhone = patient.phone ? `****${patient.phone.slice(-4)}` : '*********';

  return (
    <section dir={dir} className={`${fontClass} space-y-6 p-6 bg-[#E6FAF7] rounded-2xl border border-[#00C6AE]/30`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[#007B6E]">
          <FileCheck size={22} />
          <h3 className="text-lg font-bold">{isAr ? 'N02 تدقيق الملفات' : 'N02 File Audit'}</h3>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-[#00C6AE]/20 overflow-hidden">
          <table className="w-full text-sm text-right">
            <thead className="bg-[#007B6E] text-white">
              <tr>
                <th className="p-3 font-semibold">{isAr ? 'اسم الملف' : 'File Name'}</th>
                <th className="p-3 font-semibold">{isAr ? 'الحجم' : 'Size'}</th>
                <th className="p-3 font-semibold">{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file: any, idx: number) => (
                <tr key={idx} className="border-b border-[#E6FAF7] last:border-0 hover:bg-[#E6FAF7]/50 transition-colors">
                  <td className="p-3 font-medium text-gray-800">{file.name}</td>
                  <td className="p-3 text-gray-600">{file.size}</td>
                  <td className="p-3">
                    {file.valid ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30">
                        {isAr ? 'صالح' : 'Valid'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                        {isAr ? 'غير صالح' : 'Invalid'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#00C6AE]/20 shadow-sm">
          <span className="text-sm font-semibold text-[#007B6E]">
            {isAr ? 'ملخص تدقيق الممرض' : 'Nurse Audit Summary'}
          </span>
          <span className="text-sm text-gray-700">
            {isAr ? `تم التدقيق بواسطة: ${nurseName}` : `Audited by: ${nurseName}`}
          </span>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t-2 border-[#00C6AE]/20">
        <div className="flex items-center gap-3 text-[#007B6E]">
          <UserX size={22} />
          <h3 className="text-lg font-bold">{isAr ? 'N03 محرك إخفاء الهوية SDAIA' : 'N03 SDAIA De-Identification Engine'}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl border border-[#00C6AE]/20 shadow-sm">
            <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
              {isAr ? 'الاسم القانوني للمريض' : 'Patient Legal Name'}
            </p>
            <p className="text-base font-semibold text-[#007B6E] tracking-widest" dir="ltr">{maskedName}</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#00C6AE]/20 shadow-sm">
            <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
              {isAr ? 'الهوية الوطنية / الهاتف' : 'National ID / Phone'}
            </p>
            <p className="text-base font-semibold text-[#007B6E] tracking-widest" dir="ltr">{maskedNid} | {maskedPhone}</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#00C6AE]/20 shadow-sm">
            <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
              {isAr ? 'العمر / الجنس' : 'Age / Gender'}
            </p>
            <p className="text-base font-semibold text-gray-800">
              {patient.age || '--'} {isAr ? 'سنة' : 'yrs'} / {patient.gender || '--'}
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#00C6AE]/20 shadow-sm">
            <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
              {isAr ? 'المدينة والمستشفى' : 'City & Hospital'}
            </p>
            <p className="text-base font-semibold text-gray-800">
              {patient.city || '--'} - {patient.hospital || '--'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NurseAuditDeidSection;