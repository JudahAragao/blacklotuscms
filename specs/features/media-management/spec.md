---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "media-management"
---

# Media Management Specification

## Description
Sistema de gerenciamento de midia com upload automatico, processamento de imagem (WebP + thumbnails), storage multi-driver e biblioteca paginada.

## Requirements
- **REQ-01:** Upload de imagens com conversao automatica para WebP
- **REQ-02:** Geracao de thumbnails 300x300 via Sharp
- **REQ-03:** Storage drivers: local, S3, R2
- **REQ-04:** Biblioteca de midia com paginacao
- **REQ-05:** Exclusao de arquivo fisico e registro no banco (via server action admin, nao REST API)
- **REQ-06:** RBAC para upload (media.upload) e exclusao (media.manage)

## User Roles
- **Administrador/Editor:** Upload e exclusao completa
- **Autor:** Upload com permissao propria
- **Contributor:** Sem acesso a midia

## Constraints
- **C01:** Imagens sao convertidas para WebP automaticamente
- **C02:** Thumbnails sao gerados em 300x300 com fit: cover
- **C03:** Filename e sanitizado via sanitizeFilename
- **C04:** Metadata (width, height, format) armazenada no banco

## Dependencies
- **Depends on:** Storage Driver, Authentication
- **Blocks:** Post editor (media picker), Theme images
- **Related to:** Posts, Themes
