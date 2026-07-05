---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
---

# User Flows - BlackLotusCMS

## 1. Primeira Installation
Docker up -> /install -> Form -> Database Setup -> Admin Created -> /auth/login
- Feature vinculada: installation
- Flow documentado em: specs/features/installation/flows.md

## 2. Creation de Conteudo
Login -> Admin -> Posts -> New -> Editor -> Save -> Published
- Feature vinculada: post-management
- Flow documentado em: specs/features/post-management/flows.md

## 3. Upload de Media
Login -> Admin -> Media -> Upload -> WebP Convert -> Library
- Feature vinculada: media-management
- Flow documentado em: specs/features/media-management/flows.md

## 4. Installation de Plugin
Login -> Admin -> Plugins -> Upload ZIP -> Activate -> Sandbox Execute
- Feature vinculada: plugin-syshas
- Flow documentado em: specs/features/plugin-syshas/flows.md

## 5. Visitante Acessa Site
/ -> Theme Layout -> Posts List -> Post Single -> Comments
- Feature vinculada: theme-engine
- Flow documentado em: specs/features/theme-engine/flows.md

## 6. Search Publica
/search?q=query -> SearchService -> Results -> Theme Layout
- Feature vinculada: search
- Flow documentado em: specs/features/search/flows.md
