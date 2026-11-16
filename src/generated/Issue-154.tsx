import React, { useState, useCallback, useEffect } from 'react';

interface CaseRecord {
  caseId: string;
  patientId: string;
  currentStage: string;
  status: string;
  pdf1Released: boolean;
  reportsReleased: boolean;
}

interface CoordinatorPortalViewProps {
  activeCase: CaseRecord;
  personaId: string;
  onCaseUpdate: (updatedCase: CaseRecord) => void;
}

const apiClient = {
  closeCase: async (caseId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 800);
    });
  },
  dispatchNotification: async (patientId: string, channel: 'SMS' | 'WHATSAPP', link: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  }
};

const BilingualReportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  reportType: 'PDF_1' | 'PDF_2';
  onConfirm: () => void;
  isProcessing: boolean;
}> = ({ isOpen, onClose, reportType, onConfirm, isProcessing }) => {
  if (!isOpen) return null;

  const titleAr = reportType === 'PDF_1' ? 'التقرير التنفيذي' : 'الملف السريري الشامل';
  const titleEn = reportType === 'PDF_1' ? 'Executive Summary' : 'Comprehensive Clinical Dossier';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" dir="auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden font-['Cairo',sans-serif]">
        <div className="bg-[#007B6E] p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{titleAr}</h2>
            <p className="text-sm opacity-90 mt-1 font-['Inter',sans-serif]" dir="ltr">{titleEn}</p>
          </div>
          <button onClick={onClose} disabled={isProcessing} className="text-white hover:text-[#E6FAF7] transition-colors" aria-label="إغلاق / Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-6 bg-[#E6FAF7] min-h-[200px] flex flex-col items-center justify-center text-center">
          <p className="text-[#007B6E] font-semibold text-lg mb-2">معاينة التقرير</p>
          <p className="text-gray-600 text-sm font-['Inter',sans-serif]" dir="ltr">Report Preview Placeholder</p>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-white">
          <button onClick={onClose} disabled={isProcessing} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
            إلغاء / Cancel
          </button>
          <button onClick={onConfirm} disabled={isProcessing} className="px-6 py-2.5 rounded-lg bg-[#007B6E] text-white hover:bg-[#005f55] transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isProcessing && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            تأكيد / Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const CoordinatorPortalView: React.FC<CoordinatorPortalViewProps> = ({ activeCase, personaId, onCaseUpdate }) => {
  const [localCase, setLocalCase] = useState<CaseRecord>(activeCase);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'PDF_1' | 'PDF_2'>('PDF_1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string>('');

  useEffect(() => {
    setLocalCase(activeCase);
  }, [activeCase]);

  const handleOpenC08Modal = useCallback(() => {
    setModalType('PDF_1');
    setIsModalOpen(true);
  }, []);

  const handleOpenC10Modal = useCallback(() => {
    setModalType('PDF_2');
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    if (!isProcessing) {
      setIsModalOpen(false);
    }
  }, [isProcessing]);

  const handleConfirmAction = useCallback(async () => {
    setIsProcessing(true);
    try {
      if (modalType === 'PDF_1') {
        // C08 Dispatch Logic
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate PDF generation/approval
        const updatedCase: CaseRecord = {
          ...localCase,
          pdf1Released: true,
          currentStage: 'DISPATCHED'
        };
        setLocalCase(updatedCase);
        onCaseUpdate(updatedCase);
      } else if (modalType === 'PDF_2') {
        // C10 Final Case Closure Logic
        const response = await apiClient.closeCase(localCase.caseId);
        
        if (response.success) {
          const updatedCase: CaseRecord = {
            ...localCase,
            currentStage: 'CLOSED',
            status: 'closed',
            reportsReleased: true
          };
          setLocalCase(updatedCase);
          onCaseUpdate(updatedCase);

          // Dispatch SMS/WhatsApp notification
          const downloadLink = `https://alo-doctor.sa/portal/cases/${localCase.caseId}/download`;
          await apiClient.dispatchNotification(localCase.patientId, 'WHATSAPP', downloadLink);
          setNotificationStatus('تم إرسال إشعار الواتساب للمريض بنجاح / WhatsApp notification dispatched successfully.');
        }
      }
    } catch (error) {
      console.error('Coordinator action failed:', error);
      setNotificationStatus('حدث خطأ أثناء المعالجة / An error occurred during processing.');
    } finally {
      setIsProcessing(false);
      setIsModalOpen(false);
    }
  }, [modalType, localCase, onCaseUpdate]);

  const isClosed = localCase.status === 'closed' || localCase.currentStage === 'CLOSED';

  return (
    <div className="min-h-screen bg-[#F4F7F6] font-['Cairo',sans-serif]" dir="rtl">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#007B6E] flex items-center justify-center text-white font-bold">
            C
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">بوابة المنسق / Coordinator Portal</h1>
            <p className="text-xs text-gray-500 font-['Inter',sans-serif]" dir="ltr">ALO DOCTOR v2.4 Saudi Edition | Persona: {personaId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6FAF7] text-[#007B6E] text-sm font-semibold">
          <span className={`w-2 h-2 rounded-full ${isClosed ? 'bg-gray-400' : 'bg-[#25D366]'}`}></span>
          {isClosed ? 'حالة مغلقة / Closed' : 'حالة نشطة / Active'}
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Case Info Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">تفاصيل الحالة / Case Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#E6FAF7] p-4 rounded-xl">
              <p className="text-xs text-[#007B6E] font-semibold mb-1">رقم الحالة / Case ID</p>
              <p className="font-mono text-sm font-bold text-gray-800" dir="ltr">{localCase.caseId}</p>
            </div>
            <div className="bg-[#E6FAF7] p-4 rounded-xl">
              <p className="text-xs text-[#007B6E] font-semibold mb-1">المرحلة الحالية / Current Stage</p>
              <p className="font-bold text-gray-800">{localCase.currentStage}</p>
            </div>
            <div className="bg-[#E6FAF7] p-4 rounded-xl">
              <p className="text-xs text-[#007B6E] font-semibold mb-1">حالة التقارير / Reports Status</p>
              <p className="font-bold text-gray-800">
                {localCase.reportsReleased ? 'تم الإصدار / Released' : 'قيد الانتظار / Pending'}
              </p>
            </div>
          </div>
        </section>

        {/* Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* C08 Dispatch Card */}
          <div className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 p-6 flex flex-col ${localCase.pdf1Released ? 'border-[#25D366] bg-green-50/30' : 'border-gray-100 hover:border-[#00C6AE]'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${localCase.pdf1Released ? 'bg-[#25D366] text-white' : 'bg-[#E6FAF7] text-[#007B6E]'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">الخطوة A: التوزيع (C08)</h3>
                <p className="text-xs text-gray-500 font-['Inter',sans-serif]" dir="ltr">Step A: Dispatch (PDF 1)</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6 flex-grow">
              إنشاء واعتماد التقرير التنفيذي (PDF 1). سيتم توزيعه على الأطراف المعنية بعد الاعتماد.
              <br/>
              <span className="font-['Inter',sans-serif] text-xs block mt-2" dir="ltr">Generate and approve Executive Summary (PDF 1). Distribution follows approval.</span>
            </p>

            {localCase.pdf1Released ? (
              <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366]/10 text-[#25D366] font-bold text-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                تم الاعتماد والتوزيع / Dispatched
              </div>
            ) : (
              <button
                onClick={handleOpenC08Modal}
                disabled={isClosed || isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-[#007B6E] text-white font-bold text-sm hover:bg-[#005f55] transition-colors focus:outline-none focus:ring-4 focus:ring-[#00C6AE]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-label="اعتماد وتوزيع التقرير التنفيذي"
              >
                اعتماد وتوزيع التقرير التنفيذي (C08 / Dispatch PDF 1)
              </button>
            )}
          </div>

          {/* C10 Closure Card */}
          <div className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 p-6 flex flex-col ${isClosed ? 'border-gray-300 bg-gray-50/50' : 'border-gray-100 hover:border-[#00C6AE]'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isClosed ? 'bg-gray-400 text-white' : 'bg-[#E6FAF7] text-[#007B6E]'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">الخطوة B: الإغلاق النهائي (C10)</h3>
                <p className="text-xs text-gray-500 font-['Inter',sans-serif]" dir="ltr">Step B: Final Case Closure</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6 flex-grow">
              إنشاء الملف السريري الشامل (PDF 2)، إغلاق الحالة نهائياً وأرشفتها في قاعدة البيانات، وإرسال رابط التحميل للمريض عبر واتساب أو الرسائل النصية.
              <br/>
              <span className="font-['Inter',sans-serif] text-xs block mt-2" dir="ltr">Generate Comprehensive Clinical Dossier (PDF 2), close & archive case in PostgreSQL, dispatch SMS/WhatsApp to patient.</span>
            </p>

            {isClosed ? (
              <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-200 text-gray-600 font-bold text-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                الحالة مغلقة ومؤرشفة / Case Closed & Archived
              </div>
            ) : (
              <button
                onClick={handleOpenC10Modal}
                disabled={!localCase.pdf1Released || isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-[#00C6AE] text-white font-bold text-sm hover:bg-[#007B6E] transition-colors focus:outline-none focus:ring-4 focus:ring-[#00C6AE]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-label="إغلاق الحالة نهائياً وأرشفتها"
              >
                إغلاق الحالة نهائياً وأرشفتها (C10 / Close Case)
              </button>
            )}
            {!localCase.pdf1Released && !isClosed && (
              <p className="text-xs text-red-500 mt-2 text-center font-semibold">
                يجب اعتماد التقرير التنفيذي أولاً / Must dispatch C08 first
              </p>
            )}
          </div>
        </section>

        {/* Notification Status Alert */}
        {notificationStatus && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${notificationStatus.includes('خطأ') || notificationStatus.includes('error') ? 'bg-red-50 border-red-200 text-red-800' : 'bg-[#E6FAF7] border-[#00C6AE] text-[#007B6E]'}`} role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <p className="text-sm font-semibold">{notificationStatus}</p>
          </div>
        )}
      </main>

      <BilingualReportModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        reportType={modalType}
        onConfirm={handleConfirmAction}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default CoordinatorPortalView;