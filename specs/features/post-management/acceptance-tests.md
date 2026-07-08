---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "post-management"
---

# Post Management Acceptance Tests

## AT-01: Criar Post como Administrador
- **GIVEN** an authenticated Administrator user
- **WHEN** envia POST /api/v1/posts/post com titulo, slug, content, status="published"
- **THEN** o post e criado com status "published" e publishedAt definido
- **TEST DATA:** `{ "title": "Meu Post", "slug": "meu-post", "content": "Conteudo", "status": "published" }`
- **Referencia:** FR05, BR04

## AT-02: Contributor Draft Lock
- **GIVEN** um usuario Contributor autenticado
- **WHEN** envia POST com status="published"
- **THEN** o post e criado com status "draft"
- **TEST DATA:** `{ "title": "Post Contributor", "slug": "post-colab", "status": "published" }`
- **Referencia:** FR05, BR02

## AT-03: Duplicate Slug
- **GIVEN** um post com slug "meu-post" ja existe
- **WHEN** tenta criar outro post com mesmo slug
- **THEN** retorna erro 409 ou erro de validacao
- **Referencia:** FR05

## AT-04: Post Nao Visivel Publicamente
- **GIVEN** um post com status "draft"
- **WHEN** theme consulta PostService.getLeanPostsByType
- **THEN** o post nao e retornado
- **Referencia:** FR05, BR01

## AT-05: Post com Expiracao
- **GIVEN** um post com expiresAt no passado
- **WHEN** theme consulta publicamente
- **THEN** o post nao e retornado
- **Referencia:** FR05, BR01

## AT-06: Editar Post de Outro Autor
- **GIVEN** um Autor tentando editar post de outro usuario
- **WHEN** envia update sem capability "post.manage"
- **THEN** retorna erro 403
- **Referencia:** FR05, BR04

## AT-07: MetaFields Validation
- **GIVEN** um post com FieldGroup configurado
- **WHEN** envia metaFields com campo obrigatorio vazio
- **THEN** retorna erro 422
- **Referencia:** FR06

## AT-08: Cache Revalidation
- **GIVEN** posts listados com cache
- **WHEN** um post e criado ou atualizado
- **THEN** revalidateTag('posts') e chamado e cache e invalidado
- **Referencia:** FR05, NFR01
