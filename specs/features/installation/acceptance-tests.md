---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "installation"
---

# Instalacao Acceptance Tests

## AT-01: Instalacao Completa
- **GIVEN** sistema nao instalado
- **WHEN** formulario preenchido com data validos
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
- **THEN** erro 500 com mensagem de falha de conexao
- **Referencia:** FR20

## AT-04: Re-installation Blocked
- **GIVEN** sistema ja instalado (.installed existe)
- **WHEN** acessa /install
- **THEN** redireciona para /auth/login
- **Referencia:** FR20, BR10
