# Standalone Review Page

## Overview
This feature allows clients to create a dedicated review landing page instead of using a floating button throughout their website.

## Use Case
Perfect for clients who want:
- A dedicated `/reviews` or `/leave-review` page
- QR codes that link to a full page experience
- Email campaigns linking to a review page
- No floating button cluttering their website

## Implementation Plan

### 1. Create `embed-page.js`
A new embed script that:
- Takes over the entire page body
- Creates a centered card with:
  - Customizable heading (e.g., "Share Your Experience")
  - Customizable body text (e.g., "Thank you for being a valued customer...")
  - Large review button
- When button clicked, opens the same review modal
- Responsive design
- Optional: Custom background gradient/image

### 2. Script Attributes
```html
<script src="https://reviews.hypeawareness.com/embed/embed-page.js" 
  data-tenant-id="tenant_example"
  data-site-id="site_example"
  data-location-id="loc_example"
  data-page-title="Share Your Experience"
  data-page-subtitle="Thank you for being a valued customer! We'd love to hear about your experience."
  data-button-text="Leave a Review"
  data-button-color="#46B646"
  data-white-label="false"
  data-api-url="https://reviews.hypeawareness.com">
</script>
```

### 3. Admin Dashboard Integration
Add option when viewing client to generate:
1. Standard embed code (floating button)
2. **NEW:** Page embed code (full page takeover)

### 4. Technical Requirements
- Reuse existing modal/form logic from `embed.js`
- Only difference: replace floating button with full page layout
- Same feedback flow (5-star → Google, 4-star → improvement, 1-3 → feedback)

## Next Steps
1. Complete `embed-page.js` implementation
2. Test on blank HTML page
3. Add "Page Embed Code" tab to admin dashboard
4. Update documentation

## Status
🚧 In Progress - Checkpoint created before implementation
