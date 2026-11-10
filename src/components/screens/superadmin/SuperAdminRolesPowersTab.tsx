import React, { useState } from 'react';
import { Shield, Eye, Lock, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { ROLE_PERMISSIONS, ALL_ROLE_CODES, RoleCode, TenantTier } from '../../../data/rbacMatrix';

interface SuperAdminRolesPowersTabProps {
  isRTL: boolean;
  onActAs: (roleCode: RoleCode) => void;
}

const TIER_COLORS: Record<TenantTier, { bg: string; text: string; border: string }> = {
  ALO_MASTER: { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
  MEDICAL_CENTER_TENANT: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
  EXTERNAL_SPECIALIST: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  PATIENT_SELF: { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' },
};

export const SuperAdminRolesPowersTab: React.FC<SuperAdminRolesPowersTabProps> = ({ isRTL, onActAs }) => {
  const [filterTier, setFilterTier] = useState<TenantTier | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoles = ALL_ROLE_CODES.map((code) => ROLE_PERMISSIONS[code]).filter((spec) => {
    if (filterTier !== 'ALL' && spec.tenantTier !== filterTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = spec.roleCode.toLowerCase().includes(q);
      const matchEn = spec.roleNameEn.toLowerCase().includes(q) || spec.descriptionEn.toLowerCase().includes(q);
      const matchAr = spec.roleNameAr.includes(q) || spec.descriptionAr.includes(q);
      return matchCode || matchEn || matchAr;
    }
    return true;
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              <Shield className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {isRTL ? 'مصفوفة الأدوار والصلاحيات (11 دوراً موحداً)' : 'RBAC Roles & Powers Matrix (11 Unified Roles)'}
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {isRTL
              ? 'حوكمة الوصول حسب ضوابط الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA) وحدود المستأجرين مع زر المعاينة الفورية (Act-As).'
              : 'SDAIA privacy boundaries, tenant scopes, allowed clinical stages, and instant Act-As role preview.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'بحث بالاسم أو الرمز...' : 'Search role or code...'}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={() => setFilterTier('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterTier === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isRTL ? 'الكل (11)' : 'All (11)'}
          </button>
          <button
            onClick={() => setFilterTier('ALO_MASTER')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterTier === 'ALO_MASTER' ? 'bg-sky-700 text-white' : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
            }`}
          >
            ALO Master
          </button>
          <button
            onClick={() => setFilterTier('MEDICAL_CENTER_TENANT')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterTier === 'MEDICAL_CENTER_TENANT' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Hospital Tenant
          </button>
          <button
            onClick={() => setFilterTier('EXTERNAL_SPECIALIST')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterTier === 'EXTERNAL_SPECIALIST' ? 'bg-amber-700 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            External Specialist
          </button>
        </div>
      </div>

      {/* Grid of Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoles.map((role) => {
          const tierStyle = TIER_COLORS[role.tenantTier];
          return (
            <div
              key={role.roleCode}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                      {role.roleCode}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {isRTL ? role.roleNameAr : role.roleNameEn}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isRTL ? role.roleNameEn : role.roleNameAr}
                      </p>
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider"
                    style={{ backgroundColor: tierStyle.bg, color: tierStyle.text, border: `1px solid ${tierStyle.border}` }}
                  >
                    {role.tenantTier.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mb-3.5 leading-relaxed">
                  {isRTL ? role.descriptionAr : role.descriptionEn}
                </p>

                {/* SDAIA Privacy Boundary Box */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 mb-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>{isRTL ? 'نطاق الخصوصية (SDAIA Boundary):' : 'SDAIA Data Privacy Boundary:'}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-mono font-medium leading-snug">
                    {role.dataPrivacyBoundary}
                  </p>
                </div>

                {/* Allowed Capabilities */}
                <div className="mb-3.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {isRTL ? 'الصلاحيات المعتمدة:' : 'Allowed Capabilities:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {role.allowedCapabilities.slice(0, 4).map((cap, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-medium border border-emerald-100"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        {cap}
                      </span>
                    ))}
                    {role.allowedCapabilities.length > 4 && (
                      <span className="text-[10px] text-slate-400 px-1 py-0.5 font-medium">
                        +{role.allowedCapabilities.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Clinical Stages Badge */}
                {role.allowedStages.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {isRTL ? 'المراحل السريرية:' : 'Clinical Stages:'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {role.allowedStages.map((stage) => (
                        <span
                          key={stage}
                          className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium"
                        >
                          {stage}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Act-As Action Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {role.roleCode === 'AD' ? (isRTL ? 'أنت في هذا الدور' : 'Current Active Role') : (isRTL ? 'معاينة تجربة المستخدم' : 'Live User Preview')}
                </span>
                {role.roleCode !== 'AD' ? (
                  <button
                    onClick={() => onActAs(role.roleCode)}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs transition-transform active:scale-95 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'تقمص الدور' : 'Act As'}</span>
                    {isRTL ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-slate-400 px-3 py-1 bg-slate-100 rounded-lg">
                    {isRTL ? 'النظام الرئيسي' : 'Master Control'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuperAdminRolesPowersTab;
