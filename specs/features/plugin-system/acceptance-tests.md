---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "plugin-system"
---

# Plugin System Acceptance Tests

## AT-01: Instalar Plugin Valido
- **DADO** ZIP com plugin.json valido e index.js
- **QUANDO** admin faz upload
- **ENTAO** plugin e registrado no banco
- **Referencia:** FR10

## AT-02: Plugin com Manifest Invalido
- **DADO** ZIP sem plugin.json
- **QUANDO** admin tenta instalar
- **ENTAO** ZIP e removido e erro 400 retornado
- **Referencia:** FR10

## AT-03: Ativar Plugin
- **DADO** plugin instalado e desativado
- **QUANDO** admin ativa
- **ENTAO** sandbox e executado e isActive = true
- **Referencia:** FR10

## AT-04: Plugin Excedendo Timeout
- **DADO** plugin com loop infinito
- **QUANDO** executado no sandbox
- **ENTAO** erro 408 retornado apos SANDBOX_TIMEOUT
- **Referencia:** FR10, BR05

## AT-05: Plugin Acessando Dados Sem Permissao
- **DADO** plugin sem PluginPermission aprovada
- **QUANDO** chama bridge.db.read('User', {})
- **ENTAO** erro 403 retornado
- **Referencia:** FR10, BR06
