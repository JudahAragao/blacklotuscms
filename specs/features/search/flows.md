---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "search"
---

# Search Flows

## Global Search

1. **Theme/user sends query**
   - State: Query received

2. **Validation: query.length >= 3**
   - State: Valid query

3. **Prisma query with OR**
   - title contains (insensitive)
   - content contains (insensitive)
   - metaValues value array_contains
   - Filter: status = "published"
   - State: Results obtained

4. **Mapping to ThemePostDTO**
   - State: Data formatted
