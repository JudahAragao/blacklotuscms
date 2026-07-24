---
spec_version: "1.0"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "network-webhooks"
---

# Network & Webhooks Specification

## Description
Serviço de rede para plugins: HTTP outbound com whitelist de domínios, webhooks inbound com verificação HMAC-SHA256, e audit log para todas as chamadas de rede.

## Requirements
- **REQ-01:** HTTP outbound via `bridge.http.request()` com whitelist de domínios configurável
- **REQ-02:** Proteção SSRF: bloqueio de IPs internos (localhost, 10.*, 172.16-31.*, 192.168.*, 169.254.*, fc00:/fd00:)
- **REQ-03:** Rate limit HTTP separado: 20 req/s por plugin (configurável via `PluginNetworkConfig.httpRateLimit`)
- **REQ-04:** Timeout configurável: 10s default, máximo 30s
- **REQ-05:** Tamanho máximo de resposta: 1MB
- **REQ-06:** Webhook inbound via `bridge.webhook.on()` com verificação HMAC-SHA256
- **REQ-07:** Tamanho máximo de payload webhook: 2MB
- **REQ-08:** Retry automático com exponential backoff: 1s → 2s → 4s (máximo 3 tentativas)
- **REQ-09:** Audit log para todas as chamadas HTTP e webhooks (NetworkAuditLog)
- **REQ-10:** Auto-request de permissão de domínio quando bloqueado pela whitelist (`http.domain.{hostname}`)
- **REQ-11:** Configuração de rede por plugin via `PluginNetworkConfig` (allowedDomains, httpRateLimit, webhookSecret, isActive)

## Data Model

### PluginNetworkConfig
- `pluginId`: UUID (FK -> Plugin, unique)
- `allowedDomains`: String[] — whitelist de domínios permitidos para HTTP outbound
- `httpRateLimit`: Int (default: 20) — req/s para chamadas HTTP externas
- `webhookSecret`: String? — HMAC-SHA256 secret para verificação de webhooks inbound
- `isActive`: Boolean (default: true)

### WebhookEndpoint
- `id`: UUID (PK)
- `pluginId`: UUID (FK -> Plugin)
- `eventId`: String — ex: "payment.completed"
- `url`: String — gerado: `/api/v1/webhooks/:pluginName/:eventId`
- `isActive`: Boolean (default: true)

### NetworkAuditLog
- `id`: UUID (PK)
- `pluginId`: UUID (FK -> Plugin)
- `pluginName`: String
- `type`: String — "http.outbound" | "webhook.inbound"
- `url`: String?
- `method`: String?
- `status`: Int?
- `error`: String?
- `timestamp`: DateTime

## Security Chain
```
Bridge API call → checkHttpRateLimit() → validateUrl(SSRF + whitelist) → fetch → logAudit()
```

For webhooks:
```
Webhook received → verifySignature(HMAC-SHA256) → checkPayloadSize → logAudit() → enqueue → processQueue (retry)
```

## Constraints
- **C01:** Apenas HTTP/HTTPS são permitidos (bloqueio de outros protocolos)
- **C02:** Domínios curinga suportados: `*.example.com` corresponde a subdomínios
- **C03:** Headers de User-Agent: `BlackLotusCMS-Plugin/1.0`
- **C04:** Respostas JSON são parseadas automaticamente; texto puro é retornado como string

## Dependencies
- **Depends on:** Plugin System, PluginDataService
- **Blocks:** NONE
- **Related to:** Plugin System, Security
