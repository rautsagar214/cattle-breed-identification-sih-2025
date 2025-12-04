const { Client } = require('pg');
require('dotenv').config();

const checkTables = async () => {
    let client;
    try {
        client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        await client.connect();

        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('approved_samples', 'rejected_samples');
        `);

        console.log('Found tables:', res.rows.map(r => r.table_name));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (client) await client.end();
    }
};

checkTables();
