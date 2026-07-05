---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "search"
---

# Search Acceptance Tests

## AT-01: Search with Results
- **GIVEN** posts publicados with titulo "Tecnologia"
- **WHEN** busca por "tecnologia"
- **THEN** posts correspondentes retornados
- **Referencia:** FR16

## AT-02: Query Muito Curta
- **GIVEN** query "ab" (2 caracteres)
- **WHEN** busca e executada
- **THEN** array vazio retornado
- **Referencia:** FR16
