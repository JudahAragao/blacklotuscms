---
spec_version: "1.3"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "media-management"
---

# Media Management Specification

## Description
Media management system with image upload (WebP + thumbnails) and generic files, multi-driver storage and paginated library.

## Requirements
- **REQ-01:** Image upload with automatic conversion to WebP
- **REQ-01a:** Generic file upload (PDF, DOCX, XLSX, etc.) without image processing
- **REQ-02:** Thumbnail generation 300x300 via Sharp (images only)
- **REQ-03:** Storage drivers: local, S3, R2
- **REQ-04:** Media library with pagination
- **REQ-05:** Physical file and database record deletion (via admin server action, not REST API)
- **REQ-06:** RBAC for upload (media.upload) and deletion (media.manage)

## User Roles
- **Administrator/Editor:** Full upload and deletion
- **Author:** Upload with own permission
- **Contributor:** No media access

## Constraints
- **C01:** Images are automatically converted to WebP
- **C02:** Thumbnails are generated at 300x300 with fit: cover (images only)
- **C03:** Filename is sanitized via sanitizeFilename
- **C04:** Metadata (width, height, format) stored in database for images
- **C05:** Non-image files are saved with original mimeType and no thumbnail
- **C06:** MediaPicker accept attribute is dynamic based on field config validation.accept
- **C07:** URLs from file/image/gallery fields are converted to absolute in page route
- **C08:** Deletion managed via admin server actions (not REST API)

## Dependencies
- **Depends on:** Storage Driver, Authentication
- **Blocks:** Post editor (media picker), Theme images/files
- **Related to:** Posts, Themes, Custom Fields
