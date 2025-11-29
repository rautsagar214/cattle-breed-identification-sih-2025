const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  let connection;

  try {
    // Connect without specifying database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    });

    console.log('📦 Creating database...');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'cattle_breed_db'}`);
    console.log(`✅ Database '${process.env.DB_NAME || 'cattle_breed_db'}' created/verified`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME || 'cattle_breed_db'}`);

    // Create workers table
    const createWorkersTable = `
      CREATE TABLE IF NOT EXISTS workers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(20),
        address VARCHAR(255),
        role ENUM('user', 'admin') DEFAULT 'user',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createWorkersTable);
    console.log('✅ Workers table created/verified');

    console.log('🎉 Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

initDatabase();
