/**
 * Unified `data.json` + Cloud Firestore Multi-Device Database Engine.
 *
 * Ensures that any edit made on one phone (Brand Settings, Published Videos/Images,
 * Demo Platforms, Client Projects, Articles, Payment Methods, Social Links,
 * Live Chat, AI Robot Logs, Orders, Applicants, Passcode) is immediately written
 * to `/data.json` (via `/api/data`) AND Cloud Firestore, and automatically loaded
 * on all other phones and devices.
 */

import { syncCatalogDocToFirestore, subscribeToSettingsDoc } from './firebase';
import {
  extractRelationalTablesFromMasterData,
  generateMySqlDumpFromMasterData,
  MySqlTableSummary,
} from '../utils/firebaseMysqlBridge';

export type DataJsonSectionKey =
  | 'platformSettings'
  | 'siteMedia'
  | 'paymentMethods'
  | 'demoPlatforms'
  | 'clientProjects'
  | 'articles'
  | 'socialLinks'
  | 'customProjects'
  | 'orders'
  | 'liveChatThreads'
  | 'aiMonitoredSessions'
  | 'developerApplicants'
  | 'adminPasscode';

export interface MasterDataJsonSchema {
  version: number;
  updatedAt: string | null;
  platformSettings?: Record<string, any>;
  siteMedia?: any[];
  paymentMethods?: any[];
  demoPlatforms?: any[];
  clientProjects?: any[];
  articles?: any[];
  socialLinks?: any[];
  customProjects?: any[];
  orders?: any[];
  liveChatThreads?: any[];
  aiMonitoredSessions?: any[];
  developerApplicants?: any[];
  adminPasscode?: string;
}

const SECTION_STORAGE_KEYS: Record<DataJsonSectionKey, string> = {
  platformSettings: 'mweb_platform_settings',
  siteMedia: 'mweb_site_media_v1',
  paymentMethods: 'mweb_payment_methods',
  demoPlatforms: 'webrex_demo_platforms_v1',
  clientProjects: 'webrex_client_projects_v1',
  articles: 'webrex_articles_v1',
  socialLinks: 'webrex_social_links',
  customProjects: 'webrex_custom_projects',
  orders: 'webrex_local_orders',
  liveChatThreads: 'mweb_live_chat_threads',
  aiMonitoredSessions: 'mweb_ai_monitored_sessions_v1',
  developerApplicants: 'webrex_developer_applicants',
  adminPasscode: 'webrex_admin_passcode',
};

export const DATA_JSON_SYNC_EVENT = 'mweb_data_json_synced';
export const AUTO_DATA_REFRESHED_EVENT = 'mweb_auto_data_refreshed';

function dispatchAllUIUpdateEvents(payload?: Partial<MasterDataJsonSchema>, isAutoNotification = false) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('storage'));
  if (payload?.platformSettings) {
    window.dispatchEvent(
      new CustomEvent('platform_settings_changed', { detail: payload.platformSettings })
    );
  } else {
    window.dispatchEvent(new CustomEvent('platform_settings_changed'));
  }
  if (payload?.siteMedia) {
    window.dispatchEvent(new CustomEvent('mweb_site_media_changed', { detail: payload.siteMedia }));
  } else {
    window.dispatchEvent(new CustomEvent('mweb_site_media_changed'));
  }
  if (payload?.paymentMethods) {
    window.dispatchEvent(
      new CustomEvent('mweb_payment_methods_changed', { detail: payload.paymentMethods })
    );
  }
  window.dispatchEvent(new Event('webrex_social_links_updated'));
  window.dispatchEvent(new CustomEvent('live_chat_updated'));
  window.dispatchEvent(new CustomEvent('mweb_ai_monitor_updated'));
  window.dispatchEvent(new CustomEvent('developer_applicants_updated'));
  window.dispatchEvent(new CustomEvent(DATA_JSON_SYNC_EVENT, { detail: payload }));
  if (isAutoNotification) {
    window.dispatchEvent(new CustomEvent(AUTO_DATA_REFRESHED_EVENT, { detail: payload }));
  }
}

