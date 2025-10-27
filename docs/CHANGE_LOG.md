# Change Log

This file is automatically updated by git hooks on commit, merge, and checkout events.

## Entries

<!-- Automated entries will appear below -->

---

**2025-10-25T07:44:47.348Z** | Branch: `main` | Commit: `4694361`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Initial scaffold of Google Reviews Embed System

**Files changed:**
  - .githooks/post-checkout
  - .githooks/post-commit
  - .githooks/post-merge
  - .gitignore
  - README.md
  - api/config.ts
  - api/feedback.ts
  - api/log.ts
  - db/schema.sql
  - docs/CHANGE_LOG.md
  - docs/PROJECT_PURPOSE.md
  - docs/TECH_STACK.md
  - docs/progress/current-progress.md
  - package.json
  - public/embed.js
  - scripts/update_changelog.js
  - scripts/update_tech_stack.js
  - tsconfig.json

---

**2025-10-26T01:37:13.624Z** | Branch: `main` | Commit: `fc9b48e`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Implement complete Google Reviews Embed System with API, database, and widget UI

**Files changed:**
  - .env.example
  - api/config.ts
  - api/db.ts
  - api/feedback.ts
  - api/index.ts
  - api/log.ts
  - docs/CHANGE_LOG.md
  - package.json
  - public/embed.js
  - public/test.html
  - scripts/seed_database.js

---

**2025-10-26T01:38:07.741Z** | Branch: `main` | Commit: `8a6db6f`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add comprehensive SETUP.md guide with step-by-step instructions

**Files changed:**
  - SETUP.md

---

**2025-10-26T01:39:12.006Z** | Branch: `main` | Commit: `7e008ea`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add SUMMARY.md with complete project overview and next steps

**Files changed:**
  - SUMMARY.md

---

**2025-10-26T02:13:24.988Z** | Branch: `main` | Commit: `9a509b0`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add premium UI with glassmorphism and smart sentiment-based routing (4-5 stars -> Google, 1-3 stars -> private feedback)

**Files changed:**
  - api/demo-server.ts
  - api/mock-db.ts
  - docs/CHANGE_LOG.md
  - docs/TECH_STACK.md
  - package.json
  - public/embed-v2.js
  - public/embed.js
  - public/test.html

---

**2025-10-26T02:21:05.087Z** | Branch: `main` | Commit: `e12ddeb`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add premium admin dashboard with client management, feedback viewing, and embed code generator

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/admin/index.html

---

**2025-10-26T02:45:24.077Z** | Branch: `main` | Commit: `178d8ab`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add improved admin dashboard with working filters, QR code generator, and feedback grouping by client

**Files changed:**
  - api/demo-server.ts
  - docs/CHANGE_LOG.md
  - package.json
  - public/admin/dashboard.html

---

**2025-10-26T02:54:32.304Z** | Branch: `main` | Commit: `42f2ed7`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add comprehensive NEXT_STEPS.md roadmap for continued development

**Files changed:**
  - NEXT_STEPS.md
  - docs/CHANGE_LOG.md
  - docs/TECH_STACK.md
  - public/admin/dashboard.html

---

**2025-10-26T05:32:44.897Z** | Branch: `main` | Commit: `5edf627`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add admin dashboard, login system, user management, and performance optimizations

**Files changed:**
  - Hype Insight Color Palette & Design System Analysis.md
  - PERFORMANCE.md
  - docs/CHANGE_LOG.md
  - public/Logo/logo-resized.webp
  - public/admin/dashboard.html
  - public/admin/login.html
  - public/embed-v2.js

---

**2025-10-26T05:43:09.644Z** | Branch: `main` | Commit: `d3c82df`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Update domains to reviews.hypeawareness.com

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/admin/dashboard.html

---

**2025-10-26T05:44:38.944Z** | Branch: `main` | Commit: `fbf89d7`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix Render deployment: build TypeScript on install and use start script

**Files changed:**
  - package.json

---

