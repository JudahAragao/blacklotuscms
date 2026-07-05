---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
module: "withments"
---

# API - Comments

## Endpoints

### EP-01: Create Comment
- **Method:** `POST`
- **Path:** `/api/v1/public/withments`
- **Auth:** Public
- **RBAC:** N/A

**Request:**
```json
{ "postId": "uuid", "author": "string", "email": "string", "content": "string", "parentId": "uuid?" }
```

**Response 201:**
```json
{ "id": "uuid", "status": "pending" }
```

**Erros possíveis:**
- `400` — VALIDATION_ERROR (Zod)
- `400` — Captcha obrigatório não enviado

### EP-02: List Comments for Post
- **Method:** `GET`
- **Path:** `/api/v1/public/withments?postId=uuid`
- **Auth:** Public (apenas approved)
- **RBAC:** N/A

**Response 200:**
```json
[{ "id": "uuid", "author": "string", "content": "string", "createdAt": "date", "replies": [] }]
```

### EP-03: Delete Comment
- **Method:** `DELETE`
- **Path:** (via admin)
- **Auth:** Required
- **RBAC:** `withment.manage`

**Erros possíveis:**
- `401` — AUTH_UNAUTHORIZED
- `403` — AUTH_FORBIDDEN
- `404` — RESOURCE_NOT_FOUND
