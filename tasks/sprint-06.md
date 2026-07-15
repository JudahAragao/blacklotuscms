---
spec_version: "1.0"
last_updated: "2026-07-15"
author: "BlackLotusCMS Team"
status: approved
sprint: "06"
---

# Sprint 06: File Upload & Validation

## Goal
Suporte a upload de arquivos não-imagem (PDF, DOCX, XLSX) com validação de tipos aceitos, MediaPicker dinâmico e URLs completas para temas.

## Duration
2026-07-15 - 2026-07-22

## Tasks
- [x] **TASK-075:** Upload de arquivos não-imagem + validação de tipos aceitos | priority: P1 | est: 6h | feature: media-management

## Review Notes
- MediaService agora detecta se o arquivo é imagem (mimeType) e faz branch: sharp→WebP→thumbnail para imagens, upload direto para arquivos genéricos
- MediaPicker aceita prop `accept` dinâmica baseada em field.config.validation?.accept
- FieldGroupEditor e SubFieldEditor mostram input "Tipos aceitos" na aba Validação para campos file/image/gallery
- validateField() valida extensão do arquivo contra acceptance config
- flattenMetadata() + resolveMetaUrls() convertem URLs relativas para absolutas no public page route
- Default theme page.tsx renderiza links de download para campos file
- Specs, docs e tasks atualizados
