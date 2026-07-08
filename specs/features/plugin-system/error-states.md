---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "plugin-system"
---

# Plugin System Error States

## ERR-01: Plugin Nao Found
- **Condition:** ID de plugin nao existe
- **Código HTTP:** 404
- **Mensagem:** "Plugin not found"

## ERR-02: Plugin ZIP Invalid
- **Condition:** ZIP corrompido ou sem plugin.json
- **Código HTTP:** 400
- **Mensagem:** "Invalid or corrupted plugin"
- **Ação:** Pasta do plugin removida

## ERR-03: Sandbox Timeout
- **Condition:** Codigo do plugin excedeu SANDBOX_TIMEOUT
- **Código HTTP:** 408
- **Mensagem:** "Plugin excedeu limites de recurso (Tempo/Memória)"
- **Código:** RATE_LIMIT_EXCEEDED

## ERR-04: Plugin Permission Denied
- **Condition:** Plugin sem permissao aprovada
- **Código HTTP:** 403
- **Mensagem:** "Acesso denied for '[capability]'"
- **Código:** AUTH_FORBIDDEN

## ERR-05: DB Rate Limit
- **Condition:** Plugin excedeu 50 queries/segundo
- **Código HTTP:** 429
- **Mensagem:** "Database rate limit exceeded by plugin"
- **Código:** RATE_LIMIT_EXCEEDED
