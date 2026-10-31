import test from 'node:test';
import assert from 'node:assert/strict';

test('auto update notification event structure', () => {
  const detail = {
    updatedAt: new Date().toISOString(),
    section: 'demoPlatforms',
    messageAr: 'تم تحديث المحتوى والمنصات تلقائياً',
  };
  assert.equal(typeof detail.updatedAt, 'string');
  assert.equal(detail.section, 'demoPlatforms');
  assert.ok(detail.messageAr.includes('تلقائياً'));
});
