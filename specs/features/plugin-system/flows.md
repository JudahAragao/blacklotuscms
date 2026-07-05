---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "plugin-system"
---

# Plugin System Flows

## Instalacao de Plugin

1. **Admin faz upload de ZIP**
   - Estado: Arquivo recebido

2. **RBAC check** (plugin.manage)

3. **Extracao do ZIP para /plugins/[nome]**
   - Estado: Arquivos extraidos

4. **Leitura do plugin.json (manifest)**
   - Estado: Manifest valido

5. **Upsert no banco (Plugin table)**
   - Estado: Plugin registrado

## Ativacao de Plugin

1. **Admin clica ativar**
   - Estado: Solicitacao recebida

2. **RBAC check** (plugin.manage)

3. **Leitura do entry file (index.js)**
   - Estado: Codigo carregado

4. **Criacao/uso do PluginSandbox**
   - Estado: Sandbox pronto

5. **Execucao via sandbox.execute(code, bridgeApi)**
   - Estado: Plugin executado

6. **Atualizacao isActive = true**
   - Estado: Plugin ativo

## Acesso a Dados pelo Plugin

1. **Plugin chama bridge.db.read(model, query)**
   - Estado: Chamada recebida

2. **checkPermission('read', model)**
   - Verifica PluginPermission no banco
   - Estado: Permissao verificada

3. **Rate limit check** (50 req/s)
   - Estado: Dentro do limite

4. **Sanitizacao dos dados** (remove forbidden fields)
   - Estado: Dados seguros retornados

## Boot na Inicializacao

1. **PluginService.boot() busca plugins ativos**
   - Estado: Lista de plugins

2. **Para cada plugin: ler entry, criar sandbox, executar**
   - Estado: Plugins carregados
