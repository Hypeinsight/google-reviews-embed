"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigration = runMigration;
const db_1 = require("../db");
/**
 * POST /api/admin/migrate
 * Run billing database migration
 *
 * SECURITY: Remove this endpoint after migration is complete!
 */
async function runMigration(req, res) {
    try {
        console.log('🚀 Starting migration...');
        // Add columns to tenants table
        await (0, db_1.query)(`
      ALTER TABLE tenants 
      ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trial',
      ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP
    `);
        console.log('✓ Updated tenants table');
        // Create pricing tiers table
        await (0, db_1.query)(`
      CREATE TABLE IF NOT EXISTS pricing_tiers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        stripe_price_id VARCHAR(255) NOT NULL,
        monthly_price INTEGER NOT NULL,
        feedback_limit INTEGER,
        locations_limit INTEGER,
        features JSONB DEFAULT '{}',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✓ Created pricing_tiers table');
        // Create subscriptions table
        await (0, db_1.query)(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
        stripe_customer_id VARCHAR(255) NOT NULL,
        plan_tier VARCHAR(50) NOT NULL REFERENCES pricing_tiers(id),
        status VARCHAR(50) NOT NULL,
        current_period_start TIMESTAMP NOT NULL,
        current_period_end TIMESTAMP NOT NULL,
        cancel_at_period_end BOOLEAN DEFAULT FALSE,
        canceled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}'
      )
    `);
        console.log('✓ Created subscriptions table');
        // Create usage metrics table
        await (0, db_1.query)(`
      CREATE TABLE IF NOT EXISTS usage_metrics (
        id SERIAL PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        metric_type VARCHAR(50) NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        period_start TIMESTAMP NOT NULL,
        period_end TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✓ Created usage_metrics table');
        // Create invoices table
        await (0, db_1.query)(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
        amount INTEGER NOT NULL,
        currency VARCHAR(10) DEFAULT 'usd',
        status VARCHAR(50) NOT NULL,
        period_start TIMESTAMP NOT NULL,
        period_end TIMESTAMP NOT NULL,
        paid_at TIMESTAMP,
        invoice_pdf VARCHAR(500),
        hosted_invoice_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✓ Created invoices table');
        // Create client users table
        await (0, db_1.query)(`
      CREATE TABLE IF NOT EXISTS client_users (
        id SERIAL PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP
      )
    `);
        console.log('✓ Created client_users table');
        // Create indexes
        await (0, db_1.query)(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
      CREATE INDEX IF NOT EXISTS idx_usage_metrics_tenant ON usage_metrics(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_usage_metrics_period ON usage_metrics(period_start, period_end);
      CREATE INDEX IF NOT EXISTS idx_usage_metrics_type ON usage_metrics(metric_type);
      CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_stripe_id ON invoices(stripe_invoice_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
      CREATE INDEX IF NOT EXISTS idx_client_users_tenant ON client_users(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_client_users_email ON client_users(email);
      CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer ON tenants(stripe_customer_id);
      CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON tenants(subscription_status)
    `);
        console.log('✓ Created indexes');
        // Insert pricing tiers with Stripe price IDs
        await (0, db_1.query)(`
      INSERT INTO pricing_tiers (id, name, stripe_price_id, monthly_price, feedback_limit, locations_limit, features)
      VALUES 
        ('basic', 'Basic', 'price_1SmvNAIJU39QO7T6WmRR217n', 1900, 50, 1, '{"whiteLabel": false, "analytics": "basic", "support": "email"}'),
        ('starter', 'Starter', 'price_1SmvNlIJU39QO7T618xVVqpd', 3900, 150, 3, '{"whiteLabel": false, "analytics": "basic", "support": "email"}'),
        ('professional', 'Professional', 'price_1SmvOCIJU39QO7T6dHHScLp9', 7900, 500, 10, '{"whiteLabel": true, "analytics": "advanced", "support": "priority"}'),
        ('enterprise', 'Enterprise', 'price_1SmvOYIJU39QO7T6yMmaQzgy', 19900, NULL, NULL, '{"whiteLabel": true, "analytics": "advanced", "support": "priority", "customIntegrations": true}')
      ON CONFLICT (id) DO NOTHING
    `);
        console.log('✓ Inserted pricing tiers');
        // Verify
        const tiers = await (0, db_1.query)('SELECT id, name, monthly_price, stripe_price_id FROM pricing_tiers ORDER BY monthly_price');
        console.log('✅ Migration complete!');
        res.json({
            success: true,
            message: 'Migration completed successfully!',
            pricingTiers: tiers.rows
        });
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.detail || error.hint
        });
    }
}
