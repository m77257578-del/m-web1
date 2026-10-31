import {
  syncCatalogDocToFirestore,
  deleteCatalogDocFromFirestore,
  subscribeToCatalogCollection,
} from './firebase';
import { syncSectionToDataJson } from './dataJsonService';

export interface ClientProject {
  id: string;
  title: string;
  clientName: string;
  industry: string;
  location: string;
  completionDate: string;
  liveUrl: string;
  thumbnail: string;
  videoUrl?: string;
  gallery?: { type: 'image' | 'video' | 'youtube'; url: string; title?: string }[];
  description: string;
  results: string[];
  technologies: string[];
  testimonial?: {
    clientPerson: string;
    role: string;
    quote: string;
    rating: number;
  };
  isLive: boolean;
}

const STORAGE_KEY = 'webrex_client_projects_v1';
const COLLECTION_NAME = 'client_projects';

const LEGACY_MOCK_CLIENT_IDS = new Set([
  'client-proj-alamal',
  'client-proj-rawabi',
  'client-proj-delta-logistics',
  'client-proj-alhayat-med',
]);

export const DEFAULT_CLIENT_PROJECTS: ClientProject[] = [];

subscribeToCatalogCollection<ClientProject>(COLLECTION_NAME, (cloudItems, isEmpty) => {
  if (isEmpty) return;
  const cleaned = cloudItems.filter((p) => p && !LEGACY_MOCK_CLIENT_IDS.has(p.id));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('Could not sync cloud client projects to localStorage:', e);
  }
});

export const getClientProjects = (): ClientProject[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    const cleaned = parsed.filter((p: ClientProject) => p && !LEGACY_MOCK_CLIENT_IDS.has(p.id));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (err) {
    console.error('Error reading client projects from localStorage:', err);
    return [];
  }
};

export const saveClientProjects = (projects: ClientProject[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new Event('storage'));
    syncSectionToDataJson('clientProjects', projects).catch(() => {});
  } catch (err) {
    console.error('Error saving client projects to localStorage:', err);
  }
};

export const addClientProject = (project: Omit<ClientProject, 'id'>): ClientProject => {
  const current = getClientProjects();
  const newProj: ClientProject = {
    ...project,
    id: `client-proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };
  const updated = [newProj, ...current];
  saveClientProjects(updated);
  syncCatalogDocToFirestore(COLLECTION_NAME, newProj.id, newProj).catch((e) =>
    console.warn('Firestore sync notice:', e)
  );
  return newProj;
};

export const updateClientProject = (id: string, updates: Partial<ClientProject>): boolean => {
  const current = getClientProjects();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return false;
  current[index] = { ...current[index], ...updates };
  saveClientProjects(current);
  syncCatalogDocToFirestore(COLLECTION_NAME, id, current[index]).catch((e) =>
    console.warn('Firestore sync notice:', e)
  );
  return true;
};

export const deleteClientProject = (id: string): boolean => {
  const current = getClientProjects();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === current.length) return false;
  saveClientProjects(filtered);
  deleteCatalogDocFromFirestore(COLLECTION_NAME, id).catch((e) =>
    console.warn('Firestore delete notice:', e)
  );
  return true;
};

export const resetClientProjects = (): ClientProject[] => {
  const current = getClientProjects();
  current.forEach((p) => {
    deleteCatalogDocFromFirestore(COLLECTION_NAME, p.id).catch(() => {});
  });
  saveClientProjects([]);
  return [];
};
