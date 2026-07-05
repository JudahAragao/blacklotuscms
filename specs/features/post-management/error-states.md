---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "post-management"
---

# Post Management Error States

## ERR-01: Post Nao Encontrado
- **Condição:** ID ou slug nao existe no banco
- **Código HTTP:** 404
- **Mensagem ao usuário:** "Post not found"
- **Ação do sistema:** Retorna RESOURCE_NOT_FOUND
- **DADOS DE TESTE:** `{ "trigger": "id_inexistente", "expected_code": 404, "expected_message": "Post not found" }`

## ERR-02: Slug Duplicado
- **Condição:** Tentativa de criar/atualizar com slug que ja existe
- **Código HTTP:** 409 ou 400
- **Mensagem ao usuário:** "Slug already in use"
- **Ação do sistema:** Prisma unique constraint violation capturada
- **DADOS DE TESTE:** `{ "trigger": "slug_duplicado", "expected_code": 409 }`

## ERR-03: PostType Nao Encontrado
- **Condição:** postTypeId fornecido nao corresponde a nenhum PostType
- **Código HTTP:** 404
- **Mensagem ao usuário:** "Post Type não encontrado"
- **Ação do sistema:** Verificacao antes da criacao
- **DADOS DE TESTE:** `{ "trigger": "postTypeId_invalido", "expected_code": 404 }`

## ERR-04: Sem Permissao
- **Condição:** Usuario sem capability necessaria
- **Código HTTP:** 403
- **Mensagem ao usuário:** "No permission to create/update/delete posts"
- **Ação do sistema:** canPerformAction retorna false
- **DADOS DE TESTE:** `{ "trigger": "user_sem_permissao", "expected_code": 403 }`

## ERR-05: Validacao Zod
- **Condição:** Dados de entrada invalidos
- **Código HTTP:** 400
- **Mensagem ao usuário:** Detalhes dos campos invalidos
- **Ação do sistema:** ZodError flattened
- **DADOS DE TESTE:** `{ "trigger": "titulo_vazio", "expected_code": 400 }`
