---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "installation"
---

# Installation Specification

## Description
System de installation web-based with wizard de configuration, criacao de schema no banco, roles default e usuario administrador.

## Requirements
- **REQ-01:** Web-based wizard em /install
- **REQ-02:** Configuration de banco (host/port/name/user/password ou connection string)
- **REQ-03:** Configuration de storage (local/s3/r2)
- **REQ-04:** Geracao automatica de NEXTAUTH_SECRET
- **REQ-05:** Aplicacao de schema via prisma db push
- **REQ-06:** Creation de roles default (Administrador, Editor, Autor, Contributor, Assinante)
- **REQ-07:** Creation de PostTypes default (post, page)
- **REQ-08:** Creation de usuario administrador
- **REQ-09:** Flag .installed para bloquear re-installation
- **REQ-10:** Installation gate no proxy (redireciona para /install)

## Constraints
- **C01:** Installation e one-time (bloqueada apos conclusao)
- **C02:** Schema aplicado with --accept-data-loss
- **C03:** Prisma proxy permite lazy initialization

## Dependencies
- **Depends on:** NONE (primeira feature executada)
- **Blocks:** Todas as outras features (ate installation withpleta)
- **Related to:** Secrets, Database
