import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send } from 'lucide-react';
import { addRating } from '../services/ratings';
import { useLanguage } from '../context/LanguageContext';

export const RatingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment('');
      setUserName('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (rating === 0) return;
    addRating({ rating, comment, userName: userName.trim() || (language === 'ar' ? 'زائر' : 'Visitor') });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 border border-slate-700 p-6 rounded-3xl w-full max-w-sm shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-white">
                {language === 'ar' ? 'قيم تجربتك معنا' : 'Rate Your Experience'}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-8 h-8 cursor-pointer ${s <= (hovered || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(s)}
                />
              ))}
            </div>

            <input
              type="text"
              placeholder={language === 'ar' ? 'اسمك (اختياري)' : 'Your Name (optional)'}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-2 mb-3 bg-slate-800 rounded-xl text-white text-sm"
            />
            <textarea
              placeholder={language === 'ar' ? 'تعليقك...' : 'Your comment...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 mb-4 bg-slate-800 rounded-xl text-white text-sm h-20"
            />
            
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-cyan-500 rounded-xl text-slate-950 font-bold flex justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {language === 'ar' ? 'إرسال التقييم' : 'Submit Rating'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
