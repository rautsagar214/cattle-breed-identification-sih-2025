const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ CockroachDB connected successfully');
    const results = await client.query("SELECT NOW()");
    console.log('Current time from DB:', results.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Wrapper for query to match previous interface somewhat, but using pg syntax
// Note: pg query returns { rows: [] }, while mysql2 returns [rows, fields]
// We will adapt this in the controllers or here. 
// For minimal changes in controllers, we might want to return [rows] to match [rows] from mysql2 destructuring.
const promisePool = {
  query: async (text, params) => {
    const client = await pool.connect();
    try {
      const res = await client.query(text, params);
      return [res.rows]; // Return as array to match [rows] destructuring
    } finally {
      client.release();
    }
  },
  getConnection: async () => {
      return await pool.connect();
  }
};

module.exports = { pool, promisePool, testConnection };
