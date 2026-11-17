import React, { useState } from 'react';
import { Building2, Plus, CheckCircle, XCircle, MapPin, Phone, Users, ShieldCheck } from 'lucide-react';
import { TenantHospital } from '../../../types';
import { TenantAdminAccount } from '../../../services/apiClient';
import { validatePhone } from '../../../utils/phoneValidation';
import { PhoneField } from '../../common/PhoneField';

interface SuperAdminTenantsTabProps {
  isRTL: boolean;
  tenants: TenantHospital[];
  onCreateTenant: (
    tenant: Omit<TenantHospital, 'id' | 'createdAt'>
  ) => Promise<TenantHospital & { adminAccount?: TenantAdminAccount }>;
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
  const [phoneError, setPhoneError] = useState('');
  const [submitError, setSubmitError] = useState('');
  // The administrator account is created with the hospital; the PIN comes back
  // exactly once, so it is held here until the operator dismisses it.
  const [issuedAdmin, setIssuedAdmin] = useState<TenantAdminAccount | null>(null);

  const handlePhoneChange = (val: string) => {
    setAdminPhone(val);
    setPhoneError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!newNameEn.trim() || !newNameAr.trim() || !adminName.trim()) return;

    const validation = validatePhone(adminPhone, 'SA');
    if (!validation.isValid) {
      setPhoneError(isRTL ? validation.issue?.ar || '' : validation.issue?.en || '');
      return;
    }

    try {
      // No invented values: a blank licence stays blank, and the admin name and
      // phone are what create the Hospital Admin account, not decorative text.
      const created = await onCreateTenant({
        nameEn: newNameEn.trim(),
        nameAr: newNameAr.trim(),
        city: newCity.trim(),
        mciLicenseNumber: newLicense.trim(),
        status: 'active',
        hospitalAdminName: adminName.trim(),
        hospitalAdminPhone: validation.e164,
        doctorCount: 0,
      });

      if (created?.adminAccount) setIssuedAdmin(created.adminAccount);

      setNewNameEn('');
      setNewNameAr('');
      setNewLicense('');
      setAdminName('');
      setAdminPhone('+96650');
      setPhoneError('');
      setShowAddForm(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Tenant could not be created.');
    }
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

      {/* Issued admin access — shown once, never retrievable */}
      {issuedAdmin && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5" dir="ltr">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                {issuedAdmin.promotedFromPatient
                  ? 'Admin account promoted from a patient record'
                  : 'Hospital admin access PIN — shown once only'}
              </p>
              <p className="text-sm text-amber-900 mt-1">
                {issuedAdmin.promotedFromPatient
                  ? `${issuedAdmin.phone} already existed as a patient. It is now the Hospital Admin of this hospital and keeps the PIN it already set.`
                  : issuedAdmin.initialPin
                    ? `Give this PIN to ${issuedAdmin.phone}. It cannot be retrieved again — if it is lost, use Reset PIN in the Staff tab.`
                    : `${issuedAdmin.phone} is already an administrator of this hospital; its existing PIN is unchanged.`}
              </p>
              {issuedAdmin.initialPin && (
                <p className="text-3xl font-mono font-black text-amber-900 tracking-[0.3em] mt-2">{issuedAdmin.initialPin}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIssuedAdmin(null)}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 uppercase shrink-0"
            >
              Close
            </button>
          </div>
        </div>
      )}

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
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Dr. Admin Name"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <PhoneField
                id="tenant-admin-phone"
                label={isRTL ? 'هاتف مدير المستشفى (واتساب)' : 'Admin Phone'}
                value={adminPhone}
                onChange={handlePhoneChange}
                isAr={isRTL}
                country="SA"
                error={phoneError}
                accentClass="focus:ring-sky-500"
                placeholder="+96650XXXXXXX"
              />
            </div>
          </div>
          {submitError && (
            <p className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              {submitError}
            </p>
          )}
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
