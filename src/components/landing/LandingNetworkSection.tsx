import React from 'react';
import { Building2, Award, FlaskConical, ShieldCheck, Lock } from 'lucide-react';

interface Props {
  isAr: boolean;
}

export const LandingNetworkSection: React.FC<Props> = ({ isAr }) => {
  return (
    <section id="network" className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3.5 py-1.5 rounded-full inline-block">
            {isAr ? 'شراكات رعاية معتمدة' : 'Accredited Healthcare Network'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isAr ? 'شبكتنا الطبية في المملكة وحول العالم' : 'Our Healthcare & Hospital Network'}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            {isAr
              ? 'نربط المرضى في المملكة العربية السعودية بأعرق المستشفيات المرجعية المحلية والمراكز الاستشارية الدولية الرائدة.'
              : 'Connecting patients in Saudi Arabia with leading domestic tertiary hospitals and renowned international centers of excellence.'}
          </p>
        </div>

        {/* Network Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl text-center space-y-1.5 hover:border-emerald-500 transition-colors">
            <Building2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="text-xs font-bold text-slate-100">{isAr ? 'مستشفى رعاية الرياض' : 'Riyadh Care'}</p>
            <p className="text-[10px] text-slate-400 font-mono">Saudi Partner</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl text-center space-y-1.5 hover:border-emerald-500 transition-colors">
            <Building2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="text-xs font-bold text-slate-100">{isAr ? 'سليمان فقيه جدة' : 'Fakeeh Health'}</p>
            <p className="text-[10px] text-slate-400 font-mono">Saudi Partner</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl text-center space-y-1.5 hover:border-emerald-500 transition-colors">
            <Building2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="text-xs font-bold text-slate-100">{isAr ? 'مستشفى بروكير الخبر' : 'Procare Khobar'}</p>
            <p className="text-[10px] text-slate-400 font-mono">Saudi Partner</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl text-center space-y-1.5 hover:border-emerald-500 transition-colors">
            <Award className="w-6 h-6 text-teal-400 mx-auto" />
            <p className="text-xs font-bold text-slate-100">Apollo Hospitals</p>
            <p className="text-[10px] text-slate-400 font-mono">Chennai / Hyderabad</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl text-center space-y-1.5 hover:border-emerald-500 transition-colors">
            <Award className="w-6 h-6 text-teal-400 mx-auto" />
            <p className="text-xs font-bold text-slate-100">Fortis Memorial</p>
            <p className="text-[10px] text-slate-400 font-mono">Gurugram / Delhi</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl text-center space-y-1.5 hover:border-emerald-500 transition-colors">
            <FlaskConical className="w-6 h-6 text-sky-400 mx-auto" />
            <p className="text-xs font-bold text-slate-100">{isAr ? 'مختبرات ألفا والبرج' : 'Alpha & Al-Borg'}</p>
            <p className="text-[10px] text-slate-400 font-mono">Diagnostic Labs</p>
          </div>
        </div>

        {/* Regulatory Accreditation Strip */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex flex-wrap items-center justify-around gap-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SDAIA Personal Data Protection Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Saudi Ministry of Health Telehealth Protocols</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>ZATCA Phase 2 E-Invoicing Integration</span>
          </div>
        </div>
      </div>
    </section>
  );
};
