import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Sparkles } from 'lucide-react';
import { usePlatformSettings } from '../services/platformSettings';
import { useLanguage } from '../context/LanguageContext';

interface Splash3DLoaderProps {
  onComplete: () => void;
}

export const Splash3DLoader: React.FC<Splash3DLoaderProps> = ({ onComplete }) => {
  const settings = usePlatformSettings();
  const { language } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 25;
      const ny = (e.clientY / window.innerHeight - 0.5) * -25;
      setMouseTilt({ x: ny, y: nx });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2300; // 2.3s smooth 3D load

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setIsExiting(true);
        setTimeout(() => {
          onComplete();
        }, 550);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [onComplete]);

  const getStatusText = () => {
    if (language === 'ar') {
      if (progress < 35) return 'جاري تهيئة البيئة الرقمية ثلاثية الأبعاد...';
      if (progress < 75) return 'جاري تحميل واجهات المنصة والأقسام...';
      if (progress < 100) return 'اكتمل التحميل، جاري فتح البوابة...';
      return 'مرحباً بك في ' + settings.brandNameAr;
    } else {
      if (progress < 35) return 'Initializing 3D Digital Environment...';
      if (progress < 75) return 'Loading Platform Modules & Interfaces...';
      if (progress < 100) return 'Ready, Launching 3D Portal...';
      return 'Welcome to ' + settings.brandNameEn;
    }
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="splash-3d-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.45,
            filter: 'blur(16px)',
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden select-none"
          style={{ perspective: '1200px' }}
        >
          {/* Deep 3D Space Grid Floor & Ceiling */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.22) 0%, transparent 65%),
                linear-gradient(to right, rgba(34, 211, 238, 0.07) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(34, 211, 238, 0.07) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 48px 48px, 48px 48px',
              transform: `rotateX(${60 + mouseTilt.x * 0.3}deg) translateZ(-120px) scale(2)`,
              transformStyle: 'preserve-3d',
            }}
          />

          {/* Ambient Radial Glows */}
          <div className="absolute w-[480px] h-[480px] rounded-full bg-cyan-500/15 blur-[130px] pointer-events-none animate-pulse" />
          <div className="absolute w-[320px] h-[320px] rounded-full bg-indigo-500/20 blur-[110px] pointer-events-none" />

          {/* Main 3D Interactive Stage */}
          <motion.div
            animate={{
              rotateX: mouseTilt.x,
              rotateY: mouseTilt.y,
            }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            className="relative flex flex-col items-center justify-center z-10"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* 3D Orbital Gyroscope & Rotating Hypercube */}
            <div
              className="relative w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center mb-10"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Outer 3D Ring 1 */}
              <motion.div
                animate={{ rotateX: [65, 65], rotateY: [0, 360], rotateZ: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-cyan-400/40 shadow-[0_0_30px_rgba(34,211,238,0.25)]"
                style={{ transformStyle: 'preserve-3d' }}
              />

              {/* Middle 3D Ring 2 */}
              <motion.div
                animate={{ rotateX: [0, 360], rotateY: [65, 65], rotateZ: [360, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4 rounded-full border-2 border-dashed border-teal-400/50 shadow-[0_0_25px_rgba(45,212,191,0.2)]"
                style={{ transformStyle: 'preserve-3d' }}
              />

              {/* Inner 3D Ring 3 */}
              <motion.div
                animate={{ rotateX: [45, 405], rotateY: [-45, -405], rotateZ: [0, 180] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-9 rounded-full border border-indigo-400/60 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                style={{ transformStyle: 'preserve-3d' }}
              />

              {/* 3D Volumetric Rotating Cube */}
              <motion.div
                animate={{
                  rotateX: [0, 360],
                  rotateY: [0, 360],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="relative w-24 h-24"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front Face */}
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/30 via-slate-900/80 to-indigo-600/30 border border-cyan-400/70 backdrop-blur-md flex items-center justify-center shadow-[0_0_35px_rgba(34,211,238,0.4)]"
                  style={{ transform: 'translateZ(48px)' }}
                >
                  <Code2 className="w-10 h-10 text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                </div>

                {/* Back Face */}
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/30 via-slate-900/80 to-cyan-600/30 border border-teal-400/70 backdrop-blur-md flex items-center justify-center"
                  style={{ transform: 'rotateY(180deg) translateZ(48px)' }}
                >
                  <span className="font-black text-xl text-white font-mono">
                    {settings.logoMain}
                    <span className="text-cyan-400">{settings.logoHighlight}</span>
                  </span>
                </div>

                {/* Right Face */}
                <div
                  className="absolute inset-0 rounded-2xl bg-cyan-950/50 border border-cyan-400/50 backdrop-blur-md flex items-center justify-center"
                  style={{ transform: 'rotateY(90deg) translateZ(48px)' }}
                >
                  <Sparkles className="w-8 h-8 text-teal-300" />
                </div>

                {/* Left Face */}
                <div
                  className="absolute inset-0 rounded-2xl bg-indigo-950/50 border border-indigo-400/50 backdrop-blur-md flex items-center justify-center"
                  style={{ transform: 'rotateY(-90deg) translateZ(48px)' }}
                >
                  <Code2 className="w-8 h-8 text-indigo-300" />
                </div>

                {/* Top Face */}
                <div
                  className="absolute inset-0 rounded-2xl bg-cyan-500/20 border border-cyan-300/50 backdrop-blur-md"
                  style={{ transform: 'rotateX(90deg) translateZ(48px)' }}
                />

                {/* Bottom Face */}
                <div
                  className="absolute inset-0 rounded-2xl bg-teal-500/20 border border-teal-300/50 backdrop-blur-md shadow-[0_0_50px_rgba(34,211,238,0.5)]"
                  style={{ transform: 'rotateX(-90deg) translateZ(48px)' }}
                />
              </motion.div>

              {/* Floating 3D Percentage Hologram Badge */}
              <div
                className="absolute -bottom-3 px-4 py-1 rounded-full bg-slate-900/95 border border-cyan-400/60 text-cyan-300 font-mono font-black text-sm shadow-[0_0_20px_rgba(34,211,238,0.35)]"
                style={{ transform: 'translateZ(70px)' }}
              >
                {progress}%
              </div>
            </div>

            {/* Brand Title in 3D Depth */}
            <div
              className="text-center space-y-2 px-4"
              style={{ transform: 'translateZ(40px)' }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>
                  {language === 'ar' ? settings.brandNameAr : settings.brandNameEn} • 3D EXPERIENCE
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-['JetBrains_Mono',monospace]">
                {settings.logoMain}
                <span className="text-cyan-400">{settings.logoHighlight}</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 font-medium min-h-[20px]">
                {getStatusText()}
              </p>
            </div>

            {/* 3D Glowing Progress Bar */}
            <div
              className="w-72 sm:w-80 mt-6 space-y-2"
              style={{ transform: 'translateZ(30px)' }}
            >
              <div className="h-2.5 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-0.5 shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-300 to-indigo-500 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                <span>3D CORE ENGINE</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsExiting(true);
                    setTimeout(onComplete, 300);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer font-sans font-bold"
                >
                  {language === 'ar' ? 'دخول فوري ←' : 'Enter Now →'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