**2025-10-26T05:46:22.682Z** | Branch: `main` | Commit: `ead9220`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Move TypeScript and type definitions to dependencies for production build

**Files changed:**
  - package.json

---

**2025-10-26T05:50:07.839Z** | Branch: `main` | Commit: `4da0c1f`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Separate build step from postinstall for Render

**Files changed:**
  - package.json

---

**2025-10-26T05:56:18.907Z** | Branch: `main` | Commit: `ac1e2b3`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix TypeScript generic constraint in db.ts for pg 8.x

**Files changed:**
  - api/db.ts

---

**2025-10-26T05:58:48.980Z** | Branch: `main` | Commit: `9bc6c25`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Commit pre-compiled dist folder for Render free tier deployment

**Files changed:**
  - .gitignore
  - dist/api/config.js
  - dist/api/db.js
  - dist/api/demo-server.js
  - dist/api/feedback.js
  - dist/api/index.js
  - dist/api/log.js
  - dist/api/mock-db.js
  - package.json

---

**2025-10-26T06:11:58.215Z** | Branch: `main` | Commit: `545ad9a`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add DATABASE_URL support and admin schema for production deployment

**Files changed:**
  - api/db.ts
  - db/admin_schema.sql
  - dist/api/db.js
  - docs/CHANGE_LOG.md

---

**2025-10-26T06:28:16.695Z** | Branch: `main` | Commit: `0f27e7a`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add full team user management: create, edit, delete, reset password

**Files changed:**
  - api/index.ts
  - api/team-users.ts
  - db/init_production.sql
  - dist/api/index.js
  - dist/api/team-users.js
  - docs/CHANGE_LOG.md
  - public/admin/dashboard.html
  - scripts/init_database.js

---

**2025-10-26T06:31:00.534Z** | Branch: `main` | Commit: `21c5060`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix static file serving for admin dashboard

**Files changed:**
  - api/index.ts
  - dist/api/index.js
  - docs/CHANGE_LOG.md

---

**2025-10-26T06:34:50.879Z** | Branch: `main` | Commit: `e43907c`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix static file path resolution for production deployment

**Files changed:**
  - api/index.ts
  - dist/api/index.js
  - docs/CHANGE_LOG.md

---

**2025-10-26T06:41:17.461Z** | Branch: `main` | Commit: `1220e03`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix: Make login default at /admin/, fix syntax error in dashboard

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/admin/dashboard.html
  - public/admin/index.html
  - public/admin/login.html
  - public/admin/old-index.html

---

**2025-10-26T06:43:10.974Z** | Branch: `main` | Commit: `2e0e5e9`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Redirect root URL to admin login for security

**Files changed:**
  - api/index.ts
  - dist/api/index.js
  - docs/CHANGE_LOG.md

---

**2025-10-26T06:48:49.880Z** | Branch: `main` | Commit: `518b87a`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** CRITICAL FIX: Escape closing script tag in embed code to prevent HTML parsing break

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/admin/dashboard.html

---

**2025-10-26T06:54:22.287Z** | Branch: `main` | Commit: `c6a3947`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Remove Team Users tab - use single admin account only

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/admin/dashboard.html

---

**2025-10-26T07:05:54.978Z** | Branch: `main` | Commit: `51425b7`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Update login credentials to use secure password

**Files changed:**
  - db/migration_enhanced_feedback.sql
  - docs/CHANGE_LOG.md
  - public/admin/index.html
  - scripts/change_admin_password.js
  - scripts/run_migration.js

---

**2025-10-26T07:15:06.381Z** | Branch: `main` | Commit: `d82a353`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Implement real database storage for client management - clients now persist to PostgreSQL

**Files changed:**
  - api/clients.ts
  - api/index.ts
  - dist/api/clients.js
  - dist/api/index.js
  - docs/CHANGE_LOG.md
  - public/admin/dashboard.html

---

**2025-10-26T07:17:08.303Z** | Branch: `main` | Commit: `538f5eb`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add delete button for clients with confirmation dialog

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/admin/dashboard.html

---

