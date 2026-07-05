---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "theme-engine"
---

# Theme Engine Error States

## ERR-01: Theme Nao Found
- **Condition:** Diretorio do theme nao existe
- **Código HTTP:** N/A (fallback para layout "post")
- **Ação do system:** import fallthrough para fallback

## ERR-02: Theme Permission Denied
- **Condition:** Theme sem permissao aprovada
- **Código HTTP:** 403
- **Mensagem:** "Theme '[name]' does not have approved permission for '[capability]'"
- **Código:** AUTH_FORBIDDEN

## ERR-03: Layout Nao Found
- **Condition:** File de layout nao existe no theme
- **Código HTTP:** N/A (fallback automatico)
- **Ação do system:** import catch para layouts/post
