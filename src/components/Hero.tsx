import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight,
  Send, 
  Sparkles, 
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe,
  Headphones
} from 'lucide-react';
import { usePlatformSettings } from '../services/platformSettings';
import { useLanguage } from '../context/LanguageContext';
import { PWAInstallButton } from './PWAInstallButton';

interface HeroProps {
  onNavigateToOrder: () => void;
  onNavigateToPortfolio: () => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  onNavigateToOrder, 
  onNavigateToPortfolio 
}) => {
  const settings = usePlatformSettings();
  const { t, language } = useLanguage();

  const brandName = language === 'ar' ? settings.brandNameAr : settings.brandNameEn;
  const brandDescription = language === 'ar' ? settings.description : (settings.descriptionEn || settings.description);

  const highlights = [
    {
      icon: Zap,
      title: language === 'ar' ? 'أداء فائق السرعة' : 'Ultra-Fast Performance',
      desc: language === 'ar' ? 'تصميم وتنفيذ منصات تعمل بأقصى سرعة واستقرار على جميع الأجهزة' : 'Platforms engineered for maximum speed and stability across all devices',
    },
    {
      icon: ShieldCheck,
      title: language === 'ar' ? 'حماية وأمان متكامل' : 'Complete Security & Protection',
      desc: language === 'ar' ? 'تأمين شامل للبيانات والمحتوى والمدفوعات الإلكترونية' : 'Comprehensive protection for data, content, and digital payments',
    },
    {
      icon: Globe,
      title: language === 'ar' ? 'هوية مخصصة لمشروعك' : 'Custom Brand Identity',
      desc: language === 'ar' ? 'واجهات عصرية مصممة خصيصاً لتناسب علامتك التجارية وعملائك' : 'Modern interfaces tailored specifically for your brand and clients',
    },
    {
      icon: Headphones,
      title: language === 'ar' ? 'دعم فني متواصل' : 'Continuous Tech Support',
      desc: language === 'ar' ? 'متابعة مستمرة وتحديثات دورية لضمان نجاح مشروعك' : 'Ongoing follow-up and updates to ensure your project succeeds',
    },
  ];

  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Gentle, soft celestial ambiance */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-cyan-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-indigo-950/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Main Hero Copy (Col 1-7) */}
          <motion.div 
            initial={{ opacity: 0, x: language === 'ar' ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`lg:col-span-7 space-y-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}
          >
            {/* Top pill badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold shadow-inner shadow-cyan-500/20"
            >
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t.heroBadge}</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl xl:text-6xl font-black text-white leading-[1.2] tracking-tight"
            >
              {t.heroHeadlineMain}{' '}
              <span className="bg-gradient-to-l from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                {t.heroHeadlineGradient}
              </span>
            </motion.h1>

            {/* Subheading / Description (100% Bilingual) */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl font-normal"
            >
              <strong className="text-white font-bold">{brandName}</strong>: {brandDescription}
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
            >
              <button
                onClick={onNavigateToOrder}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 bg-[length:200%_auto] hover:bg-[position:right_center] transition-all duration-300 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-400/40 active:scale-95 cursor-pointer"
              >
                <span>{t.heroCTAPrimary}</span>
                <Send className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              </button>

              <button
                onClick={onNavigateToPortfolio}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-semibold text-base text-slate-200 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 hover:border-cyan-500/50 hover:text-cyan-300 transition-all duration-200 cursor-pointer"
              >
                <span>{t.heroCTASecondary}</span>
                {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <PWAInstallButton variant="hero" />
            </motion.div>

            {/* Quick Guarantees / Highlights */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-300"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium">{t.guaranteeCode}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium">
                  {language === 'ar' ? 'حماية وأمان متكامل' : 'Full Data Security'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium">{t.guaranteeFirestore}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium">{t.guaranteeFast}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Clean 3D Executive Overview Card (Zero foreign code snippets) */}
          <motion.div 
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/30 via-teal-500/20 to-indigo-500/30 blur-lg" />

              <div className="relative rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl p-6 sm:p-7 space-y-6">
                {/* Top Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-cyan-500/20">
                      {settings.logoMain}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">{brandName}</h3>
                      <p className="text-xs text-cyan-400">
                        {language === 'ar' ? settings.tagline : (settings.taglineEn || settings.tagline)}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-[11px] font-bold">
                    {language === 'ar' ? 'متاح الآن' : 'Available Now'}
                  </span>
                </div>

                {/* 4 Executive Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {highlights.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-cyan-500/40 transition-all space-y-1.5"
                      >
                        <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 divide-x divide-slate-800 bg-slate-900/60 rounded-2xl border border-slate-800 text-center py-3.5">
                  <div>
                    <div className="text-base font-extrabold text-white font-mono">100%</div>
                    <div className="text-[11px] text-slate-400">
                      {language === 'ar' ? 'جودة التنفيذ' : 'Quality Standard'}
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-cyan-400 font-mono">100%</div>
                    <div className="text-[11px] text-slate-400">{t.securityStandards}</div>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-emerald-400 font-mono">24/7</div>
                    <div className="text-[11px] text-slate-400">{t.supportHours}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
