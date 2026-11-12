import React, { useState } from 'react';
import { ClinicalCase, MedicalCenterInternalOrders } from '../../types';
import { 
  FlaskConical, 
  Pill, 
  CheckCircle2, 
  Clock, 
  Building2, 
  QrCode, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  cases?: ClinicalCase[];
  onSelectCase?: (caseId: string) => void;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  roleFilter?: 'L' | 'PH' | 'REC';
}

export const PartnerServicesView: React.FC<Props> = ({
  activeCase,
  cases = [],
  onSelectCase,
  onAdvanceStage,
  onUpdateCase,
  roleFilter,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'lab' | 'pharmacy' | 'reception'>(
    roleFilter === 'L' ? 'lab' : roleFilter === 'PH' ? 'pharmacy' : roleFilter === 'REC' ? 'reception' : 'all'
  );

  const internalOrders: MedicalCenterInternalOrders = activeCase.internalOrders || {
    medicalCenterId: 'mc-riyadh-01',
    medicalCenterName: 'مركز الرعاية التخصصية الطبي (الرياض)',
    lab: {
      ordered: true,
      tests: ['Troponin-I (Quantitative)', 'Complete Blood Count (CBC)', 'Renal Function Panel (eGFR)'],
      requisitionNumber: 'L01-REQ-8821',
      status: 'sample_collected',
      updatedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    },
    pharmacy: {
      ordered: true,
      medications: ['Rosuvastatin 20mg Once Daily', 'Aspirin (Cardiprin) 81mg Daily', 'Ramipril 5mg (SFDA Generic Substitute Allowed)'],
      prescriptionNumber: 'RX-SA-2026-904',
      status: 'verified',
      updatedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    },
    reception: {
      checkinCode: 'ALO-CHECKIN-4421',
      status: 'checked_in',
      checkedInAt: '10:15 AM',
      appointmentSlot: 'Today 11:30 AM (Room 204)',
    },
  };

  const handleUpdateLabStatus = (newStatus: 'ordered' | 'sample_collected' | 'results_uploaded') => {
    const updatedOrders: MedicalCenterInternalOrders = {
      ...internalOrders,
      lab: {
        ...internalOrders.lab,
        status: newStatus,
        updatedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      },
    };
    onUpdateCase({
      internalOrders: updatedOrders,
      partnerOrders: {
        ...(activeCase.partnerOrders || {
          lab: { test: 'Comprehensive Metabolic Panel', status: 'pending' },
          pharmacy: { meds: [], substituteAllowed: true, status: 'pending' },
          homeNurse: { area: '', visits: 0, status: 'scheduled' },
          physio: { sessions: 0, status: 'planned' },
        }),
        lab: {
          test: activeCase.partnerOrders?.lab?.test || 'Comprehensive Metabolic Panel',
          status: newStatus === 'results_uploaded' ? 'completed' : 'pending',
        },
      },
    });
  };

  const handleUpdatePharmacyStatus = (newStatus: 'ordered' | 'verified' | 'dispensed' | 'delivered') => {
    const updatedOrders: MedicalCenterInternalOrders = {
      ...internalOrders,
      pharmacy: {
        ...internalOrders.pharmacy,
        status: newStatus,
        updatedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      },
    };
    onUpdateCase({
      internalOrders: updatedOrders,
      partnerOrders: {
        ...(activeCase.partnerOrders || {
          lab: { test: 'Comprehensive Metabolic Panel', status: 'pending' },
          pharmacy: { meds: [], substituteAllowed: true, status: 'pending' },
          homeNurse: { area: '', visits: 0, status: 'scheduled' },
          physio: { sessions: 0, status: 'planned' },
        }),
        pharmacy: {
          meds: activeCase.partnerOrders?.pharmacy?.meds || [],
          substituteAllowed: activeCase.partnerOrders?.pharmacy?.substituteAllowed ?? true,
          status: newStatus === 'dispensed' || newStatus === 'delivered' ? 'ready' : 'pending',
        },
      },
    });
  };

  const handleUpdateReceptionStatus = (newStatus: 'scheduled' | 'checked_in' | 'completed') => {
    const updatedOrders: MedicalCenterInternalOrders = {
      ...internalOrders,
      reception: {
        ...internalOrders.reception,
        status: newStatus,
        checkedInAt: newStatus === 'checked_in' ? new Date().toLocaleTimeString('ar-SA') : internalOrders.reception.checkedInAt,
      },
    };
    onUpdateCase({ internalOrders: updatedOrders });
  };

  const handleDeliverReportAndActivate21Days = () => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 21);
    
    onUpdateCase({
      currentStage: 'FOLLOW_UP_21_DAYS',
      stage: 8,
      followUpExpiresAt: expiry.toISOString(),
      saudiEndorsement: activeCase.saudiEndorsement ? {
        ...activeCase.saudiEndorsement,
        releasedToPatient: true,
      } : undefined,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans" dir="rtl">
      {/* Multi-Case Facility Queue Switcher (Clean Horizontal Scroll) */}
      {cases && cases.length > 1 && (
        <div className="card-clinical p-4 bg-slate-900 border border-teal-500/30 text-white rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-300">
              قائمة الحالات السريرية للمركز الطبي ({cases.filter((c) => (c.stage && c.stage > 1) || (c.symptoms && c.symptoms.trim().length > 0)).length} حالات)
            </span>
            <span className="text-[11px] text-slate-400">
              انقر لاختيار الحالة ومتابعة خدماتها
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {cases
              .filter((c) => (c.stage && c.stage > 1) || (c.symptoms && c.symptoms.trim().length > 0))
              .map((c) => {
                const isSelected = c.id === activeCase.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCase?.(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-400 shadow'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-teal-500'
                    }`}
                  >
                    <span className="font-mono">{c.caseNumber || c.id}</span>
                    <span>·</span>
                    <span className="max-w-[120px] truncate">{c.patientNameAr || c.patientName}</span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-teal-500/30 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-400 bg-teal-950/80 border border-teal-700/60 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>المرحلة 6: طوابير الخدمات الداخلية للمركز الطبي (In-House Facility Hub)</span>
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
              {internalOrders.medicalCenterName}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            تنفيذ الأوامر السريرية للحالة: <span className="font-mono text-teal-300">{activeCase.caseNumber}</span>
          </h2>
          <p className="text-sm text-slate-400">
            متابعة إنجاز تحاليل المختبر الداخلي، صرف الأدوية بالصيدلية الداخلية، واستقبال المراجع بالعيادة وفق معايير SLA المعتمدة
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['all', 'lab', 'pharmacy', 'reception'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === tab
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'all' && 'الكل'}
              {tab === 'lab' && 'المختبر الداخلي'}
              {tab === 'pharmacy' && 'الصيدلية الداخلية'}
              {tab === 'reception' && 'الاستقبال و SLA'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. In-House Facility Lab (L01) */}
        {(activeTab === 'all' || activeTab === 'lab') && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">المختبر الداخلي (In-House Lab)</h3>
                    <span className="text-[11px] text-slate-400 font-mono">L01 • {internalOrders.lab.requisitionNumber}</span>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  internalOrders.lab.status === 'results_uploaded'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : internalOrders.lab.status === 'sample_collected'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {internalOrders.lab.status === 'results_uploaded' ? 'النتائج معتمدة ✓' : internalOrders.lab.status === 'sample_collected' ? 'تم سحب العينة 🧪' : 'طلب جديد'}
                </span>
              </div>

              {/* Tests Checklist */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block">الفحوصات المطلوبة:</span>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {internalOrders.lab.tests.map((test, idx) => (
                    <li key={idx} className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="font-medium">{test}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
                <span>آخر تحديث: {internalOrders.lab.updatedAt || 'قبل دقيقة'}</span>
                <span className="text-emerald-400 font-semibold">مختبر المركز المركزي</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              {internalOrders.lab.status !== 'results_uploaded' ? (
                <>
                  {internalOrders.lab.status === 'ordered' && (
                    <button
                      onClick={() => handleUpdateLabStatus('sample_collected')}
                      className="w-full bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow"
                    >
                      تأكيد سحب العينات المخبرية (Sample Collected)
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateLabStatus('results_uploaded')}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اعتماد ورفع النتائج للملف الطبي (Upload Results)</span>
                  </button>
                </>
              ) : (
                <div className="bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-xl text-center text-xs text-emerald-300 font-bold">
                  ✓ تم دمج النتائج المخبرية في ملف الحالة
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. In-House Facility Pharmacy (H01) */}
        {(activeTab === 'all' || activeTab === 'pharmacy') && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-400">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">الصيدلية الداخلية (Facility Pharmacy)</h3>
                    <span className="text-[11px] text-slate-400 font-mono">H01 • {internalOrders.pharmacy.prescriptionNumber}</span>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  internalOrders.pharmacy.status === 'dispensed' || internalOrders.pharmacy.status === 'delivered'
                    ? 'bg-sky-950 text-sky-400 border border-sky-800'
                    : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                }`}>
                  {internalOrders.pharmacy.status === 'dispensed' ? 'جاهز للتسليم 📦' : 'تم التحقق ✓'}
                </span>
              </div>

              {/* Medications List */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-400">الأدوية المعتمدة:</span>
                  <span className="text-teal-400 font-mono text-[10px]">SFDA Verified</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {internalOrders.pharmacy.medications.map((med, idx) => (
                    <li key={idx} className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 text-xs font-mono">
                      {med}
                    </li>
                  ))}
                </ul>
                <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center gap-2 text-[11px] text-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>بدائل الأدوية الجنيسة المكافئة معتمدة نظاماً (X20)</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
                <span>آخر تحديث: {internalOrders.pharmacy.updatedAt || 'قبل دقيقة'}</span>
                <span className="text-sky-400 font-semibold">صيدلية المركز الداخلية</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              {internalOrders.pharmacy.status !== 'dispensed' ? (
                <button
                  onClick={() => handleUpdatePharmacyStatus('dispensed')}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد التحضير والصرف للمريض (Dispense Rx)</span>
                </button>
              ) : (
                <div className="bg-sky-950/40 border border-sky-800/50 p-2.5 rounded-xl text-center text-xs text-sky-300 font-bold">
                  ✓ تم تجهيز الأدوية وصرفها للمراجع
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Reception Desk & SLA SLA01 */}
        {(activeTab === 'all' || activeTab === 'reception') && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-400">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">الاستقبال وحجز المواعيد (Reception SLA)</h3>
                    <span className="text-[11px] text-slate-400 font-mono">{internalOrders.reception.checkinCode}</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-950 text-purple-400 border border-purple-800">
                  {internalOrders.reception.status === 'completed' ? 'اكتملت الزيارة' : 'تم التحضير'}
                </span>
              </div>

              {/* SLA & Room Card */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">موعد الاستشارة الحضورية:</span>
                  <span className="font-bold text-slate-200">{internalOrders.reception.appointmentSlot}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">زمن وصول المريض:</span>
                  <span className="font-mono text-purple-300">{internalOrders.reception.checkedInAt}</span>
                </div>
                <div className="p-2.5 bg-slate-900/90 rounded-lg border border-purple-900/40 flex items-center gap-2 text-[11px] text-slate-300">
                  <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>مؤشر SLA: وصول الحالة وغرفة الفحص جاهزة في الموعد المحدد ✓</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
                <span>تأكيد الموعد: آلي عبر الرسائل</span>
                <span className="text-purple-400 font-semibold">بوابة المركز</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              {internalOrders.reception.status !== 'completed' ? (
                <button
                  onClick={() => handleUpdateReceptionStatus('completed')}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد اكتمال الزيارة والاستقبال (Check-in Done)</span>
                </button>
              ) : (
                <div className="bg-purple-950/40 border border-purple-800/50 p-2.5 rounded-xl text-center text-xs text-purple-300 font-bold">
                  ✓ تم إنهاء إجراءات الاستقبال الميداني
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phase 6 Final Milestone Gate: Deliver Endorsed Report & Activate 21-Day Window (D13) */}
      {(!roleFilter || roleFilter === 'REC') && (
        <div className="bg-gradient-to-l from-slate-900 via-teal-950/30 to-slate-900 border-2 border-teal-500/50 p-6 rounded-2xl shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                  D13 • الإجراء الختامي للمرحلة 6
                </span>
                <span className="text-xs text-slate-300 font-semibold">تسليم التقرير السريري المعتمد وتفعيل قناة الـ 21 يوماً</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                اعتماد إنجاز طوابير المركز ونقل الحالة لنافذة المتابعة الطبية (Follow-Up 21 Days)
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                عند الضغط، سيتم إشعار المريض رسميًا بتوفر التقرير النهائي المعتمد بترخيص الهيئة وتفعيل قناة التواصل السريري المباشرة لمدة 21 يوماً للإجابة على أية استفسارات متابعة.
              </p>
            </div>

            <button
              onClick={handleDeliverReportAndActivate21Days}
              className="w-full md:w-auto bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2.5 text-sm shrink-0"
            >
              <MessageSquare className="w-5 h-5" />
              <span>تسليم التقرير وتفعيل متابعة الـ 21 يوماً</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
