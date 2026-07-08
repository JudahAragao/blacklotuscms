---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
module: "posts"
---

# API - Posts

## Endpoints

### EP-01: List Posts by Type
- **Method:** `GET`
- **Path:** `/api/v1/posts/:type`
- **Auth:** Public (apenas posts published)
- **RBAC:** N/A (data públicos)

**Response 200:**
```json
[{ "id": "uuid", "title": "string", "slug": "string", "content": "string", "status": "published", "postType": { "id": "uuid", "name": "string", "slug": "string" } }]
```

**Erros possíveis:**
- `500` — DATABASE_ERROR

### EP-02: Create Post
- **Method:** `POST`
- **Path:** `/api/v1/posts/:type`
- **Auth:** Required (session ou API Key)
- **RBAC:** `post.create`

**Request:**
```json
{ "title": "string", "slug": "string", "content": "string", "status": "draft", "metaFields": {}, "terms": [] }
```

**Response 201:**
```json
{ "id": "uuid", "title": "string", "slug": "string", "status": "draft" }
```

**Erros possíveis:**
- `400` — VALIDATION_ERROR
- `401` — AUTH_UNAUTHORIZED
- `403` — AUTH_FORBIDDEN
- `404` — RESOURCE_NOT_FOUND (PostType não existe)
- `409` — Slug duplicado
- `422` — Validção de MetaFields falhou

### EP-03: Get Post by ID
- **Method:** `GET`
- **Path:** `/api/v1/posts/:type/:id`
- **Auth:** Required
- **RBAC:** N/A

**Response 200:**
```json
{ "id": "uuid", "title": "string", "slug": "string", "content": "string", "metaValues": {}, "terms": [] }
```

**Erros possíveis:**
- `404` — RESOURCE_NOT_FOUND

### EP-04: GraphQL - Posts Query
- **Method:** `POST`
- **Path:** `/api/graphql`
- **Auth:** Public (apenas posts published)
- **RBAC:** N/A

**Query:**
```graphql
query { posts(type: "post") { id title slug content status publishedAt postType { slug } } }
```

### EP-05: GraphQL - PostBySlug Query
- **Method:** `POST`
- **Path:** `/api/graphql`
- **Auth:** Public
- **RBAC:** N/A

**Query:**
```graphql
query { postBySlug(slug: "my-post") { id title slug content metaFields } }
```
