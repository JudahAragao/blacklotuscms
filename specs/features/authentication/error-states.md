---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "authentication"
---

# Authentication Error States

## ERR-01: Unauthorized
- **Condição:** Nenhuma autenticacao fornecida
- **Código HTTP:** 401
- **Mensagem:** "Unauthorized. Provide a valid API Key or log in."
- **Ação:** Bloqueia acesso

## ERR-02: Forbidden
- **Condição:** Usuario autenticado mas sem capability necessaria
- **Código HTTP:** 403
- **Mensagem:** "No permission to perform this action"
- **Ação:** Log de tentativa com userId

## ERR-03: Rate Limit Exceeded
- **Condição:** API Key excedeu rate limit
- **Código HTTP:** 429
- **Mensagem:** "Request limit exceeded (Rate Limit)"
- **Código:** RATE_LIMIT_EXCEEDED

## ERR-04: Internal Auth Error
- **Condição:** Erro interno durante autenticacao
- **Código HTTP:** 500
- **Mensagem:** "Internal authentication error"
- **Ação:** Log do erro
