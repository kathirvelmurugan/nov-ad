import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Info,
  Mail,
  MapPin,
  MessageSquare,
  PhoneCall,
} from 'lucide-react';
import { ClinicalStage } from '../../types';
import {
  Bilingual,
  HOME_CONTACT,
  HOME_DESTINATIONS,
  HOME_MOU_HOSPITALS,
  HOME_OFFICES,
  HOME_TRACKER_STAGES,
  HOME_TRUST_POINTS,
  homeTrackerIndex,
} from '../../data/landing';
import { DestinationFlag } from './DestinationFlag';

const pick = (value: Bilingual, isAr: boolean) => (isAr ? value.ar : value.en);

/* -------------------------------------------------------------------------- */
/* Treatment Abroad - India live, everything else flag + name + Coming soon   */
/* -------------------------------------------------------------------------- */

interface TravelProps {
  isAr: boolean;
  onOpenIndia: () => void;
}

export const TravelAbroad: React.FC<TravelProps> = ({ isAr, onOpenIndia }) => {
  const india = HOME_DESTINATIONS.find((d) => d.id === 'india')!;
  const comingSoon = HOME_DESTINATIONS.filter((d) => d.status === 'comingSoon');

  return (
    <section id="travel-abroad" className="pt-5">
      <div className="mb-2.5 flex items-end justify-between">
        <div>
          <h3 className="text-[13.5px] font-black text-slate-900">
            {isAr ? 'العلاج بالخارج' : 'Treatment Abroad'}
          </h3>
          <p className="text-[10px] font-medium text-slate-400">
            {isAr ? 'مستشفيات شركاؤنا' : 'Our partner hospitals'}
          </p>
        </div>
        <button type="button" onClick={onOpenIndia} className="text-[11px] font-bold text-alo-teal">
          {isAr ? 'عرض الكل' : 'See all'}
        </button>
      </div>

      {/* Active destination: India */}
      <button
        type="button"
        onClick={onOpenIndia}
        data-testid="india-card"
        className="w-full rounded-2xl border border-slate-200/80 bg-white p-3 text-start shadow-[0_1px_3px_rgba(15,35,60,0.04)] transition-shadow hover:shadow-md"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <DestinationFlag id={india.id} className="h-4 w-6" />
            <div>
              <p className="text-[12.5px] font-black text-slate-900">{pick(india.name, isAr)}</p>
              <p className="text-[10px] font-semibold text-alo-teal">
                {isAr
                  ? `${india.hospitalCount} مستشفى`
                  : `${india.hospitalCount} hospitals`}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 rtl:rotate-180" />
        </div>

        {/* The 12 MOU hospitals travel as one (swipeable) line.
            PLACEHOLDER names until the client supplies the list. */}
        <div className="no-scrollbar mt-2.5 flex items-center gap-2 overflow-x-auto border-t border-slate-100 pt-2.5">
          {HOME_MOU_HOSPITALS.map((hospital, i) => (
            <span
              key={hospital}
              data-testid="mou-hospital"
              className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[9.5px] font-semibold text-slate-500"
            >
              <span>{hospital}</span>
              {i < HOME_MOU_HOSPITALS.length - 1 && <span className="text-slate-300">·</span>}
            </span>
          ))}
        </div>
      </button>

      {/* Coming soon: flag + name + label only. Deliberately not a button. */}
      <div className="mt-2 space-y-2">
        {comingSoon.map((destination) => (
          <div
            key={destination.id}
            data-testid="coming-soon"
            aria-disabled="true"
            className="flex items-center justify-between gap-2 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-3 py-2.5"
          >
            <span className="flex items-center gap-2">
              <DestinationFlag id={destination.id} className="h-3.5 w-5 opacity-70" />
              <span className="text-[11px] font-bold text-slate-400">{pick(destination.name, isAr)}</span>
            </span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-slate-400">
              {isAr ? 'قريباً' : 'Coming soon'}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-2 flex items-start gap-1.5 text-[9.5px] leading-relaxed text-slate-400">
        <Info className="mt-[1px] h-3 w-3 shrink-0" />
        <span>
          {isAr
            ? 'تبدأ برأي طبي دولي من طبيبك السعودي'
            : 'Starts with an international opinion from your Saudi doctor'}
        </span>
      </p>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Current request - the client's five customer-facing stages                 */
/* -------------------------------------------------------------------------- */

interface TrackerProps {
  isAr: boolean;
  caseNumber: string;
  currentStage: ClinicalStage;
  onTrack: () => void;
}

export const RequestTrackerCard: React.FC<TrackerProps> = ({ isAr, caseNumber, currentStage, onTrack }) => {
  const activeIndex = homeTrackerIndex(currentStage);
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section className="pt-5">
      <div className="rounded-2xl border border-sky-100 bg-[#EAF2FB] p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] font-bold text-slate-500">
              {isAr ? 'الطلب الحالي' : 'Current request'}
            </span>
            <span className="font-mono text-[11px] font-black text-alo-navy">{caseNumber}</span>
          </div>
          <button
            type="button"
            onClick={onTrack}
            className="inline-flex items-center gap-1 text-[10.5px] font-black text-alo-teal"
          >
            <span>{isAr ? 'تتبع' : 'Track'}</span>
            <ArrowIcon className="h-3 w-3" />
          </button>
        </div>

        <div className="relative mt-3">
          {/* connector */}
          <div className="absolute inset-x-2 top-[9px] h-px bg-slate-300/70" aria-hidden="true" />
          <div
            className="absolute top-[9px] h-px bg-alo-teal transition-all duration-500"
            style={{
              insetInlineStart: '0.5rem',
              width: `calc((100% - 1rem) * ${activeIndex / (HOME_TRACKER_STAGES.length - 1)})`,
            }}
            aria-hidden="true"
          />

          <div className="relative flex items-start justify-between">
            {HOME_TRACKER_STAGES.map((stage, i) => {
              const isDone = i < activeIndex;
              const isCurrent = i === activeIndex;
              return (
                <div key={stage.key} data-testid="tracker-step" className="flex w-[19%] flex-col items-center gap-1">
                  <span
                    className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 bg-white text-[8px] font-black ${
                      isDone
                        ? 'border-alo-teal bg-alo-teal text-white'
                        : isCurrent
                        ? 'border-alo-teal text-alo-teal ring-4 ring-alo-teal/15'
                        : 'border-slate-300 text-slate-300'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                  </span>
                  <span
                    className={`text-center text-[8.5px] font-bold leading-tight ${
                      isCurrent ? 'text-alo-navy' : isDone ? 'text-alo-teal' : 'text-slate-400'
                    }`}
                  >
                    {pick(stage.label, isAr)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Trust points + offices                                                     */
/* -------------------------------------------------------------------------- */

export const TrustAndOffices: React.FC<{ isAr: boolean }> = ({ isAr }) => {
  return (
    <section className="pt-5">
      <div className="grid grid-cols-3 gap-2">
        {HOME_TRUST_POINTS.map((point) => {
          const Icon = point.icon;
          return (
            <div
              key={point.id}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white px-1.5 py-3 text-center shadow-[0_1px_3px_rgba(15,35,60,0.04)]"
            >
              <Icon className="h-4 w-4 text-alo-teal" />
              <span className="text-[9px] font-bold leading-tight text-slate-600">
                {pick(point.title, isAr)}
              </span>
            </div>
          );
        })}
      </div>

      {/* PLACEHOLDER contact details - pending client confirmation */}
      <div className="mt-2.5 rounded-2xl bg-alo-navy p-4 text-white">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-white/60" />
          <p className="text-[10.5px] font-black">{isAr ? 'مكاتبنا' : 'Our offices'}</p>
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-white/70">{pick(HOME_OFFICES, isAr)}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-white/10 pt-2.5 text-[10px]">
          <a href={`tel:${HOME_CONTACT.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 font-semibold text-white/85">
            <PhoneCall className="h-3 w-3 text-white/50" />
            <span dir="ltr">{HOME_CONTACT.phone}</span>
          </a>
          <a href={`mailto:${HOME_CONTACT.email}`} className="flex items-center gap-1.5 font-semibold text-white/85">
            <Mail className="h-3 w-3 text-white/50" />
            <span dir="ltr">{HOME_CONTACT.email}</span>
          </a>
          <span className="flex items-center gap-1.5 font-semibold text-white/60">
            <MessageSquare className="h-3 w-3 text-white/40" />
            <span dir="ltr">{HOME_CONTACT.handle}</span>
          </span>
        </div>
      </div>
    </section>
  );
};
