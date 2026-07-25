---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "comments"
---

# Comments Flows

## Create Comment

1. **Visitor fills out form**
   - postId, author, email, content, parentId?
   - State: Data received

2. **Zod Validation** (CreateCommentSchema)
   - State: Validated data

3. **Captcha verification** (if enabled)
   - State: Captcha validated

4. **Anti-spam check**
   - Word blacklist
   - Link counting (>2 = spam)
   - State: Classified

5. **Status determination**
   - If spam: status = "spam"
   - If auto_approve: status = "approved"
   - Otherwise: status = "pending"
   - State: Status defined

6. **Database creation**
   - State: Comment created

## Moderate Comment

1. **Admin views pending comments**
   - State: List displayed

2. **Admin approves/denies/deletes**
   - State: Action taken
