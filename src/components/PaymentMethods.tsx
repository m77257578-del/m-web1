import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
  Send,
  Lock,
  Unlock,
  ExternalLink,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { getPaymentMethods, PaymentMethodItem } from '../services/paymentMethods';
import { usePlatformSettings } from '../services/platformSettings';
import {
  PaymentModeType,
  canProceedWithPaymentMode,
  buildKashierCheckoutSession,
  KashierCheckoutSession,
} from '../services/paymentGatewayConfig';
import { useLanguage } from '../context/LanguageContext';

interface PaymentMethodsProps {
  onSelectPaymentMethod?: (methodName: string) => void;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = () => {
  const { t, language } = useLanguage();
  const settings = usePlatformSettings();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [methods, setMethods] = useState<PaymentMethodItem[]>(getPaymentMethods);
  const [selectedMode, setSelectedMode] = useState<PaymentModeType>('manual');

  // Interactive Kashier Checkout state (when kashierEnabled is true)
  const [kashierCustomerName, setKashierCustomerName] = useState('');
  const [kashierCustomerPhone, setKashierCustomerPhone] = useState('');
  const [kashierAmount, setKashierAmount] = useState<number>(1500);
  const [kashierSession, setKashierSession] = useState<KashierCheckoutSession | null>(null);
  const [copiedKashierLink, setCopiedKashierLink] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setMethods(getPaymentMethods());
    };
    window.addEventListener('mweb_payment_methods_changed', handleUpdate);
    return () => {
      window.removeEventListener('mweb_payment_methods_changed', handleUpdate);
    };
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const manualCheck = canProceedWithPaymentMode('manual', settings);
  const kashierCheck = canProceedWithPaymentMode('kashier', settings);

  const enabledMethods = methods.filter((m) => m.enabled !== false);

  const categoriesConfig = [
    {
      id: 'instapay-wallets',
      badgeAr: 'تحويل يدوي فوري داخل مصر والشرق الأوسط',
      badgeEn: 'Instant Manual Transfer in MENA',
      accent: 'from-emerald-500 to-teal-400',
    },
    {
      id: 'bank-transfers',
      badgeAr: 'تحويلات بنكية رسمية معتمدة للشركات',
      badgeEn: 'Verified Bank Transfers for Enterprises',
      accent: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'cards-global',
      badgeAr: 'حسابات دولية وخطط سداد مرنة',
      badgeEn: 'International Accounts & Flexible Milestones',
      accent: 'from-indigo-500 to-purple-500',
    },
  ];

  const groupedCategories = categoriesConfig
    .map((catConfig) => {
      const categoryItems = enabledMethods.filter((m) => m.categoryId === catConfig.id);
      const sampleItem = categoryItems[0];
      const categoryTitle =
        language === 'ar'
          ? sampleItem?.categoryTitleAr || catConfig.id
          : sampleItem?.categoryTitleEn || catConfig.id;

      return {
        ...catConfig,
        title: categoryTitle,
        items: categoryItems,
      };
    })
    .filter((c) => c.items.length > 0);

  const getIconForCategory = (catId: string) => {
    if (catId === 'instapay-wallets') return Smartphone;
    if (catId === 'bank-transfers') return Building2;
    return CreditCard;
  };

