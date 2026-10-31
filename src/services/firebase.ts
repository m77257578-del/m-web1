import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
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
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Project, Order, FirebaseConfig } from '../types';
import { sanitizeForFirestore, toSafeFirestoreId } from '../utils/imageCompressor';

// Initialize official provisioned Firebase App & Firestore Database
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const LOCAL_ORDERS_KEY = 'webrex_local_orders';
const LOCAL_APPLICANTS_KEY = 'webrex_developer_applicants';
export const CLOUD_SYNC_STATUS_EVENT = 'mweb_cloud_sync_status';

export interface CloudSyncStatusDetail {
  status: 'syncing' | 'synced' | 'error';
  path: string;
  timestamp: string;
  errorMessage?: string;
}

function emitCloudSyncStatus(detail: CloudSyncStatusDetail) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('mweb_last_cloud_sync', JSON.stringify(detail));
      window.dispatchEvent(new CustomEvent(CLOUD_SYNC_STATUS_EVENT, { detail }));
    } catch {
      // ignore storage errors
    }
  }
}

export function getLastCloudSyncStatus(): CloudSyncStatusDetail | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('mweb_last_cloud_sync');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

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
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
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
  emitCloudSyncStatus({
    status: 'error',
    path: path || 'unknown',
    timestamp: new Date().toISOString(),
    errorMessage: errMsg,
  });
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    emitCloudSyncStatus({
      status: 'synced',
      path: 'test/connection',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
if (typeof window !== 'undefined') {
  testConnection();
}

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

/**
 * Writes a catalog or settings document directly to Cloud Firestore (`ai-studio-mweb-...`).
 * Works both with Admin Passcode authentication and Google Auth across all phones/devices.
 */
export async function syncCatalogDocToFirestore(
  collectionName: string,
  itemId: string,
  payload: Record<string, any>
): Promise<void> {
  const safeId = toSafeFirestoreId(itemId, 'item');
  const path = `${collectionName}/${safeId}`;
  const cleanPayload = sanitizeForFirestore(payload);

  emitCloudSyncStatus({
    status: 'syncing',
    path,
    timestamp: new Date().toISOString(),
  });

  try {
    await setDoc(doc(db, collectionName, safeId), {
      id: safeId,
      payload: cleanPayload,
      updatedAt: serverTimestamp(),
    });
    emitCloudSyncStatus({
      status: 'synced',
      path,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCatalogDocFromFirestore(
  collectionName: string,
  itemId: string
): Promise<void> {
  const safeId = toSafeFirestoreId(itemId, '');
  if (!safeId) return;
  const path = `${collectionName}/${safeId}`;

  emitCloudSyncStatus({
    status: 'syncing',
    path,
    timestamp: new Date().toISOString(),
  });

  try {
    await deleteDoc(doc(db, collectionName, safeId));
    emitCloudSyncStatus({
      status: 'synced',
      path,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribes in real-time to a single settings document `settings/{docId}`.
 * When `docSnap.exists()` is true, calls `onDocUpdated(payload)`.
 * When `docSnap.exists()` is false (never created in cloud yet), calls `onDocMissing?.()`
 * so a device with existing local edits can seed the cloud automatically.
 */
export function subscribeToSettingsDoc<T>(
  docId: string,
  onDocUpdated: (data: T) => void,
  onDocMissing?: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  const safeId = toSafeFirestoreId(docId, 'setting');
  try {
    return onSnapshot(
      doc(db, 'settings', safeId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.payload !== undefined) {
            onDocUpdated(data.payload as T);
          }
        } else if (!docSnap.metadata.fromCache) {
          onDocMissing?.();
        }
      },
      (error) => {
        console.warn(`Firestore settings doc listener notice for settings/${safeId}:`, error);
      }
    );
  } catch (e) {
    console.warn(`Could not subscribe to settings/${safeId}:`, e);
    return () => {};
  }
}

/**
 * Subscribes in real-time to a multi-document catalog collection
 * (`demo_platforms`, `client_projects`, `articles`, `payment_methods`).
 */
export function subscribeToCatalogCollection<T>(
  collectionName: string,
  onItemsUpdated: (items: T[], isEmpty: boolean) => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  try {
    return onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        if (snapshot.empty) {
          if (!snapshot.metadata.fromCache) {
            onItemsUpdated([], true);
          }
          return;
        }
        const items: T[] = [];
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.payload) {
            items.push(data.payload as T);
          }
        });
        onItemsUpdated(items, items.length === 0);
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
          try {
            localStorage.setItem('webrex_custom_projects', JSON.stringify(list));
          } catch {
            // ignore
          }
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
  const safeOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  saveLocalOrder(orderData, safeOrderId);

  const payload = {
    name: (orderData.name || 'عميل').trim().slice(0, 150),
    phone: (orderData.phone || '000').trim().slice(0, 40),
    details: (orderData.details || 'طلب منصة').trim().slice(0, 4000),
    timestamp: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'orders', safeOrderId), payload);
    emitCloudSyncStatus({
      status: 'synced',
      path: `orders/${safeOrderId}`,
      timestamp: new Date().toISOString(),
    });
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

// Subscribe to orders from Firestore across all devices
export function subscribeToOrdersFromFirestore(
  onOrdersUpdated: (orders: Order[]) => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  try {
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
        try {
          localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(merged.slice(0, 100)));
        } catch {
          // ignore
        }
        onOrdersUpdated(merged);
      },
      (error) => {
        console.warn('Orders listener fallback to local:', error);
        onOrdersUpdated(getLocalOrders());
      }
    );
  } catch {
    onOrdersUpdated(getLocalOrders());
    return () => {};
  }
}

export async function deleteOrderFromCloudAndLocal(orderId: string): Promise<void> {
  deleteLocalOrder(orderId);
  const safeId = toSafeFirestoreId(orderId, '');
  if (safeId) {
    try {
      await deleteDoc(doc(db, 'orders', safeId));
    } catch (error) {
      console.warn('Could not delete order from Firestore:', error);
    }
  }
}

// Local storage orders helper
function saveLocalOrder(order: { name: string; phone: string; details: string }, customId?: string) {
  try {
    const existingRaw = localStorage.getItem(LOCAL_ORDERS_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    existing.unshift({
      ...order,
      id: customId || 'ORD-' + Date.now(),
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(existing.slice(0, 100)));
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
  const localId = 'PROJ-' + Date.now();
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

  try {
    const projectsCol = collection(db, 'projects');
    const docRef = await addDoc(projectsCol, {
      title: (project.title || 'مشروع برمجي').trim().slice(0, 200),
      description: (project.description || '').trim().slice(0, 3000),
      tag: (project.tag || 'مشروع ويب').trim().slice(0, 100),
      image: (project.image || '').trim().slice(0, 750000),
      demoUrl: (project.demoUrl || '#').trim().slice(0, 2048),
      createdAt: serverTimestamp(),
    });
    emitCloudSyncStatus({
      status: 'synced',
      path: `projects/${docRef.id}`,
      timestamp: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.warn('Could not sync project to Firestore:', error);
    return { success: true, id: localId };
  }
}

// Developer Applicants Cloud Sync (settings/developer_applicants)
if (typeof window !== 'undefined') {
  subscribeToSettingsDoc<{ items: any[] }>(
    'developer_applicants',
    (data) => {
      if (data && Array.isArray(data.items)) {
        try {
          localStorage.setItem(LOCAL_APPLICANTS_KEY, JSON.stringify(data.items));
          window.dispatchEvent(new CustomEvent('developer_applicants_updated', { detail: data.items }));
        } catch {
          // ignore
        }
      }
    },
    () => {
      const local = getDeveloperApplicants();
      if (local.length > 0) {
        syncCatalogDocToFirestore('settings', 'developer_applicants', { items: local }).catch(() => {});
      }
    }
  );
}

export function getDeveloperApplicants(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_APPLICANTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDeveloperApplicant(applicant: Record<string, any>): void {
  try {
    const list = getDeveloperApplicants();
    list.unshift(applicant);
    const trimmed = list.slice(0, 80);
    localStorage.setItem(LOCAL_APPLICANTS_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent('developer_applicants_updated', { detail: trimmed }));
    syncCatalogDocToFirestore('settings', 'developer_applicants', { items: trimmed }).catch((e) =>
      console.warn('Could not sync developer applicants to Firestore:', e)
    );
  } catch (e) {
    console.warn(e);
  }
}

export function deleteDeveloperApplicant(id: string): void {
  try {
    const list = getDeveloperApplicants().filter((a) => a.id !== id);
    localStorage.setItem(LOCAL_APPLICANTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('developer_applicants_updated', { detail: list }));
    syncCatalogDocToFirestore('settings', 'developer_applicants', { items: list }).catch((e) =>
      console.warn('Could not sync deleted applicant to Firestore:', e)
    );
  } catch (e) {
    console.warn(e);
  }
}
