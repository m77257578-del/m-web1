import { Language, translations, Translations } from './services/translations';
import { DemoPlatform } from './services/demoPlatforms';
import { ClientProject } from './services/clientProjects';
import { Article } from './services/articles';
import { Project } from './types';

export type { Language, Translations };
export { translations };

/**
 * Comprehensive dictionary mapping Arabic strings to English equivalents
 * across all dynamic data (Demo Platforms, Client Projects, Articles, Portfolio, Categories, etc.)
 * Ensures 100% instant translation even when items are loaded from localStorage.
 */
export const AR_TO_EN_DICTIONARY: Record<string, string> = {
  // Categories & Tags
  'الكل': 'All',
  'منصات تعليمية وإدارية': 'EdTech & LMS Platforms',
  'متاجر إلكترونية وحلول تجزئة': 'E-Commerce & Retail Solutions',
  'أنظمة إدارة المؤسسات والشركات': 'Enterprise Cloud ERP Systems',
  'منصات طبية وصحية': 'Healthcare & Clinic Systems',
  'التعليم الإلكتروني والتدريب الرقمي': 'E-Learning & Digital Training',
  'التعليم الإلكتروني والتدريب': 'E-Learning & Digital Training',
  'التجارة الإلكترونية والتجزئة الغذائية': 'E-Commerce & Grocery Retail',
  'اللوجستيات والشحن وتتبع الحاويات': 'Logistics & Container Tracking',
  'الرعاية الصحية والمستشفيات': 'Healthcare & Hospitals',
  'معمارية وهندسة البرمجيات': 'Software Architecture & Engineering',
  'أمان الويب وحماية المحتوى': 'Web Security & DRM Protection',
  'استراتيجيات التحول الرقمي': 'Digital Transformation Strategies',
  'منصات تعليمية': 'EdTech Platforms',
  'متاجر إلكترونية': 'E-Commerce Stores',
  'أنظمة إدارية': 'ERP & Admin Systems',
  'منصات متقدمة': 'Advanced Platforms',
  'مواقع مخصصة': 'Custom Websites',

  // Demo Platform 1: Academix Pro
  'منصة "أكاديميكس برو" للتعليم والتدريب الذكي': '"Academix Pro" Smart E-Learning & Training Platform',
  'حل برمجي سحابي شامل للمدرسين، الأكاديميات ومراكز التدريب مع حماية المحتوى': 'Comprehensive Cloud LMS for Instructors, Academies & Training Centers with DRM Content Protection',
  'الأكثر طلباً للأكاديميات': 'Most Popular for Academies',
  'نظام إدارة تعلم (LMS) متكامل ومصمم بتقنيات حديثة لحماية الفيديوهات من التسجيل، يشمل بنك أسئلة ذكي، امتحانات بتصحيح آلي، شهادات رقمية مشفرة، وبوابات دفع إلكترونية متعددة مع اشتراكات شهرية وسنوية للطلاب.': 'An integrated Learning Management System (LMS) engineered with anti-screen-recording DRM video protection, smart question banks, automated exam grading, encrypted digital certificates, and multi-gateway student subscriptions.',
  'يشمل الاستضافة السحابية والصيانة الشهرية والتحديثات المستمرة': 'Includes cloud hosting, monthly maintenance, and continuous updates',
  'توفير شهرين مجاناً + نطاق مجاني + نسخ احتياطي يومي': 'Save 2 months free + complimentary domain + daily encrypted backups',
  'تمليك دائم، نقل كامل للسورس كود وقواعد البيانات، ترخيص تجاري غير مقيد': 'Permanent ownership, 100% source code & database transfer, unrestricted commercial license',
  'مشغل فيديو مشفر ضد برامج تصوير الشاشة مع علامات مائية ديناميكية': 'Encrypted DRM video player against screen recorders with dynamic watermarks',
  'بنك أسئلة تفاعلي يولد نماذج اختبارات متغيرة لكل طالب تلقائياً': 'Interactive question bank auto-generating randomized exams per student',
  'بوابات دفع إلكترونية مدمجة (فيزا، ماستركارد، مدى، محافظ رقمية)': 'Integrated payment gateways (Visa, MasterCard, Mada, E-Wallets)',
  'لوحة تحكم إدارية منفصلة للمدرس، المساعدين، والطلاب وأولياء الأمور': 'Dedicated portals for instructors, assistants, students, and parents',
  'نظام إصدار شهادات إتمام رقمية مع كود QR للتحقق السريع': 'Automated digital completion certificates with QR verification code',
  'تطبيق ويب تقدمي (PWA) يعمل كالموبايل وسريع التحميل': 'Progressive Web App (PWA) with mobile-native experience & instant loading',
  'المدرسون الخصوصيون، المعاهد والمدارس، صناع المحتوى التعليمي': 'Tutors, Educational Institutes, Schools & Course Creators',
  'واجهة المنصة الرئيسية واللوحة التفاعلية': 'Main Platform Interface & Interactive Dashboard',
  'شاشة الدروس التفاعلية ومشغل الفيديو المشفر': 'Interactive Lesson Player & DRM Encrypted Video',
  'جولة تفصيلية داخل لوحة التحكم والامتحانات الذكية': 'Full Walkthrough of Admin Dashboard & Smart Exams',

  // Demo Platform 2: Rex Cart Extreme
  'منصة "ريكس كارت إكستريم" للتجارة الإلكترونية المتعددة': '"Rex Cart Extreme" Multi-Vendor E-Commerce Platform',
  'متجر سحابي فائق السرعة يدعم البيع المباشر والمتاجر المتعددة وتتبع الشحنات': 'Ultra-fast cloud store supporting direct retail, multi-vendor marketplaces, and live shipment tracking',
  'سرعة استجابة 99/100': '99/100 Speed Score',
  'منصة بيع وتجارة إلكترونية برمجية حديثة تمنحك استقلالية تامة عن منصات الاشتراكات المغلقة. إدارة متقدمة للمخزون والفروع، فواتير ضريبية، ربط مع شركات الشحن، وسلة شراء بنقرة واحدة.': 'A modern e-commerce platform giving you total independence from closed subscription platforms. Includes multi-branch inventory management, tax invoicing, shipping carrier APIs, and one-step checkout.',
  'دعم فني واستضافة سريعة على سيرفرات سحابية مخصصة': 'Technical support & high-speed hosting on dedicated cloud servers',
  'خصم 20% + دومين احترافي + تهيئة SEO كاملة مجاناً': '20% discount + pro domain + full SEO optimization included free',
  'كود سورس كامل بدون أي عمولة على المبيعات مدى الحياة': 'Full source code ownership with 0% sales commission for life',
  'سلة تسوق وشراء بنقرة واحدة (One-Step Checkout) لرفع التحويلات': 'One-Step Checkout engineered to maximize conversion rates',
  'ربط تلقائي مع بوابات الدفع (Tabby, Tamara, Moyasar, PayTabs, Visa)': 'Seamless integration with Tabby, Tamara, Stripe, PayTabs, and Visa',
  'نظام إدارة مخزون دقيق يدعم تعدد الفروع والمستودعات والباركود': 'Precision inventory system supporting multi-branch warehouses & barcodes',
  'فواتير إلكترونية متوافقة مع متطلبات هيئة الزكاة والضريبة (ZATCA)': 'Electronic tax invoices compliant with ZATCA & global tax authorities',
  'محرك كوبونات وتخفيضات ذكي وإشعارات العروض التلقائية': 'Smart coupon engine, flash sales, and automated promotional notifications',
  'تطبيق ويب خفيف جداً يفتح في أقل من ثانية واحدة': 'Ultra-lightweight web app loading in under 1 second',
  'العلامات التجارية، تجار التجزئة، الموزعون وأصحاب المتاجر': 'Retail Brands, Wholesalers, Distributors & Store Owners',
  'واجهة المتجر العصرية المتوافقة مع كافة الشاشات': 'Modern Responsive Storefront Across All Devices',
  'لوحة إدارة المنتجات والمخزون والطلبات الواردة': 'Product, Inventory & Incoming Order Management Dashboard',

  // Demo Platform 3: Rex Flow ERP
  'نظام "ريكس فلو ERP" السحابي لإدارة الشركات والمالية': '"Rex Flow ERP" Cloud Enterprise & Financial System',
  'نظام مؤسسي متكامل لإدارة الحسابات، الموارد البشرية، الفواتير والمخازن': 'Integrated enterprise system for Accounting, HR, Payroll, Invoicing & Warehouses',
  'نظام معتمد ومطابق للمعايير': 'Certified Enterprise Standard',
  'نظام ERP سحابي مبني لربط كافة أقسام شركتك في واجهة موحدة. يشمل الحسابات العامة، الأصول، فواتير المبيعات والمشتريات، كشوف الرواتب، وتقارير أرباح وخسائر لحظية بالذكاء التحليلي.': 'A cloud ERP designed to unify all company departments in one dashboard. Covers general ledger, assets, sales/purchase invoicing, HR payroll, and real-time P&L analytical reports.',
  'تحديثات دورية، دعم 24/7، نسخ احتياطي يومي مشفر': 'Regular updates, 24/7 live support, and daily encrypted backups',
  'تخصيص مجاني لشعار وهوية الشركة + تدريب لفريق العمل': 'Free custom corporate branding + staff onboarding & training',
  'ترخيص كامل غير محدود للمستخدمين، وتثبيت على سيرفر العميل الخاص': 'Unlimited users license + on-premise or private cloud server deployment',
  'دليل حسابات شجري مرن، قيود يومية آلية، وتقارير ميزانية عمومية لحظية': 'Flexible chart of accounts, automated journal entries & real-time balance sheets',
  'إدارة متقدمة للموظفين والحضور والإجازات ومسيرات الرواتب': 'Advanced HR management for attendance, leaves, and automated payroll',
  'ربط كامل بين المبيعات، المشتريات، وحركة المستودعات تلقائياً': 'Automatic real-time sync between sales, purchasing, and warehouse stock',
  'صلاحيات وصول دقيقة حسب الرتب والمسؤوليات (RBAC)': 'Granular Role-Based Access Control (RBAC) across all departments',
  'لوحات بيانات ورسوم بيانية تفاعلية تساعد الإدارة على اتخاذ القرار': 'Interactive executive BI dashboards and visual financial charts',
  'تصدير فوري للتقارير بصيغ PDF, Excel مع ختم رقمي': 'Instant report export to PDF & Excel with digital verification stamp',
  'الشركات المتوسطة والصغيرة، المكاتب المهنية، المصانع والمؤسسات': 'SMEs, Enterprises, Factories & Professional Agencies',
  'اللوحة المالية الشاملة والمؤشرات التنفيذية': 'Comprehensive Financial Dashboard & Executive KPIs',
  'إدارة دورة المبيعات والمشتريات والفواتير': 'Sales, Procurement & Tax Invoicing Lifecycle',

  // Demo Platform 4: Rex Clinic Pro
  'منصة "ريكس كلينك برو" لحجز العيادات والمراكز الطبية': '"Rex Clinic Pro" Medical Center & Clinic Management Platform',
  'إدارة مواعيد المرضى، الملفات الطبية، الفحوصات والوصفات الإلكترونية': 'Patient appointments, Electronic Medical Records (EMR), lab results & e-prescriptions',
  'حماية وتشفير بيانات المرضى': 'HIPAA-Grade Patient Data Encryption',
  'نظام طبي رقمي شامل يسهل على المرضى حجز المواعيد واختيار الأطباء والاطلاع على نتائج التحاليل، ويوفر للأطباء ملفات طبية إلكترونية متكاملة مع إمكانية طباعة الروشتات وكتابة التقارير.': 'A complete digital healthcare system enabling patients to book appointments, choose doctors, and view lab results online, while providing doctors with full EMR and e-prescription printing.',
  'رسائل واتساب تلقائية لتذكير المرضى بمواعيدهم': 'Automated WhatsApp appointment reminders for patients',
  'توفير شهرين مجاناً + دعم فني مباشر واستضافة سريعة': 'Save 2 months free + direct technical support & fast cloud hosting',
  'سورس كود كامل، ملكية حرة بدون قيود وتركيب على سيرفرك': 'Full source code, unrestricted ownership & deployment on your server',
  'حجز مواعيد أونلاين وتأكيد فوري مع إرسال تذكير عبر واتساب': 'Online appointment booking with instant confirmation & WhatsApp reminders',
  'سجل طبي إلكتروني موحد لكل مريض يشمل التاريخ المرضي والأشعات': 'Unified Electronic Medical Record (EMR) including history, labs & imaging',
  'وصفات طبية إلكترونية قابلة للطباعة وتتبع صرف الأدوية': 'Printable e-prescriptions and pharmacy medication dispensing tracker',
  'إدارة أطباء متعددين، غرف الكشف، والورديات وجداول العمل': 'Multi-doctor scheduling, examination rooms, and shift management',
  'إدارة الفواتير والتحصيل ونسب الأطباء وشركات التأمين الصحي': 'Billing, doctor commission calculation, and insurance company claims',
  'واجهة سهلة الاستخدام تناسب موظفي الاستقبال والمرضى من الموبايل': 'Intuitive mobile-friendly interface for receptionists and patients',
  'العيادات والمجمعات الطبية، المعامل، المراكز العلاجية المتخصصة': 'Clinics, Medical Complexes, Diagnostic Labs & Specialized Centers',
  'واجهة حجز المواعيد وجدول الأطباء': 'Appointment Booking Interface & Doctor Schedules',

  // Client Projects
  'منصة "أكاديمية النجاح التعليمية" للثانوية والجامعات': '"Al-Najah Educational Academy" Platform for High School & Universities',
  'مؤسسة النجاح للتعليم المتميز': 'Al-Najah Foundation for Excellence in Education',
  'الرياض، المملكة العربية السعودية': 'Riyadh, Saudi Arabia',
  'الرياض، السعودية': 'Riyadh, Saudi Arabia',
  'سبتمبر 2024': 'September 2024',
  'تم تصميم وتطوير منصة تعليمية سحابية خاصة تستوعب أكثر من 40,000 طالب في آن واحد، مع نظام بث محمي بحقوق النشر، وبنك أسئلة يولد اختبارات فريدة، وربط متكامل مع شبكة سداد ومدى.': 'Engineered a private cloud educational platform supporting 40,000+ concurrent students, featuring DRM-protected streaming, dynamic exam generation, and full Sadad & Mada payment integration.',
  'استيعاب أكثر من 45,000 طالب متزامن دون أي توقف': 'Supports 45,000+ concurrent students with zero downtime',
  'حماية 100% من تسريب الفيديوهات عبر العلامات المائية الديناميكية': '100% video leak prevention via dynamic forensic watermarking',
  'زيادة معدل إتمام الدروس بنسبة 65%': '65% increase in course completion rates',
  'د. فيصل السبيعي': 'Dr. Faisal Al-Subaie',
  'المدير التنفيذي للأكاديمية': 'Academy Chief Executive Officer',
  'فريق ويب ريكس نقل الأكاديمية إلى مستوى عالمي. الحماية الفائقة لمقاطع الفيديو وسلاسة الاختبارات وتوفير مئات الآلاف من تكاليف المنصات المغلقة جعلتنا في الصدارة.': 'The M Web engineering team took our academy to a world-class level. Superior video protection, seamless testing, and saving hundreds of thousands in SaaS fees put us ahead.',

  'متجر وتطبيق "روابي هايبر ماركت" للتوصيل السريع وتعدد الفروع': '"Rawabi Hypermarket" Multi-Branch Instant Delivery Store & App',
  'شركة روابي الشرق للتجارة والتوزيع': 'Rawabi Al-Sharq Trading & Distribution Co.',
  'جدة، المملكة العربية السعودية': 'Jeddah, Saudi Arabia',
  'أغسطس 2024': 'August 2024',
  'نظام تجارة إلكترونية متصل بـ 8 فروع ومستودعات مركزية. تتبع حي لمركبات التوصيل، إدارة تسعير فورية حسب الفرع الأقرب للعميل، وفواتير إلكترونية معتمدة من هيئة الزكاة.': 'E-commerce ecosystem connected to 8 branches and central warehouses. Features live delivery fleet tracking, nearest-branch dynamic pricing, and ZATCA-approved e-invoicing.',
  'تجهيز وتوصيل أكثر من 3,500 طلب يومياً': 'Processing & delivering 3,500+ orders daily',
  'زمن تحميل تطبيق الويب 0.6 ثانية فقط': 'Ultra-fast 0.6s web app load time',
  'تخفيض تكلفة التشغيل بنسبة 35% عبر الأتمتة': '35% reduction in operational costs through automation',
  'أ. حسام الغامدي': 'Mr. Hossam Al-Ghamdi',
  'رئيس العمليات الرقمية': 'Head of Digital Operations',
  'النظام فائق السرعة، وميزة تعدد الفروع وإدارة المخزون التلقائية حلت لنا أكبر أزمة لوجستية كنا نعاني منها.': 'The system is blazingly fast, and the multi-branch automated inventory synchronization solved our biggest logistical bottleneck.',

  'نظام "دلتا كارجو" لإدارة سلاسل الإمداد والشحن الدولي': '"Delta Cargo" Global Supply Chain & Freight Management System',
  'مجموعة دلتا للشحن واللوجستيات': 'Delta Global Freight & Logistics Group',
  'دبي، الإمارات العربية المتحدة': 'Dubai, United Arab Emirates',
  'يوليو 2024': 'July 2024',
  'بوابة برمجية متطورة لإدارة بوالص الشحن الجوي والبحري، حساب الرسوم الجمركية التلقائي، وتتبع الحاويات عبر الأقمار الصناعية بنظام الخرائط الحية وإشعارات الواتساب.': 'Advanced logistics portal managing air & sea waybills, automated customs duty calculation, live satellite container map tracking, and automated WhatsApp alerts.',
  'تتبع أكثر من 12,000 حاوية وشحنة شهرياً': 'Tracking 12,000+ containers and shipments monthly',
  'تقليل الأخطاء البشرية في بوالص الشحن إلى الصفر': 'Reduced human error in waybill processing to zero',
  'ربط API فوري مع خطوط الملاحة والموانئ': 'Real-time API integration with global shipping lines & ports',
  'ك. ماجد المهيري': 'Capt. Majed Al-Muhairi',
  'نائب رئيس مجلس الإدارة': 'Vice Chairman of the Board',
  'التزام ويب ريكس بالجودة والكود النظيف مكننا من منافسة كبرى شركات الشحن العالمية بأنظمة برمجية نملكها بالكامل.': 'Their commitment to clean architecture enabled us to compete with global freight giants using proprietary software we 100% own.',

  'منظومة "مجمع الحياة الطبي" للملفات وحجز العيادات': '"Al-Hayat Medical Complex" EMR & Clinic Booking Ecosystem',
  'شركة الحياة للخدمات الطبية المتقدمة': 'Al-Hayat Advanced Medical Services Co.',
  'القاهرة، مصر': 'Cairo, Egypt',
  'يونيو 2024': 'June 2024',
  'ربط 24 عيادة تخصصية ومختبر تحاليل في نظام إلكتروني واحد، يتيح للمريض حجز الدور ومتابعة الانتظار من البيت واستلام نتائج التحاليل والروشتات أونلاين.': 'Connected 24 specialized clinics and diagnostic labs in one unified platform, allowing patients to book queues remotely and receive lab results & prescriptions online.',
  'خدمة أكثر من 180,000 مريض مسجل': 'Serving over 180,000 registered patients',
  'القضاء التام على طوابير الانتظار الورقية': 'Complete elimination of paper waiting queues',
  'أمان بيانات طبي وتشفير كامل وفق معايير HIPAA': 'Full medical data encryption compliant with HIPAA standards',
  'د. سامح عبد الرازق': 'Dr. Sameh Abdel-Razek',
  'المدير الطبي العام': 'Chief Medical Director',
  'التطبيق سهل جداً للأطباء وموظفي الاستقبال، وأشاد به جميع المرضى لسرعته وتوفيره للوقت.': 'The platform is remarkably intuitive for doctors and receptionists, and praised by patients for saving hours of waiting time.',

  // Articles
  'كيف تبني منصة برمجية تتحمل ملايين الزيارات: أسرار المعمارية النظيفة (Clean Architecture)': 'How to Architect a Web Platform for Millions of Visits: Clean Architecture Secrets',
  'دليل عملي للمؤسسين والمهندسين حول كيفية فصل منطق الأعمال عن أطر العمل، وضمان استقرار الخوادم أثناء الضغط العالي مع تقليل التكلفة بنسبة 40%.': 'A practical engineering guide for founders and CTOs on decoupling business logic, ensuring high-concurrency server stability, and cutting cloud costs by 40%.',
  'م. أحمد خالد': 'Eng. Ahmed Khaled',
  'كبير مهندسي النظم السحابية في ويب ريكس': 'Lead Cloud Systems Architect at M Web',
  '6 دقائق قراءة': '6 min read',
  '5 دقائق قراءة': '5 min read',
  '4 دقائق قراءة': '4 min read',

  'أهم 7 معايير أمنية لحماية المتاجر والمنصات التعليمية من الاختراق وسرقة المحتوى': 'Top 7 Security Standards to Protect E-Commerce & LMS Platforms from Breaches & Piracy',
  'كيف نحمي الفيديوهات التعليمية الحصرية من التسجيل والشاشات المزدوجة، ونضمن تشفير بوابات الدفع الإلكترونية وفق أعلى المواصفات الدولية.': 'How we protect exclusive educational videos from screen capture and secure electronic payment gateways to global PCI-DSS standards.',
  'م. ياسين المنصوري': 'Eng. Yassin Al-Mansouri',
  'مستشار الأمن السيبراني واختبار الاختراق': 'Cybersecurity & Penetration Testing Consultant',

  'البرمجة الخاصة المخصصة أم القوالب الجاهزة؟ متى تختار التمليك الكامل لبرمجياتك؟': 'Custom Software Engineering vs. Ready Templates: When to Choose Full Source Code Ownership?',
  'مقارنة شاملة بين بناء منصتك من الصفر بكود ملكية خاصة وتمليك دائم، وبين الاعتماد على اشتراكات شهرية في منصات المنشئ الجاهز.': 'A comprehensive ROI comparison between building your platform from scratch with permanent ownership versus paying recurring commissions on closed SaaS builders.',
  'م. عمر رضوان': 'Eng. Omar Radwan',
  'مدير تطوير الحلول البرمجية في ويب ريكس': 'Software Solutions Director at M Web',

  // Sample Portfolio Projects
  'منصة "الماسة أكاديمي" للتعليم الإلكتروني وبنك الأسئلة': '"Al-Masa Academy" E-Learning & Smart Question Bank Platform',
  'منصة تعليمية متطورة للمعلمين تحمي مقاطع الفيديو من التسجيل والشاشات المزدوجة، مع نظام امتحانات ذكية وتصحيح تلقائي، واشتراكات الطلاب مع بوابات الدفع.': 'Advanced educational platform for instructors protecting videos from screen recording, featuring automated smart exams and integrated student payment gateways.',
  'متجر "ريكس كارت" للتجارة الإلكترونية وبوابات الدفع': '"Rex Cart" Cloud E-Commerce & Payment Gateways Store',
  'متجر سحابي متكامل فائق السرعة يدعم بوابات الدفع الإلكترونية (فيزا، ماستركارد، محافظ إلكترونية)، إدارة المخزون اللحظية، وتتبع الشحنات المباشر.': 'Ultra-fast cloud store supporting electronic payments (Visa, MasterCard, E-Wallets), real-time inventory management, and live shipment tracking.',
  'نظام "إي آر بي ريكس" السحابي لإدارة الشركات والفواتير': '"ERP Rex" Cloud Corporate & Tax Invoicing System',
  'لوحة تحكم إدارية مركزية للشركات تشمل الفوترة الإلكترونية المعتمدة، إدارة الموظفين، وتقارير أداء حية ومخططات تفاعلية لحظية.': 'Centralized corporate dashboard featuring certified e-invoicing, HR management, and real-time interactive performance analytics.',
  'منصة "ميديكال ريكس" لحجز العيادات والفحوصات الطبية': '"Medical Rex" Clinic Booking & Diagnostic Lab Portal',
  'نظام حجز إلكتروني للمراكز الطبية والمعامل يتيح للمرضى حجز المواعيد، استلام نتائج التحاليل إلكترونياً، والربط المباشر مع استشارات الأطباء.': 'Online booking portal for medical centers and labs enabling patients to schedule appointments, receive digital lab results, and consult doctors.',
  'تطبيق "لوجستك ريكس" لتتبع أساطيل النقل والتوصيل الفوري': '"Logistic Rex" Fleet Tracking & Instant Delivery Dispatch App',
  'نظام توزيع ذكي للطلبات اللوجستية مع خرائط تفاعلية حية، حساب المسارات الأمثل، وإشعارات فورية للعملاء والسائقين عبر الويب.': 'Smart logistics dispatch system with live interactive maps, route optimization, and real-time customer & driver notifications.',
  'بوابة "إيستايت برو" للتطوير العقاري والجولات الافتراضية 3D': '"Estate Pro" Real Estate Portal & 3D Virtual Tours',
  'موقع تعريفي وبوابة استثمار عقاري فخمة تدعم الجولات التفاعلية ثلاثية الأبعاد، محاكي الأقساط البنكية، والربط المباشر مع مستشاري المبيعات.': 'Luxury real estate investment portal supporting interactive 3D virtual tours, mortgage calculators, and direct sales advisor chat.',
};