  const handleGenerateKashierSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kashierCheck.allowed) return;
    const session = buildKashierCheckoutSession(
      {
        orderId: `KSH-${Date.now().toString().slice(-6)}`,
        amount: kashierAmount,
        customerName: kashierCustomerName || 'عميل إم ويب',
        customerPhone: kashierCustomerPhone || '',
      },
      settings
    );
    setKashierSession(session);
  };

  return (
    <section
      id="payment-methods"
      className="py-24 bg-slate-950/60 relative overflow-hidden backdrop-blur-sm border-t border-slate-800/60"
    >
      {/* Background ambient highlights */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-cyan-950/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-emerald-950/20 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-12 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/50 text-cyan-400 text-xs font-semibold">
            <CreditCard className="w-3.5 h-3.5" />
            <span>{t.paymentBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {t.paymentTitle}
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">{t.paymentDesc}</p>
        </motion.div>

        {/* TWO PAYMENT MODES SELECTOR: 1. Manual Payment (Active) vs 2. Kashier Electronic Payment (Locked/Admin Controlled) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Mode 1: Manual Payment */}
          <button
            type="button"
            data-testid="payment-mode-manual-card"
            onClick={() => setSelectedMode('manual')}
            className={`text-right p-6 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              selectedMode === 'manual'
                ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border-emerald-500/70 shadow-xl shadow-emerald-950/30'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-6 h-6" />
                </div>
                <span
                  data-testid="manual-payment-status-badge"
                  className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 border ${
                    manualCheck.allowed
                      ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/90 border-rose-500/50 text-rose-300'
                  }`}
                >
                  {manualCheck.allowed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'ar' ? 'مُفعّل ومتاح الآن' : 'Active & Enabled'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span>{language === 'ar' ? 'مغلق مؤقتاً' : 'Temporarily Locked'}</span>
                    </>
                  )}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white">
                  {language === 'ar'
                    ? '1. الدفع اليدوي المباشر (التحويل الفوري)'
                    : '1. Direct Manual Payment (Instant Transfer)'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  {language === 'ar'
                    ? 'الطريقة المعتمدة والمفعلة حالياً: تحويل مباشر عبر انستا باي (InstaPay)، فودافون كاش، أو التحويل البنكي المباشر مع تأكيد الإيصال عبر واتساب الإدارة.'
                    : 'Currently active method: Direct transfer via InstaPay, Vodafone Cash, or Bank Wire with instant receipt confirmation.'}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-400">
                {language === 'ar'
                  ? 'انقر لاستعراض أرقام وحسابات التحويل اليدوي'
                  : 'Click to view manual transfer accounts'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 font-mono">
                InstaPay / Cash / IBAN
              </span>
            </div>
          </button>

          {/* Mode 2: Electronic Payment via Kashier */}
          <button
            type="button"
            data-testid="payment-mode-kashier-card"
            onClick={() => setSelectedMode('kashier')}
            className={`text-right p-6 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              selectedMode === 'kashier'
                ? kashierCheck.allowed
                  ? 'bg-gradient-to-br from-cyan-950/70 via-slate-900 to-slate-950 border-cyan-500/70 shadow-xl shadow-cyan-950/30'
                  : 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/60 shadow-xl'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                    kashierCheck.allowed
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  }`}
                >
                  {kashierCheck.allowed ? (
                    <Unlock className="w-6 h-6" />
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>

                <span
                  data-testid="kashier-payment-status-badge"
                  className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 border ${
                    kashierCheck.allowed
                      ? 'bg-cyan-950/90 border-cyan-500/50 text-cyan-300'
                      : 'bg-amber-950/90 border-amber-500/50 text-amber-300'
                  }`}
                >
                  {kashierCheck.allowed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>
                        {language === 'ar'
                          ? 'مُفعّل (بوابة كاشير نشطة)'
                          : 'Active (Kashier Gateway Live)'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {language === 'ar'
                          ? 'مقفل حالياً (يُفعل من لوحة الأدمن)'
                          : 'Locked (Controlled by Admin)'}
                      </span>
                    </>
                  )}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white">
                  {language === 'ar'
                    ? '2. الدفع الإلكتروني الفوري (بوابة كاشير Kashier)'
                    : '2. Electronic Payment (Kashier Gateway)'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  {language === 'ar'
                    ? 'مربوط ببوابة الدفع الإلكتروني كاشير (Kashier) لقبول بطاقات Visa و MasterCard وبطاقات ميزة (Meeza) والمحافظ الذكية تلقائياً.'
                    : 'Connected to Kashier Payment Gateway for automated Visa, MasterCard, Meeza, and smart wallet checkout.'}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold">
              <span className={kashierCheck.allowed ? 'text-cyan-400' : 'text-amber-400'}>
                {kashierCheck.allowed
                  ? language === 'ar'
                    ? 'بوابة كاشير جاهزة للدفع الإلكتروني المباشر'
                    : 'Kashier Gateway ready for instant checkout'
                  : language === 'ar'
                  ? 'مقفل افتراضياً — يتم تفعيله من لوحة تحكم الأدمن'
                  : 'Locked by default — Enable via Admin Dashboard'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 font-mono">
                Kashier Gateway
              </span>
            </div>
          </button>
        </div>

        {/* ACTIVE VIEW FOR SELECTED PAYMENT MODE */}
        {selectedMode === 'kashier' ? (
          <motion.div
            key="kashier-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/85 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-md shadow-2xl mb-12"
          >
            {!kashierCheck.allowed ? (
              /* Locked State UI for Kashier Electronic Payment */
              <div
                data-testid="kashier-locked-panel"
                className="text-center max-w-2xl mx-auto py-6 space-y-5"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-950/40">
                  <Lock className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-950 border border-amber-700/60 text-amber-300 text-xs font-bold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>
                      {language === 'ar'
                        ? 'بوابة الدفع الإلكتروني (Kashier) مقفلة حالياً'
                        : 'Electronic Payment Gateway (Kashier) is Currently Locked'}
                    </span>
                  </span>

                  <h3 className="text-2xl font-black text-white">
                    {language === 'ar'
                      ? 'الدفع الإلكتروني المربوط ببوابة كاشير (Kashier) مغلق حالياً'
                      : 'Kashier Electronic Payment is Currently Disabled'}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {language === 'ar'
                      ? 'تم ربط المنصة برمجياً ببوابة كاشير (Kashier Payment Gateway)، ولكن الدفع الإلكتروني مقفل في الوقت الحالي بقرار الإدارة. يمكنك إتمام طلبك فوراً عبر طريقة الدفع اليدوي المفعلة، أو يمكن لمدير النظام تفعيل كاشير بضغطة زر من لوحة تحكم الأدمن.'
                      : 'The platform is integrated with Kashier Payment Gateway, which is currently locked by administration. Please use the active Manual Payment method or enable Kashier from the Admin Dashboard.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMode('manual')}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {language === 'ar'
                        ? 'الانتقال إلى الدفع اليدوي المباشر (المُفعّل)'
                        : 'Switch to Active Manual Payment'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* Unlocked / Enabled State UI for Kashier Electronic Payment */
              <div data-testid="kashier-unlocked-panel" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950">
                        Kashier Gateway ({settings.kashierMode.toUpperCase()})
                      </span>
                      <span className="text-xs font-mono text-cyan-300">
                        {settings.kashierMerchantId}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {language === 'ar'
                        ? 'بوابة كاشير للدفع الإلكتروني الفوري (مُفعّلة)'
                        : 'Kashier Instant Electronic Payment Gateway (Active)'}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                      Visa / MasterCard
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                      Meeza ميزة
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                      Wallets
                    </span>
                  </div>
                </div>

                <form
                  onSubmit={handleGenerateKashierSession}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {language === 'ar' ? 'اسم العميل / المؤسسة' : 'Customer / Company Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={kashierCustomerName}
                      onChange={(e) => setKashierCustomerName(e.target.value)}
                      placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter full name'}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {language === 'ar' ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={kashierCustomerPhone}
                      onChange={(e) => setKashierCustomerPhone(e.target.value)}
                      placeholder="01000000000"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {language === 'ar'
                        ? `قيمة الدفعة (${settings.kashierCurrency})`
                        : `Amount (${settings.kashierCurrency})`}
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={kashierAmount}
                      onChange={(e) => setKashierAmount(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs sm:text-sm font-mono font-bold focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-3 pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {language === 'ar'
                          ? 'توليد جلسة الدفع الإلكتروني عبر بوابة كاشير (Kashier Checkout)'
                          : 'Generate Kashier Electronic Checkout Session'}
                      </span>
                    </button>
                  </div>
                </form>

                {kashierSession && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-400">
                          {language === 'ar'
                            ? 'تم تجهيز رابط الدفع الرسمي عبر كاشير بنجاح'
                            : 'Kashier Official Checkout Link Ready'}
                        </span>
                        <h4 className="text-sm font-black text-white font-mono">
                          Order #{kashierSession.orderId} — {kashierSession.amountFormatted}{' '}
                          {kashierSession.currency}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(kashierSession.checkoutUrl);
                            setCopiedKashierLink(true);
                            setTimeout(() => setCopiedKashierLink(false), 2500);
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedKashierLink ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {copiedKashierLink
                              ? language === 'ar'
                                ? 'تم النسخ'
                                : 'Copied'
                              : language === 'ar'
                              ? 'نسخ رابط الدفع'
                              : 'Copy Link'}
                          </span>
                        </button>

                        <a
                          href={kashierSession.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>
                            {language === 'ar'
                              ? 'فتح صفحة دفع كاشير'
                              : 'Open Kashier Checkout'}
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : null}

        {/* MANUAL PAYMENT CHANNELS STREAM */}
        {selectedMode === 'manual' && (
          <div data-testid="manual-payment-channels-list" className="space-y-12">
            {!manualCheck.allowed ? (
              <div className="p-8 rounded-3xl bg-slate-900/80 border border-rose-500/40 text-center space-y-3">
                <Lock className="w-8 h-8 text-rose-400 mx-auto" />
                <h3 className="text-lg font-black text-white">{manualCheck.reasonAr}</h3>
              </div>
            ) : (
              groupedCategories.map((cat, catIdx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: catIdx * 0.15 }}
                  className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl relative overflow-hidden"
                >
                  {/* Category Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${cat.accent} text-slate-950 shadow-md`}
                        >
                          {language === 'ar' ? cat.badgeAr : cat.badgeEn}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">{cat.title}</h3>
                    </div>
                  </div>

                  {/* Methods Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cat.items.map((method) => {
                      const Icon = getIconForCategory(method.categoryId);
                      const isCopied = copiedId === method.id;
                      const name = language === 'ar' ? method.nameAr : method.nameEn;
                      const details = language === 'ar' ? method.detailsAr : method.detailsEn;
                      const note = language === 'ar' ? method.noteAr : method.noteEn;

                      return (
                        <div
                          key={method.id}
                          className="bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                                <Icon className="w-5 h-5" />
                              </div>
                              <button
                                onClick={() => copyToClipboard(method.copyVal, method.id)}
                                className="p-2 rounded-xl bg-slate-900 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer border border-slate-800 flex items-center gap-1 text-xs"
                                title="Copy"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400 font-bold">
                                      {language === 'ar' ? 'تم النسخ' : 'Copied'}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <h4 className="text-base font-bold text-white mb-2">{name}</h4>
                            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-cyan-300 break-all mb-3 select-all">
                              {details}
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-900">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{note}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Flexible Payment Workflow Guarantee Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 backdrop-blur-md relative overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-right">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {language === 'ar'
                    ? 'سياسة التعامل المالي العادل والمعتمد'
                    : 'Fair Financial Policy'}
                </span>
              </div>
              <h4 className="text-xl font-black text-white">
                {language === 'ar'
                  ? 'هل قمت بالتحويل اليدوي أو ترغب في تأكيد دفعة مشروعك؟'
                  : 'Need an official tax invoice or transfer confirmation?'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {language === 'ar'
                  ? 'نقوم بإصدار فواتير إلكترونية معتمدة وإيصالات استلام رسمية لكل دفعة تحويل يدوي أو إلكتروني، مع تقديم ضمان برمجي شامل واتفاقية مستوى خدمة (SLA).'
                  : 'We issue verified electronic tax invoices and official payment receipts for every milestone, with full SLA software warranty.'}
              </p>
            </div>

            <a
              href={`https://wa.me/${settings.whatsappPhone}?text=${encodeURIComponent(
                'مرحباً إدارة M Web، أرغب في تأكيد دفعة تحويل والاستفسار عن الفواتير'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 shrink-0 hover:opacity-95 transition-all"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>
                {language === 'ar'
                  ? 'إرسال إيصال التحويل لقسم الحسابات'
                  : 'Contact Finance Team'}
              </span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
