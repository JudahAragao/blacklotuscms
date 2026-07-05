---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "media-management"
---

# Media Management Acceptance Tests

## AT-01: Upload de Imagem
- **DADO** usuario autenticado com permissao media.upload
- **QUANDO** envia arquivo JPEG via POST /api/v1/media
- **ENTAO** arquivo e convertido para WebP, thumbnail gerado, registro criado
- **Referencia:** FR08

## AT-02: Upload Sem Permissao
- **DADO** usuario sem capability media.upload
- **QUANDO** envia arquivo via POST /api/v1/media
- **ENTAO** retorna erro 403
- **Referencia:** FR08, FR02

## AT-03: Exclusao de Midia
- **DADO** media existente no banco e storage
- **QUANDO** exclusao e solicitada com permissao media.manage
- **ENTAO** arquivo fisico e registro sao removidos
- **Referencia:** FR08
