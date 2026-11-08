import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { ClinicalCase } from '../../types';
import {
  HOME_MOU_HOSPITALS,
  HOME_NEXT_PHASE_NOTE,
  HOME_NOTIFICATIONS,
  HOME_SERVICE_TILES,
} from '../../data/landing';
import { HomeSheet, HomeTab, PatientHomeShell } from '../mobile/PatientHomeShell';
import { DoctorsStrip, HomeGreeting, MedicalOpinionCard, QuickLinks } from '../mobile/PatientHomeTop';
import { AdsCarousel, DoctorsRosterList, ServiceGrid } from '../mobile/PatientHomeMid';
import { RequestTrackerCard, TravelAbroad, TrustAndOffices } from '../mobile/PatientHomeBottom';

type SheetId = 'notifications' | 'doctors' | 'account' | 'medical-file' | 'messages' | 'services' | 'india' | 'offers' | null;

interface Props {
  activeCase: ClinicalCase;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  onSelectService: (serviceId: string) => void;
  onOpenMyCases: () => void;
  onOpenWhatsApp?: () => void;
  onLogout?: () => void;
}

export const PatientHomeView: React.FC<Props> = ({
  activeCase,
  lang,
  onToggleLang,
  onSelectService,
  onOpenMyCases,
  onOpenWhatsApp,
  onLogout,
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<HomeTab>('home');
  const [sheet, setSheet] = useState<SheetId>(null);

  const closeSheet = () => setSheet(null);

  const scrollToTravel = () => {
    const element = document.getElementById('travel-abroad');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleTab = (tab: HomeTab) => {
    // No new screens in this phase: requests reuse the existing timeline,
    // everything else opens an inline sheet on the home page.
    if (tab === 'requests') {
      onOpenMyCases();
      return;
    }
    if (tab === 'account') {
      setSheet('account');
      return;
    }
    if (tab === 'medical-file') {
      setSheet('medical-file');
      return;
    }
    if (tab === 'messages') {
      setSheet('messages');
      return;
    }
    setActiveTab('home');
  };

  const patientName =
    (isAr ? activeCase.patientNameAr || activeCase.patientName : activeCase.patientNameEn || activeCase.patientName) || '';

  const sheetTitle: Record<Exclude<SheetId, null>, string> = {
    notifications: isAr ? 'الإشعارات' : 'Notifications',
    doctors: isAr ? 'الأطباء والتخصصات' : 'Doctors & specialties',
    account: isAr ? 'حساب المريض' : 'Patient account',
    'medical-file': isAr ? 'الملف الطبي' : 'Medical File',
    messages: isAr ? 'الرسائل' : 'Messages',
    services: isAr ? 'كل الخدمات' : 'All services',
    india: isAr ? 'مستشفياتنا في الهند' : 'Our hospitals in India',
    offers: isAr ? 'العروض' : 'Offers',
  };

  return (
    <PatientHomeShell
      isAr={isAr}
      onToggleLang={onToggleLang}
      onOpenWhatsApp={() => (onOpenWhatsApp ? onOpenWhatsApp() : setSheet('messages'))}
      onOpenNotifications={() => setSheet('notifications')}
      unreadCount={HOME_NOTIFICATIONS.length}
      activeTab={activeTab}
      onSelectTab={handleTab}
    >
      <div className="mx-auto w-full space-y-0">
        {/* 1. Greeting + search */}
        <HomeGreeting isAr={isAr} onSelectService={onSelectService} onViewDoctors={() => setSheet('doctors')} />

        {/* 2. Medical opinion - strongest element, on top */}
        <MedicalOpinionCard isAr={isAr} onStartRequest={() => onSelectService('second-opinion')} />

        {/* 3. Doctors and their specialties */}
        <DoctorsStrip isAr={isAr} onViewAll={() => setSheet('doctors')} />

        {/* 4. Quick links */}
        <QuickLinks
          isAr={isAr}
          onTreatmentAbroad={scrollToTravel}
          onTalkToNurse={() => (onOpenWhatsApp ? onOpenWhatsApp() : setSheet('messages'))}
          onOffers={() => setSheet('offers')}
        />

        {/* 5. Ads carousel */}
        <AdsCarousel isAr={isAr} onSelectService={onSelectService} />

        {/* 6. Services 3x3 */}
        <ServiceGrid isAr={isAr} onSelectService={onSelectService} onSeeAll={() => setSheet('services')} />

        {/* 7. Treatment Abroad */}
        <TravelAbroad isAr={isAr} onOpenIndia={() => setSheet('india')} />

        {/* 8. Current request - the client's five stages */}
        <RequestTrackerCard
          isAr={isAr}
          caseNumber={activeCase.caseNumber}
          currentStage={activeCase.currentStage}
          onTrack={onOpenMyCases}
        />

        {/* 9. Trust + offices */}
        <TrustAndOffices isAr={isAr} />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Inline sheets - destinations that would otherwise be new screens   */}
      {/* ------------------------------------------------------------------ */}

      <HomeSheet isOpen={sheet === 'notifications'} onClose={closeSheet} title={sheetTitle.notifications} isAr={isAr}>
        <div className="space-y-1.5">
          {HOME_NOTIFICATIONS.map((n) => (
            <div key={n.id} className="rounded-xl border border-slate-200/80 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] font-black text-slate-900">{isAr ? n.title.ar : n.title.en}</p>
                <span className="shrink-0 text-[9px] font-semibold text-slate-400">
                  {isAr ? n.time.ar : n.time.en}
                </span>
              </div>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-slate-500">
                {isAr ? n.body.ar : n.body.en}
              </p>
            </div>
          ))}
        </div>
      </HomeSheet>

      <HomeSheet isOpen={sheet === 'doctors'} onClose={closeSheet} title={sheetTitle.doctors} isAr={isAr}>
        <DoctorsRosterList isAr={isAr} onSelectService={onSelectService} />
      </HomeSheet>

      <HomeSheet isOpen={sheet === 'services'} onClose={closeSheet} title={sheetTitle.services} isAr={isAr}>
        <div className="grid grid-cols-2 gap-2">
          {HOME_SERVICE_TILES.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => {
                  closeSheet();
                  onSelectService(service.routeTo);
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-200/80 p-2.5 text-start transition-shadow hover:shadow-sm"
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${service.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[10.5px] font-bold leading-tight text-slate-700">
                  {isAr ? service.label.ar : service.label.en}
                </span>
              </button>
            );
          })}
        </div>
      </HomeSheet>

      <HomeSheet isOpen={sheet === 'india'} onClose={closeSheet} title={sheetTitle.india} isAr={isAr}>
        <div className="space-y-1">
          {HOME_MOU_HOSPITALS.map((hospital) => (
            <div key={hospital} className="flex items-center gap-2 border-b border-slate-100 py-2 last:border-0">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-alo-teal" />
              <span className="text-[11.5px] font-semibold text-slate-700">{hospital}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-xl bg-[#EAF2FB] p-2.5 text-[10px] leading-relaxed text-slate-500">
          {isAr
            ? 'تبدأ الرحلة برأي طبي دولي من طبيبك السعودي، ثم ننسق لك مع المستشفى.'
            : 'The journey starts with an international opinion from your Saudi doctor, then we coordinate with the hospital.'}
        </p>
      </HomeSheet>

      <HomeSheet isOpen={sheet === 'account'} onClose={closeSheet} title={sheetTitle.account} isAr={isAr}>
        <div className="rounded-2xl bg-alo-navy p-4 text-white">
          <div className="flex items-center justify-between text-[10px] text-white/60">
            <span className="font-mono">{activeCase.caseNumber}</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] font-bold">
              {isAr ? 'هوية موثقة' : 'Verified ID'}
            </span>
          </div>
          <p className="mt-1 text-[14px] font-black">{patientName}</p>
          <p className="mt-0.5 text-[10px] text-white/60">
            {isAr ? 'الهوية الوطنية:' : 'National ID:'}{' '}
            <span className="font-mono">{activeCase.nationalIdMasked || '—'}</span>
          </p>
        </div>

        <div className="mt-2.5 space-y-2">
          <button
            type="button"
            onClick={() => {
              closeSheet();
              onOpenMyCases();
            }}
            className="flex w-full items-center justify-between rounded-xl bg-alo-teal px-3.5 py-3 text-[11.5px] font-black text-white"
          >
            <span>{isAr ? 'متابعة حالتي (٩ مراحل)' : 'View my case (9 stages)'}</span>
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => {
              closeSheet();
              onSelectService('second-opinion');
            }}
            className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-3.5 py-3 text-[11.5px] font-black text-slate-800"
          >
            <span>{isAr ? 'بدء طلب جديد' : 'Start a new request'}</span>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </button>
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                closeSheet();
                onLogout();
              }}
              className="flex w-full items-center justify-between rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-3 text-[11.5px] font-black text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <span>{isAr ? 'تسجيل الخروج والتحقق برقم جوال آخر (OTP)' : 'Sign Out & Verify with Mobile OTP'}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </button>
          )}
        </div>
      </HomeSheet>

      {(['medical-file', 'messages', 'offers'] as const).map((id) => (
        <HomeSheet key={id} isOpen={sheet === id} onClose={closeSheet} title={sheetTitle[id]} isAr={isAr}>
          <p className="rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
            {isAr ? HOME_NEXT_PHASE_NOTE.ar : HOME_NEXT_PHASE_NOTE.en}
          </p>
        </HomeSheet>
      ))}
    </PatientHomeShell>
  );
};
