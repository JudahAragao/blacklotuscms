---
spec_version: "1.2"
last_updated: "2026-07-13"
author: "BlackLotusCMS Team"
status: approved
---

# Wireframes (Conceptual)

## 1. Admin Dashboard
- **Visuals:** Sidebar navigation, top bar with user menu
- **Components:** Skeleton loader, cards
- **Linked feature:** authentication

## 2. Post Editor
- **Visuals:** Title input, TipTap editor, meta fields panel with tabs/sections, taxonomy sidebar
- **Components:** PostEditor (with groupedFields: tab navigation + section dividers), RichTextEditor, MediaPicker
- **Linked feature:** post-management
- **Note:** Tab-type fields create navigable tabs; Section-type fields create visual dividers within the tab

## 3. Media Library
- **Visuals:** Grid of thumbnails with upload area
- **Components:** MediaUpload, MediaPicker
- **Linked feature:** media-management

## 4. Public Page (Theme Default)
- **Visuals:** Header with menu, content area, footer
- **Components:** Header, Footer, ThemeContent
- **Linked feature:** theme-engine

## 5. Installation Wizard
- **Visuals:** Multi-step form
- **Components:** Form inputs, progress indicator
- **Linked feature:** installation

## 6. Plugin Manager
- **Visuals:** Plugin list with activate/deactivate toggle
- **Components:** PluginWrapper, PluginImportButton
- **Linked feature:** plugin-system
