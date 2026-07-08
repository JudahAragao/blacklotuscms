---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "plugin-system"
---

# Plugin System Acceptance Tests

## AT-01: Install Plugin Valid
- **GIVEN** ZIP com plugin.json valido e index.js
- **WHEN** admin faz upload
- **THEN** plugin e registrado no banco
- **Referencia:** FR10

## AT-02: Plugin com Manifest Invalid
- **GIVEN** ZIP sem plugin.json
- **WHEN** admin tenta install
- **THEN** ZIP e removido e erro 400 retornado
- **Referencia:** FR10

## AT-03: Ativar Plugin
- **GIVEN** plugin instalado e desativado
- **WHEN** admin ativa
- **THEN** sandbox e executado e isActive = true
- **Referencia:** FR10

## AT-04: Plugin Exceeding Timeout
- **GIVEN** plugin com loop infinito
- **WHEN** executado no sandbox
- **THEN** erro 408 retornado apos SANDBOX_TIMEOUT
- **Referencia:** FR10, BR05

## AT-05: Plugin Accessing Dados Sem Permission
- **GIVEN** plugin sem PluginPermission aprovada
- **WHEN** chama bridge.db.read('User', {})
- **THEN** erro 403 retornado
- **Referencia:** FR10, BR06
