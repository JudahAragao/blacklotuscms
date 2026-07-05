---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "media-management"
---

# Media Management Error States

## ERR-01: File Nao Enviado
- **Condition:** FormData nao conhas campo "file"
- **Código HTTP:** 400
- **Mensagem:** "File não enviado"

## ERR-02: Erro de Processamento
- **Condition:** Sharp falha ao processar a imagem
- **Código HTTP:** 500
- **Mensagem:** "Error processing media file: [detail]"
- **Ação do system:** BlackLotusCMSError with INTERNAL_SERVER_ERROR

## ERR-03: Media Nao Encontrada
- **Condition:** ID de media nao existe
- **Código HTTP:** 404
- **Mensagem:** "Media not found"

## ERR-04: Falha no Storage
- **Condition:** S3/R2 ou filesyshas indisponivel
- **Código HTTP:** 500
- **Mensagem:** Erro de upload
- **Ação do system:** Erro logado, upload falha
