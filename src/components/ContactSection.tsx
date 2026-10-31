import React, { useState } from 'react';
import { Send, Mail, User, MessageSquare, CheckCircle2, AlertCircle, Sparkles, Database } from 'lucide-react';
import { submitContactMessage } from '../services/contacts';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ id: string; mode: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('يرجى ملء جميع الحقول المطلوبة (الاسم، البريد الإلكتروني، والرسالة).');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessInfo(null);

    try {
      const res = await submitContactMessage({ name, email, message });
      if (res.success && res.id) {
        setSuccessInfo({ id: res.id, mode: res.mode });
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setErrorMsg(res.error || 'حدث خطأ غير متوقع أثناء إرسال الرسالة.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'تعذر إرسال الرسالة حالياً.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact-section" className="py-20 relative overflow-hidden bg-slate-950/60 border-t border-slate-900">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-400 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تواصل مباشر مع فريق المبيعات والهندسة</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            هل لديك استفسار أو مشروع تريد تنفيذه؟
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            أرسل لنا تفاصيل استفسارك أو مشروعك وسيقوم فريق المبيعات بالتواصل معك خلال أقل من ساعتين مع دراسة مبدئية وعرض سعر تنافسي.
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-cyan-950/30">
          {successInfo ? (
            <div className="bg-emerald-950/50 border border-emerald-800/60 rounded-2xl p-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-900/80 border border-emerald-600 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">تم إرسال رسالتك بنجاح!</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                شكراً لتواصلك مع WebRex. تم تسجيل رسالتك بنجاح في قاعدة البيانات (<span className="font-mono text-cyan-400 font-bold">{successInfo.mode === 'firestore' ? 'Firestore Cloud' : 'المحفوظات المحلية'}</span>) وسيتم مراجعتها من قبل فريق المبيعات والرد عليك فوراً.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setSuccessInfo(null)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="bg-rose-950/60 border border-rose-800/60 rounded-xl p-4 text-xs text-rose-300 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    الاسم بالكامل <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="أدخل اسمك الكريم"
                      required
                      className="w-full pr-10 pl-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    البريد الإلكتروني <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      dir="ltr"
                      required
                      className="w-full pr-4 pl-10 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white text-right placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  تفاصيل الرسالة أو الاستفسار أو متطلبات المشروع <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute top-3.5 right-3.5 pointer-events-none text-slate-400">
                    <MessageSquare className="w-4 h-4" />
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="اكتب تفاصيل مشروعك أو استفسارك هنا... (مثال: أريد تطوير منصة تعليمية مع بوابة دفع ومميزات متقدمة)"
                    required
                    className="w-full pr-10 pl-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>تخزين آمن في مجموعة Firestore تحت اسم 'contacts'</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-indigo-400 hover:opacity-95 transition-all cursor-pointer shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري الإرسال وحفظ البيانات...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 rotate-180" />
                      <span>إرسال الرسالة إلى فريق المبيعات</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
