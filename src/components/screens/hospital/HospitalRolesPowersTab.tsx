import React from 'react';
import { Shield, Eye, Lock, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { ROLE_PERMISSIONS, RoleCode } from '../../../data/rbacMatrix';
import { TenantHospital } from '../../../types';

interface HospitalRolesPowersTabProps {
  isRTL: boolean;
  hospital: TenantHospital;
  onActAs?: (roleCode: RoleCode) => void;
}

const HOSPITAL_ROLE_CODES: RoleCode[] = ['HA', 'D', 'L', 'PH', 'REC'];

export const HospitalRolesPowersTab: React.FC<HospitalRolesPowersTabProps> = ({
  isRTL,
  hospital,
}) => {
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
            <Shield className="w-4 h-4" />
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            {isRTL ? 'صلاحيات وأدوار المستشفى (نطاق المنشأة)' : 'Facility-Scoped Roles & Powers'}
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          {isRTL
            ? `حدود الخصوصية والصلاحيات الخاصة بأقسام ${hospital.nameAr} مع إمكانية المعاينة السريعة (Act-As).`
            : `Department privacy boundaries and powers scoped strictly to ${hospital.nameEn}.`}
        </p>
      </div>

      {/* Grid of Hospital Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {HOSPITAL_ROLE_CODES.map((code) => {
          const spec = ROLE_PERMISSIONS[code];
          return (
            <div
              key={code}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-teal-800 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                      {code}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {isRTL ? spec.roleNameAr : spec.roleNameEn}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isRTL ? spec.roleNameEn : spec.roleNameAr}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                    Hospital Tenant
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-3.5 leading-relaxed">
                  {isRTL ? spec.descriptionAr : spec.descriptionEn}
                </p>

                {/* Privacy Boundary */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 mb-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-1">
                    <Lock className="w-3 h-3 text-teal-600" />
                    <span>{isRTL ? 'نطاق الخصوصية المعتمد:' : 'Privacy Boundary:'}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-mono font-medium leading-snug">
                    {spec.dataPrivacyBoundary}
                  </p>
                </div>

                {/* Allowed Capabilities */}
                <div className="mb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {isRTL ? 'الصلاحيات المخولة:' : 'Capabilities:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {spec.allowedCapabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md font-medium border border-teal-100"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-teal-600" />
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Governance Status Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {code === 'HA' ? (isRTL ? 'مدير المنشأة المسؤول' : 'Facility Administrator') : (isRTL ? 'دور سريري معتمد' : 'Authorized Clinical Role')}
                </span>
                <span className="text-xs font-bold text-slate-600 px-3 py-1 bg-slate-100 rounded-lg border border-slate-200">
                  {isRTL ? 'معتمد للمستشفى ✓' : 'Enrolled ✓'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HospitalRolesPowersTab;
