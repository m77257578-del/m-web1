import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  ShoppingBag, 
  Database, 
  Layout, 
  Cpu, 
  Headphones, 
  Zap, 
  ArrowLeft, 
  ArrowRight,
  Check, 
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ServicesProps {
  onSelectService: (serviceName: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  const { t, language } = useLanguage();

  const services = [
    {
      id: 'edtech-platforms',
      title: language === 'ar' ? 'برمجة المنصات التعليمية والأكاديميات الرقمية' : 'Educational Platforms & Digital Academies',
      description: language === 'ar'
        ? 'نبتكر ونبرمج منصات تعليمية متكاملة للمعلمين والأكاديميات تحمي الفيديوهات من التسجيل أو التحميل، مع نظام امتحانات ذكية وتصحيح تلقائي، اشتراكات وبوابات دفع، ومتابعة فورية لمستوى الطلاب.'
        : 'We engineer complete e-learning platforms for instructors and academies with video protection against recording, automated smart exams, payment subscriptions, and real-time student progress tracking.',
      icon: 'GraduationCap',
      badge: language === 'ar' ? 'تخصص رائد' : 'Core Specialty',
      features: language === 'ar' ? [
        'حماية مشددة للمحاضرات والفيديوهات ومنع التحميل والشاشات المزدوجة',
        'نظام بنك أسئلة واختبارات تفاعلية بتصحيح آلي فوري وإصدار شهادات',
        'لوحة تحكم شاملة للمعلم لإدارة المذكرات، الحصص، وأكواد التفعيل',
        'تكامل كامل مع محافظ الدفع الإلكتروني والبطاقات البنكية'
      ] : [
        'Advanced lecture & video protection preventing unauthorized downloads',
        'Interactive question banks with instant auto-grading & certificates',
        'Comprehensive instructor dashboard for lessons, files & activation codes',
        'Full integration with digital wallets and bank card payments'
      ]
    },
    {
      id: 'ecommerce-stores',
      title: language === 'ar' ? 'تطوير المتاجر الإلكترونية وبوابات الدفع' : 'E-Commerce Stores & Payment Gateways',
      description: language === 'ar'
        ? 'بناء متاجر إلكترونية فائقة السرعة والاستجابة مصممة لرفع معدلات الشراء مع دعم إدارة المخزون اللحظية، الخصومات التلقائية، وتتبع الشحنات المباشر.'
        : 'Building ultra-fast, conversion-optimized online stores featuring real-time inventory management, automated discounts, and live shipment tracking.',
      icon: 'ShoppingBag',
      badge: language === 'ar' ? 'الأعلى مبيعاً' : 'Best Seller',
      features: language === 'ar' ? [
        'ربط جميع بوابات الدفع الإلكتروني المحلية والدولية بسلاسة وأمان',
        'سلة شراء سريعة وخطوات دفع مختصرة وسهلة للعميل',
        'إدارة دقيقة للمخزون والتنبيه عند نفاد المنتجات أو المتغيرات',
        'تكامل تلقائي مع شركات الشحن وإرسال إشعارات وتحديثات للعملاء'
      ] : [
        'Seamless integration with local and international payment gateways',
        'Fast shopping cart and streamlined one-step checkout experience',
        'Accurate inventory tracking with low-stock alerts and variants',
        'Automated shipping carrier sync and customer order notifications'
      ]
    },
    {
      id: 'management-systems',
      title: language === 'ar' ? 'الأنظمة الإدارية ولوحات التحكم السحابية' : 'Cloud Management Systems & Dashboards',
      description: language === 'ar'
        ? 'نطور أنظمة إدارة أعمال مركزية مخصصة لتنظيم عملياتك، الفواتير الإلكترونية المعتمدة، إدارة الموظفين، وتقارير أداء ومخططات تحليلية لحظية لاتخاذ قرارات أسرع.'
        : 'Custom centralized business management systems for organizing operations, certified electronic invoicing, HR management, and real-time analytical reports.',
      icon: 'Database',
      badge: language === 'ar' ? 'أتمتة الأعمال' : 'Business Automation',
      features: language === 'ar' ? [
        'إدارة صلاحيات دقيقة للمستخدمين والموظفين والأقسام',
        'تقارير إحصائية ورسوم بيانية تفاعلية في الوقت الفعلي',
        'نظام فواتير سحابي متوافق مع متطلبات الفوترة الإلكترونية',
        'إشعارات وتنبيهات فورية للمهام ومزامنة البيانات اللحظية'
      ] : [
        'Granular role and permission management for staff and departments',
        'Real-time statistical reports and interactive visual charts',
        'Cloud invoicing compliant with official e-invoicing standards',
        'Instant task alerts and real-time data synchronization'
      ]
    },
    {
      id: 'corporate-websites',
      title: language === 'ar' ? 'مواقع الشركات وصفحات الهبوط التسويقية' : 'Corporate Websites & Marketing Landing Pages',
      description: language === 'ar'
        ? 'واجهات مستخدم فريدة تعكس قوة واحترافية علامتك التجارية، مصممة من الصفر مع سرعة تحميل قياسية وتهيئة كاملة لمحركات البحث.'
        : 'Distinctive user interfaces that reflect your brand authority, crafted from scratch with lightning-fast load times and complete search engine optimization.',
      icon: 'Layout',
      badge: language === 'ar' ? 'هوية رقمية' : 'Digital Identity',
      features: language === 'ar' ? [
        'تصميم تفاعلي متجاوب 100% مع الهواتف الذكية ومختلف الشاشات',
        'سرعة استجابة مذهلة وتجربة تصفح سلسة للزوار',
        'تهيئة متقدمة لمحركات البحث لزيادة الزيارات والعملاء',
        'لوحة تحكم مرنة وسهلة الاستخدام لإدارة المحتوى والمقالات'
      ] : [
        '100% responsive interactive design across mobile, tablet, and desktop',
        'Blazingly fast page response and smooth browsing experience',
        'Advanced SEO optimization to boost organic search traffic',
        'Easy-to-use admin control panel for managing content and pages'
      ]
    },
    {
      id: 'web-apps-apis',
      title: language === 'ar' ? 'المنصات والتطبيقات المخصصة حسب الطلب' : 'Bespoke Web Platforms & Custom Solutions',
      description: language === 'ar'
        ? 'تنفيذ الأفكار البرمجية الخاصة والمنصات التفاعلية المتكاملة حسب متطلبات مشروعك، مع الربط المباشر مع واتساب وخدمات الإشعارات.'
        : 'Executing unique software visions and custom interactive platforms tailored to your exact business workflow, including automated WhatsApp notifications.',
      icon: 'Cpu',
      badge: language === 'ar' ? 'حلول مخصصة' : 'Custom Built',
      features: language === 'ar' ? [
        'بناء معمارية قوية قابلة للتوسع واستيعاب آلاف المستخدمين',
        'ربط منصتك مع إشعارات واتساب والرسائل التلقائية',
        'تأمين خطوط الاتصال والتشفير التام لنقل البيانات الحساسة',
        'ملكية كاملة للمشروع وقواعد البيانات'
      ] : [
        'Scalable architecture engineered to handle thousands of concurrent users',
        'Automated WhatsApp and instant messaging workflow integration',
        'End-to-end encryption and secure data transmission',
        'Full ownership of your platform and databases'
      ]
    },
    {
      id: 'support-devops',
      title: language === 'ar' ? 'الدعم الفني، الحماية والصيانة المستمرة' : 'Technical Support, Security & Maintenance',
      description: language === 'ar'
        ? 'فريق متخصص يعمل معك كشريك تقني لضمان استقرار مشروعك، وتطبيق أعلى معايير الأمان، وإجراء التحديثات الدورية دون انقطاع الخدمة.'
        : 'A dedicated technical team partnering with you to ensure platform stability, enforce top security standards, and perform seamless updates.',
      icon: 'Headphones',
      badge: language === 'ar' ? 'شريك مستمر' : '24/7 Partner',
      features: language === 'ar' ? [
        'مراقبة استقرار وسرعة المنصات على مدار الساعة 24/7',
        'تطبيق قواعد حماية مشددة لقواعد البيانات وحسابات العملاء',
        'نسخ احتياطي دوري للبيانات مع خطة استعادة فورية',
        'تحديث مستمر للمنصة وإضافة المميزات الجديدة بمرونة'
      ] : [
        '24/7 monitoring of platform uptime, speed, and reliability',
        'Strict database protection rules and customer account security',
        'Automated periodic backups with instant recovery plans',
        'Continuous platform updates and flexible feature expansions'
      ]
    }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6 text-cyan-400" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-6 h-6 text-teal-400" />;
      case 'Database':
        return <Database className="w-6 h-6 text-indigo-400" />;
      case 'Layout':
        return <Layout className="w-6 h-6 text-cyan-400" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-teal-400" />;
      case 'Headphones':
        return <Headphones className="w-6 h-6 text-amber-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <section id="services" className="py-24 bg-slate-950/60 relative overflow-hidden backdrop-blur-sm">
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-cyan-950/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-950/20 rounded-full blur-[160px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        {/* Section Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>{t.servicesBadge}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {t.servicesTitle}
          </h2>
          
          <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed">
            {t.servicesDesc}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
              whileHover={{ y: -5 }}
              className="group relative rounded-2xl bg-slate-900/60 border border-slate-800/80 p-7 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-colors duration-300 flex flex-col justify-between shadow-lg hover:shadow-cyan-950/20"
            >
              <div className="space-y-5">
                {/* Header with Icon and Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center justify-center w-13 h-13 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-cyan-500/50 group-hover:scale-105 transition-all duration-300 shadow-md">
                    {getIcon(service.icon)}
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-cyan-300">
                    {service.badge}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {service.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {service.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2 pt-2 border-t border-slate-800/60">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <div className="mt-0.5 w-3.5 h-3.5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-cyan-400" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer CTA */}
              <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-end">
                <button
                  onClick={() => onSelectService(service.title)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold text-cyan-300 hover:text-white transition-all cursor-pointer"
                >
                  <span>{t.orderService}</span>
                  {language === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
