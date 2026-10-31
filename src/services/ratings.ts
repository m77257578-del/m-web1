import { syncCatalogDocToFirestore, subscribeToCatalogCollection, deleteCatalogDocFromFirestore } from './firebase';
import { syncSectionToDataJson } from './dataJsonService';

export interface Rating {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

const COLLECTION_NAME = 'user_ratings';

export function addRating(rating: Omit<Rating, 'id' | 'createdAt'>): void {
  const newRating: Rating = {
    id: `rating-${Date.now()}`,
    ...rating,
    createdAt: new Date().toISOString(),
  };
  
  syncCatalogDocToFirestore(COLLECTION_NAME, newRating.id, newRating).catch(() => {});
}

export function deleteRating(id: string): void {
  deleteCatalogDocFromFirestore(COLLECTION_NAME, id).catch(() => {});
}

export function subscribeToRatings(callback: (ratings: Rating[]) => void): () => void {
  return subscribeToCatalogCollection<Rating>(COLLECTION_NAME, callback);
}
