import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Send,
  Image as ImageIcon,
  Zap,
  Loader2,
} from 'lucide-react';
import { usePlatformSettings } from '../services/platformSettings';
import { useLanguage } from '../context/LanguageContext';
import {
  RobotChatTurn,
  RobotTaskMode,
  generateWelcomeMessage,
  playCyberRobotClickSound,
} from '../utils/aiRobotHelper';
import {
  getOrCreateAiVisitorSessionId,
  recordAiConversationExchange,
} from '../services/aiChatMonitor';

const CHAT_HISTORY_STORAGE_KEY = 'mweb_cyber_robot_history_v1';

export const CyberRobotAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  isSpeakingOrThinking?: boolean;
}> = ({ size = 'md', isSpeakingOrThinking = false }) => {
  const dimensions =
    size === 'sm' ? 'w-11 h-11' : size === 'lg' ? 'w-14 h-14' : 'w-12 h-12';

  return (
    <div
      className={`relative ${dimensions} rounded-2xl bg-[#091526] border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.45)] flex items-center justify-center shrink-0 overflow-hidden`}
    >
      <svg
        viewBox="0 0 64 64"
        className="w-full h-full p-1.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Antenna */}
        <line
          x1="32"
          y1="4"
          x2="32"
          y2="12"
          stroke="#22d3ee"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="32"
          cy="4"
          r="3"
          fill="#22d3ee"
          className={isSpeakingOrThinking ? 'animate-ping' : ''}
        />
        <circle cx="32" cy="4" r="2.5" fill="#67e8f9" />

        {/* Robot Head Shell */}
        <rect
          x="10"
          y="12"
          width="44"
          height="42"
          rx="16"
          fill="#0d2137"
          stroke="#22d3ee"
          strokeWidth="2"
        />

        {/* Dark Visor Screen */}
        <rect
          x="14"
          y="20"
          width="36"
          height="16"
          rx="8"
          fill="#040914"
          stroke="#0891b2"
          strokeWidth="1.2"
        />

        {/* Glowing Cyan Eyes */}
        <ellipse cx="24" cy="28" rx="4.8" ry="3.8" fill="#22d3ee" />
        <ellipse cx="24" cy="28" rx="2.2" ry="1.8" fill="#cffafe" />
        <ellipse cx="40" cy="28" rx="4.8" ry="3.8" fill="#22d3ee" />
        <ellipse cx="40" cy="28" rx="2.2" ry="1.8" fill="#cffafe" />

        {/* Equalizer Mouth Bars */}
        <rect
          x="24"
          y={isSpeakingOrThinking ? '41' : '43'}
          width="3.6"
          height={isSpeakingOrThinking ? '8' : '5'}
          rx="1.8"
          fill="#22d3ee"
        />
        <rect
          x="30.2"
          y={isSpeakingOrThinking ? '39' : '41'}
          width="3.6"
          height={isSpeakingOrThinking ? '11' : '8'}
          rx="1.8"
          fill="#a855f7"
        />
        <rect
          x="36.4"
          y={isSpeakingOrThinking ? '41' : '43'}
          width="3.6"
          height={isSpeakingOrThinking ? '8' : '5'}
          rx="1.8"
          fill="#22d3ee"
        />
      </svg>
    </div>
  );
};

