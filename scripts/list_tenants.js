const { Pool } = require('pg');
require('dotenv').config();

async function listTenants() {
  const pool = new Pool(
    process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
        }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME || 'google_reviews_embed',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD,
        }
  );

  try {
    const result = await pool.query('SELECT id, name, created_at FROM tenants ORDER BY created_at DESC LIMIT 10');
    
    console.log('\n📋 Available Tenants:\n');
    console.log('─────────────────────────────────────────────────────────');
    result.rows.forEach(t => {
      console.log(`ID: ${t.id}\nName: ${t.name}\nCreated: ${t.created_at}\n`);
    });
    console.log('─────────────────────────────────────────────────────────\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

listTenants();
