---
spec_version: "1.2"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "search"
---

# Search Specification

## Description
Global search in titles, content and meta fields of published posts.

## Requirements
- **REQ-01:** Case-insensitive search in title, content
- **REQ-02:** Search in MetaValues (JSON contains)
- **REQ-03:** Minimum query of 3 characters
- **REQ-04:** Configurable limit (default 20)
- **REQ-05:** Only published posts
- **REQ-06:** Exclusion of posts with status "draft" or "private"
- **REQ-07:** Exclusion of posts with `expiresAt` in the past
- **REQ-08:** Exclusion of posts with `noIndex = true`

## Constraints
- **C01:** Query < 3 characters returns empty array
- **C02:** Only posts with status "published"

## Dependencies
- **Depends on:** Post Management, MetaFields
- **Blocks:** NONE
- **Related to:** Themes, Sitemap
