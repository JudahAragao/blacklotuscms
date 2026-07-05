---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "post-management"
---

# Post Management Acceptance Tests

## AT-01: Criar Post como Administrador
- **DADO** um usuario Administrador autenticado
- **QUANDO** envia POST /api/v1/posts/post com titulo, slug, content, status="published"
- **ENTAO** o post e criado com status "published" e publishedAt definido
- **DADOS DE TESTE:** `{ "title": "Meu Post", "slug": "meu-post", "content": "Conteudo", "status": "published" }`
- **Referencia:** FR05, BR04

## AT-02: Contributor Draft Lock
- **DADO** um usuario Colaborador autenticado
- **QUANDO** envia POST com status="published"
- **ENTAO** o post e criado com status "draft"
- **DADOS DE TESTE:** `{ "title": "Post Colaborador", "slug": "post-colab", "status": "published" }`
- **Referencia:** FR05, BR02

## AT-03: Slug Duplicado
- **DADO** um post com slug "meu-post" ja existe
- **QUANDO** tenta criar outro post com mesmo slug
- **ENTAO** retorna erro 409 ou erro de validacao
- **Referencia:** FR05

## AT-04: Post Nao Visivel Publicamente
- **DADO** um post com status "draft"
- **QUANDO** tema consulta PostService.getLeanPostsByType
- **ENTAO** o post nao e retornado
- **Referencia:** FR05, BR01

## AT-05: Post com Expiracao
- **DADO** um post com expiresAt no passado
- **QUANDO** tema consulta publicamente
- **ENTAO** o post nao e retornado
- **Referencia:** FR05, BR01

## AT-06: Editar Post de Outro Autor
- **DADO** um Autor tentando editar post de outro usuario
- **QUANDO** envia update sem capability "post.manage"
- **ENTAO** retorna erro 403
- **Referencia:** FR05, BR04

## AT-07: MetaFields Validation
- **DADO** um post com FieldGroup configurado
- **QUANDO** envia metaFields com campo obrigatorio vazio
- **ENTAO** retorna erro 422
- **Referencia:** FR06

## AT-08: Cache Revalidation
- **DADO** posts listados com cache
- **QUANDO** um post e criado ou atualizado
- **ENTAO** revalidateTag('posts') e chamado e cache e invalidado
- **Referencia:** FR05, NFR01
