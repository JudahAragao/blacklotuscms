---
spec_version: "1.3"
last_updated: "2026-07-17"
author: "BlackLotusCMS Team"
status: approved
feature: "sitemap"
---

# Sitemap Specification

## Description
Geracao automatica de XML sitemap baseado em configuracoes de inclusao de PostTypes e Taxonomies.

## Requirements
- **REQ-01:** Geracao de XML sitemap
- **REQ-02:** Inclusao configuravel por PostType
- **REQ-03:** Exclusao de posts com noIndex
- **REQ-04:** Apenas posts published
- **REQ-05:** Inclusao configuravel por Taxonomias
- **REQ-06:** Exclusao de paginas estaticas definidas como home/posts page
- **REQ-07:** Correcao de barras duplas na URL (baseUrl + slug)
- **REQ-08:** Inclusao de data de publicacao (createdAt) além de lastmod

## Constraints
- **C01:** PostTypes inclusao via setting sitemap_post_types
- **C02:** Default: page e post
- **C03:** Taxonomies inclusao via setting sitemap_taxonomies
- **C04:** Paginas definidas em reading settings (page_on_front, page_for_posts) sao excluidas do sitemap

## Dependencies
- **Depends on:** Post Management, Settings, Reading Settings
- **Blocks:** NONE
- **Related to:** SEO
