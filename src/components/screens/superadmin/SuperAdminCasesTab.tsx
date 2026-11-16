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
  Trash2,
  AlertTriangle,
  UserCog,
} from 'lucide-react';
import { ClinicalCase, TenantHospital } from '../../../types';
import { STAGE_ORDER_META } from '../../../config/stageMeta';
import { priceTierForType } from '../../../config/platformConfig';
import { getStageBadgeMeta } from '../../common/PortalCaseTrackerPanel';
import { CaseDetailsDrillDownModal } from '../../common/CaseDetailsDrillDownModal';
import { apiClient } from '../../../services/apiClient';
import { STORAGE_KEY, ACTIVE_CASE_KEY } from '../../../hooks/workflowConstants';

interface SuperAdminCasesTabProps {
  isRTL: boolean;
  cases: ClinicalCase[];
  tenants: TenantHospital[];
  onCaseDeleted?: (caseId: string) => void;
  onAllCasesDeleted?: () => void;
  focusCaseId?: string | null;
  onFocusCaseHandled?: () => void;
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────
interface DeleteConfirmModalProps {
  isOpen: boolean;
  isRTL: boolean;
  mode: 'single' | 'purge-all';
  caseItem?: ClinicalCase | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  isRTL,
  mode,
  caseItem,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  if (!isOpen) return null;

  const isPurgeAll = mode === 'purge-all';
  const patientName = caseItem
    ? (isRTL ? caseItem.patientNameAr || caseItem.patientName : caseItem.patientNameEn || caseItem.patientName)
    : '';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isPurgeAll ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertTriangle className={`w-7 h-7 ${isPurgeAll ? 'text-red-600' : 'text-amber-600'}`} />
          </div>
        </div>

        {/* Title */}
        <h3 id="delete-confirm-title" className="text-center text-lg font-black text-slate-900 mb-2">
          {isPurgeAll
            ? (isRTL ? 'حذف جميع الحالات السريرية' : 'Delete All Clinical Cases')
            : (isRTL ? 'تأكيد حذف الحالة' : 'Confirm Case Deletion')}
        </h3>

