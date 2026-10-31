import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSelector: React.FC<{ variant?: 'navbar' | 'compact' }> = ({ variant = 'navbar' }) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-900/95 border border-slate-800 backdrop-blur-md shadow-inner">
        <button
          type="button"
          onClick={() => setLanguage('ar')}
          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            language === 'ar'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          عربي
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          EN
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md shadow-inner">
      <button
        type="button"
        onClick={() => setLanguage('ar')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          language === 'ar'
            ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md shadow-cyan-500/20'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Globe className="w-3 h-3" />
        <span>العربية</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md shadow-cyan-500/20'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Globe className="w-3 h-3" />
        <span>English</span>
      </button>
    </div>
  );
};
