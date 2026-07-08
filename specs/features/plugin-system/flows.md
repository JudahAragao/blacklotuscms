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

## Boot na Inicializacao

1. **PluginService.boot() busca plugins ativos**
   - State: Plugin list

2. **Para cada plugin: ler entry, criar sandbox, executar**
   - State: Plugins loaded
