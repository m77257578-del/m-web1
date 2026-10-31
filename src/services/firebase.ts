import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  getDocFromServer,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Project, Order, FirebaseConfig } from '../types';

// Initialize official provisioned Firebase App & Firestore Database
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const LOCAL_ORDERS_KEY = 'webrex_local_orders';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Admin Google Auth Helpers
export async function signInAdminWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutAdminGoogle(): Promise<void> {
  await signOut(auth);
}

export function onAdminAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export function isCloudAdminSignedIn(): boolean {
  return Boolean(auth.currentUser);
}

// Generic Catalog Sync Helpers (used by demoPlatforms, clientProjects, articles, paymentMethods, settings)
export async function syncCatalogDocToFirestore(
  collectionName: string,
  itemId: string,
  payload: Record<string, any>
): Promise<void> {
  if (!auth.currentUser) return;
  const safeId = itemId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120) || `item-${Date.now()}`;
  const path = `${collectionName}/${safeId}`;
  try {
    await setDoc(doc(db, collectionName, safeId), {
      id: safeId,
      payload,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCatalogDocFromFirestore(
  collectionName: string,
  itemId: string
): Promise<void> {
  if (!auth.currentUser) return;
  const safeId = itemId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
  if (!safeId) return;
  const path = `${collectionName}/${safeId}`;
  try {
    await deleteDoc(doc(db, collectionName, safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToCatalogCollection<T>(
  collectionName: string,
  onItemsUpdated: (items: T[]) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        if (snapshot.empty) return;
        const items: T[] = [];
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.payload) {
            items.push(data.payload as T);
          }
        });
        if (items.length > 0) {
          onItemsUpdated(items);
        }
      },
      (error) => {
        console.warn(`Firestore listener notice for ${collectionName}:`, error);
      }
    );
  } catch (e) {
    console.warn(`Could not subscribe to ${collectionName}:`, e);
    return () => {};
  }
}

// Legacy compatibility helpers
export function getStoredFirebaseConfig(): FirebaseConfig | null {
  return {
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  };
}

export function saveStoredFirebaseConfig(_config: FirebaseConfig): void {}
export function removeStoredFirebaseConfig(): void {}
export function initFirebase() {
  return db;
}
export function isFirebaseConnected(): boolean {
  return true;
}

function getCustomLocalProjects(): Project[] {
  try {
    const raw = localStorage.getItem('webrex_custom_projects');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Subscribe to 'projects' collection
export function subscribeToProjects(
  onProjectsUpdated: (projects: Project[], isLiveFromFirestore: boolean) => void
): () => void {
  try {
    const projectsCol = collection(db, 'projects');
    const unsubscribe = onSnapshot(
      projectsCol,
      (snapshot) => {
        if (snapshot.empty) {
          onProjectsUpdated(getCustomLocalProjects(), true);
        } else {
          const list: Project[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              title: data.title || 'مشروع برمجي',
              description: data.description || '',
              tag: data.tag || 'مشروع ويب',
              image:
                data.image ||
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
              demoUrl: data.demoUrl || '#',
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || new Date(),
            };
          });
          onProjectsUpdated(list, true);
        }
      },
      (error) => {
        console.warn('Firestore projects listener fallback:', error);
        onProjectsUpdated(getCustomLocalProjects(), false);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not setup Firestore snapshot listener:', err);
    onProjectsUpdated(getCustomLocalProjects(), false);
    return () => {};
  }
}

// Fetch projects once
export async function fetchProjects(): Promise<{ projects: Project[]; isLive: boolean }> {
  try {
    const projectsCol = collection(db, 'projects');
    const snapshot = await getDocs(projectsCol);
    if (snapshot.empty) {
      return { projects: getCustomLocalProjects(), isLive: true };
    }
    const projects: Project[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title || 'مشروع برمجي',
        description: data.description || '',
        tag: data.tag || 'مشروع ويب',
        image:
          data.image ||
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        demoUrl: data.demoUrl || '#',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || new Date(),
      };
    });
    return { projects, isLive: true };
  } catch (error) {
    console.warn('Error fetching projects from Firestore:', error);
    return { projects: getCustomLocalProjects(), isLive: false };
  }
}

// Submit order to 'orders' collection (Public create allowed by security rules)
export async function submitOrderToFirestore(orderData: {
  name: string;
  phone: string;
  details: string;
}): Promise<{ success: boolean; id?: string; mode: 'firestore' | 'local'; error?: string }> {
  saveLocalOrder(orderData);

  const safeOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const payload = {
    name: orderData.name.trim().slice(0, 150),
    phone: orderData.phone.trim().slice(0, 40),
    details: orderData.details.trim().slice(0, 4000),
    timestamp: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'orders', safeOrderId), payload);
    return {
      success: true,
      id: safeOrderId,
      mode: 'firestore',
    };
  } catch (error: any) {
    console.error('Error submitting order to Firestore:', error);
    return {
      success: true,
      id: safeOrderId,
      mode: 'local',
    };
  }
}

