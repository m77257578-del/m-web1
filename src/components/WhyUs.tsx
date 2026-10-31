import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Code2, 
  Sparkles, 
  Gauge, 
  Headphones, 
  Smartphone, 
  Lock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const WhyUs: React.FC = () => {
  const { t, language } = useLanguage();

  const points = [
    {
      icon: <Gauge className="w-6 h-6 text-cyan-400" />,
      titleAr: 'سرعة فائقة وأداء استثنائي',
      titleEn: 'Ultra Speed & Exceptional Performance',
      descAr: 'نبني مواقعنا وفق أفضل معايير السرعة (Core Web Vitals) مع زمن استجابة لا يتعدى بضع أجزاء من الثانية وتحميل فوري للواجهات.',
      descEn: 'We build our web applications with Core Web Vitals best practices, sub-second response times, and instant UI rendering.'
    },
    {
      icon: <Lock className="w-6 h-6 text-emerald-400" />,
      titleAr: 'حماية وأمان سحابي مشدد',
      titleEn: 'Hardened Cloud Security & Protection',
      descAr: 'نطبق قواعد أمان حصرية على مستوى قاعدة البيانات Firestore Security Rules تمنع تسريب البيانات أو العبث بها بنسبة 100%.',
      descEn: 'Comprehensive Firestore Security Rules and role-based access control (ABAC) ensuring zero data tampering.'
    },
    {
      icon: <Code2 className="w-6 h-6 text-indigo-400" />,
      titleAr: 'كود نظيف ومعمارية قابلة للتوسع',
      titleEn: 'Clean Code & Scalable Architecture',
      descAr: 'كود معياري منظم (Modular Clean Code) قابل للتطوير والإضافة مستقبلاً دون الحاجة لإعادة كتابة النظام من الصفر.',
      descEn: 'Modular clean code built to scale seamlessly without needing complete refactoring as your business grows.'
    },
    {
      icon: <Smartphone className="w-6 h-6 text-teal-400" />,
      titleAr: 'متوافق مع جميع الشاشات والأجهزة',
      titleEn: '100% Responsive Across All Devices',
      descAr: 'تجربة استخدام مخصصة وسلسة على الهواتف الذكية، الأجهزة اللوحية، والشاشات المكتبية بمختلف المقاسات.',
      descEn: 'Smooth, fluid user experience optimized for smartphones, tablets, and desktop displays.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      titleAr: 'تصميم وهوية خاصة ببراندك',
      titleEn: 'Tailored Brand Design & UI Identity',
      descAr: 'لا نعتمد على قوالب جاهزة مكررة؛ نصمم كل واجهة من الصفر لتعبر بدقة عن هوية نشاطك التجاري وتبهر عملاءك.',
      descEn: 'Zero cookie-cutter templates. Every interface is handcrafted from scratch to reflect your brand identity.'
    },
    {
      icon: <Headphones className="w-6 h-6 text-rose-400" />,
      titleAr: 'دعم فني وضمان برمجي متواصل',
      titleEn: 'Continuous Tech Support & Warranty',
      descAr: 'نمنحك ضماناً على البرمجة مع دعم فني مستمر للرد على أي استفسارات أو إجراء التحديثات الفنية اللازمة.',
      descEn: 'Full software warranty with continuous technical support to answer queries and maintain optimal performance.'
    }
  ];

  return (
    <section id="why-us" className="py-24 bg-slate-950/60 relative overflow-hidden backdrop-blur-sm">
      {/* Main Container with smooth fade-in and slide-up once on scroll */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        
        {/* Section Heading with Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>{t.whyUsBadge}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {t.whyUsTitle}
          </h2>
          
          <p className="text-slate-400 text-base">
            {t.whyUsDesc}
          </p>
        </motion.div>

        {/* Grid of features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {points.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-colors duration-300 space-y-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {point.icon}
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {language === 'ar' ? point.titleAr : point.titleEn}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {language === 'ar' ? point.descAr : point.descEn}
              </p>
            </motion.div>
          ))}
        </div>

      </motion.div>
    </section>
  );
};
