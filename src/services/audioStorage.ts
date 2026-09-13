// IndexedDB service for storing custom user audio files offline
import { CustomTrack } from '../types';

const DB_NAME = 'calm_corner_audio_db';
const DB_VERSION = 1;
const STORE_NAME = 'audio_files';
const KEY_TRACK = 'current_custom_track';
const KEY_BLOB = 'current_custom_blob';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported on this device'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCustomAudio(file: File): Promise<CustomTrack> {
  const db = await openDB();
  const trackMeta: CustomTrack = {
    id: 'custom-track-1',
    name: file.name.replace(/\.[^/.]+$/, ''), // Clean file name without extension
    size: file.size,
    type: file.type || 'audio/mpeg',
    uploadedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    store.put(trackMeta, KEY_TRACK);
    store.put(file, KEY_BLOB);

    tx.oncomplete = () => resolve(trackMeta);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCustomAudioTrack(): Promise<CustomTrack | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(KEY_TRACK);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function getCustomAudioBlob(): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(KEY_BLOB);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function deleteCustomAudio(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      store.delete(KEY_TRACK);
      store.delete(KEY_BLOB);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore errors
  }
}
