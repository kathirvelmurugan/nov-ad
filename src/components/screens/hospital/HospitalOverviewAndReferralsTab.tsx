import React from 'react';
import { Building2, Users, FileCheck2, QrCode, Clock, CheckCircle2 } from 'lucide-react';
import { TenantHospital, ClinicalCase } from '../../../types';

interface HospitalOverviewAndReferralsTabProps {
  isRTL: boolean;
  hospital: TenantHospital;
  activeCase?: ClinicalCase;
}

export const HospitalOverviewAndReferralsTab: React.FC<HospitalOverviewAndReferralsTabProps> = ({
  isRTL,
  hospital,
  activeCase,
}) => {
  // Mock recent referrals for this hospital tenant
  const referrals = [
    {
      id: activeCase?.id || 'CASE-2026-901',
      patientName: activeCase?.patientName || (isRTL ? 'مريض محال' : 'Referred Patient'),
      specialty: activeCase?.specialty || 'Cardiology',
      urgency: 'HIGH',
      assignedDoctor: 'Dr. Adrian Lewis',
      checkInCode: (activeCase?.metadata as any)?.checkInCode || 'RC-8842',
      checkInStatus: 'CHECKED_IN',
      time: '10:30 AM',
    },
    {
      id: 'CASE-2026-884',
      patientName: 'Fahad Al-Otaibi',
      specialty: 'Internal Medicine',
      urgency: 'ROUTINE',
      assignedDoctor: 'Dr. David Nunez',
      checkInCode: 'RC-7721',
      checkInStatus: 'PENDING_ARRIVAL',
      time: '11:15 AM',
    },
    {
      id: 'CASE-2026-840',
      patientName: 'Noura Al-Shehri',
      specialty: 'Endocrinology',
      urgency: 'ROUTINE',
      assignedDoctor: 'Dr. Marcus Vance',
      checkInCode: 'RC-6619',
      checkInStatus: 'COMPLETED',
      time: '09:00 AM',
    },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
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

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isRTL ? 'الإحالات الواردة اليوم' : "Today's Referrals"}
            </span>
            <span className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">14</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {isRTL ? 'جميع الحالات مؤكدة مالياً' : 'All Verified & Guaranteed'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isRTL ? 'رموز التحقق النشطة' : 'Active Check-In Codes'}
            </span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <QrCode className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">6</div>
          <p className="text-[11px] text-purple-700 font-semibold mt-1">
            {isRTL ? 'جاهزة لدى شباك الاستقبال' : 'Ready at Reception Counter'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {isRTL ? 'سجل الإحالات ورموز وصول المرضى للمستشفى' : 'Referral Queue & Patient Arrival Verification'}
            </h3>
            <p className="text-xs text-slate-500">
              {isRTL
                ? 'الحالات المحالة من استشاريي ALO والمقرر فحصها حضورياً في المستشفى.'
                : 'In-person hospital consults referred via ALO multi-disciplinary platform.'}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {isRTL ? hospital.nameAr : hospital.nameEn}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">{isRTL ? 'رقم الإحالة / المريض' : 'Case / Patient'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'التخصص الطبي' : 'Specialty'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'الطبيب المعالج' : 'Treating Doctor'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'رمز الحضور (Check-In)' : 'Arrival Code'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'حالة الحضور' : 'Arrival Status'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'الموعد' : 'Schedule'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {referrals.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.patientName}</div>
                    <div className="text-xs text-slate-400 font-mono">{item.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                    {item.specialty}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-800 font-semibold">
                    {item.assignedDoctor}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
                      <QrCode className="w-3 h-3 text-purple-600" />
                      {item.checkInCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {item.checkInStatus === 'CHECKED_IN' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        {isRTL ? 'تم تأكيد الوصول' : 'Checked In'}
                      </span>
                    ) : item.checkInStatus === 'PENDING_ARRIVAL' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                        <Clock className="w-3 h-3" />
                        {isRTL ? 'بانتظار الحضور' : 'Pending'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                        {isRTL ? 'مكتمل' : 'Completed'}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                    {item.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HospitalOverviewAndReferralsTab;
