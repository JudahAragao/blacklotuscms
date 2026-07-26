---
spec_version: "1.4"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
---

# Coding Standards - BlackLotusCMS

## 1. Services Pattern (Stable Proxy)
Each service follows the "Stable Proxy" pattern:

```typescript
export class MyService {
  constructor(private readonly db = prisma, private readonly log = logger) {}
  
  async doSomething() { /* logic */ }
  
  // Static proxy for compatibility
  static async doSomething() { return myService.doSomething(); }
}

export const myService = new MyService();
```

## 2. RBAC in Services
Every operation that modifies data verifies permission:

```typescript
if (!canPerformAction(user, 'capability.name')) {
  throw new BlackLotusCMSError('message', 403, 'AUTH_FORBIDDEN');
}
```

## 3. Validation with Zod
API inputs are always validated:

```typescript
const validated = CreatePostSchema.parse(input);
```

## 4. Error Handling
Use BlackLotusCMSError with standardized codes:

```typescript
throw new BlackLotusCMSError('Post not found', 404, 'RESOURCE_NOT_FOUND');
```

## 5. Caching
Two caching patterns are used in the project:

### 5.1 unstable_cache (Next.js Data Cache)
Use unstable_cache with tags for query revalidation:

```typescript
return unstable_cache(async () => { /* query */ }, ['key'], { tags: ['tag'], revalidate: 3600 })();
```

### 5.2 In-Memory Cache with TTL
Used for theme permissions (ThemeDataService). Avoids database queries on every `validate()` call:

```typescript
const PERMISSION_CACHE_TTL = 10_000; // 10 seconds

interface CacheEntry {
  status: string;
  expiresAt: number;
}

private permissionCache = new Map<string, CacheEntry>();

// Usage: ThemeDataService.validate('db.read.post')
// 1. Check cache -> if hit and approved, return true
// 2. If miss, query database, store in cache with TTL
// 3. Cache is cleared when permission is approved/denied/deleted
```

### 5.3 Dual-Store Context (React.cache + AsyncLocalStorage)
The theme context uses two stores for resilience against context loss in async boundaries:

```typescript
// theme-context.ts — getThemeStore() prioritizes React.cache
export function getThemeStore(): ThemeStore {
  const reactStore = getReactStore();        // React.cache (primary)
  if (reactStore.themeName) return reactStore;
  const nodeStore = themeStorage.getStore();  // AsyncLocalStorage (fallback)
  if (nodeStore) return nodeStore;
  return reactStore;
}
```

Rules:
- `page.tsx`: after `themeStorage.run()`, set `getReactStore().themeName = themeName`
- `ThemeRenderer`: after setting the store, synchronize `getReactStore()` with themeName and currentPost
- Never rely solely on AsyncLocalStorage in RSC context — `unstable_cache` may lose the context

## 6. Hooks
Services dispatch hooks after operations:

```typescript
await HookService.doAction('post.created', post);
```

## 7. Security
- Sanitize paths: `sanitizePath()`
- Mask data: `maskSensitiveData()`
- Sanitize HTML: `sanitizeHTML()` or `sanitizeHtml()` with domain validation for iframes
- Validate inputs: Zod schemas
- NEXTAUTH_SECRET mandatory — app fails if not configured
- ADMIN_PASSWORD validated — rejects 'admin123' in production
- API Key re-validated in route handler — injected headers are never directly trusted
- CSP nonce enabled via `CSP_NONCE_ENABLED=true` in production
- SecretsService has no `save()` method — secrets managed only via env vars

## 8. File Organization
- `src/lib/` — Shared utilities, config, auth
- `src/core/services/` — Business logic
- `src/core/sandbox/` — Plugin isolation (isolated-vm + compiled)
- `src/schemas/` — Zod schemas
- `src/types/` — TypeScript DTOs
- `src/app/` — Routes
- `src/components/` — React components
- `plugins/` — Compiled plugins (TypeScript)
- `themes/` — Theme source code
- `specs/` — SDD documentation
- `docs/` — Developer documentation
- `tasks/` — Task management

## 9. Compiled Plugins Pattern
Compiled plugins follow the pattern:
```typescript
// plugins/my-plugin/index.ts
export default async function init(bridge: any) {
  bridge.hooks.addAction('post.created', async (post) => {
    // Plugin logic
  });
  return { name: 'my-plugin', version: '1.0.0' };
}
```

## 10. Route Registration Pattern
Dynamic plugin routes:
```typescript
bridge.routes.register({
  path: '/product/:slug',
  template: 'post.product',
  handler: async (ctx) => {
    // ctx.params = { slug: "..." }
    // ctx.userId = current user (if authenticated)
    // ctx.role = { name, capabilities } (if authenticated)
    return { product };
  }
});
```

## 11. Webhook Pattern
Inbound webhooks for plugins:
```typescript
bridge.webhook.on('payment.completed', async (payload) => {
  // payload = { eventId, data, signature, timestamp, source }
  return { success: true };
});
```
