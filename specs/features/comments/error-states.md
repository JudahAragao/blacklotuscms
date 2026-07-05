---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "comments"
---

# Comments Error States

## ERR-01: Validacao Zod
- **Condição:** Dados invalidos
- **Código HTTP:** 400
- **Mensagem:** Detalhes dos campos

## ERR-02: Captcha Obrigatorio
- **Condição:** captcha_enabled e captchaToken ausente
- **Código HTTP:** 400
- **Mensagem:** "Required captcha not sent."

## ERR-03: Sem Permissao para Excluir
- **Condição:** Usuario sem comment.manage
- **Código HTTP:** 403
- **Mensagem:** "Sem permissão para excluir comentários"
