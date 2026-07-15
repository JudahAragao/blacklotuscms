---
spec_version: "1.3"
last_updated: "2026-07-15"
author: "BlackLotusCMS Team"
status: approved
---

# Media Management Flows

## Upload de Media (Imagem)

1. **User seleciona arquivo**
   - Entrada: File object via FormData
   - State: File received

2. **RBAC check**
   - Verifica: canPerformAction(user, 'media.upload')
   - State: Authorized

3. **Deteccao de tipo**
   - Verifica: file.type.startsWith('image/')
   - State: Is image = true

4. **Conversao WebP via Sharp**
   - Processa: buffer -> webp quality 80
   - State: Imagem processada

5. **Geracao de Thumbnail**
   - Processa: resize 300x300 cover -> webp quality 70
   - State: Thumbnail gerado

6. **Upload para Storage Driver**
   - Local: salva em ./public/uploads/
   - S3/R2: upload via AWS SDK
   - State: Files salvos

7. **Registro no banco**
   - Cria Media com url, thumbnail, mimeType='image/webp', size, metadata (width, height, format)
   - State: Registro criado

## Upload de Media (Arquivo Generico)

1. **User seleciona arquivo**
   - Entrada: File object via FormData
   - State: File received

2. **RBAC check**
   - Verifica: canPerformAction(user, 'media.upload')
   - State: Authorized

3. **Deteccao de tipo**
   - Verifica: file.type.startsWith('image/')
   - State: Is image = false

4. **Upload para Storage Driver**
   - Salva arquivo original com mimeType real
   - Local: salva em ./public/uploads/
   - S3/R2: upload via AWS SDK
   - State: File salvo

5. **Registro no banco**
   - Cria Media com url, thumbnail=null, mimeType=original, size, metadata (extension)
   - State: Registro criado

## Exclusao de Media

1. **RBAC check** (media.manage)
2. **Busca Media no banco**
3. **Exclui arquivo principal do storage**
4. **Exclui thumbnail do storage** (se existir)
5. **Exclui registro do banco**
