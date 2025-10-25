# Project Purpose

## Goal

Create a scalable, embeddable JavaScript widget that enables any client website to collect Google Reviews and optional private feedback. The system must support multi-tenant, multi-site, and multi-location deployments with comprehensive interaction logging to a central API and database.

## Non-Goals

- **Native mobile applications** – This project focuses solely on web embeds
- **Review moderation or content management** – We facilitate the review process but do not manage review content
- **Direct Google API integration** – We redirect users to Google's review interface rather than submitting reviews programmatically
- **Customer authentication** – Users interact anonymously or via Google's own authentication
- **Real-time analytics dashboard** – Basic logging is provided; advanced analytics are out of scope

## Success Criteria

1. **Easy integration** – A single `<script>` tag enables the widget on any client site
2. **Multi-tenancy** – Support multiple organisations (tenants), each with multiple sites and locations
3. **Reliable logging** – All user interactions are captured and stored reliably
4. **Graceful degradation** – Widget fails silently if API is unreachable
5. **Performance** – Minimal impact on host site load time (<50kb compressed)
6. **Compliance ready** – Suitable for privacy-conscious environments (GDPR, CCPA)

## User-Facing Language

All customer-facing copy must use **"Google Reviews"** consistently. Avoid alternatives like "Google Business Reviews", "GMB Reviews", or "Google ratings".

**Example copy:**
- "Leave a Google Review"
- "Share your experience on Google Reviews"
- "Thank you for your Google Review"

## Glossary

### Tenant
An organisation or business entity that uses the embed system. Each tenant has its own configuration and may manage multiple sites and locations.

**Example:** A franchise brand is a tenant.

### Site
A single website or web property belonging to a tenant. A tenant may operate multiple sites (e.g., regional websites, microsites).

**Example:** `www.example.com.au` and `www.example.co.nz` are separate sites under one tenant.

### Location
A physical business location associated with a Google Business Profile. Each location has a unique Place ID and may be associated with one or more sites.

**Example:** A retail store at 123 High Street, Melbourne.

### Place ID
A unique identifier assigned by Google to a specific location on Google Maps. Used to construct the Google Reviews URL for a location.

**Example:** `ChIJN1t_tDeuEmsRUsoyG83frY4`
