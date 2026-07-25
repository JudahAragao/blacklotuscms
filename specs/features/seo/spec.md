---
spec_version: "1.5"
last_updated: "2026-07-19"
author: "BlackLotusCMS Team"
status: approved
feature: "seo"
---

# SEO Specification

## Description
Per-post SEO metadata with support for title, description, OG image and noIndex. Individual SEO overrides global settings. Root layout uses dynamic generateMetadata to fetch settings from database. OpenGraph and Twitter Card support for all social sharers. Support for 10 webmaster verification tools.

## Requirements
- **REQ-01:** seoTitle (max 70 chars)
- **REQ-02:** seoDescription (max 160 chars)
- **REQ-03:** ogImage for social sharing
- **REQ-04:** noIndex flag for indexing exclusion
- **REQ-05:** Sitemap integration (noIndex = excluded)
- **REQ-06:** Individual post SEO overrides global SEO via cascade: post.seo.* > post.title > seoSettings > root layout metadata
- **REQ-07:** PostEditor preview uses site_url configured in settings
- **REQ-08:** Support for 10 verification tools via meta tag
- **REQ-09:** Root layout exports async generateMetadata fetching site_name, title_separator and meta_description from database via SettingService
- **REQ-10:** Twitter Card metadata (card: summary_large_image, title, description, images) generated automatically alongside OpenGraph
- **REQ-11:** Access to post SEO fields via post.seo.title, post.seo.description, post.seo.ogImage (nested in ThemePostDTO)

## Fallback Cascade (SEO)

Metadata is resolved in the following priority order:

1. **Per-page SEO** — post.seo.title / post.seo.description / post.seo.ogImage
2. **Post title** — post.title (when seoTitle not filled)
3. **Global SEO** — seoSettings.site_name / seoSettings.meta_description / seoSettings.og_image
4. **Root layout** — async generateMetadata from layout.tsx (database fetch)

## Supported Verification Tools

| Tool | Meta Tag Name | Settings Key |
|------|---------------|--------------|
| Google Search Console | `google-site-verification` | `google_site_verification` |
| Bing Webmaster Tools | `msvalidate.01` | `bing_site_verification` |
| Yandex Webmaster | `yandex-verification` | `yandex_site_verification` |
| Baidu Webmaster | `baidu-site-verification` | `baidu_site_verification` |
| Naver Webmaster | `naver-site-verification` | `naver_site_verification` |
| Pinterest | `p:domain_verify` | `pinterest_site_verification` |
| Apple Business Connect | `apple-domain-verification` | `apple_domain_verification` |
| Majestic | `majestic-site-verification` | `majestic_site_verification` |
| Ahrefs | `ahrefs-site-verification` | `ahrefs_site_verification` |
| SEMrush | `semrush-site-verification` | `semrush_site_verification` |

## Constraints
- **C01:** seoTitle max 70, seoDescription max 160
- **C02:** Empty SEO fields inherit from global SEO configured in /admin/seo
- **C03:** Meta tags are only rendered when value is not empty
- **C04:** Root layout metadata is dynamic (generateMetadata) — never hardcoded
- **C05:** Twitter Card is generated automatically alongside OpenGraph (never separately)

## Dependencies
- **Depends on:** Post Management
- **Blocks:** NONE
- **Related to:** Sitemap, Themes
