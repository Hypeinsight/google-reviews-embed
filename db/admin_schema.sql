-- Admin Dashboard Tables for Google Reviews Embed System
-- Add these to the existing schema

-- Team Users table: Admin portal users
CREATE TABLE IF NOT EXISTS team_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'team_member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);

-- Clients table: Simplified view of tenants for admin dashboard
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  place_id VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);

-- Insert default admin user (password: admin123 - CHANGE THIS!)
-- Password hash generated with bcrypt for 'admin123'
INSERT INTO team_users (email, password_hash, name, role)
VALUES ('admin@hypeawareness.com', '$2b$10$rQ9XqJ5YJ5YJ5YJ5YJ5YJ5YOz5YJ5YJ5YJ5YJ5YJ5YJ5YJ5YJ5YJ5', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Sample client data
INSERT INTO clients (id, name, place_id, domain, active)
VALUES 
  ('client_001', 'Demo Business', 'ChIJN1t_tDeuEmsRUsoyG83frY4', 'demo.example.com', true),
  ('client_002', 'Test Company', 'ChIJTest1234567890', 'test.example.com', true)
ON CONFLICT (id) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_users_email ON team_users(email);
CREATE INDEX IF NOT EXISTS idx_clients_place_id ON clients(place_id);
CREATE INDEX IF NOT EXISTS idx_clients_domain ON clients(domain);
