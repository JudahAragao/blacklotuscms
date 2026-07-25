---
spec_version: "1.2"
last_updated: "2026-07-06"
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
- **RBAC:** `user.manage` or own user

**Request:**
```json
{ "userId": "uuid", "name": "App Name", "expiresDays": 90, "rateLimit": 60 }
```

**Response:**
```json
{ "key": "bl_...", "id": "uuid" }
```
Note: The plain text key is shown only once.

### EP-04: Validate API Key
- **Method:** Via Proxy Middleware
- **Path:** Any `/api/v1/*` or `/api/graphql`
- **Auth:** Bearer token in Authorization header
- **RBAC:** Based on the role of the key owner user

### EP-05: List API Keys
- **Method:** `GET`
- **Auth:** Required
- **RBAC:** `user.manage` or own user

### EP-06: Revoke API Key
- **Method:** `DELETE`
- **Auth:** Required
- **RBAC:** `user.manage` or own user
