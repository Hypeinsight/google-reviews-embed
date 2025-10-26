# Setup Guide

Complete step-by-step guide to get the Google Reviews Embed System running locally.

## Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **Git** (already installed)
- A code editor (VS Code recommended)

## Step 1: Database Setup

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE google_reviews_embed;

# Connect to the new database
\c google_reviews_embed

# Exit psql
\q
```

### Run Schema

```bash
# From project root
psql -U postgres -d google_reviews_embed -f db/schema.sql
```

This creates the following tables:
- `tenants` - Organisations using the system
- `sites` - Websites belonging to tenants
- `locations` - Physical locations with Google Place IDs
- `site_locations` - Many-to-many relationship table
- `events` - User interaction logs
- `feedback` - Private feedback submissions

## Step 2: Environment Configuration

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=google_reviews_embed
DB_USER=postgres
DB_PASSWORD=your_actual_password_here

# API Configuration
API_BASE_URL=http://localhost:3000

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:8080

# CDN Configuration
CDN_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

**Important:** Replace `your_actual_password_here` with your PostgreSQL password.

## Step 3: Install Dependencies

```bash
npm install
```

This will:
- Install all npm packages
- Run the postinstall hook to update TECH_STACK.md
- Take about 10-20 seconds

## Step 4: Seed Test Data

```bash
npm run seed
```

This populates the database with:
- 3 demo tenants (Demo Company, Melbourne Cafe Co, Sydney Retail Group)
- 4 demo sites
- 4 demo locations with real Place IDs
- Site-location associations

You should see output like:
```
🌱 Starting database seed...
✓ Tenants created
✓ Sites created
✓ Locations created
✓ Site-location associations created
✅ Database seeded successfully!
```

## Step 5: Start the Development Server

```bash
npm run dev
```

You should see:
```
🚀 Google Reviews Embed API running on port 3000
📍 Environment: development
🔗 Embed script: http://localhost:3000/embed/embed.js
✓ Database connected
```

## Step 6: Test the System

### Option A: Use the Test Page

1. Open your browser to: `http://localhost:3000/embed/test.html`
2. You should see a test page with instructions
3. Look for the blue "Leave a Google Review" button in the bottom-right corner
4. Click it to open the modal
5. Try both "Leave a Google Review" and "Share Private Feedback" options

### Option B: Test API Endpoints Directly

```bash
# Health check
curl http://localhost:3000/health

# Get configuration
curl "http://localhost:3000/api/config?tenantId=tenant_demo&siteId=site_demo_main&locationId=loc_demo_hq"

# Log an event
curl -X POST http://localhost:3000/api/log \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant_demo",
    "siteId": "site_demo_main",
    "locationId": "loc_demo_hq",
    "eventType": "widget_loaded",
    "eventData": {}
  }'

# Submit feedback
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant_demo",
    "siteId": "site_demo_main",
    "locationId": "loc_demo_hq",
    "rating": 5,
    "message": "Great service!",
    "contactEmail": "test@example.com"
  }'
```

### Option C: Check Database Directly

```bash
# View events
psql -U postgres -d google_reviews_embed -c "SELECT * FROM events ORDER BY created_at DESC LIMIT 5;"

# View feedback
psql -U postgres -d google_reviews_embed -c "SELECT * FROM feedback ORDER BY created_at DESC LIMIT 5;"

# View all tenants
psql -U postgres -d google_reviews_embed -c "SELECT id, name FROM tenants;"
```

## Step 7: Integrate on a Test Website

Create a simple HTML file anywhere on your computer:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Test Site</title>
</head>
<body>
  <h1>Welcome to My Test Site</h1>
  <p>The review button should appear in the bottom-right corner.</p>

  <!-- Google Reviews Embed -->
  <script src="http://localhost:3000/embed/embed.js" 
          data-tenant-id="tenant_cafe" 
          data-site-id="site_cafe_main" 
          data-location-id="loc_cafe_melbourne"
          data-api-url="http://localhost:3000">
  </script>
</body>
</html>
```

Open this file in your browser and the widget should load!

## Troubleshooting

### Database Connection Failed

**Error:** `Database connection failed - check your .env configuration`

**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify credentials in `.env`
3. Test connection: `psql -U postgres -d google_reviews_embed -c "SELECT 1;"`

### Widget Doesn't Load

**Error:** Widget button doesn't appear on test page

**Solution:**
1. Check browser console for errors (F12)
2. Verify API is running: `curl http://localhost:3000/health`
3. Check CORS settings in `.env`
4. Ensure embed.js is accessible: `curl http://localhost:3000/embed/embed.js`

### Configuration Not Found

**Error:** API returns "Configuration not found or inactive"

**Solution:**
1. Re-run seed script: `npm run seed`
2. Check tenant/site/location IDs match
3. Verify data in database:
   ```sql
   psql -U postgres -d google_reviews_embed
   SELECT * FROM tenants;
   SELECT * FROM sites;
   SELECT * FROM locations;
   ```

### CORS Errors

**Error:** `Access-Control-Allow-Origin` errors in browser console

**Solution:**
1. Add your domain to `CORS_ORIGINS` in `.env`
2. Restart the server
3. For local testing, add: `http://localhost:8000,http://127.0.0.1:8000`

## Next Steps

Now that everything is working:

1. **Customise branding** - Edit tenant settings in database
2. **Add more locations** - Insert new rows in `locations` table
3. **Create production build** - Run `npm run build`
4. **Deploy to production** - See DEPLOYMENT.md (to be created)
5. **Set up monitoring** - Add logging service integration

## Available npm Scripts

```bash
npm run dev       # Start development server with hot reload
npm run build     # Compile TypeScript to JavaScript
npm start         # Run compiled production build
npm run seed      # Populate database with test data
npm run init:hooks # Configure git hooks
```

## Project Structure Quick Reference

```
/
├── api/                    # Backend Express API
│   ├── index.ts           # Main server file
│   ├── config.ts          # Configuration endpoint
│   ├── log.ts             # Event logging endpoint
│   ├── feedback.ts        # Feedback submission endpoint
│   └── db.ts              # Database connection utilities
├── public/                 # Static files
│   ├── embed.js           # Client-side widget (vanilla JS)
│   └── test.html          # Local test page
├── db/                     # Database schema
│   └── schema.sql         # PostgreSQL table definitions
├── scripts/                # Automation scripts
│   ├── seed_database.js   # Populates test data
│   ├── update_changelog.js # Auto-updates CHANGE_LOG.md
│   └── update_tech_stack.js # Auto-updates TECH_STACK.md
└── docs/                   # Documentation
    ├── PROJECT_PURPOSE.md  # Goals and glossary
    ├── CHANGE_LOG.md       # Auto-generated commit log
    └── TECH_STACK.md       # Auto-updated dependencies

```

## Support

- Check `/docs/PROJECT_PURPOSE.md` for terminology
- View `/docs/TECH_STACK.md` for current dependencies
- Check `/docs/CHANGE_LOG.md` for recent changes
- Open an issue on GitHub (when available)

## Success!

If you've made it this far and everything is working, you're ready to start customising the system for your needs!
