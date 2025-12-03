import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';
import { getUnsyncedScans, markAsSynced, ScanResult } from './db';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const syncPendingScans = async () => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
        console.log('📴 Offline, skipping sync');
        return;
    }

    console.log('🔄 Checking for pending scans to sync...');
    try {
        const unsyncedScans = await getUnsyncedScans();

        if (unsyncedScans.length === 0) {
            console.log('✅ No pending scans to sync');
            return;
        }

        console.log(`🚀 Found ${unsyncedScans.length} scans to sync`);

        for (const scan of unsyncedScans) {
            await syncSingleScan(scan);
        }

        console.log('🎉 Sync completed');
    } catch (error) {
        console.error('❌ Sync failed:', error);
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
                // Continue with other images if one fails? Or abort? 
                // Let's continue, but if all fail, we skip sync.
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

// Setup auto-sync listener
export const setupSyncListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected) {
            syncPendingScans();
        }
    });
    return unsubscribe;
};
