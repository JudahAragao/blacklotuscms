---
spec_version: "1.0"
last_updated: "2026-07-05"
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
[{ "id": "uuid", "name": "string", "url": "string", "thumbnail": "string", "mimeType": "image/webp", "size": 12345 }]
```

**Erros possíveis:**
- `500` — DATABASE_ERROR

### EP-02: Upload Media
- **Method:** `POST`
- **Path:** `/api/v1/media`
- **Auth:** Required
- **RBAC:** `media.upload`

**Request:** multipart/form-data com campo "file"

**Response 201:**
```json
{ "id": "uuid", "name": "string", "url": "/uploads/12345-image.webp", "thumbnail": "/uploads/thumb-12345-image.webp", "mimeType": "image/webp", "size": 45678 }
```

**Erros possíveis:**
- `400` — Arquivo não enviado
- `401` — AUTH_UNAUTHORIZED
- `403` — AUTH_FORBIDDEN
- `500` — Erro no processamento da imagem

### EP-03: Delete Media
- **Method:** `DELETE`
- **Path:** `/api/v1/media/:id`
- **Auth:** Required
- **RBAC:** `media.manage`

**Erros possíveis:**
- `401` — AUTH_UNAUTHORIZED
- `403` — AUTH_FORBIDDEN
- `404` — RESOURCE_NOT_FOUND
