/**
 * Pure relational compiler & bidirectional synchronization helper
 * bridging Firebase Firestore (`ai-studio-mweb-...`) <-> MySQL Relational Database.
 */

export interface FirebaseMysqlBridgeMeta {
  projectId: string;
  firestoreDatabaseId: string;
  mysqlDatabase: string;
  mysqlHost?: string;
  mysqlPort?: number;
  mysqlUser?: string;
  connectionMode?: 'live_mysql_pool' | 'embedded_mysql_mirror';
  lastSyncedAt?: string;
}

export interface MySqlTableSummary {
  tableName: string;
  descriptionAr: string;
  firebaseCollection: string;
  rowCount: number;
}

export interface ExtractedMySqlRelationalState {
  meta: FirebaseMysqlBridgeMeta;
  tables: {
    mweb_sections: Array<{
      section_key: string;
      firebase_doc_path: string;
      payload_json: string;
      updated_at: string;
    }>;
    mweb_site_media: Array<{
      id: string;
      section: string;
      type: string;
      title: string;
      url: string;
      visible: number;
      order_index: number;
      updated_at: string;
    }>;
    mweb_demo_platforms: Array<{
      id: string;
      title: string;
      category: string;
      live_url: string;
      monthly_price: number;
      lifetime_price: number;
      payload_json: string;
      updated_at: string;
    }>;
    mweb_client_projects: Array<{
      id: string;
      title: string;
      client_name: string;
      industry: string;
      live_url: string;
      payload_json: string;
      updated_at: string;
    }>;
    mweb_articles: Array<{
      id: string;
      title: string;
      category: string;
      author_name: string;
      payload_json: string;
      updated_at: string;
    }>;
    mweb_payment_methods: Array<{
      id: string;
      category: string;
      name_ar: string;
      name_en: string;
      enabled: number;
      payload_json: string;
      updated_at: string;
    }>;
    mweb_orders: Array<{
      id: string;
      customer_name: string;
      customer_phone: string;
      details: string;
      created_at: string;
    }>;
  };
  summaries: MySqlTableSummary[];
  totalRows: number;
}

const DEFAULT_META: FirebaseMysqlBridgeMeta = {
  projectId: 'gen-lang-client-0338286610',
  firestoreDatabaseId: 'ai-studio-mweb-9784d1ea-1fec-4441-8f06-0f6c5fb8dcb5',
  mysqlDatabase: 'mweb_firebase_mysql_db',
};

/**
 * Safely escapes a value for MySQL SQL string literals.
 */
export function escapeSqlString(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '0';
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  const str = String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\x1a/g, '\\Z');
  return `'${str}'`;
}

