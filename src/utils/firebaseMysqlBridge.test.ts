import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeSqlString,
  extractRelationalTablesFromMasterData,
  generateMySqlDumpFromMasterData,
  reconstructMasterDataFromRelationalRows,
} from './firebaseMysqlBridge';

test('escapeSqlString safely escapes quotes, backslashes, and nulls', () => {
  assert.equal(escapeSqlString(null), 'NULL');
  assert.equal(escapeSqlString(undefined), 'NULL');
  assert.equal(escapeSqlString(42), '42');
  assert.equal(escapeSqlString(true), '1');
  assert.equal(escapeSqlString("M Web's \"Platform\""), "'M Web\\'s \\\"Platform\\\"'");
});

test('extractRelationalTablesFromMasterData builds normalized MySQL rows for Firebase collections', () => {
  const sampleMaster = {
    version: 1,
    updatedAt: '2026-10-31T10:00:00.000Z',
    platformSettings: { brandNameAr: 'إم ويب', brandNameEn: 'M Web' },
    siteMedia: [
      {
        id: 'media_1',
        section: 'hero',
        type: 'video',
        title: 'كورس البرمجة',
        url: 'https://www.youtube.com/watch?v=abc',
        visible: true,
        order: 0,
      },
    ],
    orders: [
      {
        id: 'ORD-1001',
        name: 'أحمد محمد',
        phone: '01012345678',
        details: 'طلب منصة تعليمية',
        timestamp: '2026-10-31T10:00:00.000Z',
      },
    ],
  };

  const result = extractRelationalTablesFromMasterData(sampleMaster);
  assert.equal(result.tables.mweb_sections.length, 13);
  assert.equal(result.tables.mweb_site_media.length, 1);
  assert.equal(result.tables.mweb_site_media[0].title, 'كورس البرمجة');
  assert.equal(result.tables.mweb_orders.length, 1);
  assert.equal(result.tables.mweb_orders[0].customer_name, 'أحمد محمد');
  assert.equal(result.totalRows, 15);
});

test('generateMySqlDumpFromMasterData creates valid MySQL DDL & ON DUPLICATE KEY UPDATE statements', () => {
  const sampleMaster = {
    version: 1,
    updatedAt: '2026-10-31T10:00:00.000Z',
    platformSettings: { brandNameAr: 'إم ويب' },
    orders: [
      {
        id: 'ORD-99',
        name: 'عميل تجريبي',
        phone: '01099999999',
        details: 'اختبار ربط Firebase مع MySQL',
      },
    ],
  };

  const sqlDump = generateMySqlDumpFromMasterData(sampleMaster, {
    projectId: 'gen-lang-client-0338286610',
    firestoreDatabaseId: 'ai-studio-mweb-9784d1ea-1fec-4441-8f06-0f6c5fb8dcb5',
    mysqlDatabase: 'mweb_firebase_mysql_db',
  });

  assert.ok(sqlDump.includes('CREATE DATABASE IF NOT EXISTS `mweb_firebase_mysql_db`'));
  assert.ok(sqlDump.includes('CREATE TABLE IF NOT EXISTS `mweb_sections`'));
  assert.ok(sqlDump.includes('CREATE TABLE IF NOT EXISTS `mweb_orders`'));
  assert.ok(sqlDump.includes("INSERT INTO `mweb_orders` (`id`, `customer_name`, `customer_phone`, `details`, `created_at`) VALUES ('ORD-99'"));
  assert.ok(sqlDump.includes('ON DUPLICATE KEY UPDATE'));
});

test('reconstructMasterDataFromRelationalRows rebuilds Firebase state from MySQL mweb_sections rows', () => {
  const extracted = extractRelationalTablesFromMasterData({
    platformSettings: { brandNameAr: 'إم ويب برو' },
    adminPasscode: '200200',
  });

  const reconstructed = reconstructMasterDataFromRelationalRows(extracted.tables.mweb_sections);
  assert.equal(reconstructed.platformSettings.brandNameAr, 'إم ويب برو');
  assert.equal(reconstructed.adminPasscode, '200200');
});
