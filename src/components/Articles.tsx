import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Share2, 
  X, 
  User, 
  Check, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Article, getArticles } from '../services/articles';
import { useLanguage } from '../context/LanguageContext';
import { localizeArticle } from '../i18n';

interface ArticlesProps {
  onNavigateToOrder?: (contextTitle?: string) => void;
}

export const Articles: React.FC<ArticlesProps> = ({ onNavigateToOrder }) => {
  const { t, language, td } = useLanguage();
  const [rawArticles, setRawArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticleModal, setActiveArticleModal] = useState<Article | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    loadArticles();
    const handleStorageChange = () => loadArticles();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadArticles = () => {
    setRawArticles(getArticles());
  };

  const articles = rawArticles.map((a) => localizeArticle(a, language));

  const categories = ['all', ...Array.from(new Set(articles.map(a => a.category)))];

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  const featuredArticle = articles.find(a => a.isFeatured) || articles[0];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // If no articles published by Admin yet, render a clean minimal section or hide until published
  if (articles.length === 0) {
    return null;
  }

  return (
    <section id="articles" className="py-20 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-4">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>{t.articlesBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            {t.articlesTitle}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t.articlesDesc}
          </p>

          {/* Categories Selector */}
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

        {/* Featured Article Hero Card */}
        {featuredArticle && selectedCategory === 'all' && (
          <div className="mb-12">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-cyan-500/30 hover:border-cyan-500/60 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden group transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-video lg:aspect-auto lg:h-72 bg-slate-950 border border-slate-800">
                  <img
                    src={featuredArticle.coverImage}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow">
                    {language === 'ar' ? 'مقال مميز' : 'Featured Article'}
                  </div>
                </div>

                <div className="lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold">
                        {featuredArticle.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{featuredArticle.readTime}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{featuredArticle.publishedAt}</span>
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-3 leading-snug group-hover:text-cyan-300 transition-colors">
                      {featuredArticle.title}
                    </h3>

                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                      {featuredArticle.excerpt}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                      {featuredArticle.author.avatar ? (
                        <img
                          src={featuredArticle.author.avatar}
                          alt={featuredArticle.author.name}
                          className="w-10 h-10 rounded-full object-cover border border-cyan-500/40"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-white">{featuredArticle.author.name}</div>
                        <div className="text-[11px] text-slate-400">{featuredArticle.author.role}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveArticleModal(featuredArticle)}
                      className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-400/20 cursor-pointer transition-all"
                    >
                      <span>{t.readMore}</span>
                      {language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <motion.div
              key={article.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-xl flex flex-col justify-between group transition-all duration-300"
            >
              <div>
                <div className="relative rounded-2xl overflow-hidden aspect-video mb-5 bg-slate-950 border border-slate-800">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-cyan-300 text-[11px] font-bold border border-cyan-500/30 backdrop-blur-sm">
                      {article.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-950/80 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-white mb-2 leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-slate-300 text-xs leading-relaxed mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-300 font-medium truncate max-w-[120px]">{article.author.name}</span>
                </div>

                <button
                  onClick={() => setActiveArticleModal(article)}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{t.readMore}</span>
                  {language === 'ar' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ARTICLE READER MODAL */}
      <AnimatePresence>
        {activeArticleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-950/50 overflow-hidden"
            >
              <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                    {activeArticleModal.category}
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                  <span className="text-xs text-slate-400 hidden sm:inline flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{activeArticleModal.readTime}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-bold">
                          {language === 'ar' ? 'تم النسخ!' : 'Copied!'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{language === 'ar' ? 'مشاركة' : 'Share'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveArticleModal(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                  {activeArticleModal.title}
                </h1>

                <div className="flex items-center justify-between pb-6 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{activeArticleModal.author.name}</div>
                      <div className="text-xs text-slate-400">{activeArticleModal.author.role}</div>
                    </div>
                  </div>

                  <div className="text-slate-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{activeArticleModal.publishedAt}</span>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-800">
                  <img
                    src={activeArticleModal.coverImage}
                    alt={activeArticleModal.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-cyan-950/30 border-r-4 border-cyan-400 text-cyan-200 text-sm sm:text-base leading-relaxed font-medium">
                  {activeArticleModal.excerpt}
                </div>

                <div className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4 font-normal">
                  {activeArticleModal.content}
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 text-center space-y-3">
                  <h3 className="text-lg font-bold text-white">
                    {language === 'ar' ? 'هل ترغب بتحويل فكرتك إلى منصة احترافية؟' : 'Ready to Turn Your Vision into a Professional Platform?'}
                  </h3>
                  <button
                    onClick={() => {
                      setActiveArticleModal(null);
                      if (onNavigateToOrder) {
                        onNavigateToOrder(activeArticleModal.title);
                      }
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-400/20 cursor-pointer"
                  >
                    {t.orderProject}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
