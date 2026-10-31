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
  Send
} from 'lucide-react';
import { getPaymentMethods, PaymentMethodItem } from '../services/paymentMethods';
import { useLanguage } from '../context/LanguageContext';

interface PaymentMethodsProps {
  onSelectPaymentMethod?: (methodName: string) => void;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = () => {
  const { t, language } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [methods, setMethods] = useState<PaymentMethodItem[]>(getPaymentMethods);

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

  const enabledMethods = methods.filter((m) => m.enabled !== false);

  // Group methods by category
  const categoriesConfig = [
    {
      id: 'instapay-wallets',
      badgeAr: 'الأسرع والأسهل في مصر والشرق الأوسط',
      badgeEn: 'Fastest & Easiest in MENA',
      accent: 'from-emerald-500 to-teal-400'
    },
    {
      id: 'bank-transfers',
      badgeAr: 'معتمد للشركات والمؤسسات',
      badgeEn: 'Verified for Enterprises',
      accent: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'cards-global',
      badgeAr: 'لكافة دول العالم',
      badgeEn: 'Worldwide Accepted',
      accent: 'from-indigo-500 to-purple-500'
    }
  ];

  const groupedCategories = categoriesConfig.map((catConfig) => {
    const categoryItems = enabledMethods.filter((m) => m.categoryId === catConfig.id);
    const sampleItem = categoryItems[0];
    const categoryTitle = language === 'ar' 
      ? (sampleItem?.categoryTitleAr || catConfig.id)
      : (sampleItem?.categoryTitleEn || catConfig.id);

    return {
      ...catConfig,
      title: categoryTitle,
      items: categoryItems
    };
  }).filter((c) => c.items.length > 0);

  const getIconForCategory = (catId: string) => {
    if (catId === 'instapay-wallets') return Smartphone;
    if (catId === 'bank-transfers') return Building2;
    return CreditCard;
  };

  return (
    <section id="payment-methods" className="py-24 bg-slate-950/60 relative overflow-hidden backdrop-blur-sm border-t border-slate-800/60">
      {/* Background ambient highlights */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-cyan-950/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-emerald-950/20 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/50 text-cyan-400 text-xs font-semibold">
            <CreditCard className="w-3.5 h-3.5" />
            <span>{t.paymentBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {t.paymentTitle}
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            {t.paymentDesc}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'ar' ? 'تشفير مالي آمن 100% ومعاملات فورية مؤكدة' : '100% Secure Encrypted Transactions'}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Categories Stream */}
        <div className="space-y-12">
          {groupedCategories.map((cat, catIdx) => (
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
                    <span className={`px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${cat.accent} text-slate-950 shadow-md`}>
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
                                <span className="text-emerald-400 font-bold">{language === 'ar' ? 'تم النسخ' : 'Copied'}</span>
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
          ))}
        </div>

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
                <span>{language === 'ar' ? 'سياسة التعامل المالي العادل والمعتمد' : 'Fair Financial Policy'}</span>
              </div>
              <h4 className="text-xl font-black text-white">
                {language === 'ar' ? 'هل تحتاج إلى استشارة مالية أو فاتورة رسمية باسم مؤسستك؟' : 'Need an official tax invoice or financial consultation?'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {language === 'ar' 
                  ? 'نقوم بإصدار فواتير إلكترونية معتمدة وإيصالات استلام رسمية لكل دفعة تحويل، مع تقديم ضمان برمجي شامل واتفاقية مستوى خدمة (SLA) لحماية كافة حقوقك.'
                  : 'We issue verified electronic tax invoices and official payment receipts for every milestone, with full SLA software warranty.'}
              </p>
            </div>

            <a
              href="https://wa.me/201000000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%81%D8%B1%D9%8A%D9%82%20%D9%88%D9%8A%D8%A8%20%D8%B1%D9%8A%D9%83%D8%B3%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%B7%D8%B1%D9%82%20%D8%A7%D9%84%D8%AF%D9%81%D8%B9%20%D9%88%D8%A7%D9%84%D9%81%D9%88%D8%A7%D8%AA%D9%8A%D8%B1"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 shrink-0 hover:opacity-95 transition-all"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>{language === 'ar' ? 'تواصل مع قسم الحسابات والمالية' : 'Contact Finance Team'}</span>
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
