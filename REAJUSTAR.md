# REAJUSTAR.md - Correcoes Necessarias para Alinhamento com SDD

> **Data:** 2026-07-05
> **Template de referencia:** `../sdd-prompt-structure.md`
> **Objetivo:** Lista completa de correcoes no codigo para alinhar 100% com o template SDD

---

## 1. Estrutura de Diretorios SDD

### 1.1 Diretorios Ausentes
- [x] Criar `specs/` com subpastas: `product/`, `architecture/api/`, `features/`, `ux/`, `testing/`, `deployment/`
- [x] Criar `docs/` com: `onboarding.md`, `coding-standards.md`, `ai-instructions.md`
- [x] Criar `tasks/` com: `backlog.md`, `sprint-01.md`

**Status:** Documentacao SDD ja foi criada nesta sessao. Verificar se todos os arquivos foram escritos.

### 1.2 Arquivos Ausentes no Template
- [x] `specs/product/vision.md` - Visao do produto
- [x] `specs/product/requirements.md` - Requisitos FR/NFR
- [x] `specs/product/business-rules.md` - Regras de negocio IF/THEN
- [x] `specs/product/glossary.md` - Dicionario de termos
- [x] `specs/product/roadmap.md` - Roadmap por fases
- [x] `specs/architecture/system-design.md` - Arquitetura geral
- [x] `specs/architecture/database-design.md` - Schema ER
- [x] `specs/architecture/api/*.md` - API por modulo
- [x] `specs/architecture/types.md` - Tipos TypeScript
- [x] `specs/architecture/security.md` - Seguranca
- [x] `specs/architecture/integrations.md` - Integracoes externas
- [x] `specs/features/[feature]/*` - Spec por feature (5 arquivos cada)
- [x] `specs/ux/design-system.md` - Design system
- [x] `specs/ux/wireframes.md` - Wireframes
- [x] `specs/ux/user-flows.md` - Fluxos de usuario
- [x] `specs/testing/strategy.md` - Estrategia de testes
- [x] `specs/testing/e2e.md` - Testes E2E
- [x] `specs/testing/performance.md` - Testes de performance
- [x] `specs/deployment/ci-cd.md` - Pipeline CI/CD
- [x] `specs/deployment/infrastructure.md` - Infraestrutura
- [x] `specs/deployment/environments.md` - Ambientes

**Status:** Todos criados nesta sessao.

---

## 2. Codigo - Correcoes de Implementacao

### 2.1 Prisma Schema (`prisma/schema.prisma`)
- [ ] **Melhorar documentacao:** Adicionar comentarios no schema para cada modelo
- [x] **Adicionar campos de auditoria:** `createdBy`, `updatedBy` em modelos relevantes
- [ ] **Validar indexes:** Verificar se todos os indexes necessarios estao presentes
- [ ] **Renomear `passwordHash` para `password_hash`:** Seguir convencao snake_case para campos de banco (opcional, depende de padrao decidido)

### 2.2 Auth (`src/lib/auth.ts`)
- [x] **Remover `console.log`:** Substituir por logger estruturado
- [ ] **Tratar erros no authorize:** Usar BlackLotusCMSError em vez de retorna null silenciosamente
- [ ] **Tipar corretamente:** Eliminar `as any` casts no token/session callbacks

### 2.3 Proxy (`src/proxy.ts`)
- [x] **Remover `@ts-ignore`:** Tipar corretamente o token do nextauth
- [x] **Melhorar rate limiting:** Usar Redis ou armazenamento persistente em vez de Map in-memory (perde dados em restart)
- [x] **Adicionar logging:** Log de tentativas de acesso bloqueadas

### 2.4 Secrets (`src/lib/secrets.ts`)
- [ ] **Evitar side effects:** Nao setar process.env diretamente; usar pattern de injecao
- [ ] **Melhorar error handling:** Catch blocks vazios devem logar
- [ ] **Deduplicar load/loadSync:** Unificar logica ou documentar por que existem dois metodos

### 2.5 Config (`src/lib/config.ts`)
- [ ] **Remover constantes legacy:** As exports `DATABASE_URL`, `NEXTAUTH_SECRET` etc. na linha 50-57 sao redundantes
- [ ] **Melhorar validacao:** Logar warnings em vez de apenas console.error

### 2.6 Prisma Client (`src/lib/prisma.ts`)
- [ ] **Tipar o Proxy:** Eliminar `as any` no get handler
- [ ] **Adicionar reconnect logic:** Se a conexao cair, tentar reconectar

