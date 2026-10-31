import React, { useState, useEffect, useRef } from 'react';
import { 
  Code2, 
  Menu, 
  X, 
  Send, 
  PhoneCall, 
  Layers,
  Sparkles,
  Users,
  CreditCard,
  Laptop,
  Award,
  BookOpen
} from 'lucide-react';
import { usePlatformSettings } from '../services/platformSettings';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { PWAInstallButton } from './PWAInstallButton';

export type PlatformTab = 
  | 'all' 
  | 'demo-platforms' 
  | 'client-projects' 
  | 'ratings'
  | 'articles' 
  | 'services' 
  | 'payment-methods' 
  | 'portfolio' 
  | 'about' 
  | 'join-us' 
  | 'order';

interface NavbarProps {
  activeTab: PlatformTab;
  onSelectTab: (tab: PlatformTab) => void;
  onNavigateToOrder: () => void;
  onOpenAdminModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab,
  onSelectTab,
  onNavigateToOrder,
  onOpenAdminModal
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const settings = usePlatformSettings();
  const { t, language } = useLanguage();

  // Secret 3-consecutive-clicks detection state for Admin
  const [clickCount, setClickCount] = useState(0);
  const lastClickTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Keyboard shortcut (Ctrl+Shift+A) for admin
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        onOpenAdminModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onOpenAdminModal]);

  const platformTabs = [
    { id: 'all' as PlatformTab, label: t.home },
    { id: 'demo-platforms' as PlatformTab, label: t.demoPlatforms },
    { id: 'client-projects' as PlatformTab, label: t.clientProjects },
    { id: 'ratings' as PlatformTab, label: t.ratingsTitle },
    { id: 'articles' as PlatformTab, label: t.articles },
    { id: 'payment-methods' as PlatformTab, label: t.paymentMethods },
    { id: 'services' as PlatformTab, label: t.services },
    { id: 'portfolio' as PlatformTab, label: t.portfolio },
    { id: 'join-us' as PlatformTab, label: t.joinUs },
    { id: 'order' as PlatformTab, label: t.orderProject },
  ];

  const handleTabClick = (tabId: PlatformTab) => {
    setMobileMenuOpen(false);
    onSelectTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Secret triple click on the platform icon to open hidden admin
  const handleLogoIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    const diff = now - lastClickTimeRef.current;

    if (diff < 1000) {
      const nextCount = clickCount + 1;
      if (nextCount >= 3) {
        setClickCount(0);
        onOpenAdminModal();
      } else {
        setClickCount(nextCount);
      }
    } else {
      setClickCount(1);
    }
    lastClickTimeRef.current = now;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/15 py-2.5 shadow-xl shadow-cyan-950/10' 
          : 'bg-transparent py-3 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            {/* The Platform Icon: Click 3 times consecutively to open Admin */}
            <button 
              type="button"
              onClick={handleLogoIconClick}
              title={clickCount > 0 ? `Click ${clickCount} of 3` : `Admin Terminal - ${settings.brandNameEn}`}
              className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-90 transition-transform duration-200 cursor-pointer focus:outline-none"
            >
              <Code2 className="w-6 h-6 text-white stroke-[2.2]" />
              <div className="absolute -inset-0.5 rounded-xl bg-cyan-400 opacity-20 blur-sm hover:opacity-40 transition-opacity" />
              {clickCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-mono font-bold text-white shadow">
                  {clickCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabClick('all')}
              className={`flex flex-col focus:outline-none group cursor-pointer ${language === 'ar' ? 'text-right' : 'text-left'}`}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-white font-['JetBrains_Mono',monospace]">
                  {settings.logoMain}<span className="text-cyan-400">{settings.logoHighlight}</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800/40 text-cyan-300">
                  {language === 'ar' ? settings.brandNameAr : settings.brandNameEn}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                {language === 'ar' ? settings.tagline : (settings.taglineEn || settings.tagline)}
              </span>
            </button>
          </div>

          {/* Desktop Tab Navigation */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-900/60 border border-slate-800/80 p-1 rounded-2xl backdrop-blur-md">
            {platformTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Actions & CTA */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Install App PWA Button */}
            <PWAInstallButton variant="navbar" />

            {/* Language Switcher */}
            <LanguageSelector variant="navbar" />

            {/* Direct WhatsApp Chat */}
            <a
              href={`https://wa.me/${settings.whatsappPhone}?text=${encodeURIComponent(`Hello ${settings.brandNameEn} team, I would like to inquire about project development`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-emerald-400 hover:bg-emerald-950/40 hover:border-emerald-500/40 transition-all"
              title="WhatsApp"
            >
              <PhoneCall className="w-4 h-4" />
            </a>

            {/* Order Now CTA */}
            <button
              onClick={() => handleTabClick('order')}
              className="relative inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 hover:shadow-lg hover:shadow-cyan-400/25 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{t.orderProject}</span>
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex xl:hidden items-center gap-2">
            <PWAInstallButton variant="compact" />
            <LanguageSelector variant="compact" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 focus:outline-none cursor-pointer"
              aria-label="القائمة والتبويبات"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu / Tabs */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-3 pb-6 mt-3 space-y-2 backdrop-blur-xl animate-fadeIn">
          <div className="flex items-center justify-between px-3 pb-2 border-b border-slate-900">
            <span className="text-xs font-semibold text-slate-400">
              {language === 'ar' ? 'أقسام المنصة:' : 'Platform Sections:'}
            </span>
            <LanguageSelector variant="navbar" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {platformTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`block w-full text-center px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950'
                      : 'text-slate-200 hover:bg-slate-900 hover:text-cyan-400 bg-slate-950 border border-slate-800/80'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToOrder();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 shadow-md shadow-cyan-500/20"
            >
              <Send className="w-4 h-4" />
              <span>{t.orderProject}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
