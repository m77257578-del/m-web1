import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, 
  Layers, 
  Filter, 
  RefreshCw, 
  Calendar, 
  X
} from 'lucide-react';
import { Project } from '../types';
import { subscribeToProjects } from '../services/firebase';
import { useLanguage } from '../context/LanguageContext';
import { localizePortfolioProject } from '../i18n';

interface PortfolioProps {
  onNavigateToOrder: () => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ 
  onNavigateToOrder 
}) => {
  const { t, language, td } = useLanguage();
  const [rawProjects, setRawProjects] = useState<Project[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToProjects((fetchedProjects) => {
      setRawProjects(fetchedProjects);
      setIsLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const projects = rawProjects.map((p) => localizePortfolioProject(p, language));

  const tags = ['all', ...Array.from(new Set(projects.map((p) => p.tag).filter(Boolean)))];

  const filteredProjects = selectedTag === 'all'
    ? projects
    : projects.filter((p) => p.tag === selectedTag);

  const formatDate = (dateVal: any) => {
    if (!dateVal) return language === 'ar' ? 'حديثاً' : 'Recently';
    try {
      const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
      if (isNaN(d.getTime())) return language === 'ar' ? 'حديثاً' : 'Recently';
      return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short' }).format(d);
    } catch {
      return language === 'ar' ? 'حديثاً' : 'Recently';
    }
  };

  return (
    <section id="portfolio" className="py-24 bg-slate-950/60 relative overflow-hidden backdrop-blur-sm border-y border-slate-800/60">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/40 text-cyan-400 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>{t.portfolioBadge}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {t.portfolioTitle}
            </h2>
            
            <p className="text-slate-400 text-base">
              {t.portfolioDesc}
            </p>
          </div>

          {projects.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>{projects.length} {language === 'ar' ? 'مشاريع منشورة' : 'Published Projects'}</span>
              </span>
            </div>
          )}
        </motion.div>

        {/* Filter Tags */}
        {tags.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none"
          >
            <Filter className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {tag === 'all' ? t.allCategories : td(tag)}
              </button>
            ))}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">
              {language === 'ar' ? 'جاري تحميل المشاريع...' : 'Loading projects...'}
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800/80 p-8 max-w-2xl mx-auto space-y-4">
            <Layers className="w-12 h-12 text-cyan-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">
              {language === 'ar' ? 'هل لديك فكرة مشروع ترغب في تنفيذها؟' : 'Have a Project Idea You Want to Build?'}
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {language === 'ar'
                ? 'فريقنا مستعد لتنفيذ رؤيتك من الصفر بأفضل المعايير. يمكنك أيضاً إضافة أعمالك مباشرة من لوحة تحكم الإدارة.'
                : 'Our team is ready to build your vision from scratch. You can also publish portfolio works directly from the Admin Panel.'}
            </p>
            <button
              onClick={onNavigateToOrder}
              className="px-6 py-3 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:shadow-lg hover:shadow-cyan-400/25 transition-all cursor-pointer"
            >
              {language === 'ar' ? 'ابدأ مشروعك الآن' : 'Start Your Project Now'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl bg-slate-950/80 border border-slate-800/80 overflow-hidden hover:border-cyan-500/40 transition-colors duration-300 flex flex-col justify-between shadow-xl hover:shadow-cyan-950/30"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                  
                  <div className="absolute top-3 right-3">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 text-cyan-300 shadow">
                      {project.tag}
                    </span>
                  </div>

                  {project.createdAt && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md text-slate-400 border border-slate-800">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{formatDate(project.createdAt)}</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-slate-300 text-sm mt-2 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setActiveModalProject(project)}
                      className="text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {language === 'ar' ? 'تفاصيل المشروع' : 'Project Details'}
                    </button>

                    <a
                      href={project.demoUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-sm shadow-cyan-400/20"
                    >
                      <span>{t.livePreview}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Project Details Modal */}
      <AnimatePresence>
        {activeModalProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6"
            >
              <button
                onClick={() => setActiveModalProject(null)}
                className="absolute top-4 left-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 pr-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
                  {activeModalProject.tag}
                </span>
                <h3 className="text-2xl font-black text-white mt-2">
                  {activeModalProject.title}
                </h3>
              </div>

              <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={activeModalProject.image}
                  alt={activeModalProject.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-300">
                  {language === 'ar' ? 'شرح ومواصفات المشروع:' : 'Project Specifications:'}
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {activeModalProject.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    setActiveModalProject(null);
                    onNavigateToOrder();
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-cyan-400 hover:bg-cyan-300 cursor-pointer"
                >
                  {t.orderSimilar}
                </button>

                <a
                  href={activeModalProject.demoUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700"
                >
                  <span>{t.livePreview}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
