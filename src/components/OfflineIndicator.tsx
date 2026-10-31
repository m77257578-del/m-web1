import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { language } = useLanguage();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-xl">
      <span className="h-2.5 w-2.5 rounded-full bg-slate-950 animate-pulse" />
      <span>
        {language === 'ar'
          ? 'وضع عدم الاتصال — يتم عرض البيانات المحفوظة محلياً.'
          : 'Offline Mode — Cached data is being used.'}
      </span>
    </div>
  );
};