const ARTICLE_CONTENT_EN: Record<string, string> = {
  'art-clean-architecture': `When launching your software platform, the biggest challenge isn't just writing code that works today—it's engineering an architecture that scales effortlessly without collapsing as your user base grows.

In this practical guide, we share the core principles we follow at M Web to build resilient, high-concurrency cloud web applications:

1. Decoupled Layered Architecture:
Databases and external UI libraries should never directly dictate core business domain logic. Decoupling allows you to upgrade databases or cloud providers without rewriting your system from scratch.

2. Intelligent Caching Strategies:
Leveraging Redis for frequently accessed queries reduces load on relational databases like PostgreSQL by over 75%, delivering sub-80ms response times under heavy traffic.

3. Asynchronous Background Jobs & Queues:
Heavy tasks such as video transcoding, tax invoice generation, and WhatsApp/email notifications are processed via dedicated message queues so the user interface remains instantaneously responsive.

4. Proactive Monitoring & Cloud Defense:
Real-time telemetry and edge DDoS/WAF protection safeguard all API endpoints against injection and brute-force attacks.`,

  'art-security-web-apps': `Digital content and customer financial records represent the most valuable assets of any online business. Here are the advanced defensive technologies we bake into every platform:

1. Dynamic Video DRM & Forensic Watermarking:
To protect educators' premium courses, we implement floating dynamic watermarks displaying the student's phone number and ID, alongside browser extension blocking and encrypted HLS streaming.

2. Strict PCI-DSS Payment Gateway Security:
Sensitive card data never touches application servers; we use encrypted tokenization via certified local and international payment processors.

3. CSRF, XSS & SQL Injection Prevention:
Strict parameterized queries, schema validation, and sanitized API payloads block malicious input before it reaches business logic.

4. Role-Based Access Control (RBAC) & Rate Limiting:
Granular permissions and IP rate-limiting prevent credential stuffing and unauthorized privilege escalation.`,

  'art-custom-vs-ready-scripts': `Entrepreneurs face a critical decision when launching: should you rent a closed SaaS template or own your custom-engineered platform with 100% source code?

1. Long-Term Investment & Zero Commission:
Rented platforms look cheap in month one, but as sales and users grow, monthly subscriptions, add-on fees, and transaction commissions cost thousands of dollars annually. With permanent ownership, you pay once and own your code and servers forever with 0% commission on your revenue.

2. Unlimited Customization Freedom:
With custom software, there are zero restrictions on your business logic—you can integrate any ERP, customize checkout flows, and tailor the UI 100% to your brand.

3. Superior Speed & Google SEO Rankings:
Clean custom code eliminates the bloated unused scripts found in generic templates, delivering sub-second load times that boost Google SEO rankings and conversion rates.`
};

