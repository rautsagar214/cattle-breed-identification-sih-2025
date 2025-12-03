const { Client } = require('pg');
require('dotenv').config();

const initDatabase = async () => {
  let client;

  try {
    // Connect using DATABASE_URL
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await client.connect();
    console.log('✅ Connected to CockroachDB');

    // Create workers table
    // CockroachDB/Postgres uses SERIAL for auto-increment
    // TIMESTAMP DEFAULT CURRENT_TIMESTAMP is valid
    // ENUMs are supported but often easier to just use VARCHAR with check constraint or just VARCHAR for simplicity in migration if strict enum not needed. 
    // Let's stick to VARCHAR for role to avoid creating a custom type, or create the type if we want to be strict.
    // Let's use VARCHAR for role for simplicity and compatibility.

    const createWorkersTable = `
      CREATE TABLE IF NOT EXISTS workers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(20),
        address VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'flw')),
        state VARCHAR(100),
        city VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Note: ON UPDATE CURRENT_TIMESTAMP is not standard SQL and not supported directly in CREATE TABLE in Postgres/CockroachDB like in MySQL.
    // We would need a trigger for that. For now, we will omit the automatic update of updated_at on change, or we can add a trigger.
    // Let's keep it simple for now and just set default.

    await client.query(createWorkersTable);
    console.log('✅ Workers table created/verified');

    // Create prediction_runs table
    const createPredictionRunsTable = `
      CREATE TABLE IF NOT EXISTS prediction_runs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES workers(id),
        user_role VARCHAR(20),
        image_url TEXT NOT NULL,
        predictions JSONB NOT NULL,
        latitude REAL,
        longitude REAL,
        location_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(createPredictionRunsTable);
    console.log('✅ Prediction runs table created/verified');

    console.log('🎉 Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
};

initDatabase();