export function toMySqlDateTime(isoOrDate?: string | null): string {
  try {
    const d = isoOrDate ? new Date(isoOrDate) : new Date();
    if (Number.isNaN(d.getTime())) {
      return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    return d.toISOString().slice(0, 19).replace('T', ' ');
  } catch {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
}

const SECTION_KEYS = [
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
] as const;

/**
 * Extracts normalized MySQL relational table rows from Firebase / MasterData state.
 */
export function extractRelationalTablesFromMasterData(
  masterData: Record<string, any>,
  customMeta?: Partial<FirebaseMysqlBridgeMeta>
): ExtractedMySqlRelationalState {
  const safeMaster = masterData && typeof masterData === 'object' ? masterData : {};
  const nowSql = toMySqlDateTime(safeMaster.updatedAt);
  const meta: FirebaseMysqlBridgeMeta = {
    ...DEFAULT_META,
    ...customMeta,
    lastSyncedAt: safeMaster.updatedAt || new Date().toISOString(),
  };

  const mweb_sections = SECTION_KEYS.map((key) => {
    const val = safeMaster[key] !== undefined ? safeMaster[key] : key === 'platformSettings' ? {} : key === 'adminPasscode' ? '100100' : [];
    return {
      section_key: key,
      firebase_doc_path: `settings/data_sec_${key}`,
      payload_json: JSON.stringify(val),
      updated_at: nowSql,
    };
  });

  const siteMediaArr = Array.isArray(safeMaster.siteMedia) ? safeMaster.siteMedia : [];
  const mweb_site_media = siteMediaArr.map((item: any, idx: number) => ({
    id: String(item?.id || `media_${idx + 1}`).slice(0, 120),
    section: String(item?.section || 'hero').slice(0, 64),
    type: String(item?.type || 'video').slice(0, 32),
    title: String(item?.title || '').slice(0, 250),
    url: String(item?.url || ''),
    visible: item?.visible === false ? 0 : 1,
    order_index: typeof item?.order === 'number' ? item.order : idx,
    updated_at: toMySqlDateTime(item?.createdAt || safeMaster.updatedAt),
  }));

  const demoPlatformsArr = Array.isArray(safeMaster.demoPlatforms) ? safeMaster.demoPlatforms : [];
  const mweb_demo_platforms = demoPlatformsArr.map((item: any, idx: number) => ({
    id: String(item?.id || `demo_${idx + 1}`).slice(0, 120),
    title: String(item?.title || '').slice(0, 250),
    category: String(item?.category || '').slice(0, 120),
    live_url: String(item?.liveUrl || '').slice(0, 1000),
    monthly_price: Number(item?.pricing?.monthly || 0),
    lifetime_price: Number(item?.pricing?.lifetime || 0),
    payload_json: JSON.stringify(item || {}),
    updated_at: nowSql,
  }));

  const clientProjectsArr = Array.isArray(safeMaster.clientProjects) ? safeMaster.clientProjects : [];
  const mweb_client_projects = clientProjectsArr.map((item: any, idx: number) => ({
    id: String(item?.id || `cp_${idx + 1}`).slice(0, 120),
    title: String(item?.title || '').slice(0, 250),
    client_name: String(item?.clientName || '').slice(0, 250),
    industry: String(item?.industry || '').slice(0, 120),
    live_url: String(item?.liveUrl || '').slice(0, 1000),
    payload_json: JSON.stringify(item || {}),
    updated_at: nowSql,
  }));

  const articlesArr = Array.isArray(safeMaster.articles) ? safeMaster.articles : [];
  const mweb_articles = articlesArr.map((item: any, idx: number) => ({
    id: String(item?.id || `art_${idx + 1}`).slice(0, 120),
    title: String(item?.title || '').slice(0, 250),
    category: String(item?.category || '').slice(0, 120),
    author_name: String(item?.authorName || '').slice(0, 120),
    payload_json: JSON.stringify(item || {}),
    updated_at: nowSql,
  }));

  const paymentMethodsArr = Array.isArray(safeMaster.paymentMethods) ? safeMaster.paymentMethods : [];
  const mweb_payment_methods = paymentMethodsArr.map((item: any, idx: number) => ({
    id: String(item?.id || `pm_${idx + 1}`).slice(0, 120),
    category: String(item?.category || 'instapay-wallets').slice(0, 64),
    name_ar: String(item?.nameAr || '').slice(0, 250),
    name_en: String(item?.nameEn || '').slice(0, 250),
    enabled: item?.enabled === false ? 0 : 1,
    payload_json: JSON.stringify(item || {}),
    updated_at: nowSql,
  }));

  const ordersArr = Array.isArray(safeMaster.orders) ? safeMaster.orders : [];
  const mweb_orders = ordersArr.map((item: any, idx: number) => ({
    id: String(item?.id || `ORD_${idx + 1}`).slice(0, 120),
    customer_name: String(item?.name || '').slice(0, 250),
    customer_phone: String(item?.phone || '').slice(0, 64),
    details: String(item?.details || ''),
    created_at: toMySqlDateTime(item?.timestamp || safeMaster.updatedAt),
  }));

  const summaries: MySqlTableSummary[] = [
    {
      tableName: 'mweb_sections',
      descriptionAr: 'جدول أقسام وإعدادات المنصة المربوط بـ Firebase Settings',
      firebaseCollection: 'settings/data_sec_*',
      rowCount: mweb_sections.length,
    },
    {
      tableName: 'mweb_site_media',
      descriptionAr: 'جدول الفيديوهات والصور المنشورة في أقسام الموقع',
      firebaseCollection: 'settings/site_media',
      rowCount: mweb_site_media.length,
    },
    {
      tableName: 'mweb_demo_platforms',
      descriptionAr: 'جدول المنصات الجاهزة للمعاينة والأسعار',
      firebaseCollection: 'demo_platforms',
      rowCount: mweb_demo_platforms.length,
    },
    {
      tableName: 'mweb_client_projects',
      descriptionAr: 'جدول سابقة أعمال ومشاريع العملاء',
      firebaseCollection: 'client_projects',
      rowCount: mweb_client_projects.length,
    },
    {
      tableName: 'mweb_articles',
      descriptionAr: 'جدول المقالات التقنية والمدونة',
      firebaseCollection: 'articles',
      rowCount: mweb_articles.length,
    },
    {
      tableName: 'mweb_payment_methods',
      descriptionAr: 'جدول وسائل الدفع وبوابة كاشير وانستا باي',
      firebaseCollection: 'payment_methods',
      rowCount: mweb_payment_methods.length,
    },
    {
      tableName: 'mweb_orders',
      descriptionAr: 'جدول طلبات العملاء الواردة',
      firebaseCollection: 'orders',
      rowCount: mweb_orders.length,
    },
  ];

  const totalRows = summaries.reduce((acc, item) => acc + item.rowCount, 0);

  return {
    meta,
    tables: {
      mweb_sections,
      mweb_site_media,
      mweb_demo_platforms,
      mweb_client_projects,
      mweb_articles,
      mweb_payment_methods,
      mweb_orders,
    },
    summaries,
    totalRows,
  };
}

/**
 * Generates a complete, valid MySQL SQL Dump (`database.sql`) with DDL + Upsert DML
 * synchronized with Firebase Firestore (`ai-studio-mweb-...`).
 */
export function generateMySqlDumpFromMasterData(
  masterData: Record<string, any>,
  customMeta?: Partial<FirebaseMysqlBridgeMeta>
): string {
  const extracted = extractRelationalTablesFromMasterData(masterData, customMeta);
  const dbName = extracted.meta.mysqlDatabase.replace(/[^a-zA-Z0-9_]/g, '_') || 'mweb_firebase_mysql_db';
  const lines: string[] = [];

  lines.push('-- ============================================================================');
  lines.push('-- M Web (إم ويب) - Firebase Firestore <-> MySQL Relational Database Bridge');
  lines.push(`-- Firebase Project ID   : ${extracted.meta.projectId}`);
  lines.push(`-- Firestore Database ID : ${extracted.meta.firestoreDatabaseId}`);
  lines.push(`-- MySQL Database Name   : ${dbName}`);
  lines.push(`-- Last Synced Timestamp : ${extracted.meta.lastSyncedAt}`);
  lines.push(`-- Total Relational Rows : ${extracted.totalRows}`);
  lines.push('-- ============================================================================');
  lines.push('');
  lines.push('SET NAMES utf8mb4;');
  lines.push('SET time_zone = "+00:00";');
  lines.push('SET foreign_key_checks = 0;');
  lines.push('');
  lines.push(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  lines.push(`USE \`${dbName}\`;`);
  lines.push('');

  // 1. Bridge Metadata Table
  lines.push('CREATE TABLE IF NOT EXISTS `mweb_firebase_sync_meta` (');
  lines.push('  `id` INT NOT NULL DEFAULT 1 PRIMARY KEY,');
  lines.push('  `firebase_project_id` VARCHAR(128) NOT NULL,');
  lines.push('  `firestore_database_id` VARCHAR(191) NOT NULL,');
  lines.push('  `mysql_database_name` VARCHAR(128) NOT NULL,');
  lines.push('  `total_rows` INT NOT NULL DEFAULT 0,');
  lines.push('  `last_synced_at` DATETIME NOT NULL');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');
  lines.push(
    `INSERT INTO \`mweb_firebase_sync_meta\` (\`id\`, \`firebase_project_id\`, \`firestore_database_id\`, \`mysql_database_name\`, \`total_rows\`, \`last_synced_at\`) VALUES (1, ${escapeSqlString(
      extracted.meta.projectId
    )}, ${escapeSqlString(extracted.meta.firestoreDatabaseId)}, ${escapeSqlString(dbName)}, ${
      extracted.totalRows
    }, ${escapeSqlString(toMySqlDateTime(extracted.meta.lastSyncedAt))}) ON DUPLICATE KEY UPDATE \`firebase_project_id\` = VALUES(\`firebase_project_id\`), \`firestore_database_id\` = VALUES(\`firestore_database_id\`), \`total_rows\` = VALUES(\`total_rows\`), \`last_synced_at\` = VALUES(\`last_synced_at\`);`
  );
  lines.push('');

  // 2. mweb_sections
  lines.push('CREATE TABLE IF NOT EXISTS `mweb_sections` (');
  lines.push('  `section_key` VARCHAR(64) NOT NULL PRIMARY KEY,');
  lines.push('  `firebase_doc_path` VARCHAR(191) NOT NULL,');
  lines.push('  `payload_json` LONGTEXT NOT NULL,');
  lines.push('  `updated_at` DATETIME NOT NULL');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');
  for (const row of extracted.tables.mweb_sections) {
    lines.push(
      `INSERT INTO \`mweb_sections\` (\`section_key\`, \`firebase_doc_path\`, \`payload_json\`, \`updated_at\`) VALUES (${escapeSqlString(
        row.section_key
      )}, ${escapeSqlString(row.firebase_doc_path)}, ${escapeSqlString(
        row.payload_json
      )}, ${escapeSqlString(
        row.updated_at
      )}) ON DUPLICATE KEY UPDATE \`firebase_doc_path\` = VALUES(\`firebase_doc_path\`), \`payload_json\` = VALUES(\`payload_json\`), \`updated_at\` = VALUES(\`updated_at\`);`
    );
  }
  lines.push('');

  // 3. mweb_site_media
  lines.push('CREATE TABLE IF NOT EXISTS `mweb_site_media` (');
  lines.push('  `id` VARCHAR(128) NOT NULL PRIMARY KEY,');
  lines.push('  `section` VARCHAR(64) NOT NULL,');
  lines.push('  `type` VARCHAR(32) NOT NULL,');
  lines.push('  `title` VARCHAR(255) NOT NULL,');
  lines.push('  `url` LONGTEXT NOT NULL,');
  lines.push('  `visible` TINYINT(1) NOT NULL DEFAULT 1,');
  lines.push('  `order_index` INT NOT NULL DEFAULT 0,');
  lines.push('  `updated_at` DATETIME NOT NULL');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');
  for (const row of extracted.tables.mweb_site_media) {
    lines.push(
      `INSERT INTO \`mweb_site_media\` (\`id\`, \`section\`, \`type\`, \`title\`, \`url\`, \`visible\`, \`order_index\`, \`updated_at\`) VALUES (${escapeSqlString(
        row.id
      )}, ${escapeSqlString(row.section)}, ${escapeSqlString(row.type)}, ${escapeSqlString(
        row.title
      )}, ${escapeSqlString(row.url)}, ${row.visible}, ${row.order_index}, ${escapeSqlString(
        row.updated_at
      )}) ON DUPLICATE KEY UPDATE \`section\` = VALUES(\`section\`), \`type\` = VALUES(\`type\`), \`title\` = VALUES(\`title\`), \`url\` = VALUES(\`url\`), \`visible\` = VALUES(\`visible\`), \`order_index\` = VALUES(\`order_index\`), \`updated_at\` = VALUES(\`updated_at\`);`
    );
  }
  lines.push('');

  // 4. mweb_demo_platforms
  lines.push('CREATE TABLE IF NOT EXISTS `mweb_demo_platforms` (');
  lines.push('  `id` VARCHAR(128) NOT NULL PRIMARY KEY,');
  lines.push('  `title` VARCHAR(255) NOT NULL,');
  lines.push('  `category` VARCHAR(128) NOT NULL,');
  lines.push('  `live_url` VARCHAR(1024) NOT NULL,');
  lines.push('  `monthly_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,');
  lines.push('  `lifetime_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,');
  lines.push('  `payload_json` LONGTEXT NOT NULL,');
  lines.push('  `updated_at` DATETIME NOT NULL');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');
  for (const row of extracted.tables.mweb_demo_platforms) {
    lines.push(
      `INSERT INTO \`mweb_demo_platforms\` (\`id\`, \`title\`, \`category\`, \`live_url\`, \`monthly_price\`, \`lifetime_price\`, \`payload_json\`, \`updated_at\`) VALUES (${escapeSqlString(
        row.id
      )}, ${escapeSqlString(row.title)}, ${escapeSqlString(row.category)}, ${escapeSqlString(
        row.live_url
      )}, ${row.monthly_price}, ${row.lifetime_price}, ${escapeSqlString(
        row.payload_json
      )}, ${escapeSqlString(
        row.updated_at
      )}) ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`), \`category\` = VALUES(\`category\`), \`live_url\` = VALUES(\`live_url\`), \`monthly_price\` = VALUES(\`monthly_price\`), \`lifetime_price\` = VALUES(\`lifetime_price\`), \`payload_json\` = VALUES(\`payload_json\`), \`updated_at\` = VALUES(\`updated_at\`);`
    );
  }
  lines.push('');

  // 5. mweb_client_projects
  lines.push('CREATE TABLE IF NOT EXISTS `mweb_client_projects` (');
  lines.push('  `id` VARCHAR(128) NOT NULL PRIMARY KEY,');
  lines.push('  `title` VARCHAR(255) NOT NULL,');
  lines.push('  `client_name` VARCHAR(255) NOT NULL,');
  lines.push('  `industry` VARCHAR(128) NOT NULL,');
  lines.push('  `live_url` VARCHAR(1024) NOT NULL,');
  lines.push('  `payload_json` LONGTEXT NOT NULL,');
  lines.push('  `updated_at` DATETIME NOT NULL');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');
  for (const row of extracted.tables.mweb_client_projects) {
    lines.push(
      `INSERT INTO \`mweb_client_projects\` (\`id\`, \`title\`, \`client_name\`, \`industry\`, \`live_url\`, \`payload_json\`, \`updated_at\`) VALUES (${escapeSqlString(
        row.id
      )}, ${escapeSqlString(row.title)}, ${escapeSqlString(row.client_name)}, ${escapeSqlString(
        row.industry
      )}, ${escapeSqlString(row.live_url)}, ${escapeSqlString(row.payload_json)}, ${escapeSqlString(
        row.updated_at
      )}) ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`), \`client_name\` = VALUES(\`client_name\`), \`industry\` = VALUES(\`industry\`), \`live_url\` = VALUES(\`live_url\`), \`payload_json\` = VALUES(\`payload_json\`), \`updated_at\` = VALUES(\`updated_at\`);`
    );
  }
  lines.push('');

  // 6. mweb_articles
  lines.push('CREATE TABLE IF NOT EXISTS `mweb_articles` (');
  lines.push('  `id` VARCHAR(128) NOT NULL PRIMARY KEY,');
  lines.push('  `title` VARCHAR(255) NOT NULL,');
  lines.push('  `category` VARCHAR(128) NOT NULL,');
  lines.push('  `author_name` VARCHAR(128) NOT NULL,');
  lines.push('  `payload_json` LONGTEXT NOT NULL,');
  lines.push('  `updated_at` DATETIME NOT NULL');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');
  for (const row of extracted.tables.mweb_articles) {
    lines.push(
      `INSERT INTO \`mweb_articles\` (\`id\`, \`title\`, \`category\`, \`author_name\`, \`payload_json\`, \`updated_at\`) VALUES (${escapeSqlString(
        row.id
      )}, ${escapeSqlString(row.title)}, ${escapeSqlString(row.category)}, ${escapeSqlString(
        row.author_name
      )}, ${escapeSqlString(row.payload_json)}, ${escapeSqlString(
        row.updated_at
      )}) ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`), \`category\` = VALUES(\`category\`), \`author_name\` = VALUES(\`author_name\`), \`payload_json\` = VALUES(\`payload_json\`), \`updated_at\` = VALUES(\`updated_at\`);`
    );
  }
  lines.push('');

  // 7. mweb_payment_methods
  lines.push('CREATE TABLE IF NOT EXISTS `mweb_payment_methods` (');
  lines.push('  `id` VARCHAR(128) NOT NULL PRIMARY KEY,');
  lines.push('  `category` VARCHAR(64) NOT NULL,');
  lines.push('  `name_ar` VARCHAR(255) NOT NULL,');
  lines.push('  `name_en` VARCHAR(255) NOT NULL,');
  lines.push('  `enabled` TINYINT(1) NOT NULL DEFAULT 1,');
  lines.push('  `payload_json` LONGTEXT NOT NULL,');
  lines.push('  `updated_at` DATETIME NOT NULL');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');
  for (const row of extracted.tables.mweb_payment_methods) {
    lines.push(
      `INSERT INTO \`mweb_payment_methods\` (\`id\`, \`category\`, \`name_ar\`, \`name_en\`, \`enabled\`, \`payload_json\`, \`updated_at\`) VALUES (${escapeSqlString(
        row.id
      )}, ${escapeSqlString(row.category)}, ${escapeSqlString(row.name_ar)}, ${escapeSqlString(
        row.name_en
      )}, ${row.enabled}, ${escapeSqlString(row.payload_json)}, ${escapeSqlString(
        row.updated_at
      )}) ON DUPLICATE KEY UPDATE \`category\` = VALUES(\`category\`), \`name_ar\` = VALUES(\`name_ar\`), \`name_en\` = VALUES(\`name_en\`), \`enabled\` = VALUES(\`enabled\`), \`payload_json\` = VALUES(\`payload_json\`), \`updated_at\` = VALUES(\`updated_at\`);`
    );
  }
  lines.push('');

  // 8. mweb_orders
  lines.push('CREATE TABLE IF NOT EXISTS `mweb_orders` (');
  lines.push('  `id` VARCHAR(128) NOT NULL PRIMARY KEY,');
  lines.push('  `customer_name` VARCHAR(255) NOT NULL,');
  lines.push('  `customer_phone` VARCHAR(64) NOT NULL,');
  lines.push('  `details` TEXT NOT NULL,');
  lines.push('  `created_at` DATETIME NOT NULL');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');
  for (const row of extracted.tables.mweb_orders) {
    lines.push(
      `INSERT INTO \`mweb_orders\` (\`id\`, \`customer_name\`, \`customer_phone\`, \`details\`, \`created_at\`) VALUES (${escapeSqlString(
        row.id
      )}, ${escapeSqlString(row.customer_name)}, ${escapeSqlString(
        row.customer_phone
      )}, ${escapeSqlString(row.details)}, ${escapeSqlString(
        row.created_at
      )}) ON DUPLICATE KEY UPDATE \`customer_name\` = VALUES(\`customer_name\`), \`customer_phone\` = VALUES(\`customer_phone\`), \`details\` = VALUES(\`details\`);`
    );
  }
  lines.push('');
  lines.push('SET foreign_key_checks = 1;');
  lines.push('');

  return lines.join('\n');
}

/**
 * Reconstructs the Firebase MasterData object from MySQL `mweb_sections` rows
 * for reverse synchronization (MySQL -> Firebase Firestore & data.json).
 */
export function reconstructMasterDataFromRelationalRows(
  sectionRows: Array<{ section_key: string; payload_json: string }>,
  currentFallback: Record<string, any> = {}
): Record<string, any> {
  const result: Record<string, any> = {
    version: 1,
    updatedAt: new Date().toISOString(),
    ...currentFallback,
  };

  if (Array.isArray(sectionRows)) {
    for (const row of sectionRows) {
      if (!row || !row.section_key || typeof row.payload_json !== 'string') continue;
      try {
        result[row.section_key] = JSON.parse(row.payload_json);
      } catch {
        // ignore malformed json row
      }
    }
  }

  return result;
}
