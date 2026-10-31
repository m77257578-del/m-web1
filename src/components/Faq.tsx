import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Faq: React.FC = () => {
  const { t, language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      qAr: 'كم يستغرق تنفيذ مشروع الويب بالكامل؟',
      qEn: 'How long does a full web project take?',
      aAr: 'تعتمد المدة على نطاق المشروع ومميزاته؛ فالمواقع التعريفية وصفحات الهبوط تستغرق عادة من 5 إلى 10 أيام عمل، بينما المتاجر الإلكترونية والأنظمة الإدارية ومنصات الـ SaaS المتقدمة تتراوح بين أسبوعين إلى 5 أسابيع مع تقارير أسبوعية حية عن التقدم.',
      aEn: 'Timelines range from 5-10 business days for corporate landing pages to 2-5 weeks for complex SaaS platforms, LMS, and custom ERP systems.'
    },
    {
      qAr: 'كيف يتم تحديد التكلفة والأسعار؟',
      qEn: 'How is pricing determined?',
      aAr: 'نقدم تسعيراً واضحاً وشفافاً ومخصصاً لحجم متطلباتك الفنية دون أي رسوم خفية. بعد استلام نموذج طلبك، نرسل لك تحليلاً فنياً مجانياً شاملاً تكلفة التنفيذ ومراحل الدفع الميسرة.',
      aEn: 'Pricing is transparent based on technical scope with zero hidden fees. We provide a detailed free technical estimate upon request.'
    },
    {
      qAr: 'هل أحصل على ملكية الكود المصدري وقاعدة البيانات؟',
      qEn: 'Do I get full source code & database ownership?',
      aAr: 'نعم، بكل تأكيد! يحصل العميل على ملكية كاملة بنسبة 100% لجميع الأكواد المصدرية، ملفات التصميم، وحساب قاعدة بيانات Firebase Firestore مع كامل الصلاحيات الإدارية.',
      aEn: 'Yes! You receive 100% full commercial ownership of all source code, Figma design files, and database access.'
    },
    {
      qAr: 'ماذا بشأن خدمة ما بعد التسليم والصيانة؟',
      qEn: 'What about post-launch maintenance & warranty?',
      aAr: 'نقدم فترة ضمان ودعم فني مجاني بعد التسليم للتحقق من استقرار النظام ومعالجة أي ملاحظات، مع توفر باقات صيانة شهرية وسنوية اختيارية للترقيات والميزات الإضافية.',
      aEn: 'We provide post-launch support and warranty to ensure system stability, with optional monthly and annual SLA maintenance plans.'
    },
    {
      qAr: 'ما هي طرق الدفع المتاحة للتعاقد؟',
      qEn: 'What payment options are available?',
      aAr: 'ندعم خيارات دفع مرنة متعددة تشمل التحويل البنكي المباشر، البطاقات الائتمانية (Visa / MasterCard)، وبوابات الدفع الإلكترونية المعتمدة محلياً ودولياً.',
      aEn: 'We support bank wires (IBAN), InstaPay, Vodafone Cash, credit cards (Visa/MasterCard/Mada), and PayPal.'
    }
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-slate-950/60 relative overflow-hidden backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading with Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.faqBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {t.faqTitle}
          </h2>

          <p className="text-slate-400 text-base">
            {t.faqDesc}
          </p>
        </motion.div>

        {/* Accordion list with Motion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const question = language === 'ar' ? faq.qAr : faq.qEn;
            const answer = language === 'ar' ? faq.aAr : faq.aEn;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-right focus:outline-none cursor-pointer"
                >
                  <span className="text-base sm:text-lg font-bold text-white hover:text-cyan-300 transition-colors">
                    {question}
                  </span>
                  <div className={`p-1.5 rounded-lg bg-slate-800 text-slate-300 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-cyan-950 text-cyan-400' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 sm:px-6 text-slate-300 text-sm sm:text-base leading-relaxed border-t border-slate-800/60 pt-4">
                        {answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
