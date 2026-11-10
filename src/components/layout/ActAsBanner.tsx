import React from 'react';
import { Eye, ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';
import { Persona } from '../../types';
import { ROLE_PERMISSIONS, RoleCode } from '../../data/rbacMatrix';

interface ImpersonationSession {
  originalPersona: Persona;
  originalHospitalId?: string;
  actingAs: Persona;
  actingHospitalId?: string;
}

interface ActAsBannerProps {
  isRTL: boolean;
  session: ImpersonationSession | null;
  onExitPreview: () => void;
}

export const ActAsBanner: React.FC<ActAsBannerProps> = ({
  isRTL,
  session,
  onExitPreview,
}) => {
  if (!session) return null;

  const roleCode = session.actingAs.code as RoleCode;
  const spec = ROLE_PERMISSIONS[roleCode];
  const roleName = spec ? (isRTL ? spec.roleNameAr : spec.roleNameEn) : session.actingAs.name;

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 bg-amber-500 text-slate-950 px-4 py-2.5 shadow-md flex items-center justify-between gap-4 font-sans text-xs sm:text-sm border-b border-amber-600 transition-all"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-2.5 font-bold">
        <span className="p-1 rounded-lg bg-amber-600 text-white animate-pulse">
          <Eye className="w-4 h-4" />
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-extrabold uppercase tracking-wider text-[11px] bg-slate-900 text-amber-400 px-2 py-0.5 rounded">
            {isRTL ? 'وضع المعاينة الفورية' : 'Act-As Preview Mode'}
          </span>
          <span className="text-slate-900">
            {isRTL ? 'أنت تعاين النظام الآن بصلاحيات:' : 'Currently previewing as:'}
          </span>
          <span className="underline decoration-slate-900 font-extrabold text-slate-950">
            {roleName} ({roleCode})
          </span>
          {session.actingHospitalId && (
            <span className="text-slate-800 text-xs font-mono">
              [{session.actingHospitalId}]
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onExitPreview}
        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-transform active:scale-95 shrink-0"
      >
        <span>
          {isRTL
            ? `العودة إلى ${session.originalPersona.code === 'AD' ? 'المدير الأعلى' : 'مدير المستشفى'}`
            : `Return to ${session.originalPersona.code === 'AD' ? 'Super Admin' : 'Hospital Admin'}`}
        </span>
        {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

export default ActAsBanner;
