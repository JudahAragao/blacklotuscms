---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
---

# Business Rules - BlackLotusCMS

## BR01: Post Visibility
- **SE** um post tem status "draft" OU publishedAt no futuro
- **ENTÃO** ele não aparece em queries públicas nem no sitemap
- **SENÃO** se expiresAt é definido e menor que now(), o post também fica oculto
- **Referência:** FR05, FR17

## BR02: Contributor Draft Lock
- **SE** o usuário tem role "Colaborador"
- **ENTÃO** todo post criado recebe status "draft" independente do input
- **SENÃO** o status respeitado é o fornecido
- **Referência:** FR05, FR22

## BR03: Admin Full Access
- **SE** o usuário tem role "Administrador"
- **ENTÃO** todas as verificações de capability retornam true
- **SENÃO** a verificação segue a hierarquia JSON de capabilities
- **Referência:** FR02

## BR04: Own Resource Protection
- **SE** um usuário tenta editar/deletar um post de outro autor
- **ENTÃO** ele precisa da capability "post.manage"
- **SENÃO** com "post.own.update", pode editar seus próprios posts
- **Referência:** FR05, FR22

## BR05: Plugin Sandboxing
- **SE** um plugin é ativado
- **ENTÃO** seu código roda em isolate-vm com limite de memória e timeout
- **SENÃO** se exceder os limites, o plugin é desativado e erro logado
- **Referência:** FR10

## BR06: Plugin Permission Gate
- **SE** um plugin tenta acessar dados ou hooks sensíveis
- **ENTÃO** o sistema verifica permissão aprovada para aquela capability
- **SENÃO** permissão é solicitada e acesso bloqueado até aprovação
- **Referência:** FR10, FR12

## BR07: Theme Permission Validation
- **SE** um tema tenta acessar dados do sistema
- **ENTÃO** o ThemeDataService valida permissão aprovada
- **SENÃO** permissão é solicitada e acesso bloqueado
- **Referência:** FR11

## BR08: API Key Rate Limiting
- **SE** uma requisição via API Key excede o rate limit configurado
- **ENTÃO** retorna 429 com código RATE_LIMIT_EXCEEDED
- **SENÃO** o contador de requisições é incrementado na janela de 1 minuto
- **Referência:** FR03, FR24

## BR09: Comment Anti-Spam
- **SE** um comentário contém mais de 2 URLs ou palavras da blacklist
- **ENTÃO** o status é definido como "spam" automaticamente
- **SENÃO** se auto_approve_comments está ativo, o status é "approved"
- **Referência:** FR14, FR15

## BR10: Installation Gate
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
- **SE** dados são passados para temas ou APIs públicas
- **ENTÃO** campos sensíveis (passwordHash, secret, token, etc.) são removidos
- **SENÃO** os dados são preservados como estão
- **Referência:** FR25
