---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "plugin-system"
---

# Plugin System Flows

## Plugin Installation

1. **Admin uploads ZIP**
   - State: File received

2. **RBAC check** (plugin.manage)

3. **ZIP extraction to /plugins/[name]**
   - State: Files extracted

4. **Read plugin.json (manifest)**
   - State: Valid manifest

5. **Upsert in database (Plugin table)**
   - State: Plugin registered

## Plugin Activation

1. **Admin clicks activate**
   - State: Request received

2. **RBAC check** (plugin.manage)

3. **Read entry file (index.js)**
   - State: Code loaded

4. **Create/use PluginSandbox**
   - State: Sandbox ready

5. **Execute via sandbox.execute(code, bridgeApi)**
   - State: Plugin executed

6. **Update isActive = true**
   - State: Active plugin

## Plugin Data Access

1. **Plugin calls bridge.db.read(model, query)**
   - State: Call received

2. **checkRateLimit()**
   - Verifies if plugin exceeded 50 queries/s
   - If exceeded: throws 429 RATE_LIMIT_EXCEEDED (without reaching database)
   - State: Rate limit passed

3. **applyJitter()**
   - Random delay of 1-5ms to mitigate thundering herd
   - State: Jitter applied

4. **hasPermission(pluginName, 'system', capability)**
   - Verifies PluginPermission in database
   - State: Permission verified

5. **Database query**
   - Executes the data operation
   - State: Data returned

6. **sanitizeData()**
   - Removes forbidden fields (passwordHash, secret, token, apiKey)
   - State: Secure data returned

## HTTP Outbound (bridge.http.request)

1. **Plugin calls bridge.http.request(config)**
   - Config: { url, method, headers?, body?, timeout? }
   - State: Request received

2. **Check http.outbound.request permission**
   - If not present: requestPermission() + throws error
   - State: Permission checked

3. **Fetch PluginNetworkConfig**
   - Checks allowedDomains and httpRateLimit
   - If not configured: throws error 403
   - State: Config loaded

4. **checkHttpRateLimit(pluginId)**
   - Verifies if exceeded httpRateLimit (default 20/s)
   - If exceeded: throws 429 RATE_LIMIT_EXCEEDED
   - State: Rate limit passed

5. **validateUrl(url, allowedDomains)**
   - Blocks internal IPs (SSRF protection)
   - Verifies domain in whitelist
   - If not allowed: throws error 403
   - State: URL validated

6. **fetch(url, options)**
   - Configurable timeout (default 10s, max 30s)
   - Maximum response 1MB
   - State: Response received

7. **Audit log**
   - Records in NetworkAuditLog (type: http.outbound)
   - State: Logged

## Webhook Inbound (bridge.webhook.on)

### Handler Registration

1. **Plugin calls bridge.webhook.on(eventId, callback)**
   - State: Handler registration requested

2. **Check webhook.inbound.register permission**
   - If not present: requestPermission() + throws error
   - State: Permission checked

3. **Register handler in NetworkService**
   - Stores callback in Map<eventId, handlers[]>
   - State: Handler registered

4. **Create WebhookEndpoint in database**
   - Generated URL: /api/v1/webhooks/:pluginName/:eventId
   - State: Endpoint created

### Webhook Reception

1. **External POST /api/v1/webhooks/:pluginName/:eventId**
   - Body: JSON payload
   - Header: X-Webhook-Signature (optional)
   - State: Request received

2. **WebhookService validates signature** (if webhookSecret configured)
   - HMAC-SHA256 with plugin secret
   - If invalid: throws error 401
   - State: Signature verified

3. **Verify payload size**
   - Max 512KB
   - If exceeded: throws error 413
   - State: Payload validated

4. **Queue message**
   - Adds to queue with retry (max 3 attempts)
   - Exponential backoff: 1s, 2s, 4s
   - State: Queued

5. **Plugin processes via registered handler**
   - Callback executed with payload
   - State: Processed

6. **Audit log**
   - Records in NetworkAuditLog (type: webhook.inbound)
   - State: Logged

## Boot on Startup

1. **PluginService.boot() fetches active plugins from database**
   - State: Plugin list from database

2. **For each plugin: verify manifest.sandbox**
   - `sandbox: true` (or absent) → loads via PluginSandbox (isolated-vm)
   - `sandbox: false` → loads via CompiledPluginLoader (direct Node.js)
   - State: Plugin loaded

3. **PluginService.boot() scans plugins/ directory**
   - For each folder with plugin.json + index.ts:
   - If not in database → auto-registers (isActive: true)
   - Verifies manifest.sandbox for loading method
   - State: Filesystem plugins registered

4. **PluginService.bootCompiledPlugins() loads compiled plugins**
   - Imports pluginRegistry from src/generated/plugin-registry.ts
   - Skips plugins with sandbox: true (already loaded by boot)
   - Verifies if active in database and permissions approved
   - Loads via CompiledPluginLoader.load()
   - State: Compiled plugins loaded