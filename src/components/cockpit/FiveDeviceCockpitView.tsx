import React, { useState, useCallback } from 'react';
import { ClinicalCase } from '../../types';
import { CockpitRole, TEAL_PRIMARY, TEAL_SECONDARY, WHATSAPP_GREEN } from './types';
import { DeviceChrome } from './DeviceChrome';
import { PatientDevice } from './PatientDevice';
import { NurseDevice } from './NurseDevice';
import { SaudiDoctorDevice } from './SaudiDoctorDevice';
import { CoordinatorDevice } from './CoordinatorDevice';
import { IndianConsultantDevice } from './IndianConsultantDevice';
import { BilingualReportModal } from './BilingualReportModal';

const WHATSAPP_CUES: Record<number, { ar: string; en: string }> = {
  1: {
    ar: '💬 واتساب (المريض ➔ التمريض): تم إرسال طلب الرأي الثاني للحالة ALO-2026-LIVE وهو بانتظار فرز التمريض.',
    en: '💬 WhatsApp (Patient ➔ Nurse): Second opinion request submitted for ALO-2026-LIVE awaiting nurse triage.',
  },
  2: {
    ar: '💬 واتساب (التمريض ➔ الطبيب المعالج): اكتمل فرز التمريض مع تدقيق العلامات الحيوية وحجب الهوية بنظام سدايا.',
    en: '💬 WhatsApp (Nurse ➔ Doctor): Triage complete with vitals and SDAIA PII masking. Ready for physician audit.',
  },
  3: {
    ar: '💬 واتساب (الطبيب ➔ المنسق والمريض): اعتمد د. عبدالله الشمري الإحالة وصاغ 3 أسئلة استشارية. رابط الدفع متاح.',
    en: '💬 WhatsApp (Doctor ➔ Coordinator): Referral approved by Dr. Al-Shammari with 3 focus questions. Payment link ready.',
  },
  4: {
    ar: '💬 واتساب (المنسق ➔ المريض): تم سداد الفاتورة الضريبية 250 ر.س عبر مدى. تم توجيه الملف للاستشاري بالهند.',
    en: '💬 WhatsApp (Coordinator ➔ Patient): Tax invoice 250 SAR paid via Mada. Dossier dispatched to Senior Consultant in India.',
  },
  5: {
    ar: '💬 واتساب (الاستشاري ➔ المنسق): اعتمد د. براديب كومار الرأي الثاني بناءً على فحص الأشعة 3D DICOM.',
    en: '💬 WhatsApp (Consultant ➔ Coordinator): Second opinion evaluated and signed based on 3D DICOM loop inspection.',
  },
  6: {
    ar: '💬 واتساب (المنسق ➔ المريض والطبيب): تم إصدار وتسليم التقرير الطبي الدولي المعتمد ثنائي اللغة بنجاح.',
    en: '💬 WhatsApp (Coordinator ➔ Patient & MD): Certified bilingual second opinion report released and delivered.',
  },
};

export interface FiveDeviceCockpitProps {
  activeCase: ClinicalCase;
  onAdvanceStage: () => void;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  onResetActiveCase?: () => void;
  lang?: 'ar' | 'en';
  onSwitchToWorkstation?: () => void;
}

