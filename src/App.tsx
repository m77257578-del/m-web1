import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Sparkles, 
  Code2, 
  Layers, 
  ShieldCheck, 
  Users, 
  Send, 
  ArrowRight, 
  Grid,
  CreditCard,
  Laptop,
  Award,
  BookOpen
} from 'lucide-react';
import { Navbar, PlatformTab } from './components/Navbar';
import { Hero } from './components/Hero';
import { DemoPlatforms } from './components/DemoPlatforms';
import { ClientProjects } from './components/ClientProjects';
import { Articles } from './components/Articles';
import { Services } from './components/Services';
import { PaymentMethods } from './components/PaymentMethods';
import { Portfolio } from './components/Portfolio';
import { OrderForm } from './components/OrderForm';
import { WhyUs } from './components/WhyUs';
import { Process } from './components/Process';
import { JoinUs } from './components/JoinUs';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { AdminModal } from './components/AdminModal';
import { WhatsAppOrderModal } from './components/WhatsAppOrderModal';
import { PlatformOrderModal } from './components/PlatformOrderModal';
import { ChatWidget } from './components/ChatWidget';
import { AiRobotWidget } from './components/AiRobotWidget';
import { SpaceBackground } from './components/SpaceBackground';
import { Splash3DLoader } from './components/Splash3DLoader';
import { usePlatformSettings } from './services/platformSettings';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const settings = usePlatformSettings();
  const { t, language } = useLanguage();
  const [splashCompleted, setSplashCompleted] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return true;
    }
    return false;
  });
  const [activeTab, setActiveTab] = useState<PlatformTab>('all');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [orderServiceTitle, setOrderServiceTitle] = useState('');

  // Platform Order Modal state (full name, phone, arabic name, english name -> slug link)
  const [platformOrderModalOpen, setPlatformOrderModalOpen] = useState(false);
  const [orderPlatformAr, setOrderPlatformAr] = useState('');
  const [orderPlatformEn, setOrderPlatformEn] = useState('');

  const navigateToOrder = (serviceName?: string) => {
    if (serviceName) {
      setOrderServiceTitle(serviceName);
      setSelectedService(serviceName);
    } else {
      setOrderServiceTitle(
        language === 'ar'
          ? `طلب تطوير برمجيات شامل من ${settings.brandNameAr}`
          : `Full Custom Software Order from ${settings.brandNameEn}`
      );
    }
    setWhatsappModalOpen(true);
  };

  const navigateToPortfolio = () => {
    setActiveTab('portfolio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tabsConfig = [
    { 
      id: 'all' as PlatformTab, 
      label: t.navHome, 
      icon: Grid,
      desc: language === 'ar' ? 'استعراض المنصة بالكامل' : 'Full Platform Overview'
    },
    { 
      id: 'demo-platforms' as PlatformTab, 
      label: t.navDemoPlatforms, 
      icon: Laptop,
      desc: language === 'ar' ? 'معاينة المنصات والأنظمة' : 'Live Interactive Systems'
    },
    { 
      id: 'client-projects' as PlatformTab, 
      label: t.navClientProjects, 
      icon: Award,
      desc: language === 'ar' ? 'مشاريع حية منشورة' : 'Delivered Client Works'
    },
    { 
      id: 'articles' as PlatformTab, 
      label: t.navArticles, 
      icon: BookOpen,
      desc: language === 'ar' ? 'مقالات وأدلة المنصة' : 'Articles & Guides'
    },
    { 
      id: 'payment-methods' as PlatformTab, 
      label: t.navPaymentMethods, 
      icon: CreditCard,
      desc: language === 'ar' ? 'وسائل الدفع والتحويلات' : 'Payment & Gateways'
    },
    { 
      id: 'services' as PlatformTab, 
      label: t.navServices, 
      icon: Code2,
      desc: language === 'ar' ? 'المنصات، المتاجر والأنظمة' : 'Platforms, Stores & ERP'
    },
    { 
      id: 'portfolio' as PlatformTab, 
      label: t.navPortfolio, 
      icon: Layers,
      desc: language === 'ar' ? 'نماذج وتطبيقات الويب' : 'Project Showcase'
    },
    { 
      id: 'about' as PlatformTab, 
      label: t.navWhyUs, 
      icon: ShieldCheck,
      desc: language === 'ar' ? 'معايير الجودة والسرعة' : 'Quality & Methodology'
    },
    { 
      id: 'join-us' as PlatformTab, 
      label: t.navJoinUs, 
      icon: Users,
      desc: language === 'ar' ? 'مبرمجين وخدمة عملاء' : 'Careers & Team'
    },
    { 
      id: 'order' as PlatformTab, 
      label: t.navOrderNow, 
      icon: Send,
      desc: language === 'ar' ? 'نموذج الطلب المباشر' : 'Direct Order Form'
    },
  ];

  return (
    <>
      {/* 3D Interactive Entry Loading Screen */}
      {!splashCompleted && (
        <Splash3DLoader onComplete={() => setSplashCompleted(true)} />
      )}

      <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-['Cairo',sans-serif] relative selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Dynamic Modern Programming Space & Animated Stars Background */}
        <SpaceBackground />

        {/* 1. Sticky Navbar (Contains secret 3-clicks on platform icon for Admin) */}
        <Navbar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateToOrder={() => navigateToOrder()}
          onOpenAdminModal={() => setAdminModalOpen(true)}
        />

        {/* Main Container */}
        <main className="flex-1 pt-16">
          {activeTab === 'all' ? (
            <>
              <Hero
                onNavigateToOrder={() => navigateToOrder()}
                onNavigateToPortfolio={navigateToPortfolio}
              />

              {/* Interactive Section Switcher Bar */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mb-4">
                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-2.5 backdrop-blur-md shadow-xl shadow-cyan-950/10">
                  <div className="flex items-center justify-between pb-2.5 px-3 border-b border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {language === 'ar' ? 'تصفح المنصة حسب التبويبات والأقسام:' : 'Browse Platform Sections & Categories:'}
                      </span>
                    </div>
                    <span className="text-slate-400 hidden sm:inline-block">
                      {language === 'ar'
                        ? 'انقر على أي تبويب للانتقال إلى قسم مخصص ومستقل'
                        : 'Click any tab below to open its dedicated view'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 pt-2.5">
                    {tabsConfig.map((tabItem) => {
                      const Icon = tabItem.icon;
                      const isSelected = activeTab === tabItem.id;
                      return (
                        <button
                          key={tabItem.id}
                          onClick={() => {
                            setActiveTab(tabItem.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all duration-200 text-center cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/40 text-white shadow-md shadow-cyan-500/10'
                              : 'bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800/60 text-slate-300 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold">{tabItem.label}</span>
                          <span className="text-[9px] text-slate-400 mt-0.5 hidden sm:block truncate w-full">{tabItem.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Complete Stream of Sections */}
              <div id="demo-platforms">
                <DemoPlatforms 
                  onSelectPlatformToOrder={(arTitle, enTitle) => {
                    setOrderPlatformAr(arTitle);
                    setOrderPlatformEn(enTitle);
                    setPlatformOrderModalOpen(true);
                  }} 
                />
              </div>

              <div id="client-projects">
                <ClientProjects onNavigateToOrder={() => navigateToOrder()} />
              </div>

              <div id="payment-methods">
                <PaymentMethods onSelectPaymentMethod={(method) => navigateToOrder(method)} />
              </div>

              <div id="articles">
                <Articles onNavigateToOrder={(context) => navigateToOrder(context)} />
              </div>

              <div id="services">
                <Services onSelectService={(serviceTitle) => navigateToOrder(serviceTitle)} />
              </div>

              <div id="portfolio">
                <Portfolio onNavigateToOrder={() => navigateToOrder()} />
              </div>

              <div id="why-us">
                <WhyUs />
              </div>

              <div id="process">
                <Process />
              </div>

              <div id="join-us">
                <JoinUs />
              </div>

              <div id="order-form">
                <OrderForm initialService={selectedService} />
              </div>

              <div id="faq">
                <Faq />
              </div>
            </>
          ) : (
            /* Dedicated Tab View */
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
                      <span>{language === 'ar' ? 'قسم مخصص' : 'Dedicated Section'}</span>
                      <span>•</span>
                      <button 
                        onClick={() => setActiveTab('all')}
                        className="hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{language === 'ar' ? 'العودة إلى العرض الشامل للمنصة' : 'Back to Full Platform View'}</span>
                        <ArrowRight className={`w-3 h-3 ${language === 'ar' ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <h1 className="text-2xl font-black text-white">
                      {tabsConfig.find(tabItem => tabItem.id === activeTab)?.label}
                    </h1>
                  </div>

                  {/* Sub Tab Switcher Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                    {tabsConfig.map((tabItem) => {
                      const isSelected = activeTab === tabItem.id;
                      return (
                        <button
                          key={tabItem.id}
                          onClick={() => {
                            setActiveTab(tabItem.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          {tabItem.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tab Specific Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'demo-platforms' && (
                  <motion.div
                    key="demo-platforms"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DemoPlatforms 
                      onSelectPlatformToOrder={(arTitle, enTitle) => {
                        setOrderPlatformAr(arTitle);
                        setOrderPlatformEn(enTitle);
                        setPlatformOrderModalOpen(true);
                      }} 
                    />
                  </motion.div>
                )}

                {activeTab === 'client-projects' && (
                  <motion.div
                    key="client-projects"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ClientProjects onNavigateToOrder={() => navigateToOrder()} />
                  </motion.div>
                )}

                {activeTab === 'articles' && (
                  <motion.div
                    key="articles"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Articles onNavigateToOrder={(context) => navigateToOrder(context)} />
                  </motion.div>
                )}

                {activeTab === 'payment-methods' && (
                  <motion.div
                    key="payment-methods"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PaymentMethods onSelectPaymentMethod={(method) => navigateToOrder(method)} />
                  </motion.div>
                )}

                {activeTab === 'services' && (
                  <motion.div
                    key="services"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Services onSelectService={(serviceTitle) => navigateToOrder(serviceTitle)} />
                  </motion.div>
                )}

                {activeTab === 'portfolio' && (
                  <motion.div
                    key="portfolio"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Portfolio onNavigateToOrder={() => navigateToOrder()} />
                  </motion.div>
                )}

                {activeTab === 'about' && (
                  <motion.div
                    key="about"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <WhyUs />
                    <Process />
                    <Faq />
                  </motion.div>
                )}

                {activeTab === 'join-us' && (
                  <motion.div
                    key="join-us"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <JoinUs />
                  </motion.div>
                )}

                {activeTab === 'order' && (
                  <motion.div
                    key="order"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <OrderForm initialService={selectedService} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer onNavigateToOrder={() => navigateToOrder()} />

        {/* Secret Admin Modal (Triggered ONLY by 3 consecutive clicks on the platform logo icon) */}
        <AnimatePresence>
          {adminModalOpen && (
            <AdminModal
              isOpen={adminModalOpen}
              onClose={() => setAdminModalOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* WhatsApp Order Modal */}
        <WhatsAppOrderModal
          isOpen={whatsappModalOpen}
          onClose={() => setWhatsappModalOpen(false)}
          serviceTitle={orderServiceTitle}
        />

        {/* Platform Order Modal */}
        <PlatformOrderModal
          isOpen={platformOrderModalOpen}
          onClose={() => setPlatformOrderModalOpen(false)}
          defaultPlatformTitleAr={orderPlatformAr}
          defaultPlatformTitleEn={orderPlatformEn}
        />

        {/* Floating Customer Support Live Chat Widget */}
        <ChatWidget />

        {/* Floating Gemini Cyber Robot AI Assistant Widget */}
        <AiRobotWidget />
      </div>
    </>
  );
}
