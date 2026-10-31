import {
  syncCatalogDocToFirestore,
  deleteCatalogDocFromFirestore,
  subscribeToCatalogCollection,
} from './firebase';

export interface PlatformMedia {
  id: string;
  type: 'image' | 'video' | 'youtube';
  url: string;
  title?: string;
  isUploaded?: boolean;
}

export interface PlatformPricing {
  monthly: number;
  annual: number;
  lifetime: number;
  currency: string;
  monthlyNote?: string;
  annualNote?: string;
  lifetimeNote?: string;
}

export interface DemoPlatform {
  id: string;
  title: string;
  titleEn?: string;
  subtitle: string;
  subtitleEn?: string;
  category: string;
  categoryEn?: string;
  description: string;
  descriptionEn?: string;
  liveDemoUrl: string;
  badge?: string;
  badgeEn?: string;
  pricing: PlatformPricing;
  features: string[];
  techStack: string[];
  media: PlatformMedia[];
  thumbnail: string;
  clientTarget?: string;
  createdAt: string;
}

const STORAGE_KEY = 'webrex_demo_platforms_v1';
const COLLECTION_NAME = 'demo_platforms';

const LEGACY_MOCK_IDS = new Set([
  'demo-lms-academy',
  'demo-ecommerce-multivendor',
  'demo-erp-cloudflow',
  'demo-medical-care',
]);

export const DEFAULT_DEMO_PLATFORMS: DemoPlatform[] = [];

let cachedPlatforms: DemoPlatform[] | null = null;

// Subscribe to cloud Firestore updates and sync into local cache
subscribeToCatalogCollection<DemoPlatform>(COLLECTION_NAME, (cloudItems) => {
  const cleaned = cloudItems.filter((p) => p && !LEGACY_MOCK_IDS.has(p.id));
  cachedPlatforms = cleaned;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('Could not sync cloud demo platforms to localStorage:', e);
  }
});

export const getDemoPlatforms = (): DemoPlatform[] => {
  if (cachedPlatforms) return cachedPlatforms;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      cachedPlatforms = [];
      return [];
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      cachedPlatforms = [];
      return [];
    }
    const cleaned = parsed.filter((p: DemoPlatform) => p && !LEGACY_MOCK_IDS.has(p.id));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    cachedPlatforms = cleaned;
    return cachedPlatforms;
  } catch (err) {
    console.error('Error reading demo platforms from localStorage:', err);
    return [];
  }
};

export const saveDemoPlatforms = (platforms: DemoPlatform[]): void => {
  cachedPlatforms = platforms;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(platforms));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Error saving demo platforms to localStorage:', err);
  }
};

export const addDemoPlatform = (platform: Omit<DemoPlatform, 'id' | 'createdAt'>): DemoPlatform => {
  const current = getDemoPlatforms();
  const newPlatform: DemoPlatform = {
    ...platform,
    id: `demo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString().split('T')[0],
  };
  const updated = [newPlatform, ...current];
  saveDemoPlatforms(updated);
  syncCatalogDocToFirestore(COLLECTION_NAME, newPlatform.id, newPlatform).catch((e) =>
    console.warn('Firestore sync notice:', e)
  );
  return newPlatform;
};

export const updateDemoPlatform = (id: string, updates: Partial<DemoPlatform>): boolean => {
  const current = getDemoPlatforms();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return false;
  current[index] = { ...current[index], ...updates };
  saveDemoPlatforms(current);
  syncCatalogDocToFirestore(COLLECTION_NAME, id, current[index]).catch((e) =>
    console.warn('Firestore sync notice:', e)
  );
  return true;
};

export const deleteDemoPlatform = (id: string): boolean => {
  const current = getDemoPlatforms();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === current.length) return false;
  saveDemoPlatforms(filtered);
  deleteCatalogDocFromFirestore(COLLECTION_NAME, id).catch((e) =>
    console.warn('Firestore delete notice:', e)
  );
  return true;
};

export const resetDemoPlatforms = (): DemoPlatform[] => {
  const current = getDemoPlatforms();
  current.forEach((p) => {
    deleteCatalogDocFromFirestore(COLLECTION_NAME, p.id).catch(() => {});
  });
  cachedPlatforms = [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event('storage'));
  return [];
};
