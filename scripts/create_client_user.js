/**
 * Script to create a client user with hashed password
 * 
 * Usage:
 *   node scripts/create_client_user.js <email> <password> <name> <tenant_id> [role]
 * 
 * Example:
 *   node scripts/create_client_user.js client@example.com mypassword123 "John Doe" tenant_abc owner
 */

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const SALT_ROUNDS = 10;

async function createClientUser() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.error('Usage: node scripts/create_client_user.js <email> <password> <name> <tenant_id> [role]');
    console.error('Example: node scripts/create_client_user.js client@example.com password123 "John Doe" tenant_abc owner');
    process.exit(1);
  }

  const [email, password, name, tenantId, role = 'owner'] = args;

  // Create database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : undefined,
  });

  try {
    console.log('Creating client user...');
    console.log('Email:', email);
    console.log('Name:', name);
    console.log('Tenant ID:', tenantId);
    console.log('Role:', role);

    // Verify tenant exists
    const tenantCheck = await pool.query('SELECT id, name FROM tenants WHERE id = $1', [tenantId]);
    
    if (tenantCheck.rows.length === 0) {
      console.error(`\n❌ Error: Tenant '${tenantId}' not found!`);
      console.log('\nAvailable tenants:');
      const tenants = await pool.query('SELECT id, name FROM tenants ORDER BY created_at DESC LIMIT 10');
      tenants.rows.forEach(t => console.log(`  - ${t.id} (${t.name})`));
      process.exit(1);
    }

    console.log(`✓ Found tenant: ${tenantCheck.rows[0].name}`);

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM client_users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      console.error(`\n❌ Error: User with email '${email}' already exists!`);
      process.exit(1);
    }

    // Hash the password
    console.log('\nHashing password...');
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert the user
    const result = await pool.query(
      `INSERT INTO client_users (tenant_id, email, password_hash, name, role, active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING id, email, name, role, created_at`,
      [tenantId, email, passwordHash, name, role]
    );

    const user = result.rows[0];

    console.log('\n✅ Client user created successfully!');
    console.log('─────────────────────────────────────');
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('Created:', user.created_at);
    console.log('─────────────────────────────────────');
    console.log('\n🔐 Login credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\n🌐 Login at: http://localhost:3000/client/');

  } catch (error) {
    console.error('\n❌ Error creating user:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createClientUser();
