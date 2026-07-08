---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "plugin-system"
---

# Plugin System Flows

## Instalacao de Plugin

1. **Admin faz upload de ZIP**
   - State: File received

2. **RBAC check** (plugin.manage)

3. **Extracao do ZIP para /plugins/[nome]**
   - State: Files extracted

4. **Leitura do plugin.json (manifest)**
   - State: Valid manifest

5. **Upsert no banco (Plugin table)**
   - State: Plugin registered

## Activation de Plugin

1. **Admin clica activate**
   - State: Request received

2. **RBAC check** (plugin.manage)

3. **Leitura do entry file (index.js)**
   - State: Code loaded

4. **Criacao/uso do PluginSandbox**
   - State: Sandbox ready

5. **Execucao via sandbox.execute(code, bridgeApi)**
   - State: Plugin executed

6. **Update isActive = true**
   - State: Active plugin

## Acesso a Dados pelo Plugin

1. **Plugin chama bridge.db.read(model, query)**
   - State: Call received

2. **checkRateLimit()**
   - Verifica se o plugin excedeu 50 queries/s
   - Se excedido: lança 429 RATE_LIMIT_EXCEEDED (sem chegar ao banco)
   - State: Rate limit passed

3. **applyJitter()**
   - Delay aleatório de 1-5ms para mitigar thundering herd
   - State: Jitter applied

4. **hasPermission(pluginName, 'system', capability)**
   - Verifica PluginPermission no banco
   - State: Permission verified

5. **Query ao banco**
   - Executa a operação de dados
   - State: Data returned

6. **sanitizeData()**
   - Remove campos proibidos (passwordHash, secret, token, apiKey)
   - State: Secure data returned

## HTTP Outbound (bridge.http.request)

1. **Plugin chama bridge.http.request(config)**
   - Config: { url, method, headers?, body?, timeout? }
   - State: Request received

2. **Verifica permissão http.outbound.request**
   - Se não tem: requestPermission() + lança erro
   - State: Permission checked

3. **Busca PluginNetworkConfig**
   - Verifica allowedDomains e httpRateLimit
   - Se não configurado: lança erro 403
   - State: Config loaded

4. **checkHttpRateLimit(pluginId)**
   - Verifica se excedeu httpRateLimit (default 20/s)
   - Se excedido: lança 429 RATE_LIMIT_EXCEEDED
   - State: Rate limit passed

5. **validateUrl(url, allowedDomains)**
   - Bloqueia IPs internos (SSRF protection)
   - Verifica domínio na whitelist
   - Se não permitido: lança erro 403
   - State: URL validated

6. **fetch(url, options)**
   - Timeout configurável (default 10s, max 30s)
   - Resposta max 1MB
   - State: Response received

7. **Audit log**
   - Registra em NetworkAuditLog (tipo: http.outbound)
   - State: Logged

## Webhook Inbound (bridge.webhook.on)

### Registro de Handler

1. **Plugin chama bridge.webhook.on(eventId, callback)**
   - State: Handler registration requested

2. **Verifica permissão webhook.inbound.register**
   - Se não tem: requestPermission() + lança erro
   - State: Permission checked

3. **Registra handler no NetworkService**
   - Armazena callback no Map<eventId, handlers[]>
   - State: Handler registered

4. **Cria WebhookEndpoint no banco**
   - URL gerada: /api/v1/webhooks/:pluginName/:eventId
   - State: Endpoint created

### Recebimento de Webhook

1. **Externo faz POST /api/v1/webhooks/:pluginName/:eventId**
   - Body: JSON payload
   - Header: X-Webhook-Signature (opcional)
   - State: Request received

2. **WebhookService valida assinatura** (se webhookSecret configurado)
   - HMAC-SHA256 com secret do plugin
   - Se inválido: lança erro 401
   - State: Signature verified

3. **Verifica tamanho do payload**
   - Max 512KB
   - Se excedido: lança erro 413
   - State: Payload validated

4. **Enfileira mensagem**
   - Adiciona na fila com retry (max 3 tentativas)
   - Exponential backoff: 1s, 2s, 4s
   - State: Queued

5. **Plugin processa via handler registrado**
   - Callback executada com payload
   - State: Processed

6. **Audit log**
   - Registra em NetworkAuditLog (tipo: webhook.inbound)
   - State: Logged

## Boot na Inicializacao

1. **PluginService.boot() busca plugins ativos**
   - State: Plugin list

2. **Para cada plugin: ler entry, criar sandbox, executar**
   - State: Plugins loaded
