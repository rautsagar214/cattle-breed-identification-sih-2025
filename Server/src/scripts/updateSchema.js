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

        // Create approved_samples table
        const createApprovedSamplesTable = `
            CREATE TABLE IF NOT EXISTS approved_samples (
                id SERIAL PRIMARY KEY,
                run_id INT NOT NULL,
                original_image_url TEXT,
                final_image_url TEXT,
                final_angle VARCHAR(50),
                evaluator_final_breed VARCHAR(100),
                average_top3_predictions JSONB,
                location_latitude FLOAT8,
                location_longitude FLOAT8,
                quality_notes JSONB,
                evaluator_id INT,
                evaluation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(createApprovedSamplesTable);
        console.log('✅ Created approved_samples table');

        // Create rejected_samples table
        const createRejectedSamplesTable = `
            CREATE TABLE IF NOT EXISTS rejected_samples (
                id SERIAL PRIMARY KEY,
                run_id INT NOT NULL,
                image_url TEXT,
                reject_reason TEXT,
                evaluator_id INT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(createRejectedSamplesTable);
        console.log('✅ Created rejected_samples table');

        // Create dataset_versions table
        const createDatasetVersionsTable = `
            CREATE TABLE IF NOT EXISTS dataset_versions (
                id SERIAL PRIMARY KEY,
                breed VARCHAR(100) NOT NULL,
                version INT NOT NULL,
                file_path TEXT NOT NULL,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(createDatasetVersionsTable);
        console.log('✅ Created dataset_versions table');

    } catch (error) {
        console.error('❌ Schema update failed:', error.message);
    } finally {
        if (client) {
            await client.end();
        }
    }
};

updateSchema();
