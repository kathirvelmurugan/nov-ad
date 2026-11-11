import React, { useState } from 'react';
import { Building2, Users, Shield, Clock, MapPin, Phone } from 'lucide-react';
import { Persona, ClinicalCase } from '../../types';
import { PERSONAS, PERSONA_BY_CODE } from '../../data/personas';
import { RoleCode } from '../../data/rbacMatrix';
import { useAdminGovernanceState } from '../../hooks/useAdminGovernanceState';
import { HospitalOverviewAndReferralsTab } from './hospital/HospitalOverviewAndReferralsTab';
import { HospitalStaffAndDoctorsTab } from './hospital/HospitalStaffAndDoctorsTab';
import { HospitalRolesPowersTab } from './hospital/HospitalRolesPowersTab';
import { HospitalQueuesMonitorTab } from './hospital/HospitalQueuesMonitorTab';

interface HospitalAdminPortalViewProps {
  lang: 'ar' | 'en';
  activePersona?: Persona;
  activeCase?: ClinicalCase;
  onSelectPersona?: (persona: Persona) => void;
}

type TabKey = 'overview' | 'staff' | 'roles' | 'queues';

export const HospitalAdminPortalView: React.FC<HospitalAdminPortalViewProps> = ({
  lang,
  activePersona = PERSONA_BY_CODE.HA || PERSONAS[0],
  activeCase,
  onSelectPersona,
}) => {
  const isRTL = lang === 'ar';
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const {
    tenants,
    staffDirectory,
    createStaffMember,
    toggleStaffActive,
    startActAs,
  } = useAdminGovernanceState();

  // Find the hospital tenant associated with this hospital admin
  const hospital =
    tenants.find((t) => t.id === activePersona.hospitalId) ||
    tenants[0] || {
      id: '',
      nameEn: 'Unassigned Hospital',
      nameAr: 'مستشفى غير مسجل',
      city: 'الرياض',
      mciLicenseNumber: '',
      hospitalAdminPhone: '',
      hospitalAdminName: '',
      status: 'active' as const,
      doctorCount: 0,
      createdAt: new Date().toISOString(),
    };

  const handleActAs = (roleCode: RoleCode) => {
    startActAs(roleCode, activePersona, hospital.id);
    const targetPersona = Object.values(PERSONAS).find((p) => p.code === roleCode);
    if (targetPersona && onSelectPersona) {
      onSelectPersona({
        ...targetPersona,
        hospitalId: hospital.id,
      });
    }
  };

  const navTabs: { id: TabKey; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'overview', labelAr: 'نظرة عامة والإحالات', labelEn: 'Overview & Referrals', icon: <Building2 className="w-4 h-4" /> },
    { id: 'staff', labelAr: 'أطباء وكوادر المستشفى', labelEn: 'Doctors & Staff', icon: <Users className="w-4 h-4" /> },
    { id: 'roles', labelAr: 'الصلاحيات والخصوصية', labelEn: 'Roles & Powers', icon: <Shield className="w-4 h-4" /> },
    { id: 'queues', labelAr: 'طوابير الأقسام (SLA)', labelEn: 'Department Queues', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div data-testid="hospital-admin-portal-view" className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-black text-xl shadow-md border border-teal-700">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">
                {isRTL ? hospital.nameAr : hospital.nameEn}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Hospital Tenant
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {hospital.city}
              </span>
              <span className="flex items-center gap-1 font-mono" dir="ltr">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {hospital.hospitalAdminPhone}
              </span>
              <span className="font-mono text-slate-400">Lic: {hospital.mciLicenseNumber}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right text-xs bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              {isRTL ? 'مدير المنشأة' : 'Facility Admin'}
            </span>
            <span className="font-bold text-slate-800 font-mono">+966 50 444 4444 (HA)</span>
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
                  ? 'bg-teal-800 text-white shadow-sm shadow-teal-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.icon}
              <span>{isRTL ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Tab Panel */}
      <main className="max-w-7xl mx-auto">
        {activeTab === 'overview' && (
          <HospitalOverviewAndReferralsTab
            isRTL={isRTL}
            hospital={hospital}
            activeCase={activeCase}
          />
        )}
        {activeTab === 'staff' && (
          <HospitalStaffAndDoctorsTab
            isRTL={isRTL}
            hospital={hospital}
            staffDirectory={staffDirectory}
            onCreateStaff={createStaffMember}
            onToggleActive={toggleStaffActive}
          />
        )}
        {activeTab === 'roles' && (
          <HospitalRolesPowersTab
            isRTL={isRTL}
            hospital={hospital}
            onActAs={handleActAs}
          />
        )}
        {activeTab === 'queues' && (
          <HospitalQueuesMonitorTab
            isRTL={isRTL}
            hospital={hospital}
            activeCase={activeCase}
            onNavigateToDept={(deptCode) => handleActAs(deptCode)}
          />
        )}
      </main>
    </div>
  );
};

export default HospitalAdminPortalView;
