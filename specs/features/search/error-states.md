---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "search"
---

# Search Error States

## ERR-01: Empty or Short Query
- **Condition:** query.length < 3
- **HTTP Code:** N/A (returns [])
- **System action:** Returns empty array silently