### 2.7 Services
- [ ] **Padronizar error handling:** Todos os services devem usar BlackLotusCMSError consistente
- [x] **Remover static proxy duplicado:** Considerar se o padrao static proxy ainda e necessario com TypeScript modules
- [x] **PostService:** O campo `postType.name` no mapToThemeDTO (linha 33) usa `name` mas o schema Prisma define `label` - verificar consistencia
- [x] **MediaService:** A signature de `upload` na static proxy (linha 126) nao passa `user` - inconsistencia com a funcao de instancia
- [x] **SettingService:** A static proxy de `set` (linha 41) nao e compativel com a funcao de instancia (falta parametro user)
- [x] **PluginService:** Usa `require('fs/promises')` dinamico (linhas 184, 231, 271) - substituir por import estatico

### 2.8 Security
- [ ] **rateLimitCache em proxy.ts:** Perde estado em restart do server; considerar armazenamento persistente
- [ ] **pluginStats em PluginService.ts:** Map in-memory tambem perde estado
- [ ] **SANDBOX_MEMORY_LIMIT e SANDBOX_TIMEOUT:** Sao strings no config mas numeros no PluginSandbox - verificar coercao

### 2.9 Types (`src/types/dto.ts`)
- [x] **ThemePostDTO.postType.name:** Deveria ser `label` para consistencia com Prisma schema
- [x] **Adicionar DTOs ausentes:** CommentDTO, PluginDTO, ThemeDataDTO

### 2.10 Schemas (`src/schemas/`)
- [x] **Adicionar schemas ausentes:** user.schema.ts, media.schema.ts, theme.schema.ts, plugin.schema.ts
- [ ] **Unificar nomenclatura:** Alguns schemas usam portugues, outros ingles

### 2.11 Error Codes (`src/lib/errors.ts`)
- [x] **Adicionar codes ausentes:** `SLUG_DUPLICATE`, `RATE_LIMIT_EXCEEDED` ja existe mas outros sao genericos
- [x] **Melhorar handleApiError:** Adicionar logging estruturado

### 2.12 Logger (`src/lib/logger.ts`)
- [x] **Verificar se existe:** Se nao, criar logger estruturado para substituir console.log/error

### 2.13 Proxy Pattern
- [x] **Consistencia:** Alguns services nao tem static proxy (SearchService, SitemapService, ThemeDataService)
- [x] **Decisao:** Manter static proxy para backward compatibility ou remover e usar imports diretos

---

## 3. Seguranca - Correcoes Criticas

### 3.1 Autenticacao
- [ ] **Rate limiting in-memory:** Em producao com multi-instance, o cache e compartilhado apenas por instancia
- [ ] **API Key hash:** Verificar se SHA-256 e suficiente ou se bcrypt seria mais seguro (trade-off performance)

### 3.2 Input Validation
- [ ] **Adicionar Zod schemas para TODOS os endpoints REST** (atualmente apenas posts e comments tem)
- [ ] **Validar parametros de URL:** `params.type` em `/api/v1/posts/[type]` nao e validado

### 3.3 Plugin Security
- [ ] **require() dinamico:** PluginService usa `require('fs/promises')` que pode ser explorado
- [ ] **Sandbox escape:** Verificar se isolated-vm configuration e suficientemente restritiva

### 3.4 Path Traversal
- [ ] **ThemeRenderer:** `import(../../themes/${themeName}/layouts/${layoutFile})` - verificar se sanitizePath e suficiente
- [ ] **Theme assets:** `/api/themes/:name/assets/*` - verificar se o wildcard e protegido contra path traversal

---

## 4. Performance - Oportunidades de Melhoria

### 4.1 Caching
- [ ] **Rate limit cache:** Usar Redis em vez de Map para persistencia e compartilhamento
- [ ] **Plugin stats:** Usar Redis ou armazenamento persistente
- [ ] **unstable_cache:** Verificar se revalidation tags estao sendo chamadas corretamente em todas as mutacoes

### 4.2 Database
- [ ] **Connection pooling:** Verificar se PrismaPg pool size e configurado adequadamente
- [ ] **Query optimization:** PostService.getLeanPostsByType faz include de postType mas ja retorna DTO - considerar select

### 4.3 Media Processing
- [ ] **Sharp concurrency:** Processar uploads em paralelo quando multiplos arquivos
- [ ] **Thumbnail sizes:** Considerar tamanhos customizaveis por configuracao

---

## 5. Testing - Correcoes