export const AiRobotWidget: React.FC = () => {
  const settings = usePlatformSettings();
  const { language } = useLanguage();

  const [viewState, setViewState] = useState<'closed' | 'minimized' | 'open'>('closed');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [taskMode, setTaskMode] = useState<RobotTaskMode>('general');
  const [inputValue, setInputValue] = useState('');
  const [attachedImage, setAttachedImage] = useState<{
    url: string;
    mimeType: string;
    name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatTime = () => {
    try {
      return new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '10:15 AM';
    }
  };

  const getInitialTurn = (): RobotChatTurn => ({
    id: 'welcome-turn',
    role: 'model',
    text: generateWelcomeMessage(language, settings.brandNameAr, settings.brandNameEn),
    timestamp: formatTime(),
  });

  const [messages, setMessages] = useState<RobotChatTurn[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return [getInitialTurn()];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update the welcome message if it is the only message and language/brand changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome-turn') {
        return [
          {
            ...prev[0],
            text: generateWelcomeMessage(language, settings.brandNameAr, settings.brandNameEn),
          },
        ];
      }
      return prev;
    });
  }, [language, settings.brandNameAr, settings.brandNameEn]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(messages.slice(-20)));
    } catch {
      // ignore quota error
    }
  }, [messages]);

  // Scroll to bottom when messages change or modal opens
  useEffect(() => {
    if (viewState === 'open') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, viewState, isLoading]);

  // Respect Admin visibility setting immediately
  if (settings.aiBotEnabled === false) {
    return null;
  }

  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#_`~⚡🤖]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore speech synthesis errors
    }
  };

  const handleCopy = (id: string, text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const fresh = [getInitialTurn()];
    setMessages(fresh);
    try {
      localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedImage({
          url: reader.result,
          mimeType: file.type || 'image/jpeg',
          name: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const buildSmartFallbackReply = (query: string): string => {
    const q = query.toLowerCase();
    if (language === 'en') {
      if (q.includes('price') || q.includes('cost') || q.includes('plan')) {
        return `At ${settings.brandNameEn}, we offer flexible plans tailored to your needs:\n• Monthly Cloud Subscription: Starting from $49/mo (includes hosting, security & updates).\n• Annual Plan: Starting from $450/yr (save 2 months + free domain).\n• Lifetime Full Ownership: Starting from $1,400 (complete source code & database ownership).\n\nYou can click "Order Platform" on any system to generate your instant subdomain link!`;
      }
      return `Thank you for your question! At ${settings.brandNameEn}, we specialize in building high-speed E-Learning Academies (LMS), E-Commerce Stores, Cloud ERP Systems, and Custom Web Platforms.\n• Every ordered platform gets an instant live preview link: https://[your-platform]-m-web.vercel.app\n• For direct execution, click "Order Platform" or contact us via WhatsApp: +${settings.whatsappPhone}`;
    }

    if (q.includes('سعر') || q.includes('اسعار') || q.includes('أسعار') || q.includes('باقات') || q.includes('تكلف')) {
      return `في ${settings.brandNameAr} (${settings.brandNameEn}) نوفر باقات مرنة تناسب حجم أعمالك:\n• اشتراك شهري سحابي: يبدأ من 49$ شهرياً (شامل الاستضافة السحابية، الصيانة، والتحديثات).\n• باقة سنوية اقتصادية: تبدأ من 450$ سنوياً (توفير شهرين مجاناً + دومين رسمي + نسخ احتياطي يومي).\n• تمليك كامل مدى الحياة: يبدأ من 1400$ (امتلاك كامل للسورس كود وقواعد البيانات وترخيص تجاري حر).\n\nيمكنك الضغط على زر "طلب المنصة" في أي نظام لتجربة توليد رابط منصتك الفوري!`;
    }
    if (q.includes('رابط') || q.includes('طلب') || q.includes('منص')) {
      return `خطوات طلب منصتك في ${settings.brandNameAr} سريعة ومؤتمتة بالكامل ⚡:\n1. اختر النظام المناسب من قسم "منصات جاهزة للتجربة" واضغط على "طلب المنصة".\n2. أدخل اسمك، رقم التواصل، واسم المنصة بالعربية والإنجليزية.\n3. سيقوم النظام فوراً بتوليد رابط منصتك المخصص على الصيغة:\nhttps://[platform-name]-m-web.vercel.app\nوحفظ طلبك في لوحة الإدارة وإرسال إشعار واتساب فوري لبدء التنفيذ!`;
    }
    return `أهلاً بك في ${settings.brandNameAr} (${settings.brandNameEn}) 🤖⚡\nنحن شركة برمجية متخصصة في هندسة وتطوير:\n• المنصات التعليمية الذكية (LMS) مع حماية الفيديوهات وبنوك الأسئلة.\n• المتاجر الإلكترونية المتكاملة وربط بوابات الدفع والشحن.\n• الأنظمة الإدارية والمحاسبية السحابية (ERP & CRM).\n• المواقع التعريفية والمنصات المخصصة للشركات.\n\nاضغط على "طلب المنصة" لتوليد رابط مشروعك الفوري أو تواصل معنا عبر واتساب: +${settings.whatsappPhone}`;
  };

  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customPrompt !== undefined ? customPrompt : inputValue).trim();
    if ((!textToSend && !attachedImage) || isLoading) return;

    playCyberRobotClickSound('send');
    const currentImage = attachedImage;
    setInputValue('');
    setAttachedImage(null);

    const userTurn: RobotChatTurn = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: formatTime(),
      imageUrl: currentImage?.url,
      imageMimeType: currentImage?.mimeType,
    };

    const historySnapshot = [...messages];
    setMessages((prev) => [...prev, userTurn]);
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          history: historySnapshot,
          message: textToSend,
          imageUrl: currentImage?.url,
          imageMimeType: currentImage?.mimeType,
          mode: taskMode,
          brandNameAr: settings.brandNameAr,
          brandNameEn: settings.brandNameEn,
          whatsappPhone: settings.whatsappPhone,
        }),
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      let replyText = '';
      if (response.ok && data.reply) {
        replyText = data.reply;
      } else {
        replyText = buildSmartFallbackReply(textToSend);
      }

      const botTurn: RobotChatTurn = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: formatTime(),
        modelUsed: data.model || (taskMode === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash'),
      };

      const aiVisitorId = getOrCreateAiVisitorSessionId();
      recordAiConversationExchange(aiVisitorId, userTurn, botTurn);
      setMessages((prev) => [...prev, botTurn]);
      speakText(replyText);
    } catch {
      const fallbackText = buildSmartFallbackReply(textToSend);
      const botTurn: RobotChatTurn = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: fallbackText,
        timestamp: formatTime(),
      };
      const aiVisitorId = getOrCreateAiVisitorSessionId();
      recordAiConversationExchange(aiVisitorId, userTurn, botTurn);
      setMessages((prev) => [...prev, botTurn]);
      speakText(fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  const botTitle =
    language === 'ar'
      ? settings.aiBotNameAr || 'الروبوت البرمجي الذكي'
      : settings.aiBotNameEn || 'Smart Cyber Robot';

  // STATE 1: Floating Cyber Robot Icon (Screenshot 3)
  if (viewState === 'closed') {
    return (
      <div className="fixed bottom-5 right-5 z-50 font-['Cairo',sans-serif]">
        <button
          type="button"
          onClick={() => {
            playCyberRobotClickSound('open');
            setViewState('open');
          }}
          aria-label={language === 'ar' ? 'فتح الروبوت البرمجي الذكي' : 'Open Smart Cyber Robot'}
          data-testid="ai-robot-floating-button"
          className="relative group w-16 h-16 rounded-full bg-[#091526] border-2 border-cyan-400/90 shadow-[0_0_28px_rgba(34,211,238,0.55)] hover:shadow-[0_0_38px_rgba(34,211,238,0.85)] flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {/* Online Green Status Dot (Top Right of Circle as in Screenshot 3) */}
          <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#060c18] shadow-[0_0_10px_rgba(52,211,153,0.9)] z-10" />

          <svg
            viewBox="0 0 64 64"
            className="w-12 h-12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="32"
              y1="5"
              x2="32"
              y2="13"
              stroke="#22d3ee"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="32" cy="5" r="3" fill="#22d3ee" />
            <rect
              x="10"
              y="13"
              width="44"
              height="40"
              rx="16"
              fill="#0d2137"
              stroke="#22d3ee"
              strokeWidth="2"
            />
            <rect
              x="14"
              y="20"
              width="36"
              height="16"
              rx="8"
              fill="#040914"
              stroke="#0891b2"
              strokeWidth="1.2"
            />
            <ellipse cx="24" cy="28" rx="4.8" ry="3.8" fill="#22d3ee" />
            <ellipse cx="24" cy="28" rx="2" ry="1.6" fill="#cffafe" />
            <ellipse cx="40" cy="28" rx="4.8" ry="3.8" fill="#22d3ee" />
            <ellipse cx="40" cy="28" rx="2" ry="1.6" fill="#cffafe" />
            <rect x="24" y="42" width="3.6" height="6" rx="1.8" fill="#22d3ee" />
            <rect x="30.2" y="40" width="3.6" height="9" rx="1.8" fill="#a855f7" />
            <rect x="36.4" y="42" width="3.6" height="6" rx="1.8" fill="#22d3ee" />
          </svg>
        </button>
      </div>
    );
  }

  // STATE 2: Minimized Bottom Dock Bar (Screenshot 2)
  if (viewState === 'minimized') {
    return (
      <div
        dir="rtl"
        data-testid="ai-robot-minimized-bar"
        className="fixed bottom-4 inset-x-3 sm:left-auto sm:right-5 sm:w-[420px] z-[60] font-['Cairo',sans-serif]"
      >
        <div className="rounded-3xl bg-[#091326]/95 backdrop-blur-2xl border border-cyan-500/45 shadow-[0_10px_40px_rgba(6,182,212,0.3)] px-3.5 py-3 flex items-center justify-between gap-2">
          <div
            onClick={() => {
              playCyberRobotClickSound('open');
              setViewState('open');
            }}
            className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
          >
            <CyberRobotAvatar size="md" isSpeakingOrThinking={isLoading} />
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="text-right min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-black text-white leading-snug">
                  {botTitle}
                </h4>
                <p className="text-[10px] text-cyan-300/90 leading-tight mt-0.5">
                  {language === 'ar'
                    ? 'متصل بمحرك Gemini • فائق السرعة'
                    : 'Connected to Gemini AI • Ultra Fast'}
                </p>
              </div>
              <span className="shrink-0 inline-flex flex-col items-center justify-center px-2.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/50 text-[10px] font-bold text-cyan-300 leading-tight shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                <span>{language === 'ar' ? 'يتعلم' : 'Self'}</span>
                <span className="flex items-center gap-0.5">
                  {language === 'ar' ? 'ذاتياً' : 'Learning'}
                  <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                playCyberRobotClickSound('minimize');
                setVoiceEnabled(!voiceEnabled);
              }}
              aria-label={language === 'ar' ? 'تبديل القراءة الصوتية' : 'Toggle voice output'}
              className="p-1.5 rounded-xl text-cyan-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              type="button"
              onClick={() => {
                playCyberRobotClickSound('open');
                setViewState('open');
              }}
              aria-label={language === 'ar' ? 'توسيع نافذة الروبوت' : 'Expand robot window'}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                playCyberRobotClickSound('close');
                setViewState('closed');
              }}
              aria-label={language === 'ar' ? 'إغلاق نافذة الروبوت' : 'Close robot window'}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STATE 3: Full Expanded Cyber Robot Modal (Screenshot 1)
  return (
    <div
      dir="rtl"
      data-testid="ai-robot-open-panel"
      className="fixed inset-x-3 bottom-4 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[430px] z-[60] font-['Cairo',sans-serif]"
    >
      <div className="rounded-3xl bg-[#081121]/98 backdrop-blur-2xl border border-cyan-500/45 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden max-h-[84vh]">
        {/* Top Header matching Screenshot 1 */}
        <div className="px-3.5 py-3.5 bg-gradient-to-b from-[#0d1b33] to-[#091324] border-b border-cyan-500/25 flex items-center justify-between gap-2">
          {/* Right Side: Avatar + Title + Self-Learning Badge */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <CyberRobotAvatar size="lg" isSpeakingOrThinking={isLoading} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                  {botTitle}
                </h3>
                <span className="shrink-0 inline-flex flex-col items-center justify-center px-2.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/50 text-[10px] font-bold text-cyan-300 leading-tight shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <span>{language === 'ar' ? 'يتعلم' : 'Self'}</span>
                  <span className="flex items-center gap-0.5">
                    {language === 'ar' ? 'ذاتياً' : 'Learning'}
                    <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-1 text-[10px] sm:text-[11px] text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse shrink-0" />
                <span className="leading-tight">
                  {language === 'ar'
                    ? 'متصل بالبحث ومحرك Gemini • فائق السرعة'
                    : 'Connected to Search & Gemini • Ultra Fast'}
                </span>
              </div>
            </div>
          </div>

          {/* Left Side: Action Icons (Speaker, Trash, Minimize, Close) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={language === 'ar' ? 'تشغيل/إيقاف الصوت' : 'Toggle Voice'}
              aria-label={language === 'ar' ? 'تشغيل أو إيقاف الصوت' : 'Toggle Voice'}
              className="p-2 rounded-xl text-cyan-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              {voiceEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            <button
              type="button"
              onClick={handleClearHistory}
              title={language === 'ar' ? 'مسح المحادثة' : 'Clear Chat'}
              aria-label={language === 'ar' ? 'مسح المحادثة' : 'Clear Chat'}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                playCyberRobotClickSound('minimize');
                setViewState('minimized');
              }}
              title={language === 'ar' ? 'تصغير للشريط السفلي' : 'Minimize'}
              aria-label={language === 'ar' ? 'تصغير للشريط السفلي' : 'Minimize'}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                playCyberRobotClickSound('close');
                setViewState('closed');
              }}
              title={language === 'ar' ? 'إغلاق' : 'Close'}
              aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Speed / Model Mode Selector Bar */}
        <div className="px-4 py-1.5 bg-[#070e1c] border-b border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-semibold">
            {language === 'ar' ? 'نمط معالجة الذكاء الاصطناعي:' : 'AI Processing Mode:'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTaskMode('general')}
              className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                taskMode === 'general'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ar' ? 'ذكي شامل (3.8 Flash)' : 'Smart (3.8 Flash)'}
            </button>
            <button
              type="button"
              onClick={() => setTaskMode('fast')}
              className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                taskMode === 'fast'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ar' ? 'فائق السرعة ⚡ (Lite)' : 'Ultra Fast ⚡ (Lite)'}
            </button>
          </div>
        </div>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[290px] max-h-[48vh] bg-[#070d19]/95">
          {messages.map((turn) => {
            if (turn.role === 'model') {
              return (
                <div
                  key={turn.id}
                  className="rounded-2xl bg-[#0e1a2f]/95 border border-cyan-500/30 p-4 shadow-lg space-y-3"
                >
                  {/* Card Header: "⚡ رد الروبوت الذكي:" on right, "نسخ" on left */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/90">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-black text-xs sm:text-sm">
                      <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                      <span>
                        {language === 'ar' ? 'رد الروبوت الذكي:' : 'Smart Robot Reply:'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(turn.id, turn.text)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      <span>
                        {copiedId === turn.id
                          ? language === 'ar'
                            ? 'تم النسخ'
                            : 'Copied'
                          : language === 'ar'
                            ? 'نسخ'
                            : 'Copy'}
                      </span>
                      {copiedId === turn.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Message Text */}
                  <div className="text-slate-100 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                    {turn.text}
                  </div>

                  {/* Timestamp */}
                  <div className="text-[10px] text-slate-400 font-mono text-left">
                    {turn.timestamp}
                  </div>
                </div>
              );
            }

            // User Turn
            return (
              <div key={turn.id} className="flex flex-col items-start">
                <div className="w-full rounded-2xl bg-gradient-to-r from-cyan-950/80 to-[#112240] border border-cyan-400/40 p-3.5 text-white shadow-md space-y-2">
                  {turn.imageUrl && (
                    <img
                      src={turn.imageUrl}
                      alt="Uploaded attachment"
                      className="max-h-40 rounded-xl border border-cyan-500/30 object-contain"
                    />
                  )}
                  {turn.text && (
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                      {turn.text}
                    </p>
                  )}
                  <div className="text-[10px] text-cyan-300/70 font-mono text-left">
                    {turn.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="rounded-2xl bg-[#0e1a2f]/90 border border-cyan-500/30 p-4 flex items-center gap-3 text-cyan-300 text-xs font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
              <span>
                {language === 'ar'
                  ? 'جاري التحليل وتوليد الإجابة عبر محرك Gemini...'
                  : 'Analyzing and generating response via Gemini...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Attached Image Preview Bar */}
        {attachedImage && (
          <div className="px-4 py-2 bg-cyan-950/80 border-t border-cyan-500/30 flex items-center justify-between text-xs text-cyan-200">
            <div className="flex items-center gap-2 truncate">
              <img
                src={attachedImage.url}
                alt="Preview"
                className="w-8 h-8 rounded-lg object-cover border border-cyan-400/50"
              />
              <span className="truncate font-mono text-[11px]">{attachedImage.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Action Suggestions */}
        <div className="px-3.5 py-2 bg-[#091326] border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <button
            type="button"
            onClick={() =>
              handleSendMessage(
                undefined,
                language === 'ar'
                  ? 'ما هي أفضل المنصات الجاهزة لديكم وما هي أسعارها؟'
                  : 'What are your best ready platforms and their prices?'
              )
            }
            className="px-2.5 py-1 rounded-xl bg-[#10203b] hover:bg-[#162b4d] text-cyan-300 border border-cyan-500/30 shrink-0 transition-colors cursor-pointer"
          >
            {language === 'ar' ? '⚡ أسعار المنصات والباقات' : '⚡ Platform Pricing'}
          </button>
          <button
            type="button"
            onClick={() =>
              handleSendMessage(
                undefined,
                language === 'ar'
                  ? 'كيف أحصل على رابط منصتي الفوري من موقعكم؟'
                  : 'How do I get my instant platform link?'
              )
            }
            className="px-2.5 py-1 rounded-xl bg-[#10203b] hover:bg-[#162b4d] text-cyan-300 border border-cyan-500/30 shrink-0 transition-colors cursor-pointer"
          >
            {language === 'ar' ? '🔗 طريقة طلب منصة ورابط فوري' : '🔗 Instant Platform Link'}
          </button>
        </div>

        {/* Bottom Input Bar matching Screenshot 1 (Image button right, Pill input middle, Send circle left) */}
        <form
          onSubmit={(e) => handleSendMessage(e)}
          className="p-3.5 bg-[#0a1428] border-t border-cyan-500/25 flex items-center gap-2.5"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Right Icon: Image Upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title={language === 'ar' ? 'إرفاق صورة للتحليل الذكي' : 'Attach image for AI analysis'}
            aria-label={language === 'ar' ? 'إرفاق صورة' : 'Attach image'}
            className="w-11 h-11 rounded-2xl bg-[#111f38] hover:bg-[#182a4a] border border-slate-700/80 text-slate-300 hover:text-cyan-300 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Center Pill Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'اسألني أي شيء، في المنصات أو البرمجة والأسعار...'
                : 'Ask me anything about platforms, software or pricing...'
            }
            className="flex-1 rounded-2xl bg-[#070f1e] border border-cyan-500/45 focus:border-cyan-400 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-all"
          />

          {/* Left Icon: Circular Send Button */}
          <button
            type="submit"
            disabled={isLoading || (!inputValue.trim() && !attachedImage)}
            aria-label={language === 'ar' ? 'إرسال للروبوت الذكي' : 'Send to Smart Robot'}
            className="w-11 h-11 rounded-full bg-[#15233b] hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 disabled:opacity-50 border border-cyan-500/40 flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4 -rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
