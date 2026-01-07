-- Billing & Subscription System Migration
-- Run this after schema.sql

-- Add subscription fields to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;

-- Create pricing tiers table
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  stripe_price_id VARCHAR(255) NOT NULL,
  monthly_price INTEGER NOT NULL, -- in cents
  feedback_limit INTEGER, -- NULL means unlimited
  locations_limit INTEGER, -- NULL means unlimited
  features JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,
  plan_tier VARCHAR(50) NOT NULL REFERENCES pricing_tiers(id),
  status VARCHAR(50) NOT NULL, -- active, past_due, canceled, incomplete, etc.
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- Create usage metrics table
CREATE TABLE IF NOT EXISTS usage_metrics (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL, -- feedback_count, location_count, etc.
  count INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table (mirror Stripe invoices)
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- in cents
  currency VARCHAR(10) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL, -- draft, open, paid, void, uncollectible
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  invoice_pdf VARCHAR(500),
  hosted_invoice_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create client users table (for dashboard authentication)
CREATE TABLE IF NOT EXISTS client_users (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member', -- owner, member
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP
);

-- Create indexes
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
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON tenants(subscription_status);

-- Insert default pricing tiers (placeholder - update with actual Stripe Price IDs)
INSERT INTO pricing_tiers (id, name, stripe_price_id, monthly_price, feedback_limit, locations_limit, features)
VALUES 
  ('basic', 'Basic', 'price_basic_placeholder', 1900, 50, 1, '{"whiteLabel": false, "analytics": "basic", "support": "email"}'),
  ('starter', 'Starter', 'price_starter_placeholder', 3900, 150, 3, '{"whiteLabel": false, "analytics": "basic", "support": "email"}'),
  ('professional', 'Professional', 'price_professional_placeholder', 7900, 500, 10, '{"whiteLabel": true, "analytics": "advanced", "support": "priority"}'),
  ('enterprise', 'Enterprise', 'price_enterprise_placeholder', 19900, NULL, NULL, '{"whiteLabel": true, "analytics": "advanced", "support": "priority", "customIntegrations": true}')
ON CONFLICT (id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE subscriptions IS 'Stripe subscription tracking per tenant';
COMMENT ON TABLE pricing_tiers IS 'Available pricing plans and their features';
COMMENT ON TABLE usage_metrics IS 'Billable usage metrics per tenant per billing period';
COMMENT ON TABLE invoices IS 'Mirror of Stripe invoices for client viewing';
COMMENT ON TABLE client_users IS 'Client dashboard users (separate from team_users for admin)';
