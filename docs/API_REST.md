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

### Upload Media
```
POST /api/v1/media
```
**Auth:** Required | **RBAC:** `media.upload`
**Content-Type:** multipart/form-data

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
