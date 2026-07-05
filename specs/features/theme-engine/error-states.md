---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "theme-engine"
---

# Theme Engine Error States

## ERR-01: Tema Nao Encontrado
- **Condição:** Diretorio do tema nao existe
- **Código HTTP:** N/A (fallback para layout "post")
- **Ação do sistema:** import fallthrough para fallback

## ERR-02: Theme Permission Denied
- **Condição:** Tema sem permissao aprovada
- **Código HTTP:** 403
- **Mensagem:** "Theme '[name]' does not have approved permission for '[capability]'"
- **Código:** AUTH_FORBIDDEN

## ERR-03: Layout Nao Encontrado
- **Condição:** Arquivo de layout nao existe no tema
- **Código HTTP:** N/A (fallback automatico)
- **Ação do sistema:** import catch para layouts/post