/**
 * Translates any dynamic string using the dictionary if language is 'en'.
 */
export function translateDynamicText(text: string | undefined, language: Language): string {
  if (!text) return '';
  if (language === 'ar') return text;
  const trimmed = text.trim();
  return AR_TO_EN_DICTIONARY[trimmed] || text;
}

/**
 * Returns a localized copy of a DemoPlatform for the active language.
 */
export function localizeDemoPlatform(platform: DemoPlatform, language: Language): DemoPlatform {
  if (language === 'ar') return platform;
  return {
    ...platform,
    title: translateDynamicText(platform.title, 'en'),
    subtitle: translateDynamicText(platform.subtitle, 'en'),
    category: translateDynamicText(platform.category, 'en'),
    badge: platform.badge ? translateDynamicText(platform.badge, 'en') : undefined,
    description: translateDynamicText(platform.description, 'en'),
    clientTarget: platform.clientTarget ? translateDynamicText(platform.clientTarget, 'en') : undefined,
    pricing: {
      ...platform.pricing,
      monthlyNote: translateDynamicText(platform.pricing.monthlyNote, 'en'),
      annualNote: translateDynamicText(platform.pricing.annualNote, 'en'),
      lifetimeNote: translateDynamicText(platform.pricing.lifetimeNote, 'en'),
    },
    features: platform.features.map((f) => translateDynamicText(f, 'en')),
    media: platform.media.map((m) => ({
      ...m,
      title: m.title ? translateDynamicText(m.title, 'en') : undefined,
    })),
  };
}

