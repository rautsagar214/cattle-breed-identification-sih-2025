const { Client } = require('pg');
require('dotenv').config();

const updateSchemaRegistration = async () => {
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

        // Create cattle_registrations table
        const createRegistrationsTable = `
      CREATE TABLE IF NOT EXISTS cattle_registrations (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES workers(id),
        user_role VARCHAR(20),
        
        pashu_aadhar_tag_id VARCHAR(50),
        species VARCHAR(50),
        breed VARCHAR(100),
        is_breed_overridden BOOLEAN DEFAULT FALSE,
        override_reason TEXT,
        phenotypic_characteristics TEXT,
        identification_marks TEXT,
        
        sex VARCHAR(20),
        age_years INT,
        age_months INT,
        reproductive_breeding_history TEXT,
        
        health_vaccination_records TEXT,
        milk_yield_info TEXT,
        birth_death_registration_info TEXT,
        
        owner_name VARCHAR(255),
        owner_address TEXT,
        owner_contact VARCHAR(50),
        premises_type VARCHAR(100),
        premises_location TEXT,
        
        image_urls TEXT[] NOT NULL,
        predictions JSONB NOT NULL,
        
        latitude REAL,
        longitude REAL,
        location_name TEXT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

        await client.query(createRegistrationsTable);
        console.log('✅ Created cattle_registrations table');

    } catch (error) {
        console.error('❌ Schema update failed:', error.message);
    } finally {
        if (client) {
            await client.end();
        }
    }
};

updateSchemaRegistration();
