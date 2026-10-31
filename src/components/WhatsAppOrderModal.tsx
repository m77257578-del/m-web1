import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MessageCircle, Sparkles } from 'lucide-react';
import { usePlatformSettings } from '../services/platformSettings';
import { useLanguage } from '../context/LanguageContext';

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle: string;
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  isOpen,
  onClose,
  serviceTitle,
}) => {
  const settings = usePlatformSettings();
  const { language, td } = useLanguage();
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const localizedServiceTitle = language === 'ar'
    ? (serviceTitle || `طلب تطوير برمجيات شامل من ${settings.brandNameAr}`)
    : (serviceTitle ? td(serviceTitle) : `Full Custom Software Order from ${settings.brandNameEn}`);

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال الاسم الكريم للمتابعة' : 'Please enter your full name to continue');
      return;
    }
    if (!clientPhone.trim() || clientPhone.length < 6) {
      setError(language === 'ar' ? 'يرجى إدخال رقم جوال أو واتساب صحيح' : 'Please enter a valid mobile or WhatsApp number');
      return;
    }

    setError('');

    const whatsappNumber = settings.whatsappPhone || '201000000000';

    const message = language === 'ar'
      ? `مرحباً فريق ${settings.brandNameAr} (${settings.brandNameEn})،
أرغب في طلب وحجز الخدمة / الباقة التالية:
🔹 *الخدمة المطلوبة:* ${localizedServiceTitle}
👤 *اسم العميل:* ${clientName.trim()}
📱 *رقم الجوال / الواتساب:* ${clientPhone.trim()}

أرجو التواصل معي لتأكيد التفاصيل وبدء العمل في أقرب وقت. شكراً لكم!`
      : `Hello ${settings.brandNameEn} Team,
I would like to order the following service / package:
🔹 *Requested Service:* ${localizedServiceTitle}
👤 *Client Name:* ${clientName.trim()}
📱 *Mobile / WhatsApp:* ${clientPhone.trim()}

Please contact me to confirm the details and get started. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'ar' ? 'إرسال تفاصيل الطلب عبر واتساب' : 'Send Order Details via WhatsApp'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
              {language === 'ar' ? 'تأكيد طلب الخدمة البرمجية' : 'Confirm Software Service Order'}
            </h3>
            <p className="text-xs sm:text-sm text-cyan-300/90 font-medium">
              {localizedServiceTitle}
            </p>
          </div>

          <form onSubmit={handleSendWhatsApp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'ar' ? 'الاسم الكريم:' : 'Your Name:'}</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل اسمك الثلاثي أو اللقب' : 'Enter your full name'}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'ar' ? 'رقم الجوال أو الواتساب:' : 'Mobile / WhatsApp Number:'}</span>
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder={language === 'ar' ? 'مثال: 01000000000' : 'e.g. +201000000000'}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all font-mono"
                dir="ltr"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center font-bold">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>{language === 'ar' ? 'إرسال تفاصيل الطلب عبر واتساب الآن' : 'Send Order via WhatsApp Now'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              {language === 'ar'
                ? 'بالنقر على الزر، سيتم فتح تطبيق واتساب مباشرة مع تفاصيل طلبك واسمك ورقمك لفريق المبيعات.'
                : 'Clicking the button opens WhatsApp directly with your order details pre-filled for our team.'}
            </p>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
