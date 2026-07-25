---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "post-management"
---

# Post Management Error States

## ERR-01: Post Not Found
- **Condition:** ID or slug does not exist in database
- **HTTP Code:** 404
- **User message:** "Post not found"
- **System action:** Returns RESOURCE_NOT_FOUND
- **TEST DATA:** `{ "trigger": "nonexistent_id", "expected_code": 404, "expected_message": "Post not found" }`

## ERR-02: Duplicate Slug
- **Condition:** Attempt to create/update with slug that already exists
- **HTTP Code:** 409 or 400
- **User message:** "Slug already in use"
- **System action:** Prisma unique constraint violation captured
- **TEST DATA:** `{ "trigger": "duplicate_slug", "expected_code": 409 }`

## ERR-03: PostType Not Found
- **Condition:** provided postTypeId does not match any PostType
- **HTTP Code:** 404
- **User message:** "Post Type not found"
- **System action:** Verification before creation
- **TEST DATA:** `{ "trigger": "invalid_postTypeId", "expected_code": 404 }`

## ERR-04: No Permission
- **Condition:** User without required capability
- **HTTP Code:** 403
- **User message:** "No permission to create/update/delete posts"
- **System action:** canPerformAction returns false
- **TEST DATA:** `{ "trigger": "user_without_permission", "expected_code": 403 }`

## ERR-05: Zod Validation
- **Condition:** Invalid input data
- **HTTP Code:** 400
- **User message:** Invalid field details
- **System action:** ZodError flattened
- **TEST DATA:** `{ "trigger": "empty_title", "expected_code": 400 }`
