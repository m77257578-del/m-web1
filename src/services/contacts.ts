import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { initFirebase } from './firebase';

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  timestamp?: any;
}

const LOCAL_CONTACTS_KEY = 'webrex_local_contacts';

export async function submitContactMessage(contactData: {
  name: string;
  email: string;
  message: string;
}): Promise<{ success: boolean; id?: string; mode: 'firestore' | 'local'; error?: string }> {
  // Always save locally as fallback
  saveLocalContact(contactData);

  const db = initFirebase();
  if (!db) {
    return {
      success: true,
      id: 'LOC-CNT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      mode: 'local'
    };
  }

  try {
    const contactsCol = collection(db, 'contacts');
    const docRef = await addDoc(contactsCol, {
      name: contactData.name.trim(),
      email: contactData.email.trim(),
      message: contactData.message.trim(),
      timestamp: serverTimestamp()
    });

    return {
      success: true,
      id: docRef.id,
      mode: 'firestore'
    };
  } catch (error: any) {
    console.error('Error submitting contact to Firestore:', error);
    return {
      success: false,
      mode: 'firestore',
      error: error?.message || 'حدث خطأ أثناء الاتصال بقاعدة البيانات. تم حفظ رسالتك محلياً.'
    };
  }
}

function saveLocalContact(contact: { name: string; email: string; message: string }) {
  try {
    const existingRaw = localStorage.getItem(LOCAL_CONTACTS_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    existing.unshift({
      ...contact,
      id: 'CNT-' + Date.now(),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(LOCAL_CONTACTS_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.warn('Could not save contact locally:', e);
  }
}

export function getLocalContacts(): ContactMessage[] {
  try {
    const raw = localStorage.getItem(LOCAL_CONTACTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteLocalContact(id: string): void {
  try {
    const list = getLocalContacts().filter(c => c.id !== id);
    localStorage.setItem(LOCAL_CONTACTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not delete local contact:', e);
  }
}
