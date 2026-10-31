import { useState, useEffect } from 'react';
import { syncCatalogDocToFirestore, subscribeToSettingsDoc } from './firebase';
import { syncSectionToDataJson } from './dataJsonService';

export type MediaPlacementLocation =
  | 'hero-top'
  | 'hero-bottom'
  | 'demo-platforms'
  | 'client-projects'
  | 'ratings'
  | 'payment-methods'
  | 'articles'
  | 'services'
  | 'portfolio'
  | 'why-us'
  | 'join-us'
  | 'order-form';

export interface MediaPlacementOption {
  id: MediaPlacementLocation;
  labelAr: string;
  labelEn: string;
  badgeAr: string;
}

export const MEDIA_PLACEMENT_OPTIONS: MediaPlacementOption[] = [
  {
    id: 'hero-top',
    labelAr: 'أول الصفحة الرئيسية (أعلى الرئيسية)',
    labelEn: 'Top of Home Page (Above Hero)',
    badgeAr: 'أول الرئيسية',
  },
  {
    id: 'hero-bottom',
    labelAr: 'الصفحة الرئيسية (أسفل الواجهة الترحيبية)',
    labelEn: 'Home Page (Below Hero Banner)',
    badgeAr: 'واجهة الرئيسية',
  },
  {
    id: 'payment-methods',
    labelAr: 'قسم طرق الدفع وبوابة كاشير',
    labelEn: 'Payment Methods & Kashier Section',
    badgeAr: 'قسم الدفع',
  },
  {
    id: 'demo-platforms',
    labelAr: 'قسم منصات المعاينة والتسعير',
    labelEn: 'Demo Platforms & Pricing Section',
    badgeAr: 'منصات المعاينة',
  },
  {
    id: 'client-projects',
    labelAr: 'قسم أعمالنا (سابقاً أعمال العملاء)',
    labelEn: 'Our Works Section',
    badgeAr: 'أعمالنا',
  },
  {
    id: 'ratings',
    labelAr: 'قسم تقييمات وآراء العملاء',
    labelEn: 'Client Ratings Section',
    badgeAr: 'تقييماتنا',
  },
  {
    id: 'articles',
    labelAr: 'قسم المقالات والأدلة التقنية',
    labelEn: 'Articles & Guides Section',
    badgeAr: 'قسم المقالات',
  },
  {
    id: 'services',
    labelAr: 'قسم الخدمات البرمجية',
    labelEn: 'Software Services Section',
    badgeAr: 'قسم الخدمات',
  },
  {
    id: 'portfolio',
    labelAr: 'قسم معرض النماذج والمشاريع',
    labelEn: 'Portfolio Showcase Section',
    badgeAr: 'معرض المشاريع',
  },
  {
    id: 'why-us',
    labelAr: 'قسم لماذا نحن ومنهجية العمل',
    labelEn: 'Why Us & Methodology Section',
    badgeAr: 'لماذا نحن',
  },
  {
    id: 'join-us',
    labelAr: 'قسم الانضمام لفريق المطورين',
    labelEn: 'Join Our Team Section',
    badgeAr: 'انضم إلينا',
  },
  {
    id: 'order-form',
    labelAr: 'قسم نموذج الطلب المباشر',
    labelEn: 'Direct Order Form Section',
    badgeAr: 'نموذج الطلب',
  },
];

export interface SiteMediaItem {
  id: string;
  mediaType: 'video' | 'image';
  videoSourceType?: 'youtube' | 'direct' | 'upload';
  url: string;
  thumbnailUrl?: string;
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  avatarUrl?: string;
  footerNote?: string;
  placements: MediaPlacementLocation[];
  enabled: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'mweb_site_media_v1';
const COLLECTION_NAME = 'settings';
const DOC_ID = 'site_media_posts';
export const SITE_MEDIA_UPDATED_EVENT = 'mweb_site_media_changed';

export function extractYouTubeVideoId(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{6,20}$/.test(id) ? id : null;
    }

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      const vParam = parsed.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{6,20}$/.test(vParam)) {
        return vParam;
      }

      const pathParts = parsed.pathname.split('/').filter(Boolean);
      const embedIdx = pathParts.findIndex(
        (p) => p === 'embed' || p === 'shorts' || p === 'v' || p === 'live'
      );
      if (embedIdx !== -1 && pathParts[embedIdx + 1]) {
        const id = pathParts[embedIdx + 1];
        return /^[a-zA-Z0-9_-]{6,20}$/.test(id) ? id : null;
      }
    }
  } catch {
    // Fallback regex parsing
  }

  const regexMatch = trimmed.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts|live)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{6,20})/
  );
  return regexMatch && regexMatch[1] ? regexMatch[1] : null;
}

export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

