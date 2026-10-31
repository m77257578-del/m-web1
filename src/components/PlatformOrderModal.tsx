import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Phone, Globe, CheckCircle2, MessageCircle, Sparkles, Copy, Check } from 'lucide-react';
import { usePlatformSettings } from '../services/platformSettings';
import { submitOrderToFirestore } from '../services/firebase';
import { useLanguage } from '../context/LanguageContext';

interface PlatformOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlatformTitleAr?: string;
  defaultPlatformTitleEn?: string;
}

export const PlatformOrderModal: React.FC<PlatformOrderModalProps> = ({
  isOpen,
  onClose,
  defaultPlatformTitleAr = '',
  defaultPlatformTitleEn = '',
}) => {
  const settings = usePlatformSettings();
  const { language } = useLanguage();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [platformNameAr, setPlatformNameAr] = useState(defaultPlatformTitleAr);
  const [platformNameEn, setPlatformNameEn] = useState(defaultPlatformTitleEn);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    slugUrl: string;
    referenceId: string;
    whatsappUrl: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (defaultPlatformTitleAr) setPlatformNameAr(defaultPlatformTitleAr);
    if (defaultPlatformTitleEn) setPlatformNameEn(defaultPlatformTitleEn);
  }, [defaultPlatformTitleAr, defaultPlatformTitleEn]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name');
      return;
    }
    if (!phone.trim() || phone.length < 6) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال رقم هاتف أو واتساب صحيح' : 'Please enter a valid phone/WhatsApp number');
      return;
    }
    if (!platformNameAr.trim()) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال اسم المنصة باللغة العربية' : 'Please enter platform name in Arabic');
      return;
    }
    if (!platformNameEn.trim()) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال اسم المنصة باللغة الإنجليزية' : 'Please enter platform name in English');
      return;
    }

    setIsSubmitting(true);

    try {
      const slug = platformNameEn
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const generatedUrl = `https://${slug || 'my-platform'}-m-web.vercel.app`;

      const orderDetailsSummary = `[Platform Order]\nArabic Name: ${platformNameAr}\nEnglish Name: ${platformNameEn}\nSlug: ${slug}\nGenerated Deployment URL: ${generatedUrl}`;

      const result = await submitOrderToFirestore({
        name: fullName.trim(),
        phone: phone.trim(),
        details: orderDetailsSummary
      });

      const referenceId = result.id || 'MWEB-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      const adminWhatsAppNumber = settings.whatsappPhone || '201000000000';
      const whatsappMessage = `مرحباً إدارة ${settings.brandNameAr} (${settings.brandNameEn})،
تم استلام طلب منصة جديد عبر الموقع:
👤 *اسم العميل:* ${fullName.trim()}
📱 *رقم التواصل:* ${phone.trim()}
🏷️ *اسم المنصة (عربي):* ${platformNameAr.trim()}
🔤 *اسم المنصة (إنجليزي):* ${platformNameEn.trim()}
🔗 *رابط المعاينة المولد:*
${generatedUrl}
🆔 *رقم الطلب المرجعي:* ${referenceId}

يرجى المتابعة وتجهيز المنصة للعميل في أقرب وقت.`;

      const encodedWhatsAppUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`;

      setSubmittedData({
        slugUrl: generatedUrl,
        referenceId,
        whatsappUrl: encodedWhatsAppUrl
      });

    } catch (err: any) {
      setErrorMessage(err?.message || (language === 'ar' ? 'حدث خطأ أثناء معالجة الطلب' : 'Error processing order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyGeneratedLink = () => {
    if (submittedData?.slugUrl) {
      navigator.clipboard.writeText(submittedData.slugUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 relative overflow-hidden my-auto"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {!submittedData ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {language === 'ar' ? 'طلب منصة وتوليد رابط سحابي مباشر' : 'Order Platform & Generate Cloud URL'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                  {language === 'ar' ? 'نموذج طلب المنصة الذكي' : 'Smart Platform Order Form'}
                </h3>
                <p className="text-xs sm:text-sm text-cyan-300/90 font-medium">
                  {language === 'ar'
                    ? 'قم بملء البيانات لتوليد رابط المنصة وحفظ الطلب في لوحة الأدمن'
                    : 'Fill in the details below to generate your custom platform link and register your order'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{language === 'ar' ? 'الاسم الكامل:' : 'Full Name:'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: المهندس أحمد محمد' : 'e.g. Ahmed Mohamed'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    <span>{language === 'ar' ? 'رقم التواصل / الواتساب:' : 'Phone / WhatsApp Number:'}</span>
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100 123 4567"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all font-mono text-left"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{language === 'ar' ? 'اسم المنصة (بالعربية):' : 'Platform Name (Arabic):'}</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={platformNameAr}
                      onChange={(e) => setPlatformNameAr(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: أكاديمية النجاح' : 'e.g. أكاديمية النجاح'}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{language === 'ar' ? 'اسم المنصة (بالإنجليزية):' : 'Platform Name (English):'}</span>
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      value={platformNameEn}
                      onChange={(e) => setPlatformNameEn(e.target.value)}
                      placeholder="e.g. Success Academy"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all font-mono text-left"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {language === 'ar'
                        ? 'سيتم تحويله تلقائياً لـ: [name]-m-web.vercel.app'
                        : 'Auto-formatted as: [name]-m-web.vercel.app'}
                    </span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-bold">
                    {errorMessage}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? (language === 'ar' ? 'جاري إرسال الطلب ومعالجة الرابط...' : 'Submitting & generating URL...')
                        : (language === 'ar' ? 'إرسال الطلب وتوليد الرابط المخصص' : 'Submit Order & Generate Custom URL')}
                    </span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500/60 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>

              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {language === 'ar' ? 'تم الحفظ في لوحة الأدمن وتوليد الرابط بنجاح' : 'Saved to Admin Dashboard & Link Generated'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                  {language === 'ar' ? 'رابط المنصة المولد خصيصاً لك' : 'Your Custom Generated Platform Link'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {language === 'ar'
                    ? 'تمت معالجة الاسم الإنجليزي برمجياً وتحويله للرابط السحابي التالي:'
                    : 'Your English platform name has been formatted into the following cloud URL:'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 flex items-center justify-between gap-3">
                <div className="font-mono text-cyan-300 text-xs sm:text-sm truncate select-all" dir="ltr">
                  {submittedData.slugUrl}
                </div>
                <button
                  onClick={copyGeneratedLink}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (language === 'ar' ? 'نسخ الرابط' : 'Copy URL')}</span>
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={submittedData.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>
                    {language === 'ar' ? 'إرسال تفاصيل الطلب والرابط إلى واتساب الإدارة' : 'Send Order Details & URL to Admin WhatsApp'}
                  </span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  {language === 'ar' ? 'إغلاق النافذة والعودة للموقع' : 'Close & Return to Website'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
