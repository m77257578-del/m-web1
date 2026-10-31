import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Laptop, 
  Smartphone, 
  Tablet, 
  Play, 
  Pause,
  RotateCcw,
  RotateCw,
  CheckCircle2, 
  Sparkles, 
  X, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  Zap, 
  Calendar, 
  Award, 
  CreditCard, 
  Tag, 
  Layers, 
  Send,
  Eye,
  Film,
  Image as ImageIcon,
  Check,
  Code2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { DemoPlatform, getDemoPlatforms } from '../services/demoPlatforms';
import { useLanguage } from '../context/LanguageContext';
import { localizeDemoPlatform } from '../i18n';

interface DemoPlatformsProps {
  onSelectPlatformToOrder: (platformTitleAr: string, platformTitleEn: string) => void;
}

export const DemoPlatforms: React.FC<DemoPlatformsProps> = ({ onSelectPlatformToOrder }) => {
  const { t, language, td } = useLanguage();
  const [rawPlatforms, setRawPlatforms] = useState<DemoPlatform[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<DemoPlatform | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewTab, setPreviewTab] = useState<'live' | 'video' | 'gallery' | 'pricing'>('live');
  const [selectedPlanTab, setSelectedPlanTab] = useState<Record<string, 'monthly' | 'annual' | 'lifetime'>>({});
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [liveViewMode] = useState<'iframe' | 'overview'>('iframe');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playerRef = useRef<any>(null);
  const currentTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(100);

  const handleRewind = () => {
    const newTime = Math.max(0, currentTimeRef.current - 10);
    currentTimeRef.current = newTime;
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try { playerRef.current.seekTo(newTime, 'seconds'); } catch (e) {}
    }
  };

  const handleForward = () => {
    const newTime = Math.min(durationRef.current || 100, currentTimeRef.current + 10);
    currentTimeRef.current = newTime;
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try { playerRef.current.seekTo(newTime, 'seconds'); } catch (e) {}
    }
  };

  useEffect(() => {
    loadPlatforms();
    const handleStorageChange = () => loadPlatforms();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadPlatforms = () => {
    const list = getDemoPlatforms();
    setRawPlatforms(list);
  };

  const platforms = rawPlatforms.map((p) => localizeDemoPlatform(p, language));

  const categories = ['all', ...Array.from(new Set(platforms.map(p => p.category)))];

  const filteredPlatforms = selectedCategory === 'all' 
    ? platforms 
    : platforms.filter(p => p.category === selectedCategory);

  const getActivePlan = (platformId: string): 'monthly' | 'annual' | 'lifetime' => {
    return selectedPlanTab[platformId] || 'lifetime';
  };

  const setActivePlan = (platformId: string, plan: 'monthly' | 'annual' | 'lifetime') => {
    setSelectedPlanTab(prev => ({ ...prev, [platformId]: plan }));
  };

  const handleOpenPreview = (platform: DemoPlatform, defaultTab: 'live' | 'video' | 'gallery' | 'pricing' = 'live') => {
    setActivePreviewPlatform(platform);
    setPreviewTab(defaultTab);
    setActiveMediaIndex(0);
    setPreviewDevice('desktop');
    setIframeKey(Date.now());
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
    }
    return url;
  };

  return (
    <section id="demo-platforms" className="py-20 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-4">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{t.demoSectionBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            {t.demoSectionTitle}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t.demoSectionDesc}
          </p>

          {categories.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {cat === 'all' ? t.allCategories : td(cat)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Empty State if no platforms published by Admin yet */}
        {filteredPlatforms.length === 0 ? (
          <div className="max-w-2xl mx-auto rounded-3xl bg-slate-900/70 border border-slate-800/90 p-8 sm:p-10 text-center space-y-5 backdrop-blur-md shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
              <Laptop className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-white">
              {language === 'ar' ? 'اطلب منصتك المخصصة الآن' : 'Order Your Custom Platform Now'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
              {language === 'ar'
                ? 'يمكنك طلب تصميم وتنفيذ منصتك الخاصة وتوليد الرابط السحابي الفوري لمشروعك، أو إضافة منصات المعاينة مباشرة من لوحة تحكم الإدارة.'
                : 'Request your custom software platform and generate your instant deployment link, or publish live preview platforms directly via the Admin Panel.'}
            </p>
            <div>
              <button
                onClick={() => onSelectPlatformToOrder(
                  language === 'ar' ? 'منصة رقمية مخصصة' : 'Custom Digital Platform',
                  'Custom Platform'
                )}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{t.orderThisPlatformNow}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Platforms Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredPlatforms.map((platform) => {
              const currentPlan = getActivePlan(platform.id);
              const videos = platform.media.filter(m => m.type === 'video' || m.type === 'youtube');
              const images = platform.media.filter(m => m.type === 'image');

              return (
                <motion.div
                  key={platform.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 rounded-3xl p-6 sm:p-7 backdrop-blur-md shadow-xl flex flex-col justify-between group transition-all duration-300"
                >
                  <div>
                    {/* Top Thumbnail & Action Badges */}
                    <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video bg-slate-950 border border-slate-800 group-hover:border-slate-700">
                      <img 
                        src={platform.thumbnail} 
                        alt={platform.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        {platform.badge && (
                          <span className="px-3 py-1 rounded-full bg-cyan-500 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/30">
                            {platform.badge}
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-cyan-300 text-[11px] font-bold border border-cyan-500/30 backdrop-blur-sm">
                          {platform.category}
                        </span>
                      </div>

                      {/* Quick Media Indicators */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        {videos.length > 0 && (
                          <button
                            onClick={() => handleOpenPreview(platform, 'video')}
                            className="px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-500 text-white text-[11px] font-bold flex items-center gap-1 backdrop-blur-sm cursor-pointer shadow"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{language === 'ar' ? 'فيديو' : 'Video'}</span>
                          </button>
                        )}
                        {images.length > 0 && (
                          <span className="px-2 py-1 rounded-lg bg-slate-900/80 text-slate-200 text-[11px] font-medium flex items-center gap-1 backdrop-blur-sm">
                            <ImageIcon className="w-3 h-3 text-cyan-400" />
                            <span>{images.length} {language === 'ar' ? 'صور' : 'Photos'}</span>
                          </span>
                        )}
                      </div>

                      {/* Interactive Preview Overlay Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/60 backdrop-blur-[2px]">
                        <button
                          onClick={() => handleOpenPreview(platform, 'live')}
                          className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-cyan-500/30 cursor-pointer transform hover:scale-105 transition-all"
                        >
                          <Laptop className="w-4 h-4" />
                          <span>{t.livePreview}</span>
                        </button>
                      </div>

                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-slate-300">
                        <span className="font-semibold text-white/90">
                          {language === 'ar' ? 'محاكي شاشات حاسوب وجوال متوفر' : 'Desktop & Mobile Simulators Available'}
                        </span>
                        <span className="text-cyan-400 font-bold flex items-center gap-1">
                          <span>{t.instantPreview}</span>
                          {language === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2 leading-snug">
                      {platform.title}
                    </h3>
                    <p className="text-cyan-300/90 text-xs sm:text-sm font-medium mb-3">
                      {platform.subtitle}
                    </p>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                      {platform.description}
                    </p>

                    {/* Target Audience */}
                    {platform.clientTarget && (
                      <div className="mb-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span><strong>{t.suitableFor}</strong> {platform.clientTarget}</span>
                      </div>
                    )}

                    {/* Features List */}
                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t.softwareFeaturesAndSpecs}</span>
                      </h4>
                      <ul className="space-y-2">
                        {platform.features.slice(0, 4).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 3-Tier Pricing Model Selector */}
                  <div className="pt-6 border-t border-slate-800">
                    <div className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
                      <span>{t.choosePlanType}</span>
                      <span className="text-[11px] text-cyan-400 font-normal">
                        {language === 'ar' ? 'تسعير مباشر محدد من الإدارة' : 'Direct Official Pricing'}
                      </span>
                    </div>

                    {/* Plan Tabs */}
                    <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 mb-4">
                      <button
                        onClick={() => setActivePlan(platform.id, 'monthly')}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                          currentPlan === 'monthly'
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <div>{t.monthlySystem}</div>
                        <div className="text-[10px] font-mono mt-0.5 opacity-90">{platform.pricing.monthly}{platform.pricing.currency}/m</div>
                      </button>

                      <button
                        onClick={() => setActivePlan(platform.id, 'annual')}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center relative cursor-pointer ${
                          currentPlan === 'annual'
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>{t.annualSystem}</span>
                        </div>
                        <div className="text-[10px] font-mono mt-0.5 opacity-90">{platform.pricing.annual}{platform.pricing.currency}/yr</div>
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                          {t.save20Percent}
                        </span>
                      </button>

                      <button
                        onClick={() => setActivePlan(platform.id, 'lifetime')}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                          currentPlan === 'lifetime'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <div>{t.permanentOwnership}</div>
                        <div className="text-[10px] font-mono mt-0.5 opacity-90">{platform.pricing.lifetime}{platform.pricing.currency}</div>
                      </button>
                    </div>

                    {/* Selected Plan Details Note */}
                    <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 mb-5 text-xs text-slate-300">
                      {currentPlan === 'monthly' && (
                        <div className="flex items-start gap-2">
                          <CreditCard className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white">{t.monthlySystem} ({platform.pricing.monthly}{platform.pricing.currency}):</strong>
                            <p className="text-slate-400 text-[11px] mt-0.5">
                              {platform.pricing.monthlyNote || (language === 'ar' ? 'يشمل الاستضافة السحابية الآمنة والصيانة الفنية الدورية.' : 'Includes secure cloud hosting and regular technical maintenance.')}
                            </p>
                          </div>
                        </div>
                      )}
                      {currentPlan === 'annual' && (
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white">{t.annualSystem} ({platform.pricing.annual}{platform.pricing.currency}):</strong>
                            <p className="text-slate-400 text-[11px] mt-0.5">
                              {platform.pricing.annualNote || (language === 'ar' ? 'توفير شهرين مجاناً، دومين احترافي هدية، ونسخ احتياطي يومي.' : '2 months free, complimentary domain, and daily backups.')}
                            </p>
                          </div>
                        </div>
                      )}
                      {currentPlan === 'lifetime' && (
                        <div className="flex items-start gap-2">
                          <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white">{t.permanentOwnership} ({platform.pricing.lifetime}{platform.pricing.currency}):</strong>
                            <p className="text-slate-400 text-[11px] mt-0.5">
                              {platform.pricing.lifetimeNote || (language === 'ar' ? 'تسليم المنصة بالكامل مع ملكية دائمة وترخيص تجاري حر.' : 'Full platform ownership and lifetime commercial license.')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => handleOpenPreview(platform, 'live')}
                        className="px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span>{t.livePreview}</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectPlatformToOrder(
                            `${platform.title} (${currentPlan === 'monthly' ? t.monthlySystem : currentPlan === 'annual' ? t.annualSystem : t.permanentOwnership})`,
                            platform.title
                          );
                        }}
                        className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
                      >
                        <Send className="w-4 h-4 text-slate-950" />
                        <span>{t.orderThisPlatformNow}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* IN-APP INTERACTIVE PREVIEW SIMULATOR MODAL */}
      <AnimatePresence>
        {activePreviewPlatform && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-slate-950 w-screen h-screen overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-slate-900 border-0 rounded-none w-full h-full flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Top Header Bar */}
              <div className="fixed top-3 left-3 right-3 z-50 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-2 px-3 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                    {activePreviewPlatform.title}
                  </span>
                  <span className="hidden xl:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    {t.livePreviewBadge}
                  </span>
                </div>

                {/* Device Switcher & Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  <div className="flex items-center gap-0.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        previewDevice === 'desktop' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">{t.desktop}</span>
                    </button>
                    <button
                      onClick={() => setPreviewDevice('tablet')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        previewDevice === 'tablet' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Tablet className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">{t.tablet}</span>
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        previewDevice === 'mobile' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">{t.mobile}</span>
                    </button>
                  </div>

                  {/* Preview Mode Tabs */}
                  <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setPreviewTab('live')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        previewTab === 'live' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.livePreview}
                    </button>
                    {activePreviewPlatform.media.some(m => m.type === 'video' || m.type === 'youtube') && (
                      <button
                        onClick={() => setPreviewTab('video')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          previewTab === 'video' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {language === 'ar' ? 'الفيديو' : 'Video'}
                      </button>
                    )}
                    <button
                      onClick={() => setPreviewTab('gallery')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        previewTab === 'gallery' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {language === 'ar' ? 'الواجهات' : 'Gallery'}
                    </button>
                  </div>

                  <button
                    onClick={() => setIframeKey(Date.now())}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer border border-slate-800"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const title = activePreviewPlatform.title;
                      setActivePreviewPlatform(null);
                      onSelectPlatformToOrder(title, title);
                    }}
                    className="hidden sm:flex px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-black text-xs items-center gap-1 shadow cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.instantBookingRequest}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setActivePreviewPlatform(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-cyan-500/30 shadow"
                  >
                    <Minimize2 className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تصغير الشاشة' : 'Minimize'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setActivePreviewPlatform(null);
                    }}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body Container */}
              <div className="flex-1 bg-slate-950 p-0 overflow-hidden flex flex-col items-center justify-center w-full h-full">
                {previewTab === 'live' && (
                  <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
                    <div 
                      className={`bg-slate-900 overflow-hidden flex flex-col transition-all duration-300 ${
                        previewDevice === 'desktop'
                          ? 'w-full h-full max-w-none rounded-none border-0'
                          : previewDevice === 'tablet'
                            ? 'w-[768px] max-w-full h-[92%] my-auto rounded-2xl border border-slate-700/80 shadow-2xl'
                            : 'w-[390px] max-w-full h-[92%] my-auto rounded-2xl border border-slate-700/80 shadow-2xl'
                      }`}
                    >
                      <div className="flex-1 bg-slate-950 overflow-hidden flex flex-col relative">
                        {liveViewMode === 'iframe' && activePreviewPlatform.liveDemoUrl ? (
                          <div className="flex-1 bg-white relative w-full h-full overflow-hidden">
                            <iframe
                              key={iframeKey}
                              src={activePreviewPlatform.liveDemoUrl}
                              title={activePreviewPlatform.title}
                              className="w-full h-full border-0 bg-white"
                              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="min-h-full p-4 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 overflow-y-auto">
                            <div className="py-8 text-center max-w-2xl mx-auto">
                              <h2 className="text-xl sm:text-3xl font-black text-white mb-3">
                                {activePreviewPlatform.title}
                              </h2>
                              <p className="text-xs sm:text-sm text-slate-300 mb-6">
                                {activePreviewPlatform.description}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {previewTab === 'video' && (
                  <div className="w-full max-w-4xl my-auto flex flex-col items-center justify-center">
                    {(() => {
                      const videoItem = activePreviewPlatform.media.find(m => m.type === 'video' || m.type === 'youtube');
                      if (!videoItem) {
                        return (
                          <div className="text-center p-8 bg-slate-900 rounded-2xl border border-slate-800">
                            <Film className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                            <p className="text-slate-300 text-sm">
                              {language === 'ar' ? 'لا يوجد فيديو مرفوع حالياً.' : 'No video uploaded yet.'}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div id="demo-video-wrapper" className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative group">
                          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                            <span className="font-bold flex items-center gap-2">
                              <Film className="w-4 h-4 text-cyan-400" />
                              <span>{videoItem.title || activePreviewPlatform.title}</span>
                            </span>
                            <button
                              onClick={() => {
                                const elem = document.getElementById('demo-video-wrapper');
                                if (elem) {
                                  if (!document.fullscreenElement) {
                                    elem.requestFullscreen().catch(err => console.error(err));
                                  } else {
                                    document.exitFullscreen().catch(err => console.error(err));
                                  }
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-cyan-500/30 shadow"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>{t.expandFullscreen}</span>
                            </button>
                          </div>

                          <div className="aspect-video w-full bg-black relative overflow-hidden group">
                            {videoItem.type === 'youtube' || videoItem.url.includes('youtube.com') || videoItem.url.includes('youtu.be') ? (
                              <iframe
                                src={getEmbedUrl(videoItem.url)}
                                title={videoItem.title || 'Platform Video'}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={videoItem.url}
                                playsInline
                                autoPlay={isPlaying}
                                preload="none"
                                className="w-full h-full object-cover"
                              />
                            )}

                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end">
                              <div className="p-3 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center gap-4">
                                <button
                                  onClick={handleRewind}
                                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all cursor-pointer"
                                  title={t.rewind10s}
                                >
                                  <RotateCcw className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => setIsPlaying(!isPlaying)}
                                  className="p-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 transition-all cursor-pointer"
                                >
                                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                                </button>
                                <button
                                  onClick={handleForward}
                                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all cursor-pointer"
                                  title={t.forward10s}
                                >
                                  <RotateCw className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {previewTab === 'gallery' && (
                  <div className="w-full max-w-4xl h-full flex flex-col pt-16 p-4">
                    {(() => {
                      const imageItems = activePreviewPlatform.media.filter(m => m.type === 'image');
                      const currentMedia = imageItems[activeMediaIndex] || { url: activePreviewPlatform.thumbnail, title: activePreviewPlatform.title };

                      return (
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative flex items-center justify-center p-2 mb-4">
                            <img
                              src={currentMedia.url}
                              alt={currentMedia.title || activePreviewPlatform.title}
                              className="max-h-[65vh] max-w-full object-contain rounded-xl"
                              loading="lazy"
                            />
                          </div>

                          <div className="flex items-center gap-3 overflow-x-auto pb-2">
                            {imageItems.map((img, idx) => (
                              <button
                                key={img.id || idx}
                                onClick={() => setActiveMediaIndex(idx)}
                                className={`w-24 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                  activeMediaIndex === idx
                                    ? 'border-cyan-400 scale-105 shadow-md shadow-cyan-400/20'
                                    : 'border-slate-800 opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" loading="lazy" />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
