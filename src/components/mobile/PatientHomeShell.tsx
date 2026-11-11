import React from 'react';
import {
  Bell,
  FolderHeart,
  FileText,
  House,
  MessageSquare,
  PhoneCall,
  User,
  X,
  Globe,
  LogIn,
  LogOut,
} from 'lucide-react';
import { UserSession } from '../../hooks/workflowConstants';

export type HomeTab = 'home' | 'requests' | 'medical-file' | 'messages' | 'account';

const TABS: { key: HomeTab; icon: React.ElementType; en: string; ar: string }[] = [
  { key: 'home', icon: House, en: 'Home', ar: 'الرئيسية' },
  { key: 'requests', icon: FolderHeart, en: 'Requests', ar: 'طلباتي' },
  { key: 'medical-file', icon: FileText, en: 'Medical File', ar: 'الملف الطبي' },
  { key: 'messages', icon: MessageSquare, en: 'Messages', ar: 'الرسائل' },
  { key: 'account', icon: User, en: 'Account', ar: 'حسابي' },
];

interface ShellProps {
  isAr: boolean;
  onToggleLang: () => void;
  onOpenWhatsApp: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  activeTab: HomeTab;
  onSelectTab: (tab: HomeTab) => void;
  userSession?: UserSession | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

/**
 * Mobile-first home shell.
 * Mobile: sticky brand bar, single scroll column, fixed bottom tab bar + WhatsApp FAB.
 * Desktop: same blocks, wider canvas, tab bar replaced by a horizontal nav.
 */
export const PatientHomeShell: React.FC<ShellProps> = ({
  isAr,
  onToggleLang,
  onOpenWhatsApp,
  onOpenNotifications,
  unreadCount,
  activeTab,
  onSelectTab,
  userSession,
  onOpenLogin,
  onLogout,
  children,
}) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-alo-canvasMobile">
      {/* ---------------- Sticky brand bar ---------------- */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[440px] items-center justify-between px-4 lg:max-w-5xl lg:px-6">
          {/* Brand wordmark */}
          <div className="flex items-center gap-2">
            <span className="text-[19px] font-black tracking-tight text-alo-navy">الو دكتور</span>
            <span className="h-1.5 w-1.5 rounded-full bg-alo-gold" />
            <span className="hidden text-[10px] font-semibold text-slate-400 sm:inline">alodoctor.gov.sa</span>
          </div>

          {/* Desktop nav - mirrors the bottom tab bar */}
          <nav className="hidden items-center gap-6 text-xs font-bold text-slate-500 lg:flex">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSelectTab(tab.key)}
                className={`transition-colors hover:text-alo-navy ${
                  activeTab === tab.key ? 'text-alo-navy' : ''
                }`}
              >
                {isAr ? tab.ar : tab.en}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleLang}
              className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:border-alo-navy/30 hover:text-alo-navy"
              aria-label={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{isAr ? 'EN' : 'ع'}</span>
            </button>

            {userSession && !userSession.isGuest ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className="relative rounded-full border border-slate-200 p-2 text-slate-600 transition-colors hover:border-alo-navy/30 hover:text-alo-navy"
                  aria-label={isAr ? 'الإشعارات' : 'Notifications'}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-alo-gold px-1 text-[9px] font-black text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-[10.5px] font-bold text-slate-500 hover:text-rose-600 hover:border-rose-300 transition-colors"
                    title={isAr ? 'تسجيل الخروج' : 'Log Out'}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{isAr ? 'خروج' : 'Exit'}</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 rounded-full bg-alo-teal px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-alo-teal/90 active:scale-95 cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{isAr ? 'تسجيل الدخول' : 'Log In'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ---------------- Content column ---------------- */}
      <div className="mx-auto w-full max-w-[440px] flex-1 px-4 pb-28 pt-4 lg:max-w-2xl lg:px-6 lg:pb-10">
        {children}
      </div>

      {/* ---------------- WhatsApp FAB ---------------- */}
      <button
        type="button"
        onClick={onOpenWhatsApp}
        data-testid="whatsapp-fab"
        className="fixed bottom-24 end-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-alo-whatsapp text-white shadow-lg shadow-alo-whatsapp/30 transition-transform active:scale-95 lg:bottom-8 lg:end-8"
        aria-label={isAr ? 'تواصل مع فريق التنسيق' : 'Chat with the coordination team'}
        title={isAr ? 'تواصل مع فريق التنسيق' : 'Talk to the coordination team'}
      >
        <PhoneCall className="h-5 w-5" />
      </button>

      {/* ---------------- Bottom tab bar (mobile only) ---------------- */}
      <nav className="fixed bottom-0 z-40 w-full border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex w-full max-w-[440px] items-stretch justify-between px-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSelectTab(tab.key)}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[9px] font-bold transition-colors ${
                  isActive ? 'text-alo-navy' : 'text-slate-400'
                }`}
                aria-current={isActive ? 'page' : undefined}
                data-testid="tab-item"
              >
                <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-alo-navy' : 'text-slate-400'}`} />
                <span className="leading-none">{isAr ? tab.ar : tab.en}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Reusable bottom sheet - keeps "next phase" destinations on the home page   */
/* -------------------------------------------------------------------------- */

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isAr: boolean;
  children: React.ReactNode;
}

export const HomeSheet: React.FC<SheetProps> = ({ isOpen, onClose, title, isAr, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-[2px] sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="close" onClick={onClose} />
      <div className="relative z-10 max-h-[80vh] w-full max-w-[440px] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-1.5 text-slate-500 transition-colors hover:bg-slate-200"
            aria-label={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
