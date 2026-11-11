import React, { useState } from 'react';
import { Stethoscope, Plus, CheckCircle, XCircle, Phone, Award, Shield, AlertCircle } from 'lucide-react';
import { StaffAccountRecord, TenantHospital, RoleCode } from '../../../types';
import { sanitizeDigits, validatePhoneNumber } from '../../../utils/phoneValidation';

interface HospitalStaffAndDoctorsTabProps {
  isRTL: boolean;
  hospital: TenantHospital;
  staffDirectory: StaffAccountRecord[];
  onCreateStaff: (staff: Omit<StaffAccountRecord, 'id' | 'createdAt'>) => void;
  onToggleActive: (staffId: string) => void;
}

export const HospitalStaffAndDoctorsTab: React.FC<HospitalStaffAndDoctorsTabProps> = ({
  isRTL,
  hospital,
  staffDirectory,
  onCreateStaff,
  onToggleActive,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [phone, setPhone] = useState('+96650');
  const [phoneError, setPhoneError] = useState('');
  const [roleCode, setRoleCode] = useState<RoleCode>('D');
  const [scfhs, setScfhs] = useState('');

  const handlePhoneChange = (val: string) => {
    const cleaned = sanitizeDigits(val);
    setPhone(cleaned);
    const result = validatePhoneNumber(cleaned, false);
    setPhoneError(result.isValid ? '' : (isRTL ? result.errorMessageAr || '' : result.errorMessage || ''));
  };

  // Hospital staff are those assigned to this hospital or matching hospital roles (D, L, PH, REC)
  const hospitalStaff = staffDirectory.filter(
    (s) => s.hospitalId === hospital.id || ['D', 'L', 'PH', 'REC'].includes(s.roleCode)
  );

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !phone.trim()) return;

    const validation = validatePhoneNumber(phone, false);
    if (!validation.isValid) {
      setPhoneError(isRTL ? validation.errorMessageAr || '' : validation.errorMessage || '');
      return;
    }

    onCreateStaff({
      phone: phone.trim(),
      fullName: nameEn.trim(),
      fullNameAr: nameAr.trim() || undefined,
      roleCode,
      hospitalId: hospital.id,
      status: 'active',
      pin: '1234',
      scfhsLicense: scfhs.trim() || `SCFHS-${Date.now().toString().slice(-6)}`,
      staffCode: Math.floor(10000 + Math.random() * 90000).toString(),
    });

    setNameEn('');
    setNameAr('');
    setPhone('+96650');
    setPhoneError('');
    setScfhs('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              <Stethoscope className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {isRTL ? 'الأطباء والكوادر التابعة للمستشفى' : 'Hospital Doctors & Department Staff'}
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {isRTL
              ? `إدارة الأطباء المعالجين (D)، فنيي المختبر (L)، الصيادلة (PH)، وموظفي الاستقبال (REC) في ${hospital.nameAr}.`
              : `Manage licensed treating doctors, lab technicians, pharmacists, and receptionists at ${hospital.nameEn}.`}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? (isRTL ? 'إلغاء' : 'Close') : (isRTL ? 'إضافة طبيب أو كادر' : 'Add Doctor / Staff')}</span>
        </button>
      </div>

      {/* Add Staff Form */}
      {showAddForm && (
        <form
          onSubmit={handleEnroll}
          className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-200 shadow-sm space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="font-bold text-slate-900 text-base">
            {isRTL ? 'تسجيل طبيب أو موظف قسم جديد' : 'New Hospital Staff Enrollment'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? 'الاسم بالإنجليزية' : 'Full Name (English)'}
              </label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Dr. Adrian Lewis"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? 'الاسم بالعربية' : 'Full Name (Arabic)'}
              </label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="د. أدريان لويس"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? 'الدور الوظيفي' : 'Department Role'}
              </label>
              <select
                value={roleCode}
                onChange={(e) => setRoleCode(e.target.value as RoleCode)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              >
                <option value="D">D - Treating Doctor (طبيب استشاري معالج)</option>
                <option value="L">L - Hospital Lab (فني مختبر وتحاليل)</option>
                <option value="PH">PH - Hospital Pharmacy (صيدلي معتمد)</option>
                <option value="REC">REC - Hospital Reception (استقبال ودخول)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? 'رقم الجوال (واتساب)' : 'Mobile Phone (WhatsApp)'}
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+96650XXXXXXX"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 ${
                  phoneError ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
              {phoneError && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{phoneError}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? 'ترخيص الهيئة السعودية SCFHS' : 'SCFHS Medical License'}
              </label>
              <input
                type="text"
                value={scfhs}
                onChange={(e) => setScfhs(e.target.value)}
                placeholder="SCFHS-MED-XXXXXX"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 rounded-xl hover:bg-emerald-800 shadow-sm"
            >
              {isRTL ? 'حفظ الكادر' : 'Save Staff Member'}
            </button>
          </div>
        </form>
      )}

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">{isRTL ? 'الكادر' : 'Staff Member'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'القسم / الدور' : 'Department / Role'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'ترخيص SCFHS' : 'SCFHS License'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'الجوال / الرمز' : 'Contact / Staff ID'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="py-3.5 px-4 text-right">{isRTL ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {hospitalStaff.map((staff) => {
                const isActive = staff.status === 'active';
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
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                        <Shield className="w-3 h-3 text-emerald-700" />
                        {staff.roleCode} - {staff.roleCode === 'D' ? 'Doctor' : staff.roleCode === 'L' ? 'Lab' : staff.roleCode === 'PH' ? 'Pharmacy' : 'Reception'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                      {staff.scfhsLicense || (
                        <span className="text-slate-400 font-sans italic">{isRTL ? 'موظف تشغيلي' : 'Operational Staff'}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex items-center gap-1 text-slate-700 font-mono" dir="ltr">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {staff.phone}
                      </div>
                      {staff.staffCode && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          Staff ID: {staff.staffCode}
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
                          onToggleActive(staff.id);
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

export default HospitalStaffAndDoctorsTab;
