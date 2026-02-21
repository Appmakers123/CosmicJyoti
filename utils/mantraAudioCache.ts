/**
 * Persistent cache for mantra TTS audio (IndexedDB).
 * Keyed by mantra id + language code so we can play again without calling the API.
 */

const DB_NAME = 'cosmicjyoti_mantra_audio';
const STORE_NAME = 'mantra_audio';
const DB_VERSION = 1;

function cacheKey(mantraId: string, languageCode: string): string {
  return `${mantraId}_${languageCode}`;
}

function openDb(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not available'));
  }
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export interface CachedMantraAudio {
  id: string;
  base64: string;
  createdAt: number;
}

export async function getCachedMantraAudio(mantraId: string, languageCode: string): Promise<string | null> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(cacheKey(mantraId, languageCode));
      req.onsuccess = () => {
        const row = req.result as CachedMantraAudio | undefined;
        resolve(row?.base64 ?? null);
      };
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  } catch {
    return null;
  }
}

export async function setCachedMantraAudio(mantraId: string, languageCode: string, base64: string): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id: cacheKey(mantraId, languageCode), base64, createdAt: Date.now() });
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('mantraAudioCache set failed:', e);
  }
}