/**
 * Applies a MasterDataJsonSchema object into localStorage and triggers UI refresh events.
 */
export function applyDataToLocalCache(data: MasterDataJsonSchema) {
  let isNewerUpdate = false;
  try {
    const prevTs = localStorage.getItem('mweb_data_json_updated_at');
    if (data.updatedAt && data.updatedAt !== prevTs) {
      isNewerUpdate = Boolean(prevTs); // true if we already had a previous version
      localStorage.setItem('mweb_data_json_updated_at', data.updatedAt);
    }

    if (data.platformSettings && typeof data.platformSettings === 'object' && Object.keys(data.platformSettings).length > 0) {
      localStorage.setItem(
        SECTION_STORAGE_KEYS.platformSettings,
        JSON.stringify(data.platformSettings)
      );
      if (typeof data.platformSettings.liveChatEnabled === 'boolean') {
        localStorage.setItem('webrex_chat_enabled', JSON.stringify(data.platformSettings.liveChatEnabled));
      }
    }
    if (Array.isArray(data.siteMedia)) {
      localStorage.setItem(SECTION_STORAGE_KEYS.siteMedia, JSON.stringify(data.siteMedia));
    }
    if (Array.isArray(data.paymentMethods) && data.paymentMethods.length > 0) {
      localStorage.setItem(
        SECTION_STORAGE_KEYS.paymentMethods,
        JSON.stringify(data.paymentMethods)
      );
    }
    if (Array.isArray(data.demoPlatforms)) {
      localStorage.setItem(SECTION_STORAGE_KEYS.demoPlatforms, JSON.stringify(data.demoPlatforms));
    }
    if (Array.isArray(data.clientProjects)) {
      localStorage.setItem(
        SECTION_STORAGE_KEYS.clientProjects,
        JSON.stringify(data.clientProjects)
      );
    }
    if (Array.isArray(data.articles)) {
      localStorage.setItem(SECTION_STORAGE_KEYS.articles, JSON.stringify(data.articles));
    }
    if (Array.isArray(data.socialLinks) && data.socialLinks.length > 0) {
      localStorage.setItem(SECTION_STORAGE_KEYS.socialLinks, JSON.stringify(data.socialLinks));
    }
    if (Array.isArray(data.customProjects)) {
      localStorage.setItem(
        SECTION_STORAGE_KEYS.customProjects,
        JSON.stringify(data.customProjects)
      );
    }
    if (Array.isArray(data.orders)) {
      localStorage.setItem(SECTION_STORAGE_KEYS.orders, JSON.stringify(data.orders));
    }
    if (Array.isArray(data.liveChatThreads)) {
      localStorage.setItem(
        SECTION_STORAGE_KEYS.liveChatThreads,
        JSON.stringify(data.liveChatThreads)
      );
    }
    if (Array.isArray(data.aiMonitoredSessions)) {
      localStorage.setItem(
        SECTION_STORAGE_KEYS.aiMonitoredSessions,
        JSON.stringify(data.aiMonitoredSessions)
      );
    }
    if (Array.isArray(data.developerApplicants)) {
      localStorage.setItem(
        SECTION_STORAGE_KEYS.developerApplicants,
        JSON.stringify(data.developerApplicants)
      );
    }
    if (typeof data.adminPasscode === 'string' && data.adminPasscode.trim().length >= 4) {
      localStorage.setItem(SECTION_STORAGE_KEYS.adminPasscode, data.adminPasscode.trim());
    }
  } catch (e) {
    console.warn('Error applying data.json to local cache:', e);
  }

  dispatchAllUIUpdateEvents(data, isNewerUpdate);
}

/**
 * Collects the current state of all sections from localStorage into a full MasterDataJsonSchema object.
 */