**2025-10-26T07:21:00.563Z** | Branch: `main` | Commit: `dd05499`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix: Remove duplicate clientsData declaration causing JavaScript error

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/admin/dashboard.html

---

**2025-10-26T08:18:43.668Z** | Branch: `main` | Commit: `c448e6d`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix CORS error blocking admin API calls

**Files changed:**
  - api/index.ts
  - dist/api/index.js
  - docs/CHANGE_LOG.md

---

**2025-10-26T08:48:35.980Z** | Branch: `main` | Commit: `5a782b0`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix: Add site_locations join table entries when creating/updating clients

**Files changed:**
  - api/clients.ts
  - dist/api/clients.js
  - docs/CHANGE_LOG.md

---

**2025-10-26T08:53:04.010Z** | Branch: `main` | Commit: `1167e2b`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix: Update admin dashboard to generate correct embed script path (embed.js not embed-v2.js)

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/admin/dashboard.html

---

**2025-10-26T08:58:58.793Z** | Branch: `main` | Commit: `3547bb8`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix: Add missing adjustColor function that was breaking button creation

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/embed.js

---

**2025-10-26T09:03:36.219Z** | Branch: `main` | Commit: `2491456`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix: Map buttonColor to primaryColor in config API

**Files changed:**
  - api/config.ts
  - dist/api/config.js
  - docs/CHANGE_LOG.md

---

**2025-10-26T09:05:46.468Z** | Branch: `main` | Commit: `a172b8a`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix: Add !important to modal display to override WordPress inline styles

**Files changed:**
  - public/embed.js

---

**2025-10-26T09:07:43.562Z** | Branch: `main` | Commit: `01d9076`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Change button default position from bottom-right to bottom-left

**Files changed:**
  - public/embed.js

---

**2025-10-26T09:10:01.984Z** | Branch: `main` | Commit: `ae905dc`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Implement enhanced tiered feedback flow: star rating first, then conditional redirect to Google (4-5 stars) or private feedback form (1-3 stars)

**Files changed:**
  - public/embed-enhanced.js
  - public/embed.js

---

**2025-10-26T09:14:41.000Z** | Branch: `main` | Commit: `eb50513`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix: buttonColor now correctly overrides default primaryColor

**Files changed:**
  - api/config.ts
  - dist/api/config.js
  - docs/CHANGE_LOG.md

---

**2025-10-26T12:17:38.908Z** | Branch: `main` | Commit: `223521e`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix: Edit button now properly populates form with correct API response property names

**Files changed:**
  - public/admin/dashboard.html

---

**2025-10-26T12:23:11.063Z** | Branch: `main` | Commit: `2fabf97`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix: Support updating clients - form now uses PUT for edits and POST for new clients

**Files changed:**
  - public/admin/dashboard.html

---

**2025-10-26T12:43:27.303Z** | Branch: `main` | Commit: `db0d651`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix: Preserve currentClientTenantId when opening edit modal so updates work correctly

**Files changed:**
  - public/admin/dashboard.html

---

**2025-10-26T12:48:03.220Z** | Branch: `main` | Commit: `e71dacb`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix: extractPlaceId now accepts all valid Place ID formats (ChIJ, C*, E*), not just ChIJ

**Files changed:**
  - public/admin/dashboard.html

---

**2025-10-26T12:55:40.800Z** | Branch: `main` | Commit: `68d1eeb`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Simplify: Use Google review URL directly instead of extracting/reconstructing Place ID

**Files changed:**
  - api/config.ts
  - dist/api/config.js
  - docs/CHANGE_LOG.md
  - public/admin/dashboard.html

---

**2025-10-26T13:03:05.535Z** | Branch: `main` | Commit: `f248351`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add Google review option to negative feedback per policy + Add GET /api/feedback endpoint

**Files changed:**
  - api/feedback.ts
  - api/index.ts
  - dist/api/feedback.js
  - dist/api/index.js
  - docs/CHANGE_LOG.md
  - public/embed-enhanced.js
  - public/embed.js

