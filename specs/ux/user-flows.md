---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
---

# User Flows - BlackLotusCMS

## 1. Primeira Instalacao
Docker up -> /install -> Form -> Database Setup -> Admin Created -> /auth/login
- Feature vinculada: installation
- Flow documentado em: specs/features/installation/flows.md

## 2. Criacao de Conteudo
Login -> Admin -> Posts -> New -> Editor -> Save -> Published
- Feature vinculada: post-management
- Flow documentado em: specs/features/post-management/flows.md

## 3. Upload de Media
Login -> Admin -> Media -> Upload -> WebP Convert -> Library
- Feature vinculada: media-management
- Flow documentado em: specs/features/media-management/flows.md

## 4. Instalacao de Plugin
Login -> Admin -> Plugins -> Upload ZIP -> Activate -> Sandbox Execute
- Feature vinculada: plugin-system
- Flow documentado em: specs/features/plugin-system/flows.md

## 5. Visitante Acessa Site
/ -> Theme Layout -> Posts List -> Post Single -> Comments
- Feature vinculada: theme-engine
- Flow documentado em: specs/features/theme-engine/flows.md

## 6. Busca Publica
/search?q=query -> SearchService -> Results -> Theme Layout
- Feature vinculada: search
- Flow documentado em: specs/features/search/flows.md
