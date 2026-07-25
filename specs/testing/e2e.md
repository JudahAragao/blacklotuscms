---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: draft
---

# E2E Testing Plan

## Tools
- To be defined (Playwright recommended)

## Scenarios
1. **Complete Installation:** Setup wizard with real database
   - Linked feature: installation
   - Acceptance tests: AT-01 to AT-04

2. **Login and CRUD Posts:** Authentication + creation + editing + deletion
   - Linked feature: authentication, post-management
   - Acceptance tests: AT-01 to AT-08

3. **Upload and Media Management:** Upload + viewing + deletion
   - Linked feature: media-management
   - Acceptance tests: AT-01 to AT-03

4. **Plugin Lifecycle:** Installation + activation + deactivation
   - Linked feature: plugin-system
   - Acceptance tests: AT-01 to AT-05

5. **Theme Rendering:** Complete public viewing
   - Linked feature: theme-engine
   - Acceptance tests: AT-01 to AT-03
