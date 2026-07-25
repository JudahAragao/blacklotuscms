---
spec_version: "1.2"
last_updated: "2026-07-13"
author: "BlackLotusCMS Team"
status: approved
feature: "post-management"
---

# Post Management Acceptance Tests

## AT-01: Create Post as Administrator
- **GIVEN** an authenticated Administrator user
- **WHEN** sends POST /api/v1/posts/post with title, slug, content, status="published"
- **THEN** the post is created with status "published" and publishedAt defined
- **TEST DATA:** `{ "title": "My Post", "slug": "my-post", "content": "Content", "status": "published" }`
- **Reference:** FR05, BR04

## AT-02: Contributor Draft Lock
- **GIVEN** an authenticated Contributor user
- **WHEN** sends POST with status="published"
- **THEN** the post is created with status "draft"
- **TEST DATA:** `{ "title": "Contributor Post", "slug": "contributor-post", "status": "published" }`
- **Reference:** FR05, BR02

## AT-03: Duplicate Slug
- **GIVEN** a post with slug "my-post" already exists
- **WHEN** tries to create another post with the same slug
- **THEN** returns 409 error or validation error
- **Reference:** FR05

## AT-04: Post Not Publicly Visible
- **GIVEN** a post with status "draft"
- **WHEN** theme queries PostService.getLeanPostsByType
- **THEN** the post is not returned
- **Reference:** FR05, BR01

## AT-05: Post with Expiration
- **GIVEN** a post with expiresAt in the past
- **WHEN** theme queries publicly
- **THEN** the post is not returned
- **Reference:** FR05, BR01

## AT-06: Edit Another Author's Post
- **GIVEN** an Author trying to edit another user's post
- **WHEN** sends update without "post.manage" capability
- **THEN** returns 403 error
- **Reference:** FR05, BR04

## AT-07: MetaFields Validation
- **GIVEN** a post with FieldGroup configured
- **WHEN** sends metaFields with mandatory field empty
- **THEN** returns 422 error
- **Reference:** FR06

## AT-08: Cache Revalidation
- **GIVEN** posts listed with cache
- **WHEN** a post is created or updated
- **THEN** revalidateTag('posts') is called and cache is invalidated
- **Reference:** FR05, NFR01

## AT-09: Tab and Section Field Types
- **GIVEN** a PostType with Tab and Section fields configured
- **WHEN** user creates a "General Data" tab with fields below, and a "Media" section with fields below
- **THEN** the post editor displays tab navigation, with visual section within the active tab
- **AND** Tab/Section fields do not generate MetaValues nor validation
- **Reference:** FR06

## AT-10: Tab Field Groups Correctly
- **GIVEN** a PostType with 3 tabs: "General", "SEO", "Advanced"
- **WHEN** user navigates between tabs in the editor
- **THEN** each tab displays only its fields (fields between one Tab and the next Tab)
- **Reference:** FR06

## AT-11: Drag and Drop No Accidental Reorder
- **GIVEN** a FieldGroup with custom fields
- **WHEN** user drags a field and drops it in the same place
- **THEN** the field order is not changed
- **Reference:** FR06

## AT-12: Auto-Deduplicate Field Anchors
- **GIVEN** a PostType with field "Title" (anchor: title)
- **WHEN** user creates another field with label "Title"
- **THEN** the second field's anchor is "title_2"
- **AND** third "Title" generates "title_3"
- **Reference:** FR06

## AT-13: Tab/Section Visual Distinction
- **GIVEN** a FieldGroup with Tab, Section and data fields
- **WHEN** user views the field list
- **THEN** Tab and Section fields display darker background and "tab"/"section" badge
- **Reference:** FR06

## AT-14: FieldGroup Location Rules
- **GIVEN** a FieldGroup with location "Post Type = Post"
- **WHEN** user creates a post in type "Post"
- **THEN** the FieldGroup fields appear in the editor
- **AND** posts in other types DO NOT show these fields
- **Reference:** FR06

## AT-15: Multiple Location Rules
- **GIVEN** a FieldGroup with locations "Post Type = Post" and "Post Type = Page"
- **WHEN** user creates a post or a page
- **THEN** the FieldGroup fields appear in both
- **Reference:** FR06

## AT-16: Taxonomy Field Groups
- **GIVEN** a FieldGroup with location "Taxonomy = category"
- **WHEN** user edits a category
- **THEN** the FieldGroup fields appear in category editing
- **Reference:** FR06

## AT-17: FieldGroups Admin Page
- **GIVEN** an administrator
- **WHEN** accesses /admin/settings/field-groups
- **THEN** can list, create, edit and delete FieldGroups with locations
- **Reference:** FR06

## AT-18: Repeater Sub-Fields
- **GIVEN** a FieldGroup with Repeater field containing sub-fields (text, image)
- **WHEN** user adds items in the repeater
- **THEN** each row displays the configured sub-fields
- **AND** data is saved as an array of objects
- **Reference:** FR06

## AT-19: Flexible Content Layouts
- **GIVEN** a FieldGroup with Flexible Content field with 2 layouts (Hero, Text)
- **WHEN** user clicks "+ Hero" or "+ Text"
- **THEN** a new block is added with the sub-fields of that layout
- **AND** user can add multiple blocks in any order
- **Reference:** FR06

## AT-20: Sub-Fields Inline Layout
- **GIVEN** a Repeater with configured sub-fields
- **WHEN** user views the sub-fields in the field groups editor
- **THEN** sub-fields appear in inline format with #, Label, Name (anchor), Type
- **AND** each sub-field has configuration (gear) and removal (trash) buttons
- **AND** when clicking the gear, a panel with tabs (General, Validation, Conditional Logic) is expanded
- **Reference:** FR06

