import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import mysql from 'mysql2/promise';
import {
  extractRelationalTablesFromMasterData,
  generateMySqlDumpFromMasterData,
  reconstructMasterDataFromRelationalRows,
} from './src/utils/firebaseMysqlBridge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const ROOT_DATA_JSON_PATH = path.resolve(__dirname, 'data.json');
const PUBLIC_DATA_JSON_PATH = path.resolve(__dirname, 'public', 'data.json');
const ROOT_MYSQL_DUMP_PATH = path.resolve(__dirname, 'database.sql');
const PUBLIC_MYSQL_DUMP_PATH = path.resolve(__dirname, 'public', 'database.sql');
const MYSQL_CONFIG_FILE_PATH = path.resolve(__dirname, 'mysql-bridge-config.json');

interface MySqlConnectionConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  connectionUri?: string;
  ssl?: boolean;
}

const FIREBASE_PROJECT_ID = 'gen-lang-client-0338286610';
const FIRESTORE_DATABASE_ID = 'ai-studio-mweb-9784d1ea-1fec-4441-8f06-0f6c5fb8dcb5';

function readMySqlConfig(): MySqlConnectionConfig {
  try {
    if (fs.existsSync(MYSQL_CONFIG_FILE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(MYSQL_CONFIG_FILE_PATH, 'utf-8'));
      return {
        host: parsed.host || process.env.MYSQL_HOST || process.env.SQL_HOST || '127.0.0.1',
        port: Number(parsed.port || process.env.MYSQL_PORT || 3306),
        user: parsed.user || process.env.MYSQL_USER || process.env.SQL_USER || 'root',
        password: parsed.password ?? process.env.MYSQL_PASSWORD ?? process.env.SQL_PASSWORD ?? '',
        database:
          parsed.database ||
          process.env.MYSQL_DATABASE ||
          process.env.SQL_DB_NAME ||
          'mweb_firebase_mysql_db',
        connectionUri: parsed.connectionUri || process.env.MYSQL_URL || '',
        ssl: Boolean(parsed.ssl),
      };
    }
  } catch (err) {
    console.warn('Could not read mysql-bridge-config.json:', err);
  }
  return {
    host: process.env.MYSQL_HOST || process.env.SQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || process.env.SQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || process.env.SQL_PASSWORD || '',
    database:
      process.env.MYSQL_DATABASE || process.env.SQL_DB_NAME || 'mweb_firebase_mysql_db',
    connectionUri: process.env.MYSQL_URL || '',
    ssl: false,
  };
}

