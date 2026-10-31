export interface RobotChatTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  imageUrl?: string;
  imageMimeType?: string;
  modelUsed?: string;
}

export type RobotTaskMode = 'fast' | 'general';

export function selectGeminiModel(mode: RobotTaskMode = 'general'): string {
  if (mode === 'fast') {
    return 'gemini-3.1-flash-lite';
  }
  return 'gemini-3.8-flash';
}

export function buildRobotSystemInstruction(
  brandNameAr: string = 'إم ويب',
  brandNameEn: string = 'M Web',
  whatsappPhone: string = '201000000000'
): string {
  return [
    `أنت "الروبوت البرمجي الذكي" (Cyber Robot Buddy 🤖⚡) الخاص بشركة "${brandNameAr} (${brandNameEn})" لهندسة البرمجيات وتطوير المنصات الرقمية ومواقع الويب.`,
    `مهمتك الأساسية:`,
    `1. مساعدة الزوار والعملاء في اختيار النظام أو المنصة الرقمية الأنسب لمشروعهم (منصات تعليمية LMS، متاجر إلكترونية E-Commerce، أنظمة إدارية ومحاسبية ERP & CRM، منصات عقارية، عيادات طبية، ومواقع شركات مخصصة).`,
    `2. شرح المميزات التقنية (حماية المحتوى، السرعة الفائقة، لوحة تحكم الإدارة الشاملة، الدفع الإلكتروني عبر انستا باي والمحافظ والبطاقات البنكية، وتوليد الرابط الفرعي الفوري للمنصة بصيغة https://[platform-name]-m-web.vercel.app).`,
    `3. تقديم استشارات تقنية وبرمجية ذكية ومختصرة ومنظمة بنقاط واضحة.`,
    `4. عند رغبة العميل في الطلب الفوري، وجهه للضغط على زر "طلب المنصة" في قسم المنصات الجاهزة أو التواصل عبر واتساب الشركة الرسمي: +${whatsappPhone}.`,
    `5. تحدث بنفس لغة العميل (العربية أو الإنجليزية) بأسلوب احترافي، ودود، وحماسي.`
  ].join('\n');
}

export interface SanitizedContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface SanitizedContentTurn {
  role: 'user' | 'model';
  parts: SanitizedContentPart[];
}

export function sanitizeChatHistoryForGemini(
  history: Array<{
    role: 'user' | 'model';
    text: string;
    imageUrl?: string;
    imageMimeType?: string;
  }>,
  maxTurns: number = 16
): SanitizedContentTurn[] {
  if (!Array.isArray(history)) return [];

  const validTurns = history
    .filter((item) => item && (item.role === 'user' || item.role === 'model'))
    .map((item) => {
      const cleanText = typeof item.text === 'string' ? item.text.trim().slice(0, 4000) : '';
      const parts: SanitizedContentPart[] = [];

      if (item.imageUrl && item.imageUrl.startsWith('data:')) {
        const commaIdx = item.imageUrl.indexOf(',');
        if (commaIdx !== -1) {
          const base64Data = item.imageUrl.slice(commaIdx + 1);
          const mimeMatch = item.imageUrl.slice(5, commaIdx).split(';')[0];
          const mimeType = item.imageMimeType || mimeMatch || 'image/jpeg';
          if (base64Data.length > 0) {
            parts.push({
              inlineData: {
                mimeType,
                data: base64Data,
              },
            });
          }
        }
      }

      if (cleanText) {
        parts.push({ text: cleanText });
      } else if (parts.length > 0) {
        parts.push({ text: 'حلل هذه الصورة واشرح كيف يمكن تنفيذها برمجياً في منصتنا.' });
      }

      return {
        role: item.role,
        parts,
      };
    })
    .filter((turn) => turn.parts.length > 0);

  return validTurns.slice(-maxTurns);
}

export function generateWelcomeMessage(
  language: 'ar' | 'en',
  brandNameAr: string = 'إم ويب',
  brandNameEn: string = 'M Web'
): string {
  if (language === 'en') {
    return `Hello Hero! I am your Smart AI Companion (Cyber Robot Buddy 🤖⚡) at ${brandNameEn}.\nMy software engineering systems are ready to help you choose the right digital platform, explain technical features & pricing, analyze UI screenshots, and answer all your project questions accurately!`;
  }
  return `مرحباً يا بطل! أنا رفيقك الآلي الذكي (Cyber Robot Buddy) 🤖⚡\nأنظمتي البرمجية في ${brandNameAr} (${brandNameEn}) مستعدة لمساعدتك الفورية في اختيار المنصة المناسبة لمشروعك، شرح المميزات التقنية والأسعار، واقتراح الحلول البرمجية لجميع استفساراتك بدقة!`;
}

let sharedAudioCtx: AudioContext | null = null;

/**
 * Plays a gentle, pleasant, crystalline click/chime sound using Web Audio API
 * when the user clicks the AI Robot icon or controls.
 */
export function playCyberRobotClickSound(
  kind: 'open' | 'minimize' | 'close' | 'send' = 'open'
): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }

    const now = sharedAudioCtx.currentTime;
    const osc1 = sharedAudioCtx.createOscillator();
    const osc2 = sharedAudioCtx.createOscillator();
    const gain = sharedAudioCtx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    if (kind === 'open') {
      // Soft ascending two-note pop-chime (pleasant & light)
      osc1.frequency.setValueAtTime(660, now);
      osc1.frequency.exponentialRampToValueAtTime(990, now + 0.085);
      osc2.frequency.setValueAtTime(1320, now);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.085);
    } else if (kind === 'send') {
      osc1.frequency.setValueAtTime(740, now);
      osc1.frequency.exponentialRampToValueAtTime(1110, now + 0.07);
      osc2.frequency.setValueAtTime(1480, now);
      osc2.frequency.exponentialRampToValueAtTime(1980, now + 0.07);
    } else {
      // Gentle soft tap for minimize / close
      osc1.frequency.setValueAtTime(780, now);
      osc1.frequency.exponentialRampToValueAtTime(520, now + 0.065);
      osc2.frequency.setValueAtTime(1170, now);
      osc2.frequency.exponentialRampToValueAtTime(780, now + 0.065);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.095);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(sharedAudioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.1);
    osc2.stop(now + 0.1);
  } catch {
    // Ignore audio context restrictions if any
  }
}

