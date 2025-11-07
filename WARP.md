# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Setup
```bash
# Install dependencies
npm install

# Enable git hooks for automated documentation
npm run init:hooks

# Set up environment variables
cp .env.example .env
# Then edit .env with database credentials

# Initialize database with schema
psql -U your_user -d your_database -f db/schema.sql

# Seed database with sample data
npm run seed
```

### Running the Application
```bash
# Development mode (auto-restart on changes)
npm run dev

# Demo server (for testing embed locally)
npm run demo

# Production build
npm run build

# Start production server (requires build first)
npm start
```

### Database Scripts
```bash
# Seed sample tenants, sites, and locations
node scripts/seed_database.js

# Change admin password
node scripts/change_admin_password.js

# Run database migrations
node scripts/run_migration.js

# Initialize database tables
node scripts/init_database.js
```

## Architecture Overview

### Multi-Tenant Structure
This is a **multi-tenant embed system** with a three-tier hierarchy:
- **Tenant**: An organization (e.g., a franchise brand)
- **Site**: A website belonging to a tenant (e.g., regional domains)
- **Location**: A physical business location with a Google Place ID

**Key relationships:**
- One tenant → many sites
- One tenant → many locations
- Sites and locations have a many-to-many relationship via `site_locations` table

### Configuration Cascade
Settings cascade from tenant → site → location with later values overriding:
1. Default settings (hardcoded)
2. Tenant settings (`tenants.settings` JSONB)
3. Site settings (`sites.settings` JSONB)
4. Location settings (`locations.settings` JSONB)

See `api/config.ts` for the merge logic.

### Database Connection
- Uses `pg` connection pooling (`api/db.ts`)
- Supports both individual env vars (`DB_HOST`, `DB_PORT`, etc.) and `DATABASE_URL` (for Render deployments)
- Pool is lazy-initialized on first query
- SSL enabled automatically when `DATABASE_URL` is detected

### Client-Side Embed Flow
The `public/embed.js` script implements a tiered feedback system:
1. User clicks trigger button
2. Modal displays star rating (1-5)
3. **4-5 stars** → redirect to Google Reviews
4. **1-3 stars** → collect private feedback before/instead of Google redirect

All interactions are logged via `POST /api/log` with session tracking.

### API Endpoints
- `GET /api/config` - Fetch tenant/site/location configuration (Place ID, branding, settings)
- `POST /api/log` - Log user interaction events (clicks, ratings, completions)
- `POST /api/feedback` - Submit private feedback
- `GET /api/feedback` - Retrieve feedback (supports filtering by tenant/site/location)
- `GET /health` - Health check with database connection status

**Team user and client management endpoints also exist** (see `api/team-users.ts` and `api/clients.ts`).

## Embed Script Variants
Multiple versions exist in `/public`:
- `embed.js` - Main production embed (tiered feedback with star rating)
- `embed-v2.js` - Alternative version
- `embed-enhanced.js` - Feature-extended version
- `embed-page.js` - Standalone page implementation

The primary script is `embed.js`.

## Git Hooks & Auto-Documentation
This project uses custom git hooks in `.githooks/` (configured via `npm run init:hooks`):
- **post-commit** / **post-merge** / **post-checkout**: Automatically update:
  - `docs/CHANGE_LOG.md` with commit details
  - `docs/TECH_STACK.md` with current dependencies

**Never edit `CHANGE_LOG.md` manually** - it's auto-generated. Manual edits outside auto-generated sections of `TECH_STACK.md` are preserved.

## Terminology & Conventions

### Always use "Google Reviews"
User-facing copy must consistently say **"Google Reviews"**, not "GMB Reviews", "Google Business Reviews", or "Google ratings".

### Place ID Field
Despite the column name `place_id`, this field stores the **full Google Reviews URL**, not just the Place ID. See `api/config.ts` line 104-105.

### Session Tracking
Each embed instance generates a `sessionId` (format: `sess_<timestamp>_<random>`) to track user journey across events.

## TypeScript Configuration
- Compiles from `api/` and `scripts/` to `dist/`
- Uses CommonJS modules (Node.js runtime)
- Strict mode enabled
- `public/` directory excluded from compilation (plain JavaScript)

## Environment Variables
Key variables in `.env`:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - PostgreSQL connection
- `DATABASE_URL` - Alternative connection string (takes precedence if set)
- `PORT` - Server port (default 3000)
- `CORS_ORIGINS` - Comma-separated allowed origins
- `CDN_URL` - Base URL for serving embed script

## Database Schema Notes
- All IDs are VARCHAR(255) with semantic prefixes (`tenant_`, `site_`, `loc_`, `sess_`)
- `settings` columns are JSONB for flexible configuration
- Events and feedback tables include `session_id` for journey tracking
- Cascade deletes configured: deleting a tenant removes all child records
- Indexes on foreign keys, timestamps, and session IDs for performance

## Success Criteria
When implementing features, ensure:
- Embed remains under 50KB compressed
- API failures don't break host site (graceful degradation)
- All interactions are logged with session context
- Configuration changes via JSONB don't require schema migrations
