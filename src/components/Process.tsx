import React from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, 
  PenTool, 
  Terminal, 
  ShieldCheck, 
  Rocket, 
  ArrowLeft,
  ArrowRight,
  Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Process: React.FC = () => {
  const { t, language } = useLanguage();

  const steps = [
    {
      step: '01',
      titleAr: 'التحليل ودراسة المتطلبات',
      titleEn: 'Requirements & Discovery Analysis',
      descAr: 'نجلس معك ونستمع لأهداف مشروعك، نحلل الجمهور المستهدف والمنافسين، ونحدد المعمارية التقنية الأنسب.',
      descEn: 'We consult with you on project goals, analyze target audiences, and define the optimal software architecture.',
      icon: <Compass className="w-5 h-5 text-cyan-400" />
    },
    {
      step: '02',
      titleAr: 'تصميم الواجهات وتجربة المستخدم',
      titleEn: 'UI/UX Design & Prototyping',
      descAr: 'بناء مخططات تفاعلية (Wireframes & UI/UX) عصرية تتناسب مع هوية علامتك قبل كتابة سطر كود واحد.',
      descEn: 'Creating modern, intuitive UI/UX prototypes tailored to your brand identity before code execution.',
      icon: <PenTool className="w-5 h-5 text-teal-400" />
    },
    {
      step: '03',
      titleAr: 'البرمجة والتطوير السحابي',
      titleEn: 'Agile Software Engineering',
      descAr: 'كتابة الأكواد بأحدث لغات وتقنيات الويب، ربط قاعدة بيانات Firestore، وتكامل واجهات البرمجة APIs.',
      descEn: 'Building with modern TypeScript & React, integrating Firestore databases, and configuring cloud APIs.',
      icon: <Terminal className="w-5 h-5 text-indigo-400" />
    },
    {
      step: '04',
      titleAr: 'فحص الأمان وتدقيق الأداء',
      titleEn: 'Security Audit & Performance Testing',
      descAr: 'اختبارات ضغط مكثفة، تدقيق قواعد أمان الحماية ABAC، وفحص التوافق الكامل مع مختلف الشاشات والمتصفحات.',
      descEn: 'Rigorous stress tests, ABAC security rule audits, and full cross-browser responsiveness checks.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
    },
    {
      step: '05',
      titleAr: 'الإطلاق الرسمي والدعم الفني',
      titleEn: 'Production Deployment & SLA Support',
      descAr: 'نشر المشروع على خوادم سحابية فائقة السرعة، تسليم الوثائق البرمجية، وتقديم دعم فني مستمر لضمان النجاح.',
      descEn: 'Deploying to high-speed cloud infrastructure with source code documentation and ongoing SLA tech support.',
      icon: <Rocket className="w-5 h-5 text-rose-400" />
    }
  ];

  return (
    <section id="process" className="py-24 bg-slate-900/60 relative overflow-hidden border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading with Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>{t.processBadge}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {t.processTitle}
          </h2>
          
          <p className="text-slate-400 text-base">
            {t.processDesc}
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="relative p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition-colors duration-300 space-y-3 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-2xl font-black font-mono text-slate-700 group-hover:text-cyan-400/80 transition-colors">
                    {item.step}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {language === 'ar' ? item.titleAr : item.titleEn}
                </h3>
                
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mt-2">
                  {language === 'ar' ? item.descAr : item.descEn}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -left-3 top-1/2 -translate-y-1/2 text-slate-700">
                  {language === 'ar' ? <ArrowLeft className="w-5 h-5 text-slate-700" /> : <ArrowRight className="w-5 h-5 text-slate-700" />}
                </div>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
