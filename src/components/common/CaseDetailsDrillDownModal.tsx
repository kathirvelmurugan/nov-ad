import React, { useState } from 'react';
import { Layers, Activity, Stethoscope, MessageSquare, Receipt } from 'lucide-react';
import { ClinicalCase } from '../../types';
import { getStageBadgeMeta } from './PortalCaseTrackerPanel';
import { BilingualReportModal } from '../cockpit/BilingualReportModal';
import DrillDownHeader, { TabType, DrillDownHeaderTab } from '../modals/drilldown/DrillDownHeader';
import DrillDownJourneyTab from '../modals/drilldown/DrillDownJourneyTab';
import DrillDownClinicalTab from '../modals/drilldown/DrillDownClinicalTab';
import DrillDownOpinionsTab from '../modals/drilldown/DrillDownOpinionsTab';
import DrillDownFollowUpTab from '../modals/drilldown/DrillDownFollowUpTab';
import DrillDownFacilityTab from '../modals/drilldown/DrillDownFacilityTab';

interface CaseDetailsDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: ClinicalCase | null;
  lang?: 'ar' | 'en';
}

export const CaseDetailsDrillDownModal: React.FC<CaseDetailsDrillDownModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  lang = 'ar',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('journey');
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'pdf1' | 'pdf2'>('pdf1');

  if (!isOpen || !caseItem) return null;

  const isRTL = lang === 'ar';
  const stageMeta = getStageBadgeMeta(caseItem.currentStage, isRTL);

  const patientName = isRTL
    ? caseItem.patientNameAr || caseItem.patientName || 'مريض غير محدد'
    : caseItem.patientNameEn || caseItem.patientName || 'Patient';

  const diagnosis = isRTL
    ? caseItem.diagnosisAr || caseItem.diagnosis || 'استشارة طبية عامة'
    : caseItem.diagnosisEn || caseItem.diagnosis || 'Clinical Consultation';

  const hospitalName = isRTL
    ? caseItem.treatingDoctor?.hospital || 'مجمع الرعاية الطبية - الرياض'
    : caseItem.treatingDoctor?.hospital || 'Riyadh Care Medical Center';

  const doctorName = caseItem.treatingDoctor?.name || 'د. عبدالله الشمري';
  const consultantName = caseItem.consultant?.name || 'Dr. Pradeep Kumar, MBBS, MS, MCh (CTVS)';

  const patientQuestions = (caseItem.metadata?.patientQuestions as string[]) || [];
  const followUpAnswers =
    (caseItem.metadata?.coordinatorReplies as string[]) ||
    (caseItem.metadata?.followUpAnswers as string[]) ||
    (caseItem.metadata?.consultantAnswers as string[]) ||
    [];

  const isPdf2Available = Boolean(caseItem.metadata?.pdf2Released || caseItem.currentStage === 'CLOSED');

  const tabs: DrillDownHeaderTab[] = [
    { id: 'journey', labelAr: 'المسار والمرحلة الحالية', labelEn: 'Journey & Stage', icon: <Layers className="w-4 h-4" /> },
    { id: 'clinical', labelAr: 'الملف السريري والتشخيص', labelEn: 'Clinical Dossier', icon: <Activity className="w-4 h-4" /> },
    { id: 'opinions', labelAr: 'الرأي الطبي والتقارير', labelEn: 'Specialist Opinions', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'followup', labelAr: 'متابعة 21 يوماً والإغلاق', labelEn: 'Follow-Up & Closure', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'facility', labelAr: 'أوامر المنشأة والفوترة', labelEn: 'Facility Orders & ZATCA', icon: <Receipt className="w-4 h-4" /> },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-cairo"
      dir={isRTL ? 'rtl' : 'ltr'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <DrillDownHeader
          caseItem={caseItem}
          lang={lang}
          patientName={patientName}
          hospitalName={hospitalName}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={onClose}
          tabs={tabs}
        />

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === 'journey' && (
            <DrillDownJourneyTab
              caseItem={caseItem}
              stageMeta={stageMeta}
              isRTL={isRTL}
            />
          )}

          {activeTab === 'clinical' && (
            <DrillDownClinicalTab
              caseItem={caseItem}
              diagnosis={diagnosis}
              isRTL={isRTL}
            />
          )}

          {activeTab === 'opinions' && (
            <DrillDownOpinionsTab
              caseItem={caseItem}
              lang={lang}
              consultantName={consultantName}
              doctorName={doctorName}
              isPdf2Available={isPdf2Available}
              onOpenReport={(type) => {
                setReportType(type);
                setIsPDFModalOpen(true);
              }}
            />
          )}

          {activeTab === 'followup' && (
            <DrillDownFollowUpTab
              caseItem={caseItem}
              lang={lang}
              patientQuestions={patientQuestions}
              followUpAnswers={followUpAnswers}
            />
          )}

          {activeTab === 'facility' && (
            <DrillDownFacilityTab
              caseItem={caseItem}
              lang={lang}
              hospitalName={hospitalName}
            />
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            ALO DOCTOR v2.4 Saudi Edition • Certified Clinical Governance
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            {isRTL ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>

      <BilingualReportModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        activeCase={caseItem}
        lang={lang}
        reportType={reportType}
      />
    </div>
  );
};
