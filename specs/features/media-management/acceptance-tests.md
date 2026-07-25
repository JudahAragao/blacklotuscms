---
spec_version: "1.3"
last_updated: "2026-07-15"
author: "BlackLotusCMS Team"
status: approved
feature: "media-management"
---

# Media Management Acceptance Tests

## AT-01: Image Upload
- **GIVEN** authenticated user with media.upload permission
- **WHEN** sends JPEG file via POST /api/v1/media
- **THEN** file is converted to WebP, thumbnail generated, record created with mimeType='image/webp'
- **Reference:** REQ-01

## AT-02: Upload Without Permission
- **GIVEN** user without media.upload capability
- **WHEN** sends file via POST /api/v1/media
- **THEN** returns error 403
- **Reference:** REQ-06

## AT-03: Media Deletion
- **GIVEN** media existing in database and storage
- **WHEN** deletion is requested with media.manage permission
- **THEN** physical file and record are removed
- **Reference:** REQ-05

## AT-04: Generic File Upload (PDF)
- **GIVEN** authenticated user with media.upload permission
- **WHEN** sends PDF file via POST /api/v1/media
- **THEN** file is saved with original mimeType, thumbnail=null, record created
- **Reference:** REQ-01a

## AT-05: Generic File Upload (DOCX)
- **GIVEN** authenticated user with media.upload permission
- **WHEN** sends DOCX file via POST /api/v1/media
- **THEN** file is saved with mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document', thumbnail=null
- **Reference:** REQ-01a

## AT-06: Dynamic MediaPicker Accept
- **GIVEN** custom file field with validation.accept='pdf, docx'
- **WHEN** user opens MediaPicker to select file
- **THEN** input file has accept='.pdf,.docx'
- **Reference:** REQ-06

## AT-07: MediaPicker Accept All
- **GIVEN** custom file field without validation.accept
- **WHEN** user opens MediaPicker to select file
- **THEN** input file has accept='*'
- **Reference:** REQ-06

## AT-08: File Type Validation
- **GIVEN** file field with validation.accept='pdf, docx'
- **WHEN** user tries to save post with .xlsx file
- **THEN** validation returns error 'File type ".xlsx" is not allowed'
- **Reference:** REQ-06
