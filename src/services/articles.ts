import { useState, useEffect } from 'react';
import {
  syncCatalogDocToFirestore,
  deleteCatalogDocFromFirestore,
  subscribeToCatalogCollection,
} from './firebase';
import {
  syncSectionToDataJson,
  DATA_JSON_SYNC_EVENT,
  AUTO_DATA_REFRESHED_EVENT,
} from './dataJsonService';

export interface Article {
  id: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  coverImage: string;
  readTime: string;
  tags: string[];
  publishedAt: string;
  viewsCount?: number;
  isFeatured?: boolean;
}

const STORAGE_KEY = 'webrex_articles_v1';
const COLLECTION_NAME = 'articles';

const LEGACY_MOCK_ARTICLE_IDS = new Set([
  'art-clean-architecture',
  'art-security-web-apps',
  'art-custom-vs-ready-scripts',
]);

export const DEFAULT_ARTICLES: Article[] = [];

subscribeToCatalogCollection<Article>(COLLECTION_NAME, (cloudItems, isEmpty) => {
  if (isEmpty) return;
  const cleaned = cloudItems.filter((a) => a && !LEGACY_MOCK_ARTICLE_IDS.has(a.id));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('Could not sync cloud articles to localStorage:', e);
  }
});

export const getArticles = (): Article[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    const cleaned = parsed.filter((a: Article) => a && !LEGACY_MOCK_ARTICLE_IDS.has(a.id));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (err) {
    console.error('Error reading articles from localStorage:', err);
    return [];
  }
};

export const saveArticles = (articles: Article[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    window.dispatchEvent(new Event('storage'));
    syncSectionToDataJson('articles', articles).catch(() => {});
  } catch (err) {
    console.error('Error saving articles to localStorage:', err);
  }
};

export const addArticle = (article: Omit<Article, 'id' | 'publishedAt'>): Article => {
  const current = getArticles();
  const newArticle: Article = {
    ...article,
    id: `art-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    publishedAt: new Date().toISOString().split('T')[0],
    viewsCount: 1,
  };
  const updated = [newArticle, ...current];
  saveArticles(updated);
  syncCatalogDocToFirestore(COLLECTION_NAME, newArticle.id, newArticle).catch((e) =>
    console.warn('Firestore sync notice:', e)
  );
  return newArticle;
};

export const updateArticle = (id: string, updates: Partial<Article>): boolean => {
  const current = getArticles();
  const index = current.findIndex((a) => a.id === id);
  if (index === -1) return false;
  current[index] = { ...current[index], ...updates };
  saveArticles(current);
  syncCatalogDocToFirestore(COLLECTION_NAME, id, current[index]).catch((e) =>
    console.warn('Firestore sync notice:', e)
  );
  return true;
};

export const deleteArticle = (id: string): boolean => {
  const current = getArticles();
  const filtered = current.filter((a) => a.id !== id);
  if (filtered.length === current.length) return false;
  saveArticles(filtered);
  deleteCatalogDocFromFirestore(COLLECTION_NAME, id).catch((e) =>
    console.warn('Firestore delete notice:', e)
  );
  return true;
};

export const resetArticles = (): Article[] => {
  const current = getArticles();
  current.forEach((a) => {
    deleteCatalogDocFromFirestore(COLLECTION_NAME, a.id).catch(() => {});
  });
  saveArticles([]);
  return [];
};

export function useArticles(): Article[] {
  const [articles, setArticles] = useState<Article[]>(getArticles);

  useEffect(() => {
    const handleUpdate = () => {
      setArticles(getArticles());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener(DATA_JSON_SYNC_EVENT, handleUpdate);
    window.addEventListener(AUTO_DATA_REFRESHED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener(DATA_JSON_SYNC_EVENT, handleUpdate);
      window.removeEventListener(AUTO_DATA_REFRESHED_EVENT, handleUpdate);
    };
  }, []);

  return articles;
}

