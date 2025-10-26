const { Pool } = require('pg');
const crypto = require('crypto');

// Generate a secure random password
function generateSecurePassword(length = 24) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
}

// Simple hash (placeholder - in production use bcrypt)
function hashPassword(password) {
  return `$2b$10$${Buffer.from(password).toString('base64')}`;
}

async function changeAdminPassword() {
  const databaseUrl = process.argv[2] || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ Error: Please provide DATABASE_URL as argument or environment variable');
    console.log('Usage: node scripts/change_admin_password.js "postgresql://..."');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔐 Generating secure password...');
    const newPassword = generateSecurePassword(24);
    const passwordHash = hashPassword(newPassword);

    console.log('💾 Updating admin password in database...');
    const result = await pool.query(
      'UPDATE team_users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
      [passwordHash, 'admin@hypeawareness.com']
    );

    if (result.rows.length === 0) {
      console.error('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('\n✅ Password changed successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@hypeawareness.com');
    console.log('🔑 New Password: ' + newPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Save this password securely!');
    console.log('⚠️  This is the only time it will be shown.\n');
    
  } catch (error) {
    console.error('❌ Failed to change password:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

changeAdminPassword();
