import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Building2,
  Clock,
  CheckCircle2,
  FileCheck2,
  Receipt,
  AlertCircle,
  FolderKanban,
  User,
  ShieldCheck,
} from 'lucide-react';
import { ClinicalCase, TenantHospital } from '../../../types';
import { getStageBadgeMeta } from '../../common/PortalCaseTrackerPanel';
import { CaseDetailsDrillDownModal } from '../../common/CaseDetailsDrillDownModal';

interface SuperAdminCasesTabProps {
  isRTL: boolean;
  cases: ClinicalCase[];
  tenants: TenantHospital[];
}

export const SuperAdminCasesTab: React.FC<SuperAdminCasesTabProps> = ({
  isRTL,
  cases = [],
  tenants = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedCaseForDrillDown, setSelectedCaseForDrillDown] = useState<ClinicalCase | null>(null);

  // Filter cases based on search and filters
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const q = searchQuery.trim().toLowerCase();
      const patientName = (c.patientName || c.patientNameAr || c.patientNameEn || '').toLowerCase();
      const caseNumber = (c.caseNumber || c.id || '').toLowerCase();
      const nationalId = (c.nationalIdMasked || '').toLowerCase();
      const diagnosis = (c.diagnosis || c.diagnosisAr || c.diagnosisEn || '').toLowerCase();

      const matchesSearch =
        !q ||
        patientName.includes(q) ||
        caseNumber.includes(q) ||
        nationalId.includes(q) ||
        diagnosis.includes(q);

      const matchesHospital =
        selectedHospital === 'ALL' ||
        (c.treatingDoctor?.hospital && c.treatingDoctor.hospital.toLowerCase().includes(selectedHospital.toLowerCase()));

      const matchesStage =
        selectedStage === 'ALL' ||
        (selectedStage === 'ACTIVE' && c.currentStage !== 'CLOSED') ||
        (selectedStage === 'CLOSED' && c.currentStage === 'CLOSED') ||
        c.currentStage === selectedStage;

      return matchesSearch && matchesHospital && matchesStage;
    });
  }, [cases, searchQuery, selectedHospital, selectedStage]);

  // Aggregated Metric counts
  const totalCasesCount = cases.length;
  const activeCasesCount = cases.filter((c) => c.currentStage !== 'CLOSED').length;
  const closedCasesCount = cases.filter((c) => c.currentStage === 'CLOSED').length;
  const totalRevenueSar = cases.reduce((acc, c) => acc + (c.pricing?.totalSar || (c.consultationType === 'video' ? 150 : 75)), 0);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isRTL ? 'إجمالي الحالات المسجلة' : 'Total Enrolled Cases'}
            </span>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <FolderKanban className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCasesCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isRTL ? 'عبر كافة المستشفيات الشريكة' : 'Across all partner healthcare centers'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isRTL ? 'الحالات النشطة قيد المتابعة' : 'Active In Pipeline'}
            </span>
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-teal-700">{activeCasesCount}</div>
          <p className="text-[11px] text-teal-600 font-semibold mt-1">
            {isRTL ? 'قيد الفرز، الاستشارة، أو المتابعة' : 'Under Triage, Consultant or Follow-Up'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isRTL ? 'الحالات المؤرشفة والمغلقة' : 'Closed & Archived'}
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700">{closedCasesCount}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {isRTL ? 'تم إصدار PDF 2 وإغلاقها نهائياً' : 'PDF 2 released with full closure'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isRTL ? 'إجمالي المحصل المفوتر (ZATCA)' : 'Total Billed (ZATCA)'}
            </span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalRevenueSar.toFixed(0)} SAR</div>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">
            {isRTL ? 'شامل ضريبة القيمة المضافة 15%' : 'Includes 15% VAT compliance'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3 rtl:right-3 rtl:left-auto" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'ابحث برقم الحالة، اسم المريض، الهوية...' : 'Search by Case ID, Patient Name, ID...'}
            className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007B6E] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Hospital Filter */}
          <select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007B6E] cursor-pointer"
          >
            <option value="ALL">{isRTL ? 'كافة المراكز والمستشفيات' : 'All Medical Centers'}</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.nameEn}>
                {isRTL ? t.nameAr : t.nameEn}
              </option>
            ))}
          </select>

          {/* Stage Filter */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007B6E] cursor-pointer"
          >
            <option value="ALL">{isRTL ? 'كافة المراحل السريرية' : 'All Stages'}</option>
            <option value="ACTIVE">{isRTL ? 'الحالات النشطة فقط' : 'Active Only'}</option>
            <option value="CLOSED">{isRTL ? 'الحالات المغلقة والمؤرشفة' : 'Closed & Archived'}</option>
            <option value="INTAKE_RECEIVED">{isRTL ? '1. استلام الطلب' : '1. Intake'}</option>
            <option value="NURSE_CHECK">{isRTL ? '2. فرز التمريض' : '2. Nurse Triage'}</option>
            <option value="DOCTOR_REVIEW">{isRTL ? '3. الطبيب السعودي' : '3. Saudi Doctor'}</option>
            <option value="AWAITING_PAYMENT">{isRTL ? '4. بانتظار السداد' : '4. Awaiting Payment'}</option>
            <option value="WITH_CONSULTANT">{isRTL ? '5. الاستشاري الدولي' : '5. Consultant'}</option>
            <option value="FOLLOW_UP_21_DAYS">{isRTL ? '8. متابعة 21 يوماً' : '8. 21-Day Follow-Up'}</option>
          </select>

          {(searchQuery || selectedHospital !== 'ALL' || selectedStage !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedHospital('ALL');
                setSelectedStage('ALL');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2 py-1"
            >
              {isRTL ? 'إعادة ضبط' : 'Reset'}
            </button>
          )}
        </div>
      </div>

      {/* Master Case Operations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {isRTL ? 'سجل الحالات والعمليات الشامل (Master Clinical Registry)' : 'Master Clinical Case Registry & Operations'}
            </h3>
            <p className="text-xs text-slate-500">
              {isRTL
                ? 'استعراض الحالات وحالتها الراهنة، مع إمكانية النقر والتعمق (Drill Down) لفحص التفاصيل والأختام السريرية.'
                : 'Full oversight of all clinical cases and their live status with deep drill-down investigation.'}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto font-mono">
            {filteredCases.length} {isRTL ? 'حالة مطابقة' : 'Cases Matched'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">{isRTL ? 'رقم الحالة / المريض' : 'Case / Patient'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'المركز الطبي الشريك' : 'Medical Center'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'التخصص والتشخيص' : 'Specialty & Diagnosis'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'الفريق الطبي' : 'Care Team'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'المرحلة والحالة الراهنة' : 'Current Stage & Status'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'الفوترة (ZATCA)' : 'ZATCA Invoice'}</th>
                <th className="py-3.5 px-4 text-center">{isRTL ? 'الإجراء والتفاصيل' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    {isRTL ? 'لا توجد حالات تطابق معايير البحث والفلترة المحددة' : 'No cases match the specified filter criteria'}
                  </td>
                </tr>
              )}
              {filteredCases.map((c) => {
                const stageMeta = getStageBadgeMeta(c.currentStage, isRTL);
                const patientName = isRTL ? c.patientNameAr || c.patientName : c.patientNameEn || c.patientName;
                const hospital = isRTL ? c.treatingDoctor?.hospital || 'مجمع الرعاية الطبية' : c.treatingDoctor?.hospital || 'Riyadh Care Medical Center';
                const doctorName = c.treatingDoctor?.name || 'د. عبدالله الشمري';
                const consultantName = c.consultant?.name || 'Dr. Pradeep Kumar';

                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCaseForDrillDown(c)}
                    className="hover:bg-teal-50/40 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {patientName}
                      </div>
                      <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                        <span>{c.caseNumber || c.id}</span>
                        <span>•</span>
                        <span>{c.nationalIdMasked || '10********'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{hospital}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-bold text-slate-800">
                        {isRTL ? c.specialtyAr || c.specialty : c.specialtyEn || c.specialty}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {isRTL ? c.diagnosisAr || c.diagnosis : c.diagnosisEn || c.diagnosis}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <div className="text-slate-800 font-medium">SA: {doctorName}</div>
                      <div className="text-slate-500 text-[11px]">IN: {consultantName}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${stageMeta.colorClass}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {stageMeta.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs font-bold text-slate-700">
                        {c.pricing?.invoiceNumber || 'INV-2026-LIVE'}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold">
                        {(c.pricing?.totalSar || 75).toFixed(0)} SAR (Paid)
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCaseForDrillDown(c);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#007B6E] hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'عرض التفاصيل' : 'Drill Down'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Details Drill Down Modal */}
      <CaseDetailsDrillDownModal
        isOpen={Boolean(selectedCaseForDrillDown)}
        onClose={() => setSelectedCaseForDrillDown(null)}
        caseItem={selectedCaseForDrillDown}
        lang={isRTL ? 'ar' : 'en'}
      />
    </div>
  );
};

export default SuperAdminCasesTab;
