---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "search"
---

# Busca Flows

## Busca Global

1. **Theme/usuario envia query**
   - State: Query received

2. **Validacao: query.length >= 3**
   - State: Valid query

3. **Prisma query com OR**
   - title contains (insensitive)
   - content contains (insensitive)
   - metaValues value array_contains
   - Filtro: status = "published"
   - State: Results obtained

4. **Mapeamento para ThemePostDTO**
   - State: Data formatted
