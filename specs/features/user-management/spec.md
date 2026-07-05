---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "user-management"
---

# User Management Specification

## Description
CRUD de usuarios com gerenciamento de roles, capabilities e protecao de auto-exclusao.

## Requirements
- **REQ-01:** Criar usuarios com role assign
- **REQ-02:** Editar usuarios (admin ou self)
- **REQ-03:** Excluir usuarios (admin, nao pode excluir a si mesmo)
- **REQ-04:** Gerenciar capabilities dos roles
- **REQ-05:** Hook user.before_update para plugins

## Constraints
- **C01:** Apenas user.manage pode criar/editar outros
- **C02:** Self-edit permitido sem user.manage
- **C03:** Auto-delete bloqueado

## Dependencies
- **Depende de:** Authentication
- **Bloqueia:** NENHUMA
- **Relacionado com:** Authentication, API Keys
