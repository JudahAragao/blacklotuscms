---
spec_version: "1.0"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "analytics"
---

# Analytics Specification

## Description
Integration with Google Analytics (GA4) and Google Tag Manager (GTM) for visitor tracking. Configured via SEO admin panel settings.

## Requirements
- **REQ-01:** Google Analytics (GA4) via `GoogleAnalytics.tsx` component
- **REQ-02:** Google Tag Manager via `GoogleTagManager.tsx` component
- **REQ-03:** Configurable IDs via settings (`google_analytics_id`, `google_tag_manager_id`)
- **REQ-04:** Scripts loaded only when IDs are configured
- **REQ-05:** Components inserted in root layout

## Components

### GoogleAnalytics
- Loads GA4 script (`gtag.js`) when `google_analytics_id` is configured
- Includes Next.js `<Script>` for optimized loading

### GoogleTagManager
- Loads GTM script when `google_tag_manager_id` is configured
- Includes noscript fallback for users with JavaScript disabled

## Settings Keys
| Key | Type | Description |
|-----|------|-------------|
| `google_analytics_id` | String | GA4 measurement ID (e.g., G-XXXXXXXXXX) |
| `google_tag_manager_id` | String | GTM container ID (e.g., GTM-XXXXXXX) |

## Constraints
- **C01:** Scripts are not loaded if IDs are empty/null
- **C02:** Scripts use Next.js `<Script strategy="afterInteractive">`

## Dependencies
- **Depends on:** Settings, Root Layout
- **Blocks:** NONE
- **Related to:** SEO
