import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildSystemInstruction(brandNameAr = 'إم ويب', brandNameEn = 'M Web', whatsappPhone = '201000000000') {
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

function buildContentsFromHistory(history, currentMessage, imageUrl, imageMimeType) {
  const contents = [];

  if (Array.isArray(history)) {
    for (const item of history.slice(-14)) {
      if (!item || (item.role !== 'user' && item.role !== 'model')) continue;
      const parts = [];
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

  const currentParts = [];
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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  app.post('/api/gemini/chat', async (req, res) => {
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

      const ai = getGenAIClient();
      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY_MISSING',
          message: 'مفتاح Gemini API غير مضاف حالياً في إعدادات الخادم (Settings > Secrets).',
        });
      }

      const modelName = mode === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';
      const contents = buildContentsFromHistory(history, message, imageUrl, imageMimeType);

      if (contents.length === 0) {
        return res.status(400).json({ error: 'EMPTY_MESSAGE', message: 'يرجى كتابة رسالة أو إرفاق صورة.' });
      }

      const systemInstruction = buildSystemInstruction(brandNameAr, brandNameEn, whatsappPhone);

      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
        },
      });

      const replyText = response.text || '';
      return res.json({
        reply: replyText,
        model: modelName,
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('Gemini API Error:', errMsg);
      return res.status(500).json({
        error: 'GEMINI_API_ERROR',
        message: errMsg,
      });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
