---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "media-management"
---

# Media Management Acceptance Tests

## AT-01: Upload de Imagem
- **GIVEN** usuario autenticado com permissao media.upload
- **WHEN** envia arquivo JPEG via POST /api/v1/media
- **THEN** arquivo e convertido para WebP, thumbnail gerado, registro criado
- **Referencia:** FR08

## AT-02: Upload Sem Permission
- **GIVEN** usuario sem capability media.upload
- **WHEN** envia arquivo via POST /api/v1/media
- **THEN** retorna erro 403
- **Referencia:** FR08, FR02

## AT-03: Exclusao de Media
- **GIVEN** media existente no banco e storage
- **WHEN** exclusao e solicitada com permissao media.manage
- **THEN** arquivo fisico e registro sao removidos
- **Referencia:** FR08
