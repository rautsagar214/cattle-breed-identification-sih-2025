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
                location_name TEXT
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
        const columns = ['latitude REAL', 'longitude REAL', 'location_name TEXT'];
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
    location?: { latitude: number; longitude: number; name?: string }
): Promise<void> => {
    try {
        const database = await getDb();
        const timestamp = Date.now();
        const imagesJson = JSON.stringify(imageUris);
        const predictionsJson = JSON.stringify(predictions);
        const { latitude, longitude, name } = location || {};

        const result = await database.runAsync(
            `INSERT INTO scan_history (image_uris, predictions, timestamp, latitude, longitude, location_name) VALUES (?, ?, ?, ?, ?, ?);`,
            [imagesJson, predictionsJson, timestamp, latitude || null, longitude || null, name || null]
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
        }));
    } catch (error) {
        console.error('❌ Failed to get scan history:', error);
        throw error;
    }
};
