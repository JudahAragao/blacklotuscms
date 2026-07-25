---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "search"
---

# Search Acceptance Tests

## AT-01: Search with Results
- **GIVEN** published posts with title "Technology"
- **WHEN** search for "technology"
- **THEN** matching posts returned
- **Reference:** FR16

## AT-02: Very Short Query
- **GIVEN** query "ab" (2 characters)
- **WHEN** search is executed
- **THEN** empty array returned
- **Reference:** FR16
