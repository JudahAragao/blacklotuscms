---
spec_version: "1.0"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "shortcodes"
---

# Shortcodes Specification

## Description
Registerable macro system for plugins and native shortcodes, processed in content. Inspired by WordPress shortcodes.

## Requirements
- **REQ-01:** Shortcode registration via `shortcodeService.register(tag, handler)`
- **REQ-02:** Content processing via `shortcodeService.parse(content)`
- **REQ-03:** Attribute support: `[tag attr="value"]`
- **REQ-04:** Enclosed content support: `[tag]content[/tag]`
- **REQ-05:** Automatic output sanitization via `sanitizeHTML()`
- **REQ-06:** Native shortcodes: `[button]` and `[youtube]`

## Syntax
```
[tag attr="value"]content[/tag]
[tag attr="value"]
[tag]
```

## Native Shortcodes

### [button]
```html
[button url="/contact"]Contact Us[/button]
<!-- Output: <a href="/contact" class="btn-shortcode">Contact Us</a> -->
```

### [youtube]
```html
[youtube id="dQw4w9WgXcQ"]
<!-- Output: <div class="video-container"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" ...></iframe></div> -->
```

## Constraints
- **C01:** Output is always sanitized with DOMPurify
- **C02:** Unregistered shortcodes are ignored (kept in content)
- **C03:** Handler can be synchronous or async

## Dependencies
- **Depends on:** DOMPurify (sanitization)
- **Blocks:** NONE
- **Related to:** Plugin System (plugins can register shortcodes)
