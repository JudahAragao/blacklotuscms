---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
---

# Security - BlackLotusCMS

## 1. Authentication

- **JWT via NextAuth v4:** Strategy JWT com PrismaAdapter
- **CredentialsProvider:** Autenticação por email + bcrypt password hash
- **Session Data:** Token contém user.id e user.role (com capabilities)
- **Custom Pages:** Login em /auth/login

## 2. Authorization (RBAC)

- **Capability System:** Cada role tem um JSON de capabilities (ex: `{ "post": { "create": true } }`)
- **Administrador:** Bypass automático - todas as capabilities retornam true
- **Nested Capabilities:** Suporte a caminhos pontilhados (ex: "post.own.edit")
- **withApiAuth:** Middleware consolidado que verifica NextAuth session ou API Key headers
- **hasCapability:** Função que suporta verificação .own para recursos pessoais

## 3. API Key Security

- **Geração:** Prefixo `bl_` + 32 bytes aleatórios
- **Armazenamento:** SHA-256 hash no banco (plain text mostrado apenas uma vez)
- **Rate Limiting:** Cache in-memory com janela de 1 minuto, limite configurável por chave
- **Proxy Validation:** API keys são validadas no proxy antes de chegar às rotas

## 4. Input Validation

- **Zod Schemas:** Todos os inputs de API validados via Zod (src/schemas/)
- **Path Sanitization:** `sanitizePath()` remove `..`, `/`, `\` para prevenir path traversal
- **HTML Sanitization:** DOMPurify com allowlist de tags para conteúdo de usuários
- **Slug Validation:** Regex `^[a-z0-9-]+$` para slugs

## 5. Data Protection

- **Sensitive Data Masking:** `maskSensitiveData()` remove passwordHash, secret, token, etc.
- **Theme Data Isolation:** Temas recebem apenas dados sanitizados
- **Email Masking:** GraphQL esconde email para usuários sem capability "user.manage"
- **Plugin Data Sanitization:** Bridge API sanitiza dados antes de retornar ao plugin

## 6. Infrastructure Security

- **Security Headers:** HSTS, X-Frame-Options (SAMEORIGIN), X-Content-Type-Options (nosniff), Referrer-Policy
- **Docker:** Container roda como user nextjs (non-root), multi-stage build
- **Standalone Output:** Next.js standalone minimiza superfície de ataque
- **SSL:** Suporte a sslmode=verify-full para PostgreSQL

## 7. Plugin Security

- **isolated-vm:** Plugins executam em VM isolada com limite de memória e timeout
- **Permission Gate:** Acesso a dados e hooks requer permissão aprovada
- **Rate Limit DB:** Limite de 50 queries/segundo por plugin
- **Jitter:** Delay aleatório entre requisições de plugins
- **Forbidden Fields:** passwordHash, secret, apiKey, token sempre removidos

## 8. Theme Security

- **Permission Validation:** ThemeDataService valida permissão antes de cada acesso
- **CSS Scoping:** Temas operam dentro de div.blacklotuscms-theme
- **AsyncLocalStorage:** Contexto do tema é isolado por request
- **Content Sanitization:** Queries de busca são sanitizadas antes de passar ao tema
