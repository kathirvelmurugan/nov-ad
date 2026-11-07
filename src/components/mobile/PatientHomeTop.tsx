import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowLeft, ChevronRight, Globe, Search, Sparkles, Stethoscope } from 'lucide-react';
import {
  Bilingual,
  HOME_CONSULTANTS,
  HOME_DESTINATIONS,
  HOME_OPINION_KICKER,
  HOME_OPINION_TITLE,
  HOME_SERVICE_TILES,
} from '../../data/landing';
import { DestinationFlag } from './DestinationFlag';

const pick = (value: Bilingual, isAr: boolean) => (isAr ? value.ar : value.en);

/* -------------------------------------------------------------------------- */
/* Greeting + single search (services, specialties, doctors)                  */
/* -------------------------------------------------------------------------- */

interface GreetingProps {
  isAr: boolean;
  onSelectService: (serviceId: string) => void;
  onViewDoctors: () => void;
}

export const HomeGreeting: React.FC<GreetingProps> = ({ isAr, onSelectService, onViewDoctors }) => {
  const [query, setQuery] = useState('');

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (isAr) {
      if (hour < 12) return 'صباح الخير';
      if (hour < 17) return 'مساء الخير';
      return 'مساء الخير';
    }
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, [isAr]);

  const term = query.trim().toLowerCase();

  const serviceHits = term
    ? HOME_SERVICE_TILES.filter(
        (s) => pick(s.label, isAr).toLowerCase().includes(term) || s.id.includes(term),
      ).slice(0, 4)
    : [];

  const doctorHits = term
    ? HOME_CONSULTANTS.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.specialty.en.toLowerCase().includes(term) ||
          d.center.toLowerCase().includes(term),
      ).slice(0, 3)
    : [];

  const destinationHits = term
    ? HOME_DESTINATIONS.filter((d) => pick(d.name, isAr).toLowerCase().includes(term))
    : [];

  const hasHits = serviceHits.length + doctorHits.length + destinationHits.length > 0;

  return (
    <section className="space-y-1">
      <h1 className="text-[22px] font-black leading-tight text-slate-900">{greeting}</h1>
      <p className="text-[11.5px] font-medium text-slate-400">
        {isAr ? 'تصفح دون تسجيل.' : 'Browse without signing up.'}
      </p>

      <div className="relative pt-2.5">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 shadow-[0_1px_3px_rgba(15,35,60,0.04)] focus-within:border-alo-navy/30">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAr ? 'ابحث عن خدمة أو تخصص أو طبيب' : 'Search services, specialties or doctors'}
            className="w-full bg-transparent text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
            aria-label={isAr ? 'بحث' : 'Search'}
          />
        </div>

        {/* Grouped results - stays inside the home page, no new screen */}
        {term && (
          <div className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
            {!hasHits && (
              <p className="px-3 py-4 text-center text-[11.5px] text-slate-400">
                {isAr ? 'لا توجد نتائج مطابقة.' : 'No matching results.'}
              </p>
            )}

            {serviceHits.length > 0 && (
              <p className="px-2 pb-1 pt-2 text-[9.5px] font-black uppercase tracking-wider text-slate-400">
                {isAr ? 'الخدمات' : 'Services'}
              </p>
            )}
            {serviceHits.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setQuery('');
                    onSelectService(s.routeTo);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-start hover:bg-slate-50"
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.tone}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[12px] font-bold text-slate-800">{pick(s.label, isAr)}</span>
                </button>
              );
            })}

            {doctorHits.length > 0 && (
              <p className="px-2 pb-1 pt-2 text-[9.5px] font-black uppercase tracking-wider text-slate-400">
                {isAr ? 'الأطباء' : 'Doctors'}
              </p>
            )}
            {doctorHits.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setQuery('');
                  onViewDoctors();
                }}
                className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2 text-start hover:bg-slate-50"
              >
                <span>
                  <span className="block text-[12px] font-bold text-slate-800">{d.name}</span>
                  <span className="block text-[10px] text-slate-400">
                    {pick(d.specialty, isAr)} · {pick(d.city, isAr)}
                  </span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 rtl:rotate-180" />
              </button>
            ))}

            {destinationHits.length > 0 && (
              <p className="px-2 pb-1 pt-2 text-[9.5px] font-black uppercase tracking-wider text-slate-400">
                {isAr ? 'الوجهات' : 'Destinations'}
              </p>
            )}
            {destinationHits.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-xl px-2 py-2 text-[12px] font-bold text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <DestinationFlag id={d.id} className="h-3 w-4" />
                  {pick(d.name, isAr)}
                </span>
                {d.status === 'comingSoon' && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                    {isAr ? 'قريباً' : 'Coming soon'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Medical opinion - strongest element on the page                            */
/* -------------------------------------------------------------------------- */

interface OpinionProps {
  isAr: boolean;
  onStartRequest: () => void;
}

export const MedicalOpinionCard: React.FC<OpinionProps> = ({ isAr, onStartRequest }) => {
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section className="pt-4">
      <div
        data-testid="opinion-card"
        className="relative overflow-hidden rounded-3xl bg-alo-navy p-5 text-white shadow-[0_10px_30px_rgba(15,35,60,0.22)]"
      >
        {/* Globe motif */}
        <svg
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -end-10 -top-6 h-48 w-48 text-white/10"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="100" cy="100" rx="86" ry="34" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="100" cy="100" rx="34" ry="86" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="100" cy="100" rx="62" ry="86" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>

        <div className="relative">
          {/* PLACEHOLDER heading - client said the title is still to be decided */}
          <h2 className="text-[19px] font-black leading-snug">{pick(HOME_OPINION_TITLE, isAr)}</h2>
          <p className="mt-0.5 text-[11.5px] font-medium text-white/70">{pick(HOME_OPINION_KICKER, isAr)}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onStartRequest}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[12.5px] font-black text-alo-navy shadow-sm transition-transform active:scale-95"
            >
              <span>{isAr ? 'ابدأ الطلب' : 'Start request'}</span>
              <ArrowIcon className="h-3.5 w-3.5" />
            </button>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10.5px] font-bold text-white/85">
              <Stethoscope className="h-3 w-3" />
              {isAr ? 'طبيب سعودي + استشاري دولي' : 'Saudi doctor + International consultant'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Doctors and specialties, under the medical opinion                         */
/* -------------------------------------------------------------------------- */

interface DoctorsProps {
  isAr: boolean;
  onViewAll: () => void;
}

export const DoctorsStrip: React.FC<DoctorsProps> = ({ isAr, onViewAll }) => {
  return (
    <section className="pt-5">
      <div className="mb-2.5 flex items-end justify-between">
        <h3 className="text-[13.5px] font-black text-slate-900">
          {isAr ? 'الأطباء والتخصصات' : 'Doctors & specialties'}
        </h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-[11px] font-bold text-alo-teal"
        >
          {isAr ? 'عرض الكل' : 'View all'}
        </button>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
        {HOME_CONSULTANTS.slice(0, 3).map((doctor) => (
          <button
            key={doctor.id}
            type="button"
            onClick={onViewAll}
            data-testid="doctor-card"
            className="w-[168px] shrink-0 rounded-2xl border border-slate-200/80 bg-white p-3 text-start shadow-[0_1px_3px_rgba(15,35,60,0.04)] transition-shadow hover:shadow-md"
          >
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-alo-mint text-[11px] font-black text-alo-teal">
              {doctor.name.replace('Dr. ', '').charAt(0)}
            </div>
            <p className="truncate text-[11.5px] font-black text-slate-900">{doctor.name}</p>
            <p className="truncate text-[10px] font-medium text-alo-teal">{pick(doctor.specialty, isAr)}</p>
            <p className="mt-0.5 truncate text-[9.5px] text-slate-400">
              {doctor.center} · {pick(doctor.city, isAr)}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Quick links under the main card                                            */
/* -------------------------------------------------------------------------- */

interface QuickLinksProps {
  isAr: boolean;
  onTreatmentAbroad: () => void;
  onTalkToNurse: () => void;
  onOffers: () => void;
}

export const QuickLinks: React.FC<QuickLinksProps> = ({
  isAr,
  onTreatmentAbroad,
  onTalkToNurse,
  onOffers,
}) => {
  const links = [
    { id: 'abroad', icon: Globe, label: { en: 'Treatment Abroad', ar: 'العلاج بالخارج' }, onClick: onTreatmentAbroad },
    { id: 'nurse', icon: Stethoscope, label: { en: 'Talk to a Nurse', ar: 'تحدث مع ممرض' }, onClick: onTalkToNurse },
    { id: 'offers', icon: Sparkles, label: { en: 'Offers', ar: 'العروض' }, onClick: onOffers },
  ];

  return (
    <section className="grid grid-cols-3 gap-2 pt-4">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <button
            key={link.id}
            type="button"
            onClick={link.onClick}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white px-1 py-3 text-center shadow-[0_1px_3px_rgba(15,35,60,0.04)] transition-shadow hover:shadow-md"
          >
            <Icon className="h-4 w-4 text-alo-navy" />
            <span className="text-[9.5px] font-bold leading-tight text-slate-700">
              {isAr ? link.label.ar : link.label.en}
            </span>
          </button>
        );
      })}
    </section>
  );
};
