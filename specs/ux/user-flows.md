---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
---

# User Flows - BlackLotusCMS

## 1. First Installation
Docker up -> /install -> Form -> Database Setup -> Admin Created -> /auth/login
- Linked feature: installation
- Flow documented in: specs/features/installation/flows.md

## 2. Content Creation
Login -> Admin -> Posts -> New -> Editor -> Save -> Published
- Linked feature: post-management
- Flow documented in: specs/features/post-management/flows.md

## 3. Media Upload
Login -> Admin -> Media -> Upload -> WebP Convert -> Library
- Linked feature: media-management
- Flow documented in: specs/features/media-management/flows.md

## 4. Plugin Installation
Login -> Admin -> Plugins -> Upload ZIP -> Activate -> Sandbox Execute
- Linked feature: plugin-system
- Flow documented in: specs/features/plugin-system/flows.md

## 5. Visitor Accesses Site
/ -> Theme Layout -> Posts List -> Post Single -> Comments
- Linked feature: theme-engine
- Flow documented in: specs/features/theme-engine/flows.md

## 6. Public Search
/search?q=query -> SearchService -> Results -> Theme Layout
- Linked feature: search
- Flow documented in: specs/features/search/flows.md
