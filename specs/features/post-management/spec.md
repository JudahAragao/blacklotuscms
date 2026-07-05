---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "post-management"
---

# Post Management Specification

## Description
System withpleto de gerenciamento de conteudo with Custom Post Types, MetaFields, Taxonomies e SEO integrado.

## Requirements
- **REQ-01:** CRUD withpleto de posts with validacao Zod
- **REQ-02:** Suporte a Custom Post Types configuraveis
- **REQ-03:** Fields customizeds (MetaFields) via FieldGroups
- **REQ-04:** Taxonomys hierarquicas e flat
- **REQ-05:** SEO metadata (title, description, ogImage, noIndex)
- **REQ-06:** Status de publicacao (draft, published, private)
- **REQ-07:** Data de publicacao e expiracao
- **REQ-08:** Cache with revalidation tags
- **REQ-09:** Hooks para extensibilidade (post.created, post.updated, post.deleted)

## User Roles
- **Administrador:** Pode criar, editar, deletar e publicar qualquer post
- **Editor:** Pode criar, editar, deletar e publicar posts
- **Autor:** Pode criar, editar e publicar seus proprios posts
- **Contributor:** Pode criar posts (sempre witho draft)
- **Assinante:** Apenas leitura

## Constraints
- **C01:** Slug deve ser unico e seguir regex ^[a-z0-9-]+$
- **C02:** SEO title max 70 caracteres, description max 160
- **C03:** Status draft e forçado para Contributores
- **C04:** Posts so aparecem em queries publicas quando published e publishedAt <= now

## Dependencies
- **Depends on:** Authentication, RBAC
- **Blocks:** Theme rendering, Search, Sithemep
- **Related to:** Media, Comments, Menus
