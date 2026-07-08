---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "search"
---

# Busca Specification

## Description
Busca global em titulos, conteudo e meta fields de posts publicados.

## Requirements
- **REQ-01:** Busca case-insensitive em title, content
- **REQ-02:** Busca em MetaValues (JSON contains)
- **REQ-03:** Query minima de 3 caracteres
- **REQ-04:** Limite configuravel (default 20)
- **REQ-05:** Apenas posts published

## Constraints
- **C01:** Query < 3 caracteres retorna array vazio
- **C02:** Apenas posts com status "published"

## Dependencies
- **Depends on:** Post Management, MetaFields
- **Blocks:** NONE
- **Related to:** Themes, Sitemap
