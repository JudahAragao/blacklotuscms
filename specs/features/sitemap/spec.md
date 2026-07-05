---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "sitemap"
---

# Sitemap Specification

## Description
Geracao automatica de XML sitemap baseado em configuracoes de inclusao de PostTypes.

## Requirements
- **REQ-01:** Geracao de XML sitemap
- **REQ-02:** Inclusao configuravel por PostType
- **REQ-03:** Exclusao de posts com noIndex
- **REQ-04:** Apenas posts published

## Constraints
- **C01:** PostTypes inclusao via setting sitemap_post_types
- **C02:** Default: page e post

## Dependencies
- **Depende de:** Post Management, Settings
- **Bloqueia:** NENHUMA
- **Relacionado com:** SEO
