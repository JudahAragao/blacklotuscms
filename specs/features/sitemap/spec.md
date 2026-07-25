---
spec_version: "1.3"
last_updated: "2026-07-17"
author: "BlackLotusCMS Team"
status: approved
feature: "sitemap"
---

# Sitemap Specification

## Description
Automatic XML sitemap generation based on PostType and Taxonomy inclusion settings.

## Requirements
- **REQ-01:** XML sitemap generation
- **REQ-02:** Configurable inclusion by PostType
- **REQ-03:** Exclusion of posts with noIndex
- **REQ-04:** Only published posts
- **REQ-05:** Configurable inclusion by Taxonomies
- **REQ-06:** Exclusion of static pages defined as home/posts page
- **REQ-07:** Double-slash correction in URL (baseUrl + slug)
- **REQ-08:** Publication date (createdAt) inclusion alongside lastmod

## Constraints
- **C01:** PostTypes inclusion via sitemap_post_types setting
- **C02:** Default: page and post
- **C03:** Taxonomies inclusion via sitemap_taxonomies setting
- **C04:** Pages defined in reading settings (page_on_front, page_for_posts) are excluded from sitemap

## Dependencies
- **Depends on:** Post Management, Settings, Reading Settings
- **Blocks:** NONE
- **Related to:** SEO
