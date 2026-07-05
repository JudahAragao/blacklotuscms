---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "media-management"
---

# Media Management Flows

## Upload de Midia

1. **Usuario seleciona arquivo**
   - Entrada: File object via FormData
   - Estado: Arquivo recebido

2. **RBAC check**
   - Verifica: canPerformAction(user, 'media.upload')
   - Estado: Autorizado

3. **Conversao WebP via Sharp**
   - Processa: buffer -> webp quality 80
   - Estado: Imagem processada

4. **Geracao de Thumbnail**
   - Processa: resize 300x300 cover -> webp quality 70
   - Estado: Thumbnail gerado

5. **Upload para Storage Driver**
   - Local: salva em ./public/uploads/
   - S3/R2: upload via AWS SDK
   - Estado: Arquivos salvos

6. **Registro no banco**
   - Cria Media com url, thumbnail, mimeType, size, metadata
   - Estado: Registro criado

## Exclusao de Midia

1. **RBAC check** (media.manage)
2. **Busca Media no banco**
3. **Exclui arquivo principal do storage**
4. **Exclui thumbnail do storage**
5. **Exclui registro do banco**
