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
