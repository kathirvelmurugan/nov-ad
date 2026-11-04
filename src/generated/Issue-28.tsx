import React, { useState, useCallback, useMemo } from 'react';

// ALO DOCTOR v2.4 Saudi Edition - Five Device Cockpit View
// Author: Adrian Lewis <adrian.lewis@alodoctor.com>
// Model Target: qwen3.8-max

type PersonaId = 'D01' | 'D02' | 'D03' | 'D04' | 'D05' | 'D06' | 'C01' | 'P01' | 'K01' | 'A01' | 'S01';

interface WorkflowState {
  d05d06Modality: 'WRITTEN_ONLY' | 'VIDEO_WRITTEN' | null;
  gate1CoordinatorApproved: boolean;
  gate1ZatcaIssued: boolean;
  gate1PatientCheckoutUnlocked: boolean;
  gate2MadaVerified: boolean;
  gate2CaseDispatched: boolean;
  gate2ConsultantUnlocked: boolean;
  consultantSubmitted: boolean;
  coordinatorReceivedOpinion: boolean;
  c08ReleaseHighlighted: boolean;
}

interface ActionButtonProps {
  label: string;
  labelAr: string;
  state: 'completed' | 'active' | 'disabled';
  onClick?: () => void;
  lang: 'en' | 'ar';
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, labelAr, state, onClick, lang }) => {
  const isRtl = lang === 'ar';
  
  const baseClasses = "relative flex items-center justify-center w-full py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300 border-2 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const stateClasses = {
    completed: "bg-[#E6FAF7] border-[#007B6E] text-[#007B6E] cursor-not-allowed opacity-90",
    active: "bg-[#007B6E] border-[#00C6AE] text-white shadow-[0_0_15px_rgba(0,198,174,0.6)] animate-pulse cursor-pointer hover:bg-[#006B5E]",
    disabled: "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
  };

  return (
    <button
      type="button"
      className={`${baseClasses} ${stateClasses[state]}`}
      onClick={state === 'active' ? onClick : undefined}
      disabled={state !== 'active'}
      dir={isRtl ? 'rtl' : 'ltr'}
      aria-label={isRtl ? labelAr : label}
      aria-disabled={state !== 'active'}
    >
      <span className="flex items-center gap-2">
        {isRtl ? labelAr : label}
      </span>
      {state === 'completed' && (
        <span className="absolute top-[-8px] right-[-8px] flex items-center justify-center w-6 h-6 bg-[#25D366] rounded-full border-2 border-white shadow-sm" aria-hidden="true">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </button>
  );
};

const FiveDeviceCockpitView: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'ar'>('ar');
  const [activePersona, setActivePersona] = useState<PersonaId>('C01');
  const [workflow, setWorkflow] = useState<WorkflowState>({
    d05d06Modality: null,
    gate1CoordinatorApproved: false,
    gate1ZatcaIssued: false,
    gate1PatientCheckoutUnlocked: false,
    gate2MadaVerified: false,
    gate2CaseDispatched: false,
    gate2ConsultantUnlocked: false,
    consultantSubmitted: false,
    coordinatorReceivedOpinion: false,
    c08ReleaseHighlighted: false
  });

  const personas: { id: PersonaId; nameEn: string; nameAr: string; roleEn: string; roleAr: string }[] = useMemo(() => [
    { id: 'D01', nameEn: 'Dr. Ahmed', nameAr: 'د. أحمد', roleEn: 'Saudi Doctor', roleAr: 'طبيب سعودي' },
    { id: 'D02', nameEn: 'Dr. Fatima', nameAr: 'د. فاطمة', roleEn: 'Saudi Doctor', roleAr: 'طبيبة سعودية' },
    { id: 'D03', nameEn: 'Dr. Khalid', nameAr: 'د. خالد', roleEn: 'Saudi Doctor', roleAr: 'طبيب سعودي' },
    { id: 'D04', nameEn: 'Dr. Noura', nameAr: 'د. نورة', roleEn: 'Saudi Doctor', roleAr: 'طبيبة سعودية' },
    { id: 'D05', nameEn: 'Specialist 1', nameAr: 'أخصائي ١', roleEn: 'D05 Modality', roleAr: 'نمط D05' },
    { id: 'D06', nameEn: 'Specialist 2', nameAr: 'أخصائي ٢', roleEn: 'D06 Modality', roleAr: 'نمط D06' },
    { id: 'C01', nameEn: 'Coord. Ali', nameAr: 'المنسق علي', roleEn: 'Alo Coordinator', roleAr: 'منسق ألو' },
    { id: 'P01', nameEn: 'Patient', nameAr: 'المريض', roleEn: 'Patient Portal', roleAr: 'بوابة المريض' },
    { id: 'K01', nameEn: 'Dr. Sharma', nameAr: 'د. شارما', roleEn: 'Indian Consultant', roleAr: 'استشاري هندي' },
    { id: 'A01', nameEn: 'Admin', nameAr: 'المسؤول', roleEn: 'System Admin', roleAr: 'مسؤول النظام' },
    { id: 'S01', nameEn: 'Support', nameAr: 'الدعم', roleEn: 'Tech Support', roleAr: 'الدعم الفني' }
  ], []);

  const handleModalitySelect = useCallback((modality: 'WRITTEN_ONLY' | 'VIDEO_WRITTEN') => {
    setWorkflow(prev => ({ ...prev, d05d06Modality: modality }));
  }, []);

  const handleGate1Approval = useCallback(() => {
    setWorkflow(prev => ({ ...prev, gate1CoordinatorApproved: true, gate1ZatcaIssued: true, gate1PatientCheckoutUnlocked: true }));
  }, []);

  const handleGate2Verification = useCallback(() => {
    setWorkflow(prev => ({ ...prev, gate2MadaVerified: true, gate2CaseDispatched: true, gate2ConsultantUnlocked: true }));
  }, []);

  const handleConsultantSubmit = useCallback(() => {
    setWorkflow(prev => ({ 
      ...prev, 
      consultantSubmitted: true, 
      coordinatorReceivedOpinion: true, 
      c08ReleaseHighlighted: true 
    }));
  }, []);

  const getButtonState = (step: number): 'completed' | 'active' | 'disabled' => {
    if (step === 1) return workflow.d05d06Modality ? 'completed' : 'active';
    if (step === 2) return workflow.gate1CoordinatorApproved ? 'completed' : (workflow.d05d06Modality ? 'active' : 'disabled');
    if (step === 3) return workflow.gate2MadaVerified ? 'completed' : (workflow.gate1PatientCheckoutUnlocked ? 'active' : 'disabled');
    if (step === 4) return workflow.consultantSubmitted ? 'completed' : (workflow.gate2ConsultantUnlocked ? 'active' : 'disabled');
    if (step === 5) return workflow.c08ReleaseHighlighted ? 'completed' : (workflow.coordinatorReceivedOpinion ? 'active' : 'disabled');
    return 'disabled';
  };

  const isRtl = lang === 'ar';

  return (
    <div 
      className="w-full h-screen bg-[#F4F7F6] overflow-hidden font-['Cairo',sans-serif]" 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Executive Header */}
      <header className="h-[100px] bg-white border-b-2 border-[#007B6E] flex items-center justify-between px-6 shadow-sm z-10 relative">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#007B6E] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#007B6E]">
              {isRtl ? 'لوحة تحكم ألو دكتور التنفيذية' : 'ALO DOCTOR Executive Cockpit'}
            </h1>
            <p className="text-xs text-gray-500 font-medium">v2.4 Saudi Edition • 5-Screen Panoramic Layout</p>
          </div>
        </div>

        {/* 11 Persona Profile Switcher */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-gray-700">
            {isRtl ? 'تبديل الشخصية:' : 'Persona Switch:'}
          </label>
          <select
            value={activePersona}
            onChange={(e) => setActivePersona(e.target.value as PersonaId)}
            className="px-4 py-2 border-2 border-[#00C6AE] rounded-lg bg-white text-[#007B6E] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#007B6E] cursor-pointer"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {personas.map(p => (
              <option key={p.id} value={p.id}>
                {isRtl ? `${p.nameAr} (${p.roleAr})` : `${p.nameEn} (${p.roleEn})`}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="px-3 py-2 bg-[#E6FAF7] border border-[#007B6E] text-[#007B6E] rounded-lg font-bold text-xs hover:bg-[#007B6E] hover:text-white transition-colors"
          >
            {lang === 'en' ? 'عربي' : 'English'}
          </button>
        </div>
      </header>

      {/* Middle Status Bar */}
      <div className="h-[70px] bg-[#E6FAF7] border-b border-[#00C6AE] flex items-center justify-center gap-8 px-6">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${workflow.d05d06Modality ? 'bg-[#25D366]' : 'bg-gray-300'}`} />
          <span className="text-xs font-bold text-[#007B6E]">{isRtl ? '١. النمط' : '1. Modality'}</span>
        </div>
        <div className="w-8 h-[2px] bg-[#00C6AE]" />
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${workflow.gate1CoordinatorApproved ? 'bg-[#25D366]' : 'bg-gray-300'}`} />
          <span className="text-xs font-bold text-[#007B6E]">{isRtl ? '٢. بوابة المنسق' : '2. Coord Gate'}</span>
        </div>
        <div className="w-8 h-[2px] bg-[#00C6AE]" />
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${workflow.gate2MadaVerified ? 'bg-[#25D366]' : 'bg-gray-300'}`} />
          <span className="text-xs font-bold text-[#007B6E]">{isRtl ? '٣. مدى والدفع' : '3. Mada & Pay'}</span>
        </div>
        <div className="w-8 h-[2px] bg-[#00C6AE]" />
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${workflow.consultantSubmitted ? 'bg-[#25D366]' : 'bg-gray-300'}`} />
          <span className="text-xs font-bold text-[#007B6E]">{isRtl ? '٤. الاستشاري' : '4. Consultant'}</span>
        </div>
        <div className="w-8 h-[2px] bg-[#00C6AE]" />
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${workflow.c08ReleaseHighlighted ? 'bg-[#25D366]' : 'bg-gray-300'}`} />
          <span className="text-xs font-bold text-[#007B6E]">{isRtl ? '٥. الإصدار C08' : '5. C08 Release'}</span>
        </div>
      </div>

      {/* Panoramic 5-Screen Horizontal Fit Container */}
      {/* width: calc(20% - 8px), max-height: calc(100vh - 210px), flex-nowrap ensures zero screens drop to 2nd row */}
      <main 
        className="flex flex-nowrap gap-2 p-2 overflow-x-hidden overflow-y-hidden justify-start items-start"
        style={{ height: 'calc(100vh - 170px)' }}
      >
        {/* Screen 1: D05-D06 Modality Selection (Strict 2-Tier) */}
        <section 
          className="bg-white rounded-xl border-2 border-[#00C6AE] shadow-sm flex flex-col overflow-hidden flex-shrink-0"
          style={{ width: 'calc(20% - 8px)', maxHeight: 'calc(100vh - 210px)', height: '100%' }}
        >
          <div className="bg-[#007B6E] p-3 flex-shrink-0">
            <h2 className="text-white font-bold text-sm text-center">
              {isRtl ? 'شاشة النمط (D05-D06)' : 'Modality Screen (D05-D06)'}
            </h2>
            <p className="text-[#E6FAF7] text-[10px] text-center mt-1 font-medium">
              {isRtl ? 'خياران حصريان فقط' : 'Strict 2 Options Only'}
            </p>
          </div>
          <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 custom-scrollbar">
            <div className="bg-[#E6FAF7] p-3 rounded-lg border border-[#00C6AE]">
              <p className="text-[10px] font-bold text-[#007B6E] mb-2 uppercase tracking-wider">
                {isRtl ? 'القيد السريري' : 'Clinical Constraint'}
              </p>
              <p className="text-xs text-gray-700 leading-relaxed">
                {isRtl 
                  ? 'يقتصر نمط D05-D06 على خيارين دقيقين لضمان الامتثال التنظيمي.' 
                  : 'D05-D06 modality is restricted to exactly 2 precise options for regulatory compliance.'}
              </p>
            </div>

            <button
              onClick={() => handleModalitySelect('WRITTEN_ONLY')}
              disabled={!!workflow.d05d06Modality}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                workflow.d05d06Modality === 'WRITTEN_ONLY' 
                  ? 'border-[#25D366] bg-green-50' 
                  : workflow.d05d06Modality 
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-[#00C6AE] bg-white hover:border-[#007B6E] hover:shadow-md cursor-pointer'
              }`}
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#007B6E]">
                  {isRtl ? 'رأي مكتوب فقط' : 'Written Opinion Only'}
                </span>
                {workflow.d05d06Modality === 'WRITTEN_ONLY' && (
                  <span className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {isRtl ? 'تقرير نصي بدون مكالمة مرئية' : 'Text report without video call'}
              </p>
            </button>

            <button
              onClick={() => handleModalitySelect('VIDEO_WRITTEN')}
              disabled={!!workflow.d05d06Modality}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                workflow.d05d06Modality === 'VIDEO_WRITTEN' 
                  ? 'border-[#25D366] bg-green-50' 
                  : workflow.d05d06Modality 
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-[#00C6AE] bg-white hover:border-[#007B6E] hover:shadow-md cursor-pointer'
              }`}
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#007B6E]">
                  {isRtl ? 'فيديو + رأي مكتوب' : 'Video + Written Opinion'}
                </span>
                {workflow.d05d06Modality === 'VIDEO_WRITTEN' && (
                  <span className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {isRtl ? 'استشارة مرئية شاملة مع تقرير' : 'Comprehensive video consult with report'}
              </p>
            </button>

            {!workflow.d05d06Modality && (
              <div className="mt-auto pt-4 border-t border-gray-100">
                <p className="text-[10px] text-red-500 font-bold text-center animate-pulse">
                  {isRtl ? '⚠ إجراء مطلوب: اختر النمط للمتابعة' : '⚠ Action Required: Select modality to proceed'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Screen 2: Alo Coordinator Gate 1 (ZATCA & Checkout) */}
        <section 
          className="bg-white rounded-xl border-2 border-[#00C6AE] shadow-sm flex flex-col overflow-hidden flex-shrink-0"
          style={{ width: 'calc(20% - 8px)', maxHeight: 'calc(100vh - 210px)', height: '100%' }}
        >
          <div className="bg-[#007B6E] p-3 flex-shrink-0">
            <h2 className="text-white font-bold text-sm text-center">
              {isRtl ? 'بوابة المنسق ١ (C04)' : 'Coordinator Gate 1 (C04)'}
            </h2>
            <p className="text-[#E6FAF7] text-[10px] text-center mt-1 font-medium">
              {isRtl ? 'فاتورة ZATCA -> خروج المريض P19' : 'ZATCA Invoice -> Patient P19 Checkout'}
            </p>
          </div>
          <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 custom-scrollbar">
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider mb-1">
                {isRtl ? 'قاعدة القفل الصارم' : 'Strict Locking Rule'}
              </p>
              <p className="text-[11px] text-yellow-700 leading-relaxed">
                {isRtl 
                  ? 'يجب أن يوافق الطبيب السعودي أولاً. ثم يصدر المنسق فاتورة ZATCA (C04) قبل فتح خروج المريض (P19).' 
                  : 'Saudi Doctor must approve first. Coordinator issues ZATCA invoice (C04) before Patient checkout (P19) unlocks.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-bold text-gray-700">{isRtl ? 'حالة موافقة الطبيب السعودي' : 'Saudi Doctor Approval Status'}</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {workflow.d05d06Modality ? (isRtl ? 'تم استلام الموافقة' : 'Approval Received') : (isRtl ? 'في انتظار اختيار النمط' : 'Awaiting Modality Selection')}
                </p>
              </div>

              <ActionButton
                label="Issue ZATCA Invoice (C04)"
                labelAr="إصدار فاتورة ZATCA (C04)"
                state={getButtonState(2)}
                onClick={handleGate1Approval}
                lang={lang}
              />

              <div className={`p-3 rounded-lg border-2 transition-all ${workflow.gate1PatientCheckoutUnlocked ? 'border-[#25D366] bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-700">{isRtl ? 'خروج المريض (P19)' : 'Patient Checkout (P19)'}</p>
                  {workflow.gate1PatientCheckoutUnlocked ? (
                    <span className="text-[10px] font-bold text-[#25D366] bg-green-100 px-2 py-1 rounded-full">
                      {isRtl ? 'مفتوح' : 'UNLOCKED'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
                      {isRtl ? 'مقفل' : 'LOCKED'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Screen 3: Alo Coordinator Gate 2 (Mada & Dispatch) */}
        <section 
          className="bg-white rounded-xl border-2 border-[#00C6AE] shadow-sm flex flex-col overflow-hidden flex-shrink-0"
          style={{ width: 'calc(20% - 8px)', maxHeight: 'calc(100vh - 210px)', height: '100%' }}
        >
          <div className="bg-[#007B6E] p-3 flex-shrink-0">
            <h2 className="text-white font-bold text-sm text-center">
              {isRtl ? 'بوابة المنسق ٢ (C06)' : 'Coordinator Gate 2 (C06)'}
            </h2>
            <p className="text-[#E6FAF7] text-[10px] text-center mt-1 font-medium">
              {isRtl ? 'تحقق مدى -> إرسال الحالة K01' : 'Mada Verify -> Case Dispatch K01'}
            </p>
          </div>
          <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 custom-scrollbar">
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">
                {isRtl ? 'التحقق المالي' : 'Financial Verification'}
              </p>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                {isRtl 
                  ? 'يدفع المريض، يتحقق المنسق من مدى (C06)، ثم يرسل الحالة للاستشاري الهندي (K01).' 
                  : 'Patient pays, Coordinator verifies Mada (C06), then dispatches case to Indian Consultant (K01).'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-bold text-gray-700">{isRtl ? 'حالة دفع المريض' : 'Patient Payment Status'}</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {workflow.gate1PatientCheckoutUnlocked ? (isRtl ? 'جاهز للتحقق عبر مدى' : 'Ready for Mada Verification') : (isRtl ? 'مقفل حتى اكتمال البوابة ١' : 'Locked until Gate 1 Complete')}
                </p>
              </div>

              <ActionButton
                label="Verify Mada & Dispatch (C06)"
                labelAr="تحقق مدى وإرسال (C06)"
                state={getButtonState(3)}
                onClick={handleGate2Verification}
                lang={lang}
              />

              <div className={`p-3 rounded-lg border-2 transition-all ${workflow.gate2ConsultantUnlocked ? 'border-[#25D366] bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-700">{isRtl ? 'الاستشاري الهندي (K01)' : 'Indian Consultant (K01)'}</p>
                  {workflow.gate2ConsultantUnlocked ? (
                    <span className="text-[10px] font-bold text-[#25D366] bg-green-100 px-2 py-1 rounded-full">
                      {isRtl ? 'مفتوح' : 'UNLOCKED'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
                      {isRtl ? 'مقفل' : 'LOCKED'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Screen 4: Indian Consultant (K01) Submission */}
        <section 
          className="bg-white rounded-xl border-2 border-[#00C6AE] shadow-sm flex flex-col overflow-hidden flex-shrink-0"
          style={{ width: 'calc(20% - 8px)', maxHeight: 'calc(100vh - 210px)', height: '100%' }}
        >
          <div className="bg-[#007B6E] p-3 flex-shrink-0">
            <h2 className="text-white font-bold text-sm text-center">
              {isRtl ? 'شاشة الاستشاري (K01)' : 'Consultant Screen (K01)'}
            </h2>
            <p className="text-[#E6FAF7] text-[10px] text-center mt-1 font-medium">
              {isRtl ? 'إرسال الرأي السريري K06' : 'Clinical Opinion Submission K06'}
            </p>
          </div>
          <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 custom-scrollbar">
            <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
              <p className="text-[10px] font-bold text-purple-800 uppercase tracking-wider mb-1">
                {isRtl ? 'ملف الحالة' : 'Case Dossier'}
              </p>
              <p className="text-[11px] text-purple-700 leading-relaxed">
                {isRtl 
                  ? 'راجع السجلات الطبية وأرسل رأيك السريري النهائي. سيؤدي هذا إلى تحديث شاشة المنسق فوراً.' 
                  : 'Review medical records and submit your final clinical opinion. This will instantly update the Coordinator screen.'}
              </p>
            </div>

            <div className="flex-1 border-2 border-dashed border-gray-200 rounded-lg p-3 flex flex-col">
              <label className="text-xs font-bold text-gray-600 mb-2">
                {isRtl ? 'الرأي السريري' : 'Clinical Opinion'}
              </label>
              <textarea
                className="flex-1 w-full resize-none text-xs text-gray-700 focus:outline-none bg-transparent"
                placeholder={isRtl ? 'اكتب رأيك السريري هنا...' : 'Type your clinical opinion here...'}
                disabled={!workflow.gate2ConsultantUnlocked || workflow.consultantSubmitted}
                dir={isRtl ? 'rtl' : 'ltr'}
              />
            </div>

            <ActionButton
              label="Submit Opinion (K06)"
              labelAr="إرسال الرأي (K06)"
              state={getButtonState(4)}
              onClick={handleConsultantSubmit}
              lang={lang}
            />

            {workflow.consultantSubmitted && (
              <div className="bg-[#E6FAF7] border border-[#00C6AE] p-3 rounded-lg animate-fade-in">
                <p className="text-[11px] font-bold text-[#007B6E] text-center">
                  {isRtl ? '✓ تم الإرسال بنجاح للمنسق' : '✓ Successfully Submitted to Coordinator'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Screen 5: Live Coordinator Dossier Feedback & C08 Release */}
        <section 
          className={`bg-white rounded-xl border-2 shadow-sm flex flex-col overflow-hidden flex-shrink-0 transition-all duration-500 ${
            workflow.c08ReleaseHighlighted ? 'border-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.4)]' : 'border-[#00C6AE]'
          }`}
          style={{ width: 'calc(20% - 8px)', maxHeight: 'calc(100vh - 210px)', height: '100%' }}
        >
          <div className={`p-3 flex-shrink-0 transition-colors duration-500 ${workflow.c08ReleaseHighlighted ? 'bg-[#25D366]' : 'bg-[#007B6E]'}`}>
            <h2 className="text-white font-bold text-sm text-center">
              {isRtl ? 'ملف المنسق المباشر' : 'Live Coordinator Dossier'}
            </h2>
            <p className="text-white text-[10px] text-center mt-1 font-medium opacity-90">
              {isRtl ? 'ملاحظات فورية وإصدار C08' : 'Real-time Feedback & C08 Release'}
            </p>
          </div>
          <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 custom-scrollbar">
            
            {/* Live Feedback Indicator */}
            <div className={`p-4 rounded-lg border-2 transition-all duration-500 ${
              workflow.coordinatorReceivedOpinion 
                ? 'border-[#00C6AE] bg-[#E6FAF7]' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${workflow.coordinatorReceivedOpinion ? 'bg-[#25D366] animate-pulse' : 'bg-gray-300'}`} />
                <p className="text-xs font-bold text-gray-700">
                  {isRtl ? 'حالة الرأي الوارد' : 'Incoming Opinion Status'}
                </p>
              </div>
              {workflow.coordinatorReceivedOpinion ? (
                <div className="bg-white p-3 rounded border border-[#00C6AE] mt-2">
                  <p className="text-[11px] text-[#007B6E] font-bold">
                    {isRtl ? '✓ تم استلام الرأي السريري من K01' : '✓ Clinical Opinion Received from K01'}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {isRtl ? 'جاهز للمراجعة والإصدار النهائي' : 'Ready for review and final release'}
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 italic">
                  {isRtl ? 'في انتظار إرسال الاستشاري (K06)...' : 'Awaiting Consultant Submission (K06)...'}
                </p>
              )}
            </div>

            {/* C08 Release Highlight */}
            <div className={`p-4 rounded-lg border-2 transition-all duration-500 ${
              workflow.c08ReleaseHighlighted 
                ? 'border-[#25D366] bg-green-50 shadow-inner' 
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-extrabold text-gray-800">
                  {isRtl ? 'الإصدار النهائي (C08)' : 'Final Release (C08)'}
                </p>
                {workflow.c08ReleaseHighlighted && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#25D366] bg-green-100 px-2 py-1 rounded-full animate-bounce">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    {isRtl ? 'نشط' : 'ACTIVE'}
                  </span>
                )}
              </div>
              
              <ActionButton
                label="Execute C08 Release"
                labelAr="تنفيذ إصدار C08"
                state={getButtonState(5)}
                onClick={() => setWorkflow(prev => ({ ...prev, c08ReleaseHighlighted: true }))}
                lang={lang}
              />
            </div>

            {/* Workflow Summary Mini-Log */}
            <div className="mt-auto pt-4 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                {isRtl ? 'سجل التدفق' : 'Workflow Log'}
              </p>
              <div className="space-y-1 max-h-20 overflow-y-auto custom-scrollbar">
                {workflow.d05d06Modality && (
                  <p className="text-[10px] text-gray-500">• {isRtl ? 'تم تحديد النمط' : 'Modality Set'}</p>
                )}
                {workflow.gate1CoordinatorApproved && (
                  <p className="text-[10px] text-gray-500">• {isRtl ? 'تمت البوابة ١' : 'Gate 1 Cleared'}</p>
                )}
                {workflow.gate2MadaVerified && (
                  <p className="text-[10px] text-gray-500">• {isRtl ? 'تم التحقق من مدى' : 'Mada Verified'}</p>
                )}
                {workflow.consultantSubmitted && (
                  <p className="text-[10px] text-gray-500">• {isRtl ? 'تم إرسال K06' : 'K06 Submitted'}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Styles for Custom Scrollbar and Cairo Font Integration */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        
        * {
          font-family: 'Cairo', sans-serif;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #E6FAF7;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #00C6AE;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #007B6E;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FiveDeviceCockpitView;