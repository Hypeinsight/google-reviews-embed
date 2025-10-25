# Google Reviews Embed System

A scalable, multi-tenant JavaScript embed system for collecting Google Reviews and optional private feedback from client websites.

## What This Service Does

This system enables businesses to embed a "Leave a Google Review" flow on any website. It supports:

- **Multi-tenant architecture** – Multiple organisations, each with multiple sites and locations
- **Google Reviews integration** – Directs users to leave reviews via Google Business Profile Place IDs
- **Private feedback capture** – Optional feedback collection before or alongside Google Reviews
- **Comprehensive logging** – All user interactions logged to a central API and database
- **Easy deployment** – Single `<script>` tag integration for client sites

## Quick Start

### Prerequisites

- Node.js v18 or higher
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd google-reviews-embed
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Enable git hooks:
   ```bash
   npm run init:hooks
   ```
   This configures git to use the local `.githooks` directory for automated documentation updates.

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and API keys
   ```

5. Initialise the database:
   ```bash
   # Run the schema from db/schema.sql
   psql -U your_user -d your_database -f db/schema.sql
   ```

### Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000` (or your configured port).

### Build

Compile TypeScript to JavaScript:
```bash
npm run build
```

Output will be in the `dist/` directory.

## Git Hooks

This project uses automated git hooks to keep documentation up to date.

### What the Hooks Do

The following hooks run automatically:

- **post-commit** – After each commit
- **post-merge** – After merging branches
- **post-checkout** – After checking out a branch

Each hook:
1. Updates `/docs/CHANGE_LOG.md` with commit details (timestamp, branch, author, message, changed files)
2. Updates `/docs/TECH_STACK.md` with current dependencies from `package.json`

### Where Files Are Updated

- **`/docs/CHANGE_LOG.md`** – Automated commit history log
- **`/docs/TECH_STACK.md`** – Dependency table and change notes
- **`/scripts/.tech_stack_state.json`** – Internal state file (git-ignored)

### Hook Behaviour

- Hooks never block git operations
- If a script fails, a warning is printed and git continues
- Duplicate changelog entries are automatically prevented

## Documentation

- **`/docs/PROJECT_PURPOSE.md`** – Project goals, success criteria, and terminology glossary
- **`/docs/CHANGE_LOG.md`** – Automated commit history (do not edit manually)
- **`/docs/TECH_STACK.md`** – Technology stack and dependencies (partially auto-generated)

To edit the purpose or add manual tech stack notes, edit the respective files directly. The automation scripts preserve manual edits outside of auto-generated sections.

## Project Structure

```
/
├── .githooks/          # Git hooks for automation
├── api/                # Express API endpoints
│   ├── config.ts       # Configuration endpoint
│   ├── log.ts          # Event logging endpoint
│   └── feedback.ts     # Feedback submission endpoint
├── db/                 # Database schema
│   └── schema.sql      # PostgreSQL table definitions
├── docs/               # Project documentation
│   ├── PROJECT_PURPOSE.md
│   ├── CHANGE_LOG.md
│   └── TECH_STACK.md
├── public/             # Static assets
│   └── embed.js        # Client-side embed script
├── scripts/            # Automation scripts
│   ├── update_changelog.js
│   └── update_tech_stack.js
├── package.json
├── tsconfig.json
└── README.md
```

## Embed Usage (Client Sites)

To add the Google Reviews embed to a client website:

```html
<!-- Add to the client's HTML -->
<script src="https://your-cdn.com/embed.js" 
        data-tenant-id="tenant_abc" 
        data-site-id="site_xyz" 
        data-location-id="loc_123">
</script>
```

The embed will automatically render the review flow at the configured location.

## API Endpoints

- `GET /api/config` – Retrieve configuration for a tenant/site/location
- `POST /api/log` – Log user interaction events
- `POST /api/feedback` – Submit private feedback

See individual endpoint files in `/api` for request/response schemas.

## Contributing

1. Create a feature branch
2. Make your changes
3. Commit with clear messages (these will appear in CHANGE_LOG.md)
4. The git hooks will automatically update documentation
5. Push and create a pull request

## Licence

ISC