export function buildMasterDataFromLocalCache(): MasterDataJsonSchema {
  const readJson = <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const passcode =
    typeof window !== 'undefined'
      ? localStorage.getItem(SECTION_STORAGE_KEYS.adminPasscode) || '100100'
      : '100100';

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    platformSettings: readJson(SECTION_STORAGE_KEYS.platformSettings, {}),
    siteMedia: readJson(SECTION_STORAGE_KEYS.siteMedia, []),
    paymentMethods: readJson(SECTION_STORAGE_KEYS.paymentMethods, []),
    demoPlatforms: readJson(SECTION_STORAGE_KEYS.demoPlatforms, []),
    clientProjects: readJson(SECTION_STORAGE_KEYS.clientProjects, []),
    articles: readJson(SECTION_STORAGE_KEYS.articles, []),
    socialLinks: readJson(SECTION_STORAGE_KEYS.socialLinks, []),
    customProjects: readJson(SECTION_STORAGE_KEYS.customProjects, []),
    orders: readJson(SECTION_STORAGE_KEYS.orders, []),
    liveChatThreads: readJson(SECTION_STORAGE_KEYS.liveChatThreads, []),
    aiMonitoredSessions: readJson(SECTION_STORAGE_KEYS.aiMonitoredSessions, []),
    developerApplicants: readJson(SECTION_STORAGE_KEYS.developerApplicants, []),
    adminPasscode: passcode,
  };
}

/**
 * Checks if this device has any non-default local customizations in localStorage.
 */
function hasLocalCustomizations(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(
      localStorage.getItem(SECTION_STORAGE_KEYS.platformSettings) ||
        localStorage.getItem(SECTION_STORAGE_KEYS.siteMedia) ||
        localStorage.getItem(SECTION_STORAGE_KEYS.demoPlatforms) ||
        localStorage.getItem(SECTION_STORAGE_KEYS.clientProjects) ||
        localStorage.getItem(SECTION_STORAGE_KEYS.articles)
    );
  } catch {
    return false;
  }
}

/**
 * Updates a specific section in `/data.json` via `POST /api/data` AND in Cloud Firestore.
 */
export async function syncSectionToDataJson(
  section: DataJsonSectionKey,
  data: any
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // 1. Sync to Cloud Firestore section doc (`settings/data_sec_${section}`)
  syncCatalogDocToFirestore('settings', `data_sec_${section}`, {
    section,
    value: data,
    updatedAtIso: new Date().toISOString(),
  }).catch((e) => console.warn(`Firestore section sync notice (${section}):`, e));

  // 2. Sync to `/data.json` on the server via `POST /api/data`
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, data }),
    });
    if (response.ok) {
      const resJson = await response.json();
      if (resJson?.updatedAt) {
        localStorage.setItem('mweb_data_json_updated_at', resJson.updatedAt);
      }
      return true;
    }
  } catch (e) {
    console.warn(`Could not POST section ${section} to /api/data:`, e);
  }
  return false;
}

/**
 * Pushes ALL current device data to `/data.json` (`POST /api/data`) AND Cloud Firestore.
 */
export async function pushAllLocalStateToDataJsonAndCloud(): Promise<{
  ok: boolean;
  updatedAt: string;
}> {
  const fullData = buildMasterDataFromLocalCache();
  const nowIso = new Date().toISOString();

  // Push each section to Cloud Firestore
  const sections: DataJsonSectionKey[] = [
    'platformSettings',
    'siteMedia',
    'paymentMethods',
    'demoPlatforms',
    'clientProjects',
    'articles',
    'socialLinks',
    'customProjects',
    'orders',
    'liveChatThreads',
    'aiMonitoredSessions',
    'developerApplicants',
    'adminPasscode',
  ];

  await Promise.allSettled(
    sections.map((sec) =>
      syncCatalogDocToFirestore('settings', `data_sec_${sec}`, {
        section: sec,
        value: fullData[sec],
        updatedAtIso: nowIso,
      })
    )
  );

  // Push full object to `/api/data` (`data.json`)
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullData }),
    });
    if (res.ok) {
      const json = await res.json();
      const ts = json?.updatedAt || nowIso;
      localStorage.setItem('mweb_data_json_updated_at', ts);
      return { ok: true, updatedAt: ts };
    }
  } catch (e) {
    console.warn('Notice pushing fullData to /api/data:', e);
  }

  return { ok: true, updatedAt: nowIso };
}

