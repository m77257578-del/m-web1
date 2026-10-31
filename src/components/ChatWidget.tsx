import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  PhoneCall, 
  Headphones, 
  User, 
  ShieldCheck, 
  Paperclip, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Eye,
  Trash2
} from 'lucide-react';
import { 
  getVisitorSessionId, 
  getThreadById, 
  sendCustomerMessage, 
  markThreadAsReadByCustomer,
  ChatThread,
  ChatMessage,
  ChatAttachment
} from '../services/liveChat';
import { usePlatformSettings } from '../services/platformSettings';
import { useLanguage } from '../context/LanguageContext';

export const ChatWidget: React.FC = () => {
  const settings = usePlatformSettings();
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  
  const visitorId = getVisitorSessionId();
  const [thread, setThread] = useState<ChatThread | null>(() => getThreadById(visitorId));
  
  const [inputValue, setInputValue] = useState('');
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  
  const [customerName, setCustomerName] = useState(() => {
    return localStorage.getItem('mweb_chat_customer_name') || '';
  });
  const [customerPhone, setCustomerPhone] = useState(() => {
    return localStorage.getItem('mweb_chat_customer_phone') || '';
  });
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync thread from storage & live events
  const syncThread = () => {
    const current = getThreadById(visitorId);
    setThread(current);
  };

  useEffect(() => {
    syncThread();

    const handleUpdate = () => {
      syncThread();
    };

    window.addEventListener('live_chat_updated', handleUpdate);
    return () => {
      window.removeEventListener('live_chat_updated', handleUpdate);
    };
  }, [visitorId]);

  // Check if chat is enabled
  useEffect(() => {
    const checkEnabled = () => {
      try {
        const stored = localStorage.getItem('webrex_chat_enabled');
        if (stored !== null) {
          setEnabled(JSON.parse(stored));
        }
      } catch (e) {
        console.warn(e);
      }
    };
    checkEnabled();
  }, []);

  // Scroll to bottom when new messages arrive or chat opens
  useEffect(() => {
    if (isOpen) {
      markThreadAsReadByCustomer(visitorId);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, thread?.messages]);

  const handleToggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      markThreadAsReadByCustomer(visitorId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert(language === 'ar' ? 'حجم الملف كبيراً جداً (الحد الأقصى 8 ميجابايت)' : 'File size is too large (max 8MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const isImg = file.type.startsWith('image/');
        const sizeFormatted = (file.size / 1024).toFixed(1) + ' KB';
        setAttachment({
          name: file.name,
          type: isImg ? 'image' : 'file',
          url: reader.result,
          size: sizeFormatted
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && !attachment) return;

    const textToSend = inputValue.trim();
    const currentAttachment = attachment;
    
    setInputValue('');
    setAttachment(null);

    if (customerName) {
      localStorage.setItem('mweb_chat_customer_name', customerName);
    }
    if (customerPhone) {
      localStorage.setItem('mweb_chat_customer_phone', customerPhone);
    }

    const updatedThread = sendCustomerMessage(
      visitorId,
      textToSend,
      customerName || (language === 'ar' ? 'زائر جديد' : 'New Visitor'),
      customerPhone || undefined,
      currentAttachment || undefined
    );
    setThread(updatedThread);
  };

  const handleSaveUserInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerName) {
      localStorage.setItem('mweb_chat_customer_name', customerName);
    }
    if (customerPhone) {
      localStorage.setItem('mweb_chat_customer_phone', customerPhone);
    }
    setShowUserInfoForm(false);
  };

  if (!enabled) return null;

  const messages: ChatMessage[] = thread?.messages || [
    {
      id: 'init-1',
      sender: 'system',
      senderName: language === 'ar' ? 'فريق خدمة العملاء' : 'Customer Support',
      text: language === 'ar' 
        ? `أهلاً بك في منصة ${settings.brandNameAr}! يسعدنا التواصل معك مباشرة لإجابة كافة استفساراتك واستقبال ملفاتك وصورك.`
        : `Welcome to ${settings.brandNameEn}! Chat live with customer support to ask questions and send project files or images.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  const hasUnread = thread?.unreadByCustomer ?? false;

  return (
    <div className="fixed bottom-5 left-5 z-50 font-['Cairo',sans-serif]">
      {/* Media Fullscreen Image Modal */}
      {previewMediaUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewMediaUrl(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewMediaUrl} alt="Preview" className="max-h-[75vh] w-auto mx-auto rounded-2xl object-contain" />
            <div className="mt-4 text-center">
              <a
                href={previewMediaUrl}
                download="attachment"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'ar' ? 'تحميل الصورة' : 'Download Image'}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl shadow-cyan-950/60 flex flex-col overflow-hidden animate-slide-up">
          
          {/* Top Header */}
          <div className="bg-gradient-to-r from-slate-950 via-cyan-950/80 to-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse"></span>
              </div>
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>{language === 'ar' ? `خدمة عملاء ${settings.brandNameAr}` : `${settings.brandNameEn} Live Support`}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">LIVE</span>
                </h4>
                <p className="text-[11px] text-cyan-300">{language === 'ar' ? 'إرسال واستقبال الرسائل والملفات والمستندات' : 'Send & receive messages, images and files'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowUserInfoForm(!showUserInfoForm)}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
                title={language === 'ar' ? 'تعديل اسمك ورقم التواصل' : 'Edit name & phone'}
              >
                <User className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleToggleOpen}
                className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Info Form Drawer overlay if toggled */}
          {showUserInfoForm && (
            <form onSubmit={handleSaveUserInfo} className="p-3 bg-slate-950 border-b border-slate-800 space-y-2 text-xs">
              <div className="text-[11px] font-bold text-cyan-300">
                {language === 'ar' ? 'تحديث بيانات التواصل للعميل:' : 'Update Contact Info:'}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={language === 'ar' ? 'اسمك الكريم' : 'Your name'}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={language === 'ar' ? 'رقم الواتساب' : 'WhatsApp number'}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-[11px]"
              >
                {language === 'ar' ? 'حفظ البيانات' : 'Save Info'}
              </button>
            </form>
          )}

          {/* Messages Area */}
          <div className="p-4 h-80 overflow-y-auto space-y-3 bg-slate-950/80 text-xs">
            {messages.map((m) => {
              const isCustomer = m.sender === 'customer';
              const isSystem = m.sender === 'system';

              if (isSystem) {
                return (
                  <div key={m.id} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-300 text-center space-y-1">
                    <p className="leading-relaxed">{m.text}</p>
                    <span className="text-[9px] text-slate-500 font-mono">{m.timestamp}</span>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 font-semibold mb-0.5 px-1">
                    {isCustomer ? (customerName || (language === 'ar' ? 'أنت' : 'You')) : (m.senderName || (language === 'ar' ? 'الدعم الفني' : 'Support'))}
                  </span>

                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed text-xs space-y-2 ${
                      isCustomer
                        ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-br-none shadow-md shadow-cyan-600/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none shadow-md'
                    }`}
                  >
                    {/* Attachment rendering */}
                    {m.attachment && (
                      <div className="p-2 rounded-xl bg-black/20 border border-white/10 space-y-1.5">
                        {m.attachment.type === 'image' ? (
                          <div className="relative group overflow-hidden rounded-lg">
                            <img
                              src={m.attachment.url}
                              alt={m.attachment.name}
                              className="max-h-40 w-full object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => setPreviewMediaUrl(m.attachment?.url || null)}
                            />
                            <button
                              type="button"
                              onClick={() => setPreviewMediaUrl(m.attachment?.url || null)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 shrink-0 text-cyan-300" />
                              <span className="truncate font-mono">{m.attachment.name}</span>
                            </div>
                            <a
                              href={m.attachment.url}
                              download={m.attachment.name}
                              className="p-1 rounded bg-white/20 hover:bg-white/30 text-white shrink-0"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                        {m.attachment.size && (
                          <span className="text-[9px] text-slate-300/80 font-mono block">{m.attachment.size}</span>
                        )}
                      </div>
                    )}

                    {m.text && <p>{m.text}</p>}
                  </div>

                  <span className="text-[9px] text-slate-500 mt-0.5 px-1 font-mono">{m.timestamp}</span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Selected File Attachment Badge Preview */}
          {attachment && (
            <div className="px-3 py-2 bg-cyan-950/80 border-t border-cyan-800/80 flex items-center justify-between text-xs text-cyan-300">
              <div className="flex items-center gap-2 truncate">
                {attachment.type === 'image' ? <ImageIcon className="w-4 h-4 text-cyan-400" /> : <FileText className="w-4 h-4 text-cyan-400" />}
                <span className="truncate font-mono">{attachment.name}</span>
                {attachment.size && <span className="text-[10px] text-cyan-400/80">({attachment.size})</span>}
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Suggestions */}
          <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => {
                setInputValue(language === 'ar' ? 'ما هي طريقة إرسال ملفات الشروط والمستندات؟' : 'How can I send project requirement documents?');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 shrink-0 transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'إرسال مستندات' : 'Send Docs'}
            </button>
            <button
              type="button"
              onClick={() => {
                setInputValue(language === 'ar' ? 'أرغب في الحصول على استشارة لمشروعي البرمجي' : 'I would like a tech consultation');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 shrink-0 transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'استشارة مجانية' : 'Free Consultation'}
            </button>
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.zip,.txt"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center shrink-0 cursor-pointer border border-slate-700 transition-colors"
              title={language === 'ar' ? 'إرفاق صورة أو ملف' : 'Attach image or file'}
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={language === 'ar' ? 'اكتب رسالتك أو أرفق ملف...' : 'Type message or attach file...'}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-bold flex items-center justify-center transition-all cursor-pointer shadow-md shadow-cyan-500/20 shrink-0"
              title={language === 'ar' ? 'إرسال' : 'Send'}
            >
              <Send className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </form>

          {/* Footer note */}
          <div className="px-4 py-1.5 bg-slate-950 text-[10px] text-slate-500 text-center border-t border-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              <span>{language === 'ar' ? 'محادثات وملفات مشفرة' : 'Encrypted Chat & Files'}</span>
            </span>
            <a
              href={`https://wa.me/${settings.whatsappPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              <PhoneCall className="w-2.5 h-2.5" />
              <span>WhatsApp</span>
            </a>
          </div>

        </div>
      )}

      {/* Floating Toggle Icon */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className="relative group w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-cyan-500/40 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        title={`Chat with ${settings.brandNameEn}`}
      >
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse"></span>
        {hasUnread && (
          <span className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow animate-bounce">
            {language === 'ar' ? 'رسالة جديدة' : 'New'}
          </span>
        )}
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};
