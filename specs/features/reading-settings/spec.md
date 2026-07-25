---
spec_version: "1.0"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "reading-settings"
---

# Reading Settings Specification

## Description
Site reading settings: front page, posts page, and posts per page. Affects sitemap (static page exclusion) and theme rendering.

## Requirements
- **REQ-01:** Configure `page_on_front` (page displayed on home)
- **REQ-02:** Configure `page_for_posts` (posts listing page)
- **REQ-03:** Configure `posts_per_page` (number of posts per page, default 10)
- **REQ-04:** Pages defined as home/posts page are excluded from sitemap
- **REQ-05:** Settings stored in Setting table

## Settings Keys
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `page_on_front` | String (UUID) | — | ID of "page" type post for home |
| `page_for_posts` | String (UUID) | — | ID of "page" type post for listing |
| `posts_per_page` | Number | 10 | Items per page in archives |

## Constraints
- **C01:** Only posts of type "page" can be selected as home/posts page
- **C02:** Validation: selected page must exist and be published

## Dependencies
- **Depends on:** Post Management, Settings
- **Blocks:** Sitemap (static page exclusion)
- **Related to:** SEO, Sitemap, Theme Engine
