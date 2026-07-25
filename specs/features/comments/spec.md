---
spec_version: "1.2"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "comments"
---

# Comments Specification

## Description
Comment system with threading, anti-spam, optional captcha and moderation workflow.

## Requirements
- **REQ-01:** Creation of public comments with Zod validation
- **REQ-02:** Nested comments (replies via parentId)
- **REQ-03:** Anti-spam with word blacklist and link counting
- **REQ-04:** Optional captcha via setting
- **REQ-05:** Moderation: pending, approved, spam
- **REQ-06:** Optional auto-approve via setting (`auto_approve_comments`)
- **REQ-07:** Deletion with comment.manage permission
- **REQ-08:** IP capture for spam identification (`ip` field in Comment)
- **REQ-09:** Hook `comment.before_save` (filter) for plugins
- **REQ-10:** Hook `comment.after_save` (action) for plugins

## Constraints
- **C01:** Maximum content 5000 characters
- **C02:** Minimum author 2 characters
- **C03:** Links > 2 = automatic spam

## Dependencies
- **Depends on:** Post Management, Settings
- **Blocks:** NONE
- **Related to:** Posts, Themes
