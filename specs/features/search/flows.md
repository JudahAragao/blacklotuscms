---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "search"
---

# Search Flows

## Search Global

1. **Theme/usuario envia query**
   - State: Query received

2. **Validcao: query.length >= 3**
   - State: Valid query

3. **Prisma query with OR**
   - title contains (insensitive)
   - content contains (insensitive)
   - metaValues value array_contains
   - Filtro: status = "published"
   - State: Results obtained

4. **Mapeamento para ThemePostDTO**
   - State: Data formatted