---

**2025-10-26T13:07:01.545Z** | Branch: `main` | Commit: `9abd164`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add feedback display in dashboard + Create standalone review page for QR codes

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/admin/dashboard.html
  - public/review.html

---

**2025-10-26T13:13:45.525Z** | Branch: `main` | Commit: `c0ef3d1`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add 4-star improvement flow + QR codes now auto-open widget on client site with ?openReview=1 parameter

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/admin/dashboard.html
  - public/embed-enhanced.js
  - public/embed.js

---

**2025-10-26T13:23:40.311Z** | Branch: `main` | Commit: `fe6092c`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix: Display actual feedback count + Track 5-star users non-invasively + Fix sites count

**Files changed:**
  - api/clients.ts
  - dist/api/clients.js
  - docs/CHANGE_LOG.md
  - public/admin/dashboard.html
  - public/embed-enhanced.js
  - public/embed.js

---

**2025-10-26T13:35:52.192Z** | Branch: `main` | Commit: `744bc9b`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Enhanced mobile responsiveness and modernized review popup design

**Files changed:**
  - public/admin/dashboard.html
  - public/embed-enhanced.js

---

**2025-10-26T13:41:54.867Z** | Branch: `main` | Commit: `4ad10fd`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix dashboard stats to use dynamic data and remove scrollbar

**Files changed:**
  - public/admin/dashboard.html

---

**2025-10-26T13:44:57.915Z** | Branch: `main` | Commit: `3adc239`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add Powered by footer to popup and fix logout redirect

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/admin/dashboard.html
  - public/embed-enhanced.js

---

**2025-10-26T13:49:23.715Z** | Branch: `main` | Commit: `f94b17e`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Update changelog

**Files changed:**
  - docs/CHANGE_LOG.md

---

**2025-10-26T13:49:48.772Z** | Branch: `main` | Commit: `8ae9313`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Update changelog

**Files changed:**
  - docs/CHANGE_LOG.md

---

**2025-10-26T13:53:24.447Z** | Branch: `main` | Commit: `4821f9e`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add Powered by footer to main embed.js

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/embed.js

---

**2025-10-27T02:32:24.974Z** | Branch: `main` | Commit: `f6fd13a`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Update footer link to hypeinsight.com with UTM tracking

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/embed-enhanced.js
  - public/embed.js

---

**2025-10-27T04:00:08.383Z** | Branch: `main` | Commit: `d61597f`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Update UTM campaign to powered_by_review_modal

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/embed-enhanced.js
  - public/embed.js

---

**2025-10-27T04:15:27.313Z** | Branch: `main` | Commit: `f770395`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Fix feedback count SQL to use COALESCE and return integer

**Files changed:**
  - api/clients.ts
  - docs/CHANGE_LOG.md

---

**2025-10-27T12:23:23.928Z** | Branch: `main` | Commit: `89dcecb`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Checkpoint: All current features working - about to add standalone review page

**Files changed:**
  - docs/CHANGE_LOG.md

---

**2025-10-27T12:40:57.164Z** | Branch: `main` | Commit: `fa46cbd`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add standalone page embed script (embed-page.js) for dedicated review pages

**Files changed:**
  - docs/CHANGE_LOG.md
  - docs/STANDALONE_PAGE.md
  - public/embed-page.js

---

**2025-10-27T12:48:03.153Z** | Branch: `main` | Commit: `54cc4ec`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add Page Embed tab to dashboard showing both button and page embed options

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/admin/dashboard.html

---

**2025-10-27T13:09:34.002Z** | Branch: `main` | Commit: `6782d87`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Add subtle floating shadow animation to page embed card

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/embed-page.js

---

**2025-10-27T13:24:13.260Z** | Branch: `main` | Commit: `502d25b`

**Author:** Hypeinsight <analytics@hypeinsight.com>

**Message:** Improve page embed text formatting with better spacing and left-aligned body text

**Files changed:**
  - docs/CHANGE_LOG.md
  - public/embed-page.js
