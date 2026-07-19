---
spec_version: "1.5"
last_updated: "2026-07-19"
author: "BlackLotusCMS Team"
status: approved
feature: "seo"
---

# SEO Specification

## Description
Metadata de SEO por post com suporte a title, description, OG image e noIndex. SEO individual prevalece sobre configuracoes globais. Root layout utiliza generateMetadata dinamico para buscar settings do banco. Suporte a OpenGraph e Twitter Card para todos os social sharers. Suporte a 10 ferramentas de verificacao de webmaster.

## Requirements
- **REQ-01:** seoTitle (max 70 chars)
- **REQ-02:** seoDescription (max 160 chars)
- **REQ-03:** ogImage para social sharing
- **REQ-04:** noIndex flag para exclusao de indexacao
- **REQ-05:** Integracao com sitemap (noIndex = excluded)
- **REQ-06:** SEO individual do post prevalece sobre SEO global via encadeamento: post.seo.* > post.title > seoSettings > root layout metadata
- **REQ-07:** Preview no PostEditor utiliza site_url configurado nas settings
- **REQ-08:** Suporte a 10 ferramentas de verificacao via meta tag
- **REQ-09:** Root layout exporta generateMetadata async buscando site_name, title_separator e meta_description do banco via SettingService
- **REQ-10:** Twitter Card metadata (card: summary_large_image, title, description, images) gerada automaticamente junto com OpenGraph
- **REQ-11:** Acesso aos campos SEO do post via post.seo.title, post.seo.description, post.seo.ogImage (nested no ThemePostDTO)

## Cascata de Fallback (SEO)

A metadata e resolvida na seguinte ordem de prioridade:

1. **Per-page SEO** — post.seo.title / post.seo.description / post.seo.ogImage
2. **Post title** — post.title (quando seoTitle nao preenchido)
3. **Global SEO** — seoSettings.site_name / seoSettings.meta_description / seoSettings.og_image
4. **Root layout** — generateMetadata async do layout.tsx (busca do banco)

## Ferramentas de Verificacao Suportadas

| Ferramenta | Meta Tag Name | Chave Settings |
|------------|---------------|----------------|
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
- **C02:** Campos de SEO vazios herdam do SEO global configurado em /admin/seo
- **C03:** Meta tags so sao renderizadas quando o valor nao esta vazio
- **C04:** Root layout metadata e dinamico (generateMetadata) — nunca hardcode
- **C05:** Twitter Card e gerada automaticamente junto com OpenGraph (nunca separadamente)

## Dependencies
- **Depends on:** Post Management
- **Blocks:** NONE
- **Related to:** Sitemap, Themes
