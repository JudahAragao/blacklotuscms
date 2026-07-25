---
spec_version: "1.0"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "network-webhooks"
---

# Network & Webhooks Specification

## Description
Network service for plugins: HTTP outbound with domain whitelist, inbound webhooks with HMAC-SHA256 verification, and audit log for all network calls.

## Requirements
- **REQ-01:** HTTP outbound via `bridge.http.request()` with configurable domain whitelist
- **REQ-02:** SSRF Protection: blocking of internal IPs (localhost, 10.*, 172.16-31.*, 192.168.*, 169.254.*, fc00:/fd00:)
- **REQ-03:** Separate HTTP rate limit: 20 req/s per plugin (configurable via `PluginNetworkConfig.httpRateLimit`)
- **REQ-04:** Configurable timeout: 10s default, max 30s
- **REQ-05:** Maximum response size: 1MB
- **REQ-06:** Inbound webhook via `bridge.webhook.on()` with HMAC-SHA256 verification
- **REQ-07:** Maximum webhook payload size: 2MB
- **REQ-08:** Automatic retry with exponential backoff: 1s → 2s → 4s (max 3 attempts)
- **REQ-09:** Audit log for all HTTP calls and webhooks (NetworkAuditLog)
- **REQ-10:** Auto-request domain permission when blocked by whitelist (`http.domain.{hostname}`)
- **REQ-11:** Per-plugin network configuration via `PluginNetworkConfig` (allowedDomains, httpRateLimit, webhookSecret, isActive)

## Data Model

### PluginNetworkConfig
- `pluginId`: UUID (FK -> Plugin, unique)
- `allowedDomains`: String[] — whitelist of domains allowed for HTTP outbound
- `httpRateLimit`: Int (default: 20) — req/s for external HTTP calls
- `webhookSecret`: String? — HMAC-SHA256 secret for inbound webhook verification
- `isActive`: Boolean (default: true)

### WebhookEndpoint
- `id`: UUID (PK)
- `pluginId`: UUID (FK -> Plugin)
- `eventId`: String — e.g. "payment.completed"
- `url`: String — generated: `/api/v1/webhooks/:pluginName/:eventId`
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
- **C01:** Only HTTP/HTTPS are allowed (blocking of other protocols)
- **C02:** Wildcard domains supported: `*.example.com` matches subdomains
- **C03:** User-Agent headers: `BlackLotusCMS-Plugin/1.0`
- **C04:** JSON responses are parsed automatically; plain text is returned as string

## Dependencies
- **Depends on:** Plugin System, PluginDataService
- **Blocks:** NONE
- **Related to:** Plugin System, Security