/**
 * Returns a localized copy of a ClientProject for the active language.
 */
export function localizeClientProject(project: ClientProject, language: Language): ClientProject {
  if (language === 'ar') return project;
  return {
    ...project,
    title: translateDynamicText(project.title, 'en'),
    clientName: translateDynamicText(project.clientName, 'en'),
    industry: translateDynamicText(project.industry, 'en'),
    location: translateDynamicText(project.location, 'en'),
    completionDate: translateDynamicText(project.completionDate, 'en'),
    description: translateDynamicText(project.description, 'en'),
    results: project.results.map((r) => translateDynamicText(r, 'en')),
    testimonial: project.testimonial
      ? {
          ...project.testimonial,
          clientPerson: translateDynamicText(project.testimonial.clientPerson, 'en'),
          role: translateDynamicText(project.testimonial.role, 'en'),
          quote: translateDynamicText(project.testimonial.quote, 'en'),
        }
      : undefined,
  };
}

/**
 * Returns a localized copy of an Article for the active language.
 */
export function localizeArticle(article: Article, language: Language): Article {
  if (language === 'ar') return article;
  return {
    ...article,
    title: translateDynamicText(article.title, 'en'),
    excerpt: translateDynamicText(article.excerpt, 'en'),
    content: ARTICLE_CONTENT_EN[article.id] || translateDynamicText(article.content, 'en'),
    category: translateDynamicText(article.category, 'en'),
    readTime: translateDynamicText(article.readTime, 'en'),
    author: {
      ...article.author,
      name: translateDynamicText(article.author.name, 'en'),
      role: translateDynamicText(article.author.role, 'en'),
    },
  };
}

/**
 * Returns a localized copy of a Portfolio Project for the active language.
 */
export function localizePortfolioProject(project: Project, language: Language): Project {
  if (language === 'ar') return project;
  return {
    ...project,
    title: translateDynamicText(project.title, 'en'),
    description: translateDynamicText(project.description, 'en'),
    tag: translateDynamicText(project.tag, 'en'),
  };
}
