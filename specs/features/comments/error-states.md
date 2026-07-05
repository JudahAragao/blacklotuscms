---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "withments"
---

# Comments Error States

## ERR-01: Validcao Zod
- **Condition:** Dados invalidos
- **Código HTTP:** 400
- **Mensagem:** Detalhes dos fields

## ERR-02: Captcha Obrigatorio
- **Condition:** captcha_enabled e captchaToken ausente
- **Código HTTP:** 400
- **Mensagem:** "Required captcha not sent."

## ERR-03: Sem Permission para Excluir
- **Condition:** User sem withment.manage
- **Código HTTP:** 403
- **Mensagem:** "Sem permissão para excluir withentários"