        {/* Body */}
        <div className="text-center text-sm text-slate-600 space-y-2 mb-6">
          {isPurgeAll ? (
            <>
              <p className="font-semibold text-red-700">
                {isRTL
                  ? 'سيتم حذف جميع الحالات من قاعدة البيانات والذاكرة والمتصفح.'
                  : 'All cases will be permanently removed from the database, server memory, and browser storage.'}
              </p>
              <p className="text-xs text-slate-500">
                {isRTL ? 'هذا الإجراء لا يمكن التراجع عنه.' : 'This action cannot be undone.'}
              </p>
            </>
          ) : (
            <>
              <p>
                {isRTL ? 'هل تريد حذف حالة المريض:' : 'Are you sure you want to delete the case for:'}
              </p>
              <p className="font-black text-slate-900 text-base">{patientName || (isRTL ? 'مريض غير معروف' : 'Unknown Patient')}</p>
              <p className="font-mono text-xs text-slate-500">{caseItem?.caseNumber || caseItem?.id}</p>
              <p className="text-xs text-slate-500 mt-1">
                {isRTL ? 'سيتم حذف هذه الحالة بشكل نهائي من جميع الأنظمة.' : 'This case will be permanently deleted from all systems.'}
              </p>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all disabled:opacity-50"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
              isPurgeAll
                ? 'bg-red-600 hover:bg-red-700 shadow-red-200 shadow-md'
                : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {isDeleting ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isDeleting
              ? (isRTL ? 'جارٍ الحذف...' : 'Deleting...')
              : isPurgeAll
                ? (isRTL ? 'حذف الكل نهائياً' : 'Delete All Permanently')
                : (isRTL ? 'نعم، احذف الحالة' : 'Yes, Delete Case')}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SuperAdminCasesTab: React.FC<SuperAdminCasesTabProps> = ({
  isRTL,
  cases: initialCases = [],
  tenants = [],
  onCaseDeleted,
  onAllCasesDeleted,
  focusCaseId,
  onFocusCaseHandled,
}) => {
  const [localCases, setLocalCases] = useState<ClinicalCase[]>(initialCases);
  const cases = localCases;

  // Sync when parent prop changes (e.g. initial load)
  React.useEffect(() => { setLocalCases(initialCases); }, [initialCases]);

  // Auto-open drill-down when focusCaseId is set from header widget
  React.useEffect(() => {
    if (focusCaseId) {
      const target = cases.find((c) => c.id === focusCaseId);
      if (target) {
        setSelectedCaseForDrillDown(target);
        onFocusCaseHandled?.();
      }
    }
    // Only trigger when focusCaseId changes to a truthy value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusCaseId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedCaseForDrillDown, setSelectedCaseForDrillDown] = useState<ClinicalCase | null>(null);

  // Delete state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; mode: 'single' | 'purge-all'; caseItem?: ClinicalCase | null }>({
    open: false,
    mode: 'single',
    caseItem: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Reassignment state
  const [reassignModal, setReassignModal] = useState<{
    open: boolean;
    caseItem: ClinicalCase | null;
    selectedDoctor: string;
    selectedConsultant: string;
  }>({
    open: false,
    caseItem: null,
    selectedDoctor: '',
    selectedConsultant: '',
  });

  const handleSaveReassignment = async () => {
    if (!reassignModal.caseItem) return;
    const targetCase = reassignModal.caseItem;
    const updatedCase: ClinicalCase = {
      ...targetCase,
      treatingDoctor: {
        hospital: targetCase.treatingDoctor?.hospital || 'مستشفى الشريك المعتمد',
        city: targetCase.treatingDoctor?.city || 'الرياض',
        focusQuestions: targetCase.treatingDoctor?.focusQuestions || ['سؤال سريري 1', 'سؤال سريري 2', 'سؤال سريري 3'],
        ...(targetCase.treatingDoctor || {}),
        name: reassignModal.selectedDoctor || targetCase.treatingDoctor?.name || 'د. سارة العتيبي',
      },
      consultant: {
        center: targetCase.consultant?.center || 'Apollo Hospitals',
        city: targetCase.consultant?.city || 'Bengaluru, India',
        ...(targetCase.consultant || {}),
        name: reassignModal.selectedConsultant || targetCase.consultant?.name || 'Dr. Pradeep Kumar',
      },
    };

    setLocalCases((prev) => prev.map((c) => (c.id === targetCase.id ? updatedCase : c)));
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const arr = JSON.parse(stored) as ClinicalCase[];
        const updated = arr.map((x) => (x.id === targetCase.id ? updatedCase : x));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {}

    await apiClient.saveCase(updatedCase).catch(() => {});
    setReassignModal({ open: false, caseItem: null, selectedDoctor: '', selectedConsultant: '' });
  };

  // ── Delete handlers ──────────────────────────────────────────────────────
  const openDeleteSingle = (e: React.MouseEvent, c: ClinicalCase) => {
    e.stopPropagation();
    setDeleteModal({ open: true, mode: 'single', caseItem: c });
  };

  const openPurgeAll = () => {
    setDeleteModal({ open: true, mode: 'purge-all', caseItem: null });
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      if (deleteModal.mode === 'purge-all') {
        // Backend delete all
        await apiClient.purgeAllCases();
        // Clear localStorage
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(ACTIVE_CASE_KEY);
          localStorage.removeItem('alo_patient_subview_v3.0');
        } catch {}
        setLocalCases([]);
        onAllCasesDeleted?.();
      } else if (deleteModal.mode === 'single' && deleteModal.caseItem) {
        const caseId = deleteModal.caseItem.id;
        // Backend delete single
        try {
          await fetch(`/api/cases/${encodeURIComponent(caseId)}`, { method: 'DELETE' });
        } catch {}
        // Remove from localStorage cases array
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const arr = JSON.parse(stored) as ClinicalCase[];
            const updated = arr.filter((x) => x.id !== caseId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          }
        } catch {}
        setLocalCases((prev) => prev.filter((x) => x.id !== caseId));
        onCaseDeleted?.(caseId);
      }
    } catch (err) {
      console.error('[SuperAdmin] Delete error:', err);
    } finally {
      setIsDeleting(false);
      setDeleteModal({ open: false, mode: 'single', caseItem: null });
    }
  };

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
        (c.treatingDoctor?.hospital && (
          c.treatingDoctor.hospital.toLowerCase().includes(selectedHospital.toLowerCase()) ||
          tenants.some((t) =>
            t.nameEn === selectedHospital &&
            (t.nameAr.toLowerCase().includes(c.treatingDoctor!.hospital.toLowerCase()) ||
             c.treatingDoctor!.hospital.toLowerCase().includes(t.nameAr.toLowerCase()))
          )
        ));

      const matchesStage =
        selectedStage === 'ALL' ||
        (selectedStage === 'ACTIVE' && c.currentStage !== 'CLOSED') ||
        (selectedStage === 'CLOSED' && c.currentStage === 'CLOSED') ||
        c.currentStage === selectedStage;

      return matchesSearch && matchesHospital && matchesStage;
    });
  }, [cases, searchQuery, selectedHospital, selectedStage, tenants]);

  // Aggregated Metric counts
  const totalCasesCount = cases.length;
  const activeCasesCount = cases.filter((c) => c.currentStage !== 'CLOSED').length;
  const closedCasesCount = cases.filter((c) => c.currentStage === 'CLOSED').length;
  const totalRevenueSar = cases.reduce((acc, c) => acc + (c.pricing?.totalSar || priceTierForType(c.consultationType || 'written').totalSar), 0);

  // ─── Stage Pipeline Config — derived from single source ───────────────────
  const STAGE_CONFIG = useMemo(() => STAGE_ORDER_META.map((m) => ({
    key: m.stage, num: m.num, labelAr: m.shortLabelAr, labelEn: m.shortLabelEn,
    color: m.color, bg: m.bg, border: m.border,
  })), []);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STAGE_CONFIG.forEach((s) => { counts[s.key] = 0; });
    cases.forEach((c) => {
      if (counts[c.currentStage] !== undefined) counts[c.currentStage]++;
    });
    return counts;
  }, [cases, STAGE_CONFIG]);

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
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Row 1: Search + Hospital Filter + Actions */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
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
                  {t.nameEn}
                </option>
              ))}
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

            {cases.length > 0 && (
              <button
                type="button"
                onClick={openPurgeAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-700 border border-red-200 text-xs font-bold transition-all shadow-xs ml-2"
                title={isRTL ? 'حذف جميع الحالات' : 'Delete All Cases'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRTL ? 'حذف الكل' : 'Purge All'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Stage Pipeline Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* ALL Pill */}
          <button
            type="button"
            onClick={() => setSelectedStage('ALL')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 border ${
              selectedStage === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            <span className="text-[10px]">●</span>
            <span>{isRTL ? 'الكل' : 'ALL'}</span>
            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black ${
              selectedStage === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {totalCasesCount}
            </span>
          </button>

          {/* Divider */}
          <span className="w-[1px] h-6 bg-slate-200 mx-1" />

          {/* Stage Pills */}
          {STAGE_CONFIG.map((stage) => {
            const isActive = selectedStage === stage.key;
            const count = stageCounts[stage.key] || 0;
            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => setSelectedStage(isActive ? 'ALL' : stage.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 border ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                }`}
                style={isActive ? { backgroundColor: stage.color, borderColor: stage.color } : {}}
                title={isRTL ? `${stage.labelAr} (${count})` : `${stage.labelEn} (${count})`}
              >
                <span className="text-[10px] opacity-90">{stage.num}</span>
                <span>{isRTL ? stage.labelAr : stage.labelEn}</span>
                <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Mini Pipeline Flow */}
        <div className="flex items-center gap-0.5 pt-1">
          {STAGE_CONFIG.map((stage, idx) => {
            const count = stageCounts[stage.key] || 0;
            const isActive = selectedStage === stage.key || selectedStage === 'ALL';
            const isFirst = idx === 0;
            const isLast = idx === STAGE_CONFIG.length - 1;
            return (
              <React.Fragment key={stage.key}>
                {/* Connector (except first) */}
                {!isFirst && (
                  <div className="flex-1 h-0.5 min-w-[12px]" style={{ backgroundColor: isActive ? stage.color : '#E2E8F0' }} />
                )}
                {/* Stage node */}
                <button
                  type="button"
                  onClick={() => setSelectedStage(selectedStage === stage.key ? 'ALL' : stage.key)}
                  className="flex flex-col items-center gap-0.5 group cursor-pointer"
                  title={isRTL ? `${stage.labelAr}: ${count}` : `${stage.labelEn}: ${count}`}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all duration-150"
                    style={{
                      backgroundColor: isActive ? stage.color : (count > 0 ? stage.bg : '#F1F5F9'),
                      color: isActive ? '#FFFFFF' : (count > 0 ? stage.color : '#94A3B8'),
                      border: `2px solid ${isActive ? stage.color : (count > 0 ? stage.border : '#E2E8F0')}`,
                      boxShadow: isActive ? `0 0 0 3px ${stage.color}22` : 'none',
                    }}
                  >
                    {count > 0 ? count : '·'}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
                    {stage.num}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
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
                <th className="py-3.5 px-4">{isRTL ? 'الفريق الطبي السعودي' : 'Care Team SA'}</th>
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
                const rawHospital = c.treatingDoctor?.hospital;
                const isLegacyAloCare = !rawHospital || rawHospital === 'Alo Care Specialist Medical Center' || rawHospital === 'مركز ألو كير الطبي التخصصي' || rawHospital === 'مجمع الرعاية الطبية' || rawHospital === 'المجمع الطبي الشريك' || rawHospital === 'Partner Medical Center';
                const hospital = isLegacyAloCare
                  ? (isRTL ? 'مستشفى رعاية الرياض المعتمد' : 'Riyadh Care Medical Center')
                  : rawHospital;
                const doctorName = c.treatingDoctor?.name || (isRTL ? 'د. فهد الحربي' : 'Dr. Fahad Al-Harbi');
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
                        {(c.pricing?.totalSar ?? priceTierForType(c.consultationType || 'written').totalSar).toFixed(0)} SAR (Paid)
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReassignModal({
                              open: true,
                              caseItem: c,
                              selectedDoctor: c.treatingDoctor?.name || 'د. سارة العتيبي (استشاري أمراض القلب)',
                              selectedConsultant: c.consultant?.name || 'Dr. Pradeep Kumar, MBBS, MS, MCh (CTVS)',
                            });
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-[#007B6E] hover:text-white text-[#007B6E] border border-teal-200 text-xs font-bold transition-all shadow-2xs"
                          title={isRTL ? 'إعادة تعيين الكادر' : 'Reassign Specialist'}
                        >
                          <UserCog className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isRTL ? 'تعيين' : 'Reassign'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => openDeleteSingle(e, c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-200 text-xs font-bold transition-all shadow-2xs"
                          title={isRTL ? 'حذف الحالة' : 'Delete Case'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isRTL ? 'حذف' : 'Delete'}</span>
                        </button>
                      </div>
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        isRTL={isRTL}
        mode={deleteModal.mode}
        caseItem={deleteModal.caseItem}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, mode: 'single', caseItem: null })}
        isDeleting={isDeleting}
      />

      {/* Case Reassignment Modal */}
      {reassignModal.open && reassignModal.caseItem && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setReassignModal({ open: false, caseItem: null, selectedDoctor: '', selectedConsultant: '' })}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-200 z-10" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-50 text-[#007B6E]">
                  <UserCog className="w-5 h-5" />
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {isRTL ? 'إعادة تعيين الكادر الطبي للحالة' : 'Reassign Clinical Staff'}
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-slate-500">
                {reassignModal.caseItem.caseNumber}
              </span>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isRTL ? 'الطبيب السعودي المعالج (Saudi Treating Doctor):' : 'Saudi Treating Doctor:'}
                </label>
                <select
                  value={reassignModal.selectedDoctor}
                  onChange={(e) => setReassignModal((prev) => ({ ...prev, selectedDoctor: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#007B6E] outline-none text-xs font-medium"
                >
                  <option value="د. سارة العتيبي (استشاري أمراض القلب · الشميسي)">د. سارة العتيبي (استشاري أمراض القلب · الشميسي)</option>
                  <option value="د. فهد الحربي (استشاري جراحة الأوعية الدموية · مدينة الملك فهد الطبية)">د. فهد الحربي (استشاري جراحة الأوعية الدموية · مدينة الملك فهد الطبية)</option>
                  <option value="د. عبدالله الشمري (استشاري الجراحة العامة · مستشفى د. سليمان الحبيب)">د. عبدالله الشمري (استشاري الجراحة العامة · مستشفى د. سليمان الحبيب)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isRTL ? 'الاستشاري الهندي التخصصي (International Consultant):' : 'International Specialist (India):'}
                </label>
                <select
                  value={reassignModal.selectedConsultant}
                  onChange={(e) => setReassignModal((prev) => ({ ...prev, selectedConsultant: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#007B6E] outline-none text-xs font-medium"
                >
                  <option value="Dr. Pradeep Kumar, MBBS, MS, MCh (Apollo Hospitals, Bengaluru)">Dr. Pradeep Kumar, MBBS, MS, MCh (Apollo Hospitals, Bengaluru)</option>
                  <option value="Dr. Arjun Mehta, MS, MCh (KIMS Heart Institute, Hyderabad)">Dr. Arjun Mehta, MS, MCh (KIMS Heart Institute, Hyderabad)</option>
                  <option value="Dr. Rajesh Sharma, MD, DM (Fortis Escorts Heart Institute, New Delhi)">Dr. Rajesh Sharma, MD, DM (Fortis Escorts Heart Institute, New Delhi)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReassignModal({ open: false, caseItem: null, selectedDoctor: '', selectedConsultant: '' })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveReassignment}
                className="px-5 py-2.5 rounded-xl bg-[#007B6E] hover:bg-[#005a50] text-white font-extrabold text-xs shadow-sm cursor-pointer"
              >
                {isRTL ? 'حفظ التعيين الجديد' : 'Save Reassignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminCasesTab;
