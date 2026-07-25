---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "plugin-system"
---

# Plugin System Acceptance Tests

## AT-01: Install Valid Plugin
- **GIVEN** ZIP with valid plugin.json and index.js
- **WHEN** admin uploads
- **THEN** plugin is registered in database
- **Reference:** FR10

## AT-02: Plugin with Invalid Manifest
- **GIVEN** ZIP without plugin.json
- **WHEN** admin attempts to install
- **THEN** ZIP is removed and error 400 returned
- **Reference:** FR10

## AT-03: Activate Plugin
- **GIVEN** installed and deactivated plugin
- **WHEN** admin activates
- **THEN** sandbox is executed and isActive = true
- **Reference:** FR10

## AT-04: Plugin Exceeding Timeout
- **GIVEN** plugin with infinite loop
- **WHEN** executed in sandbox
- **THEN** error 408 returned after SANDBOX_TIMEOUT
- **Reference:** FR10, BR05

## AT-05: Plugin Accessing Data Without Permission
- **GIVEN** plugin without approved PluginPermission
- **WHEN** calls bridge.db.read('User', {})
- **THEN** error 403 returned
- **Reference:** FR10, BR06