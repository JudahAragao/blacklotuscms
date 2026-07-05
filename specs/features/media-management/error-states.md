---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "media-management"
---

# Media Management Error States

## ERR-01: Arquivo Nao Enviado
- **Condição:** FormData nao contem campo "file"
- **Código HTTP:** 400
- **Mensagem:** "Arquivo não enviado"

## ERR-02: Erro de Processamento
- **Condição:** Sharp falha ao processar a imagem
- **Código HTTP:** 500
- **Mensagem:** "Error processing media file: [detail]"
- **Ação do sistema:** BlackLotusCMSError com INTERNAL_SERVER_ERROR

## ERR-03: Media Nao Encontrada
- **Condição:** ID de media nao existe
- **Código HTTP:** 404
- **Mensagem:** "Media not found"

## ERR-04: Falha no Storage
- **Condição:** S3/R2 ou filesystem indisponivel
- **Código HTTP:** 500
- **Mensagem:** Erro de upload
- **Ação do sistema:** Erro logado, upload falha
