---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "search"
---

# Search Error States

## ERR-01: Query Vazia ou Curta
- **Condition:** query.length < 3
- **Código HTTP:** N/A (retorna [])
- **Ação do system:** Retorna array vazio silenciosamente
