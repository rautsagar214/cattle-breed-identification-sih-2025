import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

const getDb = async () => {
    if (!db) {
        db = await SQLite.openDatabaseAsync('cattle_app.db');
    }
    return db;
};

export interface ScanResult {
    id?: number;
    imageUris: string[]; // JSON stringified array
    predictions: {
        breed: string;
        confidence: number;
    }[]; // JSON stringified array
    timestamp: number;
    latitude?: number;
    longitude?: number;
    locationName?: string;
    isSynced: boolean;
    dbId?: string;
    userId?: string;
    userRole?: string;
}

export const initDatabase = async () => {
    try {
        const database = await getDb();
        await database.execAsync(`
            CREATE TABLE IF NOT EXISTS scan_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_uris TEXT NOT NULL,
                predictions TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                latitude REAL,
                longitude REAL,
                location_name TEXT,
                is_synced INTEGER DEFAULT 0,
                db_id TEXT,
                user_id TEXT,
                user_role TEXT
            );
        `);
        console.log('✅ Database initialized');

        // Attempt to add columns if they don't exist (for migration)
        await addLocationColumns();
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    }
};

const addLocationColumns = async () => {
    try {
        const database = await getDb();
        const columns = [
            'latitude REAL',
            'longitude REAL',
            'location_name TEXT',
            'is_synced INTEGER DEFAULT 0',
            'db_id TEXT',
            'user_id TEXT',
            'user_role TEXT'
        ];
        for (const col of columns) {
            try {
                await database.execAsync(`ALTER TABLE scan_history ADD COLUMN ${col};`);
                console.log(`✅ Added column: ${col}`);
            } catch (e) {
                // Ignore error if column exists
            }
        }
    } catch (error) {
        console.error('Error adding columns:', error);
    }
};

export const saveScanResult = async (
    imageUris: string[],
    predictions: { breed: string; confidence: number }[],
    location?: { latitude: number; longitude: number; name?: string },
    userId?: string,
    userRole?: string
): Promise<void> => {
    try {
        const database = await getDb();
        const timestamp = Date.now();
        const imagesJson = JSON.stringify(imageUris);
        const predictionsJson = JSON.stringify(predictions);
        const { latitude, longitude, name } = location || {};

        const result = await database.runAsync(
            `INSERT INTO scan_history (image_uris, predictions, timestamp, latitude, longitude, location_name, is_synced, user_id, user_role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [imagesJson, predictionsJson, timestamp, latitude || null, longitude || null, name || null, 0, userId || null, userRole || null]
        );
        console.log('✅ Scan result saved:', result.lastInsertRowId);
    } catch (error) {
        console.error('❌ Failed to save scan result:', error);
        throw error;
    }
};

export const getScanHistory = async (): Promise<ScanResult[]> => {
    try {
        const database = await getDb();
        const rows = await database.getAllAsync<any>(
            `SELECT * FROM scan_history ORDER BY timestamp DESC;`
        );

        return rows.map(row => ({
            id: row.id,
            imageUris: JSON.parse(row.image_uris),
            predictions: JSON.parse(row.predictions),
            timestamp: row.timestamp,
            latitude: row.latitude,
            longitude: row.longitude,
            locationName: row.location_name,
            isSynced: !!row.is_synced,
            dbId: row.db_id,
            userId: row.user_id,
            userRole: row.user_role,
        }));
    } catch (error) {
        console.error('❌ Failed to get scan history:', error);
        throw error;
    }
};

export const markAsSynced = async (id: number, dbId: string): Promise<void> => {
    try {
        const database = await getDb();
        await database.runAsync(
            `UPDATE scan_history SET is_synced = 1, db_id = ? WHERE id = ?;`,
            [dbId, id]
        );
        console.log(`✅ Marked scan ${id} as synced with dbId ${dbId}`);
    } catch (error) {
        console.error(`❌ Failed to mark scan ${id} as synced:`, error);
        throw error;
    }
};

export const getUnsyncedScans = async (): Promise<ScanResult[]> => {
    try {
        const database = await getDb();
        const rows = await database.getAllAsync<any>(
            `SELECT * FROM scan_history WHERE is_synced = 0 ORDER BY timestamp ASC;`
        );

        return rows.map(row => ({
            id: row.id,
            imageUris: JSON.parse(row.image_uris),
            predictions: JSON.parse(row.predictions),
            timestamp: row.timestamp,
            latitude: row.latitude,
            longitude: row.longitude,
            locationName: row.location_name,
            isSynced: !!row.is_synced,
            dbId: row.db_id,
            userId: row.user_id,
            userRole: row.user_role,
        }));
    } catch (error) {
        console.error('❌ Failed to get unsynced scans:', error);
        throw error;
    }
};
