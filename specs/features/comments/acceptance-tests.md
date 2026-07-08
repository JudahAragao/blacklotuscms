---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "comments"
---

# Comments Acceptance Tests

## AT-01: Comment Valid
- **GIVEN** data validos (postId, author, email, content)
- **WHEN** envia POST /api/v1/public/comments
- **THEN** comentario criado com status pending ou approved
- **Referencia:** FR14

## AT-02: Spam Detected
- **GIVEN** comentario com 3 URLs
- **WHEN** processado pelo anti-spam
- **THEN** status = "spam"
- **Referencia:** FR15

## AT-03: Captcha Obrigatorio
- **GIVEN** captcha_enabled = true
- **WHEN** envia sem captchaToken
- **THEN** erro 400 retornado
- **Referencia:** FR14
