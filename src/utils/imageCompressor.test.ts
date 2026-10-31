import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeForFirestore, toSafeFirestoreId } from './imageCompressor';

test('sanitizeForFirestore strips undefined object keys and preserves valid values', () => {
  const input = {
    title: 'منصة تعليمية',
    badge: undefined,
    enabled: false,
    count: 0,
    nested: {
      valid: 'ok',
      missing: undefined,
      items: ['a', undefined, 'b'],
    },
  };

  const result = sanitizeForFirestore(input);
  assert.equal(result.title, 'منصة تعليمية');
  assert.equal('badge' in result, false);
  assert.equal(result.enabled, false);
  assert.equal(result.count, 0);
  assert.equal(result.nested.valid, 'ok');
  assert.equal('missing' in result.nested, false);
  assert.deepEqual(result.nested.items, ['a', null, 'b']);
});

test('toSafeFirestoreId generates valid Firestore document IDs', () => {
  assert.equal(toSafeFirestoreId('data_sec_siteMedia'), 'data_sec_siteMedia');
  assert.equal(toSafeFirestoreId('  hello/world?123  '), 'hello-world-123');
  const fallback = toSafeFirestoreId('///', 'doc');
  assert.match(fallback, /^doc-\d+$/);
});
