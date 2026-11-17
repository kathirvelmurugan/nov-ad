import React, { useState } from 'react';
import { UserCheck, Plus, CheckCircle, XCircle, Shield, Phone, Building } from 'lucide-react';
import { StaffAccountRecord, TenantHospital, RoleCode } from '../../../types';
import { Country, validatePhone } from '../../../utils/phoneValidation';
import { PhoneField } from '../../common/PhoneField';

interface SuperAdminCentralStaffTabProps {
  isRTL: boolean;
  staffDirectory: StaffAccountRecord[];
  tenants: TenantHospital[];
  onCreateStaff: (staff: Omit<StaffAccountRecord, 'id' | 'createdAt'>) => void | Promise<unknown>;
  onToggleActive: (staffId: string) => void | Promise<unknown>;
}

export const SuperAdminCentralStaffTab: React.FC<SuperAdminCentralStaffTabProps> = ({
  isRTL,
  staffDirectory,
  tenants,
  onCreateStaff,
  onToggleActive,
}) => {
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [phone, setPhone] = useState('+96650');
  const [phoneError, setPhoneError] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [roleCode, setRoleCode] = useState<RoleCode>('C');
  const [hospitalId, setHospitalId] = useState<string>('');
  const [license, setLicense] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [toggleError, setToggleError] = useState('');

  // Role K is the international (Indian) consultant persona; everyone else is KSA.
  const phoneCountry: Country = roleCode === 'K' ? 'IN' : 'SA';

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setPhoneError('');
  };

  const handleRoleChange = (newRole: RoleCode) => {
    setRoleCode(newRole);
    setPhone(newRole === 'K' ? '+91' : '+96650');
    setPhoneError('');
  };

  const centralStaff = staffDirectory.filter(
    (s) => ['AD', 'HA', 'C', 'N', 'K'].includes(s.roleCode)
  );

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!phone.trim() || !nameEn.trim()) return;

    const validation = validatePhone(phone, phoneCountry);
    if (!validation.isValid) {
      setPhoneError(isRTL ? validation.issue?.ar || '' : validation.issue?.en || '');
      return;
    }

    try {
      // The row must exist in Postgres before the form closes: role_code there is
      // what routes this person to the correct portal at login.
      await onCreateStaff({
        phone: validation.e164,
        fullName: nameEn.trim(),
        fullNameAr: nameAr.trim() || undefined,
        roleCode,
        hospitalId: roleCode === 'HA' ? hospitalId || tenants[0]?.id : undefined,
        status: 'active',
        pin: '',
        hasCustomPin: false,
        scfhsLicense: license.trim() || undefined,
        staffCode: Math.floor(10000 + Math.random() * 90000).toString(),
      });
    } catch (err: any) {
      const status = err?.response?.status;
      setSubmitError(
        status === 403
          ? (isRTL ? 'غير مصرح لك بتسجيل هذا الدور.' : 'Your role is not permitted to enroll this staff role.')
          : (isRTL ? 'فشل الحفظ في قاعدة البيانات. لم يتم إنشاء الحساب.' : 'Could not save to the database. The account was NOT created.')
      );
      return;
    }

    setPhone(roleCode === 'K' ? '+91' : '+96650');
    setPhoneError('');
    setNameEn('');
    setNameAr('');
    setLicense('');
    setShowEnrollForm(false);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              <UserCheck className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {isRTL ? 'إدارة الكوادر المركزية والقيادية' : 'Central Platform Staff & Hospital Admins'}
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {isRTL
              ? 'إدارة حسابات منسقي الرعاية (C)، ممرضات الفرز (N)، الاستشاريين الدوليين (K)، ومدراء المستشفيات (HA).'
              : 'Enroll and govern ALO Coordinators, Triage Nurses, External Specialists, and Hospital Admins.'}
          </p>
        </div>

        <button
          onClick={() => setShowEnrollForm(!showEnrollForm)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showEnrollForm ? (isRTL ? 'إلغاء' : 'Close Form') : (isRTL ? 'تسجيل كادر جديد' : 'Enroll Staff')}</span>
        </button>
      </div>

      {/* Enroll Form */}
      {showEnrollForm && (
        <form
          onSubmit={handleEnroll}
          className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-200 shadow-sm space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="font-bold text-slate-900 text-base">
            {isRTL ? 'بيانات الكادر الجديد' : 'New Central Staff Enrollment'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <PhoneField
                id="staff-enroll-phone"
                label={isRTL ? 'رقم الجوال (واتساب)' : 'Mobile Phone (WhatsApp)'}
                value={phone}
                onChange={handlePhoneChange}
                isAr={isRTL}
                country={phoneCountry}
                error={phoneError}
                required
                accentClass="focus:ring-indigo-500"
                placeholder={roleCode === 'K' ? '+91 XXXXXXXXXX' : '+966 5X XXX XXXX'}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? 'الاسم (بالإنجليزية)' : 'Full Name (English)'}
              </label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Staff Full Name, RN / MD"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? 'الاسم (بالعربية)' : 'Full Name (Arabic)'}
              </label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: سارة العتيبي"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? 'الدور الوظيفي' : 'Role Assignment'}
              </label>
              <select
                value={roleCode}
                onChange={(e) => handleRoleChange(e.target.value as RoleCode)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="C">C - ALO Care Coordinator (منسق رعاية)</option>
                <option value="N">N - ALO Triage Nurse (ممرضة فرز)</option>
                <option value="HA">HA - Hospital Admin (مدير مستشفى شريك)</option>
                <option value="K">K - Specialist Telehealth Consultant (استشاري دولي)</option>
                <option value="AD">AD - ALO Platform Super Admin (مدير منصة)</option>
              </select>
            </div>
            {roleCode === 'HA' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {isRTL ? 'المستشفى التابع له' : 'Assigned Hospital Tenant'}
                </label>
                <select
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {isRTL ? t.nameAr : t.nameEn} ({t.city})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? 'رقم الترخيص المهني / SCFHS' : 'Professional License / Registration'}
              </label>
              <input
                type="text"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="SCFHS-XXXXX or MCI-XXXX"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
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
              onClick={() => setShowEnrollForm(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm"
            >
              {isRTL ? 'حفظ وتفعيل الحساب' : 'Save & Activate Account'}
            </button>
          </div>
        </form>
      )}

      {/* Staff Directory Table */}
      {toggleError && (
        <p className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
          {toggleError}
        </p>
      )}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">{isRTL ? 'الكادر' : 'Staff Member'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'الدور' : 'Role'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'المستشفى / النطاق' : 'Tenant Scope'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'الجوال / الرمز' : 'Contact / Staff ID'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="py-3.5 px-4 text-right">{isRTL ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {centralStaff.map((staff) => {
                const isActive = staff.status === 'active';
                const hospital = tenants.find((t) => t.id === staff.hospitalId);
                return (
                  <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {isRTL && staff.fullNameAr ? staff.fullNameAr : staff.fullName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {staff.fullName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
                        <Shield className="w-3 h-3 text-emerald-400" />
                        {staff.roleCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {hospital ? (
                        <div className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{isRTL ? hospital.nameAr : hospital.nameEn}</span>
                        </div>
                      ) : (
                        <span className="text-sky-700 font-semibold">ALO Global Master</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex items-center gap-1 text-slate-700 font-mono" dir="ltr">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {staff.phone}
                      </div>
                      {staff.staffCode && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          PIN/ID: {staff.staffCode}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Disabled')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setToggleError('');
                          Promise.resolve(onToggleActive(staff.id)).catch((err: any) => {
                            const status = err?.response?.status;
                            setToggleError(
                              status === 403
                                ? (isRTL ? 'غير مصرح لك بتعديل حالة هذا الحساب.' : 'Your role is not permitted to change this account status.')
                                : (isRTL ? 'فشل تحديث الحالة في قاعدة البيانات. لم يتم تغيير الحساب.' : 'Could not update the status in the database. Nothing changed.')
                            );
                          });
                        }}
                        className="text-xs font-bold px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        {isActive ? (isRTL ? 'تعطيل' : 'Deactivate') : (isRTL ? 'تفعيل' : 'Activate')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminCentralStaffTab;
