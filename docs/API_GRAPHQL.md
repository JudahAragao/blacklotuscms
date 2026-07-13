# GraphQL API Specification

## Endpoint
```
POST /api/graphql
```

## Authentication
- **Public queries:** No authentication required (published posts only)
- **Authenticated queries:** Session cookie or API Key Bearer token

## Schema Builder
Built com **Pothos** + **Prisma Plugin** for type-safe schema generation.

---

## Types

### Post
```graphql
type Post {
  id: ID!
  title: String!
  slug: String!
  content: String
  status: String!
  publishedAt: DateTime
  createdAt: DateTime!
  seoTitle: String
  seoDescription: String
  ogImage: String
  noIndex: Boolean!
  postType: PostType!
  author: User!
  metaFields: JSON
}
```

### PostType
```graphql
type PostType {
  id: ID!
  slug: String!
  label: String!
  posts: [Post!]!
  # Note: fieldGroups are no longer directly linked to PostType
  # Use FieldGroup locations to determine which fields apply
}
```

### User
```graphql
type User {
  id: ID!
  email: String  # Requires user.manage capability
}
```

---

## Queries

### posts
```graphql
query Posts($type: String!) {
  posts(type: $type) {
    id
    title
    slug
    status
    publishedAt
    postType {
      slug
    }
  }
}
```
**Args:**
- `type` (String, required): Post type slug

**Auth:** Public (published only)

### postBySlug
```graphql
query PostBySlug($slug: String!) {
  postBySlug(slug: $slug) {
    id
    title
    slug
    content
    metaFields
    seoTitle
    seoDescription
  }
}
```
**Args:**
- `slug` (String, required): Post slug

**Auth:** Public (published only)

---

## Scalars

### DateTime
ISO 8601 datetime string.

### JSON
Arbitrary JSON value.

---

## Auth Scopes

| Scope | Description |
|-------|-------------|
| `public` | Always true |
| `authenticated` | True if user is logged in |
| `hasCapability` | True if user has the specified capability |

### Example: Protected Field
```graphql
type User {
  email: String @auth(requires: hasCapability("user.manage"))
}
```

---

## Security

- **Introspection:** Disabled in production (`NODE_ENV=production`)
- **Rate Limiting:** Applied via proxy before reaching GraphQL
- **Data Masking:** Sensitive fields (passwordHash, etc.) never exposed

---

## Error Handling

GraphQL errors follow the standard format:
```json
{
  "errors": [
    {
      "message": "Not authorized",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["posts"]
    }
  ],
  "data": null
}
```

---

## Examples

### List all published posts
```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts(type: \"post\") { id title slug } }"}'
```

### Get single post com meta fields
```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ postBySlug(slug: \"hello-world\") { id title content metaFields } }"}'
```

**Note:** metaFields contains only data field values. Tab and Section fields are visual organizers and do not appear in metaFields.
