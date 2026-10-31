import test from 'node:test';
import assert from 'node:assert/strict';
import {
  recordAiConversationExchange,
  getAllAiMonitoredSessions,
  markAiSessionReadByAdmin,
  deleteAiMonitoredSession,
} from './aiChatMonitor';

function createMemoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, val: string) => {
      map.set(key, val);
    },
  };
}

test('recordAiConversationExchange logs visitor prompt and AI response for Admin monitoring', () => {
  const mem = createMemoryStorage();

  const session = recordAiConversationExchange(
    'ai-visitor-xyz123',
    {
      id: 'u1',
      role: 'user',
      text: 'كم سعر المنصة التعليمية؟',
      timestamp: '10:20 AM',
    },
    {
      id: 'b1',
      role: 'model',
      text: 'يبدأ الاشتراك الشهري من 49 دولاراً.',
      timestamp: '10:20 AM',
      modelUsed: 'gemini-3.8-flash',
    },
    undefined,
    mem
  );

  assert.equal(session.sessionId, 'ai-visitor-xyz123');
  assert.equal(session.unreadByAdmin, true);
  assert.equal(session.lastUserQuestion, 'كم سعر المنصة التعليمية؟');
  assert.equal(session.turns.length, 2);

  const all = getAllAiMonitoredSessions(mem);
  assert.equal(all.length, 1);

  markAiSessionReadByAdmin('ai-visitor-xyz123', mem);
  const afterRead = getAllAiMonitoredSessions(mem);
  assert.equal(afterRead[0].unreadByAdmin, false);

  const afterDelete = deleteAiMonitoredSession('ai-visitor-xyz123', mem);
  assert.equal(afterDelete.length, 0);
});
