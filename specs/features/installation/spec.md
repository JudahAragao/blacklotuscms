---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "installation"
---

# Installation Specification

## Description
Sistema de instalacao web-based com wizard de configuracao, criacao de schema no banco, roles padrao e usuario administrador.

## Requirements
- **REQ-01:** Web-based wizard em /install
- **REQ-02:** Configuracao de banco (host/port/name/user/password ou connection string)
- **REQ-03:** Configuracao de storage (local/s3/r2)
- **REQ-04:** Geracao automatica de NEXTAUTH_SECRET
- **REQ-05:** Aplicacao de schema via prisma db push
- **REQ-06:** Criacao de roles padrao (Administrador, Editor, Autor, Colaborador, Assinante)
- **REQ-07:** Criacao de PostTypes padrao (post, page)
- **REQ-08:** Criacao de usuario administrador
- **REQ-09:** Flag .installed para bloquear re-instalacao
- **REQ-10:** Installation gate no proxy (redireciona para /install)

## Constraints
- **C01:** Instalacao e one-time (bloqueada apos conclusao)
- **C02:** Schema aplicado com --accept-data-loss
- **C03:** Prisma proxy permite lazy initialization

## Dependencies
- **Depende de:** NENHUMA (primeira feature executada)
- **Bloqueia:** Todas as outras features (ate instalacao completa)
- **Relacionado com:** Secrets, Database
