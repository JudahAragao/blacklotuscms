---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "search"
---

# Search Flows

## Busca Global

1. **Tema/usuario envia query**
   - Estado: Query recebida

2. **Validacao: query.length >= 3**
   - Estado: Query valida

3. **Prisma query com OR**
   - title contains (insensitive)
   - content contains (insensitive)
   - metaValues value array_contains
   - Filtro: status = "published"
   - Estado: Resultados obtidos

4. **Mapeamento para ThemePostDTO**
   - Estado: Dados formatados
