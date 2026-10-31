import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Star, 
  CheckCircle2, 
  TrendingUp, 
  Quote, 
  ArrowUpRight,
  Award,
  Globe,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize2,
  X,
  Send
} from 'lucide-react';
import { ClientProject, useClientProjects } from '../services/clientProjects';
import { useLanguage } from '../context/LanguageContext';
import { localizeClientProject } from '../i18n';
import { ProtectedVideoPlayer } from './ProtectedVideoPlayer';

interface ClientProjectsProps {
  onNavigateToOrder?: () => void;
}

export const ClientProjects: React.FC<ClientProjectsProps> = ({ onNavigateToOrder }) => {
  const { t, language, td } = useLanguage();
  const projects = useClientProjects().map((p) => localizeClientProject(p, language));
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>('');
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

  const industries = ['all', ...Array.from(new Set(projects.map(p => p.industry)))];

  const filteredProjects = selectedIndustry === 'all'
    ? projects
    : projects.filter(p => p.industry === selectedIndustry);

  return (
    <section id="client-projects" className="py-20 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-300 text-xs font-bold mb-4">
            <Award className="w-4 h-4 text-teal-400" />
            <span>{t.clientBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            {t.clientProjectsTitle}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t.clientProjectsDesc}
          </p>

          {industries.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {industries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    selectedIndustry === ind
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 shadow-lg shadow-teal-500/20'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {ind === 'all' ? t.allCategories : td(ind)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Empty State if no client projects published by Admin yet */}
        {filteredProjects.length === 0 ? (
          <div className="max-w-2xl mx-auto rounded-3xl bg-slate-900/70 border border-slate-800/90 p-8 sm:p-10 text-center space-y-5 backdrop-blur-md shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center mx-auto text-teal-400">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-white">
              {language === 'ar' ? 'كن شريك نجاحنا القادم' : 'Become Our Next Success Story'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
              {language === 'ar'
                ? 'يتم نشر أعمال ومشاريع العملاء المعتمدة مباشرة عبر لوحة تحكم الإدارة. تواصل معنا الآن لبدء تنفيذ مشروعك.'
                : 'Verified client projects are published directly through the Admin Dashboard. Contact us today to launch your project.'}
            </p>
            {onNavigateToOrder && (
              <div>
                <button
                  onClick={onNavigateToOrder}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-teal-500/20 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.orderProject}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-900/80 border border-slate-800/90 hover:border-teal-500/40 rounded-3xl p-6 sm:p-7 backdrop-blur-md shadow-xl flex flex-col justify-between group transition-all duration-300"
              >
                <div>
                  {/* Image & Live Status Header */}
                  <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video bg-slate-950 border border-slate-800">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Top Live Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                        <span>{t.clientLiveStatus}</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-teal-300 text-[11px] font-bold border border-teal-500/30 backdrop-blur-sm">
                        {project.industry}
                      </span>
                    </div>

                    {/* Location badge */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 px-3 py-1 rounded-xl backdrop-blur-sm border border-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      <span>{project.location}</span>
                    </div>

                    {/* Launch Link & Video Button Overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      {project.videoUrl && (
                        <button
                          onClick={() => {
                            setActiveVideoUrl(project.videoUrl || null);
                            setActiveVideoTitle(project.title);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow backdrop-blur-sm cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{t.projectVideo}</span>
                        </button>
                      )}
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-teal-500 hover:text-slate-950 text-teal-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-teal-500/30 shadow backdrop-blur-sm"
                      >
                        <span>{t.visitSite}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Client Info Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-teal-400" />
                      <span className="text-slate-400">{t.clientLabel}</span>
                      <strong className="text-white">{project.clientName}</strong>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{project.completionDate}</span>
                    </div>
                  </div>

                  {/* Project Title & Description */}
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2 leading-snug">
                    {project.title}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Measurable Business Results */}
                  {project.results.length > 0 && (
                    <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-teal-900/40">
                      <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-teal-400" />
                        <span>{t.clientResultsTitle}</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {project.results.map((res: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Client Testimonial Card */}
                  {project.testimonial && (
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 relative">
                      <Quote className="w-6 h-6 text-teal-500/20 absolute top-3 left-3" />
                      <div className="flex items-center gap-1 text-amber-400 mb-2">
                        {Array.from({ length: project.testimonial.rating }).map((_, i: number) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-300 italic mb-3 leading-relaxed">
                        "{project.testimonial.quote}"
                      </p>
                      <div className="text-[11px] text-slate-400">
                        <strong className="text-white block">{project.testimonial.clientPerson}</strong>
                        <span>{project.testimonial.role}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{t.browseOnline}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {onNavigateToOrder && (
                    <button
                      onClick={onNavigateToOrder}
                      className="px-4 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
                    >
                      {t.orderSimilar}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal Popup */}
      <AnimatePresence>
        {activeVideoUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl overflow-hidden shadow-2xl"
            >
              <ProtectedVideoPlayer
                url={activeVideoUrl}
                title={activeVideoTitle}
                badgeLabel="فيديو"
                backButtonLabel={language === 'ar' ? 'رجوع للمشاريع' : 'Back to Projects'}
                onCloseModal={() => {
                  setIsPlaying(false);
                  setActiveVideoUrl(null);
                }}
                footerNote={language === 'ar' ? 'لا يوجد اختبار مرفق بهذا المحتوى' : 'No quiz attached to this content'}
                showSectionFrame={true}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
