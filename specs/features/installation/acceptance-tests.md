---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "installation"
---

# Installation Acceptance Tests

## AT-01: Installation Completa
- **GIVEN** system nao instalado
- **WHEN** formulario preenchido with data validos
- **THEN** schema aplicado, roles criadas, admin criado, .installed criado
- **Referencia:** FR20

## AT-02: Form Invalid
- **GIVEN** fields obrigatorios vazios
- **WHEN** envia formulario
- **THEN** erros de validacao retornados
- **Referencia:** FR20

## AT-03: Database Connection Fail
- **GIVEN** credenciais de banco incorretas
- **WHEN** tenta conectar
- **THEN** erro 500 with mensagem de falha de conexao
- **Referencia:** FR20

## AT-04: Re-installation Blocked
- **GIVEN** system ja instalado (.installed existe)
- **WHEN** acessa /install
- **THEN** redireciona para /auth/login
- **Referencia:** FR20, BR10
