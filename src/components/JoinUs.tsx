import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Code2, 
  Headphones, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Briefcase, 
  Terminal, 
  Laptop,
  MessageSquare,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePlatformSettings } from '../services/platformSettings';
import { addDeveloperApplicant, getDeveloperApplicants } from '../services/firebase';
import { syncSectionToDataJson } from '../services/dataJsonService';

type TrackType = 'developers' | 'customer-service';

export const JoinUs: React.FC = () => {
  const { t, language } = useLanguage();
  const settings = usePlatformSettings();
  const [activeTrack, setActiveTrack] = useState<TrackType>('developers');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Frontend Developer');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('1-3');
  const [linkOrCv, setLinkOrCv] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const developerRoles = language === 'ar'
    ? [
        'مطور واجهات أمامية (Frontend Developer)',
        'مهندس خوادم وقواعد بيانات (Backend Engineer)',
        'مهندس برمجيات شامل (Full-Stack Engineer)',
        'مطور تطبيقات موبايل وويب (Mobile & Web Developer)',
        'مصمم واجهات وتجربة مستخدم (UI/UX Designer)'
      ]
    : [
        'Frontend Developer',
        'Backend Software Engineer',
        'Full-Stack Software Engineer',
        'Mobile & Web Application Developer',
        'UI/UX Product Designer'
      ];

  const customerServiceRoles = language === 'ar'
    ? [
        'أخصائي خدمة عملاء ومبيعات تقنية',
        'موظف دعم فني ومساعدة عملاء المنصات',
        'مدير حسابات ونجاح العملاء',
        'مشغل محادثات حية ومتابعة واتساب'
      ]
    : [
        'Customer Care & Tech Sales Specialist',
        'Platform Technical Helpdesk Agent',
        'Customer Success & Account Manager',
        'Live Chat & WhatsApp Support Specialist'
      ];

  const handleTrackChange = (track: TrackType) => {
    setActiveTrack(track);
    setRole(track === 'developers' ? developerRoles[0] : customerServiceRoles[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addDeveloperApplicant({
        id: (activeTrack === 'developers' ? 'DEV-' : 'CS-') + Date.now(),
        track: activeTrack === 'developers' ? 'مبرمجين وتطوير' : 'خدمة عملاء ودعم فني',
        name,
        role,
        phone,
        experience,
        portfolioUrl: linkOrCv,
        notes,
        timestamp: new Date().toISOString()
      });
      syncSectionToDataJson('developerApplicants', getDeveloperApplicants()).catch(() => {});
    } catch (err) {
      console.warn('Could not save applicant:', err);
    }
    setSubmitted(true);
  };

  const whatsAppDirectUrl = `https://wa.me/${settings.whatsappPhone || '201000000000'}?text=${encodeURIComponent(
    language === 'ar'
      ? `مرحباً فريق ${settings.brandNameAr}،\nأود الانضمام لفريقكم كـ: ${role}\nالاسم: ${name}\nرقم الهاتف: ${phone}\nالخبرة: ${experience}\nالرابط أو السيرة الذاتية: ${linkOrCv}`
      : `Hello ${settings.brandNameEn} Team,\nI would like to apply for: ${role}\nName: ${name}\nPhone: ${phone}\nExperience: ${experience}\nPortfolio/CV: ${linkOrCv}`
  )}`;

  return (
    <section id="join-us" className="py-20 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/50 text-cyan-400 text-xs font-semibold">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>{t.joinBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {t.joinTitle}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t.joinDesc}
          </p>

          {/* Track Switcher */}
          <div className="pt-6 flex justify-center">
            <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-2 shadow-xl">
              <button
                type="button"
                onClick={() => handleTrackChange('developers')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTrack === 'developers'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>{language === 'ar' ? 'مسار المبرمجين والمطورين' : 'Developers & Engineers Track'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTrackChange('customer-service')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTrack === 'customer-service'
                    ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>{language === 'ar' ? 'مسار خدمة العملاء والدعم الفني' : 'Customer Care & Support Track'}</span>
              </button>
            </div>
          </div>
        </div>

        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 sm:p-12 rounded-3xl bg-slate-950 border border-emerald-500/40 text-center space-y-5 max-w-xl mx-auto shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/60 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">
              {language === 'ar' ? 'تم استلام طلب انضمامك بنجاح!' : 'Application Submitted Successfully!'}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {activeTrack === 'developers'
                ? (language === 'ar'
                    ? 'شكراً لك، سيقوم الفريق التقني بمراجعة سابقة أعمالك والتواصل معك عبر واتساب لمناقشة المشاريع المتاحة.'
                    : 'Thank you! Our engineering lead will review your portfolio and contact you via WhatsApp.')
                : (language === 'ar'
                    ? 'شكراً لك، سيقوم مسؤول الموارد البشرية وإدارة خدمة العملاء بمراجعة بياناتك والتواصل معك.'
                    : 'Thank you! Our customer operations team will review your application and contact you soon.')}
            </p>
            <div className="pt-3">
              <a
                href={whatsAppDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-400/20"
              >
                <MessageSquare className="w-4 h-4" />
                <span>
                  {language === 'ar' ? 'إرسال السيرة الذاتية مباشرة عبر واتساب' : 'Send CV Directly via WhatsApp'}
                </span>
              </a>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Highlights */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              {activeTrack === 'developers' ? (
                <div className="p-6 sm:p-7 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-5 h-full flex flex-col justify-center">
                  <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{language === 'ar' ? 'مميزات العمل معنا كمبرمج:' : 'Perks for Developers:'}</span>
                  </h4>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">
                        {language === 'ar' ? 'عمل مرن عن بُعد 100%' : '100% Flexible Remote Work'}
                      </h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {language === 'ar' ? 'حرية العمل من أي مكان مع تنظيم واضح للمهام.' : 'Work from anywhere with structured milestones and clear specifications.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400 shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">
                        {language === 'ar' ? 'مشاريع ومنصات كبرى' : 'High-Impact Digital Platforms'}
                      </h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {language === 'ar' ? 'بناء وتطوير أنظمة ومتاجر ومنصات تخدم شريحة واسعة من العملاء.' : 'Build scalable systems, e-commerce stores, and enterprise platforms.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 shrink-0">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">
                        {language === 'ar' ? 'عقود ومكافآت مجزية' : 'Competitive Compensation & Bonuses'}
                      </h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {language === 'ar' ? 'دفعات مالية منتظمة لكل مشروع ومكافآت لجودة التنفيذ.' : 'Reliable project payouts and performance bonuses for quality delivery.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-7 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-5 h-full flex flex-col justify-center">
                  <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Headphones className="w-4 h-4" />
                    <span>{language === 'ar' ? 'مميزات العمل في خدمة العملاء:' : 'Perks for Customer Care:'}</span>
                  </h4>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">
                        {language === 'ar' ? 'ورديات وساعات عمل مرنة' : 'Flexible Remote Shifts'}
                      </h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {language === 'ar' ? 'إمكانية اختيار الشيفت المناسب (صباحي / مسائي) عن بُعد.' : 'Choose morning or evening shifts working comfortably from home.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400 shrink-0">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">
                        {language === 'ar' ? 'بيئة عمل احترافية ومحترمة' : 'Supportive Professional Culture'}
                      </h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {language === 'ar' ? 'تدريب شامل على كافة أنظمة المنصة وأدوات إدارة المحادثات.' : 'Full onboarding and training on all platform tools and live chat workflows.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">
                        {language === 'ar' ? 'رواتب ثابتة وعمولات إضافية' : 'Base Salary + Sales Commissions'}
                      </h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {language === 'ar' ? 'راتب شهري مجزي مع بونص عند إغلاق استشارات وطلبات المنصات.' : 'Attractive monthly salary plus bonuses on confirmed platform orders.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="p-7 sm:p-8 rounded-3xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-2xl">
                
                <div className="pb-2 border-b border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {language === 'ar'
                      ? `نموذج التقديم: ${activeTrack === 'developers' ? 'فريق المطورين' : 'فريق خدمة العملاء'}`
                      : `Application Form: ${activeTrack === 'developers' ? 'Engineering Team' : 'Customer Support Team'}`}
                  </span>
                  <span className="text-[11px] text-cyan-400">
                    {language === 'ar' ? 'جميع الحقول مطلوبة' : 'All fields required'}
                  </span>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'الاسم بالكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: محمد عبد الله' : 'e.g. Mohamed Abdullah'}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Role select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'الوظيفة أو التخصص المطلوب *' : 'Role / Specialization *'}
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    {(activeTrack === 'developers' ? developerRoles : customerServiceRoles).map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {language === 'ar' ? 'رقم الهاتف / واتساب *' : 'Phone / WhatsApp *'}
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+20 100 000 0000"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 text-left font-mono"
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {language === 'ar' ? 'سنوات الخبرة *' : 'Years of Experience *'}
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="junior">{language === 'ar' ? 'مبتدئ / حديث تخرج' : 'Junior / Fresh Graduate'}</option>
                      <option value="1-3">{language === 'ar' ? '1 - 3 سنوات' : '1 - 3 Years'}</option>
                      <option value="3-5">{language === 'ar' ? '3 - 5 سنوات' : '3 - 5 Years'}</option>
                      <option value="5+">{language === 'ar' ? 'أكثر من 5 سنوات (خبير)' : '5+ Years (Senior)'}</option>
                    </select>
                  </div>
                </div>

                {/* Link or Portfolio */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {activeTrack === 'developers' 
                      ? (language === 'ar' ? 'رابط معرض الأعمال أو السيرة الذاتية *' : 'Portfolio or CV Link *')
                      : (language === 'ar' ? 'رابط السيرة الذاتية أو حسابك المهني *' : 'CV Link or LinkedIn Profile *')}
                  </label>
                  <input
                    type="url"
                    required
                    dir="ltr"
                    value={linkOrCv}
                    onChange={(e) => setLinkOrCv(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 text-left font-mono"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'نبذة سريعة عن مهاراتك أو سابق خبراتك' : 'Brief summary of your skills & experience'}
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={activeTrack === 'developers' 
                      ? (language === 'ar' ? 'اذكر أهم المشاريع التي قمت بتنفيذها...' : 'Mention key projects you have built...')
                      : (language === 'ar' ? 'اذكر خبراتك السابقة في التواصل وخدمة العملاء...' : 'Mention your prior customer care experience...')}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {language === 'ar' ? `إرسال طلب الانضمام إلى ${settings.brandNameAr}` : `Submit Application to ${settings.brandNameEn}`}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
};
