---
spec_version: "1.3"
last_updated: "2026-07-15"
author: "BlackLotusCMS Team"
status: approved
feature: "media-management"
---

# Media Management Acceptance Tests

## AT-01: Upload de Imagem
- **GIVEN** usuario autenticado com permissao media.upload
- **WHEN** envia arquivo JPEG via POST /api/v1/media
- **THEN** arquivo e convertido para WebP, thumbnail gerado, registro criado com mimeType='image/webp'
- **Referencia:** REQ-01

## AT-02: Upload Sem Permission
- **GIVEN** usuario sem capability media.upload
- **WHEN** envia arquivo via POST /api/v1/media
- **THEN** retorna erro 403
- **Referencia:** REQ-06

## AT-03: Exclusao de Media
- **GIVEN** media existente no banco e storage
- **WHEN** exclusao e solicitada com permissao media.manage
- **THEN** arquivo fisico e registro sao removidos
- **Referencia:** REQ-05

## AT-04: Upload de Arquivo Generico (PDF)
- **GIVEN** usuario autenticado com permissao media.upload
- **WHEN** envia arquivo PDF via POST /api/v1/media
- **THEN** arquivo e salvo com mimeType original, thumbnail=null, registro criado
- **Referencia:** REQ-01a

## AT-05: Upload de Arquivo Generico (DOCX)
- **GIVEN** usuario autenticado com permissao media.upload
- **WHEN** envia arquivo DOCX via POST /api/v1/media
- **THEN** arquivo e salvo com mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document', thumbnail=null
- **Referencia:** REQ-01a

## AT-06: MediaPicker Accept Dinamico
- **GIVEN** campo customizado do tipo file com validation.accept='pdf, docx'
- **WHEN** usuario abre MediaPicker para selecionar arquivo
- **THEN** input file tem accept='.pdf,.docx'
- **Referencia:** REQ-06

## AT-07: MediaPicker Accept Todos
- **GIVEN** campo customizado do tipo file sem validation.accept
- **WHEN** usuario abre MediaPicker para selecionar arquivo
- **THEN** input file tem accept='*'
- **Referencia:** REQ-06

## AT-08: Validacao de Tipo de Arquivo
- **GIVEN** campo file com validation.accept='pdf, docx'
- **WHEN** usuario tenta salvar post com arquivo .xlsx
- **THEN** validacao retorna erro 'File type ".xlsx" is not allowed'
- **Referencia:** REQ-06
