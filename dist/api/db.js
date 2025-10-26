"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = getPool;
exports.query = query;
exports.getClient = getClient;
exports.closePool = closePool;
exports.testConnection = testConnection;
const pg_1 = require("pg");
/**
 * Database connection pool for PostgreSQL
 * Uses environment variables for configuration
 */
let pool = null;
function getPool() {
    if (!pool) {
        // Use DATABASE_URL if available (Render), otherwise individual vars (local)
        const config = process.env.DATABASE_URL
            ? {
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false },
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            }
            : {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                database: process.env.DB_NAME || 'google_reviews_embed',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD,
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            };
        pool = new pg_1.Pool(config);
        // Handle pool errors
        pool.on('error', (err) => {
            console.error('Unexpected database pool error:', err);
        });
        console.log('Database pool initialized');
    }
    return pool;
}
/**
 * Execute a query with parameters
 */
async function query(text, params) {
    const pool = getPool();
    return pool.query(text, params);
}
/**
 * Get a client from the pool for transactions
 */
async function getClient() {
    const pool = getPool();
    return pool.connect();
}
/**
 * Close the database pool
 */
async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('Database pool closed');
    }
}
/**
 * Test database connection
 */
async function testConnection() {
    try {
        const result = await query('SELECT NOW()');
        console.log('Database connection successful:', result.rows[0]);
        return true;
    }
    catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}