export function buildProtectedYouTubeEmbedUrl(url: string, autoplay = false): string {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return url;

  const params = new URLSearchParams({
    enablejsapi: '1',
    controls: '0',
    modestbranding: '1',
    rel: '0',
    showinfo: '0',
    iv_load_policy: '3',
    fs: '0',
    disablekb: '1',
    playsinline: '1',
    autoplay: autoplay ? '1' : '0',
  });

  if (typeof window !== 'undefined' && window.location?.origin) {
    params.set('origin', window.location.origin);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function getYouTubeThumbnailUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function getMediaItemsForPlacement(
  items: SiteMediaItem[],
  placement: MediaPlacementLocation
): SiteMediaItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (item) =>
      item &&
      item.enabled !== false &&
      Array.isArray(item.placements) &&
      item.placements.includes(placement)
  );
}

interface CloudSiteMediaContainer {
  isSiteMediaContainer: boolean;
  items: SiteMediaItem[];
}

if (typeof window !== 'undefined') {
  subscribeToSettingsDoc<CloudSiteMediaContainer>(
    DOC_ID,
    (mediaDoc) => {
      if (mediaDoc && Array.isArray(mediaDoc.items)) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaDoc.items));
          window.dispatchEvent(new CustomEvent(SITE_MEDIA_UPDATED_EVENT, { detail: mediaDoc.items }));
        } catch (e) {
          console.warn('Could not sync cloud site media locally:', e);
        }
      }
    },
    () => {
      const localItems = getSiteMediaItems();
      if (localItems.length > 0) {
        syncCatalogDocToFirestore(COLLECTION_NAME, DOC_ID, {
          isSiteMediaContainer: true,
          items: localItems,
        }).catch(() => {});
      }
    }
  );
}

export function getSiteMediaItems(): SiteMediaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Could not read site media items:', e);
    return [];
  }
}

export function saveSiteMediaItems(items: SiteMediaItem[]): SiteMediaItem[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(SITE_MEDIA_UPDATED_EVENT, { detail: items }));
    syncCatalogDocToFirestore(COLLECTION_NAME, DOC_ID, {
      isSiteMediaContainer: true,
      items,
    }).catch((e) => console.warn('Firestore site media sync notice:', e));
    syncSectionToDataJson('siteMedia', items).catch(() => {});
  } catch (e) {
    console.warn('Could not save site media items:', e);
  }
  return items;
}

export function addSiteMediaItem(
  input: Omit<SiteMediaItem, 'id' | 'createdAt' | 'enabled'> & { enabled?: boolean }
): SiteMediaItem {
  const current = getSiteMediaItems();
  const autoThumb =
    input.thumbnailUrl?.trim() ||
    (input.mediaType === 'video' ? getYouTubeThumbnailUrl(input.url) || '' : input.url);

  const newItem: SiteMediaItem = {
    ...input,
    id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: input.title.trim() || (input.mediaType === 'video' ? 'فيديو توضيحي' : 'صورة توضيحية'),
    subtitle: input.subtitle?.trim() || '',
    badgeLabel: input.badgeLabel?.trim() || (input.mediaType === 'video' ? 'فيديو' : 'صورة'),
    avatarUrl: input.avatarUrl?.trim() || '',
    footerNote: input.footerNote?.trim() ?? '',
    thumbnailUrl: autoThumb,
    placements: input.placements.length > 0 ? input.placements : ['hero-top'],
    enabled: input.enabled ?? true,
    createdAt: new Date().toISOString().split('T')[0],
  };

  const updated = [newItem, ...current];
  saveSiteMediaItems(updated);
  return newItem;
}

export function updateSiteMediaItem(id: string, updates: Partial<SiteMediaItem>): boolean {
  const current = getSiteMediaItems();
  const idx = current.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  current[idx] = { ...current[idx], ...updates };
  saveSiteMediaItems(current);
  return true;
}

export function toggleSiteMediaItem(id: string): boolean {
  const current = getSiteMediaItems();
  const idx = current.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  current[idx] = { ...current[idx], enabled: !current[idx].enabled };
  saveSiteMediaItems(current);
  return current[idx].enabled;
}

export function deleteSiteMediaItem(id: string): boolean {
  const current = getSiteMediaItems();
  const filtered = current.filter((m) => m.id !== id);
  if (filtered.length === current.length) return false;
  saveSiteMediaItems(filtered);
  return true;
}

export function useSiteMedia(placement?: MediaPlacementLocation): SiteMediaItem[] {
  const [items, setItems] = useState<SiteMediaItem[]>(() => {
    const all = getSiteMediaItems();
    return placement ? getMediaItemsForPlacement(all, placement) : all;
  });

  useEffect(() => {
    const refresh = () => {
      const all = getSiteMediaItems();
      setItems(placement ? getMediaItemsForPlacement(all, placement) : all);
    };
    window.addEventListener(SITE_MEDIA_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(SITE_MEDIA_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [placement]);

  return items;
}
