---
spec_version: "1.0"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "network-webhooks"
---

# Network & Webhooks — Flows

## Flow 1: HTTP Outbound (Plugin → External API)

```
Plugin calls bridge.http.request(config)
  ↓
CompiledPluginLoader checks http.outbound.request permission
  ↓ (auto-request if missing)
NetworkService.makeRequest(pluginId, config)
  ↓
PluginNetworkConfig loaded (allowedDomains, httpRateLimit)
  ↓
checkHttpRateLimit() → 429 if exceeded
  ↓
validateUrl() → SSRF block + domain whitelist check
  ↓ (DOMAIN_BLOCKED → auto-request http.domain.{hostname})
fetch() with timeout (10s default, 30s max)
  ↓
Check response size (1MB max)
  ↓
Parse body (JSON or text)
  ↓
logAudit("http.outbound") → NetworkAuditLog
  ↓
Return { status, headers, body }
```

## Flow 2: Webhook Inbound (External → Plugin)

```
POST /api/v1/webhooks/:pluginName/:eventId
  ↓
Plugin lookup (must exist and be active)
  ↓
Verify HMAC-SHA256 signature (if webhookSecret configured)
  ↓ (401 if invalid)
Check payload size (2MB max)
  ↓ (413 if too large)
logAudit("webhook.inbound") → NetworkAuditLog
  ↓
Find registered handlers (webhookHandlers Map)
  ↓ (no handlers → return { received: false })
Enqueue webhook for async processing
  ↓
processQueue() → handler.callback(payload)
  ↓ (failure → retry 1s, 2s, 4s, max 3)
Return { received: true, message }
```

## Flow 3: Domain Whitelist Auto-Request

```
Plugin calls bridge.http.request({ url: "https://unknown.com/api" })
  ↓
validateUrl() → DOMAIN_BLOCKED
  ↓
CompiledPluginLoader catches DOMAIN_BLOCKED error
  ↓
Auto-request permission: http.domain.unknown.com
  ↓
Admin approves in Plugins > Permissions panel
  ↓
Next call to unknown.com succeeds
```
