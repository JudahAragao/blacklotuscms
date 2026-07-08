---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "post-management"
---

# Post Management Error States

## ERR-01: Post Nao Found
- **Condition:** ID ou slug nao existe no banco
- **Código HTTP:** 404
- **Mensagem ao user:** "Post not found"
- **Ação do sistema:** Retorna RESOURCE_NOT_FOUND
- **TEST DATA:** `{ "trigger": "id_inexistente", "expected_code": 404, "expected_message": "Post not found" }`

## ERR-02: Duplicate Slug
- **Condition:** Tentativa de criar/atualizar com slug que ja existe
- **Código HTTP:** 409 ou 400
- **Mensagem ao user:** "Slug already in use"
- **Ação do sistema:** Prisma unique constraint violation capturada
- **TEST DATA:** `{ "trigger": "slug_duplicado", "expected_code": 409 }`

## ERR-03: PostType Nao Found
- **Condition:** postTypeId fornecido nao corresponde a nenhum PostType
- **Código HTTP:** 404
- **Mensagem ao user:** "Post Type não encontrado"
- **Ação do sistema:** Verificacao antes da criacao
- **TEST DATA:** `{ "trigger": "postTypeId_invalido", "expected_code": 404 }`

## ERR-04: Sem Permission
- **Condition:** User sem capability necessaria
- **Código HTTP:** 403
- **Mensagem ao user:** "No permission to create/update/delete posts"
- **Ação do sistema:** canPerformAction retorna false
- **TEST DATA:** `{ "trigger": "user_sem_permissao", "expected_code": 403 }`

## ERR-05: Validacao Zod
- **Condition:** Dados de entrada invalidos
- **Código HTTP:** 400
- **Mensagem ao user:** Detalhes dos fields invalidos
- **Ação do sistema:** ZodError flattened
- **TEST DATA:** `{ "trigger": "titulo_vazio", "expected_code": 400 }`
