import React, { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, CheckCircle2, X, Laptop } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../context/LanguageContext';
import { usePlatformSettings } from '../services/platformSettings';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'hero' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language } = useLanguage();
  const settings = usePlatformSettings();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running as an installed standalone PWA, hide the install button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const brandTitle = language === 'ar' ? settings.brandNameAr : settings.brandNameEn;

  return (
    <>
      {variant === 'hero' ? (
        <button
          type="button"
          data-testid="pwa-install-btn-hero"
          onClick={handleInstallClick}
          className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-black text-sm sm:text-base text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 shadow-lg shadow-amber-500/25 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Download className="w-5 h-5 stroke-[2.5]" />
          <span>{language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}</span>
        </button>
      ) : variant === 'compact' ? (
        <button
          type="button"
          data-testid="pwa-install-btn-compact"
          onClick={handleInstallClick}
          title={language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{language === 'ar' ? 'تثبيت التطبيق' : 'Install'}</span>
        </button>
      ) : (
        <button
          type="button"
          data-testid="pwa-install-btn-navbar"
          onClick={handleInstallClick}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:opacity-95 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>{language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}</span>
        </button>
      )}

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-amber-500/40 p-6 shadow-2xl relative text-right">
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              aria-label={language === 'ar' ? 'إغلاق نافذة تثبيت التطبيق' : 'Close install guide'}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
                <Smartphone className="w-6 h-6 stroke-[2.3]" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/50">
                  PWA APP READY
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  {language === 'ar'
                    ? `تثبيت تطبيق ${brandTitle} على جهازك`
                    : `Install ${brandTitle} App`}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {language === 'ar'
                ? 'يعمل الموقع بتقنية تطبيقات الويب التقدمية (PWA) ليتيح لك فتح المنصة مباشرة من الشاشة الرئيسية لهاتفك أو حاسوبك بسرعة فائقة وبدون متصفح.'
                : 'This platform is a Progressive Web App (PWA). Install it to your home screen or desktop for instant full-screen access.'}
            </p>

            {isInstallable && (
              <button
                type="button"
                onClick={async () => {
                  const done = await install();
                  if (done) setShowGuideModal(false);
                }}
                className="w-full mb-4 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {language === 'ar'
                    ? 'تثبيت التطبيق المباشر الآن'
                    : 'Install App Directly Now'}
                </span>
              </button>
            )}

            <div className="space-y-3 text-xs">
              {isIOS ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="font-bold text-amber-300 flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    <span>
                      {language === 'ar'
                        ? 'خطوات التثبيت على iPhone / iPad (سفاري):'
                        : 'Install on iPhone / iPad (Safari):'}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {language === 'ar' ? (
                      <>
                        1. اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح Safari السفلي.
                        <br />
                        2. مرر للأسفل واختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.
                      </>
                    ) : (
                      <>
                        1. Tap the <strong>Share</strong> button in Safari toolbar.
                        <br />
                        2. Scroll down and tap <strong>Add to Home Screen</strong>.
                      </>
                    )}
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-cyan-300 flex items-center gap-2">
                      <PlusSquare className="w-4 h-4" />
                      <span>
                        {language === 'ar'
                          ? 'على هواتف أندرويد (متصفح Chrome):'
                          : 'On Android (Chrome Browser):'}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {language === 'ar'
                        ? 'اضغط على قائمة المتصفح (⋮) في الأعلى ثم اختر "تثبيت التطبيق" (Install App) أو "الإضافة إلى الشاشة الرئيسية".'
                        : 'Tap the browser menu (⋮) at the top right and select "Install App" or "Add to Home Screen".'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-emerald-300 flex items-center gap-2">
                      <Laptop className="w-4 h-4" />
                      <span>
                        {language === 'ar'
                          ? 'على الكمبيوتر (Chrome / Edge):'
                          : 'On Desktop (Chrome / Edge):'}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {language === 'ar'
                        ? 'اضغط على أيقونة التثبيت (+) الموجودة في شريط العنوان أعلى المتصفح لتثبيت التطبيق على سطح المكتب.'
                        : 'Click the install icon (+) in the right side of the browser address bar.'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {language === 'ar'
                    ? 'يدعم العمل السحابي والتصفح السريع على Vercel'
                    : 'Optimized for Vercel & Offline Caching'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                {language === 'ar' ? 'حسناً' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
