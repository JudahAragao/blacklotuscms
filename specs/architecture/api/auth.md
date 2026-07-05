---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
module: "auth"
---

# API - Authentication

## Endpoints

### EP-01: NextAuth Session
- **Method:** `GET/POST`
- **Path:** `/api/auth/[...nextauth]`
- **Auth:** Session-based (JWT)
- **RBAC:** N/A

### EP-02: Login Page
- **Method:** `GET`
- **Path:** `/auth/login`
- **Auth:** N/A (public)
- **RBAC:** N/A

### EP-03: Create API Key
- **Method:** `POST`
- **Path:** (via admin settings)
- **Auth:** Required
- **RBAC:** `user.manage` ou proprio usuario

**Request:**
```json
{ "userId": "uuid", "name": "App Name", "expiresDays": 90, "rateLimit": 60 }
```

**Response:**
```json
{ "key": "bl_...", "id": "uuid" }
```
Nota: A chave plain text e mostrada apenas uma vez.

### EP-04: Validate API Key
- **Method:** Via Proxy Middleware
- **Path:** Qualquer `/api/v1/*` ou `/api/graphql`
- **Auth:** Bearer token no header Authorization
- **RBAC:** Baseado no role do usuario dono da chave

### EP-05: List API Keys
- **Method:** `GET`
- **Auth:** Required
- **RBAC:** `user.manage` ou proprio usuario

### EP-06: Revoke API Key
- **Method:** `DELETE`
- **Auth:** Required
- **RBAC:** `user.manage` ou proprio usuario
