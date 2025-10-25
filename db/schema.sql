-- Google Reviews Embed System - Database Schema
-- PostgreSQL

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

-- Comments for documentation
COMMENT ON TABLE tenants IS 'Organisations using the Google Reviews embed system';
COMMENT ON TABLE sites IS 'Client websites where the embed is deployed';
COMMENT ON TABLE locations IS 'Physical business locations with Google Place IDs';
COMMENT ON TABLE events IS 'User interaction logs (clicks, views, completions)';
COMMENT ON TABLE feedback IS 'Private feedback submissions from users';
