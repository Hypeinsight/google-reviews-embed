const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  const databaseUrl = process.argv[2] || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ Error: Please provide DATABASE_URL as argument or environment variable');
    console.log('Usage: node scripts/init_database.js "postgresql://..."');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📦 Connecting to database...');
    
    // Read and execute schema.sql
    console.log('📝 Creating main tables...');
    const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('✅ Main tables created');

    // Read and execute admin_schema.sql
    console.log('📝 Creating admin tables...');
    const adminSchema = fs.readFileSync(path.join(__dirname, '../db/admin_schema.sql'), 'utf8');
    await pool.query(adminSchema);
    console.log('✅ Admin tables created');

    console.log('🎉 Database initialized successfully!');
    console.log('\n📧 Default admin login:');
    console.log('   Email: admin@hypeawareness.com');
    console.log('   Password: admin123');
    console.log('   ⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