function saveMySqlConfig(cfg: Partial<MySqlConnectionConfig>): MySqlConnectionConfig {
  const current = readMySqlConfig();
  const next: MySqlConnectionConfig = {
    host: (cfg.host ?? current.host).trim() || '127.0.0.1',
    port: Number(cfg.port || current.port || 3306),
    user: (cfg.user ?? current.user).trim() || 'root',
    password: cfg.password !== undefined ? cfg.password : current.password,
    database:
      (cfg.database ?? current.database).trim().replace(/[^a-zA-Z0-9_]/g, '_') ||
      'mweb_firebase_mysql_db',
    connectionUri: cfg.connectionUri !== undefined ? cfg.connectionUri.trim() : current.connectionUri,
    ssl: cfg.ssl !== undefined ? Boolean(cfg.ssl) : current.ssl,
  };
  try {
    fs.writeFileSync(MYSQL_CONFIG_FILE_PATH, JSON.stringify(next, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not save mysql-bridge-config.json:', err);
  }
  return next;
}

function writeMySqlDumpToDisk(masterData: Record<string, any>) {
  const cfg = readMySqlConfig();
  const sqlContent = generateMySqlDumpFromMasterData(masterData, {
    projectId: FIREBASE_PROJECT_ID,
    firestoreDatabaseId: FIRESTORE_DATABASE_ID,
    mysqlDatabase: cfg.database,
    mysqlHost: cfg.host,
    mysqlPort: cfg.port,
    mysqlUser: cfg.user,
  });
  try {
    fs.writeFileSync(ROOT_MYSQL_DUMP_PATH, sqlContent, 'utf-8');
  } catch (err) {
    console.warn('Could not write root database.sql:', err);
  }
  try {
    const pubDir = path.dirname(PUBLIC_MYSQL_DUMP_PATH);
    if (!fs.existsSync(pubDir)) {
      fs.mkdirSync(pubDir, { recursive: true });
    }
    fs.writeFileSync(PUBLIC_MYSQL_DUMP_PATH, sqlContent, 'utf-8');
  } catch (err) {
    console.warn('Could not write public/database.sql:', err);
  }
  return sqlContent;
}

async function tryExecuteLiveMySqlSync(
  masterData: Record<string, any>,
  direction: 'firebase_to_mysql' | 'mysql_to_firebase' | 'bidirectional' = 'bidirectional'
): Promise<{
  livePoolConnected: boolean;
  connectionMode: 'live_mysql_pool' | 'embedded_mysql_mirror';
  reconstructedFromMySql?: Record<string, any>;
  liveError?: string;
}> {
  const cfg = readMySqlConfig();
  const hasExplicitRemote =
    Boolean(cfg.connectionUri) ||
    Boolean(process.env.MYSQL_HOST) ||
    (cfg.host && cfg.host !== '127.0.0.1' && cfg.host !== 'localhost') ||
    Boolean(cfg.password);

  if (!hasExplicitRemote) {
    return {
      livePoolConnected: false,
      connectionMode: 'embedded_mysql_mirror',
    };
  }

  let connection: mysql.Connection | null = null;
  try {
    if (cfg.connectionUri) {
      connection = await mysql.createConnection({
        uri: cfg.connectionUri,
        connectTimeout: 3500,
        multipleStatements: true,
      });
    } else {
      connection = await mysql.createConnection({
        host: cfg.host,
        port: cfg.port || 3306,
        user: cfg.user,
        password: cfg.password || '',
        connectTimeout: 3500,
        multipleStatements: true,
        ...(cfg.ssl ? { ssl: { rejectUnauthorized: false } } : {}),
      });
    }

    const sqlDump = generateMySqlDumpFromMasterData(masterData, {
      projectId: FIREBASE_PROJECT_ID,
      firestoreDatabaseId: FIRESTORE_DATABASE_ID,
      mysqlDatabase: cfg.database,
      mysqlHost: cfg.host,
      mysqlPort: cfg.port,
      mysqlUser: cfg.user,
    });

    if (direction === 'mysql_to_firebase') {
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await connection.query(`USE \`${cfg.database}\`;`);
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT `section_key`, `payload_json` FROM `mweb_sections`;'
      );
      if (Array.isArray(rows) && rows.length > 0) {
        const reconstructed = reconstructMasterDataFromRelationalRows(
          rows as Array<{ section_key: string; payload_json: string }>,
          masterData
        );
        await connection.end();
        return {
          livePoolConnected: true,
          connectionMode: 'live_mysql_pool',
          reconstructedFromMySql: reconstructed,
        };
      }
    }

    await connection.query(sqlDump);
    await connection.end();
    return {
      livePoolConnected: true,
      connectionMode: 'live_mysql_pool',
    };
  } catch (err: any) {
    if (connection) {
      try {
        await connection.end();
      } catch {
        // ignore
      }
    }
    return {
      livePoolConnected: false,
      connectionMode: 'embedded_mysql_mirror',
      liveError: err?.message || String(err),
    };
  }
}

function readDataJsonFromDisk(): Record<string, any> {
  try {
    if (fs.existsSync(ROOT_DATA_JSON_PATH)) {
      const raw = fs.readFileSync(ROOT_DATA_JSON_PATH, 'utf-8');
      return JSON.parse(raw);
    }
    if (fs.existsSync(PUBLIC_DATA_JSON_PATH)) {
      const raw = fs.readFileSync(PUBLIC_DATA_JSON_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading data.json from disk:', err);
  }
  return {
    version: 1,
    updatedAt: null,
    platformSettings: {},
    siteMedia: [],
    paymentMethods: [],
    demoPlatforms: [],
    clientProjects: [],
    articles: [],
    socialLinks: [],
    customProjects: [],
    orders: [],
    liveChatThreads: [],
    aiMonitoredSessions: [],
    developerApplicants: [],
    adminPasscode: '100100',
  };
}

function writeDataJsonToDisk(dataObj: Record<string, any>): Record<string, any> {
  const payload = {
    ...dataObj,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
  const serialized = JSON.stringify(payload, null, 2);
  try {
    fs.writeFileSync(ROOT_DATA_JSON_PATH, serialized, 'utf-8');
  } catch (err) {
    console.warn('Could not write root data.json:', err);
  }
  try {
    const pubDir = path.dirname(PUBLIC_DATA_JSON_PATH);
    if (!fs.existsSync(pubDir)) {
      fs.mkdirSync(pubDir, { recursive: true });
    }
    fs.writeFileSync(PUBLIC_DATA_JSON_PATH, serialized, 'utf-8');
  } catch (err) {
    console.warn('Could not write public/data.json:', err);
  }
  // Automatically keep MySQL relational database (`database.sql` + MySQL Pool) synced with Firebase & data.json
  writeMySqlDumpToDisk(payload);
  tryExecuteLiveMySqlSync(payload, 'firebase_to_mysql').catch(() => {});
  return payload;
}

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || 'AIzaSyBon_dp_N8TBPIVAO8GnKZE7WrInNCYzpU';
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

function buildContentsFromHistory(
  history: Array<{ role?: string; text?: string; imageUrl?: string; imageMimeType?: string }>,
  currentMessage: string,
  imageUrl?: string,
  imageMimeType?: string
) {
  const contents: Array<{ role: string; parts: Array<Record<string, unknown>> }> = [];

  if (Array.isArray(history)) {
    for (const item of history.slice(-14)) {
      if (!item || (item.role !== 'user' && item.role !== 'model')) continue;
      const parts: Array<Record<string, unknown>> = [];
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
  app.use(express.json({ limit: '15mb' }));

  // Serve & Update persistent data.json across all devices
  app.get(['/api/data', '/data.json'], (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const data = readDataJsonFromDisk();
    return res.status(200).json(data);
  });

  app.post('/api/data', (req, res) => {
    try {
      const body = req.body || {};
      const current = readDataJsonFromDisk();

      let nextState: Record<string, any>;
      if (body.fullData && typeof body.fullData === 'object') {
        nextState = {
          ...current,
          ...body.fullData,
        };
      } else if (typeof body.section === 'string' && body.data !== undefined) {
        nextState = {
          ...current,
          [body.section]: body.data,
        };
      } else if (body.sections && typeof body.sections === 'object') {
        nextState = {
          ...current,
          ...body.sections,
        };
      } else {
        nextState = {
          ...current,
          ...body,
        };
      }

      const saved = writeDataJsonToDisk(nextState);
      const extracted = extractRelationalTablesFromMasterData(saved, {
        projectId: FIREBASE_PROJECT_ID,
        firestoreDatabaseId: FIRESTORE_DATABASE_ID,
        mysqlDatabase: readMySqlConfig().database,
      });
      return res.status(200).json({
        ok: true,
        updatedAt: saved.updatedAt,
        mysqlTotalRows: extracted.totalRows,
        data: saved,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return res.status(500).json({ ok: false, error: msg });
    }
  });

  // Ensure initial MySQL relational database dump (`database.sql`) is generated on server boot
  writeMySqlDumpToDisk(readDataJsonFromDisk());

  // Serve raw MySQL dump file (`database.sql`)
  app.get(['/api/mysql/dump', '/database.sql'], (_req, res) => {
    const currentData = readDataJsonFromDisk();
    const sqlDump = writeMySqlDumpToDisk(currentData);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Content-Type', 'application/sql; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="database.sql"');
    return res.status(200).send(sqlDump);
  });

  // Get Firebase <-> MySQL Bridge Status & Relational Table Metrics
  app.get('/api/mysql/status', async (_req, res) => {
    try {
      const currentData = readDataJsonFromDisk();
      const cfg = readMySqlConfig();
      const sqlDump = writeMySqlDumpToDisk(currentData);
      const extracted = extractRelationalTablesFromMasterData(currentData, {
        projectId: FIREBASE_PROJECT_ID,
        firestoreDatabaseId: FIRESTORE_DATABASE_ID,
        mysqlDatabase: cfg.database,
        mysqlHost: cfg.host,
        mysqlPort: cfg.port,
        mysqlUser: cfg.user,
      });

      return res.status(200).json({
        ok: true,
        bridgeActive: true,
        firebase: {
          projectId: FIREBASE_PROJECT_ID,
          firestoreDatabaseId: FIRESTORE_DATABASE_ID,
        },
        mysql: {
          host: cfg.host,
          port: cfg.port,
          user: cfg.user,
          database: cfg.database,
          hasPassword: Boolean(cfg.password),
          hasConnectionUri: Boolean(cfg.connectionUri),
          ssl: Boolean(cfg.ssl),
        },
        summaries: extracted.summaries,
        totalRows: extracted.totalRows,
        lastSyncedAt: extracted.meta.lastSyncedAt,
        sqlPreview: sqlDump.split('\n').slice(0, 65).join('\n'),
      });
    } catch (error: any) {
      return res.status(500).json({ ok: false, error: error?.message || String(error) });
    }
  });

  // Trigger bidirectional or targeted synchronization between Firebase Firestore and MySQL
  app.post('/api/mysql/sync', async (req, res) => {
    try {
      const { fullData, direction = 'bidirectional' } = req.body || {};
      let currentData = readDataJsonFromDisk();

      if (fullData && typeof fullData === 'object') {
        currentData = writeDataJsonToDisk({
          ...currentData,
          ...fullData,
        });
      } else {
        writeMySqlDumpToDisk(currentData);
      }

      const liveSyncResult = await tryExecuteLiveMySqlSync(currentData, direction);
      if (liveSyncResult.reconstructedFromMySql) {
        currentData = writeDataJsonToDisk(liveSyncResult.reconstructedFromMySql);
      }

      const cfg = readMySqlConfig();
      const sqlDump = writeMySqlDumpToDisk(currentData);
      const extracted = extractRelationalTablesFromMasterData(currentData, {
        projectId: FIREBASE_PROJECT_ID,
        firestoreDatabaseId: FIRESTORE_DATABASE_ID,
        mysqlDatabase: cfg.database,
        mysqlHost: cfg.host,
        mysqlPort: cfg.port,
        mysqlUser: cfg.user,
      });

      return res.status(200).json({
        ok: true,
        direction,
        connectionMode: liveSyncResult.connectionMode,
        livePoolConnected: liveSyncResult.livePoolConnected,
        liveNotice: liveSyncResult.liveError || null,
        firebase: {
          projectId: FIREBASE_PROJECT_ID,
          firestoreDatabaseId: FIRESTORE_DATABASE_ID,
        },
        mysql: {
          host: cfg.host,
          port: cfg.port,
          user: cfg.user,
          database: cfg.database,
        },
        summaries: extracted.summaries,
        totalRows: extracted.totalRows,
        lastSyncedAt: currentData.updatedAt || new Date().toISOString(),
        sqlPreview: sqlDump.split('\n').slice(0, 65).join('\n'),
        data: currentData,
      });
    } catch (error: any) {
      return res.status(500).json({ ok: false, error: error?.message || String(error) });
    }
  });

  // Save & Test MySQL Connection Configuration linked with Firebase
  app.post('/api/mysql/config', async (req, res) => {
    try {
      const savedCfg = saveMySqlConfig(req.body || {});
      const currentData = readDataJsonFromDisk();
      const sqlDump = writeMySqlDumpToDisk(currentData);
      const liveTest = await tryExecuteLiveMySqlSync(currentData, 'bidirectional');
      const extracted = extractRelationalTablesFromMasterData(currentData, {
        projectId: FIREBASE_PROJECT_ID,
        firestoreDatabaseId: FIRESTORE_DATABASE_ID,
        mysqlDatabase: savedCfg.database,
        mysqlHost: savedCfg.host,
        mysqlPort: savedCfg.port,
        mysqlUser: savedCfg.user,
      });

      return res.status(200).json({
        ok: true,
        connectionMode: liveTest.connectionMode,
        livePoolConnected: liveTest.livePoolConnected,
        liveNotice: liveTest.liveError || null,
        mysql: {
          host: savedCfg.host,
          port: savedCfg.port,
          user: savedCfg.user,
          database: savedCfg.database,
          hasPassword: Boolean(savedCfg.password),
          hasConnectionUri: Boolean(savedCfg.connectionUri),
          ssl: Boolean(savedCfg.ssl),
        },
        summaries: extracted.summaries,
        totalRows: extracted.totalRows,
        lastSyncedAt: extracted.meta.lastSyncedAt,
        sqlPreview: sqlDump.split('\n').slice(0, 65).join('\n'),
      });
    } catch (error: any) {
      return res.status(500).json({ ok: false, error: error?.message || String(error) });
    }
  });

  app.post('/api/gemini/chat', async (req, res) => {
    let brandNameAr = 'إم ويب';
    let brandNameEn = 'M Web';
    let whatsappPhone = '201000000000';
    try {
      const body = req.body || {};
      brandNameAr = body.brandNameAr || brandNameAr;
      brandNameEn = body.brandNameEn || brandNameEn;
      whatsappPhone = body.whatsappPhone || whatsappPhone;

      const {
        history = [],
        message = '',
        imageUrl,
        imageMimeType,
        mode = 'general',
      } = body;

      const ai = getGenAIClient();
      if (!ai) {
        return res.status(200).json({
          reply: '',
          fallback: true,
          error: 'GEMINI_API_KEY_MISSING',
          message: 'مفتاح Gemini API غير مضاف حالياً.',
        });
      }

      const modelsToTry = [
        mode === 'fast' ? 'gemini-3.1-flash-lite-preview' : 'gemini-3-flash-preview',
        'gemini-2.5-flash',
        'gemini-3-flash-preview',
        'gemini-3.1-flash-lite-preview',
      ];

      const contents = buildContentsFromHistory(history, message, imageUrl, imageMimeType);
      if (contents.length === 0) {
        return res.status(400).json({ error: 'EMPTY_MESSAGE', message: 'يرجى كتابة رسالة أو إرفاق صورة.' });
      }

      const systemInstruction = buildSystemInstruction(brandNameAr, brandNameEn, whatsappPhone);

      let replyText = '';
      let successfulModel = '';

      for (const m of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: m,
            contents,
            config: {
              systemInstruction,
            },
          });
          if (response && response.text) {
            replyText = response.text;
            successfulModel = m;
            break;
          }
        } catch (modelErr) {
          console.warn(`Model ${m} failed, trying next model:`, modelErr);
        }
      }

      if (!replyText) {
        // Fallback smart response if all models fail
        replyText = `أهلاً بك في ${brandNameAr} (${brandNameEn}) 🤖⚡\nنحن منصة برمجية متخصصة في تطوير وبناء المنصات الرقمية والمتاجر الإلكترونية والأنظمة السحابية الفورية.\n• يمكنك استعراض المنصات الجاهزة وتوليد رابطك الفوري على صيغة https://[platform]-m-web.vercel.app\n• للتواصل المباشر مع الدعم الفني: +${whatsappPhone}`;
        successfulModel = 'fallback-engine';
      }

      return res.json({
        reply: replyText,
        model: successfulModel,
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return res.status(200).json({
        reply: `أهلاً بك! لقد تلقينا استفسارك ويسعدنا مساعدتك في تطوير منصتك الرقمية الفورية عبر ${brandNameAr || 'إم ويب'}. اضغط على "طلب المنصة" أو تواصل معنا عبر الواتساب لتنفيذ مشروعك فوراً.`,
        fallback: true,
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
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
