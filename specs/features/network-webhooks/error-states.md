---
spec_version: "1.0"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "network-webhooks"
---

# Network & Webhooks — Error States

| Error | Code | HTTP | Trigger |
|-------|------|------|---------|
| Invalid URL format | VALIDATION_ERROR | 400 | URL malformada no http.request |
| Only HTTP/HTTPS protocols allowed | VALIDATION_ERROR | 400 | Protocolo diferente de http/https |
| Access to internal hosts forbidden | AUTH_FORBIDDEN | 403 | Acesso a localhost, 127.0.0.1, etc. |
| Access to private IP ranges forbidden | AUTH_FORBIDDEN | 403 | Acesso a 10.*, 192.168.*, etc. |
| Domain not in whitelist | DOMAIN_BLOCKED | 403 | Domínio não está em allowedDomains |
| HTTP rate limit exceeded | RATE_LIMIT_EXCEEDED | 429 | Plugin excede httpRateLimit req/s |
| HTTP request timed out | RATE_LIMIT_EXCEEDED | 408 | Request excede timeout (max 30s) |
| Response too large | VALIDATION_ERROR | 413 | Resposta > 1MB |
| Plugin not found or inactive | RESOURCE_NOT_FOUND | 404 | Webhook para plugin inexistente |
| Invalid webhook signature | AUTH_UNAUTHORIZED | 401 | Assinatura HMAC-SHA256 inválida |
| Webhook payload too large | VALIDATION_ERROR | 413 | Payload > 2MB |
| No handlers registered | — | 200 | Webhook recebido mas nenhum handler registrado |
