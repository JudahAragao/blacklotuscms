---
spec_version: "1.0"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "analytics"
---

# Analytics Specification

## Description
Integração com Google Analytics (GA4) e Google Tag Manager (GTM) para tracking de visitantes. Configurações via admin panel de SEO.

## Requirements
- **REQ-01:** Google Analytics (GA4) via component `GoogleAnalytics.tsx`
- **REQ-02:** Google Tag Manager via component `GoogleTagManager.tsx`
- **REQ-03:** IDs configuráveis via settings (`google_analytics_id`, `google_tag_manager_id`)
- **REQ-04:** Scripts carregados apenas quando IDs estão configurados
- **REQ-05:** Componentes inseridos no root layout

## Components

### GoogleAnalytics
- Carrega script GA4 (`gtag.js`) quando `google_analytics_id` está configurado
- Inclui `<Script>` do Next.js para carregamento otimizado

### GoogleTagManager
- Carrega script GTM quando `google_tag_manager_id` está configurado
- Inclui noscript fallback para users com JavaScript desabilitado

## Settings Keys
| Key | Type | Description |
|-----|------|-------------|
| `google_analytics_id` | String | ID de medição GA4 (ex: G-XXXXXXXXXX) |
| `google_tag_manager_id` | String | ID do contêiner GTM (ex: GTM-XXXXXXX) |

## Constraints
- **C01:** Scripts não são carregados se IDs estiverem vazios/null
- **C02:** Scripts usam `<Script strategy="afterInteractive">` do Next.js

## Dependencies
- **Depends on:** Settings, Root Layout
- **Blocks:** NONE
- **Related to:** SEO
