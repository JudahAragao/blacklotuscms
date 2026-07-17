---
spec_version: "1.3"
last_updated: "2026-07-17"
author: "BlackLotusCMS Team"
status: approved
---

# Business Rules - BlackLotusCMS

## BR01: Post Visibility
- **SE** um post has status "draft" OU publishedAt no futuro
- **ENTÃO** ele não aparece em queries publics nem no sitemap
- **SENÃO** se expiresAt é definido e menor que now(), o post também fica oculto
- **Referência:** FR05, FR17

## BR02: Contributor Draft Lock
- **SE** o user has role "Contributor"
- **ENTÃO** todo post criado recebe status "draft" independente do input
- **SENÃO** o status respeitado é o fornecido
- **Referência:** FR05, FR22

## BR03: Admin Full Acesso
- **SE** o user has role "Administrador"
- **ENTÃO** todas as verificações de capability retornam true
- **SENÃO** a verificação segue a hierarquia JSON de capabilities
- **Referência:** FR02

## BR04: Own Resource Protection
- **SE** um user tenta editar/deletar um post de outro autor
- **ENTÃO** ele precisa da capability "post.manage"
- **SENÃO** com "post.own.update", pode editar seus próprios posts
- **Referência:** FR05, FR22

## BR05: Plugin Sandboxing
- **SE** um plugin é ativado
- **ENTÃO** seu código roda em isolate-vm com limite de memória e timeout
- **SENÃO** se exceder os limites, o plugin é desativado e erro logado
- **Referência:** FR10

## BR06: Plugin Permission Gate
- **SE** um plugin tenta acessar data ou hooks sensíveis
- **ENTÃO** o sistema verifica permissão aprovada para aquela capability
- **SENÃO** permissão é solicitada e acesso bloqueado até aprovação
- **Referência:** FR10, FR12

## BR07: Theme Permission Validation
- **SE** um theme tenta acessar data do sistema
- **ENTÃO** o ThemeDataService valida permissão aprovada
- **SENÃO** permissão é solicitada e acesso bloqueado
- **Referência:** FR11

## BR08: API Key Rate Limiting
- **SE** uma requisição via API Key excede o rate limit configurado
- **ENTÃO** retorna 429 com código RATE_LIMIT_EXCEEDED
- **SENÃO** o contador de requisições é incrementado na janela de 1 minuto
- **Referência:** FR03, FR24

## BR09: Comment Anti-Spam
- **SE** um comentário contains mais de 2 URLs ou palavras da blacklist
- **ENTÃO** o status é definido como "spam" automaticamente
- **SENÃO** se auto_approve_comments está ativo, o status é "approved"
- **Referência:** FR14, FR15

## BR10: Instalacao Gate
- **SE** o sistema não está instalado (sem .installed file)
- **ENTÃO** todas as rotas redirecionam para /install exceto /assets
- **SENÃO** a rota /install redireciona para /auth/login
- **Referência:** FR20

## BR11: HTML Sanitization
- **SE** um hook filter processa conteúdo (title, content, body, etc.)
- **ENTÃO** o resultado é sanitizado com DOMPurify automaticamente
- **SENÃO** o conteúdo é passado sem sanitização
- **Referência:** FR25

## BR12: Sensitive Data Masking
- **SE** data são passados para themes ou APIs publics
- **ENTÃO** fields sensíveis (passwordHash, secret, token, etc.) são removidos
- **SENÃO** os data são preservados como estão
- **Referência:** FR25

## BR13: Post Expiration
- **SE** um post tem `expiresAt` definido E `expiresAt < now()`
- **ENTÃO** ele não aparece em queries públicas, sitemap, nem busca
- **SENÃO** o post é visível normalmente (se status = "published" e publishedAt <= now())
- **Referência:** FR05, FR17
- **Implementação:** `PostService.ts` — queries filtram por `expiresAt: null OR expiresAt >= now()`

## BR14: LGPD Data Export (Art. 15, 20)
- **SE** um user solicita exportação de dados
- **ENTÃO** o sistema retorna: profile (email, role, image, dates), posts criados, metadados de API keys (nome, data de criação, último uso — nunca a chave em si)
- **SENÃO** apenas admins podem exportar dados de outros users
- **Referência:** FR22, COMPLIANCE.md
- **Implementação:** `UserService.exportData()` — via `GET /api/v1/users/:id`

## BR15: LGPD Account Deletion (Art. 17)
- **SE** um user solicita exclusão de conta
- **ENTÃO** cascade delete: postTerms → metaValues → comments → posts → apiKeys → user
- **SENÃO** não é possível excluir o último user com role "Administrador"
- **Referência:** FR22, COMPLIANCE.md
- **Implementação:** `UserService.deleteAccount()` — via `DELETE /api/v1/users/:id`

## BR16: API Key Security
- **SE** uma API key é criada
- **ENTÃO** apenas o hash SHA-256 é armazenado no banco, com prefixo `bl_` + 64 hex chars
- **SENÃO** a chave plain text é retornada UMA única vez na criação — nunca mais
- **Referência:** FR03, FR21
- **Implementação:** `ApiKeyService.ts` — `createKey()` retorna plain key, `validateKey()` compara hash

## BR17: Plugin DB Rate Limit
- **SE** um plugin excede 50 requisições de banco por segundo
- **ENTÃO** a requisição é bloqueada com erro RATE_LIMIT_EXCEEDED
- **SENÃO** cada acesso ao banco tem jitter aleatório de 1-5ms para evitar thundering herd
- **Referência:** FR10
- **Implementação:** `PluginService.ts` — Bridge API `db.read` e `db.create` são rate-limited

## BR18: Webhook Retry
- **SE** um webhook inbound falha no processamento
- **ENTÃO** o sistema retenta com exponential backoff: 1s → 2s → 4s (máximo 3 tentativas)
- **SENÃO** após 3 falhas, o webhook é registrado como falha no `NetworkAuditLog`
- **Referência:** FR10
- **Implementação:** `NetworkService.receiveWebhook()` — retry loop com backoff exponencial

## BR19: Theme Permission Cache
- **SE** um theme acessa dados do sistema via `ThemeDataService.get()`
- **ENTÃO** a validação de permissão usa cache com TTL de 10 segundos
- **SENÃO** cache é invalidado quando permissão muda de status (approved/denied)
- **Referência:** FR11
- **Implementação:** `ThemeDataService.ts` — `permissionCache` Map com 10s TTL

## BR20: Comment IP Capture
- **SE** um comentário é criado via API pública
- **ENTÃO** o endereço IP do autor é capturado e armazenado no campo `ip`
- **SENÃO** o IP é usado para identificação de spam (mesmo IP, múltiplos comentários)
- **Referência:** FR14
- **Implementação:** `CommentService.create()` — recebe `ip` param, armazena no DB
