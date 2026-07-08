---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "search"
---

# Busca Error States

## ERR-01: Query Vazia ou Curta
- **Condition:** query.length < 3
- **Código HTTP:** N/A (retorna [])
- **Ação do sistema:** Retorna array vazio silenciosamente
