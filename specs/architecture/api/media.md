---
spec_version: "1.3"
last_updated: "2026-07-15"
author: "BlackLotusCMS Team"
status: approved
module: "media"
---

# API - Media

## Endpoints

### EP-01: List Media
- **Method:** `GET`
- **Path:** `/api/v1/media?page=1`
- **Auth:** Required
- **RBAC:** N/A (any authenticated)

**Response 200:**
```json
[{ "id": "uuid", "name": "string", "url": "string", "thumbnail": "string|null", "mimeType": "string", "size": 12345 }]
```

**Erros possíveis:**
- `500` — DATABASE_ERROR

### EP-02: Upload Media
- **Method:** `POST`
- **Path:** `/api/v1/media`
- **Auth:** Required
- **RBAC:** `media.upload`

**Request:** multipart/form-data com campo "file"

**Response 201 (Imagem):**
```json
{ "id": "uuid", "name": "string", "url": "/uploads/12345-image.webp", "thumbnail": "/uploads/thumb-12345-image.webp", "mimeType": "image/webp", "size": 45678 }
```

**Response 201 (Arquivo generico):**
```json
{ "id": "uuid", "name": "string", "url": "/uploads/12345-document.pdf", "thumbnail": null, "mimeType": "application/pdf", "size": 123456 }
```

**Erros possíveis:**
- `400` — File não enviado
- `401` — AUTH_UNAUTHORIZED
- `403` — AUTH_FORBIDDEN
- `500` — Erro no processamento do arquivo

### EP-03: Delete Media
- **Method:** Server Action (Admin Panel)
- **Auth:** Required
- **RBAC:** `media.manage`

**Note:** Media deletion is handled via admin panel server actions, not via REST API endpoint. The `MediaService.delete()` method removes both the physical file and database record.

**Erros possíveis:**
- `401` — AUTH_UNAUTHORIZED
- `403` — AUTH_FORBIDDEN
- `404` — RESOURCE_NOT_FOUND
