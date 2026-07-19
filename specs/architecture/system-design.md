---
spec_version: "1.4"
last_updated: "2026-07-19"
author: "BlackLotusCMS Team"
status: approved
---

# Sistema Design - BlackLotusCMS

## Architecture Overview

BlackLotusCMS é um CMS headless construído sobre Next.js 16 (App Router) com Prisma ORM e Pothos GraphQL. A arquitetura segue o padrão "Zero .env" onde toda configuração é carregada de `.secrets.json`. O sistema é fully containerized com Docker multi-stage build.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components, standalone output)
- **Database:** PostgreSQL 15 via Prisma ORM com PrismaPg adapter (connection pooling)
- **GraphQL:** Apollo Server 5 + Pothos (type-safe schema builder com Prisma plugin)
- **Auth:** NextAuth v4 (JWT strategy, CredentialsProvider, PrismaAdapter)
- **Validation:** Zod v4 (schemas em src/schemas/)
- **Styling:** Tailwind CSS v4 (compilado uma vez para todos os temas)
- **Rich Text:** TipTap (editor component)
- **Images:** Sharp (WebP conversion, thumbnails)
- **Storage:** Local filesystem ou AWS S3/Cloudflare R2
- **Sandbox:** isolated-vm (plugin execution)
- **Security:** DOMPurify (HTML sanitization), bcryptjs (password hashing)
- **Language:** TypeScript 6 (strict mode)

## Prisma Proxy Pattern

O Prisma client é implementado como um Proxy que permite lazy initialization. Isso é essencial porque o DATABASE_URL só está disponível após a instalação web-based.

1. `src/lib/prisma.ts` exporta um Proxy que intercepta todas as propriedades
2. Na primeira acesso, `createPrismaInstance()` é chamado com a URL do config
3. `resetPrismaInstance()` permite reinicialização após instalação
4. O pool de conexões é gerenciado pelo PrismaPg adapter

## Hook System (Actions + Filters)

Inspirado no WordPress, o HookService fornece pontos de extensibilidade:

1. **Actions** (`doAction`): Executam código em resposta a eventos (post.created, post.updated, etc.)
2. **Filters** (`applyFilters`): Transformam data em pipeline (post.before_validate, etc.)
3. **UI Components** (`registerComponent`): Registram componentes em slots (admin.header, public.sidebar, etc.)
4. **Audit Log**: Todas as chamadas de hook são registradas com source, type e timestamp
5. **Auto-sanitization**: Filtros que processam conteúdo (title, body, etc.) são automaticamente sanitizados com DOMPurify

## Theme Engine (Build-Time + Dual-Store Context)

O sistema de temas é 100% build-time. Não há upload, instalação ou edição em runtime.

### Geração Estática
1. Script `scripts/generate-theme-registry.mjs` descobre pastas em `themes/`
2. Para cada tema, lê `theme.json`, `theme.ts` e `style.css`
3. Valida manifesto, `themeApiVersion`, variáveis CSS declaradas vs. usadas
4. Namespace `@keyframes` com prefixo `bl-<id>-`
5. Gera `src/generated/theme-registry.ts` (imports estáticos dos layouts)
6. Gera `src/generated/theme-styles.css` (CSS isolado)

### Contexto Dual-Store (React.cache + AsyncLocalStorage)
O contexto do tema é mantido em duas stores para resiliência:
- **React.cache (primário):** Sobrevive a `unstable_cache` e outras async boundaries do RSC
- **AsyncLocalStorage (fallback):** Compatibilidade com testes e contextos non-RSC
- `getThemeStore()` prioriza React.cache quando `themeName` está setado
- `page.tsx` e `ThemeRenderer` sincronizam ambas stores apos `themeStorage.run()`

### Isolamento CSS
- **Camada 1 (fallback):** Selector replacement — `.blacklotuscms-theme` → `.blacklotuscms-theme[data-bl-theme="id"]`
- **Camada 2 (Chrome 118+):** `@scope ([data-bl-theme="id"])` para shadow-dom-like isolation
- CSS variables são aplicadas diretamente ao wrapper element (sem CSS nesting)

### Hooks Automáticos
- `predev` → `themes:generate` antes de `npm run dev`
- `prebuild` → `themes:generate` antes de `npm run build`
- `pretest` → `themes:generate` antes de `npm run test`

## Component Diagram

1. **Proxy Layer (src/proxy.ts):** Intercepta todas as requisições, valida instalação, autenticação, API keys e rate limiting
2. **App Router (src/app/):** Rotas organizadas em (admin), (public), api, auth, install
3. **Services (src/core/services/):** 20 serviços de negócio com RBAC integrado
4. **GraphQL (src/app/api/graphql/):** Apollo Server com Pothos schema
5. **REST API (src/app/api/v1/):** Endpoints REST com withApiAuth middleware
6. **Plugin Sandbox (src/core/sandbox/):** isolated-vm com Bridge API
7. **Theme Renderer (src/components/ThemeRenderer.tsx):** Import estático de layouts via registry gerado + CSS isolado

## Data Flow

1. **Request -> Proxy:** Todas as requisições passam pelo proxy que valida instalação e autenticação
2. **Proxy -> Route Handler:** Requisições autenticadas chegam às rotas
3. **Route -> Service:** Rotas delegam lógica de negócio aos serviços
4. **Service -> Prisma:** Serviços acessam o banco via Prisma proxy
5. **Service -> HookService:** Serviços disparam actions/filters para plugins
6. **Theme -> ThemeDataService:** Themes acessam data via permissão validada
7. **Plugin -> PluginSandbox:** Plugins executam código isolado com Bridge API