## AT-21: Repeater Layout Modes
- **GIVEN** a Repeater field with "Table" layout selected
- **WHEN** user views the repeater on the post editing page
- **THEN** items are displayed in table format with columns
- **AND** "Block" layout displays as cards and "Row" layout displays in a row
- **Reference:** FR06

## AT-22: Drag Field to Repeater (Root → Sub-field)
- **GIVEN** a FieldGroup with root field "Text" and Repeater field with sub-fields
- **WHEN** user drags the "Text" field to the drop zone inside the Repeater
- **THEN** the "Text" field is removed from the root field list
- **AND** the "Text" field is added as a Repeater sub-field
- **AND** all field configuration (type, validation, etc.) is preserved
- **Reference:** REQ-03a

## AT-23: Drag Sub-field to Root (Sub-field → Root)
- **GIVEN** a Repeater with sub-field "Email"
- **WHEN** user drags the "Email" sub-field to the root field list
- **THEN** the "Email" sub-field is removed from the Repeater
- **AND** the "Email" field is added as a root field
- **AND** all field configuration is preserved
- **Reference:** REQ-03a

## AT-24: Drag Between Repeaters
- **GIVEN** two Repeaters: "Repeater A" with sub-field "Name" and "Repeater B"
- **WHEN** user drags "Name" from "Repeater A" to "Repeater B"
- **THEN** the "Name" sub-field is removed from "Repeater A"
- **AND** the "Name" sub-field is added to "Repeater B"
- **Reference:** REQ-03a

## AT-25: Drag to Flexible Content Layout
- **GIVEN** a Flexible Content field with layout "Hero" and root field "Image"
- **WHEN** user drags "Image" to the drop zone inside the "Hero" layout
- **THEN** the "Image" field is removed from the root field list
- **AND** the "Image" field is added as a sub-field of the "Hero" layout
- **Reference:** REQ-03a

## AT-26: Drop Zone Visual Feedback
- **GIVEN** a Repeater or Flexible Content Layout
- **WHEN** user drags a field over the drop zone
- **THEN** the drop zone displays visual feedback (dashed blue border, "Drop here" text)
- **AND** when dropped, the field is moved to the correct destination
- **Reference:** REQ-03a

## AT-27: Sub-Field Config Tabs
- **GIVEN** an expanded sub-field in the field groups editor
- **WHEN** user clicks the gear on the sub-field
- **THEN** configuration panel is expanded with tabs: General, Validation, Conditional Logic
- **AND** General tab shows: Type (FieldTypeSelector), Width, Instructions, Mandatory
- **AND** Validation tab shows: Min, Max
- **AND** Conditional Logic tab shows: Status (Active/Inactive) and rules
- **Reference:** REQ-03

## AT-28: FieldTypeSelector for Sub-Fields
- **GIVEN** a sub-field with General tab expanded
- **WHEN** user clicks the type selector
- **THEN** dropdown opens with icons, categories and search
- **AND** same behavior as the root field selector
- **Reference:** REQ-03

## AT-29: Click to Add Sub-Field
- **GIVEN** a Repeater or Flexible Content Layout
- **WHEN** user clicks the "Drag or click to add sub-field" drop zone
- **THEN** a new sub-field is added to the repeater/layout
- **AND** sub-field is created with type "text" and default settings
- **Reference:** REQ-03

## AT-30: Save Button Stays on Page
- **GIVEN** a FieldGroup being edited
- **WHEN** user clicks "Save Configuration"
- **THEN** success message is displayed
- **AND** user remains on the same editing page (does not redirect to list)
- **Reference:** REQ-03

## AT-31: Sub-Field Name Auto-Generation
- **GIVEN** a sub-field with label "Business Phone"
- **WHEN** user types the label
- **THEN** anchor name is automatically generated as "business_phone"
- **AND** anchor name is updated whenever the label changes
- **AND** anchor name field is editable for manual customization
- **Reference:** REQ-03

## AT-32: Icon Field with Lucide Library
- **GIVEN** a FieldGroup with "Icon" type field configured with source "icon library"
- **WHEN** user clicks the icon selector
- **THEN** dropdown opens with search and icon categories
- **AND** user can search for icons by name (e.g., "star", "heart", "home")
- **AND** selected icon is saved as object { iconSource: 'lucide', iconName: 'star' }
- **Reference:** REQ-10

## AT-33: Icon Field with Custom SVG
- **GIVEN** a FieldGroup with "Icon" type field configured with source "Custom SVG"
- **WHEN** user pastes a valid SVG in the textarea
- **THEN** icon preview is displayed below the textarea
- **AND** SVG is sanitized (script tags, event handlers removed)
- **AND** icon is saved as object { iconSource: 'custom', iconSvg: '<svg>...</svg>' }
- **Reference:** REQ-10

## AT-34: SVG Sanitization Security
- **GIVEN** an SVG with malicious content (script tag, onclick handler, javascript: protocol)
- **WHEN** user tries to save the custom SVG
- **THEN** malicious content is removed
- **AND** sanitized SVG is saved without compromising security
- **Reference:** REQ-10

## AT-35: Icon Field in Theme Rendering
- **GIVEN** a post with a filled icon field
- **WHEN** theme renders the post using renderIcon()
- **THEN** icon is rendered safely (lucide-react or sanitized SVG)
- **AND** icon respects configured color and size
- **Reference:** REQ-10
