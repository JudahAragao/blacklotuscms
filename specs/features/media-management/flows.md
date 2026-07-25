---
spec_version: "1.3"
last_updated: "2026-07-15"
author: "BlackLotusCMS Team"
status: approved
---

# Media Management Flows

## Media Upload (Image)

1. **User selects file**
   - Input: File object via FormData
   - State: File received

2. **RBAC check**
   - Checks: canPerformAction(user, 'media.upload')
   - State: Authorized

3. **Type detection**
   - Checks: file.type.startsWith('image/')
   - State: Is image = true

4. **WebP conversion via Sharp**
   - Processes: buffer -> webp quality 80
   - State: Image processed

5. **Thumbnail generation**
   - Processes: resize 300x300 cover -> webp quality 70
   - State: Thumbnail generated

6. **Upload to Storage Driver**
   - Local: saves to ./public/uploads/
   - S3/R2: upload via AWS SDK
   - State: Files saved

7. **Database record**
   - Creates Media with url, thumbnail, mimeType='image/webp', size, metadata (width, height, format)
   - State: Record created

## Media Upload (Generic File)

1. **User selects file**
   - Input: File object via FormData
   - State: File received

2. **RBAC check**
   - Checks: canPerformAction(user, 'media.upload')
   - State: Authorized

3. **Type detection**
   - Checks: file.type.startsWith('image/')
   - State: Is image = false

4. **Upload to Storage Driver**
   - Saves original file with real mimeType
   - Local: saves to ./public/uploads/
   - S3/R2: upload via AWS SDK
   - State: File saved

5. **Database record**
   - Creates Media with url, thumbnail=null, mimeType=original, size, metadata (extension)
   - State: Record created

## Media Deletion

1. **RBAC check** (media.manage)
2. **Fetch Media from database**
3. **Deletes main file from storage**
4. **Deletes thumbnail from storage** (if exists)
5. **Deletes record from database**
