import React from 'react';
import { UserCheck, Video, FileText, Stethoscope, MapPin } from 'lucide-react';

export interface DoctorConsultantSelectSectionProps {
  activeCase: any;
  assignedConsultant: { name: string; center: string; city: string };
  isReferralEditable: boolean;
  partnerHospital: string;
  isAr: boolean;
  onUpdateCase: (updated: any) => void;
}

const DoctorConsultantSelectSection: React.FC<DoctorConsultantSelectSectionProps> = ({
  activeCase,
  assignedConsultant,
  isReferralEditable,
  partnerHospital,
  isAr,
  onUpdateCase,
}) => {
  const dir = isAr ? 'rtl' : 'ltr';
  const fontClass = isAr ? 'font-cairo' : 'font-sans';

  const handleTypeChange = (type: string) => {
    if (!isReferralEditable) return;
    onUpdateCase({ ...activeCase, consultationType: type });
  };

  const handleExamToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isReferralEditable) return;
    onUpdateCase({ ...activeCase, requiresInPersonExam: e.target.checked });
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateCase({ ...activeCase, examReason: e.target.value });
  };

  const handleSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateCase({ ...activeCase, appointmentSlot: e.target.value });
  };

  return (
    <section
      dir={dir}
      className={`${fontClass} rounded-2xl border border-[#00C6AE]/30 bg-[#E6FAF7] p-5 shadow-sm transition-all`}
      aria-label={isAr ? 'اختيار الاستشاري' : 'Consultant Selection'}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#007B6E] text-white">
          <UserCheck size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#007B6E]">
            {isAr ? 'الاستشاري الهندي المعين' : 'Assigned Indian Consultant'}
          </h3>
          <p className="text-sm text-[#007B6E]/80">D05-D06</p>
        </div>
        <span className="ms-auto text-xl" aria-hidden="true">🇮🇳</span>
      </div>

      <div className="mb-5 rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#00C6AE]/20">
        <p className="text-base font-semibold text-gray-900">{assignedConsultant.name}</p>
        <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={14} className="text-[#00C6AE]" />
          <span>{assignedConsultant.center}, {assignedConsultant.city}</span>
        </div>
        <p className="mt-2 text-xs font-medium uppercase tracking-wider text-[#007B6E]">
          {partnerHospital}
        </p>
      </div>

      <fieldset disabled={!isReferralEditable} className="mb-5">
        <legend className="mb-2 text-sm font-semibold text-[#007B6E]">
          {isAr ? 'نوع الاستشارة' : 'Consultation Type'}
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleTypeChange('written')}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C6AE] ${
              activeCase?.consultationType === 'written'
                ? 'border-[#007B6E] bg-[#007B6E] text-white'
                : 'border-[#00C6AE]/40 bg-white text-[#007B6E] hover:border-[#007B6E]'
            }`}
            aria-pressed={activeCase?.consultationType === 'written'}
          >
            <FileText size={16} />
            {isAr ? 'رأي مكتوب فقط' : 'Written Opinion Only'}
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('video_written')}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C6AE] ${
              activeCase?.consultationType === 'video_written'
                ? 'border-[#007B6E] bg-[#007B6E] text-white'
                : 'border-[#00C6AE]/40 bg-white text-[#007B6E] hover:border-[#007B6E]'
            }`}
            aria-pressed={activeCase?.consultationType === 'video_written'}
          >
            <Video size={16} />
            {isAr ? 'مرئي ومكتوب' : 'Video + Written'}
          </button>
        </div>
      </fieldset>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#00C6AE]/20">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={!!activeCase?.requiresInPersonExam}
            onChange={handleExamToggle}
            disabled={!isReferralEditable}
            className="mt-1 h-5 w-5 rounded border-[#00C6AE] text-[#007B6E] focus:ring-[#00C6AE] disabled:opacity-50"
          />
          <div className="flex-1">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#007B6E]">
              <Stethoscope size={15} />
              {isAr ? 'فحص سريري حضوري مطلوب' : 'In-Person Clinical Exam Required'}
            </span>
            {activeCase?.requiresInPersonExam && (
              <div className="mt-3 space-y-3">
                <textarea
                  value={activeCase?.examReason || ''}
                  onChange={handleReasonChange}
                  placeholder={isAr ? 'سبب الفحص الحضوري...' : 'Reason for in-person exam...'}
                  rows={2}
                  className="w-full rounded-lg border border-[#00C6AE]/40 bg-[#E6FAF7]/50 p-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#007B6E] focus:outline-none focus:ring-1 focus:ring-[#007B6E]"
                />
                <input
                  type="datetime-local"
                  value={activeCase?.appointmentSlot || ''}
                  onChange={handleSlotChange}
                  className="w-full rounded-lg border border-[#00C6AE]/40 bg-[#E6FAF7]/50 p-2.5 text-sm text-gray-800 focus:border-[#007B6E] focus:outline-none focus:ring-1 focus:ring-[#007B6E]"
                  aria-label={isAr ? 'موعد الفحص' : 'Appointment Slot'}
                />
              </div>
            )}
          </div>
        </label>
      </div>
    </section>
  );
};

export default DoctorConsultantSelectSection;