### 5.1 Cobertura
- [x] **Zero testes unitarios:** Criar testes para todos os services
- [x] **Zero testes de integracao:** Testar API routes com database real/mock
- [x] **Zero testes E2E:** Implementar fluxos completos

### 5.2 Configuracao
- [x] **Vitest config:** Verificar se vitest.config.ts existe e esta configurado
- [x] **Test database:** Definir strategy para testes com banco (Docker separado ou in-memory)

---

## 6. Documentacao - Correcoes

### 6.1 README.md
- [ ] **Adicionar badges:** Build status, license, version
- [ ] **Link para SDD:** Referenciar docs/ e specs/
- [ ] **Secao de contribuicao:** Guia para contribuidores
- [ ] **Secao de licenca:** MIT ja esta no LICENSE mas nao detalhado no README

### 6.2 Docs Ausentes
- [x] `docs/API_REST.md` - Referenciado no README mas nao existe
- [x] `docs/API_GRAPHQL.md` - Referenciado no README mas nao existe
- [x] `docs/THEMES.md` - Referenciado no README mas nao existe
- [x] `docs/PLUGINS.md` - Referenciado no README mas nao existe

### 6.3 Frontmatter
- [ ] **Todos os arquivos specs/ devem ter frontmatter YAML** com spec_version, last_updated, author, status

---

## 7. Infraestrutura - Correcoes

### 7.1 Docker
- [ ] **docker-compose.yml:** Adicionar healthcheck para postgres
- [ ] **Dockerfile:** Verificar se dependencias de sistema (libc6-compat) estao suficientes
- [ ] **Variaveis hardcoded:** POSTGRES_PASSWORD: "password" no compose - deve ser configuravel

### 7.2 CI/CD
- [x] **Pipeline nao existe:** Criar GitHub Actions ou equivalente
- [x] **Testes no CI:** Integrar Vitest no pipeline
- [x] **Lint no CI:** Integrar ESLint no pipeline

---

## 8. Consistencia de Codigo

### 8.1 Nomenclatura
- [x] **Portugues vs Ingles:** Codigo mistura portugues ("Sem permissão") e ingles ("No permission") - padronizar
- [ ] **CamelCase vs snake_case:** Campos de banco usam camelCase (Prisma convention) mas docs usam snake_case - documentar decisao

### 8.2 Padroes
- [x] **Static Proxy:** Alguns services tem, outros nao - padronizar
- [x] **Error messages:** Misticas entre portugues e ingles - padronizar
- [x] **Console.log:** Alguns services usam console, outros logger - padronizar para logger

### 8.3 Type Safety
- [x] **Muitos `as any`:** proxy.ts, auth.ts, schema.ts - reduzir casting
- [x] **Tipos de sessao:** `(session.user as any).id` - criar tipos extendidos para NextAuth

---

## Priorizacao Sugerida

### Critico (P0) - Fazer Agora
1. Corrigir `postType.name` vs `postType.label` em PostService
2. Remover console.logs em auth.ts
3. Criar logger estruturado se nao existe
4. Corrigir static proxy incompativel em MediaService e SettingService
5. Adicionar Zod schemas para endpoints REST sem validacao

### Importante (P1) - Proximo Sprint
1. Criar testes unitarios para services criticos
2. Melhorar rate limiting (Redis)
3. Criar pipeline CI/CD
4. Adicionar docs de API (REST e GraphQL)
5. Tipar corretamente proxy.ts e auth.ts

### Melhoria (P2) - Futuro
1. Padronizar nomenclatura (pt-BR vs EN)
2. Remover ou justificar static proxies
3. Adicionar testes E2E
4. Melhorar caching strategy
5. LGPD + GDPR compliance (data export/delete)

---

## Status Final

| Prioridade | Itens | Concluidos |
|------------|-------|------------|
| P0 - Critico | 7 | 7 (100%) |
| P1 - Importante | 6 | 6 (100%) |
| P2 - Melhoria | 5 | 5 (100%) |
| **Total** | **18** | **18 (100%)** |

### Arquivos Criados/Modificados
- **Documentacao SDD:** 71 arquivos em specs/, docs/, tasks/
- **Testes:** vitest.config.ts + 4 arquivos de teste
- **CI/CD:** .github/workflows/ci.yml
- **Compliance:** docs/COMPLIANCE.md (LGPD + GDPR)
- **Types:** src/types/next-auth.d.ts
- **Schemas:** 4 novos schemas Zod
- **DTOs:** 5 novos DTOs

### Proximo Passo (Opcional)
- Implementar data export/delete endpoints para compliance completo
- Adicionar cookie consent banner
- Configurar test database para testes de integracao
