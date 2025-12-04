import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';
import { getUnsyncedScans, markAsSynced, ScanResult, getUnsyncedRegistrations, markRegistrationAsSynced, Registration } from './db';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

let isSyncing = false;

export const syncPendingScans = async () => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
        console.log('📴 Offline, skipping sync');
        return;
    }

    if (isSyncing) {
        console.log('🔒 Sync already in progress, skipping');
        return;
    }

    console.log('🔄 Checking for pending scans to sync...');
    isSyncing = true;

    try {
        const unsyncedScans = await getUnsyncedScans();

        if (unsyncedScans.length === 0) {
            console.log('✅ No pending scans to sync');
        } else {
            console.log(`🚀 Found ${unsyncedScans.length} scans to sync`);
            for (const scan of unsyncedScans) {
                await syncSingleScan(scan);
            }
            console.log('🎉 Sync completed');
        }
    } catch (error) {
        console.error('❌ Sync failed:', error);
    } finally {
        isSyncing = false;
    }

    // Also sync registrations
    await syncPendingRegistrations();
};

export const syncPendingRegistrations = async () => {
    if (isSyncing) {
        console.log('🔒 Registration Sync already in progress (or blocked by main sync), skipping');
        return;
    }

    console.log('🔄 Checking for pending registrations to sync...');
    isSyncing = true;

    try {
        const unsyncedRegistrations = await getUnsyncedRegistrations();

        if (unsyncedRegistrations.length === 0) {
            console.log('✅ No pending registrations to sync');
        } else {
            console.log(`🚀 Found ${unsyncedRegistrations.length} registrations to sync`);
            for (const reg of unsyncedRegistrations) {
                await syncSingleRegistration(reg);
            }
            console.log('🎉 Registration Sync completed');
        }
    } catch (error) {
        console.error('❌ Registration Sync failed:', error);
    } finally {
        isSyncing = false;
    }
};

const syncSingleScan = async (scan: ScanResult) => {
    try {
        console.log(`📤 Syncing scan ID: ${scan.id}`);

        if (!scan.imageUris || scan.imageUris.length === 0) {
            console.warn(`⚠️ Scan ${scan.id} has no images, skipping`);
            return;
        }

        const imagesBase64: string[] = [];

        for (const uri of scan.imageUris) {
            try {
                const base64 = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                imagesBase64.push(base64);
            } catch (readError) {
                console.error(`❌ Failed to read image file ${uri} for scan ${scan.id}:`, readError);
            }
        }

        if (imagesBase64.length === 0) {
            console.error(`❌ No images could be read for scan ${scan.id}, skipping sync`);
            return;
        }

        const payload = {
            imagesBase64: imagesBase64,
            predictions: scan.predictions,
            latitude: scan.latitude,
            longitude: scan.longitude,
            locationName: scan.locationName,
            timestamp: scan.timestamp,
            userId: scan.userId,
            userRole: scan.userRole
        };

        const response = await axios.post(`${API_URL}/api/history/sync`, payload);

        if (response.data.success) {
            const { dbId } = response.data.data;
            if (scan.id !== undefined) {
                await markAsSynced(scan.id, dbId);
            }
        }

    } catch (error) {
        console.error(`❌ Failed to sync scan ${scan.id}:`, error);
    }
};

const syncSingleRegistration = async (reg: Registration) => {
    try {
        console.log(`📤 Syncing registration ID: ${reg.id}`);

        if (!reg.imageUris || reg.imageUris.length === 0) {
            console.warn(`⚠️ Registration ${reg.id} has no images, skipping`);
            return;
        }

        const imagesBase64: string[] = [];

        for (const uri of reg.imageUris) {
            try {
                const base64 = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                imagesBase64.push(base64);
            } catch (readError) {
                console.error(`❌ Failed to read image file ${uri} for registration ${reg.id}:`, readError);
            }
        }

        if (imagesBase64.length === 0) {
            console.error(`❌ No images could be read for registration ${reg.id}, skipping sync`);
            return;
        }

        const payload = {
            ...reg,
            imagesBase64: imagesBase64,
        };

        const response = await axios.post(`${API_URL}/api/registration/sync`, payload);

        if (response.data.success) {
            const { dbId } = response.data.data;
            if (reg.id !== undefined) {
                await markRegistrationAsSynced(reg.id, dbId);
            }
        }

    } catch (error) {
        console.error(`❌ Failed to sync registration ${reg.id}:`, error);
    }
};

// Setup auto-sync listener
export const setupSyncListener = () => {
    // Check immediately on load
    syncPendingScans();

    const unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected) {
            syncPendingScans();
        }
    });
    return unsubscribe;
};
