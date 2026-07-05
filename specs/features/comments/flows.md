---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "comments"
---

# Comments Flows

## Criar Comentario

1. **Visitante preenche formulario**
   - postId, author, email, content, parentId?
   - Estado: Dados recebidos

2. **Validacao Zod** (CreateCommentSchema)
   - Estado: Dados validados

3. **Verificacao de captcha** (se habilitado)
   - Estado: Captcha validado

4. **Anti-spam check**
   - Blacklist de palavras
   - Contagem de links (>2 = spam)
   - Estado: Classificado

5. **Determinacao de status**
   - Se spam: status = "spam"
   - Se auto_approve: status = "approved"
   - Senao: status = "pending"
   - Estado: Status definido

6. **Criacao no banco**
   - Estado: Comentario criado

## Moderar Comentario

1. **Admin visualiza comentarios pendentes**
   - Estado: Lista exibida

2. **Admin aprova/denega/exclui**
   - Estado: Acao tomada
