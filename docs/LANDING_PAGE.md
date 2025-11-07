# Landing Page System

## Overview

The landing page system creates branded client showcase pages on **hypeinsight.com** that serve as the destination for "Powered by Hype Insight" links in the review embed.

## How It Works

### 1. The Flow

```
Client Website → Review Embed → "Powered by Hype Insight" Link → hypeinsight.com/reviews/client-name
                                                                     ↓
                                                    Landing page showing client stats & CTA
```

### 2. URL Generation

URLs are automatically generated from the client's business name:
- **"Demo Company"** → `hypeinsight.com/reviews/demo-company`
- **"Melbourne Cafe Co"** → `hypeinsight.com/reviews/melbourne-cafe-co`
- **"Hype Invention"** → `hypeinsight.com/reviews/hype-invention`

### 3. What's Displayed

Each landing page shows:
- ✅ Client business name and logo
- ✅ Location address (if applicable)
- ✅ Stats: Reviews collected, feedback submitted, total interactions
- ✅ Latest 5-star testimonial (if available)
- ✅ "Get Started Today" CTA button
- ✅ Hype Insight branding (green #46B646, navy #02202E)

## Setup Instructions

### On hypeinsight.com

Create a page at `/reviews/` and add this HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Client Reviews - Hype Insight</title>
</head>
<body>
  <div id="hype-landing-page" 
       data-tenant-id="tenant_demo" 
       data-api-url="https://your-api.com"
       data-signup-url="https://hypeinsight.com/contact">
  </div>
  <script src="https://your-cdn.com/landing-page.js"></script>
</body>
</html>
```

### Configuration Attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-tenant-id` | ✅ Yes | Tenant identifier (e.g., `tenant_demo`) |
| `data-api-url` | ✅ Yes | Your API base URL |
| `data-location-id` | ❌ No | Show specific location stats instead of tenant-wide |
| `data-signup-url` | ❌ No | Custom signup page URL (default: hypeinsight.com/contact) |

### Multiple Clients

You can use the **same page** for all clients. Just change the `data-tenant-id`:

```html
<!-- For Demo Company -->
<div id="hype-landing-page" data-tenant-id="tenant_demo" ...></div>

<!-- For Melbourne Cafe -->
<div id="hype-landing-page" data-tenant-id="tenant_cafe" ...></div>
```

The script will:
1. Fetch the correct data from the API
2. Generate the appropriate URL slug
3. Update the browser URL automatically

## Dashboard Integration

The dashboard shows the generated landing page URL for each client:

**Example:**
```
Client: Hype Invention
Landing Page: https://hypeinsight.com/reviews/hype-invention
Powered By Link: Uses landingPageUrl from API
```

## API Endpoint

### `GET /api/landing-page`

Fetches data for the landing page.

**Parameters:**
- `tenantId` (required): Tenant identifier
- `locationId` (optional): Specific location

**Response:**
```json
{
  "success": true,
  "data": {
    "tenantId": "tenant_demo",
    "tenantName": "Demo Company",
    "locationName": "Demo HQ",
    "locationAddress": "123 Demo Street, Melbourne VIC 3000",
    "logo": "https://example.com/logo.png",
    "stats": {
      "reviewsCollected": 42,
      "feedbackSubmitted": 18,
      "totalInteractions": 156
    },
    "testimonial": {
      "rating": 5,
      "message": "Excellent service!",
      "date": "November 4, 2025"
    }
  }
}
```

## Embed Script Integration

The embed script (`embed.js`) automatically receives the `landingPageUrl` from the `/api/config` endpoint:

```javascript
{
  "config": {
    "tenantName": "Demo Company",
    "landingPageUrl": "https://hypeinsight.com/reviews/demo-company",
    // ...other config
  }
}
```

The "Powered by" link uses this URL.

## Customization

### Changing the Base URL

Set `landingPageBaseUrl` in tenant/site/location settings:

```sql
UPDATE tenants 
SET settings = jsonb_set(settings, '{landingPageBaseUrl}', '"https://custom-domain.com"')
WHERE id = 'tenant_demo';
```

This changes the URL from:
- ❌ `hypeinsight.com/reviews/demo-company`
- ✅ `custom-domain.com/reviews/demo-company`

### Customizing the Signup URL

Per-page customization via attribute:

```html
<div id="hype-landing-page" 
     data-signup-url="https://hypeinsight.com/special-offer">
</div>
```

## Testing Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit the test page:
   ```
   http://localhost:3000/test-landing-page.html
   ```

3. The page will display "Demo Company" landing page with:
   - Auto-generated URL
   - Sample stats
   - Hype Insight branding

## Files

- **`api/landing-page.ts`** - API endpoint for fetching data
- **`public/landing-page.js`** - Embeddable script (for hypeinsight.com)
- **`public/test-landing-page.html`** - Test page
- **`api/config.ts`** - Updated to include `landingPageUrl`

## Stats Calculation

Stats are calculated in real-time from the database:

| Metric | Calculation |
|--------|-------------|
| Reviews Collected | Count of `google_redirect` events (unique sessions) |
| Feedback Submitted | Count of feedback records |
| Total Interactions | Count of unique sessions with any event |

## Branding

Uses Hype Insight color palette:
- **Primary Green:** `#46B646`
- **Navy Blue:** `#02202E`
- **Yellow Accent:** `#FFCB2B`
- **Typography:** Inter font family

All styling is injected via the script (no external CSS required).

## Security

- ✅ CORS-enabled API
- ✅ No sensitive data exposed
- ✅ Only shows public-facing stats
- ✅ Testimonials are from 5-star ratings only
