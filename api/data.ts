import fs from 'fs';
import path from 'path';

const TMP_DATA_PATH = '/tmp/mweb_data.json';
const ROOT_DATA_PATH = path.resolve(process.cwd(), 'data.json');
const PUBLIC_DATA_PATH = path.resolve(process.cwd(), 'public', 'data.json');

function readCurrentData(): Record<string, any> {
  try {
    if (fs.existsSync(TMP_DATA_PATH)) {
      return JSON.parse(fs.readFileSync(TMP_DATA_PATH, 'utf-8'));
    }
    if (fs.existsSync(ROOT_DATA_PATH)) {
      return JSON.parse(fs.readFileSync(ROOT_DATA_PATH, 'utf-8'));
    }
    if (fs.existsSync(PUBLIC_DATA_PATH)) {
      return JSON.parse(fs.readFileSync(PUBLIC_DATA_PATH, 'utf-8'));
    }
  } catch (e) {
    console.warn('Error reading data.json in serverless route:', e);
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

function writeCurrentData(nextData: Record<string, any>): Record<string, any> {
  const payload = {
    ...nextData,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
  const serialized = JSON.stringify(payload, null, 2);
  try {
    fs.writeFileSync(TMP_DATA_PATH, serialized, 'utf-8');
  } catch {
    // ignore
  }
  try {
    fs.writeFileSync(ROOT_DATA_PATH, serialized, 'utf-8');
    fs.writeFileSync(PUBLIC_DATA_PATH, serialized, 'utf-8');
  } catch {
    // Vercel serverless root is read-only after build; /tmp + Firestore handle runtime persistence
  }
  return payload;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'GET') {
    const data = readCurrentData();
    return res.status(200).json(data);
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const current = readCurrentData();

      let nextState: Record<string, any>;
      if (body.fullData && typeof body.fullData === 'object') {
        nextState = { ...current, ...body.fullData };
      } else if (typeof body.section === 'string' && body.data !== undefined) {
        nextState = { ...current, [body.section]: body.data };
      } else if (body.sections && typeof body.sections === 'object') {
        nextState = { ...current, ...body.sections };
      } else {
        nextState = { ...current, ...body };
      }

      const saved = writeCurrentData(nextState);
      return res.status(200).json({
        ok: true,
        updatedAt: saved.updatedAt,
        data: saved,
      });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err?.message || 'Failed to update data.json' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
