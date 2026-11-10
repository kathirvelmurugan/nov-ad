import React, { useState } from 'react';
import { FileText, ShieldAlert, Clock, User, Building } from 'lucide-react';
import { AuditLogEntry } from '../../../types';

interface SuperAdminAuditTabProps {
  isRTL: boolean;
  auditLogs: AuditLogEntry[];
}

export const SuperAdminAuditTab: React.FC<SuperAdminAuditTabProps> = ({ isRTL, auditLogs }) => {
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction !== 'ALL' && !log.actionType.includes(filterAction)) return false;
    return true;
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              <FileText className="w-4 h-4 text-emerald-400" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {isRTL ? 'سجلات التدقيق والأمان المالي والسريري' : 'Audit Logs & Governance Trail'}
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {isRTL
              ? 'تتبع غير قابل للتعديل لكافة الإجراءات الإدارية، وتغيير الصلاحيات، وعمليات تقمص الأدوار (Act-As).'
              : 'Immutable record of governance actions, role impersonation sessions, and tenant modifications.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 font-semibold"
          >
            <option value="ALL">{isRTL ? 'كافة العمليات' : 'All Actions'}</option>
            <option value="ACT_AS">Act-As Preview</option>
            <option value="TENANT">Tenant Events</option>
            <option value="STAFF">Staff Governance</option>
            <option value="CATALOG">Catalog Updates</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">{isRTL ? 'الوقت والتاريخ' : 'Timestamp'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'المستخدم المنفذ' : 'Actor / Role'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'نوع الإجراء' : 'Action Code'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'المستشفى / النطاق' : 'Tenant Scope'}</th>
                <th className="py-3.5 px-4">{isRTL ? 'تفاصيل السجل' : 'Event Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLogs.map((log) => {
                const dateStr = new Date(log.timestamp).toLocaleString();
                const isActAs = log.actionType.includes('ACT_AS');
                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dateStr}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-900">
                      <div className="flex items-center gap-1.5 font-bold">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.actorName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{log.actorRole}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isActAs
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {isActAs && <ShieldAlert className="w-3 h-3 text-amber-700" />}
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {log.hospitalId ? (
                        <div className="flex items-center gap-1 font-mono">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.hospitalId}</span>
                        </div>
                      ) : (
                        <span className="text-sky-700 font-semibold text-[11px]">ALO Global</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      <div>{log.details}</div>
                      {log.target && <span className="text-[10px] text-slate-400 font-mono">Target: {log.target}</span>}
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

export default SuperAdminAuditTab;
