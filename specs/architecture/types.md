---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
---

# Technical Data Types (TypeScript)

## Common Types

### ErrorCode (src/lib/errors.ts)
// source: manual
```typescript
type ErrorCode = 'AUTH_UNAUTHORIZED' | 'AUTH_FORBIDDEN' | 'RESOURCE_NOT_FOUND' | 'VALIDATION_ERROR' | 'DATABASE_ERROR' | 'INTERNAL_SERVER_ERROR' | 'RATE_LIMIT_EXCEEDED';
```

### BlackLotusCMSError (src/lib/errors.ts)
// source: manual
```typescript
class BlackLotusCMSError extends Error {
  statusCode: number;
  code: ErrorCode;
}
```

### DockerSecrets (src/lib/secrets.ts)
// source: manual
```typescript
interface DockerSecrets {
  DATABASE_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  STORAGE_DRIVER: string;
  UPLOAD_DIR: string;
  SANDBOX_MEMORY_LIMIT: string;
  SANDBOX_TIMEOUT: string;
}
```

### StorageDriver (src/lib/storage.ts)
// source: manual
```typescript
interface StorageDriver {
  upload(file: Buffer, filename: string, mimeType: string): Promise<string>;
  delete(filename: string): Promise<void>;
}
```

### ApiHandler (src/lib/api-auth.ts)
// source: manual
```typescript
type ApiHandler = (req: NextRequest, context: any, session: any) => Promise<NextResponse>;
```

### PluginManifest (src/core/sandbox/PluginSandbox.ts)
// source: manual
```typescript
interface PluginManifest {
  name: string;
  version: string;
  permissions: string[];
}
```

### HookMetadata (src/core/services/HookService.ts)
// source: manual
```typescript
interface HookMetadata {
  source: string;
  priority: number;
}
```

## Core Entities (Prisma Generated)
// source: prisma generate (NAO MODIFICAR DIRETAMENTE)

Tipos gerados pelo Prisma para todas as entidades: User, Role, ApiKey, PostType, Post, FieldGroup, Field, MetaValue, Taxonomy, Term, PostTerm, Plugin, PluginData, PluginPermission, Media, Setting, ThemeData, ThemePermission, Menu, MenuItem, Comment.

Acesso via: `import { User, Post, ... } from '../../prisma/generated/prisma'`

## Shared Types (src/types/dto.ts)
// source: manual

### ThemePostDTO
```typescript
interface ThemePostDTO {
  id: string; title: string; slug: string; content: string;
  status: string; publishedAt: Date | null;
  postType: { id: string; name: string; slug: string };
  seo?: { title?: string | null; description?: string | null; ogImage?: string | null; noIndex: boolean };
  meta?: Record<string, any>;
}
```

### MenuItemDTO
```typescript
interface MenuItemDTO { id: string; label: string; url: string; order: number; children: MenuItemDTO[] }
```

### MediaDTO
```typescript
interface MediaDTO { id: string; name: string; url: string; thumbnail: string | null; mimeType: string; size: number; metadata?: { width?: number; height?: number; format?: string }; createdAt: Date }
```

### PostTypeDTO
```typescript
interface PostTypeDTO { id: string; slug: string; label: string; hierarchical: boolean; supportsTitle: boolean; supportsEditor: boolean; supportsPermalink: boolean; supportsTaxonomies: boolean; settings: any; _count?: { posts: number } }
```

### TaxonomyDTO
```typescript
interface TaxonomyDTO { id: string; slug: string; label: string; hierarchical: boolean; postType?: { slug: string; label: string }; terms?: TermDTO[] }
```

### TermDTO
```typescript
interface TermDTO { id: string; slug: string; name: string; description?: string | null; taxonomyId: string }
```

### UserDTO
```typescript
interface UserDTO { id: string; email: string; image?: string | null; role: { id: string; name: string; capabilities: any } }
```

## Zod Schemas (src/schemas/)
// source: manual

### CreatePostSchema (src/schemas/post.schema.ts)
- postTypeId: UUID
- title: string (1-255)
- slug: string (regex: ^[a-z0-9-]+$)
- content: string (optional)
- status: "draft" | "published" | "private"
- seoTitle: string (max 70, optional)
- seoDescription: string (max 160, optional)
- metaFields: Record<string, any> (optional)
- terms: string[] (optional)

### CreateCommentSchema (src/schemas/comment.schema.ts)
- postId: UUID
- author: string (2-100)
- email: string (valid email)
- content: string (1-5000)
- parentId: UUID (optional)
- captchaToken: string (optional)
