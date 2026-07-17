---
spec_version: "1.0"
last_updated: "2026-07-17"
author: "BlackLotusCMS Team"
status: approved
---

# Admin Components - PostEditor & FieldGroupEditor

## PostEditor (`src/components/admin/PostEditor.tsx`)

### Overview
Full-featured post editor client component (~980 lines). Handles custom fields, SEO, taxonomies, publishing, and content editing.

### Props

```typescript
interface PostEditorProps {
  post: any;                          // Post data with metaValues, terms, postType
  fieldGroups?: any[];                // Custom field groups (optional, falls back to post.postType.fieldGroups)
  onSave: (data: any) => Promise<any>; // Server action callback
  readOnly?: boolean;                 // Disables editing
  capabilities?: {
    canPublish: boolean;              // Controls publish/private status access
  };
}
```

### State

| Variable | Type | Purpose |
|----------|------|---------|
| `formData` | Object | title, slug, content, status, metaFields (by fieldId), terms (termId[]), publishedAt, expiresAt, seoTitle, seoDescription, ogImage, noIndex |
| `errors` | Record<string, string> | Per-field validation errors |
| `isSaving` | boolean | Loading state during save |
| `activeTab` | number | Currently visible field tab |
| `touched` | boolean | Whether user has made changes |

### Features

#### 1. Tab/Section Organization
- Fields are organized into visual tabs (`tab` type) and sections (`section` type)
- `groupedFields` useMemo builds a `tabs[] → sections[] → fields[]` hierarchy
- If no explicit tabs exist, all fields render in a single untitled tab
- Empty first tab is removed when explicit tabs exist

#### 2. Conditional Logic Evaluation
- `fieldIdToNameMap` maps field IDs to field names (conditional logic uses names)
- `evalData` transforms `metaFields` from ID-keyed to name-keyed for `shouldShowField()`
- Fields are shown/hidden in real-time based on form state

#### 3. Field Type Rendering (`renderFieldInput`)
Renders appropriate input for each of 15 field types:

| Type | Input Component | Notes |
|------|----------------|-------|
| `text` | `<input type="text">` | Placeholder support |
| `number` | `<input type="number">` | Min/max from config |
| `email` | `<input type="email">` | Email validation |
| `textarea` | `<textarea>` | Rows: 3 |
| `select` | `<select>` | Options from `config.options` |
| `boolean` | Checkbox toggle | — |
| `image` | `MediaPicker` | Single image |
| `gallery` | `MediaPicker` (multiple) | Multiple images |
| `file` | `MediaPicker` | Any file type |
| `wysiwyg` | `RichTextEditor` | TipTap-based |
| `icon` | `IconPicker` | Lucide + custom SVG |
| `json` | `<textarea>` | Raw JSON editor |
| `repeater` | Dynamic row list | Add/remove/reorder rows, renders sub-fields |
| `flexible_content` | Dynamic layout list | Add/remove layouts, each layout has its own fields |
| `tab` / `section` | — | Organizers only, no input rendered |

#### 4. Repeater Support
- Add/remove rows with "Adicionar Item" button
- Each row renders its configured sub-fields
- Sub-fields support all field types (recursive)
- Layout options: `block` (default), `table`, `row`

#### 5. Flexible Content Support
- Add/remove layouts from configured layout list
- Each layout has a name, label, and its own set of fields
- Layout selector shows available layouts

#### 6. SEO Panel
- `seoTitle`: Input with 60-char warning indicator
- `seoDescription`: Textarea with 160-char warning indicator
- `ogImage`: MediaPicker for Open Graph image
- `noIndex`: Toggle for robots meta tag
- Live Google preview showing how the post would appear in search results

#### 7. Publishing Sidebar
- **Static positioning**: Card is static (no sticky/fixed), stays in natural document flow
- **Status selector**: draft / published / private (private only if `canPublish`)
- **Scheduling**: publishedAt and expiresAt datetime pickers
- **Author display**: Shows current author name
- **Permalink/Slug editor**: Auto-generated from title, editable
- **Taxonomy assignment**: Checkbox lists for each associated taxonomy

#### 7.1 Default Content Card (Title + Editor)
- **Conditional rendering**: The content card containing title input and rich text editor only renders when `supportsTitle !== false` OR `supportsEditor !== false`
- If both `supportsTitle` and `supportsEditor` are `false`, the card is hidden entirely, allowing custom field groups to move up without empty space

#### 8. Slug Generation
- Auto-generates from title via `generateSlug()`
- Unicode normalization (NFD decomposition, strip diacritics)
- Lowercase, replace spaces with hyphens, strip special chars
- Only generates on new post (when slug is empty)

