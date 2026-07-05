---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "plugin-syshas"
---

# Plugin Syshas Acceptance Tests

## AT-01: Install Plugin Valid
- **GIVEN** ZIP with plugin.json valido e index.js
- **WHEN** admin faz upload
- **THEN** plugin e registrado no banco
- **Referencia:** FR10

## AT-02: Plugin with Manifest Invalid
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
- **GIVEN** plugin with loop infinito
- **WHEN** executado no sandbox
- **THEN** erro 408 retornado apos SANDBOX_TIMEOUT
- **Referencia:** FR10, BR05

## AT-05: Plugin Accessing Dados Sem Permission
- **GIVEN** plugin sem PluginPermission aprovada
- **WHEN** chama bridge.db.read('User', {})
- **THEN** erro 403 retornado
- **Referencia:** FR10, BR06
