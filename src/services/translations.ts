export type Language = 'ar' | 'en';

export interface Translations {
  // Common & Nav
  home: string;
  demoPlatforms: string;
  clientProjects: string;
  articles: string;
  paymentMethods: string;
  services: string;
  portfolio: string;
  about: string;
  joinUs: string;
  orderProject: string;
  adminTerminal: string;
  softwareAgency: string;

  // Hero
  heroBadge: string;
  heroHeadlineMain: string;
  heroHeadlineGradient: string;
  heroCTAPrimary: string;
  heroCTASecondary: string;
  guaranteeCode: string;
  guaranteeSecurity: string;
  guaranteeFirestore: string;
  guaranteeFast: string;
  projectsDone: string;
  securityStandards: string;
  supportHours: string;

  // Demo Platforms & Pricing
  demoSectionBadge: string;
  demoSectionTitle: string;
  demoSectionDesc: string;
  livePreview: string;
  monthlySub: string;
  annualSub: string;
  lifetimeBuy: string;
  orderThisPlatform: string;
  selectPlan: string;
  allCategories: string;

  // Client Projects
  clientBadge: string;
  clientProjectsTitle: string;
  clientProjectsDesc: string;
  visitLiveProject: string;

  // Services
  servicesBadge: string;
  servicesTitle: string;
  servicesDesc: string;
  orderService: string;

  // Portfolio
  portfolioBadge: string;
  portfolioTitle: string;
  portfolioDesc: string;

  // Why Us / Methodology
  whyUsBadge: string;
  whyUsTitle: string;
  whyUsDesc: string;

  // Process
  processBadge: string;
  processTitle: string;
  processDesc: string;

  // Articles
  articlesBadge: string;
  articlesTitle: string;
  articlesDesc: string;
  readMore: string;

  // Payment Methods
  paymentBadge: string;
  paymentTitle: string;
  paymentDesc: string;

  // Join Us
  joinBadge: string;
  joinTitle: string;
  joinDesc: string;

  // FAQ
  faqBadge: string;
  faqTitle: string;
  faqDesc: string;

  // Order Form
  orderFormTitle: string;
  orderFormDesc: string;
  yourName: string;
  whatsappPhone: string;
  projectDetails: string;
  submitOrder: string;

  // Footer & Chat
  footerRights: string;
  chatSupportTitle: string;
  chatSupportSubtitle: string;
  typeMessage: string;
  send: string;
  freeConsultation: string;

  // Additional UI strings
  clientLiveStatus: string;
  clientResultsTitle: string;
  clientLabel: string;
  browseOnline: string;
  orderSimilar: string;
  projectVideo: string;
  visitSite: string;
  expandFullscreen: string;
  rewind10s: string;
  forward10s: string;
  desktop: string;
  tablet: string;
  mobile: string;
  livePreviewBadge: string;
  instantPreview: string;
  suitableFor: string;
  softwareFeaturesAndSpecs: string;
  pricingPlans: string;
  choosePlanType: string;
  monthlySystem: string;
  annualSystem: string;
  permanentOwnership: string;
  save20Percent: string;
  orderThisPlatformNow: string;
  activeResponsiveServer: string;
  instantBookingRequest: string;
  viewPricingPackages: string;
  interactiveSimulatorReady: string;
  navHome: string;
  navDemoPlatforms: string;
  navClientProjects: string;
  navArticles: string;
  navPaymentMethods: string;
  navServices: string;
  navPortfolio: string;
  navWhyUs: string;
  navJoinUs: string;
  navOrderNow: string;
  quickLinks: string;
  contactUs: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    // Common & Nav
    home: 'الرئيسية',
    demoPlatforms: 'منصات المعاينة',
    clientProjects: 'أعمال العملاء',
    articles: 'مقالاتنا',
    paymentMethods: 'طرق الدفع',
    services: 'خدماتنا',
    portfolio: 'نماذج البرمجة',
    about: 'منهجيتنا',
    joinUs: 'انضم إلينا',
    orderProject: 'اطلب مشروعك',
    adminTerminal: 'لوحة التحكم',
    softwareAgency: 'وكالة هندسة المنصات والحلول الرقمية',

