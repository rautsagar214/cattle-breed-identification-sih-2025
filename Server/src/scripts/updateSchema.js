const { Client } = require('pg');
require('dotenv').config();

const updateSchema = async () => {
    let client;

    try {
        client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });

        await client.connect();
        console.log('✅ Connected to Database');

        // Drop the old table if it exists (since we are in dev phase and just created it)
        // Or we can ALTER it. Dropping is cleaner for this specific change if data loss is acceptable (which it is, as it's new).
        await client.query('DROP TABLE IF EXISTS prediction_runs;');
        console.log('🗑️ Dropped old prediction_runs table');

        // Create new table with TEXT[] for image_urls
        const createPredictionRunsTable = `
      CREATE TABLE prediction_runs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES workers(id),
        user_role VARCHAR(20),
        image_urls TEXT[] NOT NULL,
        predictions JSONB NOT NULL,
        latitude REAL,
        longitude REAL,
        location_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

        await client.query(createPredictionRunsTable);
        console.log('✅ Created new prediction_runs table with image_urls TEXT[]');

    } catch (error) {
        console.error('❌ Schema update failed:', error.message);
    } finally {
        if (client) {
            await client.end();
        }
    }
};

updateSchema();
