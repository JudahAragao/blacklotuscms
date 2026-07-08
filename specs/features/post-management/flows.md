---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "post-management"
---

# Post Management Flows

## Criar Post

1. **User preenche formulario**
   - Entrada: title, slug, content, status, metaFields, terms
   - State: Valid form

2. **Sistema valida com Zod**
   - Valid: CreatePostSchema
   - State: Validated data

3. **Hook post.before_validate**
   - Transforma: Dados podem ser modificados por plugins
   - State: Transformed data

4. **RBAC check**
   - Verifica: canPerformAction(user, 'post.create')
   - State: Authorized

5. **Contributor draft lock**
   - Se role = Contributor, status = 'draft'
   - State: Status adjusted

6. **Transaction: criar post + metaValues + terms**
   - State: Post created in database

7. **Hook post.created + revalidateTag('posts')**
   - State: Cache invalidated, plugins notified

8. **Retorna post criado (201)**

## Editar Post

1. **Sistema busca post existente**
   - State: Post found

2. **RBAC check com own verification**
   - Verifica: canPerformAction(user, 'post.update', existingPost.authorId)
   - State: Authorized

3. **Validacao Zod + MetaFields validation**
   - State: Validated data

4. **Transaction: update post + upsert metaValues + replace terms**
   - State: Post updated

5. **Hook post.updated + revalidateTag**
   - State: Cache invalidated

## Deletar Post

1. **RBAC check com own verification**
   - Verifica: canPerformAction(user, 'post.delete', existingPost.authorId)

2. **Transaction: delete metaValues + postTerms + comments + post**
   - State: Post removed

3. **Hook post.deleted + revalidateTag**

## Listar Posts Publicos

1. **Theme chama PostService.getLeanPostsByType(slug)**
   - State: Query executada com filtro status=published, publishedAt <= now, expiresAt >= now ou null

2. **ThemeDataService.validate('db.read.post')**
   - State: Permission validated

3. **Cache via unstable_cache com tag 'posts'**
   - State: Data returned from cache or database
