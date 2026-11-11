import React, { useState } from 'react';
import { HeartPulse, Globe, User, Menu, X } from 'lucide-react';

interface Props {
  isAr: boolean;
  onToggleLang: () => void;
  onOpenAccountModal: () => void;
  onScrollToSection: (id: string) => void;
}

export const LandingHeader: React.FC<Props> = ({
  isAr,
  onToggleLang,
  onOpenAccountModal,
  onScrollToSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onScrollToSection(id);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('hero')}
            className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-teal-900 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900 font-sans">
                  ALO DOCTOR
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/80">
                  {isAr ? 'ألو دكتور' : 'KSA'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {isAr ? 'الرأي الطبي الثاني والاستشارات السريرية' : 'Accredited Second Medical Opinion'}
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <button
            onClick={() => handleNavClick('how-it-works')}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            {isAr ? 'كيف يعمل' : 'How It Works'}
          </button>
          <button
            onClick={() => handleNavClick('services')}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            {isAr ? 'خدماتنا' : 'Our Services'}
          </button>
          <button
            onClick={() => handleNavClick('network')}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            {isAr ? 'شبكتنا الطبية' : 'Our Network'}
          </button>
          <button
            onClick={() => handleNavClick('faq')}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
          </button>
        </nav>

        {/* Right Header Utilities */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 transition-all cursor-pointer"
            title={isAr ? 'Switch to English' : 'التحويل إلى اللغة العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>

          <button
            onClick={onOpenAccountModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'تسجيل الدخول' : 'Login'}</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onToggleLang}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-bold"
            aria-label="Toggle language"
          >
            {isAr ? 'EN' : 'ع'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
            aria-label="Open Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-2 text-sm font-bold text-slate-700">
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-800"
            >
              {isAr ? 'كيف يعمل' : 'How It Works'}
            </button>
            <button
              onClick={() => handleNavClick('services')}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-800"
            >
              {isAr ? 'خدماتنا' : 'Our Services'}
            </button>
            <button
              onClick={() => handleNavClick('network')}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-800"
            >
              {isAr ? 'شبكتنا الطبية' : 'Our Network'}
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-800"
            >
              {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
            </button>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAccountModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white shadow cursor-pointer"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'تسجيل الدخول' : 'Login'}</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onToggleLang();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs border border-slate-200 text-slate-700 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'English Interface' : 'التحويل إلى العربية'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
