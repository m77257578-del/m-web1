import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, Translations } from '../services/translations';
import { translateDynamicText } from '../i18n';
import { getPlatformSettings } from '../services/platformSettings';

interface LanguageContextType {
  language: Language;
  dir: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  td: (text: string | undefined) => string;
}

const STORAGE_KEY = 'mweb_preferred_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language;
      if (stored === 'ar' || stored === 'en') {
        return stored;
      }
    } catch (e) {
      console.warn(e);
    }
    return 'ar';
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (e) {
      console.warn(e);
    }

    // Apply HTML dir and lang attributes automatically for instant RTL/LTR layout flip
    document.documentElement.dir = dir;
    document.documentElement.lang = language;

    // Update document title dynamically based on active language
    const settings = getPlatformSettings();
    document.title = language === 'ar'
      ? `${settings.brandNameEn} | ${settings.brandNameAr} لتطوير البرمجيات وحلول الويب`
      : `${settings.brandNameEn} | Software Engineering & Digital Solutions`;
  }, [language, dir]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = translations[language];
  const td = (text: string | undefined) => translateDynamicText(text, language);

  return (
    <LanguageContext.Provider value={{ language, dir, setLanguage, toggleLanguage, t, td }}>
      <div dir={dir} lang={language} className={language === 'ar' ? 'text-right' : 'text-left'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = useLanguage;
