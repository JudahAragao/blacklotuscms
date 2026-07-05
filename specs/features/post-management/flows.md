---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "post-management"
---

# Post Management Flows

## Criar Post

1. **Usuario preenche formulario**
   - Entrada: title, slug, content, status, metaFields, terms
   - Estado: Formulario valido

2. **Sistema valida com Zod**
   - Valida: CreatePostSchema
   - Estado: Dados validados

3. **Hook post.before_validate**
   - Transforma: Dados podem ser modificados por plugins
   - Estado: Dados transformados

4. **RBAC check**
   - Verifica: canPerformAction(user, 'post.create')
   - Estado: Autorizado

5. **Contributor draft lock**
   - Se role = Colaborador, status = 'draft'
   - Estado: Status ajustado

6. **Transaction: criar post + metaValues + terms**
   - Estado: Post criado no banco

7. **Hook post.created + revalidateTag('posts')**
   - Estado: Cache invalidado, plugins notificados

8. **Retorna post criado (201)**

## Editar Post

1. **Sistema busca post existente**
   - Estado: Post encontrado

2. **RBAC check com own verification**
   - Verifica: canPerformAction(user, 'post.update', existingPost.authorId)
   - Estado: Autorizado

3. **Validacao Zod + MetaFields validation**
   - Estado: Dados validados

4. **Transaction: update post + upsert metaValues + replace terms**
   - Estado: Post atualizado

5. **Hook post.updated + revalidateTag**
   - Estado: Cache invalidado

## Deletar Post

1. **RBAC check com own verification**
   - Verifica: canPerformAction(user, 'post.delete', existingPost.authorId)

2. **Transaction: delete metaValues + postTerms + comments + post**
   - Estado: Post removido

3. **Hook post.deleted + revalidateTag**

## Listar Posts Publicos

1. **Tema chama PostService.getLeanPostsByType(slug)**
   - Estado: Query executada com filtro status=published, publishedAt <= now, expiresAt >= now ou null

2. **ThemeDataService.validate('db.read.post')**
   - Estado: Permissao validada

3. **Cache via unstable_cache com tag 'posts'**
   - Estado: Dados retornados do cache ou banco
