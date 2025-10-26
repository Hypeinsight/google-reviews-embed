#!/usr/bin/env node

/**
 * seed_database.js
 * 
 * Populates the database with sample tenants, sites, and locations for testing.
 * Run with: node scripts/seed_database.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'google_reviews_embed',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seed...\n');

    await client.query('BEGIN');

    // Seed Tenants
    console.log('Creating tenants...');
    await client.query(`
      INSERT INTO tenants (id, name, settings) VALUES
      ('tenant_demo', 'Demo Company', '{"primaryColor": "#4285F4"}'),
      ('tenant_cafe', 'Melbourne Cafe Co', '{"primaryColor": "#FF6B6B"}'),
      ('tenant_retail', 'Sydney Retail Group', '{"primaryColor": "#4ECDC4"}')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✓ Tenants created\n');

    // Seed Sites
    console.log('Creating sites...');
    await client.query(`
      INSERT INTO sites (id, tenant_id, domain, name, settings) VALUES
      ('site_demo_main', 'tenant_demo', 'demo.example.com', 'Demo Main Site', '{}'),
      ('site_cafe_main', 'tenant_cafe', 'melbournecafe.com.au', 'Melbourne Cafe Website', '{"buttonText": "Review Us on Google"}'),
      ('site_cafe_promo', 'tenant_cafe', 'promo.melbournecafe.com.au', 'Cafe Promotions', '{}'),
      ('site_retail_main', 'tenant_retail', 'sydneyretail.com.au', 'Sydney Retail Main', '{}')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✓ Sites created\n');

    // Seed Locations
    console.log('Creating locations...');
    await client.query(`
      INSERT INTO locations (id, tenant_id, place_id, name, address, settings) VALUES
      (
        'loc_demo_hq',
        'tenant_demo',
        'ChIJN1t_tDeuEmsRUsoyG83frY4',
        'Demo HQ',
        '123 Demo Street, Melbourne VIC 3000',
        '{}'
      ),
      (
        'loc_cafe_melbourne',
        'tenant_cafe',
        'ChIJ90260rVG1moRkM2MIXVWBAQ',
        'Melbourne Cafe - CBD',
        '456 Collins Street, Melbourne VIC 3000',
        '{"collectFeedback": true}'
      ),
      (
        'loc_cafe_fitzroy',
        'tenant_cafe',
        'ChIJr8_YZ7Jk1moRiX4XlbPv2sI',
        'Melbourne Cafe - Fitzroy',
        '789 Brunswick Street, Fitzroy VIC 3065',
        '{"feedbackBeforeReview": true}'
      ),
      (
        'loc_retail_sydney',
        'tenant_retail',
        'ChIJP3Sa8ziYEmsRUKgyFmh9AQM',
        'Sydney Retail - George St',
        '321 George Street, Sydney NSW 2000',
        '{}'
      )
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✓ Locations created\n');

    // Seed Site-Location associations
    console.log('Creating site-location associations...');
    await client.query(`
      INSERT INTO site_locations (site_id, location_id) VALUES
      ('site_demo_main', 'loc_demo_hq'),
      ('site_cafe_main', 'loc_cafe_melbourne'),
      ('site_cafe_main', 'loc_cafe_fitzroy'),
      ('site_cafe_promo', 'loc_cafe_melbourne'),
      ('site_retail_main', 'loc_retail_sydney')
      ON CONFLICT (site_id, location_id) DO NOTHING
    `);
    console.log('✓ Site-location associations created\n');

    await client.query('COMMIT');

    console.log('✅ Database seeded successfully!\n');
    console.log('Sample configuration URLs:');
    console.log('  Demo: /api/config?tenantId=tenant_demo&siteId=site_demo_main&locationId=loc_demo_hq');
    console.log('  Cafe (CBD): /api/config?tenantId=tenant_cafe&siteId=site_cafe_main&locationId=loc_cafe_melbourne');
    console.log('  Cafe (Fitzroy): /api/config?tenantId=tenant_cafe&siteId=site_cafe_main&locationId=loc_cafe_fitzroy');
    console.log('  Retail: /api/config?tenantId=tenant_retail&siteId=site_retail_main&locationId=loc_retail_sydney\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
