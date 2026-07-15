---
spec_version: "1.3"
last_updated: "2026-07-15"
author: "BlackLotusCMS Team"
status: approved
feature: "media-management"
---

# Media Management Specification

## Description
Sistema de gerenciamento de midia com upload de imagens (WebP + thumbnails) e arquivos genericos, storage multi-driver e biblioteca paginada.

## Requirements
- **REQ-01:** Upload de imagens com conversao automatica para WebP
- **REQ-01a:** Upload de arquivos genericos (PDF, DOCX, XLSX, etc.) sem processamento de imagem
- **REQ-02:** Geracao de thumbnails 300x300 via Sharp (apenas para imagens)
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
- **C02:** Thumbnails sao gerados em 300x300 com fit: cover (apenas imagens)
- **C03:** Filename e sanitizado via sanitizeFilename
- **C04:** Metadata (width, height, format) armazenada no banco para imagens
- **C05:** Arquivos nao-imagem sao salvos com mimeType original e sem thumbnail
- **C06:** MediaPicker accept attribute e dinamico baseado no field config validation.accept

## Dependencies
- **Depends on:** Storage Driver, Authentication
- **Blocks:** Post editor (media picker), Theme images/files
- **Related to:** Posts, Themes, Custom Fields
