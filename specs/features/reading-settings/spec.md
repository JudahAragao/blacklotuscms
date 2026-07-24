---
spec_version: "1.0"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "reading-settings"
---

# Reading Settings Specification

## Description
Configurações de leitura do site: página inicial, página de posts, e posts por página. Afeta sitemap (exclusão de páginas estáticas) e renderização de temas.

## Requirements
- **REQ-01:** Configurar `page_on_front` (página exibida na home)
- **REQ-02:** Configurar `page_for_posts` (página de listagem de posts)
- **REQ-03:** Configurar `posts_per_page` (número de posts por página, default 10)
- **REQ-04:** Páginas definidas como home/posts page são excluídas do sitemap
- **REQ-05:** Configurações armazenadas na tabela Setting

## Settings Keys
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `page_on_front` | String (UUID) | — | ID do post tipo "page" para home |
| `page_for_posts` | String (UUID) | — | ID do post tipo "page" para listagem |
| `posts_per_page` | Number | 10 | Itens por página em archives |

## Constraints
- **C01:** Apenas posts do tipo "page" podem ser selecionados como home/posts page
- **C02:** Validação: página selecionada deve existir e estar published

## Dependencies
- **Depends on:** Post Management, Settings
- **Blocks:** Sitemap (exclusão de páginas estáticas)
- **Related to:** SEO, Sitemap, Theme Engine
