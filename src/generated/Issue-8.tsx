import React, { useState, useEffect, useCallback } from 'react';

type Language = 'ar' | 'en';
type PersonaId = string;

interface PartnerOrder {
  id: string;
  partnerCode: string;
  partnerNameAr: string;
  partnerNameEn: string;
  serviceType: string;
  status: 'pending' | 'dispatched' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  patientId: string;
  notes?: string;
}

interface Stage7Props {
  personaId?: PersonaId;
  language?: Language;
  onStateChange?: (state: any) => void;
}

const PARTNER_CONFIGS = [
  {
    code: 'L01',
    nameAr: 'مختبرات ألفا',
    nameEn: 'Alpha Labs',
    typeAr: 'إرسال سحب الدم',
    typeEn: 'Phlebotomy Dispatch',
    icon: '🩸',
  },
  {
    code: 'H01',
    nameAr: 'تمريض سند',
    nameEn: 'Sanad Nursing',
    typeAr: 'إرسال التمريض المنزلي',
    typeEn: 'Home Nursing Dispatch',
    icon: '🏥',
  },
  {
    code: 'T01',
    nameAr: 'الفُرسان للسفر الطبي',
    nameEn: 'Al-Fursan Medical Travel',
    typeAr: 'الخدمات اللوجستية',
    typeEn: 'Logistics',
    icon: '✈️',
  },
  {
    code: 'V01',
    nameAr: 'الموافقة المسبقة للتأمين',
    nameEn: 'Insurance Pre-auth',
    typeAr: 'التحقق من التأمين',
    typeEn: 'Insurance Verification',
    icon: '🛡️',
  },
];

const STATUS_MAP = {
  ar: {
    pending: 'قيد الانتظار',
    dispatched: 'تم الإرسال',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
    failed: 'فشل',
  },
  en: {
    pending: 'Pending',
    dispatched: 'Dispatched',
    in_progress: 'In Progress',
    completed: 'Completed',
    failed: 'Failed',
  },
};

const UI_TEXT = {
  ar: {
    title: 'خدمات الشركاء - المرحلة السابعة',
    subtitle: 'إدارة أوامر الإرسال والخدمات الخارجية',
    createOrder: 'إنشاء طلب جديد',
    partner: 'الشريك',
    service: 'الخدمة',
    status: 'الحالة',
    date: 'التاريخ',
    patient: 'المريض',
    actions: 'الإجراءات',
    dispatch: 'إرسال',
    cancel: 'إلغاء',
    view: 'عرض',
    noOrders: 'لا توجد طلبات حالياً',
    confirmDispatch: 'تأكيد الإرسال',
    orderId: 'رقم الطلب',
    notes: 'ملاحظات',
    submit: 'تأكيد',
    close: 'إغلاق',
  },
  en: {
    title: 'Stage 7 Partner Services',
    subtitle: 'Manage dispatch orders and external services',
    createOrder: 'Create New Order',
    partner: 'Partner',
    service: 'Service',
    status: 'Status',
    date: 'Date',
    patient: 'Patient',
    actions: 'Actions',
    dispatch: 'Dispatch',
    cancel: 'Cancel',
    view: 'View',
    noOrders: 'No orders currently',
    confirmDispatch: 'Confirm Dispatch',
    orderId: 'Order ID',
    notes: 'Notes',
    submit: 'Submit',
    close: 'Close',
  },
};

const generateMockOrders = (): PartnerOrder[] => [
  {
    id: 'ORD-L01-001',
    partnerCode: 'L01',
    partnerNameAr: 'مختبرات ألفا',
    partnerNameEn: 'Alpha Labs',
    serviceType: 'L01',
    status: 'dispatched',
    createdAt: new Date().toISOString(),
    patientId: 'PAT-20491',
    notes: 'Fasting blood sample required',
  },
  {
    id: 'ORD-H01-002',
    partnerCode: 'H01',
    partnerNameAr: 'تمريض سند',
    partnerNameEn: 'Sanad Nursing',
    serviceType: 'H01',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    patientId: 'PAT-10382',
    notes: 'Post-operative wound care',
  },
  {
    id: 'ORD-T01-003',
    partnerCode: 'T01',
    partnerNameAr: 'الفُرسان للسفر الطبي',
    partnerNameEn: 'Al-Fursan Medical Travel',
    serviceType: 'T01',
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    patientId: 'PAT-55921',
    notes: 'Riyadh to Jeddah medical transport',
  },
  {
    id: 'ORD-V01-004',
    partnerCode: 'V01',
    partnerNameAr: 'الموافقة المسبقة للتأمين',
    partnerNameEn: 'Insurance Pre-auth',
    serviceType: 'V01',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    patientId: 'PAT-33810',
    notes: 'Bupa pre-authorization approved',
  },
];

