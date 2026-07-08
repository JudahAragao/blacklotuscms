---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "installation"
---

# Instalacao Specification

## Description
Sistema de installation web-based com wizard de configuration, criacao de schema no banco, roles default e usuario administrador.

## Requirements
- **REQ-01:** Web-based wizard em /install
- **REQ-02:** Configuration de banco (host/port/name/user/password ou connection string)
- **REQ-03:** Configuration de storage (local/s3/r2)
- **REQ-04:** Geracao automatica de NEXTAUTH_SECRET
- **REQ-05:** Aplicacao de schema via prisma db push
- **REQ-06:** Criacao de roles default (Administrador, Editor, Autor, Contributor, Assinante)
- **REQ-07:** Criacao de PostTypes default (post, page)
- **REQ-08:** Criacao de usuario administrador
- **REQ-09:** Flag .installed para bloquear re-installation
- **REQ-10:** Instalacao gate no proxy (redireciona para /install)

## Constraints
- **C01:** Instalacao e one-time (bloqueada apos conclusao)
- **C02:** Schema aplicado com --accept-data-loss
- **C03:** Prisma proxy permite lazy initialization

## Dependencies
- **Depends on:** NONE (primeira feature executada)
- **Blocks:** Todas as outras features (ate installation completa)
- **Related to:** Secrets, Database
