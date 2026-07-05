---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "seo"
---

# SEO Specification

## Description
Metadata de SEO por post with suporte a title, description, OG image e noIndex.

## Requirements
- **REQ-01:** seoTitle (max 70 chars)
- **REQ-02:** seoDescription (max 160 chars)
- **REQ-03:** ogImage para social sharing
- **REQ-04:** noIndex flag para exclusao de indexacao
- **REQ-05:** Integracao with sithemep (noIndex = excluded)

## Constraints
- **C01:** seoTitle max 70, seoDescription max 160

## Dependencies
- **Depends on:** Post Management
- **Blocks:** NONE
- **Related to:** Sithemep, Themes
