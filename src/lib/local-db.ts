// Local Database Manager for Gate Guard App
// This module handles all interactions with IndexedDB for offline pass storage

const DB_NAME = 'GateGuardDB';
const DB_VERSION = 1;
const PASSES_STORE = 'passes';

/**
 * Initialize the IndexedDB database
 * This creates the database structure if it doesn't exist
 * and sets up indexes for fast searching
 */
export async function initDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // This runs only when the database is created for the first time
    // or when the version number is increased
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      
      // Delete old store if it exists (for clean upgrades)
      if (db.objectStoreNames.contains(PASSES_STORE)) {
        db.deleteObjectStore(PASSES_STORE);
      }

      // Create the passes object store
      // We use the pass ID as the primary key
      const passesStore = db.createObjectStore(PASSES_STORE, { 
        keyPath: 'id' 
      });

      // Create indexes for fast searching
      // Index on plate number combination for quick lookups
      passesStore.createIndex('plateSearch', ['plateAlpha', 'plateNum'], { 
        unique: false 
      });

      // Index on status for filtering active passes
      passesStore.createIndex('status', 'status', { 
        unique: false 
      });

      // Index on expiration date for finding expired passes
      passesStore.createIndex('expiresAt', 'expiresAt', { 
        unique: false 
      });

      console.log('[LocalDB] Database structure created successfully');
    };

    request.onsuccess = (event: any) => {
      console.log('[LocalDB] Database opened successfully');
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      console.error('[LocalDB] Database error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Store multiple passes in IndexedDB
 * This replaces all existing passes with the new data from Firebase
 */
export async function storePasses(passes: any[]): Promise<void> {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PASSES_STORE], 'readwrite');
    const store = transaction.objectStore(PASSES_STORE);

    // Clear all existing passes first
    const clearRequest = store.clear();
    
    clearRequest.onsuccess = () => {
      console.log('[LocalDB] Cleared old passes, adding new data...');
      
      // Add all new passes
      let addedCount = 0;
      passes.forEach(pass => {
        // Convert Firestore Timestamp to regular date for storage
        const passData = {
          ...pass,
          expiresAt: pass.expiresAt?.toDate?.() || pass.expiresAt,
          createdAt: pass.createdAt?.toDate?.() || pass.createdAt,
        };
        
        store.add(passData);
        addedCount++;
      });

      console.log(`[LocalDB] Added ${addedCount} passes to local database`);
    };

    transaction.oncomplete = () => {
      console.log('[LocalDB] All passes stored successfully');
      db.close();
      resolve();
    };

    transaction.onerror = (event: any) => {
      console.error('[LocalDB] Transaction error:', event.target.error);
      db.close();
      reject(event.target.error);
    };
  });
}

/**
 * Search for a pass by plate number in local database
 * This is what gets called when offline
 */
export async function searchPassLocally(
  plateAlpha: string, 
  plateNum: string
): Promise<any | null> {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PASSES_STORE], 'readonly');
    const store = transaction.objectStore(PASSES_STORE);
    const index = store.index('plateSearch');

    // Search using the compound index
    const request = index.get([plateAlpha.toUpperCase(), plateNum]);

    request.onsuccess = (event: any) => {
      const pass = event.target.result;
      
      if (pass) {
        console.log('[LocalDB] Pass found in local database:', pass.id);
        
        // Check if pass has expired
        const now = new Date();
        const expiresAt = new Date(pass.expiresAt);
        
        if (expiresAt < now) {
          pass.expired = true;
        }
        
        resolve(pass);
      } else {
        console.log('[LocalDB] No pass found for plate:', plateAlpha, plateNum);
        resolve(null);
      }
      
      db.close();
    };

    request.onerror = (event: any) => {
      console.error('[LocalDB] Search error:', event.target.error);
      db.close();
      reject(event.target.error);
    };
  });
}

/**
 * Get a pass by ID from local database
 * Used when scanning QR codes offline
 */
export async function getPassById(passId: string): Promise<any | null> {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PASSES_STORE], 'readonly');
    const store = transaction.objectStore(PASSES_STORE);
    const request = store.get(passId);

    request.onsuccess = (event: any) => {
      const pass = event.target.result;
      
      if (pass) {
        console.log('[LocalDB] Pass found by ID:', passId);
        
        // Check expiration
        const now = new Date();
        const expiresAt = new Date(pass.expiresAt);
        
        if (expiresAt < now) {
          pass.expired = true;
        }
        
        resolve(pass);
      } else {
        console.log('[LocalDB] No pass found with ID:', passId);
        resolve(null);
      }
      
      db.close();
    };

    request.onerror = (event: any) => {
      console.error('[LocalDB] Get by ID error:', event.target.error);
      db.close();
      reject(event.target.error);
    };
  });
}

/**
 * Get count of passes stored locally
 * Useful for showing sync status to users
 */
export async function getPassCount(): Promise<number> {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PASSES_STORE], 'readonly');
    const store = transaction.objectStore(PASSES_STORE);
    const request = store.count();

    request.onsuccess = (event: any) => {
      const count = event.target.result;
      console.log(`[LocalDB] Total passes in local database: ${count}`);
      db.close();
      resolve(count);
    };

    request.onerror = (event: any) => {
      console.error('[LocalDB] Count error:', event.target.error);
      db.close();
      reject(event.target.error);
    };
  });
}

/**
 * Get the last sync timestamp from localStorage
 */
export function getLastSyncTime(): Date | null {
  const timestamp = localStorage.getItem('lastSyncTime');
  return timestamp ? new Date(timestamp) : null;
}

/**
 * Update the last sync timestamp
 */
export function setLastSyncTime(): void {
  localStorage.setItem('lastSyncTime', new Date().toISOString());
}