export const FiveDeviceCockpitView: React.FC<FiveDeviceCockpitProps> = ({
  activeCase,
  onAdvanceStage,
  onUpdateCase,
  onResetActiveCase,
  lang = 'en',
  onSwitchToWorkstation,
}) => {
  const isAr = lang === 'ar';
  const [expandedDevice, setExpandedDevice] = useState<CockpitRole | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Derive stageNum deterministically from currentStage, guaranteed >= 5 when paid
  const STAGE_NUM_MAP: Record<string, number> = {
    INTAKE_RECEIVED: 1,
    NURSE_CHECK: 2,
    DOCTOR_REVIEW: 3,
    AWAITING_PAYMENT: 4,
    WITH_CONSULTANT: 5,
    OPINION_READY: 6,
    PARTNER_SERVICES: 7,
    FOLLOW_UP_21_DAYS: 8,
    CLOSED: 9,
  };

  const baseStage = STAGE_NUM_MAP[activeCase.currentStage] || 1;
  const stageNum = (activeCase.paymentVerified && baseStage < 5)
    ? 5
    : (activeCase.stage && activeCase.stage > baseStage ? activeCase.stage : baseStage);

  const currentCue = (() => {
    if (stageNum === 1) {
      return {
        ar: '💬 واتساب (المريض ➔ التمريض): تم إرسال طلب الرأي الثاني للحالة ALO-2026-LIVE وهو بانتظار فرز التمريض.',
        en: '💬 WhatsApp (Patient ➔ Nurse): Second opinion request submitted for ALO-2026-LIVE awaiting nurse triage.',
      };
    }
    if (stageNum === 2) {
      return {
        ar: '💬 واتساب (التمريض ➔ الطبيب المعالج): اكتمل فرز التمريض مع تدقيق العلامات الحيوية وحجب الهوية بنظام سدايا.',
        en: '💬 WhatsApp (Nurse ➔ Doctor): Triage complete with vitals and SDAIA PII masking. Ready for physician audit.',
      };
    }
    if (stageNum === 3) {
      return {
        ar: '💬 واتساب (الطبيب ➔ منسق ألو): اعتمد د. عبدالله الشمري الإحالة وصاغ ٣ أسئلة استشارية. بانتظار مراجعة المنسق.',
        en: '💬 WhatsApp (Doctor ➔ Coordinator): Referral approved by Dr. Al-Shammari with 3 focus questions. Pending invoice.',
      };
    }
    if (stageNum === 4) {
      if (!activeCase.invoiceIssued) {
        return {
          ar: '💬 واتساب (منسق ألو ➔ الحالة): يراجع المنسق خطة الإحالة ويصدر فاتورة ZATCA الضريبية (C02-C04)...',
          en: '💬 WhatsApp (Coordinator ➔ Case): Alo Coordinator is issuing ZATCA tax invoice (C02-C04)...',
        };
      }
      if (!activeCase.pricing?.paid) {
        return {
          ar: '💬 واتساب (منسق ألو ➔ المريض): تم إصدار الفاتورة الضريبية INV-2026-001 ورابط السداد بانتظار دفع المريض.',
          en: '💬 WhatsApp (Coordinator ➔ Patient): Tax invoice INV-2026-001 issued. Payment checkout unlocked for patient.',
        };
      }
      return {
        ar: '💬 واتساب (المنسق ➔ المريض): تم استلام سداد مدى بنجاح. المنسق يتحقق ويوجه الملف للاستشاري في الهند (C06).',
        en: '💬 WhatsApp (Coordinator ➔ Patient): Mada payment received. Coordinator verifying transaction to dispatch to India (C06).',
      };
    }
    if (stageNum === 5) {
      if (!activeCase.secondOpinionSubmitted) {
        return {
          ar: '💬 واتساب (منسق ألو ➔ استشاري الهند): تم تسليم الملف الكامل للأشعة 3D والأسئلة الثلاثة لدراسة د. براديب كومار.',
          en: '💬 WhatsApp (Coordinator ➔ India): Full 3D DICOM dossier and focus questions delivered to Dr. Pradeep Kumar.',
        };
      }
      return {
        ar: '💬 واتساب (الاستشاري ➔ المنسق): سلّم د. براديب كومار الرأي الإنجليزي لمنسق ألو لتعريبه ومطابقة المصطلحات الطبية.',
        en: '💬 WhatsApp (Consultant ➔ Coordinator): English opinion delivered to Alo Coordinator for certified Arabic localization.',
      };
    }
    if (!activeCase.coordinatorForwardedToDoctor) {
      return {
        ar: '💬 واتساب (منسق ألو ➔ التعريب): يجري منسق رعاية ألو التعريب والتدقيق المعتمد تمهيداً لإحالته للطبيب المعالج (C08).',
        en: '💬 WhatsApp (Coordinator ➔ Translation): Alo Coordinator localizing bilingual dossier for treating doctor routing (C08).',
      };
    }
    if (!activeCase.doctorReleasedToPatient) {
      return {
        ar: '💬 واتساب (المنسق ➔ الطبيب المعالج): تم تسليم الملف المعرب لد. عبدالله الشمري للمصادقة السريرية قبل إتاحته للمريض.',
        en: '💬 WhatsApp (Coordinator ➔ Saudi Doctor): Localized dossier routed to Dr. Al-Shammari for final clinical sign-off.',
      };
    }
    return {
      ar: '💬 واتساب (د. عبدالله الشمري ➔ المريض): اعتمد الطبيب السعودي المعالج التقرير النهائي ثنائي اللغة وتم تسليمه للمريض.',
      en: '💬 WhatsApp (Saudi Doctor ➔ Patient): Dr. Al-Shammari endorsed the certified bilingual report and released it to the patient.',
    };
  })();

  const handleToggleExpand = useCallback((role: CockpitRole) => {
    setExpandedDevice((prev) => (prev === role ? null : role));
  }, []);

  const deviceProps = {
    activeCase,
    stageNum,
    onAdvanceStage,
    onUpdateCase,
    lang,
    onOpenReportModal: () => setIsReportModalOpen(true),
  };

  const devicesMap: Record<CockpitRole, React.ReactNode> = {
    'Patient': <PatientDevice {...deviceProps} />,
    'Alo Nurse': <NurseDevice {...deviceProps} />,
    'Saudi treating doctor': <SaudiDoctorDevice {...deviceProps} />,
    'Alo Coordinator': <CoordinatorDevice {...deviceProps} />,
    'Indian consultant': <IndianConsultantDevice {...deviceProps} />,
  };

  const SLOTS = [
    {
      role: 'Patient' as CockpitRole,
      slotNum: 1,
      unlockStage: 1,
      titleAr: 'المريض (تطبيق الجوال)',
      titleEn: 'Patient (Mobile App)',
      icon: '📱',
      deviceType: 'mobile',
      descAr: 'متاح للبدء الفوري',
      descEn: 'Active for intake',
    },
    {
      role: 'Alo Nurse' as CockpitRole,
      slotNum: 2,
      unlockStage: 2,
      titleAr: 'ممرضة ألو (جهاز لوحي)',
      titleEn: 'Alo Nurse (Tablet)',
      icon: '🩺',
      deviceType: 'tablet',
      descAr: 'يُفتح عند إرسال المريض للطلب (P01)',
      descEn: 'Unlocks upon Patient submission (P01)',
    },
    {
      role: 'Saudi treating doctor' as CockpitRole,
      slotNum: 3,
      unlockStage: 3,
      titleAr: 'الطبيب المعالج (بوابة الويب)',
      titleEn: 'Treating Doctor (Web Portal)',
      icon: '🇸🇦',
      deviceType: 'desktop',
      descAr: 'يُفتح بعد اكتمال فرز التمريض (N04)',
      descEn: 'Unlocks upon Triage completion (N04)',
    },
    {
      role: 'Alo Coordinator' as CockpitRole,
      slotNum: 4,
      unlockStage: 4,
      titleAr: 'منسق رعاية ألو (محطة العمل)',
      titleEn: 'Alo Coordinator (Console)',
      icon: '📋',
      deviceType: 'desktop',
      descAr: 'يُفتح بعد اعتماد الطبيب للإحالة (D10)',
      descEn: 'Unlocks upon Doctor approval (D10)',
    },
    {
      role: 'Indian consultant' as CockpitRole,
      slotNum: 5,
      unlockStage: 5,
      titleAr: 'الاستشاري الدولي (تطبيق الجوال)',
      titleEn: 'Senior Consultant (Mobile)',
      icon: '🇮🇳',
      deviceType: 'mobile',
      descAr: 'يُفتح بعد اعتماد المنسق للسداد (C06)',
      descEn: 'Unlocks upon Coordinator dispatch (C06)',
    },
  ];

  return (
    <div
      style={{
        direction: isAr ? 'rtl' : 'ltr',
        fontFamily: isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif",
        backgroundColor: '#f0fdfa',
        minHeight: '100vh',
        padding: '12px 14px 60px 14px',
        color: '#0f172a',
      }}
    >
      {/* Cockpit Top Header */}
      <header
        style={{
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto 12px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: TEAL_PRIMARY,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              style={{
                backgroundColor: TEAL_PRIMARY,
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              ALO DOCTOR
            </span>
            <span>{isAr ? 'استوديو قمرة القيادة الخماسية' : '5-Role Studio Cockpit'}</span>
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 600 }}>
            {isAr
              ? `الحالة النشطة: ${activeCase.caseNumber || activeCase.id} · ${activeCase.patientNameAr || activeCase.patientName} · المرحلة السريرية: ${stageNum} من 5`
              : `Active Case: ${activeCase.caseNumber || activeCase.id} · ${activeCase.patientNameEn || activeCase.patientName} · Stage: ${stageNum} of 5`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onResetActiveCase && (
            <button
              onClick={onResetActiveCase}
              style={{
                backgroundColor: '#ffffff',
                color: '#dc2626',
                border: '1.5px solid #fecaca',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
              }}
              title={isAr ? 'بدء جولة حية جديدة من المرحلة 1' : 'Start a fresh live run from Stage 1'}
            >
              <span>🔄</span>
              <span>{isAr ? 'بدء جولة جديدة' : 'Fresh Live Run'}</span>
            </button>
          )}

          {onSwitchToWorkstation && (
            <button
              onClick={onSwitchToWorkstation}
              style={{
                backgroundColor: '#ffffff',
                color: TEAL_PRIMARY,
                border: `1px solid ${TEAL_PRIMARY}`,
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isAr ? '🖥️ وضع المحطة الفردية' : '🖥️ Single Workstation'}
            </button>
          )}

          {expandedDevice && (
            <button
              onClick={() => setExpandedDevice(null)}
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {isAr ? 'عرض كافة الشاشات الخمس' : 'View All 5 Devices'}
            </button>
          )}

          {onResetActiveCase && (
            <button
              onClick={onResetActiveCase}
              style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title={isAr ? 'تصفير بيانات الحالة والبدء من جديد' : 'Reset case data back to clean slate'}
            >
              {isAr ? '🔄 تصفير الحالة والبدء من جديد' : '🔄 Reset Case to Blank Slate'}
            </button>
          )}
        </div>
      </header>

      {/* Live Handoff WhatsApp Simulation Pill */}
      {WHATSAPP_CUES[stageNum] && (
        <div
          style={{
            maxWidth: '1800px',
            margin: '0 auto 20px auto',
            backgroundColor: '#ffffff',
            border: `1.5px solid ${WHATSAPP_GREEN}`,
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.12)',
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '22px' }}>💬</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: 1.5 }}>
              {isAr ? currentCue.ar : currentCue.en}
            </span>
          </div>
          <span
            style={{
              backgroundColor: '#dcfce7',
              color: '#166534',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
            }}
          >
            {isAr ? 'تنبيه واتساب مباشر' : 'LIVE META WEBHOOK'}
          </span>
        </div>
      )}

      {/* Responsive Viewport Surface with Panoramic 5-Screen Horizontal Fit */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          paddingBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: expandedDevice
              ? '1fr'
              : 'minmax(280px, 1fr) minmax(320px, 1.2fr) minmax(360px, 1.4fr) minmax(360px, 1.4fr) minmax(280px, 1fr)',
            gap: '12px',
            width: '100%',
            minWidth: expandedDevice ? '100%' : '1420px',
            boxSizing: 'border-box',
            alignItems: 'stretch',
          }}
        >
          {expandedDevice ? (
            <DeviceChrome
              key={expandedDevice}
              role={expandedDevice}
              stageNum={stageNum}
              lang={lang}
              isExpanded={true}
              onToggleExpand={() => handleToggleExpand(expandedDevice)}
            >
              {devicesMap[expandedDevice]}
            </DeviceChrome>
          ) : (
            SLOTS.map((slot) => {
              const isUnlocked = stageNum >= slot.unlockStage;
              if (isUnlocked) {
                return (
                  <DeviceChrome
                    key={slot.role}
                    role={slot.role}
                    stageNum={stageNum}
                    lang={lang}
                    isExpanded={false}
                    onToggleExpand={() => handleToggleExpand(slot.role)}
                  >
                    {devicesMap[slot.role]}
                  </DeviceChrome>
                );
              }

              // Pre-allocated placeholder slot holding designated device space
              return (
                <div
                  key={slot.role}
                  style={{
                    height: 'calc(100vh - 190px)',
                    minHeight: '520px',
                    backgroundColor: 'rgba(248, 250, 252, 0.7)',
                    border: '2px dashed #cbd5e1',
                    borderRadius:
                      slot.deviceType === 'mobile'
                        ? '28px'
                        : slot.deviceType === 'tablet'
                        ? '22px'
                        : '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      [isAr ? 'right' : 'left']: '16px',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#94a3b8',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {isAr ? `الموقع المخصص ٠${slot.slotNum}` : `SLOT 0${slot.slotNum}`}
                  </div>

                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '30px',
                      marginBottom: '16px',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    {slot.icon}
                  </div>

                  <h3
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#475569',
                      margin: '0 0 6px 0',
                    }}
                  >
                    {isAr ? slot.titleAr : slot.titleEn}
                  </h3>

                  <p
                    style={{
                      fontSize: '11px',
                      color: '#64748b',
                      margin: '0 0 16px 0',
                      maxWidth: '220px',
                      lineHeight: 1.4,
                      fontWeight: 500,
                    }}
                  >
                    {isAr ? slot.descAr : slot.descEn}
                  </p>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#64748b',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    <span>🔒</span>
                    <span>{isAr ? `يُفتح عند مرحلة ${slot.unlockStage}` : `Unlocks at Stage ${slot.unlockStage}`}</span>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Live Reactive Sync Indicator */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          [isAr ? 'left' : 'right']: '24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          zIndex: 1000,
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: WHATSAPP_GREEN,
            boxShadow: `0 0 10px ${WHATSAPP_GREEN}`,
            animation: 'pulse 2s infinite',
          }}
        />
        <span>{isAr ? 'مزامنة تفاعلية حية عبر الشاشات الخمس' : 'Live Cross-Device Reactive Sync Active'}</span>
      </div>

      {/* Interactive Bilingual Second Opinion PDF Viewer Modal */}
      <BilingualReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        activeCase={activeCase}
        lang={lang}
      />
    </div>
  );
};
