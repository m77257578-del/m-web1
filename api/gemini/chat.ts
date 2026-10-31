import { GoogleGenAI } from '@google/genai';

function buildSystemInstruction(
  brandNameAr = 'إم ويب',
  brandNameEn = 'M Web',
  whatsappPhone = '201000000000'
) {
  return [
    `أنت "الروبوت البرمجي الذكي" (Cyber Robot Buddy 🤖⚡) الخاص بشركة "${brandNameAr} (${brandNameEn})" لهندسة البرمجيات وتطوير المنصات الرقمية ومواقع الويب.`,
    `مهمتك الأساسية:`,
    `1. مساعدة الزوار والعملاء في اختيار النظام أو المنصة الرقمية الأنسب لمشروعهم (منصات تعليمية LMS، متاجر إلكترونية E-Commerce، أنظمة إدارية ومحاسبية ERP & CRM، منصات عقارية، عيادات طبية، ومواقع شركات مخصصة).`,
    `2. شرح المميزات التقنية (حماية المحتوى، السرعة الفائقة، لوحة تحكم الإدارة الشاملة، الدفع اليدوي المباشر أو الدفع الإلكتروني عبر بوابة كاشير Kashier، وتوليد الرابط الفرعي الفوري للمنصة بصيغة https://[platform-name]-m-web.vercel.app).`,
    `3. تقديم استشارات تقنية وبرمجية ذكية ومختصرة ومنظمة بنقاط واضحة.`,
    `4. عند رغبة العميل في الطلب الفوري، وجهه للضغط على زر "طلب المنصة" في قسم المنصات الجاهزة أو التواصل عبر واتساب الشركة الرسمي: +${whatsappPhone}.`,
    `5. تحدث بنفس لغة العميل (العربية أو الإنجليزية) بأسلوب احترافي، ودود، وحماسي.`,
  ].join('\n');
}

function buildContentsFromHistory(
  history: any[],
  currentMessage: string,
  imageUrl?: string,
  imageMimeType?: string
) {
  const contents: any[] = [];

  if (Array.isArray(history)) {
    for (const item of history.slice(-14)) {
      if (!item || (item.role !== 'user' && item.role !== 'model')) continue;
      const parts: any[] = [];
      if (typeof item.imageUrl === 'string' && item.imageUrl.startsWith('data:')) {
        const commaIdx = item.imageUrl.indexOf(',');
        if (commaIdx !== -1) {
          const base64Data = item.imageUrl.slice(commaIdx + 1);
          const mimeMatch = item.imageUrl.slice(5, commaIdx).split(';')[0];
          if (base64Data) {
            parts.push({
              inlineData: {
                mimeType: item.imageMimeType || mimeMatch || 'image/jpeg',
                data: base64Data,
              },
            });
          }
        }
      }
      if (typeof item.text === 'string' && item.text.trim()) {
        parts.push({ text: item.text.trim().slice(0, 4000) });
      }
      if (parts.length > 0) {
        contents.push({
          role: item.role,
          parts,
        });
      }
    }
  }

  const currentParts: any[] = [];
  if (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
    const commaIdx = imageUrl.indexOf(',');
    if (commaIdx !== -1) {
      const base64Data = imageUrl.slice(commaIdx + 1);
      const mimeMatch = imageUrl.slice(5, commaIdx).split(';')[0];
      if (base64Data) {
        currentParts.push({
          inlineData: {
            mimeType: imageMimeType || mimeMatch || 'image/jpeg',
            data: base64Data,
          },
        });
      }
    }
  }

  const cleanMsg = typeof currentMessage === 'string' ? currentMessage.trim().slice(0, 4000) : '';
  if (cleanMsg) {
    currentParts.push({ text: cleanMsg });
  } else if (currentParts.length > 0) {
    currentParts.push({ text: 'حلل هذه الصورة واشرح كيف يمكن تنفيذها برمجياً في منصتنا.' });
  }

  if (currentParts.length > 0) {
    contents.push({
      role: 'user',
      parts: currentParts,
    });
  }

  return contents;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const {
      history = [],
      message = '',
      imageUrl,
      imageMimeType,
      mode = 'general',
      brandNameAr = 'إم ويب',
      brandNameEn = 'M Web',
      whatsappPhone = '201000000000',
    } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        reply: '',
        fallback: true,
        error: 'GEMINI_API_KEY_MISSING',
        message: 'مفتاح GEMINI_API_KEY غير مضاف في إعدادات البيئة (Environment Variables) على Vercel.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelName = mode === 'fast' ? 'gemini-3.1-flash-lite-preview' : 'gemini-3-flash-preview';
    const contents = buildContentsFromHistory(history, message, imageUrl, imageMimeType);

    if (contents.length === 0) {
      return res.status(400).json({
        error: 'EMPTY_MESSAGE',
        message: 'يرجى كتابة رسالة أو إرفاق صورة.',
      });
    }

    const systemInstruction = buildSystemInstruction(brandNameAr, brandNameEn, whatsappPhone);

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
      },
    });

    return res.status(200).json({
      reply: response.text || '',
      model: modelName,
    });
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return res.status(200).json({
      reply: '',
      fallback: true,
      error: 'GEMINI_API_ERROR',
      message: errMsg,
    });
  }
}
