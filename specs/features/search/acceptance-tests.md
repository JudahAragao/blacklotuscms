---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "search"
---

# Busca Acceptance Tests

## AT-01: Busca com Results
- **GIVEN** posts publicados com titulo "Tecnologia"
- **WHEN** busca por "tecnologia"
- **THEN** posts correspondentes retornados
- **Referencia:** FR16

## AT-02: Query Muito Curta
- **GIVEN** query "ab" (2 caracteres)
- **WHEN** busca e executada
- **THEN** array vazio retornado
- **Referencia:** FR16
