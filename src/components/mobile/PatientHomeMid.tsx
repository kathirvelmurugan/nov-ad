import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { Bilingual, HOME_ADS, HOME_CONSULTANTS, HOME_SERVICE_TILES } from '../../data/landing';

const pick = (value: Bilingual, isAr: boolean) => (isAr ? value.ar : value.en);

/* -------------------------------------------------------------------------- */
/* Ads carousel - max 3 slides, rotates every 5s, pauses on touch             */
/* -------------------------------------------------------------------------- */

interface AdsProps {
  isAr: boolean;
  onSelectService: (serviceId: string) => void;
}

const ROTATE_MS = 5000;

export const AdsCarousel: React.FC<AdsProps> = ({ isAr, onSelectService }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % HOME_ADS.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  useEffect(
    () => () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    },
    [],
  );

  const pause = () => setPaused(true);
  const resumeSoon = () => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), 4000);
  };

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section
      className="pt-5"
      onPointerDown={pause}
      onPointerUp={resumeSoon}
      onPointerCancel={resumeSoon}
      onMouseEnter={pause}
      onMouseLeave={resumeSoon}
      aria-roledescription="carousel"
    >
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${(isAr ? 1 : -1) * index * 100}%)` }}
        >
          {HOME_ADS.map((ad) => (
            <div
              key={ad.id}
              className="w-full shrink-0 rounded-2xl border border-sky-100 bg-[#EAF2FB] p-4"
              style={{ minWidth: '100%' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[9.5px] font-bold text-sky-700">
                    <span>{pick(ad.tag, isAr)}</span>
                    {ad.isPartnerAd && (
                      <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-sky-600">
                        {isAr ? 'شريك' : 'Partner ad'}
                      </span>
                    )}
                  </p>
                  <h3 className="mt-1 truncate text-[14px] font-black text-alo-navy">
                    {pick(ad.title, isAr)}
                  </h3>
                  <p className="mt-0.5 truncate text-[10.5px] text-slate-500">{pick(ad.subtitle, isAr)}</p>
                  <button
                    type="button"
                    onClick={() => onSelectService(ad.serviceId)}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-alo-navy px-3 py-1.5 text-[10.5px] font-black text-white transition-transform active:scale-95"
                  >
                    <span>{pick(ad.cta, isAr)}</span>
                    <ArrowIcon className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sky-600 shadow-sm">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 3c3 4 6 5.5 6 9a6 6 0 1 1-12 0c0-3.5 3-5 6-9Z" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="mt-2 flex items-center justify-center gap-1.5">
        {HOME_ADS.map((ad, i) => (
          <button
            key={ad.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${isAr ? 'شريحة' : 'Slide'} ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-4 bg-alo-navy' : 'w-1.5 bg-slate-300'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Services - 3x3, short names, one colour and icon per service               */
/* -------------------------------------------------------------------------- */

interface ServicesProps {
  isAr: boolean;
  onSelectService: (serviceId: string) => void;
  onSeeAll: () => void;
}

export const ServiceGrid: React.FC<ServicesProps> = ({ isAr, onSelectService, onSeeAll }) => {
  return (
    <section className="pt-5">
      <div className="mb-2.5 flex items-end justify-between">
        <h3 className="text-[13.5px] font-black text-slate-900">{isAr ? 'الخدمات' : 'Services'}</h3>
        <button type="button" onClick={onSeeAll} className="text-[11px] font-bold text-alo-teal">
          {isAr ? 'عرض الكل' : 'See all'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {HOME_SERVICE_TILES.map((service) => {
          const Icon = service.icon;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelectService(service.routeTo)}
              data-testid="service-tile"
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-1.5 py-3.5 shadow-[0_1px_3px_rgba(15,35,60,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${service.tone}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="line-clamp-2 text-center text-[9.5px] font-bold leading-tight text-slate-700">
                {pick(service.label, isAr)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Full doctors roster (opened from "View all")                               */
/* -------------------------------------------------------------------------- */

export const DoctorsRosterList: React.FC<{ isAr: boolean; onSelectService: (id: string) => void }> = ({
  isAr,
  onSelectService,
}) => {
  return (
    <div className="space-y-1.5">
      {HOME_CONSULTANTS.map((doctor) => (
        <button
          key={doctor.id}
          type="button"
          onClick={() => onSelectService('second-opinion')}
          className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 text-start transition-shadow hover:shadow-sm"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-alo-mint text-[12px] font-black text-alo-teal">
            {doctor.name.replace('Dr. ', '').charAt(0)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-black text-slate-900">{doctor.name}</span>
            <span className="block truncate text-[10.5px] font-semibold text-alo-teal">
              {pick(doctor.specialty, isAr)}
            </span>
            <span className="block truncate text-[9.5px] text-slate-400">
              {doctor.center} · {pick(doctor.city, isAr)}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 rtl:rotate-180" />
        </button>
      ))}
    </div>
  );
};
