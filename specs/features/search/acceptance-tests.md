---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "search"
---

# Search Acceptance Tests

## AT-01: Busca com Resultados
- **DADO** posts publicados com titulo "Tecnologia"
- **QUANDO** busca por "tecnologia"
- **ENTAO** posts correspondentes retornados
- **Referencia:** FR16

## AT-02: Query Muito Curta
- **DADO** query "ab" (2 caracteres)
- **QUANDO** busca e executada
- **ENTAO** array vazio retornado
- **Referencia:** FR16
