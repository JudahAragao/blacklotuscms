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
  hierarchical: Boolean!
  posts: [Post!]!
  taxonomies: [Taxonomy!]!
  # Note: fieldGroups are no longer directly linked to PostType
  # Use FieldGroup locations to determine which fields apply
}
```

### Taxonomy
```graphql
type Taxonomy {
  id: ID!
  slug: String!
  label: String!
  postType: PostType!
  terms: [Term!]!
}
```

### Term
```graphql
type Term {
  id: ID!
  slug: String!
  name: String!
  taxonomy: Taxonomy!
}
```

### User
```graphql
type User {
  id: ID!
  email: String  # Requires user.manage capability
  image: String
  role: Role
}
```

### Role
```graphql
type Role {
  id: ID!
  name: String!
  capabilities: JSON
}
```

### Comment
```graphql
type Comment {
  id: ID!
  postId: ID!
  author: String!
  email: String!
  content: String!
  status: String!
  parentId: ID
  replies: [Comment!]!
  createdAt: DateTime!
}
```

### Menu
```graphql
type Menu {
  id: ID!
  name: String!
  slug: String!
  items: [MenuItem!]!
}
```

### MenuItem
```graphql
type MenuItem {
  id: ID!
  label: String!
  url: String!
  order: Int!
  children: [MenuItem!]!
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

### postTypes
```graphql
query PostTypes {
  postTypes {
    id
    slug
    label
    hierarchical
    posts {
      id
      title
    }
  }
}
```
**Auth:** Public

### taxonomies
```graphql
query Taxonomies($postTypeSlug: String!) {
  taxonomies(postTypeSlug: $postTypeSlug) {
    id
    slug
    label
    terms {
      id
      slug
      name
    }
  }
}
```
**Auth:** Public

### menus
```graphql
query Menus {
  menus {
    id
    name
    slug
    items {
      id
      label
      url
      order
      children {
        id
        label
        url
      }
    }
  }
}
```
**Auth:** Public

---

## Mutations

### createPost
```graphql
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    slug
    status
  }
}
```
**Auth:** Required | **RBAC:** `post.create`

### updatePost
```graphql
mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
  updatePost(id: $id, input: $input) {
    id
    title
    slug
    status
  }
}
```
**Auth:** Required | **RBAC:** `post.update`

### deletePost
```graphql
mutation DeletePost($id: ID!) {
  deletePost(id: $id)
}
```
**Auth:** Required | **RBAC:** `post.delete`

### createComment
```graphql
mutation CreateComment($input: CreateCommentInput!) {
  createComment(input: $input) {
    id
    author
    content
    status
  }
}
```
**Auth:** Public

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