#### 9. Validation
- Client-side validation on submit via `validateField()` from `field-utils.ts`
- Per-field error display below each input
- Required field check, type-specific validation (min/max, regex, email, file types)
- Tab/Section fields are skipped during validation

#### 10. Save Flow
1. Validate all visible fields
2. If errors exist, show toast and scroll to first error
3. Call `onSave(formData)` server action
4. Show success toast, redirect to post list

---

## FieldGroupEditor (`src/app/(admin)/admin/settings/field-groups/[id]/FieldGroupEditor.tsx`)

### Overview
Full-featured field group editor client component (~1665 lines). Manages field definitions, locations, configuration tabs, drag-and-drop reordering, and nested sub-fields.

### Props

```typescript
interface FieldGroupEditorProps {
  fieldGroup: any;                     // Existing field group with fields and locations
  postTypes: { id: string; slug: string; label: string }[];
  taxonomies: { id: string; slug: string; label: string }[];
}
```

### State

| Variable | Type | Purpose |
|----------|------|---------|
| `title` | string | Field group title |
| `locations` | LocationRule[] | Where this field group appears |
| `fields` | Field[] | Array of field definitions |
| `expandedField` | number \| string \| null | Which field's config panel is open |
| `activeFieldTab` | Record<number, string> | Active config tab per field (general/validation/options/logic) |
| `activeSubFieldTab` | Record<string, string> | Active config tab per sub-field |
| `dragSource` / `dropTarget` | DragSource / DropTarget | Drag-and-drop state |
| `postSearchQuery` / `postSearchResults` | string / any[] | Post search for "post" location type |

### Features

#### 1. Location Management
- Add/remove location rules
- Location types: `post_type`, `taxonomy`, `post`, `template`, `post_status`
- Each type has a value dropdown (populated from postTypes/taxonomies)
- `post` type includes a search-as-you-type post finder (debounced 300ms)
- Locations are sent as an array (replaced on save, not synced)

#### 2. Field Management
- Add new fields with label, name (auto-generated snake_case), and type
- `FieldTypeSelector` component for type selection with categories
- Delete fields with confirmation
- Fields are saved via `syncFieldsAction()` (delete removed, upsert existing, create new)

#### 3. Field Configuration Tabs
Each field has 4 configuration tabs:

**General Tab:**
- Label (display name)
- Name (internal key, snake_case, auto-generated from label)
- Instructions (help text)
- Placeholder
- Default value
- Width (0-100%)
- Required toggle

**Validation Tab:**
- Min value (number) / Min characters (text)
- Max value (number) / Max characters (text)
- Custom regex pattern
- Accept types (comma-separated extensions for file/image/gallery)

**Options Tab** (select fields only):
- Add/remove option pairs (label + value)

**Conditional Logic Tab:**
- Enable/disable toggle
- Relation: AND / OR
- Add/remove rules
- Each rule: field selector + operator dropdown + value input
- Operators: equals, not_equals, contains, not_contains, regex, greater_than, less_than, is_empty, is_not_empty

#### 4. Repeater Configuration
- Layout selector: Table / Block / Row
- Min items / Max items
- Button label
- Sub-fields editor (recursive, uses `SubFieldEditor` component)

#### 5. Flexible Content Configuration
- Add/remove layouts
- Each layout: name (snake_case) + label + fields
- Button label
- Sub-fields editor per layout (recursive)

#### 6. Drag-and-Drop Reordering
- Root-level field reordering via grip handle
- Sub-field reordering within repeaters and flexible content layouts
- Visual drop indicators (before/after/inside)
- Supports cross-context drag (root ↔ repeater ↔ flexible layout)

#### 7. Save Flow
1. Validate title is not empty
2. Validate at least one location exists
3. Call `updateFieldGroupAction()` to save title + locations
4. Call `syncFieldsAction()` to synchronize field definitions
5. Show success toast, redirect to field groups list

#### 8. Post Search (for "post" location type)
- Debounced search (300ms delay)
- Minimum 2 characters to trigger
- Results displayed as selectable list
- Selected post shown as the location value

---

## Integration Points

- **PostEditor** is used by:
  - `admin/posts/new/page.tsx` (create mode)
  - `admin/posts/[id]/page.tsx` (edit mode)

- **FieldGroupEditor** is used by:
  - `admin/settings/field-groups/[id]/page.tsx`

- Both depend on:
  - `field-utils.ts` for `shouldShowField()` and `validateField()`
  - `FieldTypeSelector` for type selection UI
  - `SubFieldEditor` for nested field editing
  - `MediaPicker` for image/file/gallery fields
  - `RichTextEditor` for wysiwyg fields
  - `IconPicker` for icon fields
