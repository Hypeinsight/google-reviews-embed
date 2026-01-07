/**
 * Run billing migration script
 */

const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

async function runMigration() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'google_reviews_embed',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('🚀 Running billing migration...\n');

    // Read migration file
    const migrationSQL = fs.readFileSync('./db/migration_billing.sql', 'utf8');
    
    // Execute migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!\n');

    // Now update with real Stripe price IDs
    console.log('📝 Updating Stripe price IDs...\n');
    
    await pool.query("UPDATE pricing_tiers SET stripe_price_id = 'price_1SmvNAIJU39QO7T6WmRR217n' WHERE id = 'basic'");
    await pool.query("UPDATE pricing_tiers SET stripe_price_id = 'price_1SmvNlIJU39QO7T618xVVqpd' WHERE id = 'starter'");
    await pool.query("UPDATE pricing_tiers SET stripe_price_id = 'price_1SmvOCIJU39QO7T6dHHScLp9' WHERE id = 'professional'");
    await pool.query("UPDATE pricing_tiers SET stripe_price_id = 'price_1SmvOYIJU39QO7T6yMmaQzgy' WHERE id = 'enterprise'");

    console.log('✅ Stripe price IDs updated!\n');

    // Verify
    const result = await pool.query('SELECT id, name, monthly_price, stripe_price_id FROM pricing_tiers ORDER BY monthly_price');
    
    console.log('📊 Pricing Tiers:');
    console.log('─────────────────────────────────────────────────────────────');
    result.rows.forEach(tier => {
      console.log(`${tier.name.padEnd(15)} | $${(tier.monthly_price / 100).toFixed(2).padEnd(6)} | ${tier.stripe_price_id}`);
    });
    console.log('─────────────────────────────────────────────────────────────\n');

    console.log('🎉 All done! Your billing system is ready!\n');
    console.log('Next steps:');
    console.log('1. Create a client user: npm run create-user email@example.com password123 "Name" tenant_id');
    console.log('2. Start the server: npm run dev');
    console.log('3. Login at: http://localhost:3000/client/\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
