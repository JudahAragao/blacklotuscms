---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "media-management"
---

# Media Management Specification

## Description
System de gerenciamento de midia with upload automatico, processamento de imagem (WebP + thumbnails), storage multi-driver e biblioteca paginada.

## Requirements
- **REQ-01:** Upload de imagens with conversao automatica para WebP
- **REQ-02:** Geracao de thumbnails 300x300 via Sharp
- **REQ-03:** Storage drivers: local, S3, R2
- **REQ-04:** Biblioteca de midia with paginacao
- **REQ-05:** Deletion de arquivo fisico e registro no banco
- **REQ-06:** RBAC para upload (media.upload) e exclusao (media.manage)

## User Roles
- **Administrador/Editor:** Upload e exclusao withpleta
- **Autor:** Upload with permissao propria
- **Contributor:** Sem acesso a midia

## Constraints
- **C01:** Imagens sao convertidas para WebP automaticamente
- **C02:** Thumbnails sao gerados em 300x300 with fit: cover
- **C03:** Filename e sanitizado via sanitizeFilename
- **C04:** Metadata (width, height, format) armazenada no banco

## Dependencies
- **Depends on:** Storage Driver, Authentication
- **Blocks:** Post editor (media picker), Theme images
- **Related to:** Posts, Themes
