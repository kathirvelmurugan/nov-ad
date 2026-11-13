import React, { useState } from 'react';
import { Building2, Users, FileCheck2, QrCode, Clock, CheckCircle2, Eye } from 'lucide-react';
import { TenantHospital, ClinicalCase } from '../../../types';
import { getStageBadgeMeta } from '../../common/PortalCaseTrackerPanel';
import { CaseDetailsDrillDownModal } from '../../common/CaseDetailsDrillDownModal';

interface HospitalOverviewAndReferralsTabProps {
  isRTL: boolean;
  hospital: TenantHospital;
  activeCase?: ClinicalCase;
  cases?: ClinicalCase[];
}

export const HospitalOverviewAndReferralsTab: React.FC<HospitalOverviewAndReferralsTabProps> = ({
  isRTL,
  hospital,
  activeCase,
  cases = [],
}) => {
  const [selectedCaseForDrillDown, setSelectedCaseForDrillDown] = useState<ClinicalCase | null>(null);

  const referrals = (cases && cases.length > 0)
    ? cases.map((c, idx) => ({
        rawCase: c,
        id: c.caseNumber || c.id,
        patientName: isRTL ? c.patientNameAr || c.patientName || 'مريض' : c.patientNameEn || c.patientName || 'Patient',
        specialty: isRTL ? c.specialtyAr || c.specialty || 'الطب العام' : c.specialtyEn || c.specialty || 'General Medicine',
        diagnosis: isRTL ? c.diagnosisAr || c.diagnosis : c.diagnosisEn || c.diagnosis,
        urgency: (c as any).urgency || 'HIGH',
        assignedDoctor: c.treatingDoctor?.name || 'د. عبدالله الشمري',
        checkInCode: (c.metadata as any)?.checkInCode || `RC-${8800 + idx}`,
        checkInStatus: c.currentStage === 'CLOSED' ? 'COMPLETED' : c.currentStage === 'PARTNER_SERVICES' ? 'CHECKED_IN' : 'PENDING_ARRIVAL',
        currentStage: c.currentStage,
        time: c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:30 AM',
      }))
    : (activeCase && activeCase.caseNumber)
    ? [{
        rawCase: activeCase,
        id: activeCase.caseNumber || activeCase.id,
        patientName: isRTL ? activeCase.patientNameAr || activeCase.patientName || 'مريض' : activeCase.patientNameEn || activeCase.patientName || 'Patient',
        specialty: isRTL ? activeCase.specialtyAr || activeCase.specialty || 'الطب العام' : activeCase.specialtyEn || activeCase.specialty || 'General Medicine',
        diagnosis: isRTL ? activeCase.diagnosisAr || activeCase.diagnosis : activeCase.diagnosisEn || activeCase.diagnosis,
        urgency: 'HIGH',
        assignedDoctor: activeCase.treatingDoctor?.name || 'د. عبدالله الشمري',
        checkInCode: (activeCase.metadata as any)?.checkInCode || 'RC-8842',
        checkInStatus: activeCase.currentStage === 'CLOSED' ? 'COMPLETED' : 'PENDING_ARRIVAL',
        currentStage: activeCase.currentStage,
        time: '10:30 AM',
      }]
    : [];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isRTL ? 'الأطباء المعتمدون' : 'Licensed Doctors'}
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{hospital.doctorCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isRTL ? 'مسجلون لدى الهيئة السعودية SCFHS' : 'Registered with SCFHS License'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isRTL ? 'إجمالي الحالات والإحالات' : 'Total Hospital Cases'}
            </span>
            <span className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{referrals.length}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {isRTL ? 'مسجلة في المجمع الطبي' : 'Enrolled at this Medical Center'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isRTL ? 'رموز التحقق النشطة' : 'Active Check-In Codes'}
            </span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <QrCode className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {referrals.filter((r) => r.checkInStatus !== 'COMPLETED').length}
          </div>
          <p className="text-[11px] text-purple-700 font-semibold mt-1">
            {isRTL ? 'جاهزة لدى شباك الاستقبال' : 'Ready at Reception Counter'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isRTL ? 'الامتثال للـ SLA' : 'SLA Compliance Rate'}
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">98.4%</div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isRTL ? 'معدل الاستجابة السريرية < 4 ساعات' : 'Clinical response < 4 hours'}
          </p>
        </div>
      </div>

      {/* Referrals & Arrival Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {isRTL ? 'سجل الحالات والإحالات مع إمكانية استعراض التفاصيل (Drill Down)' : 'Case Registry & Patient Arrival Verification (Drill Down)'}
            </h3>
            <p className="text-xs text-slate-500">
              {isRTL
                ? 'انقر على أي حالة أو زر "عرض التفاصيل" لاستعراض المسار الكامل والحالة الراهنة والأوامر السريرية.'
                : 'Click any row or "Drill Down" to view complete patient journey, current stage, and clinical orders.'}
            </p>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full self-start sm:self-auto">
            {isRTL ? hospital.nameAr : hospital.nameEn}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">{isRTL ? 'رقم الإحالة / المريض' : 'Case / Patient'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'التخصص والتشخيص' : 'Specialty & Diagnosis'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'الطبيب المعالج' : 'Treating Doctor'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'المرحلة والحالة الراهنة' : 'Current Stage & Status'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'رمز الحضور' : 'Check-In Code'}</th>
                <th className="py-3.5 px-4 text-center">{isRTL ? 'الإجراء والتفاصيل' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {referrals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    {isRTL ? 'لا توجد إحالات مسجلة للمركز الطبي حالياً' : 'No clinical referrals recorded for this medical center'}
                  </td>
                </tr>
              )}
              {referrals.map((item) => {
                const stageMeta = getStageBadgeMeta(item.currentStage, isRTL);
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedCaseForDrillDown(item.rawCase)}
                    className="hover:bg-teal-50/40 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {item.patientName}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">{item.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-bold text-slate-800">{item.specialty}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{item.diagnosis}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-800 font-semibold">
                      {item.assignedDoctor}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${stageMeta.colorClass}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {stageMeta.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
                        <QrCode className="w-3 h-3 text-purple-600" />
                        {item.checkInCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCaseForDrillDown(item.rawCase);
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

export default HospitalOverviewAndReferralsTab;
