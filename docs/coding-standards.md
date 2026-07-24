---
spec_version: "1.4"
last_updated: "2026-07-23"
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
Dois padrões de cache são utilizados no projeto:

### 5.1 unstable_cache (Next.js Data Cache)
Usar unstable_cache com tags para revalidation de queries:

```typescript
return unstable_cache(async () => { /* query */ }, ['key'], { tags: ['tag'], revalidate: 3600 })();
```

### 5.2 Cache em memória com TTL
Usado para permissões de themes (ThemeDataService). Evita queries ao banco a cada chamada de `validate()`:

```typescript
const PERMISSION_CACHE_TTL = 10_000; // 10 seconds

interface CacheEntry {
  status: string;
  expiresAt: number;
}

private permissionCache = new Map<string, CacheEntry>();

// Uso: ThemeDataService.validate('db.read.post')
// 1. Verifica cache -> se hit e approved, retorna true
// 2. Se miss, busca no banco, armazena no cache com TTL
// 3. Cache é limpo quando permission é aprovada/denegada/deletada
```

### 5.3 Dual-Store Context (React.cache + AsyncLocalStorage)
O contexto do tema usa duas stores para resiliência contra perda de contexto em async boundaries:

```typescript
// theme-context.ts — getThemeStore() prioriza React.cache
export function getThemeStore(): ThemeStore {
  const reactStore = getReactStore();        // React.cache (primário)
  if (reactStore.themeName) return reactStore;
  const nodeStore = themeStorage.getStore();  // AsyncLocalStorage (fallback)
  if (nodeStore) return nodeStore;
  return reactStore;
}
```

Regras:
- `page.tsx`: apos `themeStorage.run()`, setar `getReactStore().themeName = themeName`
- `ThemeRenderer`: apos setar o store, sincronizar `getReactStore()` com themeName e currentPost
- Nunca confiar apenas no AsyncLocalStorage em contexto RSC — `unstable_cache` pode perder o contexto

## 6. Hooks
Services disparam hooks apos operacoes:

```typescript
await HookService.doAction('post.created', post);
```

## 7. Security
- Sanitizar paths: `sanitizePath()`
- Mascarar dados: `maskSensitiveData()`
- Sanitizar HTML: `sanitizeHTML()` ou `sanitizeHtml()` com validacao de dominio para iframes
- Validar inputs: Zod schemas
- NEXTAUTH_SECRET obrigatorio — app falha se nao configurado
- ADMIN_PASSWORD validado — rejeita 'admin123' em producao
- API Key re-validada no route handler — headers injetados nunca sao confiaveis diretamente
- CSP nonce habilitado via `CSP_NONCE_ENABLED=true` em producao
- SecretsService sem metodo `save()` — secrets gerenciados apenas via env vars

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
Plugins compilados seguem o padrão:
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
Rotas dinâmicas de plugins:
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
Webhooks inbound para plugins:
```typescript
bridge.webhook.on('payment.completed', async (payload) => {
  // payload = { eventId, data, signature, timestamp, source }
  return { success: true };
});
```
