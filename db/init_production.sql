-- Complete Database Schema for Google Reviews Embed System
-- Run this in Render PostgreSQL Shell

-- Tenants table: organisations using the embed system
CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE,
  settings JSONB
);

-- Sites table: websites belonging to tenants
CREATE TABLE IF NOT EXISTS sites (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE,
  settings JSONB
);

-- Locations table: physical business locations with Google Place IDs
CREATE TABLE IF NOT EXISTS locations (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  place_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE,
  settings JSONB
);

-- Site-location associations (many-to-many)
CREATE TABLE IF NOT EXISTS site_locations (
  site_id VARCHAR(255) NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  location_id VARCHAR(255) NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (site_id, location_id)
);

-- Events table: log all user interactions
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id VARCHAR(255) NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  location_id VARCHAR(255) NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  session_id VARCHAR(255),
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table: private feedback submissions
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id VARCHAR(255) NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  location_id VARCHAR(255) NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  archived BOOLEAN DEFAULT FALSE
);

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

-- Clients table: Simplified view for admin dashboard
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  place_id VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_events_tenant ON events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_site ON events(site_id);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(location_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);

CREATE INDEX IF NOT EXISTS idx_feedback_tenant ON feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_site ON feedback(site_id);
CREATE INDEX IF NOT EXISTS idx_feedback_location ON feedback(location_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_archived ON feedback(archived);

CREATE INDEX IF NOT EXISTS idx_locations_place_id ON locations(place_id);
CREATE INDEX IF NOT EXISTS idx_sites_domain ON sites(domain);
CREATE INDEX IF NOT EXISTS idx_team_users_email ON team_users(email);
CREATE INDEX IF NOT EXISTS idx_clients_place_id ON clients(place_id);
CREATE INDEX IF NOT EXISTS idx_clients_domain ON clients(domain);

-- Insert default admin user (email: admin@hypeawareness.com, password: admin123)
-- IMPORTANT: Change this password after first login!
INSERT INTO team_users (email, password_hash, name, role)
VALUES ('admin@hypeawareness.com', '$2b$10$rQ9XqJ5YJ5YJ5YJ5YJ5YJ5YOz5YJ5YJ5YJ5YJ5YJ5YJ5YJ5YJ5YJ5', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Sample client data
INSERT INTO clients (id, name, place_id, domain, active)
VALUES 
  ('client_001', 'Demo Business', 'ChIJN1t_tDeuEmsRUsoyG83frY4', 'demo.example.com', true),
  ('client_002', 'Test Company', 'ChIJTest1234567890', 'test.example.com', true)
ON CONFLICT (id) DO NOTHING;
