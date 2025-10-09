// Sync Manager for Gate Guard App
// Handles synchronizing pass data between Firebase and local IndexedDB

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, passConverter } from '@/lib/firestore';
import { storePasses, setLastSyncTime, getPassCount } from './local-db';

/**
 * Download all active passes from Firebase and store them locally
 * This function should be called whenever the app comes online
 */
export async function syncPassesFromFirebase(): Promise<{
  success: boolean;
  passCount: number;
  error?: string;
}> {
  console.log('[Sync] Starting pass synchronization from Firebase...');
  
  try {
    // Query Firebase for all active passes
    // We only sync active passes to save space and improve performance
    const passesQuery = query(
      collection(db, 'passes'),
      where('status', '==', 'active')
    ).withConverter(passConverter);

    console.log('[Sync] Fetching passes from Firebase...');
    const querySnapshot = await getDocs(passesQuery);

    // Convert Firestore documents to plain objects
    const passes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`[Sync] Downloaded ${passes.length} passes from Firebase`);

    // Store all passes in IndexedDB
    await storePasses(passes);

    // Update the last sync timestamp
    setLastSyncTime();

    // Get final count to confirm storage
    const storedCount = await getPassCount();

    console.log(`[Sync] Sync completed successfully. ${storedCount} passes stored locally.`);

    return {
      success: true,
      passCount: storedCount
    };

  } catch (error: any) {
    console.error('[Sync] Synchronization failed:', error);
    
    return {
      success: false,
      passCount: 0,
      error: error.message || 'Unknown sync error'
    };
  }
}

/**
 * Check if we have any passes stored locally
 * Used to determine if we need an initial sync
 */
export async function hasLocalData(): Promise<boolean> {
  try {
    const count = await getPassCount();
    return count > 0;
  } catch (error) {
    console.error('[Sync] Error checking local data:', error);
    return false;
  }
}

/**
 * Initialize sync manager and set up automatic syncing
 * This should be called when the app loads
 */
export function initializeSyncManager(
  onSyncComplete?: (result: { success: boolean; passCount: number }) => void
): void {
  console.log('[Sync] Initializing sync manager...');

  // Perform initial sync if online
  if (navigator.onLine) {
    console.log('[Sync] Device is online, performing initial sync...');
    syncPassesFromFirebase().then(result => {
      if (onSyncComplete) {
        onSyncComplete(result);
      }
    });
  } else {
    console.log('[Sync] Device is offline, sync will occur when connection is restored');
  }

  // Listen for online event - fires when device connects to network
  window.addEventListener('online', () => {
    console.log('[Sync] Device came online, triggering automatic sync...');
    
    syncPassesFromFirebase().then(result => {
      if (result.success) {
        console.log(`[Sync] Auto-sync successful: ${result.passCount} passes updated`);
        
        // Show notification to user
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Gate Guard', {
            body: `Pass database updated: ${result.passCount} passes synced`,
            icon: '/icon-192.png'
          });
        }
      } else {
        console.error('[Sync] Auto-sync failed:', result.error);
      }
      
      if (onSyncComplete) {
        onSyncComplete(result);
      }
    });
  });

  // Listen for offline event - fires when device loses network
  window.addEventListener('offline', () => {
    console.log('[Sync] Device went offline, will use local database');
  });

  console.log('[Sync] Sync manager initialized, listening for network changes');
}
