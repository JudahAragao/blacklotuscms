---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "post-management"
---

# Post Management Acceptance Tests

## AT-01: Criar Post witho Administrador
- **GIVEN** an authenticated Administrator user
- **WHEN** envia POST /api/v1/posts/post with titulo, slug, content, status="published"
- **THEN** o post e criado with status "published" e publishedAt definido
- **TEST DATA:** `{ "title": "Meu Post", "slug": "meu-post", "content": "Conteudo", "status": "published" }`
- **Referencia:** FR05, BR04

## AT-02: Contributor Draft Lock
- **GIVEN** um usuario Contributor autenticado
- **WHEN** envia POST with status="published"
- **THEN** o post e criado with status "draft"
- **TEST DATA:** `{ "title": "Post Contributor", "slug": "post-colab", "status": "published" }`
- **Referencia:** FR05, BR02

## AT-03: Duplicate Slug
- **GIVEN** um post with slug "meu-post" ja existe
- **WHEN** tenta criar outro post with mesmo slug
- **THEN** retorna erro 409 ou erro de validacao
- **Referencia:** FR05

## AT-04: Post Nao Visivel Publicamente
- **GIVEN** um post with status "draft"
- **WHEN** theme consulta PostService.getLeanPostsByType
- **THEN** o post nao e retornado
- **Referencia:** FR05, BR01

## AT-05: Post with Expiracao
- **GIVEN** um post with expiresAt no passado
- **WHEN** theme consulta publicamente
- **THEN** o post nao e retornado
- **Referencia:** FR05, BR01

## AT-06: Editar Post de Outro Autor
- **GIVEN** um Autor tentando editar post de outro usuario
- **WHEN** envia update sem capability "post.manage"
- **THEN** retorna erro 403
- **Referencia:** FR05, BR04

## AT-07: MetaFields Validtion
- **GIVEN** um post with FieldGroup configurado
- **WHEN** envia metaFields with campo obrigatorio vazio
- **THEN** retorna erro 422
- **Referencia:** FR06

## AT-08: Cache Revalidation
- **GIVEN** posts listados with cache
- **WHEN** um post e criado ou atualizado
- **THEN** revalidateTag('posts') e chamado e cache e invalidado
- **Referencia:** FR05, NFR01
