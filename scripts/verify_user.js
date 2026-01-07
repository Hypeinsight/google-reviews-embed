const { Pool } = require('pg');
require('dotenv').config();

async function verifyUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const result = await pool.query(
      'SELECT id, email, name, tenant_id, role, active FROM client_users WHERE email = $1',
      ['test@hypeinsight.com']
    );

    if (result.rows.length > 0) {
      console.log('✅ User found in database:');
      console.log(result.rows[0]);
    } else {
      console.log('❌ User not found in database');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyUser();
