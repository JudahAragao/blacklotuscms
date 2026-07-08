---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
---

# Coding Standards - BlackLotusCMS

## 1. Services Pattern (Stable Proxy)
Cada service segue o padrao "Stable Proxy":

```typescript
export class MyService {
  constructor(private readonly db = prisma, private readonly log = logger) {}
  
  async doSomething() { /* logica */ }
  
  // Static proxy para compatibilidade
  static async doSomething() { return myService.doSomething(); }
}

export const myService = new MyService();
```

## 2. RBAC em Services
Toda operacao que modifica dados verifica permissao:

```typescript
if (!canPerformAction(user, 'capability.name')) {
  throw new BlackLotusCMSError('message', 403, 'AUTH_FORBIDDEN');
}
```

## 3. Validation com Zod
Inputs de API sempre validados:

```typescript
const validated = CreatePostSchema.parse(input);
```

## 4. Error Handling
Usar BlackLotusCMSError com codigos padronizados:

```typescript
throw new BlackLotusCMSError('Post not found', 404, 'RESOURCE_NOT_FOUND');
```

## 5. Caching
Usar unstable_cache com tags para revalidation:

```typescript
return unstable_cache(async () => { /* query */ }, ['key'], { tags: ['tag'], revalidate: 3600 })();
```

## 6. Hooks
Services disparam hooks apos operacoes:

```typescript
await HookService.doAction('post.created', post);
```

## 7. Security
- Sanitizar paths: `sanitizePath()`
- Mascarar dados: `maskSensitiveData()`
- Sanitizar HTML: `sanitizeHTML()` ou `sanitizeHtml()`
- Validar inputs: Zod schemas

## 8. File Organization
- `src/lib/` — Shared utilities, config, auth
- `src/core/services/` — Business logic
- `src/core/sandbox/` — Plugin isolation
- `src/schemas/` — Zod schemas
- `src/types/` — TypeScript DTOs
- `src/app/` — Routes
- `src/components/` — React components
