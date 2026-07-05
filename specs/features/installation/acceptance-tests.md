---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "installation"
---

# Installation Acceptance Tests

## AT-01: Instalacao Completa
- **DADO** sistema nao instalado
- **QUANDO** formulario preenchido com dados validos
- **ENTAO** schema aplicado, roles criadas, admin criado, .installed criado
- **Referencia:** FR20

## AT-02: Formulario Invalido
- **DADO** campos obrigatorios vazios
- **QUANDO** envia formulario
- **ENTAO** erros de validacao retornados
- **Referencia:** FR20

## AT-03: Database Connection Fail
- **DADO** credenciais de banco incorretas
- **QUANDO** tenta conectar
- **ENTAO** erro 500 com mensagem de falha de conexao
- **Referencia:** FR20

## AT-04: Re-installation Blocked
- **DADO** sistema ja instalado (.installed existe)
- **QUANDO** acessa /install
- **ENTAO** redireciona para /auth/login
- **Referencia:** FR20, BR10
