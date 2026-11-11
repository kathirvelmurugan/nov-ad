import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { ClinicalCase } from '../../types';
import { UserSession } from '../../hooks/workflowConstants';
import { HEALTHCARE_SERVICES, LANDING_FAQ_ITEMS } from '../../data/healthcareServices';
import { LandingHeader } from '../landing/LandingHeader';
import { LandingHeroSection } from '../landing/LandingHeroSection';
import { LandingServicesSection } from '../landing/LandingServicesSection';
import { LandingHowItWorksSection } from '../landing/LandingHowItWorksSection';
import { LandingNetworkSection } from '../landing/LandingNetworkSection';
import { LandingManagementSection } from '../landing/LandingManagementSection';
import { LandingFaqSection } from '../landing/LandingFaqSection';
import { LandingFooter } from '../landing/LandingFooter';
import { LandingAccountModal } from '../landing/LandingAccountModal';

export { HEALTHCARE_SERVICES };
export type { HealthcareServiceItem } from '../../data/healthcareServices';

interface Props {
  activeCase: ClinicalCase;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  onSelectService: (serviceId: string) => void;
  onOpenMyCases: () => void;
  onOpenNewCaseModal?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onStartCase?: () => void;
  onLogout?: () => void;
  userSession?: UserSession | null;
  onOpenLogin?: () => void;
}

export const PatientLandingView: React.FC<Props> = ({
  activeCase,
  lang,
  onToggleLang,
  onSelectService,
  onOpenMyCases,
  onStartCase,
  onLogout,
  userSession,
  onOpenLogin,
}) => {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('second-opinion');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleServiceClick = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    if (!userSession && onOpenLogin) {
      onOpenLogin();
      return;
    }
    onSelectService(serviceId);
  };

  const handleStartConsultation = () => {
    if (!userSession && onOpenLogin) {
      onOpenLogin();
      return;
    }
    if (onStartCase) onStartCase();
    else onSelectService('second-opinion');
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <LandingHeader
        isAr={isAr}
        onToggleLang={onToggleLang}
        onOpenAccountModal={() => {
          if (!userSession && onOpenLogin) onOpenLogin();
          else setAccountModalOpen(true);
        }}
        onScrollToSection={scrollToSection}
      />

      <LandingHeroSection
        isAr={isAr}
        ArrowIcon={ArrowIcon}
        onStartCase={handleStartConsultation}
        onScrollToSection={scrollToSection}
      />

      <LandingServicesSection
        isAr={isAr}
        ArrowIcon={ArrowIcon}
        services={HEALTHCARE_SERVICES}
        selectedServiceId={selectedServiceId}
        onServiceClick={handleServiceClick}
      />

      <LandingHowItWorksSection isAr={isAr} />

      <LandingNetworkSection isAr={isAr} />

      <LandingManagementSection
        isAr={isAr}
        ArrowIcon={ArrowIcon}
        onOpenMyCases={() => {
          if (!userSession && onOpenLogin) onOpenLogin();
          else onOpenMyCases();
        }}
        onServiceClick={handleServiceClick}
      />

      <LandingFaqSection isAr={isAr} faqItems={LANDING_FAQ_ITEMS} />

      <LandingFooter isAr={isAr} onScrollToSection={scrollToSection} />

      <LandingAccountModal
        isAr={isAr}
        ArrowIcon={ArrowIcon}
        activeCase={activeCase}
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        onOpenMyCases={onOpenMyCases}
        onStartCase={handleStartConsultation}
        onScrollToSection={scrollToSection}
        onLogout={onLogout}
      />
    </div>
  );
};
