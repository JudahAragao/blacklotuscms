---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "comments"
---

# Comments Error States

## ERR-01: Validacao Zod
- **Condition:** Dados invalidos
- **Código HTTP:** 400
- **Mensagem:** Detalhes dos fields

## ERR-02: Captcha Obrigatorio
- **Condition:** captcha_enabled e captchaToken ausente
- **Código HTTP:** 400
- **Mensagem:** "Required captcha not sent."

## ERR-03: Sem Permission para Excluir
- **Condition:** User sem comment.manage
- **Código HTTP:** 403
- **Mensagem:** "Sem permissão para excluir comentários"