// Subscribe to orders from Firestore when Admin is authenticated
export function subscribeToOrdersFromFirestore(
  onOrdersUpdated: (orders: Order[]) => void
): () => void {
  if (!auth.currentUser) {
    onOrdersUpdated(getLocalOrders());
    return () => {};
  }

  return onSnapshot(
    collection(db, 'orders'),
    (snapshot) => {
      const cloudOrders: Order[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const ts = data.timestamp?.toDate
          ? data.timestamp.toDate().toISOString()
          : typeof data.timestamp === 'string'
          ? data.timestamp
          : new Date().toISOString();
        return {
          id: docSnap.id,
          name: data.name || '',
          phone: data.phone || '',
          details: data.details || '',
          timestamp: ts,
        };
      });
      const localOrders = getLocalOrders();
      const mergedMap = new Map<string, Order>();
      [...cloudOrders, ...localOrders].forEach((o) => {
        if (o.id) mergedMap.set(o.id, o);
      });
      const merged = Array.from(mergedMap.values()).sort((a, b) =>
        String(b.timestamp || '').localeCompare(String(a.timestamp || ''))
      );
      onOrdersUpdated(merged);
    },
    (error) => {
      console.warn('Orders listener fallback to local:', error);
      onOrdersUpdated(getLocalOrders());
    }
  );
}

export async function deleteOrderFromCloudAndLocal(orderId: string): Promise<void> {
  deleteLocalOrder(orderId);
  if (auth.currentUser) {
    const safeId = orderId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
    try {
      await deleteDoc(doc(db, 'orders', safeId));
    } catch (error) {
      console.warn('Could not delete order from Firestore:', error);
    }
  }
}

// Local storage orders helper
function saveLocalOrder(order: { name: string; phone: string; details: string }) {
  try {
    const existingRaw = localStorage.getItem(LOCAL_ORDERS_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    existing.unshift({
      ...order,
      id: 'ORD-' + Date.now(),
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.warn('Could not save order locally:', e);
  }
}

export function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteLocalOrder(orderId: string): void {
  try {
    const orders = getLocalOrders().filter((o) => o.id !== orderId);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('Could not delete local order:', e);
  }
}

export async function addProjectToFirestore(project: {
  title: string;
  description: string;
  tag: string;
  image: string;
  demoUrl: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  // Always save locally too so it appears immediately
  let localId = 'PROJ-' + Date.now();
  try {
    const stored = localStorage.getItem('webrex_custom_projects');
    const list = stored ? JSON.parse(stored) : [];
    const newProj = {
      id: localId,
      ...project,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newProj);
    localStorage.setItem('webrex_custom_projects', JSON.stringify(list));
  } catch (e) {
    console.warn(e);
  }

  if (auth.currentUser) {
    try {
      const projectsCol = collection(db, 'projects');
      const docRef = await addDoc(projectsCol, {
        title: project.title.trim().slice(0, 200),
        description: project.description.trim().slice(0, 3000),
        tag: project.tag.trim().slice(0, 100),
        image: project.image.trim().slice(0, 500000),
        demoUrl: project.demoUrl.trim().slice(0, 2048),
        createdAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    }
  }

  return { success: true, id: localId };
}

export function getDeveloperApplicants(): any[] {
  try {
    const raw = localStorage.getItem('webrex_developer_applicants');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteDeveloperApplicant(id: string): void {
  try {
    const list = getDeveloperApplicants().filter((a) => a.id !== id);
    localStorage.setItem('webrex_developer_applicants', JSON.stringify(list));
  } catch (e) {
    console.warn(e);
  }
}
