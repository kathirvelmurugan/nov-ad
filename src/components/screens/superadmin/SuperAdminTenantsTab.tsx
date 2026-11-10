import React, { useState } from 'react';
import { Building2, Plus, CheckCircle, XCircle, MapPin, Phone, Users, ShieldCheck } from 'lucide-react';
import { TenantHospital } from '../../../types';

interface SuperAdminTenantsTabProps {
  isRTL: boolean;
  tenants: TenantHospital[];
  onCreateTenant: (tenant: Omit<TenantHospital, 'id' | 'createdAt'>) => void;
  onToggleStatus: (hospitalId: string) => void;
}

export const SuperAdminTenantsTab: React.FC<SuperAdminTenantsTabProps> = ({
  isRTL,
  tenants,
  onCreateTenant,
  onToggleStatus,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNameEn, setNewNameEn] = useState('');
  const [newNameAr, setNewNameAr] = useState('');
  const [newCity, setNewCity] = useState('الرياض');
  const [newLicense, setNewLicense] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('+96650');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameEn.trim() || !newNameAr.trim()) return;

    onCreateTenant({
      nameEn: newNameEn.trim(),
      nameAr: newNameAr.trim(),
      city: newCity.trim(),
      mciLicenseNumber: newLicense.trim() || `MCI-SA-${Date.now().toString().slice(-6)}`,
      status: 'active',
      hospitalAdminName: adminName.trim() || 'Dr. Hospital Admin',
      hospitalAdminPhone: adminPhone.trim() || '+966504444444',
      doctorCount: 1,
    });

    setNewNameEn('');
    setNewNameAr('');
    setNewLicense('');
    setAdminName('');
    setAdminPhone('+96650');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
              <Building2 className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {isRTL ? 'إدارة المستشفيات والمراكز الشريكة' : 'Partner Hospitals & Medical Centers'}
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {isRTL
              ? 'تسجيل وإدارة المستأجرين الطبيين المعتمدين وتعيين مدراء المستشفيات في المملكة العربية السعودية.'
              : 'Onboard and manage licensed Saudi hospital tenants and assign tenant administrators.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? (isRTL ? 'إلغاء' : 'Close Form') : (isRTL ? 'إضافة مستشفى جديد' : 'Onboard Hospital')}</span>
        </button>
      </div>

      {/* Onboarding Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-sky-50/50 rounded-2xl p-6 border border-sky-200 shadow-sm space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="font-bold text-slate-900 text-base">
            {isRTL ? 'بيانات المستشفى الشريك الجديد' : 'New Partner Hospital Tenant Details'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? 'اسم المستشفى (بالإنجليزية)' : 'Hospital Name (English)'}
              </label>
              <input
                type="text"
                required
                value={newNameEn}
                onChange={(e) => setNewNameEn(e.target.value)}
                placeholder="e.g. Dallah Hospital"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? 'اسم المستشفى (بالعربية)' : 'Hospital Name (Arabic)'}
              </label>
              <input
                type="text"
                required
                value={newNameAr}
                onChange={(e) => setNewNameAr(e.target.value)}
                placeholder="مثال: مستشفى دله"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? 'المدينة' : 'City'}
              </label>
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? 'رقم ترخيص وزارة التجارة (MCI)' : 'MCI License Number'}
              </label>
              <input
                type="text"
                value={newLicense}
                onChange={(e) => setNewLicense(e.target.value)}
                placeholder="MCI-SA-XXXXXX"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? 'اسم مدير المستشفى (HA)' : 'Hospital Admin Name'}
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="د. فهد السديري"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? 'هاتف مدير المستشفى (واتساب)' : 'Admin Phone'}
              </label>
              <input
                type="text"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="+966 50 XXX XXXX"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-sky-700 rounded-xl hover:bg-sky-800 shadow-sm"
            >
              {isRTL ? 'حفظ وتفعيل المستأجر' : 'Save & Onboard Tenant'}
            </button>
          </div>
        </form>
      )}

      {/* Tenants Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tenants.map((tenant) => {
          const isActive = tenant.status === 'active';
          return (
            <div
              key={tenant.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {isRTL ? tenant.nameAr : tenant.nameEn}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{tenant.id}</p>
                  </div>
                  <button
                    onClick={() => onToggleStatus(tenant.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                      isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Disabled')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{tenant.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span dir="ltr">{tenant.hospitalAdminPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span className="font-mono">{tenant.mciLicenseNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>
                      {tenant.doctorCount} {isRTL ? 'أطباء معتمدين' : 'Doctors'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  <span className="font-bold">{isRTL ? 'المدير المعين: ' : 'Assigned Admin: '}</span>
                  <span>{tenant.hospitalAdminName}</span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{isRTL ? 'المستأجر خاضع لاتفاقية ALO' : 'Governed by ALO Tenant Agreement'}</span>
                <span className="font-mono text-[11px]">ID: {tenant.id}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuperAdminTenantsTab;
