import test from 'node:test';
import assert from 'node:assert/strict';
import {
  selectGeminiModel,
  buildRobotSystemInstruction,
  sanitizeChatHistoryForGemini,
  generateWelcomeMessage,
} from './aiRobotHelper';

test('selectGeminiModel returns correct Gemini 3.x models', () => {
  assert.equal(selectGeminiModel('general'), 'gemini-3.8-flash');
  assert.equal(selectGeminiModel('fast'), 'gemini-3.1-flash-lite');
  assert.equal(selectGeminiModel(), 'gemini-3.8-flash');
});

test('buildRobotSystemInstruction includes brand names and WhatsApp contact', () => {
  const instruction = buildRobotSystemInstruction('إم ويب', 'M Web', '201099999999');
  assert.ok(instruction.includes('إم ويب'));
  assert.ok(instruction.includes('M Web'));
  assert.ok(instruction.includes('201099999999'));
  assert.ok(instruction.includes('Cyber Robot Buddy'));
});

test('sanitizeChatHistoryForGemini filters empty messages and extracts inlineData from data URLs', () => {
  const raw = [
    { role: 'user' as const, text: '   ' },
    { role: 'model' as const, text: 'مرحباً بك!' },
    {
      role: 'user' as const,
      text: 'كم سعر المنصة؟',
      imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==',
    },
  ];

  const sanitized = sanitizeChatHistoryForGemini(raw);
  assert.equal(sanitized.length, 2);
  assert.equal(sanitized[0].role, 'model');
  assert.equal(sanitized[0].parts[0].text, 'مرحباً بك!');
  assert.equal(sanitized[1].role, 'user');
  assert.equal(sanitized[1].parts.length, 2);
  assert.equal(sanitized[1].parts[0].inlineData?.mimeType, 'image/png');
  assert.equal(sanitized[1].parts[0].inlineData?.data, 'iVBORw0KGgoAAAANSUhEUg==');
  assert.equal(sanitized[1].parts[1].text, 'كم سعر المنصة؟');
});

test('generateWelcomeMessage adapts to Arabic and English for M Web', () => {
  const arMsg = generateWelcomeMessage('ar', 'إم ويب', 'M Web');
  const enMsg = generateWelcomeMessage('en', 'إم ويب', 'M Web');
  assert.ok(arMsg.includes('Cyber Robot Buddy'));
  assert.ok(arMsg.includes('إم ويب'));
  assert.ok(enMsg.includes('Cyber Robot Buddy'));
  assert.ok(enMsg.includes('M Web'));
});
