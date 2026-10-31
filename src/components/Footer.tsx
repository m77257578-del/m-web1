import React from 'react';
import { 
  Code2, 
  PhoneCall, 
  Mail, 
  MapPin, 
  Sparkles, 
  ArrowUp
} from 'lucide-react';
import { SocialIcons } from './SocialIcons';
import { usePlatformSettings, DEFAULT_PLATFORM_SETTINGS } from '../services/platformSettings';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onNavigateToOrder: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigateToOrder 
}) => {
  const settings = usePlatformSettings();
  const { t, language, td } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const localizedDescription = language === 'ar'
    ? settings.description
    : (settings.descriptionEn ||
        (settings.description === DEFAULT_PLATFORM_SETTINGS.description
          ? DEFAULT_PLATFORM_SETTINGS.descriptionEn
          : td(settings.description)));

  const localizedAddress = language === 'ar'
    ? (settings.addressText || DEFAULT_PLATFORM_SETTINGS.addressText)
    : (settings.addressTextEn || DEFAULT_PLATFORM_SETTINGS.addressTextEn || td(settings.addressText));

  return (
    <footer className="bg-slate-950/80 backdrop-blur-md border-t border-slate-900 text-slate-400 relative overflow-hidden">
      
      {/* Top Banner inside Footer */}
      <div className="border-b border-slate-800/80 bg-slate-900/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {language === 'ar' ? 'هل أنت مستعد لبدء مشروعك البرمجي القادم؟' : 'Ready to launch your next software project?'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'استشارة تقنية مجانية وتحليل فني لمواصفات مشروعك خلال ساعات.' : 'Free technical consultation and project scope analysis within hours.'}
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToOrder}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all cursor-pointer shadow-md shadow-cyan-400/20"
          >
            {language === 'ar' ? 'اطلب استشارة مجانية الآن' : 'Get Free Consultation Now'}
          </button>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info (Cols 1-2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <Code2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tight text-white font-['JetBrains_Mono',monospace]">
                  {settings.logoMain}<span className="text-cyan-400">{settings.logoHighlight}</span>
                </span>
                <span className="text-xs text-slate-400">
                  {language === 'ar' ? `${settings.brandNameAr} للحلول البرمجية` : `${settings.brandNameEn} Software Solutions`}
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              {localizedDescription}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                {language === 'ar' ? 'متاحون لاستقبال وتنفيذ المشاريع البرمجية الجديدة' : 'Available for new custom software projects'}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white tracking-wide">
              {t.quickLinks}
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#demo-platforms" className="hover:text-cyan-400 transition-colors text-cyan-300 font-semibold">
                  {t.navDemoPlatforms}
                </a>
              </li>
              <li>
                <a href="#client-projects" className="hover:text-cyan-400 transition-colors">
                  {t.navClientProjects}
                </a>
              </li>
              <li>
                <a href="#articles" className="hover:text-cyan-400 transition-colors text-cyan-300 font-semibold">
                  {t.navArticles}
                </a>
              </li>
              <li>
                <a href="#payment-methods" className="hover:text-cyan-400 transition-colors">
                  {t.navPaymentMethods}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-cyan-400 transition-colors">
                  {t.navServices}
                </a>
              </li>
              <li>
                <a href="#join-us" className="hover:text-cyan-400 transition-colors text-emerald-300 font-semibold">
                  {t.navJoinUs}
                </a>
              </li>
              <li>
                <a href="#order-form" className="hover:text-cyan-400 transition-colors">
                  {t.navOrderNow}
                </a>
              </li>
            </ul>
          </div>

          {/* Services Links */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white tracking-wide">
              {language === 'ar' ? 'الخدمات التقنية' : 'Core Solutions'}
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#services" className="hover:text-cyan-400 transition-colors">
                  {language === 'ar' ? 'المنصات التعليمية والأكاديميات' : 'LMS & Educational Academies'}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-cyan-400 transition-colors">
                  {language === 'ar' ? 'المتاجر الإلكترونية وبوابات الدفع' : 'E-Commerce & Payment Gateways'}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-cyan-400 transition-colors">
                  {language === 'ar' ? 'الأنظمة الإدارية ERP & CRM' : 'Enterprise ERP & CRM Systems'}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-cyan-400 transition-colors">
                  {language === 'ar' ? 'المواقع التعريفية للشركات' : 'Corporate Websites & Portals'}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-cyan-400 transition-colors">
                  {language === 'ar' ? 'الأمان السحابي وقواعد البيانات' : 'Cloud Databases & Security'}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white tracking-wide">{t.contactUs}</h5>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <a 
                  href={`https://wa.me/${settings.whatsappPhone}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors font-mono"
                  dir="ltr"
                >
                  WhatsApp: +{settings.whatsappPhone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <a 
                  href={`mailto:${settings.email || 'contact@mweb.dev'}`} 
                  className="hover:text-cyan-400 transition-colors font-mono"
                  dir="ltr"
                >
                  {settings.email || 'contact@mweb.dev'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{localizedAddress}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Social Media Squircle Icons Row */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-xs font-semibold text-slate-400">
            {language === 'ar' ? (
              <>
                تواصل وتابع قنوات <strong className="text-white">{settings.brandNameAr} ({settings.brandNameEn})</strong> عبر{' '}
                <a href={settings.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-mono hover:underline">
                  {settings.websiteUrl}
                </a>:
              </>
            ) : (
              <>
                Connect & follow <strong className="text-white">{settings.brandNameEn}</strong> channels via{' '}
                <a href={settings.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-mono hover:underline">
                  {settings.websiteUrl}
                </a>:
              </>
            )}
          </div>
          <SocialIcons />
        </div>

        {/* Bottom copyright row */}
        <div className="mt-8 pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span>
              {language === 'ar' ? (
                <>جميع الحقوق محفوظة © {new Date().getFullYear()} لشركة <strong className="text-slate-200">{settings.brandNameAr} - {settings.brandNameEn}</strong>.</>
              ) : (
                <>All Rights Reserved © {new Date().getFullYear()} <strong className="text-slate-200">{settings.brandNameEn}</strong>.</>
              )}
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <a href={settings.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-mono font-semibold hover:underline">
              {settings.websiteUrl || 'mweb.dev'}
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <span>{language === 'ar' ? 'العودة للأعلى' : 'Back to Top'}</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
