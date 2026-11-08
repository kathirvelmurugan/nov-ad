import React from 'react';
import { ClinicalCase } from '../../types';
import { Stethoscope, HelpCircle, Check, Timer, UserCheck, ShieldCheck, FileCheck2, ArrowRight } from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  lang?: 'ar' | 'en';
}

export const DoctorReviewView: React.FC<Props> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';

  const CONSULTANT_NETWORK = [
    { name: 'Dr. Arjun Mehta', center: 'KIMS Heart Institute', city: 'Hyderabad, India' },
    { name: 'Dr. Suresh Rao', center: 'Apollo Hospitals', city: 'Chennai, India' },
    { name: 'Dr. Rajesh Deshmukh', center: 'Fortis Memorial Research Institute', city: 'Delhi, India' },
    { name: 'Dr. Alok Sharma', center: 'NIMHANS / Manipal', city: 'Bangalore, India' },
    { name: 'Dr. Priya Ramachandran', center: 'Tata Memorial / Apollo Cancer Center', city: 'Mumbai, India' },
  ];

  const handleQuestionChange = (index: 0 | 1 | 2, value: string) => {
    const currentQuestions = [...activeCase.treatingDoctor.focusQuestions] as [string, string, string];
    currentQuestions[index] = value;
    onUpdateCase({
      treatingDoctor: {
        ...activeCase.treatingDoctor,
        focusQuestions: currentQuestions,
      },
    });
  };

  const questions = isAr 
    ? activeCase.treatingDoctor.focusQuestions
    : (activeCase.treatingDoctor.focusQuestionsEn || activeCase.treatingDoctor.focusQuestions);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Doctor Header & SLA Warning */}
      <div className="card-clinical p-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-alo-teal">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-teal-200">
              D01 · {isAr ? 'الطبيب السعودي المعالج' : 'Saudi Treating Doctor'}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {isAr ? 'المستشفى الشريك:' : 'Partner Hospital:'} {activeCase.treatingDoctor.hospital}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs font-mono font-bold text-alo-teal">
              {activeCase.caseNumber}
            </span>
          </div>
          <h2 className="text-2xl font-black text-alo-navy dark:text-slate-100 mt-1">
            {isAr ? activeCase.treatingDoctor.name : (activeCase.treatingDoctor.name || 'Treating Doctor, MD')}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-alo-teal font-mono text-xs font-bold border border-teal-200 dark:border-teal-800">
              <ShieldCheck className="w-3.5 h-3.5 text-alo-teal" />
              {isAr
                ? `المريض المسجل (محلياً): ${activeCase.patientName || activeCase.patientNameAr || 'سالم العامري'}`
                : `Domestic Patient: ${activeCase.patientName || activeCase.patientNameEn || 'Salem Al-Ameri'}`}
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {isAr ? `الهوية / الإقامة: ${activeCase.nationalIdMasked || '1089345210'}` : `ID / Iqama: ${activeCase.nationalIdMasked || '1089345210'}`}
            </span>
            <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/30 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              {isAr ? `رمز العبور للهند: ${activeCase.egressToken || 'ALO-KSA-9482'}` : `Egress Token: ${activeCase.egressToken || 'ALO-KSA-9482'}`}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? (activeCase.specialtyAr || activeCase.specialty) : (activeCase.specialtyEn || activeCase.specialty)} · {activeCase.treatingDoctor.city}
            </span>
          </div>
        </div>

        {/* 24-Hour SLA Badge */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 p-3 rounded-xl flex items-center gap-3 shadow-sm">
          <Timer className="w-5 h-5 text-amber-600 animate-pulse shrink-0" />
          <div>
            <span className="text-[10px] text-amber-800 dark:text-amber-300 block font-bold">
              {isAr ? 'مهلة المراجعة السريرية (SLA X09):' : 'Clinical SLA Review Window:'}
            </span>
            <span className="text-xs font-mono font-black text-amber-900 dark:text-amber-200">
              23:42:15 {isAr ? 'متبقية' : 'Remaining'}
            </span>
          </div>
        </div>
      </div>

      {/* D02-D04: Diagnostic Scans & Lab Triage Review */}
      <div className="card-clinical p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-teal-200">
              D02–D04 · {isAr ? 'تدقيق الفحوصات والأشعة والمؤشرات' : 'Diagnostic Scans & Lab Inspection'}
            </span>
            <FileCheck2 className="w-4 h-4 text-alo-teal" />
            <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
              {isAr ? 'الملف التشخيصي المرفوع من التمريض:' : 'Clinical Dossier & Scans:'}
            </h3>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
            ✓ {isAr ? 'فحوصات مكتملة ومدققة' : 'Verified Clinical Scans'}
          </span>
        </div>

        <p className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
          {isAr ? (activeCase.diagnosisAr || activeCase.diagnosis) : (activeCase.diagnosisEn || activeCase.diagnosis)}
        </p>
      </div>

      {/* Review Details & Consultant Selection */}
      <div className="card-clinical p-6 space-y-6">
        {/* D05-D06: Pick the Indian consultant (recipient) + confirm call type */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-teal-200">
              D05–D06 · {isAr ? 'اختيار الاستشاري ونمط الاستشارة' : 'Specialist & Modality Selection'}
            </span>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {isAr ? 'اختر الاستشاري الهندي (المستقبل):' : 'Pick the Indian consultant (recipient):'}
            </label>
            <select
              value={activeCase.consultant.name}
              onChange={(e) => {
                const picked = CONSULTANT_NETWORK.find((c) => c.name === e.target.value);
                if (picked) onUpdateCase({ consultant: { ...activeCase.consultant, ...picked } });
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-alo-teal outline-none shadow-sm"
            >
              {CONSULTANT_NETWORK.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} — {c.center} · {c.city}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              {activeCase.consultant.center} · {activeCase.consultant.city}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isAr ? 'تأكيد نوع الاستشارة:' : 'Confirm call type:'}
            </span>
            <button
              type="button"
              onClick={() => onUpdateCase({ consultationType: 'written' })}
              className={`text-xs px-3 py-1 rounded-lg font-extrabold border transition-colors ${
                activeCase.consultationType === 'written'
                  ? 'bg-alo-mint border-teal-300 text-alo-teal'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {isAr ? 'رأي مكتوب فقط' : 'Written opinion only'}
            </button>
            <button
              type="button"
              onClick={() => onUpdateCase({ consultationType: 'video' })}
              className={`text-xs px-3 py-1 rounded-lg font-extrabold border transition-colors ${
                activeCase.consultationType === 'video'
                  ? 'bg-alo-mint border-teal-300 text-alo-teal'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {isAr ? 'مرئي + رأي مكتوب' : 'Video + written opinion'}
            </button>
          </div>
        </div>

        {/* 3 Mandatory Focus Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                D07 · {isAr ? 'الأسئلة التوجيهية' : '3 Focus Questions'}
              </span>
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
                {isAr ? 'الأسئلة السريرية التوجيهية الإلزامية (3 Focus Questions):' : 'Mandatory Clinical Directives for International Specialist:'}
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              {isAr ? 'يجب صياغة 3 أسئلة دقيقة' : '3 precise clinical questions'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isAr ? 'السؤال الأول (خطة التدخل الجراحي أو العلاجي التخصصي):' : 'Question 1 (Primary Surgical or Interventional Strategy):'}
            </label>
            <textarea
              rows={2}
              value={questions[0]}
              onChange={(e) => handleQuestionChange(0, e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-alo-teal outline-none leading-relaxed shadow-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isAr ? 'السؤال الثاني (تقييم المخاطر والمضاعفات المحتملة):' : 'Question 2 (Risk Stratification & Complication Mitigation):'}
            </label>
            <textarea
              rows={2}
              value={questions[1]}
              onChange={(e) => handleQuestionChange(1, e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-alo-teal outline-none leading-relaxed shadow-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isAr ? 'السؤال الثالث (بروتوكول العلاج الدوائي والتأهيل والمتابعة):' : 'Question 3 (Post-Procedure Protocol & Long-term Rehabilitation):'}
            </label>
            <textarea
              rows={2}
              value={questions[2]}
              onChange={(e) => handleQuestionChange(2, e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-alo-teal outline-none leading-relaxed shadow-sm font-medium"
            />
          </div>
        </div>

        {/* D08: Concurrent In-House Facility Lab & Pharmacy Orders */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-teal-200 dark:border-teal-900/40 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="bg-alo-mint text-alo-teal font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-teal-200">
                D08 · {isAr ? 'الفحوصات والوصفات الطبية الداخلية الفورية' : 'Concurrent In-House Facility Orders'}
              </span>
              <Stethoscope className="w-4 h-4 text-alo-teal" />
              <h3 className="text-sm font-extrabold text-alo-navy dark:text-slate-100">
                {isAr ? 'أوامر مختبر وصيدلية المجمع الطبي (بالتزامن مع الاستشارة الدولية):' : 'Medical Center In-House Lab & Pharmacy Orders (Concurrent):'}
              </h3>
            </div>
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded border border-teal-200">
              {activeCase.treatingDoctor.hospital}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {isAr
              ? '💡 يمكنك إصدار فحوصات تمهيدية أو وصفات مسكنة فورية لمختبر وصيدلية مجمعك الطبي أثناء فترة مراجعة الاستشاري الدولي دون تأخير علاج المريض.'
              : '💡 Trigger immediate baseline lab requisitions or symptomatic prescriptions within your facility while the international consultation is underway.'}
          </p>

          {/* Facility Lab Requisition */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeCase.partnerOrders.lab.status !== 'pending' || activeCase.internalOrders?.lab.ordered}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onUpdateCase({
                      partnerOrders: {
                        ...activeCase.partnerOrders,
                        lab: {
                          test: checked ? 'تحليل تروبونين وفحوصات تمهيدية' : 'None',
                          status: checked ? 'collected' : 'pending'
                        }
                      },
                      internalOrders: {
                        medicalCenterId: 'mc_riyadh_care',
                        medicalCenterName: activeCase.treatingDoctor.hospital,
                        lab: {
                          ordered: checked,
                          tests: checked ? ['Troponin-I', 'CBC', 'Renal Function'] : [],
                          status: checked ? 'ordered' : 'none',
                        },
                        pharmacy: activeCase.internalOrders?.pharmacy || {
                          ordered: false,
                          medications: [],
                          status: 'none',
                        },
                        reception: activeCase.internalOrders?.reception || {
                          checkinCode: 'ALO-RC-8812',
                          status: 'scheduled',
                        }
                      }
                    });
                  }}
                  className="rounded text-alo-teal focus:ring-alo-teal w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isAr ? 'طلب فحوصات مخبرية تمهيدية داخلية بمختبر المجمع (Facility Lab Requisition)' : 'Order Baseline Labs at Facility Laboratory'}
                </span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {isAr ? 'مختبر المجمع المعتمد' : 'In-House Lab Unit'}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {['تروبونين-I (Troponin)', 'تحليل دم شامل (CBC)', 'وظائف الكلى (Renal)', 'إنزيمات الكبد (LFT)'].map((test) => (
                <span key={test} className="text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-900">
                  ✓ {test}
                </span>
              ))}
            </div>
          </div>

          {/* Facility Pharmacy Prescription */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeCase.partnerOrders.pharmacy.meds.length > 0 || activeCase.internalOrders?.pharmacy.ordered}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onUpdateCase({
                      partnerOrders: {
                        ...activeCase.partnerOrders,
                        pharmacy: {
                          meds: checked ? ['Aspirin 81mg', 'Atorvastatin 40mg', 'Metoprolol 25mg'] : [],
                          substituteAllowed: true,
                          status: checked ? 'ready' : 'pending'
                        }
                      },
                      internalOrders: {
                        medicalCenterId: 'mc_riyadh_care',
                        medicalCenterName: activeCase.treatingDoctor.hospital,
                        lab: activeCase.internalOrders?.lab || {
                          ordered: false,
                          tests: [],
                          status: 'none',
                        },
                        pharmacy: {
                          ordered: checked,
                          medications: checked ? ['Aspirin 81mg', 'Atorvastatin 40mg'] : [],
                          status: checked ? 'ordered' : 'none',
                        },
                        reception: activeCase.internalOrders?.reception || {
                          checkinCode: 'ALO-RC-8812',
                          status: 'scheduled',
                        }
                      }
                    });
                  }}
                  className="rounded text-alo-teal focus:ring-alo-teal w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isAr ? 'إصدار وصفة أدوية مسكنة / علاجية فورية عبر صيدلية المجمع (Facility Outpatient Pharmacy)' : 'Issue Immediate Symptomatic Rx via Facility Pharmacy'}
                </span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {isAr ? 'صيدلية المجمع المعتمدة' : 'In-House Pharmacy Unit'}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {['أسبرين 81 ملغ (Aspirin)', 'أتورفاستاتين 40 ملغ (Atorvastatin)', 'ميتوبرولول 25 ملغ (Metoprolol)'].map((med) => (
                <span key={med} className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900">
                  💊 {med}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Advance Action */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onAdvanceStage}
            className="w-full sm:w-auto bg-gradient-to-r from-alo-teal to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-extrabold py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isAr ? 'D10 · اعتماد الإحالة وإرسال الملف لمنسق رعاية ألو (C01)' : 'D10 · Approve Referral & Route to ALO Coordinator (C01)'}</span>
            <span>{isAr ? '←' : '→'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
