---
spec_version: "1.5"
last_updated: "2026-07-15"
author: "BlackLotusCMS Team"
status: approved
feature: "post-management"
---

# Post Management Specification

## Description
Complete content management system with Custom Post Types, MetaFields, Taxonomies and integrated SEO.

## Requirements
- **REQ-01:** Complete CRUD posts with Zod validation
- **REQ-02:** Support for configurable Custom Post Types
- **REQ-03:** Custom fields (MetaFields) via independent FieldGroups with location rules (post types, taxonomies, specific posts, templates, status), including Tab and Section organizer types, with automatic anchor deduplication
- **REQ-03a:** Fields and subfields are unified - root fields can become subfields of repeater/flexible_content via drag and drop, and subfields can become root fields
- **REQ-03b:** All field configuration (type, validation, conditional logic, options) is preserved when moving between levels
- **REQ-03c:** file/image/gallery field has accepted type validation via validation.accept
- **REQ-04:** Hierarchical and flat taxonomies
- **REQ-05:** SEO metadata (title, description, ogImage, noIndex)
- **REQ-06:** Publication status (draft, published, private)
- **REQ-07:** Publication and expiration date
- **REQ-08:** Cache with revalidation tags
- **REQ-09:** Hooks for extensibility (post.created, post.updated, post.deleted)
- **REQ-10:** Icon field with lucide-react library support (1000+ icons) and custom SVG with sanitization

## User Roles
- **Administrator:** Can create, edit, delete and publish any post
- **Editor:** Can create, edit, delete and publish posts
- **Author:** Can create, edit and publish their own posts
- **Contributor:** Can create posts (always as draft)
- **Subscriber:** Read only

## Constraints
- **C01:** Slug must be unique and follow regex ^[a-z0-9-]+$
- **C02:** SEO title max 70 characters, description max 160
- **C03:** Draft status is forced for Contributors
- **C04:** Posts only appear in public queries when published and publishedAt <= now

## Dependencies
- **Depends on:** Authentication, RBAC
- **Blocks:** Theme rendering, Search, Sitemap
- **Related to:** Media, Comments, Menus
