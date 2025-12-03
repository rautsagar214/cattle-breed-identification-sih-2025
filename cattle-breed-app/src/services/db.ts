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

export interface Registration {
    id?: number;
    pashuAadharTagId: string;
    species: string;
    breed: string;
    isBreedOverridden: boolean;
    overrideReason?: string;
    phenotypicCharacteristics?: string;
    identificationMarks?: string;
    sex: string;
    ageYears: string;
    ageMonths: string;
    reproductiveBreedingHistory?: string;
    healthVaccinationRecords?: string;
    milkYieldInfo?: string;
    birthDeathRegistrationInfo?: string;
    ownerName: string;
    ownerAddress: string;
    ownerContact: string;
    premisesType?: string;
    premisesLocation?: string;
    imageUris: string[];
    predictions: { breed: string; confidence: number }[];
    latitude?: number;
    longitude?: number;
    locationName?: string;
    timestamp: number;
    userId?: string;
    userRole?: string;
    isSynced: boolean;
    dbId?: string;
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
            
            CREATE TABLE IF NOT EXISTS cattle_registrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pashu_aadhar_tag_id TEXT,
                species TEXT,
                breed TEXT,
                is_breed_overridden INTEGER DEFAULT 0,
                override_reason TEXT,
                phenotypic_characteristics TEXT,
                identification_marks TEXT,
                sex TEXT,
                age_years TEXT,
                age_months TEXT,
                reproductive_breeding_history TEXT,
                health_vaccination_records TEXT,
                milk_yield_info TEXT,
                birth_death_registration_info TEXT,
                owner_name TEXT,
                owner_address TEXT,
                owner_contact TEXT,
                premises_type TEXT,
                premises_location TEXT,
                image_uris TEXT NOT NULL,
                predictions TEXT NOT NULL,
                latitude REAL,
                longitude REAL,
                location_name TEXT,
                timestamp INTEGER NOT NULL,
                user_id TEXT,
                user_role TEXT,
                is_synced INTEGER DEFAULT 0,
                db_id TEXT
            );
        `);
        console.log('✅ Database initialized');

        // Run migrations to ensure schema is up to date
        // await runMigrations();
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    }
};

const runMigrations = async () => {
    try {
        const database = await getDb();

        // Helper to get existing columns for a table
        const getExistingColumns = async (tableName: string): Promise<Set<string>> => {
            try {
                const result = await database.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName});`);
                return new Set(result.map(col => col.name));
            } catch (e) {
                console.warn(`Could not get table info for ${tableName}`, e);
                return new Set();
            }
        };

        // 1. Scan History Migrations
        const scanHistoryColumns = [
            { name: 'latitude', type: 'REAL' },
            { name: 'longitude', type: 'REAL' },
            { name: 'location_name', type: 'TEXT' },
            { name: 'is_synced', type: 'INTEGER DEFAULT 0' },
            { name: 'db_id', type: 'TEXT' },
            { name: 'user_id', type: 'TEXT' },
            { name: 'user_role', type: 'TEXT' }
        ];

        const existingScanColumns = await getExistingColumns('scan_history');

        for (const col of scanHistoryColumns) {
            if (!existingScanColumns.has(col.name)) {
                try {
                    await database.execAsync(`ALTER TABLE scan_history ADD COLUMN ${col.name} ${col.type};`);
                    console.log(`✅ Added column to scan_history: ${col.name}`);
                } catch (e) {
                    console.error(`Failed to add column ${col.name} to scan_history`, e);
                }
            }
        }

        // 2. Cattle Registrations Migrations
        const registrationColumns = [
            { name: 'is_synced', type: 'INTEGER DEFAULT 0' },
            { name: 'db_id', type: 'TEXT' },
        ];

        const existingRegColumns = await getExistingColumns('cattle_registrations');

        for (const col of registrationColumns) {
            if (!existingRegColumns.has(col.name)) {
                try {
                    await database.execAsync(`ALTER TABLE cattle_registrations ADD COLUMN ${col.name} ${col.type};`);
                    console.log(`✅ Added column to cattle_registrations: ${col.name}`);
                } catch (e) {
                    console.error(`Failed to add column ${col.name} to cattle_registrations`, e);
                }
            }
        }

    } catch (error) {
        console.error('Error running migrations:', error);
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

export const saveRegistration = async (registration: Registration): Promise<void> => {
    try {
        const database = await getDb();
        const imagesJson = JSON.stringify(registration.imageUris);
        const predictionsJson = JSON.stringify(registration.predictions);

        const result = await database.runAsync(
            `INSERT INTO cattle_registrations (
                pashu_aadhar_tag_id, species, breed, is_breed_overridden, override_reason,
                phenotypic_characteristics, identification_marks, sex, age_years, age_months,
                reproductive_breeding_history, health_vaccination_records, milk_yield_info, birth_death_registration_info,
                owner_name, owner_address, owner_contact, premises_type, premises_location,
                image_uris, predictions, latitude, longitude, location_name, timestamp,
                user_id, user_role, is_synced
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
            [
                registration.pashuAadharTagId, registration.species, registration.breed, registration.isBreedOverridden ? 1 : 0, registration.overrideReason || null,
                registration.phenotypicCharacteristics || null, registration.identificationMarks || null, registration.sex, registration.ageYears, registration.ageMonths,
                registration.reproductiveBreedingHistory || null, registration.healthVaccinationRecords || null, registration.milkYieldInfo || null, registration.birthDeathRegistrationInfo || null,
                registration.ownerName, registration.ownerAddress, registration.ownerContact, registration.premisesType || null, registration.premisesLocation || null,
                imagesJson, predictionsJson, registration.latitude || null, registration.longitude || null, registration.locationName || null, registration.timestamp,
                registration.userId || null, registration.userRole || null
            ]
        );
        console.log('✅ Registration saved:', result.lastInsertRowId);
    } catch (error) {
        console.error('❌ Failed to save registration:', error);
        throw error;
    }
};

export const getRegistrations = async (): Promise<Registration[]> => {
    try {
        const database = await getDb();
        const rows = await database.getAllAsync<any>(
            `SELECT * FROM cattle_registrations ORDER BY timestamp DESC;`
        );

        return rows.map(row => mapRowToRegistration(row));
    } catch (error) {
        console.error('❌ Failed to get registrations:', error);
        throw error;
    }
};

export const getUnsyncedRegistrations = async (): Promise<Registration[]> => {
    try {
        const database = await getDb();
        const rows = await database.getAllAsync<any>(
            `SELECT * FROM cattle_registrations WHERE is_synced = 0 ORDER BY timestamp ASC;`
        );

        return rows.map(row => mapRowToRegistration(row));
    } catch (error) {
        console.error('❌ Failed to get unsynced registrations:', error);
        throw error;
    }
};

export const markRegistrationAsSynced = async (id: number, dbId: string): Promise<void> => {
    try {
        const database = await getDb();
        await database.runAsync(
            `UPDATE cattle_registrations SET is_synced = 1, db_id = ? WHERE id = ?;`,
            [dbId, id]
        );
        console.log(`✅ Marked registration ${id} as synced with dbId ${dbId}`);
    } catch (error) {
        console.error(`❌ Failed to mark registration ${id} as synced:`, error);
        throw error;
    }
};

const mapRowToRegistration = (row: any): Registration => ({
    id: row.id,
    pashuAadharTagId: row.pashu_aadhar_tag_id,
    species: row.species,
    breed: row.breed,
    isBreedOverridden: !!row.is_breed_overridden,
    overrideReason: row.override_reason,
    phenotypicCharacteristics: row.phenotypic_characteristics,
    identificationMarks: row.identification_marks,
    sex: row.sex,
    ageYears: row.age_years,
    ageMonths: row.age_months,
    reproductiveBreedingHistory: row.reproductive_breeding_history,
    healthVaccinationRecords: row.health_vaccination_records,
    milkYieldInfo: row.milk_yield_info,
    birthDeathRegistrationInfo: row.birth_death_registration_info,
    ownerName: row.owner_name,
    ownerAddress: row.owner_address,
    ownerContact: row.owner_contact,
    premisesType: row.premises_type,
    premisesLocation: row.premises_location,
    imageUris: JSON.parse(row.image_uris),
    predictions: JSON.parse(row.predictions),
    latitude: row.latitude,
    longitude: row.longitude,
    locationName: row.location_name,
    timestamp: row.timestamp,
    userId: row.user_id,
    userRole: row.user_role,
    isSynced: !!row.is_synced,
    dbId: row.db_id,
});
