---
spec_version: "1.5"
last_updated: "2026-07-15"
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
- **REQ-03:** Fields customizeds (MetaFields) via FieldGroups independentes com location rules (post types, taxonomias, posts específicos, templates, status), incluindo tipos organizadores Tab e Section, com deduplicação automática de anchors
- **REQ-03a:** Campos e subcampos são unificados - campos-raiz podem se tornar subcampos de repeater/flexible_content via drag and drop, e subcampos podem se tornar campos-raiz
- **REQ-03b:** Toda configuração de campo (tipo, validação, lógica condicional, opções) é preservada ao mover entre níveis
- **REQ-03c:** Campo file/image/gallery possui validacao de tipos aceitos via validation.accept
- **REQ-04:** Taxonomys hierarquicas e flat
- **REQ-05:** SEO metadata (title, description, ogImage, noIndex)
- **REQ-06:** Status de publicacao (draft, published, private)
- **REQ-07:** Data de publicacao e expiracao
- **REQ-08:** Cache com revalidation tags
- **REQ-09:** Hooks para extensibilidade (post.created, post.updated, post.deleted)
- **REQ-10:** Campo de Ícone com suporte a lib lucide-react (1000+ ícones) e SVG customizado com sanitização

## User Roles
- **Administrador:** Pode criar, editar, deletar e publicar qualquer post
- **Editor:** Pode criar, editar, deletar e publicar posts
- **Autor:** Pode criar, editar e publicar seus proprios posts
- **Contributor:** Pode criar posts (sempre como draft)
- **Assinante:** Apenas leitura

## Constraints
- **C01:** Slug deve ser unico e seguir regex ^[a-z0-9-]+$
- **C02:** SEO title max 70 caracteres, description max 160
- **C03:** Status draft e forçado para Contributores
- **C04:** Posts so aparecem em queries publicas quando published e publishedAt <= now

## Dependencies
- **Depends on:** Authentication, RBAC
- **Blocks:** Theme rendering, Busca, Sitemap
- **Related to:** Media, Comments, Menus
