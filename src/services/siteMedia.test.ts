import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractYouTubeVideoId,
  buildProtectedYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  getMediaItemsForPlacement,
  SiteMediaItem,
} from './siteMedia';

test('extractYouTubeVideoId parses watch, short, embed, and share URLs with tracking params', () => {
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=abc123XYZ&feature=share'),
    'dQw4w9WgXcQ'
  );
  assert.equal(
    extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ?si=shareToken999'),
    'dQw4w9WgXcQ'
  );
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1'),
    'dQw4w9WgXcQ'
  );
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ?feature=share'),
    'dQw4w9WgXcQ'
  );
  assert.equal(extractYouTubeVideoId('https://example.com/video.mp4'), null);
});

test('buildProtectedYouTubeEmbedUrl strips share params and enforces privacy/no-controls flags', () => {
  const embed = buildProtectedYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ?si=secretShareId', true);
  assert.ok(embed.startsWith('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?'));
  assert.ok(embed.includes('controls=0'));
  assert.ok(embed.includes('modestbranding=1'));
  assert.ok(embed.includes('rel=0'));
  assert.ok(embed.includes('fs=0'));
  assert.ok(embed.includes('disablekb=1'));
  assert.ok(embed.includes('enablejsapi=1'));
  assert.ok(embed.includes('autoplay=1'));
  assert.ok(!embed.includes('secretShareId'));
});

test('getYouTubeThumbnailUrl returns hqdefault thumbnail for valid YouTube URLs', () => {
  assert.equal(
    getYouTubeThumbnailUrl('https://youtu.be/dQw4w9WgXcQ?si=123'),
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
  );
  assert.equal(getYouTubeThumbnailUrl('https://example.com/photo.png'), null);
});

test('getMediaItemsForPlacement filters by enabled status and target placement section', () => {
  const sampleItems: SiteMediaItem[] = [
    {
      id: 'm1',
      mediaType: 'video',
      url: 'https://youtu.be/dQw4w9WgXcQ',
      title: 'كورس أساسيات البرمجة | المحاضر',
      subtitle: 'مهندس عبدالرحمن عيد',
      placements: ['hero-top', 'payment-methods'],
      enabled: true,
      createdAt: '2026-10-31',
    },
    {
      id: 'm2',
      mediaType: 'image',
      url: 'https://example.com/pay.jpg',
      title: 'شرح الدفع',
      placements: ['payment-methods'],
      enabled: false,
      createdAt: '2026-10-31',
    },
    {
      id: 'm3',
      mediaType: 'image',
      url: 'https://example.com/services.jpg',
      title: 'خدماتنا',
      placements: ['services'],
      enabled: true,
      createdAt: '2026-10-31',
    },
  ];

  const heroItems = getMediaItemsForPlacement(sampleItems, 'hero-top');
  assert.equal(heroItems.length, 1);
  assert.equal(heroItems[0].id, 'm1');

  const paymentItems = getMediaItemsForPlacement(sampleItems, 'payment-methods');
  assert.equal(paymentItems.length, 1);
  assert.equal(paymentItems[0].id, 'm1');

  const serviceItems = getMediaItemsForPlacement(sampleItems, 'services');
  assert.equal(serviceItems.length, 1);
  assert.equal(serviceItems[0].id, 'm3');
});
