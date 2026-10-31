import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Unlock, 
  KeyRound, 
  ShieldCheck, 
  LogOut, 
  X, 
  Inbox, 
  FolderPlus, 
  Users, 
  Settings, 
  PhoneCall, 
  Trash2, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Plus, 
  Eye, 
  EyeOff,
  RefreshCw,
  MessageSquare,
  Save,
  Share2,
  RotateCcw,
  Globe,
  Link as LinkIcon,
  Laptop,
  BookOpen,
  Award,
  Video,
  Upload,
  Film,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  Star,
  FileText,
  Calendar,
  Building2,
  MapPin,
  CheckCircle2,
  Send,
  Paperclip,
  Download,
  CreditCard
} from 'lucide-react';
import { 
  getAdminPasscode, 
  setAdminPasscode, 
  adminLogin, 
  adminLogout, 
  isAdminAuthenticated 
} from '../services/adminAuth';
import { 
  getLocalOrders, 
  deleteLocalOrder, 
  deleteOrderFromCloudAndLocal,
  subscribeToOrdersFromFirestore,
  addProjectToFirestore, 
  getDeveloperApplicants, 
  deleteDeveloperApplicant,
  isFirebaseConnected,
  signInAdminWithGoogle,
  onAdminAuthStateChange
} from '../services/firebase';
import { 
  getSocialLinks, 
  saveSocialLinks, 
  addSocialLink, 
  updateSocialLink, 
  deleteSocialLink, 
  resetSocialLinks, 
  SocialLink 
} from '../services/socialLinks';
import { 
  getDemoPlatforms, 
  addDemoPlatform, 
  deleteDemoPlatform, 
  resetDemoPlatforms, 
  DemoPlatform 
} from '../services/demoPlatforms';
import { 
  getClientProjects, 
  addClientProject, 
  deleteClientProject, 
  resetClientProjects, 
  ClientProject 
} from '../services/clientProjects';
import { 
  getArticles, 
  addArticle, 
  deleteArticle, 
  resetArticles, 
  Article 
} from '../services/articles';
import { SocialIcons } from './SocialIcons';
import { Order, Project } from '../types';
import { SAMPLE_PROJECTS } from '../data/sampleProjects';
import { 
  getPlatformSettings, 
  savePlatformSettings, 
  resetPlatformSettings, 
  PlatformSettings 
} from '../services/platformSettings';
import { 
  getAllChatThreads, 
  sendAdminReply, 
  markThreadAsReadByAdmin, 
  deleteChatThread, 
  getUnreadAdminCount, 
  ChatThread,
  ChatAttachment 
} from '../services/liveChat';
import { 
  getPaymentMethods, 
  addPaymentMethod, 
  updatePaymentMethod, 
  deletePaymentMethod, 
  resetPaymentMethods, 
  PaymentMethodItem 
} from '../services/paymentMethods';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'brand-settings' | 'live-chat' | 'payment-methods' | 'orders' | 'demo-platforms' | 'client-projects' | 'articles' | 'projects' | 'applicants' | 'social' | 'security';

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cloudUserEmail, setCloudUserEmail] = useState<string | null>(null);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('brand-settings');

  // Platform Brand Settings state
  const [brandForm, setBrandForm] = useState<PlatformSettings>(getPlatformSettings);
  const [brandSavedMsg, setBrandSavedMsg] = useState<string | null>(null);

  // Live Chat state
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminAttachment, setAdminAttachment] = useState<ChatAttachment | null>(null);
  const adminFileInputRef = useRef<HTMLInputElement>(null);
  const [previewAdminMediaUrl, setPreviewAdminMediaUrl] = useState<string | null>(null);

  // Payment Methods state
  const [paymentMethodsList, setPaymentMethodsList] = useState<PaymentMethodItem[]>([]);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [pmCategory, setPmCategory] = useState<'instapay-wallets' | 'bank-transfers' | 'cards-global'>('instapay-wallets');
  const [pmNameAr, setPmNameAr] = useState('');
  const [pmNameEn, setPmNameEn] = useState('');
  const [pmDetailsAr, setPmDetailsAr] = useState('');
  const [pmDetailsEn, setPmDetailsEn] = useState('');
  const [pmCopyVal, setPmCopyVal] = useState('');
  const [pmNoteAr, setPmNoteAr] = useState('');
  const [pmNoteEn, setPmNoteEn] = useState('');
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  // Change Passcode state
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [passcodeSuccess, setPasscodeSuccess] = useState(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);

  // Demo Platforms state
  const [demoPlatforms, setDemoPlatforms] = useState<DemoPlatform[]>([]);
  const [showAddDemo, setShowAddDemo] = useState(false);
  const [demoTitle, setDemoTitle] = useState('');
  const [demoSubtitle, setDemoSubtitle] = useState('');
  const [demoCategory, setDemoCategory] = useState('منصات تعليمية وإدارية');
  const [demoDesc, setDemoDesc] = useState('');
  const [demoLiveUrl, setDemoLiveUrl] = useState('');
  const [demoBadge, setDemoBadge] = useState('جاهز للنشر الفوري');
  const [demoTarget, setDemoTarget] = useState('');
  const [demoMonthly, setDemoMonthly] = useState(49);
  const [demoAnnual, setDemoAnnual] = useState(450);
  const [demoLifetime, setDemoLifetime] = useState(1400);
  const [demoCurrency, setDemoCurrency] = useState('$');
  const [demoFeaturesText, setDemoFeaturesText] = useState('مشغل فيديو مشفر ضد برامج تسجيل الشاشة\nبوابات دفع إلكترونية متعددة مدمجة\nلوحة تحكم إدارية شاملة الصلاحيات\nتطبيق ويب تقدمي PWA سريع التحميل');
  const [demoTechText, setDemoTechText] = useState('React, Next.js, Node.js, PostgreSQL, TailwindCSS');
  const [demoImageInput, setDemoImageInput] = useState('');
  const [demoVideoType, setDemoVideoType] = useState<'none' | 'youtube' | 'upload'>('none');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');
  const [demoVideoTitle, setDemoVideoTitle] = useState('جولة فيديو تفصيلية لوظائف المنصة');
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  // Client Projects state
  const [clientProjects, setClientProjects] = useState<ClientProject[]>([]);
  const [showAddClientProj, setShowAddClientProj] = useState(false);
  const [cpTitle, setCpTitle] = useState('');
  const [cpClientName, setCpClientName] = useState('');
  const [cpIndustry, setCpIndustry] = useState('التعليم الإلكتروني والتدريب');
  const [cpLocation, setCpLocation] = useState('الرياض، السعودية');
  const [cpDate, setCpDate] = useState('أكتوبر 2024');
  const [cpLiveUrl, setCpLiveUrl] = useState('');
  const [cpImage, setCpImage] = useState('');
  const [cpDesc, setCpDesc] = useState('');
  const [cpResultsText, setCpResultsText] = useState('استيعاب أكثر من 30,000 مستخدم نشط\nسرعة تحميل أقل من 0.7 ثانية\nنسبة رضا عملاء 99.2%');
  const [cpTechText, setCpTechText] = useState('React, Node.js, PostgreSQL, Redis, Docker');
  const [cpPerson, setCpPerson] = useState('');
  const [cpRole, setCpRole] = useState('');
  const [cpQuote, setCpQuote] = useState('');
  const [cpNotice, setCpNotice] = useState<string | null>(null);

  // Articles state
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState('معمارية وهندسة البرمجيات');
  const [artExcerpt, setArtExcerpt] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artAuthorName, setArtAuthorName] = useState('م. أحمد خالد');
  const [artAuthorRole, setArtAuthorRole] = useState('كبير مهندسي البرمجيات في ويب ريكس');
  const [artCoverImage, setArtCoverImage] = useState('');
  const [artReadTime, setArtReadTime] = useState('5 دقائق قراءة');
  const [artTagsText, setArtTagsText] = useState('Architecture, Performance, CleanCode, WebSecurity');
  const [artNotice, setArtNotice] = useState<string | null>(null);

  // Projects state (general)
  const [projectsList, setProjectsList] = useState<Project[]>(SAMPLE_PROJECTS);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTag, setNewProjTag] = useState('منصات تعليمية');
  const [newProjImage, setNewProjImage] = useState('');
  const [newProjDemo, setNewProjDemo] = useState('');
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectSavedMsg, setProjectSavedMsg] = useState(false);

  // Applicants state
  const [applicants, setApplicants] = useState<any[]>([]);

  // Social Links state
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [showAddSocial, setShowAddSocial] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialLink['platform']>('instagram');
  const [newSocialName, setNewSocialName] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [socialSavedMessage, setSocialSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const auth = isAdminAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        refreshData();
      }
    }

    const handleChatUpdate = () => {
      const threads = getAllChatThreads();
      setChatThreads(threads);
    };

    window.addEventListener('live_chat_updated', handleChatUpdate);
    const unsubAuth = onAdminAuthStateChange((user) => {
      setCloudUserEmail(user?.email || null);
      if (user?.email === 'aljamd210@gmail.com') {
        setIsAuthenticated(true);
      }
    });
    const unsubOrders = subscribeToOrdersFromFirestore((updatedOrders) => {
      setOrders(updatedOrders);
    });
    return () => {
      window.removeEventListener('live_chat_updated', handleChatUpdate);
      unsubAuth();
      unsubOrders();
    };
  }, [isOpen]);

  const refreshData = () => {
    setBrandForm(getPlatformSettings());
    setPaymentMethodsList(getPaymentMethods());
    const threads = getAllChatThreads();
    setChatThreads(threads);
    if (threads.length > 0 && !selectedThreadId) {
      setSelectedThreadId(threads[0].id);
      markThreadAsReadByAdmin(threads[0].id);
    }
    setOrders(getLocalOrders());
    setApplicants(getDeveloperApplicants());
    setSocialLinks(getSocialLinks());
    setDemoPlatforms(getDemoPlatforms());
    setClientProjects(getClientProjects());
    setArticlesList(getArticles());
    try {
      const customStored = localStorage.getItem('webrex_custom_projects');
      if (customStored) {
        const custom = JSON.parse(customStored);
        setProjectsList([...custom, ...SAMPLE_PROJECTS]);
      } else {
        setProjectsList(SAMPLE_PROJECTS);
      }
    } catch {
      setProjectsList(SAMPLE_PROJECTS);
    }
  };

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(passcode)) {
      setIsAuthenticated(true);
      setLoginError(false);
      setPasscode('');
      refreshData();
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    adminLogout();
    setIsAuthenticated(false);
    setPasscode('');
  };

  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    if (!newPasscode || newPasscode.length < 4) {
      setPasscodeError('يجب أن يتكون الكود من 4 أرقام أو أحرف على الأقل.');
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setPasscodeError('الكود الجديد وتأكيده غير متطابقين.');
      return;
    }

    const res = setAdminPasscode(newPasscode);
    if (res.success) {
      setPasscodeSuccess(true);
      setNewPasscode('');
      setConfirmPasscode('');
      setTimeout(() => setPasscodeSuccess(false), 3000);
    } else {
      setPasscodeError(res.error || 'فشل تحديث كود الدخول.');
    }
  };

  // Local Device File Readers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Demo Platforms Handlers
  const handleAddDemoPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoTitle.trim() || !demoDesc.trim()) {
      alert('يرجى كتابة اسم ووصف المنصة.');
      return;
    }

    const features = demoFeaturesText.split('\n').map(f => f.trim()).filter(Boolean);
    const techStack = demoTechText.split(',').map(t => t.trim()).filter(Boolean);
    const mediaList: any[] = [];

    // Thumbnail / Image
    const finalImg = demoImageInput.trim() || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80';
    mediaList.push({
      id: `img-${Date.now()}`,
      type: 'image',
      url: finalImg,
      title: demoTitle
    });

    // Video if specified
    if (demoVideoType !== 'none' && demoVideoUrl.trim()) {
      mediaList.push({
        id: `vid-${Date.now()}`,
        type: demoVideoType === 'youtube' ? 'youtube' : 'video',
        url: demoVideoUrl.trim(),
        title: demoVideoTitle.trim() || 'فيديو معاينة وشرح المنصة'
      });
    }

    addDemoPlatform({
      title: demoTitle.trim(),
      subtitle: demoSubtitle.trim() || 'حل برمجي سحابي متكامل ومخصص',
      category: demoCategory.trim(),
      description: demoDesc.trim(),
      liveDemoUrl: demoLiveUrl.trim() || 'https://demo.webrex-tech.dev',
      badge: demoBadge.trim() || undefined,
      clientTarget: demoTarget.trim() || undefined,
      thumbnail: finalImg,
      pricing: {
        monthly: Number(demoMonthly) || 49,
        annual: Number(demoAnnual) || 450,
        lifetime: Number(demoLifetime) || 1400,
        currency: demoCurrency || '$',
        monthlyNote: 'استضافة سحابية شاملة وصيانة وتحديثات مستمرة',
        annualNote: 'توفير شهرين مجاناً + نطاق مجاني + نسخ احتياطي يومي',
        lifetimeNote: 'تمليك دائم، نقل كامل للسورس كود وقواعد البيانات وترخيص تجاري حر'
      },
      features: features.length > 0 ? features : ['لوحة تحكم إدارية متقدمة', 'بوابات دفع إلكترونية متعددة'],
      techStack: techStack.length > 0 ? techStack : ['React', 'Node.js', 'PostgreSQL'],
      media: mediaList
    });

    setDemoPlatforms(getDemoPlatforms());
    setShowAddDemo(false);
    setDemoTitle('');
    setDemoSubtitle('');
    setDemoDesc('');
    setDemoLiveUrl('');
    setDemoImageInput('');
    setDemoVideoUrl('');
    setDemoNotice('تمت إضافة منصة المعاينة والتسعير بنجاح!');
    setTimeout(() => setDemoNotice(null), 3000);
  };

  const handleDeleteDemo = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المنصة من العرض والمعاينة؟')) {
      deleteDemoPlatform(id);
      setDemoPlatforms(getDemoPlatforms());
      setDemoNotice('تم حذف المنصة');
      setTimeout(() => setDemoNotice(null), 2500);
    }
  };

  // Client Projects Handlers
  const handleAddClientProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpTitle.trim() || !cpClientName.trim()) {
      alert('يرجى ملء اسم المشروع واسم العميل.');
      return;
    }

    const results = cpResultsText.split('\n').map(r => r.trim()).filter(Boolean);
    const techStack = cpTechText.split(',').map(t => t.trim()).filter(Boolean);

    addClientProject({
      title: cpTitle.trim(),
      clientName: cpClientName.trim(),
      industry: cpIndustry.trim(),
      location: cpLocation.trim() || 'الرياض، السعودية',
      completionDate: cpDate.trim() || 'أكتوبر 2024',
      liveUrl: cpLiveUrl.trim() || 'https://example.com',
      thumbnail: cpImage.trim() || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      description: cpDesc.trim() || 'منصة برمجية عالية الأداء مبنية وفق أحدث معايير الأمان والسرعة.',
      results: results.length > 0 ? results : ['استيعاب آلاف المستخدمين', 'سرعة استجابة فائقة'],
      technologies: techStack.length > 0 ? techStack : ['React', 'Node.js', 'PostgreSQL'],
      testimonial: cpQuote.trim() ? {
        clientPerson: cpPerson.trim() || cpClientName.trim(),
        role: cpRole.trim() || 'المدير التنفيذي',
        quote: cpQuote.trim(),
        rating: 5
      } : undefined,
      isLive: true
    });

    setClientProjects(getClientProjects());
    setShowAddClientProj(false);
    setCpTitle('');
    setCpClientName('');
    setCpLiveUrl('');
    setCpImage('');
    setCpQuote('');
    setCpNotice('تمت إضافة مشروع العميل ونشره بنجاح!');
    setTimeout(() => setCpNotice(null), 3000);
  };

  const handleDeleteClientProj = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المشروع من أعمال العملاء؟')) {
      deleteClientProject(id);
      setClientProjects(getClientProjects());
      setCpNotice('تم حذف المشروع');
      setTimeout(() => setCpNotice(null), 2500);
    }
  };

  // Articles Handlers
  const handleAddArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim() || !artContent.trim()) {
      alert('يرجى كتابة عنوان المقال ومحتواه الكامل.');
      return;
    }

    const tags = artTagsText.split(',').map(t => t.trim()).filter(Boolean);

    addArticle({
      title: artTitle.trim(),
      category: artCategory.trim(),
      excerpt: artExcerpt.trim() || artContent.trim().substring(0, 150) + '...',
      content: artContent.trim(),
      author: {
        name: artAuthorName.trim() || 'فريق مهندسي ويب ريكس',
        role: artAuthorRole.trim() || 'هندسة النظم السحابية'
      },
      coverImage: artCoverImage.trim() || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      readTime: artReadTime.trim() || '5 دقائق قراءة',
      tags: tags.length > 0 ? tags : ['WebRex', 'Tech', 'Programming'],
      isFeatured: true
    });

    setArticlesList(getArticles());
    setShowAddArticle(false);
    setArtTitle('');
    setArtExcerpt('');
    setArtContent('');
    setArtCoverImage('');
    setArtNotice('تم نشر المقال بنجاح في قسم مقالاتنا!');
    setTimeout(() => setArtNotice(null), 3000);
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المقال؟')) {
      deleteArticle(id);
      setArticlesList(getArticles());
      setArtNotice('تم حذف المقال');
      setTimeout(() => setArtNotice(null), 2500);
    }
  };

  // Orders & Applicants
  const handleDeleteOrder = (id?: string) => {
    if (!id) return;
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      deleteOrderFromCloudAndLocal(id);
      setOrders(getLocalOrders().filter(o => o.id !== id));
    }
  };

  const handleDeleteApplicant = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المتقدم؟')) {
      deleteDeveloperApplicant(id);
      setApplicants(getDeveloperApplicants());
    }
  };

  // Social Links
  const handleSocialUrlChange = (id: string, url: string) => {
    updateSocialLink(id, { url });
    setSocialLinks(getSocialLinks());
    showSocialNotice('تم تحديث الرابط بنجاح');
  };

  const handleToggleSocial = (id: string, currentStatus: boolean) => {
    updateSocialLink(id, { enabled: !currentStatus });
    setSocialLinks(getSocialLinks());
    showSocialNotice(currentStatus ? 'تم إخفاء الأيقونة من الموقع' : 'تم تفعيل وإظهار الأيقونة');
  };

  const handleDeleteSocial = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الأيقونة؟')) {
      deleteSocialLink(id);
      setSocialLinks(getSocialLinks());
      showSocialNotice('تم حذف الأيقونة');
    }
  };

  const handleAddSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocialUrl.trim()) {
      alert('يرجى كتابة رابط الحساب.');
      return;
    }
    addSocialLink({
      platform: newSocialPlatform,
      name: newSocialName || newSocialPlatform,
      url: newSocialUrl.trim()
    });
    setSocialLinks(getSocialLinks());
    setNewSocialName('');
    setNewSocialUrl('');
    setShowAddSocial(false);
    showSocialNotice('تمت إضافة الأيقونة بنجاح!');
  };

  const handleResetSocial = () => {
    if (confirm('هل ترغب في استعادة القائمة الافتراضية لمنصات التواصل؟')) {
      resetSocialLinks();
      setSocialLinks(getSocialLinks());
      showSocialNotice('تمت استعادة الأيقونات الافتراضية');
    }
  };

  // Brand Settings Handlers
  const handleSaveBrandSettings = (e: React.FormEvent) => {
    e.preventDefault();
    savePlatformSettings(brandForm);
    setBrandSavedMsg('تم حفظ وتحديث اسم المنصة وإعدادات الهوية بنجاح على كامل الموقع!');
    setTimeout(() => setBrandSavedMsg(null), 3500);
  };

  const handleResetBrandSettings = () => {
    if (confirm('هل أنت متأكد من استعادة الاسم الافتراضي للمنصة (M Web | إم ويب)؟')) {
      const def = resetPlatformSettings();
      setBrandForm(def);
      setBrandSavedMsg('تمت استعادة الإعدادات الافتراضية بنجاح');
      setTimeout(() => setBrandSavedMsg(null), 3000);
    }
  };

  // Live Chat Handlers
  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    markThreadAsReadByAdmin(threadId);
    setChatThreads(getAllChatThreads());
  };

  const handleAdminFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('حجم الملف كبير جداً (الحد الأقصى 8 ميجابايت)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const isImg = file.type.startsWith('image/');
        const sizeFormatted = (file.size / 1024).toFixed(1) + ' KB';
        setAdminAttachment({
          name: file.name,
          type: isImg ? 'image' : 'file',
          url: reader.result,
          size: sizeFormatted
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThreadId || (!adminReplyText.trim() && !adminAttachment)) return;

    sendAdminReply(selectedThreadId, adminReplyText.trim(), adminAttachment || undefined);
    setAdminReplyText('');
    setAdminAttachment(null);
    setChatThreads(getAllChatThreads());
  };

  const handleDeleteChatThread = (threadId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المحادثة بالكامل؟')) {
      deleteChatThread(threadId);
      const remaining = getAllChatThreads();
      setChatThreads(remaining);
      if (selectedThreadId === threadId) {
        setSelectedThreadId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  // Payment Methods Handlers
  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pmNameAr.trim() || !pmDetailsAr.trim()) {
      alert('يرجى ملء اسم القناة والتفاصيل بالعربية على الأقل.');
      return;
    }

    const catTitleAr = pmCategory === 'instapay-wallets' 
      ? 'انستا باي والمحافظ الإلكترونية (InstaPay & E-Wallets)'
      : pmCategory === 'bank-transfers' 
        ? 'التحويلات البنكية المباشرة (Bank Wire / IBAN)'
        : 'البطاقات الائتمانية والدفع الدولي (Visa / MasterCard / PayPal)';

    const catTitleEn = pmCategory === 'instapay-wallets'
      ? 'InstaPay & E-Wallets'
      : pmCategory === 'bank-transfers'
        ? 'Direct Bank Wire Transfers (IBAN)'
        : 'Credit Cards & International Payment';

    addPaymentMethod({
      categoryId: pmCategory,
      categoryTitleAr: catTitleAr,
      categoryTitleEn: catTitleEn,
      nameAr: pmNameAr.trim(),
      nameEn: pmNameEn.trim() || pmNameAr.trim(),
      detailsAr: pmDetailsAr.trim(),
      detailsEn: pmDetailsEn.trim() || pmDetailsAr.trim(),
      copyVal: pmCopyVal.trim() || pmDetailsAr.trim(),
      noteAr: pmNoteAr.trim() || 'تحويل موثق ومعتمد فورياً',
      noteEn: pmNoteEn.trim() || 'Instant verified transfer',
      enabled: true
    });

    setPaymentMethodsList(getPaymentMethods());
    setShowAddPaymentMethod(false);
    setPmNameAr('');
    setPmNameEn('');
    setPmDetailsAr('');
    setPmDetailsEn('');
    setPmCopyVal('');
    setPmNoteAr('');
    setPmNoteEn('');
    setPaymentNotice('تمت إضافة قناة الدفع بنجاح ونشرها للمستخدمين!');
    setTimeout(() => setPaymentNotice(null), 3000);
  };

  const handleTogglePaymentMethod = (id: string, currentStatus: boolean) => {
    updatePaymentMethod(id, { enabled: !currentStatus });
    setPaymentMethodsList(getPaymentMethods());
    setPaymentNotice(currentStatus ? 'تم إيقاف إظهار القناة' : 'تم تفعيل قناة الدفع');
    setTimeout(() => setPaymentNotice(null), 2500);
  };

  const handleDeletePaymentMethod = (id: string) => {
    if (confirm('هل أنت متأكد من حذف وسيلة الدفع هذه؟')) {
      deletePaymentMethod(id);
      setPaymentMethodsList(getPaymentMethods());
      setPaymentNotice('تم حذف وسيلة الدفع');
      setTimeout(() => setPaymentNotice(null), 2500);
    }
  };

  const handleResetPaymentMethods = () => {
    if (confirm('هل ترغب في استعادة الوسائل الافتراضية للدفع (انستا باي، فودافون، الراجحي، NBE، بايبال)؟')) {
      const defs = resetPaymentMethods();
      setPaymentMethodsList(defs);
      setPaymentNotice('تمت استعادة الوسائل الافتراضية');
      setTimeout(() => setPaymentNotice(null), 2500);
    }
  };

  const showSocialNotice = (msg: string) => {
    setSocialSavedMessage(msg);
    setTimeout(() => setSocialSavedMessage(null), 2500);
  };

  const unreadChatCount = chatThreads.filter((t) => t.unreadByAdmin).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>لوحة تحكم إدارة {brandForm.brandNameAr || 'M Web'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  ADMIN TERMINAL
                </span>
              </h3>
              <p className="text-xs text-slate-400">تعديل اسم المنصة، خدمة العملاء المباشرة، الأسعار، الطلبات وأعمال العملاء</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await signInAdminWithGoogle();
                    } catch (err) {
                      console.warn('Google sign-in cancelled or failed:', err);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    cloudUserEmail
                      ? 'bg-emerald-950/70 border-emerald-700/70 text-emerald-300'
                      : 'bg-cyan-950/70 hover:bg-cyan-900/70 border-cyan-700/60 text-cyan-300'
                  }`}
                  title="ربط جلسة قاعدة البيانات السحابية Firestore"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>
                    {cloudUserEmail ? `قاعدة البيانات السحابية متصلة (${cloudUserEmail})` : 'تفعيل المزامنة السحابية (Google)'}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  title="تسجيل الخروج"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Authenticated: Passcode Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-14 text-center max-w-md mx-auto my-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400 shadow-lg shadow-cyan-500/20">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-black text-white">تسجيل الدخول السري للإدارة</h4>
              <p className="text-xs text-slate-400">
                أدخل كود الدخول المصرح به لفتح لوحة تحكم المنصة.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  autoFocus
                  dir="ltr"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setLoginError(false);
                  }}
                  placeholder="أدخل الكود السري"
                  className={`w-full px-4 py-3.5 rounded-2xl bg-slate-950 border text-center font-mono text-xl tracking-widest text-cyan-300 placeholder-slate-700 focus:outline-none transition-all ${
                    loginError 
                      ? 'border-rose-500 shadow-lg shadow-rose-950/50' 
                      : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                  }`}
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>كود الدخول غير صحيح! حاول مرة أخرى.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                تأكيد الدخول للوحة التحكم
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const user = await signInAdminWithGoogle();
                    if (user) {
                      setIsAuthenticated(true);
                      refreshData();
                    }
                  } catch (err) {
                    console.warn('Google sign-in error:', err);
                  }
                }}
                className="w-full py-3 rounded-2xl font-bold text-xs text-cyan-300 bg-slate-950 hover:bg-slate-900 border border-cyan-500/40 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>الدخول السحابي المباشر بحساب Google للإدارة</span>
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Dashboard Tabs Bar */}
            <div className="flex items-center gap-1.5 px-6 pt-3 border-b border-slate-800 bg-slate-950/60 text-xs font-semibold overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveTab('brand-settings')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'brand-settings'
                    ? 'border-cyan-400 text-cyan-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>إعدادات اسم المنصة الهوية</span>
              </button>

              <button
                onClick={() => setActiveTab('live-chat')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap relative ${
                  activeTab === 'live-chat'
                    ? 'border-cyan-400 text-cyan-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                <span>رسائل خدمة العملاء المباشرة ({chatThreads.length})</span>
                {unreadChatCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {unreadChatCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('payment-methods')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'payment-methods'
                    ? 'border-cyan-400 text-cyan-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>وسائل وطرق الدفع ({paymentMethodsList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'border-cyan-400 text-cyan-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>الطلبات الواردة ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('demo-platforms')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'demo-platforms'
                    ? 'border-cyan-400 text-cyan-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                <span>منصات المعاينة والتسعير ({demoPlatforms.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('client-projects')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'client-projects'
                    ? 'border-cyan-400 text-cyan-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-teal-400" />
                <span>أعمال العملاء المنشورة ({clientProjects.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('articles')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'articles'
                    ? 'border-cyan-400 text-cyan-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>نشر المقالات ({articlesList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('social')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'social'
                    ? 'border-cyan-400 text-cyan-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>أيقونات التواصل ({socialLinks.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('applicants')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'applicants'
                    ? 'border-cyan-400 text-cyan-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>طلبات المطورين ({applicants.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'border-cyan-400 text-cyan-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>كود الدخول</span>
              </button>
            </div>

            {/* Dashboard Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
              
              {/* TAB: Brand Settings */}
              {activeTab === 'brand-settings' && (
                <div className="space-y-6">
                  {brandSavedMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{brandSavedMsg}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-cyan-400" />
                        <span>إعدادات اسم المنصة وتخصيص الهوية التجارية:</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        قم بتعديل اسم المنصة والشعار والوصف والرقم الرسمي، وسيتم تحديثها فورياً في جميع الصفحات.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetBrandSettings}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>استعادة الافتراضي (M Web)</span>
                    </button>
                  </div>

                  {/* AI Robot Visibility & Gemini Control Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-950 to-indigo-950/50 border border-cyan-500/40 space-y-4 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                          <h5 className="text-sm font-black text-white">
                            التحكم في روبوت الدردشة بالذكاء الاصطناعي (Gemini AI Robot)
                          </h5>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              brandForm.aiBotEnabled !== false
                                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                            }`}
                          >
                            {brandForm.aiBotEnabled !== false ? 'مُفعّل وظاهر بالموقع' : 'مخفي من الموقع'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          تحكم بضغطة واحدة في إظهار أو إخفاء أيقونة الروبوت البرمجي الذكي المربوط بمحرك Gemini من واجهة الموقع للزوار.
                        </p>
                      </div>

                      <button
                        type="button"
                        data-testid="toggle-ai-robot-visibility"
                        onClick={() => {
                          const nextState = brandForm.aiBotEnabled === false ? true : false;
                          const updated = { ...brandForm, aiBotEnabled: nextState };
                          setBrandForm(updated);
                          savePlatformSettings(updated);
                          setBrandSavedMsg(
                            nextState
                              ? 'تم إظهار وتفعيل أيقونة روبوت الذكاء الاصطناعي في الموقع بنجاح!'
                              : 'تم إخفاء أيقونة روبوت الذكاء الاصطناعي من واجهة الموقع فوراً!'
                          );
                          setTimeout(() => setBrandSavedMsg(null), 3500);
                        }}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                          brandForm.aiBotEnabled !== false
                            ? 'bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20'
                            : 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                        }`}
                      >
                        {brandForm.aiBotEnabled !== false ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span>إخفاء أيقونة الذكاء الاصطناعي</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            <span>إظهار أيقونة الذكاء الاصطناعي</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                      <div>
                        <label className="block text-[11px] font-semibold text-cyan-300 mb-1">
                          اسم الروبوت الذكي بالعربية
                        </label>
                        <input
                          type="text"
                          value={brandForm.aiBotNameAr || 'الروبوت البرمجي الذكي'}
                          onChange={(e) => setBrandForm({ ...brandForm, aiBotNameAr: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-cyan-300 mb-1">
                          اسم الروبوت الذكي بالإنجليزية
                        </label>
                        <input
                          type="text"
                          value={brandForm.aiBotNameEn || 'Smart Cyber Robot'}
                          onChange={(e) => setBrandForm({ ...brandForm, aiBotNameEn: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold font-mono focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveBrandSettings} className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          اسم المنصة بالعربية (مثال: إم ويب أو ويب ريكس) *
                        </label>
                        <input
                          type="text"
                          required
                          value={brandForm.brandNameAr}
                          onChange={(e) => setBrandForm({ ...brandForm, brandNameAr: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          اسم المنصة بالإنجليزية (مثال: M Web أو WebRex) *
                        </label>
                        <input
                          type="text"
                          required
                          value={brandForm.brandNameEn}
                          onChange={(e) => setBrandForm({ ...brandForm, brandNameEn: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold font-mono focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          الجزء الأول للشعار النصي (Main) *
                        </label>
                        <input
                          type="text"
                          required
                          value={brandForm.logoMain}
                          onChange={(e) => setBrandForm({ ...brandForm, logoMain: e.target.value })}
                          placeholder="M"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          الجزء الملون للشعار (Highlight) *
                        </label>
                        <input
                          type="text"
                          required
                          value={brandForm.logoHighlight}
                          onChange={(e) => setBrandForm({ ...brandForm, logoHighlight: e.target.value })}
                          placeholder="Web"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          العنوان المباشر / التاجلاين أسفل اللوجو
                        </label>
                        <input
                          type="text"
                          value={brandForm.tagline}
                          onChange={(e) => setBrandForm({ ...brandForm, tagline: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          رقم الواتساب الرسمي المربوط
                        </label>
                        <input
                          type="text"
                          value={brandForm.whatsappPhone}
                          onChange={(e) => setBrandForm({ ...brandForm, whatsappPhone: e.target.value })}
                          placeholder="201000000000"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          البريد الإلكتروني الرسمي للتواصل (يظهر في أسفل الصفحة)
                        </label>
                        <input
                          type="email"
                          value={brandForm.email || ''}
                          onChange={(e) => setBrandForm({ ...brandForm, email: e.target.value })}
                          placeholder="contact@mweb.dev"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          رابط الموقع الإلكتروني الرسمي (يظهر في الفوتر والتحويلات)
                        </label>
                        <input
                          type="text"
                          value={brandForm.websiteUrl || ''}
                          onChange={(e) => setBrandForm({ ...brandForm, websiteUrl: e.target.value })}
                          placeholder="https://mweb.dev"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        عنوان وتفاصيل الخدمة أسفل الصفحة (العنوان/المقر)
                      </label>
                      <input
                        type="text"
                        value={brandForm.addressText || ''}
                        onChange={(e) => setBrandForm({ ...brandForm, addressText: e.target.value })}
                        placeholder="خدمات برمجية وهندسة منصات رقمية للشركات ورواد الأعمال"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        الوصف الشامل للمنصة (يظهر بالفوتر وجوجل)
                      </label>
                      <textarea
                        rows={2}
                        value={brandForm.description}
                        onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs leading-relaxed focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 hover:shadow-lg hover:shadow-cyan-400/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ وتطبيق إعدادات المنصة والبريد ورابط الموقع فورياً</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB: Live Customer Support Chat */}
              {activeTab === 'live-chat' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-teal-400" />
                        <span>رسائل خدمة العملاء المباشرة من الأيقونة العائمة:</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        تواصل مع الزوار والعملاء الذين يرسلون استفساراتهم من الأيقونة العائمة بالموقع مباشرة.
                      </p>
                    </div>

                    <button
                      onClick={refreshData}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="تحديث الرسائل"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {chatThreads.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm text-slate-400 font-semibold">لا توجد محادثات زوار حتى الآن</p>
                      <p className="text-xs text-slate-500">عندما يقوم أي عميل بإرسال رسالة من الأيقونة العائمة ستظهر هنا فورياً لتتمكن من الرد عليه.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[420px]">
                      
                      {/* Threads List Sidebar */}
                      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-y-auto divide-y divide-slate-800/60">
                        {chatThreads.map((t) => {
                          const isSelected = selectedThreadId === t.id;
                          return (
                            <button
                              key={t.id}
                              onClick={() => handleSelectThread(t.id)}
                              className={`w-full p-3.5 text-right flex flex-col gap-1 transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-cyan-950/60 border-r-4 border-cyan-400'
                                  : 'hover:bg-slate-900/60'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs">{t.customerName || 'زائر جديد'}</span>
                                {t.unreadByAdmin && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                                    جديد
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate w-full">{t.lastMessage}</p>
                              {t.customerPhone && (
                                <span className="text-[10px] text-emerald-400 font-mono">{t.customerPhone}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Thread Active Conversation */}
                      <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
                        {(() => {
                          const activeThread = chatThreads.find((t) => t.id === selectedThreadId);
                          if (!activeThread) {
                            return (
                              <div className="flex-1 flex items-center justify-center p-6 text-xs text-slate-500">
                                اختر محادثة من القائمة لعرض الرسائل والتفاعل مع العميل.
                              </div>
                            );
                          }

                          return (
                            <>
                              {/* Header of conversation */}
                              <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                                <div>
                                  <h5 className="font-bold text-white text-xs">{activeThread.customerName}</h5>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {activeThread.customerPhone ? activeThread.customerPhone : `معرف: ${activeThread.id}`}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteChatThread(activeThread.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                                  title="حذف المحادثة"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Messages Body */}
                              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-950/90">
                                {activeThread.messages.map((m) => {
                                  const isAdmin = m.sender === 'admin';
                                  const isSys = m.sender === 'system';

                                  if (isSys) {
                                    return (
                                      <div key={m.id} className="text-center p-2 rounded-xl bg-slate-900/80 text-[10px] text-slate-400 border border-slate-800/60">
                                        {m.text}
                                      </div>
                                    );
                                  }

                                  return (
                                    <div
                                      key={m.id}
                                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                                    >
                                      <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-semibold">
                                        {isAdmin ? 'الدعم الفني (أنت)' : activeThread.customerName}
                                      </span>
                                      <div
                                        className={`max-w-[85%] p-3 rounded-2xl leading-relaxed space-y-2 ${
                                          isAdmin
                                            ? 'bg-indigo-600 text-white rounded-bl-none shadow'
                                            : 'bg-cyan-600 text-white rounded-br-none shadow'
                                        }`}
                                      >
                                        {/* Attachment rendering */}
                                        {m.attachment && (
                                          <div className="p-2 rounded-xl bg-black/25 border border-white/10 space-y-1.5">
                                            {m.attachment.type === 'image' ? (
                                              <div className="relative group overflow-hidden rounded-lg">
                                                <img
                                                  src={m.attachment.url}
                                                  alt={m.attachment.name}
                                                  className="max-h-48 w-full object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                                                  onClick={() => setPreviewAdminMediaUrl(m.attachment?.url || null)}
                                                />
                                                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                                                  <span className="truncate font-mono">{m.attachment.name}</span>
                                                  <a
                                                    href={m.attachment.url}
                                                    download={m.attachment.name}
                                                    className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white font-bold flex items-center gap-1"
                                                  >
                                                    <Download className="w-3 h-3" />
                                                    <span>تحميل</span>
                                                  </a>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="flex items-center justify-between gap-2 text-xs">
                                                <div className="flex items-center gap-1.5 truncate">
                                                  <FileText className="w-4 h-4 shrink-0 text-cyan-200" />
                                                  <span className="truncate font-mono">{m.attachment.name}</span>
                                                </div>
                                                <a
                                                  href={m.attachment.url}
                                                  download={m.attachment.name}
                                                  className="p-1 rounded bg-white/20 hover:bg-white/30 text-white shrink-0"
                                                  title="تحميل الملف"
                                                >
                                                  <Download className="w-3.5 h-3.5" />
                                                </a>
                                              </div>
                                            )}
                                            {m.attachment.size && (
                                              <span className="text-[9px] text-white/80 font-mono block">{m.attachment.size}</span>
                                            )}
                                          </div>
                                        )}

                                        {m.text && <p>{m.text}</p>}
                                      </div>
                                      <span className="text-[9px] text-slate-500 font-mono mt-0.5">{m.timestamp}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Selected Attachment Badge Preview in Admin Form */}
                              {adminAttachment && (
                                <div className="px-3 py-1.5 bg-indigo-950/90 border-t border-indigo-800 flex items-center justify-between text-xs text-indigo-200">
                                  <div className="flex items-center gap-2 truncate">
                                    {adminAttachment.type === 'image' ? <ImageIcon className="w-4 h-4 text-cyan-300" /> : <FileText className="w-4 h-4 text-cyan-300" />}
                                    <span className="truncate font-mono">{adminAttachment.name}</span>
                                    {adminAttachment.size && <span className="text-[10px] text-cyan-300/80">({adminAttachment.size})</span>}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setAdminAttachment(null)}
                                    className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}

                              {/* Admin Reply Input Form */}
                              <form onSubmit={handleSendAdminReply} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                                <input
                                  type="file"
                                  ref={adminFileInputRef}
                                  onChange={handleAdminFileChange}
                                  className="hidden"
                                  accept="image/*,.pdf,.doc,.docx,.zip,.txt"
                                />
                                <button
                                  type="button"
                                  onClick={() => adminFileInputRef.current?.click()}
                                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center shrink-0 cursor-pointer border border-slate-700 transition-colors"
                                  title="إرفاق صورة أو ملف للعميل"
                                >
                                  <Paperclip className="w-4 h-4" />
                                </button>

                                <input
                                  type="text"
                                  value={adminReplyText}
                                  onChange={(e) => setAdminReplyText(e.target.value)}
                                  placeholder="اكتب ردك المباشر للعميل..."
                                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                                />
                                <button
                                  type="submit"
                                  className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                                >
                                  <Send className="w-3.5 h-3.5 rotate-180" />
                                  <span>إرسال للعميل</span>
                                </button>
                              </form>
                            </>
                          );
                        })()}
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* TAB: Payment Methods Settings */}
              {activeTab === 'payment-methods' && (
                <div className="space-y-6">
                  {paymentNotice && (
                    <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{paymentNotice}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        <span>إدارة وسائل وطرق الدفع المتاحة بالموقع:</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        قم بتحديد وإضافة قنوات الدفع (انستا باي، فودافون كاش، الراجحي، NBE، بايبال، إلخ) وتفعيلها أو إيقافها.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setShowAddPaymentMethod(!showAddPaymentMethod)}
                        className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة قناة دفع جديدة</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetPaymentMethods}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        title="استعادة الافتراضي"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span>الافتراضي</span>
                      </button>
                    </div>
                  </div>

                  {/* Add Payment Method Form Drawer */}
                  {showAddPaymentMethod && (
                    <form onSubmit={handleAddPaymentMethod} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                      <h5 className="text-xs font-bold text-cyan-300 border-b border-slate-800 pb-2">إضافة قناة أو وسيلة دفع جديدة:</h5>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">فئة وسيلة الدفع *</label>
                          <select
                            value={pmCategory}
                            onChange={(e: any) => setPmCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold"
                          >
                            <option value="instapay-wallets">انستا باي والمحافظ الرقمية</option>
                            <option value="bank-transfers">التحويلات البنكية (IBAN)</option>
                            <option value="cards-global">بطاقات الائتمان والدفع الدولي</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">اسم القناة بالعربية *</label>
                          <input
                            type="text"
                            required
                            value={pmNameAr}
                            onChange={(e) => setPmNameAr(e.target.value)}
                            placeholder="مثال: فودافون كاش كود سريع"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">اسم القناة بالإنجليزية</label>
                          <input
                            type="text"
                            value={pmNameEn}
                            onChange={(e) => setPmNameEn(e.target.value)}
                            placeholder="e.g. Vodafone Cash Direct"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">التفاصيل ورقم المحفظة / IBAN (بالعربية) *</label>
                          <input
                            type="text"
                            required
                            value={pmDetailsAr}
                            onChange={(e) => setPmDetailsAr(e.target.value)}
                            placeholder="مثال: IPA: mywallet@instapay / رقم: 01000000000"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">التفاصيل بالإنجليزية</label>
                          <input
                            type="text"
                            value={pmDetailsEn}
                            onChange={(e) => setPmDetailsEn(e.target.value)}
                            placeholder="e.g. Wallet: 01000000000"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">القيمة المحفوظة للنسخ بنقرة (Copy Value)</label>
                          <input
                            type="text"
                            value={pmCopyVal}
                            onChange={(e) => setPmCopyVal(e.target.value)}
                            placeholder="01000000000"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">ملاحظة القناة بالعربية</label>
                          <input
                            type="text"
                            value={pmNoteAr}
                            onChange={(e) => setPmNoteAr(e.target.value)}
                            placeholder="مثال: تحويل لحظي فوري متاح 24/7"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">ملاحظة القناة بالإنجليزية</label>
                          <input
                            type="text"
                            value={pmNoteEn}
                            onChange={(e) => setPmNoteEn(e.target.value)}
                            placeholder="e.g. Instant 24/7 transfer"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs"
                      >
                        حفظ ونشر قناة الدفع الجديدة
                      </button>
                    </form>
                  )}

                  {/* Payment Channels List */}
                  <div className="space-y-3">
                    {paymentMethodsList.map((pm) => (
                      <div
                        key={pm.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          pm.enabled !== false
                            ? 'bg-slate-950/80 border-slate-800'
                            : 'bg-slate-950/40 border-slate-900 opacity-60'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{pm.nameAr}</span>
                            <span className="text-xs text-slate-400 font-mono">({pm.nameEn})</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              pm.enabled !== false ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {pm.enabled !== false ? 'مفعلة بالموقع' : 'معطلة'}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-cyan-300">{pm.detailsAr}</p>
                          <p className="text-[11px] text-slate-400">{pm.noteAr}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleTogglePaymentMethod(pm.id, pm.enabled !== false)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                              pm.enabled !== false
                                ? 'bg-amber-950/60 border border-amber-800/80 text-amber-300 hover:bg-amber-900/60'
                                : 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60'
                            }`}
                          >
                            {pm.enabled !== false ? 'إيقاف التفعيل' : 'تفعيل القناة'}
                          </button>

                          <button
                            onClick={() => handleDeletePaymentMethod(pm.id)}
                            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 transition-colors cursor-pointer"
                            title="حذف القناة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 1: Orders */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">قائمة طلبات المشاريع الواردة:</h4>
                      <p className="text-xs text-slate-400">جميع الطلبات التي أرسلها العملاء عبر نموذج "اطلب مشروعك".</p>
                    </div>
                    <button
                      onClick={refreshData}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="تحديث"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm text-slate-400 font-semibold">لا توجد طلبات واردة حالياً</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order, idx) => (
                        <div 
                          key={order.id || idx}
                          className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-white text-sm">{order.name}</span>
                              <a 
                                href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-mono hover:bg-emerald-900/60 transition-colors"
                              >
                                <PhoneCall className="w-3 h-3" />
                                <span>{order.phone}</span>
                              </a>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">{order.details}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 transition-colors cursor-pointer shrink-0"
                            title="حذف الطلب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: DEMO PLATFORMS & 3-TIER PRICING & MEDIA (NEW)    */}
              {/* ======================================================== */}
              {activeTab === 'demo-platforms' && (
                <div className="space-y-6">
                  {demoNotice && (
                    <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{demoNotice}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">إدارة منصات المعاينة الحية والتسعير الثلاثي:</h4>
                      <p className="text-xs text-slate-400">
                        تحكم في المنصات المعروضة، الروابط التفاعلية داخل التطبيق، الأسعار (شهري، سنوي، تمليك)، الفيديوهات والصور.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAddDemo(!showAddDemo)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{showAddDemo ? 'إلغاء الإضافة' : 'إضافة منصة جديدة'}</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('استعادة المنصات الافتراضية؟')) {
                            resetDemoPlatforms();
                            setDemoPlatforms(getDemoPlatforms());
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                        title="استعادة الافتراضي"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add Demo Platform Form */}
                  {showAddDemo && (
                    <form onSubmit={handleAddDemoPlatform} className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-4">
                      <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">إضافة منصة برمجية للمعاينة والشراء:</h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">اسم المنصة *</label>
                          <input
                            type="text"
                            required
                            value={demoTitle}
                            onChange={(e) => setDemoTitle(e.target.value)}
                            placeholder='مثال: منصة "ريكس أكاديمي" للتعليم الذكي'
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">التصنيف *</label>
                          <input
                            type="text"
                            required
                            value={demoCategory}
                            onChange={(e) => setDemoCategory(e.target.value)}
                            placeholder="مثال: منصات تعليمية، متاجر إلكترونية، أنظمة ERP"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">الوصف التسويقي الموجز</label>
                          <input
                            type="text"
                            value={demoSubtitle}
                            onChange={(e) => setDemoSubtitle(e.target.value)}
                            placeholder="وصف مختصر يظهر أسفل العنوان"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">رابط المعاينة المباشر داخل التطبيق</label>
                          <input
                            type="url"
                            value={demoLiveUrl}
                            onChange={(e) => setDemoLiveUrl(e.target.value)}
                            placeholder="https://demo.example.com"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1 font-semibold">الوصف التفصيلي للحل البرمجي *</label>
                        <textarea
                          required
                          rows={3}
                          value={demoDesc}
                          onChange={(e) => setDemoDesc(e.target.value)}
                          placeholder="اشرح طبيعة المنصة، وظائفها، وكيف تساعد العميل..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none leading-relaxed"
                        />
                      </div>

                      {/* 3 Pricing Models Specification */}
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                        <label className="block text-xs font-bold text-amber-300 mb-3 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4" />
                          <span>تحديد تسعير المنصة حسب الأنظمة الثلاثة (شهري، سنوي، تمليك):</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <span className="text-[11px] text-slate-400 block mb-1">الاشتراك الشهري</span>
                            <input
                              type="number"
                              required
                              value={demoMonthly}
                              onChange={(e) => setDemoMonthly(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                            />
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-400 block mb-1">الاشتراك السنوي</span>
                            <input
                              type="number"
                              required
                              value={demoAnnual}
                              onChange={(e) => setDemoAnnual(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                            />
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-400 block mb-1">سعر التمليك الدائم</span>
                            <input
                              type="number"
                              required
                              value={demoLifetime}
                              onChange={(e) => setDemoLifetime(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                            />
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-400 block mb-1">رمز العملة</span>
                            <select
                              value={demoCurrency}
                              onChange={(e) => setDemoCurrency(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                            >
                              <option value="$">دولار ($)</option>
                              <option value="ر.س">ريال سعودي (ر.س)</option>
                              <option value="د.إ">درهم إماراتي (د.إ)</option>
                              <option value="ج.م">جنيه مصري (ج.م)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Media Uploads: Image from device or URL, Video from YouTube or device upload */}
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                        <label className="block text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          <Film className="w-4 h-4" />
                          <span>الصور والفيديوهات للمنصة (رفع من الجهاز أو روابط خارجية):</span>
                        </label>

                        {/* Image from device or URL */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="text-[11px] text-slate-400 block mb-1">صورة الغلاف (رابط URL):</span>
                            <input
                              type="text"
                              value={demoImageInput}
                              onChange={(e) => setDemoImageInput(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                            />
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-400 block mb-1">أو ارفع صورة من داخل جهازك مباشرة:</span>
                            <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-dashed border-cyan-500/50 hover:bg-slate-800 text-cyan-300 text-xs font-bold cursor-pointer transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              <span>اختر صورة من الكمبيوتر/الهاتف</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, (base64) => setDemoImageInput(base64))}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Video type selector */}
                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-[11px] text-slate-400 block mb-1.5">فيديو الشرح والمعاينة:</span>
                          <div className="flex items-center gap-3 mb-2 text-xs">
                            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                              <input
                                type="radio"
                                name="vtype"
                                checked={demoVideoType === 'none'}
                                onChange={() => setDemoVideoType('none')}
                              />
                              <span>بدون فيديو</span>
                            </label>

                            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                              <input
                                type="radio"
                                name="vtype"
                                checked={demoVideoType === 'youtube'}
                                onChange={() => setDemoVideoType('youtube')}
                              />
                              <span>رابط يوتيوب (YouTube)</span>
                            </label>

                            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                              <input
                                type="radio"
                                name="vtype"
                                checked={demoVideoType === 'upload'}
                                onChange={() => setDemoVideoType('upload')}
                              />
                              <span>رفع فيديو من داخل الجهاز</span>
                            </label>
                          </div>

                          {demoVideoType === 'youtube' && (
                            <input
                              type="text"
                              value={demoVideoUrl}
                              onChange={(e) => setDemoVideoUrl(e.target.value)}
                              placeholder="رابط يوتيوب: https://www.youtube.com/watch?v=..."
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                            />
                          )}

                          {demoVideoType === 'upload' && (
                            <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-dashed border-red-500/50 hover:bg-slate-800 text-red-300 text-xs font-bold cursor-pointer transition-colors">
                              <Video className="w-3.5 h-3.5" />
                              <span>اختر ملف فيديو من جهازك (MP4 / WebM)</span>
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, (base64) => setDemoVideoUrl(base64))}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <label className="block text-xs text-slate-300 mb-1 font-semibold">قائمة المميزات والمواصفات (ميزة في كل سطر):</label>
                        <textarea
                          rows={3}
                          value={demoFeaturesText}
                          onChange={(e) => setDemoFeaturesText(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      {/* Tech Stack */}
                      <div>
                        <label className="block text-xs text-slate-300 mb-1 font-semibold">التقنيات المستخدمة (مفصولة بفاصلة):</label>
                        <input
                          type="text"
                          value={demoTechText}
                          onChange={(e) => setDemoTechText(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black text-xs cursor-pointer shadow"
                      >
                        حفظ ونشر المنصة في قائمة المعاينة
                      </button>
                    </form>
                  )}

                  {/* List of Demo Platforms */}
                  <div className="space-y-3">
                    {demoPlatforms.map((plat) => (
                      <div
                        key={plat.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={plat.thumbnail}
                            alt={plat.title}
                            className="w-16 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-white text-sm">{plat.title}</h5>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-cyan-300">
                                {plat.category}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                              <span>شهري: <strong className="text-white">{plat.pricing.monthly}{plat.pricing.currency}</strong></span>
                              <span>سنوي: <strong className="text-white">{plat.pricing.annual}{plat.pricing.currency}</strong></span>
                              <span>تمليك: <strong className="text-emerald-400">{plat.pricing.lifetime}{plat.pricing.currency}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteDemo(plat.id)}
                            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 cursor-pointer"
                            title="حذف المنصة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: PUBLISHED CLIENT PROJECTS (NEW)                   */}
              {/* ======================================================== */}
              {activeTab === 'client-projects' && (
                <div className="space-y-6">
                  {cpNotice && (
                    <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{cpNotice}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">إدارة أعمال ومشاريع العملاء المنشورة:</h4>
                      <p className="text-xs text-slate-400">
                        اعرض الأنظمة والمنصات التي سلمتها لعملاء فعليين مع إحصائيات النجاح وروابط المواقع الحية.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAddClientProj(!showAddClientProj)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{showAddClientProj ? 'إلغاء الإضافة' : 'إضافة عمل عميل جديد'}</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('استعادة مشاريع العملاء الافتراضية؟')) {
                            resetClientProjects();
                            setClientProjects(getClientProjects());
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                        title="استعادة الافتراضي"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add Client Project Form */}
                  {showAddClientProj && (
                    <form onSubmit={handleAddClientProject} className="p-6 rounded-2xl bg-slate-950 border border-teal-500/40 space-y-4">
                      <h5 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">إضافة مشروع منشور لعميل:</h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">اسم المشروع أو المنصة *</label>
                          <input
                            type="text"
                            required
                            value={cpTitle}
                            onChange={(e) => setCpTitle(e.target.value)}
                            placeholder="مثال: متجر وتطبيق روابي هايبر ماركت"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">اسم العميل أو المؤسسة *</label>
                          <input
                            type="text"
                            required
                            value={cpClientName}
                            onChange={(e) => setCpClientName(e.target.value)}
                            placeholder="مثال: شركة روابي الشرق للتجارة"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">قطاع ومجال العمل</label>
                          <input
                            type="text"
                            value={cpIndustry}
                            onChange={(e) => setCpIndustry(e.target.value)}
                            placeholder="مثال: تجزئة، تعليم، طبي، شحن"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">الدولة والمدينة</label>
                          <input
                            type="text"
                            value={cpLocation}
                            onChange={(e) => setCpLocation(e.target.value)}
                            placeholder="الرياض، السعودية"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">رابط الموقع المنشور الحي</label>
                          <input
                            type="url"
                            value={cpLiveUrl}
                            onChange={(e) => setCpLiveUrl(e.target.value)}
                            placeholder="https://client-site.com"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Image upload from device or URL */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">رابط صورة المشروع (URL):</label>
                          <input
                            type="text"
                            value={cpImage}
                            onChange={(e) => setCpImage(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">أو رفع لقطة شاشة من جهازك:</label>
                          <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-dashed border-teal-500/50 hover:bg-slate-800 text-teal-300 text-xs font-bold cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>اختر صورة من الكمبيوتر/الهاتف</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, (base64) => setCpImage(base64))}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1 font-semibold">وصف المشروع والتحدي التقني</label>
                        <textarea
                          rows={2}
                          value={cpDesc}
                          onChange={(e) => setCpDesc(e.target.value)}
                          placeholder="اشرح ما تم بناؤه للعميل وما تميز به النظام..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1 font-semibold">نتائج وإنجازات المشروع (سطر لكل نتيجة رقمية):</label>
                        <textarea
                          rows={2}
                          value={cpResultsText}
                          onChange={(e) => setCpResultsText(e.target.value)}
                          placeholder="أكثر من 50,000 مستخدم نشط&#10;سرعة تحميل 0.6 ثانية"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">اسم المسؤول لدى العميل:</label>
                          <input
                            type="text"
                            value={cpPerson}
                            onChange={(e) => setCpPerson(e.target.value)}
                            placeholder="مثال: أ. حسام الغامدي (رئيس العمليات)"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">شهادة / رأي العميل في التنفيذ:</label>
                          <input
                            type="text"
                            value={cpQuote}
                            onChange={(e) => setCpQuote(e.target.value)}
                            placeholder="رأي العميل في السرعة وجودة الكود"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black text-xs cursor-pointer shadow"
                      >
                        نشر المشروع في قسم أعمال العملاء
                      </button>
                    </form>
                  )}

                  {/* List of Client Projects */}
                  <div className="space-y-3">
                    {clientProjects.map((cp) => (
                      <div
                        key={cp.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={cp.thumbnail}
                            alt={cp.title}
                            className="w-16 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-white text-sm">{cp.title}</h5>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-800 text-emerald-300">
                                {cp.clientName}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                              <span>الموقع: {cp.location}</span>
                              <span>•</span>
                              <a href={cp.liveUrl} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
                                {cp.liveUrl}
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteClientProj(cp.id)}
                            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 cursor-pointer"
                            title="حذف المشروع"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: ARTICLES & BLOG PUBLISHING (USER'S NEW REQUEST)   */}
              {/* ======================================================== */}
              {activeTab === 'articles' && (
                <div className="space-y-6">
                  {artNotice && (
                    <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{artNotice}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">إدارة ونشر مقالات المنصة:</h4>
                      <p className="text-xs text-slate-400">
                        انشر وشارك مقالات برمجية، أدلة هندسية، وشروحات تقنية لزوار وعملاء ويب ريكس.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAddArticle(!showAddArticle)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{showAddArticle ? 'إلغاء الإضافة' : 'نشر مقال جديد'}</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('استعادة المقالات الافتراضية؟')) {
                            resetArticles();
                            setArticlesList(getArticles());
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                        title="استعادة الافتراضي"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add Article Form */}
                  {showAddArticle && (
                    <form onSubmit={handleAddArticle} className="p-6 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-4">
                      <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">نشر مقال تقني جديد:</h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">عنوان المقال *</label>
                          <input
                            type="text"
                            required
                            value={artTitle}
                            onChange={(e) => setArtTitle(e.target.value)}
                            placeholder="مثال: كيف تبني منصة برمجية تتحمل ملايين الزيارات"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">التصنيف *</label>
                          <input
                            type="text"
                            required
                            value={artCategory}
                            onChange={(e) => setArtCategory(e.target.value)}
                            placeholder="معمارية البرمجيات، أمان الويب، التجارة الإلكترونية"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1 font-semibold">مقتطف موجز تمهيدي (Excerpt)</label>
                        <input
                          type="text"
                          value={artExcerpt}
                          onChange={(e) => setArtExcerpt(e.target.value)}
                          placeholder="ملخص قصير من سطر أو سطرين يجذب القارئ..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1 font-semibold">المحتوى الكامل للمقال *</label>
                        <textarea
                          required
                          rows={6}
                          value={artContent}
                          onChange={(e) => setArtContent(e.target.value)}
                          placeholder="اكتب المقال الكامل هنا. يمكنك استخدام فقرات ونقاط وعناوين..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs leading-relaxed focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Cover image upload from device or URL */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">رابط صورة الغلاف (URL):</label>
                          <input
                            type="text"
                            value={artCoverImage}
                            onChange={(e) => setArtCoverImage(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">أو رفع صورة الغلاف من جهازك:</label>
                          <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-dashed border-indigo-500/50 hover:bg-slate-800 text-indigo-300 text-xs font-bold cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>اختر صورة غلاف من الكمبيوتر</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, (base64) => setArtCoverImage(base64))}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">اسم الكاتب</label>
                          <input
                            type="text"
                            value={artAuthorName}
                            onChange={(e) => setArtAuthorName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">المسمى الوظيفي للكاتب</label>
                          <input
                            type="text"
                            value={artAuthorRole}
                            onChange={(e) => setArtAuthorRole(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-semibold">وقت القراءة التقريبي</label>
                          <input
                            type="text"
                            value={artReadTime}
                            onChange={(e) => setArtReadTime(e.target.value)}
                            placeholder="5 دقائق قراءة"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1 font-semibold">الوسوم التقنية (مفصولة بفاصلة):</label>
                        <input
                          type="text"
                          value={artTagsText}
                          onChange={(e) => setArtTagsText(e.target.value)}
                          placeholder="Architecture, CleanCode, React, Node.js"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-400 hover:to-cyan-300 text-slate-950 font-black text-xs cursor-pointer shadow"
                      >
                        نشر المقال فورياً في الموقع
                      </button>
                    </form>
                  )}

                  {/* List of Articles */}
                  <div className="space-y-3">
                    {articlesList.map((art) => (
                      <div
                        key={art.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={art.coverImage}
                            alt={art.title}
                            className="w-16 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-white text-sm line-clamp-1">{art.title}</h5>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-800 text-indigo-300 shrink-0">
                                {art.category}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                              <span>الكاتب: {art.author.name}</span>
                              <span>•</span>
                              <span>{art.publishedAt}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 cursor-pointer"
                            title="حذف المقال"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: General Projects */}
              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">قائمة المعرض والمشاريع العامة:</h4>
                      <p className="text-xs text-slate-400">إجمالي {projectsList.length} نموذج برمجي معروض.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {projectsList.map((p, idx) => (
                      <div key={p.id || idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.title} className="w-12 h-10 rounded-lg object-cover" />
                          <div>
                            <h5 className="text-xs font-bold text-white">{p.title}</h5>
                            <span className="text-[10px] text-cyan-400">{p.tag}</span>
                          </div>
                        </div>
                        <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-cyan-300">
                          {p.demoUrl}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: Applicants */}
              {activeTab === 'applicants' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">طلبات المطورين للانضمام:</h4>
                      <p className="text-xs text-slate-400">المطورون الذين تقدموا للعمل معنا عبر صفحة "انضم كـ مطور".</p>
                    </div>
                  </div>

                  {applicants.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <Users className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm text-slate-400 font-semibold">لا توجد طلبات انضمام مطورين حالياً</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {applicants.map((app) => (
                        <div key={app.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-white text-sm">{app.name} - {app.role}</h5>
                            <p className="text-xs text-slate-400">{app.email} • {app.experience} سنوات خبرة</p>
                          </div>
                          <button
                            onClick={() => handleDeleteApplicant(app.id)}
                            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: Social Links */}
              {activeTab === 'social' && (
                <div className="space-y-6">
                  {socialSavedMessage && (
                    <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{socialSavedMessage}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">أيقونات التواصل الاجتماعي في الفوتر:</h4>
                      <p className="text-xs text-slate-400">تحكم بالظهور والروابط وإمكانية إضافة أو حذف أي منصة.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAddSocial(!showAddSocial)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{showAddSocial ? 'إلغاء' : 'إضافة أيقونة جديدة'}</span>
                      </button>
                      <button
                        onClick={handleResetSocial}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                        title="استعادة الافتراضي"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {showAddSocial && (
                    <form onSubmit={handleAddSocial} className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select
                          value={newSocialPlatform}
                          onChange={(e) => setNewSocialPlatform(e.target.value as any)}
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                        >
                          <option value="linkedin">LinkedIn</option>
                          <option value="x">X (Twitter)</option>
                          <option value="tiktok">TikTok</option>
                          <option value="youtube">YouTube</option>
                          <option value="telegram">Telegram</option>
                          <option value="instagram">Instagram</option>
                          <option value="facebook">Facebook</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="github">GitHub</option>
                          <option value="website">موقع إلكتروني</option>
                        </select>
                        <input
                          type="text"
                          value={newSocialName}
                          onChange={(e) => setNewSocialName(e.target.value)}
                          placeholder="اسم المنصة"
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                        />
                        <input
                          type="text"
                          required
                          value={newSocialUrl}
                          onChange={(e) => setNewSocialUrl(e.target.value)}
                          placeholder="رابط الحساب"
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>
                      <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold">
                        إضافة الأيقونة
                      </button>
                    </form>
                  )}

                  <div className="space-y-3">
                    {socialLinks.map((item) => (
                      <div key={item.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white text-xs">{item.name}</span>
                          <span className="text-[11px] text-cyan-400 font-mono">{item.url}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleSocial(item.id, item.enabled)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                              item.enabled ? 'bg-cyan-950 text-cyan-300' : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {item.enabled ? 'مفعلة' : 'معطلة'}
                          </button>
                          <button
                            onClick={() => handleDeleteSocial(item.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: Security Passcode */}
              {activeTab === 'security' && (
                <div className="max-w-md mx-auto space-y-6 py-4">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center mx-auto text-cyan-400">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">تعديل كود الدخول السري للوحة الإدارة</h4>
                    <p className="text-xs text-slate-400">
                      يمكنك تعيين وتحديث كود الدخول السري في أي وقت لتأمين وحماية لوحة التحكم.
                    </p>
                  </div>

                  <form onSubmit={handleChangePasscode} className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    {passcodeError && (
                      <div className="p-3 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{passcodeError}</span>
                      </div>
                    )}

                    {passcodeSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>تم تحديث كود الدخول السري بنجاح! احتفظ بالكود الجديد.</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        كود الدخول الجديد *
                      </label>
                      <div className="relative">
                        <input
                          type={showCode ? 'text' : 'password'}
                          required
                          dir="ltr"
                          value={newPasscode}
                          onChange={(e) => setNewPasscode(e.target.value)}
                          placeholder="أدخل الكود الجديد (4 خانات على الأقل)"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-500 text-left"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCode(!showCode)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        تأكيد كود الدخول الجديد *
                      </label>
                      <input
                        type={showCode ? 'text' : 'password'}
                        required
                        dir="ltr"
                        value={confirmPasscode}
                        onChange={(e) => setConfirmPasscode(e.target.value)}
                        placeholder="أعد كتابة الكود الجديد للتأكيد"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-500 text-left"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl font-bold text-xs text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors cursor-pointer"
                    >
                      حفظ وتطبيق الكود الجديد
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      {/* Admin Image Preview Modal */}
      {previewAdminMediaUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewAdminMediaUrl(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewAdminMediaUrl} alt="Preview Attachment" className="max-h-[80vh] w-auto mx-auto rounded-2xl object-contain" />
            <div className="mt-4 text-center">
              <a
                href={previewAdminMediaUrl}
                download="chat-attachment"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الصورة برابط مباشر</span>
              </a>
            </div>
          </div>
        </div>
      )}

      </motion.div>
    </div>
  );
};