const getStatusColor = (status: PartnerOrder['status']): string => {
  switch (status) {
    case 'pending':
      return 'bg-[#E6FAF7] text-[#007B6E] border border-[#00C6AE]';
    case 'dispatched':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'in_progress':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'completed':
      return 'bg-green-50 text-[#25D366] border border-[#25D366]/30';
    case 'failed':
      return 'bg-red-50 text-red-600 border border-red-200';
    default:
      return 'bg-gray-50 text-gray-600 border border-gray-200';
  }
};

const Stage7PartnerServices: React.FC<Stage7Props> = ({
  personaId = 'default',
  language = 'ar',
  onStateChange,
}) => {
  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const t = UI_TEXT[language];
  const statusText = STATUS_MAP[language];

  const [orders, setOrders] = useState<PartnerOrder[]>(generateMockOrders());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [patientIdInput, setPatientIdInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
    document.body.style.fontFamily = "'Cairo', sans-serif";
  }, [language, dir]);

  useEffect(() => {
    if (onStateChange) {
      onStateChange({ stage: 7, ordersCount: orders.length, personaId });
    }
  }, [orders, personaId, onStateChange]);

  const filteredOrders = activeFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.partnerCode === activeFilter);

  const handleCreateOrder = useCallback(() => {
    if (!selectedPartner || !patientIdInput.trim()) return;

    const config = PARTNER_CONFIGS.find((p) => p.code === selectedPartner);
    if (!config) return;

    const newOrder: PartnerOrder = {
      id: `ORD-${selectedPartner}-${Date.now().toString(36).toUpperCase()}`,
      partnerCode: selectedPartner,
      partnerNameAr: config.nameAr,
      partnerNameEn: config.nameEn,
      serviceType: selectedPartner,
      status: 'pending',
      createdAt: new Date().toISOString(),
      patientId: patientIdInput.trim(),
      notes: notesInput.trim() || undefined,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setIsModalOpen(false);
    setSelectedPartner('');
    setPatientIdInput('');
    setNotesInput('');
  }, [selectedPartner, patientIdInput, notesInput]);

  const handleDispatch = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId && o.status === 'pending'
          ? { ...o, status: 'dispatched' as const }
          : o
      )
    );
  }, []);

  const handleCancel = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId && (o.status === 'pending' || o.status === 'dispatched')
          ? { ...o, status: 'failed' as const }
          : o
      )
    );
  }, []);

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      dir={dir}
      className="min-h-screen bg-gradient-to-br from-[#E6FAF7] via-white to-[#E6FAF7] font-['Cairo']"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Cairo', sans-serif; }
        .scrollbar-teal::-webkit-scrollbar { width: 6px; }
        .scrollbar-teal::-webkit-scrollbar-track { background: #E6FAF7; border-radius: 3px; }
        .scrollbar-teal::-webkit-scrollbar-thumb { background: #00C6AE; border-radius: 3px; }
        .scrollbar-teal::-webkit-scrollbar-thumb:hover { background: #007B6E; }
      `}</style>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#00C6AE]/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007B6E] to-[#00C6AE] flex items-center justify-center shadow-lg shadow-[#007B6E]/20">
                <span className="text-white font-bold text-sm">S7</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#007B6E] leading-tight">
                  {t.title}
                </h1>
                <p className="text-sm text-gray-500 font-medium">{t.subtitle}</p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#007B6E] to-[#00C6AE] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#007B6E]/30 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#00C6AE] focus:ring-offset-2"
              aria-label={t.createOrder}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.createOrder}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Partner Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PARTNER_CONFIGS.map((partner) => {
            const count = orders.filter((o) => o.partnerCode === partner.code).length;
            const isActive = activeFilter === partner.code;
            return (
              <button
                key={partner.code}
                onClick={() => setActiveFilter(isActive ? 'ALL' : partner.code)}
                className={`relative overflow-hidden rounded-2xl p-4 text-start transition-all duration-300 border-2 ${
                  isActive
                    ? 'border-[#007B6E] bg-white shadow-lg shadow-[#007B6E]/10 scale-[1.02]'
                    : 'border-transparent bg-white/70 hover:bg-white hover:border-[#00C6AE]/30 hover:shadow-md'
                }`}
                aria-pressed={isActive}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      isActive ? 'bg-[#E6FAF7]' : 'bg-gray-50'
                    }`}
                  >
                    {partner.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#007B6E] text-sm truncate">
                      {language === 'ar' ? partner.nameAr : partner.nameEn}
                    </p>
                    <p className="text-xs text-gray-500 font-medium truncate">
                      {language === 'ar' ? partner.typeAr : partner.typeEn}
                    </p>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isActive
                        ? 'bg-[#007B6E] text-white'
                        : 'bg-[#E6FAF7] text-[#007B6E]'
                    }`}
                  >
                    {count}
                  </div>
                </div>
                <div className="absolute top-0 end-0 w-16 h-16 bg-gradient-to-bl from-[#00C6AE]/5 to-transparent rounded-bl-full" />
              </button>
            );
          })}
        </div>

        {/* Filter Bar */}
        {activeFilter !== 'ALL' && (
          <div className="flex items-center gap-2 bg-[#E6FAF7] rounded-xl px-4 py-2 w-fit">
            <span className="text-sm font-medium text-[#007B6E]">
              {language === 'ar' ? 'تصفية حسب:' : 'Filtered by:'}{' '}
              {PARTNER_CONFIGS.find((p) => p.code === activeFilter)?.[language === 'ar' ? 'nameAr' : 'nameEn']}
            </span>
            <button
              onClick={() => setActiveFilter('ALL')}
              className="text-[#007B6E] hover:text-red-500 transition-colors"
              aria-label={language === 'ar' ? 'مسح التصفية' : 'Clear filter'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Orders Table / List */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#00C6AE]/10 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto scrollbar-teal">
            <table className="w-full" role="table">
              <thead>
                <tr className="bg-gradient-to-r from-[#007B6E] to-[#00C6AE] text-white">
                  <th className="px-4 py-3 text-start text-sm font-semibold whitespace-nowrap">{t.orderId}</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold whitespace-nowrap">{t.partner}</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold whitespace-nowrap">{t.service}</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold whitespace-nowrap">{t.patient}</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold whitespace-nowrap">{t.status}</th>
                  <th className="px-4 py-3 text-start text-sm font-semibold whitespace-nowrap">{t.date}</th>
                  <th className="px-4 py-3 text-end text-sm font-semibold whitespace-nowrap">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-[#E6FAF7] flex items-center justify-center">
                          <svg className="w-8 h-8 text-[#00C6AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">{t.noOrders}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const config = PARTNER_CONFIGS.find((p) => p.code === order.partnerCode);
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-[#E6FAF7]/50 transition-colors duration-150 group"
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono font-semibold text-[#007B6E]">
                            {order.id}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{config?.icon}</span>
                            <span className="text-sm font-semibold text-gray-800">
                              {language === 'ar' ? order.partnerNameAr : order.partnerNameEn}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {language === 'ar' ? config?.typeAr : config?.typeEn}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded-lg">
                            {order.patientId}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(order.status)}`}
                          >
                            {statusText[order.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleDispatch(order.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded-lg hover:bg-[#20BD5A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-1"
                                  aria-label={`${t.dispatch} ${order.id}`}
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                  {t.dispatch}
                                </button>
                                <button
                                  onClick={() => handleCancel(order.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
                                  aria-label={`${t.cancel} ${order.id}`}
                                >
                                  {t.cancel}
                                </button>
                              </>
                            )}
                            {order.status === 'dispatched' && (
                              <button
                                onClick={() => handleCancel(order.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
                                aria-label={`${t.cancel} ${order.id}`}
                              >
                                {t.cancel}
                              </button>
                            )}
                            <button
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E6FAF7] text-[#007B6E] text-xs font-semibold rounded-lg hover:bg-[#00C6AE]/20 transition-colors"
                              aria-label={`${t.view} ${order.id}`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {t.view}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#E6FAF7] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#00C6AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">{t.noOrders}</p>
                </div>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const config = PARTNER_CONFIGS.find((p) => p.code === order.partnerCode);
                return (
                  <div key={order.id} className="p-4 space-y-3 hover:bg-[#E6FAF7]/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{config?.icon}</span>
                        <div>
                          <p className="font-bold text-sm text-gray-800">
                            {language === 'ar' ? order.partnerNameAr : order.partnerNameEn}
                          </p>
                          <p className="text-xs font-mono text-[#007B6E]">{order.id}</p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${getStatusColor(order.status)}`}
                      >
                        {statusText[order.status]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400 text-xs block">{t.service}</span>
                        <span className="text-gray-700 font-medium">
                          {language === 'ar' ? config?.typeAr : config?.typeEn}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs block">{t.patient}</span>
                        <span className="text-gray-700 font-medium">{order.patientId}</span>
                      </div>
                    </div>

                    {order.notes && (
                      <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 leading-relaxed">
                        {order.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                      <div className="flex items-center gap-2">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleDispatch(order.id)}
                              className="px-3 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded-lg hover:bg-[#20BD5A] transition-colors"
                            >
                              {t.dispatch}
                            </button>
                            <button
                              onClick={() => handleCancel(order.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
                            >
                              {t.cancel}
                            </button>
                          </>
                        )}
                        {order.status === 'dispatched' && (
                          <button
                            onClick={() => handleCancel(order.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
                          >
                            {t.cancel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Create Order Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300"
            dir={dir}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#007B6E] to-[#00C6AE] px-6 py-4 flex items-center justify-between">
              <h2 id="modal-title" className="text-lg font-bold text-white">
                {t.createOrder}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                aria-label={t.close}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Partner Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.partner}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PARTNER_CONFIGS.map((partner) => (
                    <button
                      key={partner.code}
                      onClick={() => setSelectedPartner(partner.code)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-start ${
                        selectedPartner === partner.code
                          ? 'border-[#007B6E] bg-[#E6FAF7] shadow-sm'
                          : 'border-gray-100 hover:border-[#00C6AE]/50 hover:bg-gray-50'
                      }`}
                      type="button"
                    >
                      <span className="text-xl">{partner.icon}</span>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-bold truncate ${
                            selectedPartner === partner.code ? 'text-[#007B6E]' : 'text-gray-700'
                          }`}
                        >
                          {language === 'ar' ? partner.nameAr : partner.nameEn}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {partner.code}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient ID */}
              <div>
                <label
                  htmlFor="patient-id"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  {t.patient}
                </label>
                <input
                  id="patient-id"
                  type="text"
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل رقم المريض...' : 'Enter patient ID...'}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#007B6E] focus:ring-2 focus:ring-[#00C6AE]/20 outline-none transition-all text-sm font-medium placeholder:text-gray-400"
                  dir="ltr"
                />
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="order-notes"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  {t.notes}
                </label>
                <textarea
                  id="order-notes"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  rows={3}
                  placeholder={language === 'ar' ? 'ملاحظات إضافية...' : 'Additional notes...'}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#007B6E] focus:ring-2 focus:ring-[#00C6AE]/20 outline-none transition-all text-sm font-medium placeholder:text-gray-400 resize-none"
                  dir={dir}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                type="button"
              >
                {t.close}
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={!selectedPartner || !patientIdInput.trim()}
                className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#007B6E] to-[#00C6AE] rounded-xl hover:shadow-lg hover:shadow-[#007B6E]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none focus:outline-none focus:ring-2 focus:ring-[#00C6AE] focus:ring-offset-2"
                type="button"
              >
                {t.submit}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/966500000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 end-6 z-30 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 hover:shadow-xl transition-all duration-300"
        aria-label="WhatsApp Support"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
};

export default Stage7PartnerServices;