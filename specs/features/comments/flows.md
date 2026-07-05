---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "withments"
---

# Comments Flows

## Criar Comment

1. **Visitante preenche formulario**
   - postId, author, email, content, parentId?
   - State: Data received

2. **Validcao Zod** (CreateCommentSchema)
   - State: Validated data

3. **Verificacao de captcha** (se habilitado)
   - State: Captcha validado

4. **Anti-spam check**
   - Blacklist de palavras
   - Contagem de links (>2 = spam)
   - State: Classified

5. **Determinacao de status**
   - Se spam: status = "spam"
   - Se auto_approve: status = "approved"
   - Otherwise: status = "pending"
   - State: Status defined

6. **Creation no banco**
   - State: Comment created

## Moderar Comment

1. **Admin visualiza withentarios pendentes**
   - State: List displayed

2. **Admin aprova/denega/exclui**
   - State: Action taken