    // Hero
    heroBadge: 'شريكك التقني المعتمد لتطوير منصات الويب الحديثة',
    heroHeadlineMain: 'نحوّل رؤيتك الرقمية إلى',
    heroHeadlineGradient: 'واقع برمجي فائق الأداء',
    heroCTAPrimary: 'اطلب مشروعك الآن',
    heroCTASecondary: 'استكشف سابقة الأعمال',
    guaranteeCode: 'كود مخصص 100%',
    guaranteeSecurity: 'حماية مشددة ABAC',
    guaranteeFirestore: 'قواعد بيانات سحابية',
    guaranteeFast: 'تسليم فائق السرعة',
    projectsDone: 'مشروع منجز',
    securityStandards: 'معايير أمان',
    supportHours: 'دعم متواصل',

    // Demo Platforms & Pricing
    demoSectionBadge: 'معاينة حية ومباشرة للحلول الجاهزة',
    demoSectionTitle: 'استعراض منصات المعاينة الحية وأنظمة التسعير',
    demoSectionDesc: 'تصفح جولة تفاعلية داخل المنصات الجاهزة للاختبار، مع خيارات تسعير ثلاثية مرنة (شهري، سنوي، تمليك دائم).',
    livePreview: 'معاينة حية',
    monthlySub: 'اشتراك شهري',
    annualSub: 'اشتراك سنوي',
    lifetimeBuy: 'تمليك دائم',
    orderThisPlatform: 'طلب هذه المنصة',
    selectPlan: 'اختر الخطة المناسبة',
    allCategories: 'جميع التصنيفات',

    // Client Projects
    clientBadge: 'مشاريع تم تسليمها وتشغيلها بنجاح',
    clientProjectsTitle: 'أعمال ومشاريع العملاء المنشورة',
    clientProjectsDesc: 'منصات ومواقع حية تعمل الآن بكفاءة عالية في السوق.',
    visitLiveProject: 'زيارة الموقع الحي',

    // Services
    servicesBadge: 'حلول برمجة النظم والمنصات',
    servicesTitle: 'خدمات هندسة البرمجيات والأنظمة',
    servicesDesc: 'نقدم كافة الحلول البرمجية المتكاملة والمخصصة لاحتياجات عملك.',
    orderService: 'طلب هذه الخدمة',

    // Portfolio
    portfolioBadge: 'معرض النماذج البرمجية',
    portfolioTitle: 'سابقة أعمالنا ونماذج التميز البرمجي',
    portfolioDesc: 'استعرض نخبة من التطبيقات والمنصات التي قمنا ببرمجتها وفق أعلى المعايير.',

    // Why Us
    whyUsBadge: 'معايير السرعة والجودة',
    whyUsTitle: 'لماذا يختار العملاء حلولنا البرمجية؟',
    whyUsDesc: 'نعتمد أفضل المعماريات البرمجية لتسليم مشروعك بأعلى دقة وأمان.',

    // Process
    processBadge: 'مراحل التطوير الهندسي',
    processTitle: 'كيف نبني مشروعك البرمجي من الفكرة للتسليم؟',
    processDesc: 'منهجية عمل منظمة تضمن أعلى مستويات الشفافية وجودة التنفيذ.',

    // Articles
    articlesBadge: 'رؤى تقنية وهندسية',
    articlesTitle: 'مقالاتنا وأدلتنا التقنية',
    articlesDesc: 'أدلة معمارية وبرمجية شاملة لهندسة النظم والأمان.',
    readMore: 'قراءة المقال بالكامل',

    // Payment Methods
    paymentBadge: 'وسائل التحويل المعتمدة',
    paymentTitle: 'طرق الدفع والتحويلات المعتمدة',
    paymentDesc: 'وسائل دفع محلية ودولية آمنة ومريحة لجميع العملاء.',

    // Join Us
    joinBadge: 'فرص العمل والشراكة',
    joinTitle: 'انضم كـ مطور أو ممثل خدمة عملاء',
    joinDesc: 'نرحب بالكفاءات والخبرات البرمجية للعمل ضمن فريقنا المتميز.',

    // FAQ
    faqBadge: 'الأسئلة الشائعة',
    faqTitle: 'إجابات على أهم الاستفسارات التقنية',
    faqDesc: 'كل ما تحتاج معرفته عن خدماتنا، مدة التسليم، والضمان البرمجي.',

    // Order
    orderFormTitle: 'طلب مشروع برمجي مخصص',
    orderFormDesc: 'قم بملء تفاصيل مشروعك وسيقوم مهندس متصل بالتواصل معك في أقرب وقت.',
    yourName: 'اسمك الكريم',
    whatsappPhone: 'رقم الواتساب / الجوال',
    projectDetails: 'تفاصيل ومتطلبات المشروع',
    submitOrder: 'إرسال طلب المشروع الآن',

