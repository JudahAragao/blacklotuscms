---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "post-management"
---

# Post Management Specification

## Description
Sistema completo de gerenciamento de conteudo com Custom Post Types, MetaFields, Taxonomies e SEO integrado.

## Requirements
- **REQ-01:** CRUD completo de posts com validacao Zod
- **REQ-02:** Suporte a Custom Post Types configuraveis
- **REQ-03:** Campos customizados (MetaFields) via FieldGroups
- **REQ-04:** Taxonomias hierarquicas e flat
- **REQ-05:** SEO metadata (title, description, ogImage, noIndex)
- **REQ-06:** Status de publicacao (draft, published, private)
- **REQ-07:** Data de publicacao e expiracao
- **REQ-08:** Cache com revalidation tags
- **REQ-09:** Hooks para extensibilidade (post.created, post.updated, post.deleted)

## User Roles
- **Administrador:** Pode criar, editar, deletar e publicar qualquer post
- **Editor:** Pode criar, editar, deletar e publicar posts
- **Autor:** Pode criar, editar e publicar seus proprios posts
- **Colaborador:** Pode criar posts (sempre como draft)
- **Assinante:** Apenas leitura

## Constraints
- **C01:** Slug deve ser unico e seguir regex ^[a-z0-9-]+$
- **C02:** SEO title max 70 caracteres, description max 160
- **C03:** Status draft e forçado para Colaboradores
- **C04:** Posts so aparecem em queries publicas quando published e publishedAt <= now

## Dependencies
- **Depende de:** Authentication, RBAC
- **Bloqueia:** Theme rendering, Search, Sitemap
- **Relacionado com:** Media, Comments, Menus