/**
 * Fetches `/api/data` (or `/data.json`) from the server and hydrates local state.
 * If the server's `data.json` has `updatedAt === null` and this phone already has
 * local edits in `localStorage`, it automatically seeds `data.json` with this phone's edits!
 */
export async function fetchAndHydrateFromDataJson(): Promise<MasterDataJsonSchema | null> {
  if (typeof window === 'undefined') return null;

  try {
    let res = await fetch(`/api/data?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      res = await fetch(`/data.json?t=${Date.now()}`, {
        cache: 'no-store',
      });
    }
    if (!res.ok) return null;

    const serverData: MasterDataJsonSchema = await res.json();
    if (!serverData || typeof serverData !== 'object') return null;

    // If server data.json has never been updated yet (updatedAt === null),
    // and this phone already has local edits, push this phone's edits to data.json!
    if (!serverData.updatedAt && hasLocalCustomizations()) {
      await pushAllLocalStateToDataJsonAndCloud();
      return buildMasterDataFromLocalCache();
    }

    // If server data.json has been updated by an admin on any phone, apply it immediately!
    if (serverData.updatedAt) {
      applyDataToLocalCache(serverData);
    }
    return serverData;
  } catch (e) {
    console.warn('Could not fetch /api/data:', e);
    return null;
  }
}

/**
 * Sets up real-time listeners on Cloud Firestore (`settings/data_sec_*`) + `/api/data` polling on focus
 * so changes made on Phone 1 appear on Phone 2 in real time.
 */
let initializedListeners = false;
export function initDataJsonRealtimeSync(): void {
  if (typeof window === 'undefined' || initializedListeners) return;
  initializedListeners = true;

  // 1. Initial fetch from /api/data (data.json)
  fetchAndHydrateFromDataJson();

  // 2. Subscribe to real-time Cloud Firestore section docs for instant cross-phone sync
  const watchedSections: DataJsonSectionKey[] = [
    'platformSettings',
    'siteMedia',
    'paymentMethods',
    'demoPlatforms',
    'clientProjects',
    'articles',
    'socialLinks',
    'customProjects',
    'orders',
    'liveChatThreads',
    'aiMonitoredSessions',
    'developerApplicants',
    'adminPasscode',
  ];

  watchedSections.forEach((sec) => {
    subscribeToSettingsDoc<{ section: DataJsonSectionKey; value: any; updatedAtIso?: string }>(
      `data_sec_${sec}`,
      (docPayload) => {
        if (docPayload && docPayload.value !== undefined) {
          applyDataToLocalCache({
            [sec]: docPayload.value,
            updatedAt: docPayload.updatedAtIso || new Date().toISOString(),
            version: 1,
          });
        }
      }
    );
  });

  // 3. Fast real-time background polling interval (2.5s) to detect updates across all devices
  setInterval(() => {
    fetchAndHydrateFromDataJson();
  }, 2500);

  // 4. Re-fetch when user switches back to the browser tab or unlocks their phone
  window.addEventListener('focus', () => {
    fetchAndHydrateFromDataJson();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchAndHydrateFromDataJson();
    }
  });
}

/**
 * Downloads the current `data.json` file to the user's device.
 */
export function downloadDataJsonBackup(): void {
  if (typeof window === 'undefined') return;
  const master = buildMasterDataFromLocalCache();
  const blob = new Blob([JSON.stringify(master, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports a `data.json` string, applies it locally, and syncs it to `/data.json` + Cloud Firestore.
 */
export async function importDataJsonContent(rawJson: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, error: 'ملف data.json غير صالح.' };
    }
    applyDataToLocalCache({ ...parsed, version: 1 });
    await pushAllLocalStateToDataJsonAndCloud();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'تعذر قراءة ملف data.json' };
  }
}

export interface FirebaseMysqlStatusResponse {
  ok: boolean;
  bridgeActive: boolean;
  connectionMode?: 'live_mysql_pool' | 'embedded_mysql_mirror';
  livePoolConnected?: boolean;
  liveNotice?: string | null;
  firebase: {
    projectId: string;
    firestoreDatabaseId: string;
  };
  mysql: {
    host: string;
    port: number;
    user: string;
    database: string;
    hasPassword?: boolean;
    hasConnectionUri?: boolean;
    ssl?: boolean;
  };
  summaries: MySqlTableSummary[];
  totalRows: number;
  lastSyncedAt: string | null;
  sqlPreview: string;
}

export async function fetchFirebaseMysqlBridgeStatus(): Promise<FirebaseMysqlStatusResponse> {
  try {
    const res = await fetch(`/api/mysql/status?t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Fallback to local relational compiler for MySQL status:', e);
  }

  const localMaster = buildMasterDataFromLocalCache();
  const extracted = extractRelationalTablesFromMasterData(localMaster);
  const sqlDump = generateMySqlDumpFromMasterData(localMaster);
  return {
    ok: true,
    bridgeActive: true,
    connectionMode: 'embedded_mysql_mirror',
    firebase: {
      projectId: extracted.meta.projectId,
      firestoreDatabaseId: extracted.meta.firestoreDatabaseId,
    },
    mysql: {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      database: extracted.meta.mysqlDatabase,
    },
    summaries: extracted.summaries,
    totalRows: extracted.totalRows,
    lastSyncedAt: extracted.meta.lastSyncedAt || new Date().toISOString(),
    sqlPreview: sqlDump.split('\n').slice(0, 65).join('\n'),
  };
}

export async function syncFirebaseWithMySqlBridge(
  direction: 'firebase_to_mysql' | 'mysql_to_firebase' | 'bidirectional' = 'bidirectional'
): Promise<FirebaseMysqlStatusResponse> {
  const fullData = buildMasterDataFromLocalCache();

  // First ensure Firebase Firestore has the latest state when pushing from Firebase -> MySQL or bidirectional
  if (direction !== 'mysql_to_firebase') {
    await pushAllLocalStateToDataJsonAndCloud();
  }

  try {
    const res = await fetch('/api/mysql/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullData, direction }),
    });
    if (res.ok) {
      const json = await res.json();
      if (direction === 'mysql_to_firebase' && json.data) {
        applyDataToLocalCache({ ...json.data, version: 1 });
        await pushAllLocalStateToDataJsonAndCloud();
      }
      return json;
    }
  } catch (e) {
    console.warn('Notice syncing with /api/mysql/sync:', e);
  }

  return fetchFirebaseMysqlBridgeStatus();
}

export async function saveMySqlBridgeConnectionConfig(config: {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  connectionUri?: string;
  ssl?: boolean;
}): Promise<FirebaseMysqlStatusResponse> {
  try {
    // Also store config metadata in Firebase Firestore (`settings/mysql_bridge_config`)
    await syncCatalogDocToFirestore('settings', 'mysql_bridge_config', {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database,
      ssl: Boolean(config.ssl),
      updatedAtIso: new Date().toISOString(),
    }).catch(() => {});

    const res = await fetch('/api/mysql/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Notice saving MySQL bridge config:', e);
  }
  return fetchFirebaseMysqlBridgeStatus();
}

export function downloadMySqlDatabaseDump(): void {
  if (typeof window === 'undefined') return;
  const master = buildMasterDataFromLocalCache();
  const sqlContent = generateMySqlDumpFromMasterData(master);
  const blob = new Blob([sqlContent], {
    type: 'application/sql;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'database.sql';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

