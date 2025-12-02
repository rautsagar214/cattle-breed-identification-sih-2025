import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
// COMMENTED OUT: FileSystem not currently used in implementation
import * as FileSystem from 'expo-file-system';

export interface OfflineResult {
  id: string;
  userId: string;
  breedName: string;
  confidence: number;
  imageUri: string; // Local file path
  characteristics?: string[];
  careTips?: string[];
  timestamp: string;
  synced: boolean;
}

export interface PendingUpload {
  id: string;
  userId: string;
  imageUri: string;
  result: OfflineResult;
  timestamp: string;
}

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

const STORAGE_KEYS = {
  OFFLINE_RESULTS: '@cattle_app:offline_results',
  PENDING_UPLOADS: '@cattle_app:pending_uploads',
  USER_CACHE: '@cattle_app:user_cache',
  LAST_SYNC: '@cattle_app:last_sync',
};

export const checkNetworkStatus = async (): Promise<NetworkStatus> => {
  try {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    };
  } catch (error) {
    console.error('Error checking network:', error);
    return {
      isConnected: false,
      isInternetReachable: false,
      type: 'unknown',
    };
  }
};

export const subscribeToNetworkChanges = (
  callback: (status: NetworkStatus) => void
): (() => void) => {
  const unsubscribe = NetInfo.addEventListener((state: any) => {
    callback({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    });
  });

  return unsubscribe;
};

export const saveImageLocally = async (
  imageUri: string,
  userId: string
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const fileName = `cattle_${userId}_${timestamp}.jpg`;
    const destination = `${FileSystem.documentDirectory}${fileName}`;

    // Copy file to app's document directory
    await FileSystem.copyAsync({
      from: imageUri,
      to: destination
    });

    console.log('Image saved locally to file system:', destination);
    return destination;
  } catch (error: any) {
    console.error('Error saving image locally:', error);
    throw new Error(`Failed to save image locally: ${error.message}`);
  }
};

export const deleteLocalImage = async (imageUri: string): Promise<void> => {
  try {
    // Only delete if it's a file in our document directory
    if (imageUri.startsWith('file://') && imageUri.includes(FileSystem.documentDirectory || '')) {
      await FileSystem.deleteAsync(imageUri, { idempotent: true });
      console.log('Local image deleted:', imageUri);
    }
  } catch (error) {
    console.error('Error deleting local image:', error);
  }
};

export const saveResultOffline = async (result: OfflineResult): Promise<void> => {
  try {
    // Get existing results
    const existingResults = await getOfflineResults();

    // Add new result
    const updatedResults = [result, ...existingResults];

    // Save to AsyncStorage
    await AsyncStorage.setItem(
      STORAGE_KEYS.OFFLINE_RESULTS,
      JSON.stringify(updatedResults)
    );

    console.log('Result saved offline:', result.id);
  } catch (error: any) {
    console.error('Error saving result offline:', error);
    throw new Error(`Failed to save offline: ${error.message}`);
  }
};

/**
 * Get all offline results
 * @returns Array of offline results
 */
export const getOfflineResults = async (): Promise<OfflineResult[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_RESULTS);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error getting offline results:', error);
    return [];
  }
};

/**
 * Get offline results for specific user
 * @param userId User's ID
 * @returns Array of user's offline results
 */
export const getOfflineResultsByUser = async (
  userId: string
): Promise<OfflineResult[]> => {
  try {
    const allResults = await getOfflineResults();
    return allResults.filter(result => result.userId === userId);
  } catch (error) {
    console.error('Error getting user offline results:', error);
    return [];
  }
};

/**
 * Mark offline result as synced
 * @param resultId Result ID
 */
export const markResultAsSynced = async (resultId: string): Promise<void> => {
  try {
    const results = await getOfflineResults();
    const updatedResults = results.map(result =>
      result.id === resultId ? { ...result, synced: true } : result
    );

    await AsyncStorage.setItem(
      STORAGE_KEYS.OFFLINE_RESULTS,
      JSON.stringify(updatedResults)
    );

    console.log('Result marked as synced:', resultId);
  } catch (error) {
    console.error('Error marking result as synced:', error);
  }
};

/**
 * Clear all synced offline results (cleanup)
 */
