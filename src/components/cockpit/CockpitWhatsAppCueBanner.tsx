import React from 'react';
import { WHATSAPP_GREEN } from './types';

interface CockpitWhatsAppCueBannerProps {
  cue: { ar: string; en: string };
  isAr: boolean;
  onOpenWhatsAppDrawer?: () => void;
}

export const CockpitWhatsAppCueBanner: React.FC<CockpitWhatsAppCueBannerProps> = ({
  cue,
  isAr,
  onOpenWhatsAppDrawer,
}) => {
  return (
    <div
      onClick={onOpenWhatsAppDrawer}
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
        cursor: 'pointer',
      }}
      title={isAr ? 'اضغط لفتح محادثة واتساب الرسمية' : 'Click to inspect official WhatsApp thread'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '22px' }}>💬</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: 1.5 }}>
          {isAr ? cue.ar : cue.en}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenWhatsAppDrawer?.();
          }}
          style={{
            backgroundColor: WHATSAPP_GREEN,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)',
          }}
        >
          <span>💬</span>
          <span>{isAr ? 'فتح محادثة الواتساب' : 'Open WhatsApp Drawer'}</span>
        </button>
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
    </div>
  );
};