    // Footer & Chat
    footerRights: 'جميع الحقوق محفوظة © M Web Solutions.',
    chatSupportTitle: 'خدمة العملاء والدعم المباشر',
    chatSupportSubtitle: 'تواصل حي ومباشر مع الدعم الفني والإدارة',
    typeMessage: 'اكتب استفسارك هنا...',
    send: 'إرسال',
    freeConsultation: 'استشارة تقنية مجانية',

    // Additional UI strings
    clientLiveStatus: 'منشور ويعمل حياً',
    clientResultsTitle: 'النتائج والإنجازات التشغيلية للمشروع:',
    clientLabel: 'العميل:',
    browseOnline: 'تصفح المنصة على الإنترنت',
    orderSimilar: 'اطلب مشروعاً مماثلاً',
    projectVideo: 'فيديو المشروع',
    visitSite: 'زيارة الموقع',
    expandFullscreen: 'توسيع (Fullscreen)',
    rewind10s: 'ترجيع 10 ثواني',
    forward10s: 'تقديم 10 ثواني',
    desktop: 'كمبيوتر',
    tablet: 'تابلت',
    mobile: 'موبايل',
    livePreviewBadge: 'معاينة حية 100%',
    instantPreview: 'تجربة فورية',
    suitableFor: 'مناسبة لـ:',
    softwareFeaturesAndSpecs: 'المميزات البرمجية والمواصفات:',
    pricingPlans: 'الخطط والأسعار:',
    choosePlanType: 'اختر نظام الشراء أو الاشتراك:',
    monthlySystem: 'نظام شهري',
    annualSystem: 'نظام سنوي',
    permanentOwnership: 'تمليك دائم',
    save20Percent: 'توفير 20%',
    orderThisPlatformNow: 'اطلب هذه المنصة الآن',
    activeResponsiveServer: 'خادم نشط وسريع الاستجابة',
    instantBookingRequest: 'طلب حجز فوري',
    viewPricingPackages: 'عرض طرق الباقات',
    interactiveSimulatorReady: 'نظام سحابي مرخص جاهز للتشغيل الفوري',
    navHome: 'الرئيسية',
    navDemoPlatforms: 'منصات المعاينة',
    navClientProjects: 'أعمال العملاء',
    navArticles: 'مقالاتنا',
    navPaymentMethods: 'طرق الدفع',
    navServices: 'خدماتنا',
    navPortfolio: 'نماذج البرمجة',
    navWhyUs: 'لماذا نحن',
    navJoinUs: 'انضم إلينا',
    navOrderNow: 'اطلب مشروعك',
    quickLinks: 'روابط سريعة',
    contactUs: 'تواصل معنا'
  },
  en: {
    // Common & Nav
    home: 'Home',
    demoPlatforms: 'Demo Platforms',
    clientProjects: 'Client Works',
    articles: 'Articles',
    paymentMethods: 'Payments',
    services: 'Services',
    portfolio: 'Portfolio',
    about: 'Methodology',
    joinUs: 'Join Us',
    orderProject: 'Order Project',
    adminTerminal: 'Admin Panel',
    softwareAgency: 'Digital Solutions & Software Engineering Agency',

    // Hero
    heroBadge: 'Your Certified Tech Partner for Modern Web Platforms',
    heroHeadlineMain: 'Transforming Your Vision into',
    heroHeadlineGradient: 'High-Performance Software',
    heroCTAPrimary: 'Order Your Project Now',
    heroCTASecondary: 'Explore Portfolio',
    guaranteeCode: '100% Custom Code',
    guaranteeSecurity: 'ABAC Hardened Security',
    guaranteeFirestore: 'Cloud Firestore DB',
    guaranteeFast: 'Ultra Fast Delivery',
    projectsDone: 'Completed Projects',
    securityStandards: 'Security Standard',
    supportHours: '24/7 Live Support',

    // Demo Platforms & Pricing
    demoSectionBadge: 'Live & Interactive Previews for Ready Solutions',
    demoSectionTitle: 'Interactive Demo Platforms & 3-Tier Pricing',
    demoSectionDesc: 'Test live interactive previews inside the app with flexible subscription & permanent ownership plans.',
    livePreview: 'Live Preview',
    monthlySub: 'Monthly Plan',
    annualSub: 'Annual Plan',
    lifetimeBuy: 'Permanent Ownership',
    orderThisPlatform: 'Order This Platform',
    selectPlan: 'Select Plan',
    allCategories: 'All Categories',

    // Client Projects
    clientBadge: 'Successfully Delivered & Operating Projects',
    clientProjectsTitle: 'Published Client Works & Success Stories',
    clientProjectsDesc: 'Live production web apps operating at high speed and scale.',
    visitLiveProject: 'Visit Live Site',

    // Services
    servicesBadge: 'Software Engineering & Platform Solutions',
    servicesTitle: 'Software Engineering & System Solutions',
    servicesDesc: 'Tailored web platforms, ERPs, LMS, and custom APIs built to scale.',
    orderService: 'Order This Service',

    // Portfolio
    portfolioBadge: 'Software Architecture Showcase',
    portfolioTitle: 'Engineering Portfolio & Excellence Showcase',
    portfolioDesc: 'Explore our top web applications and platforms built with cutting-edge standards.',

    // Why Us
    whyUsBadge: 'Speed & Quality Standards',
    whyUsTitle: 'Why Clients Choose Our Software Solutions?',
    whyUsDesc: 'We adopt modern architectures to deliver your project with maximum precision & security.',

    // Process
    processBadge: 'Engineering Workflow Stages',
    processTitle: 'How We Build Your Software Project from Concept to Delivery?',
    processDesc: 'Structured methodology ensuring high transparency and flawless execution.',

    // Articles
    articlesBadge: 'Technical & Engineering Insights',
    articlesTitle: 'Technical Articles & Architecture Guides',
    articlesDesc: 'In-depth engineering insights, clean code, and cloud security.',
    readMore: 'Read Full Article',

    // Payment Methods
    paymentBadge: 'Verified Transfer Channels',
    paymentTitle: 'Supported Payment & Transfer Methods',
    paymentDesc: 'Secure local & international payment options for seamless operations.',

    // Join Us
    joinBadge: 'Careers & Partnerships',
    joinTitle: 'Join as a Developer or Support Representative',
    joinDesc: 'We welcome engineering talents to join our elite software team.',

    // FAQ
    faqBadge: 'Frequently Asked Questions',
    faqTitle: 'Answers to Essential Technical Queries',
    faqDesc: 'Everything you need to know about our services, timelines, and warranty.',

    // Order
    orderFormTitle: 'Request a Custom Software Project',
    orderFormDesc: 'Fill in your project details and a lead engineer will reach out promptly.',
    yourName: 'Your Full Name',
    whatsappPhone: 'WhatsApp / Phone Number',
    projectDetails: 'Project Requirements & Features',
    submitOrder: 'Submit Order Now',

    // Footer & Chat
    footerRights: 'All Rights Reserved © M Web Solutions.',
    chatSupportTitle: 'Live Customer Support',
    chatSupportSubtitle: 'Direct real-time chat with technical support & team',
    typeMessage: 'Type your message...',
    send: 'Send',
    freeConsultation: 'Free Tech Consultation',

    // Additional UI strings
    clientLiveStatus: 'Live & Operating',
    clientResultsTitle: 'Project Results & Operational Achievements:',
    clientLabel: 'Client:',
    browseOnline: 'Browse Platform Online',
    orderSimilar: 'Order Similar Project',
    projectVideo: 'Project Video',
    visitSite: 'Visit Site',
    expandFullscreen: 'Expand Fullscreen',
    rewind10s: 'Rewind 10s',
    forward10s: 'Forward 10s',
    desktop: 'Desktop',
    tablet: 'Tablet',
    mobile: 'Mobile',
    livePreviewBadge: '100% Live Preview',
    instantPreview: 'Instant Preview',
    suitableFor: 'Suitable For:',
    softwareFeaturesAndSpecs: 'Software Features & Specs:',
    pricingPlans: 'Pricing Plans:',
    choosePlanType: 'Select Plan or Purchase Type:',
    monthlySystem: 'Monthly Plan',
    annualSystem: 'Annual Plan',
    permanentOwnership: 'Permanent Ownership',
    save20Percent: 'Save 20%',
    orderThisPlatformNow: 'Order This Platform Now',
    activeResponsiveServer: 'Active & Responsive Server',
    instantBookingRequest: 'Instant Booking Request',
    viewPricingPackages: 'View Pricing Packages',
    interactiveSimulatorReady: 'Licensed Cloud System Ready for Instant Deployment',
    navHome: 'Home',
    navDemoPlatforms: 'Demo Platforms',
    navClientProjects: 'Client Works',
    navArticles: 'Articles',
    navPaymentMethods: 'Payments',
    navServices: 'Services',
    navPortfolio: 'Portfolio',
    navWhyUs: 'Why Us',
    navJoinUs: 'Join Us',
    navOrderNow: 'Order Now',
    quickLinks: 'Quick Links',
    contactUs: 'Contact Us'
  }
};
