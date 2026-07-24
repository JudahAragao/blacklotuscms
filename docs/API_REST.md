# REST API Specification

## Base URL
```
/api/v1
```

## Authentication
All protected endpoints require authentication via:
- **Session:** NextAuth JWT cookie (browser)
- **API Key:** `Authorization: Bearer bl_xxxxxxxx` header

## Rate Limiting
- Default: 60 requests per minute per API Key
- Configurable per key via `rateLimit` field
- Returns `429` com `RATE_LIMIT_EXCEEDED` code when exceeded

---

## Posts

### List Posts by Type
```
GET /api/v1/posts/:type
```
**Auth:** Public (published posts only)

**Response 200:**
```json
[
  {
    "id": "uuid",
    "title": "Post Title",
    "slug": "post-title",
    "content": "Content...",
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00Z",
    "postType": { "id": "uuid", "name": "Posts", "slug": "post" }
  }
]
```

### Create Post
```
POST /api/v1/posts/:type
```
**Auth:** Required | **RBAC:** `post.create`

**Request:**
```json
{
  "title": "New Post",
  "slug": "new-post",
  "content": "Content...",
  "status": "draft",
  "metaFields": {},
  "terms": []
}
```

**Note:** Field types include data fields (text, image, repeater, etc.) and organizer fields (tab, section). Tab/Section fields are visual-only and do not generate metaFields. metaFields are validated against FieldGroups with matching location rules (post type, taxonomy, etc.).

**Sub-fields:** Repeater and Flexible Content fields store their sub-fields in `config.repeater.fields[]` or `config.flexibleContent.layouts[].fields[]`. Sub-fields follow the same structure as root fields (name, label, type, config) and can be moved between levels via drag-and-drop in the admin UI.

### Get Post by ID
```
GET /api/v1/posts/:type/:id
```
**Auth:** Required

### Update Post
```
PUT /api/v1/posts/:type/:id
```
**Auth:** Required | **RBAC:** `post.update`

### Delete Post
```
DELETE /api/v1/posts/:type/:id
```
**Auth:** Required | **RBAC:** `post.delete`

---

## Media

### List Media
```
GET /api/v1/media?page=1
```
**Auth:** Required

### Get Media by ID
```
GET /api/v1/media/:id
```
**Auth:** Required

### Upload Media
```
POST /api/v1/media
```
**Auth:** Required | **RBAC:** `media.upload`
**Content-Type:** multipart/form-data

**Response 201 (Imagem):**
```json
{ "id": "uuid", "name": "photo.jpg", "url": "/uploads/12345-photo.webp", "thumbnail": "/uploads/thumb-12345-photo.webp", "mimeType": "image/webp", "size": 45678 }
```

**Response 201 (Arquivo generico):**
```json
{ "id": "uuid", "name": "doc.pdf", "url": "/uploads/12345-doc.pdf", "thumbnail": null, "mimeType": "application/pdf", "size": 123456 }
```

**Note:** Media deletion is managed via Admin panel server actions, not via REST API.

---

## Health Check

### Health
```
GET /api/health
```
**Auth:** Public

**Response 200:**
```json
{
  "status": "healthy",
  "timestamp": "2026-07-06T00:00:00Z",
  "database": "connected"
}
```

**Response 503:**
```json
{
  "status": "unhealthy",
  "timestamp": "2026-07-06T00:00:00Z",
  "database": "disconnected",
  "error": "Connection refused"
}
```

---

## Comments (Public)

### Create Comment
```
POST /api/v1/public/comments
```
**Auth:** Public

**Request:**
```json
{
  "postId": "uuid",
  "author": "John Doe",
  "email": "john@example.com",
  "content": "Great post!",
  "parentId": null
}
```

### List Comments
```
GET /api/v1/public/comments?postId=uuid
```
**Auth:** Public (approved comments only)

---

## Busca (Public)

### Global Search
```
GET /api/v1/public/search?q=query
```
**Auth:** Public
**Min query length:** 3 characters

---

## Users

### Get User
```
GET /api/v1/users/:id
```
**Auth:** Required | **RBAC:** `user.manage` ou self

**Response 200:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "image": null,
  "role": { "id": "uuid", "name": "Autor", "capabilities": {} },
  "createdAt": "2026-01-01T00:00:00Z"
}
```

### Export User Data (LGPD)
```
GET /api/v1/users/:id/data
```
**Auth:** Required | **RBAC:** `user.manage` ou self

**Response 200:**
```json
{
  "profile": { "email": "...", "role": "...", "image": "...", "createdAt": "..." },
  "posts": [...],
  "apiKeys": [{ "name": "...", "createdAt": "...", "lastUsedAt": "..." }]
}
```

### Delete User Account (LGPD)
```
DELETE /api/v1/users/:id
```
**Auth:** Required | **RBAC:** `user.manage` ou self
**Note:** Cascade delete: postTerms → metaValues → comments → posts → apiKeys → user. Cannot delete last Administrador.

---

## Webhooks

### Receive Webhook
```
POST /api/v1/webhooks/:pluginName/:eventId
```
**Auth:** Public (HMAC-SHA256 signature verification if configured)

**Request:**
```json
{
  "data": { "orderId": "123", "amount": 100 },
  "signature": "hmac-sha256-hash",
  "timestamp": "2026-01-01T00:00:00Z"
}
```

**Response 200:**
```json
{ "received": true, "message": "Webhook queued for 1 handler(s)" }
```

**Note:** Retry automático com exponential backoff (1s → 2s → 4s, max 3 tentativas).

---

## Sitemap

### Generate Sitemap
```
GET /api/sitemap.xml
```
**Auth:** Public

**Response 200:** XML sitemap

---

## GraphQL

### Endpoint
```
POST /api/graphql
```

### Example Query
```graphql
query {
  posts(type: "post") {
    id
    title
    slug
    content
    status
    publishedAt
    postType {
      slug
    }
  }
}
```

### Example Single Post
```graphql
query {
  postBySlug(slug: "my-post") {
    id
    title
    content
    metaFields
    author {
      email
    }
  }
}
```

**Note:** Introspection is disabled in production.

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_UNAUTHORIZED` | 401 | No authentication provided |
| `AUTH_FORBIDDEN` | 403 | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | 404 | Resource does not exist |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `CONFLICT` | 409 | Resource already exists |
| `INSTALL_REQUIRED` | 403 | System not installed, redirect to /install |
| `SANDBOX_TIMEOUT` | 500 | Plugin execution exceeded time limit |
| `PLUGIN_ERROR` | 500 | Plugin runtime error |
| `THEME_PERMISSION_DENIED` | 403 | Theme lacks required permission |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |
