import React, { useState } from 'react';
import { Shield, Building2, UserCheck, Database, FileText, Globe } from 'lucide-react';
import { Persona } from '../../types';
import { PERSONAS, PERSONA_BY_CODE } from '../../data/personas';
import { RoleCode } from '../../data/rbacMatrix';
import { useAdminGovernanceState } from '../../hooks/useAdminGovernanceState';
import { SuperAdminRolesPowersTab } from './superadmin/SuperAdminRolesPowersTab';
import { SuperAdminTenantsTab } from './superadmin/SuperAdminTenantsTab';
import { SuperAdminCentralStaffTab } from './superadmin/SuperAdminCentralStaffTab';
import { SuperAdminCatalogsTab } from './superadmin/SuperAdminCatalogsTab';
import { SuperAdminAuditTab } from './superadmin/SuperAdminAuditTab';

interface SuperAdminPortalViewProps {
  lang: 'ar' | 'en';
  onSelectPersona?: (persona: Persona) => void;
  activePersona?: Persona;
}

type TabKey = 'roles' | 'tenants' | 'staff' | 'catalogs' | 'audit';

export const SuperAdminPortalView: React.FC<SuperAdminPortalViewProps> = ({
  lang,
  onSelectPersona,
  activePersona = PERSONA_BY_CODE.AD || PERSONAS[0],
}) => {
  const isRTL = lang === 'ar';
  const [activeTab, setActiveTab] = useState<TabKey>('roles');

  const {
    tenants,
    createTenant,
    toggleTenantStatus,
    staffDirectory,
    createStaffMember,
    toggleStaffActive,
    catalogs,
    addSpecialty,
    removeSpecialty,
    addLabTest,
    removeLabTest,
    addMedication,
    removeMedication,
    auditLogs,
    startActAs,
  } = useAdminGovernanceState();

  const handleActAs = (roleCode: RoleCode) => {
    startActAs(roleCode, activePersona);
    const targetPersona = Object.values(PERSONAS).find((p) => p.code === roleCode);
    if (targetPersona && onSelectPersona) {
      onSelectPersona(targetPersona);
    }
  };

  const navTabs: { id: TabKey; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'roles', labelAr: 'مصفوفة الصلاحيات (Act-As)', labelEn: 'Roles & Powers (Act-As)', icon: <Shield className="w-4 h-4" /> },
    { id: 'tenants', labelAr: 'المستشفيات الشريكة', labelEn: 'Hospital Tenants', icon: <Building2 className="w-4 h-4" /> },
    { id: 'staff', labelAr: 'الكوادر المركزية', labelEn: 'Central Staff', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'catalogs', labelAr: 'الكتالوجات الطبية', labelEn: 'Medical Catalogs', icon: <Database className="w-4 h-4" /> },
    { id: 'audit', labelAr: 'سجلات التدقيق', labelEn: 'Audit Logs', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-md border border-slate-700">
            ALO
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">
                {isRTL ? 'بوابة الحوكمة والتحكم الأعلى' : 'Super Admin Platform Control'}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                ALO Master
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {isRTL
                ? 'نظام الحوكمة السريرية الموحد v2.4 — الامتثال للأنظمة الصحية في المملكة العربية السعودية'
                : 'Unified Clinical Governance v2.4 — Saudi Health System & SDAIA Compliance'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right text-xs bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              {isRTL ? 'الجلسة النشطة' : 'Active Session'}
            </span>
            <span className="font-bold text-slate-800 font-mono">+966 50 000 0001 (AD)</span>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="max-w-7xl mx-auto mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.icon}
              <span>{isRTL ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </nav>

      {/* Active Tab Panel */}
      <main className="max-w-7xl mx-auto">
        {activeTab === 'roles' && (
          <SuperAdminRolesPowersTab isRTL={isRTL} onActAs={handleActAs} />
        )}
        {activeTab === 'tenants' && (
          <SuperAdminTenantsTab
            isRTL={isRTL}
            tenants={tenants}
            onCreateTenant={createTenant}
            onToggleStatus={toggleTenantStatus}
          />
        )}
        {activeTab === 'staff' && (
          <SuperAdminCentralStaffTab
            isRTL={isRTL}
            staffDirectory={staffDirectory}
            tenants={tenants}
            onCreateStaff={createStaffMember}
            onToggleActive={toggleStaffActive}
          />
        )}
        {activeTab === 'catalogs' && (
          <SuperAdminCatalogsTab
            isRTL={isRTL}
            catalogs={catalogs}
            onAddSpecialty={addSpecialty}
            onRemoveSpecialty={removeSpecialty}
            onAddLabTest={addLabTest}
            onRemoveLabTest={removeLabTest}
            onAddMedication={addMedication}
            onRemoveMedication={removeMedication}
          />
        )}
        {activeTab === 'audit' && (
          <SuperAdminAuditTab isRTL={isRTL} auditLogs={auditLogs} />
        )}
      </main>
    </div>
  );
};

export default SuperAdminPortalView;
