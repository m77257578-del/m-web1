import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, User } from 'lucide-react';
import { subscribeToRatings, Rating } from '../services/ratings';
import { useLanguage } from '../context/LanguageContext';

export const ClientRatings: React.FC = () => {
  const { language, t } = useLanguage();
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    return subscribeToRatings((data) => {
      setRatings(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });
  }, []);

  return (
    <section className="py-16 bg-slate-900/30 backdrop-blur-sm border-y border-slate-800/50 mb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-3">
            {t.ratingsTitle}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            {language === 'ar' ? 'فخورون بثقة عملائنا في جودة برمجياتنا' : 'Proud of our clients trust in our software quality'}
          </p>
          <button
            onClick={() => (window as any).openRatingModal?.()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Star className="w-4 h-4 fill-current" />
            <span>{language === 'ar' ? 'أضف تقييمك الآن' : 'Rate Us Now'}</span>
          </button>
        </div>

        {ratings.length === 0 ? (
          <div className="text-center py-10 opacity-60">
             <Star className="w-8 h-8 text-slate-700 mx-auto mb-2" />
             <p className="text-xs text-slate-500">
               {language === 'ar' ? 'لا توجد تقييمات منشورة حالياً' : 'No ratings published yet'}
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ratings.slice(0, 6).map((rating) => (
              <motion.div
                key={rating.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rating.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                    />
                  ))}
                </div>
                <p className="text-slate-200 text-sm mb-5 italic leading-relaxed">"{rating.comment}"</p>
                <div className="flex items-center gap-2.5 pt-4 border-t border-slate-800/50">
                  <div className="w-8 h-8 rounded-full bg-cyan-950 flex items-center justify-center text-cyan-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-xs">{rating.userName}</span>
                    <span className="text-[10px] text-slate-500">{new Date(rating.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
