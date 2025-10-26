const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const databaseUrl = process.argv[2] || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ Error: Please provide DATABASE_URL as argument or environment variable');
    console.log('Usage: node scripts/run_migration.js "postgresql://..."');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📦 Reading migration file...');
    const migration = fs.readFileSync(
      path.join(__dirname, '../db/migration_enhanced_feedback.sql'),
      'utf8'
    );

    console.log('🔧 Running migration...');
    await pool.query(migration);

    console.log('✅ Migration completed successfully!');
    console.log('📊 Enhanced feedback columns added to database');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