export const clearSyncedResults = async (): Promise<void> => {
  try {
    const results = await getOfflineResults();
    const unsyncedResults = results.filter(result => !result.synced);

    await AsyncStorage.setItem(
      STORAGE_KEYS.OFFLINE_RESULTS,
      JSON.stringify(unsyncedResults)
    );

    console.log('Synced results cleared');
  } catch (error) {
    console.error('Error clearing synced results:', error);
  }
};

// ==========================================
// Pending Uploads Queue
// ==========================================

/**
 * Add upload to pending queue (for when offline)
 * @param upload Pending upload data
 */
export const addToPendingQueue = async (
  upload: PendingUpload
): Promise<void> => {
  try {
    const queue = await getPendingUploads();
    queue.push(upload);

    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_UPLOADS,
      JSON.stringify(queue)
    );

    console.log('Added to pending upload queue:', upload.id);
  } catch (error: any) {
    console.error('Error adding to pending queue:', error);
    throw new Error(`Failed to queue upload: ${error.message}`);
  }
};

/**
 * Get all pending uploads
 * @returns Array of pending uploads
 */
export const getPendingUploads = async (): Promise<PendingUpload[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_UPLOADS);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error getting pending uploads:', error);
    return [];
  }
};

/**
 * Remove upload from pending queue
 * @param uploadId Upload ID
 */
export const removeFromPendingQueue = async (
  uploadId: string
): Promise<void> => {
  try {
    const queue = await getPendingUploads();
    const updatedQueue = queue.filter(upload => upload.id !== uploadId);

    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_UPLOADS,
      JSON.stringify(updatedQueue)
    );

    console.log('Removed from pending queue:', uploadId);
  } catch (error) {
    console.error('Error removing from pending queue:', error);
  }
};

/**
 * Get count of pending uploads
 * @returns Number of pending uploads
 */
export const getPendingUploadCount = async (): Promise<number> => {
  try {
    const queue = await getPendingUploads();
    return queue.length;
  } catch (error) {
    console.error('Error getting pending upload count:', error);
    return 0;
  }
};

// ==========================================
// Cache Management
// ==========================================

/**
 * Cache user data locally
 * @param userId User ID
 * @param userData User data object
 */
export const cacheUserData = async (
  userId: string,
  userData: any
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.USER_CACHE}_${userId}`,
      JSON.stringify(userData)
    );
    console.log('User data cached');
  } catch (error) {
    console.error('Error caching user data:', error);
  }
};

/**
 * Get cached user data
 * @param userId User ID
 * @returns Cached user data or null
 */
export const getCachedUserData = async (userId: string): Promise<any | null> => {
  try {
    const data = await AsyncStorage.getItem(`${STORAGE_KEYS.USER_CACHE}_${userId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cached user data:', error);
    return null;
  }
};

/**
 * Update last sync timestamp
 */
export const updateLastSyncTime = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_SYNC,
      new Date().toISOString()
    );
  } catch (error) {
    console.error('Error updating last sync time:', error);
  }
};

/**
 * Get last sync timestamp
 * @returns Last sync time or null
 */
export const getLastSyncTime = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return null;
  }
};

/**
 * Clear all app data (use with caution)
 */
export const clearAllAppData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.OFFLINE_RESULTS,
      STORAGE_KEYS.PENDING_UPLOADS,
      STORAGE_KEYS.USER_CACHE,
      STORAGE_KEYS.LAST_SYNC,
    ]);
    console.log('All app data cleared');
  } catch (error) {
    console.error('Error clearing app data:', error);
  }
};

// ==========================================
// Default Export
// ==========================================

export default {
  // Network
  checkNetworkStatus,
  subscribeToNetworkChanges,

  // Local Storage
  saveImageLocally,
  deleteLocalImage,

  // Offline Results
  saveResultOffline,
  getOfflineResults,
  getOfflineResultsByUser,
  markResultAsSynced,
  clearSyncedResults,

  // Upload Queue
  addToPendingQueue,
  getPendingUploads,
  removeFromPendingQueue,
  getPendingUploadCount,

  // Cache
  cacheUserData,
  getCachedUserData,
  updateLastSyncTime,
  getLastSyncTime,
  clearAllAppData,
};
