---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "comments"
---

# Comments Acceptance Tests

## AT-01: Comentario Valido
- **DADO** dados validos (postId, author, email, content)
- **QUANDO** envia POST /api/v1/public/comments
- **ENTAO** comentario criado com status pending ou approved
- **Referencia:** FR14

## AT-02: Spam Detectado
- **DADO** comentario com 3 URLs
- **QUANDO** processado pelo anti-spam
- **ENTAO** status = "spam"
- **Referencia:** FR15

## AT-03: Captcha Obrigatorio
- **DADO** captcha_enabled = true
- **QUANDO** envia sem captchaToken
- **ENTAO** erro 400 retornado
- **Referencia:** FR14
