---
spec_version: "1.0"
last_updated: "2026-07-17"
author: "BlackLotusCMS Team"
status: approved
---

# Field Utils - Conditional Logic & Validation

## Overview

`src/lib/field-utils.ts` provides the field evaluation engine for the Custom Fields system. It handles conditional logic (show/hide fields based on form state), field validation (required, min/max, regex, email, file types), metadata transformation, and URL resolution.

## Functions

### evaluateRule(rule, formData) → boolean

Evaluates a single conditional rule against current form data.

**Parameters:**
- `rule: ConditionalRule` — `{ field: string, operator: string, value?: any }`
- `formData: any` — Current form state (checks `formData.metaFields[field]` then `formData[field]`)

**Operators:**

| Operator | Behavior |
|----------|----------|
| `equals` | Strict equality (`===`) |
| `not_equals` | Strict inequality (`!==`) |
| `contains` | Array: `includes(target)`. String: `String(value).includes(target)` |
| `not_contains` | Inverse of `contains` |
| `regex` | `new RegExp(target).test(value)`. Returns `false` on invalid regex |
| `greater_than` | `Number(value) > Number(target)` |
| `less_than` | `Number(value) < Number(target)` |
| `is_empty` | `undefined`, `null`, `''`, or empty array |
| `is_not_empty` | Inverse of `is_empty` |

**Edge cases:**
- Unknown operators return `true` (fail-open)
- Invalid regex patterns return `false`

### shouldShowField(config, formData) → boolean

Evaluates the full conditional logic for a field.

**Parameters:**
- `config: FieldConfig` — Field configuration with optional `conditionalLogic`
- `formData: any` — Current form state

**Logic:**
- Returns `true` if `conditionalLogic.status` is falsy or no rules exist
- `relation: 'and'` → all rules must match (`rules.every`)
- `relation: 'or'` → at least one rule must match (`rules.some`)

### validateField(field, value) → string | null

Validates a field value against its configuration. Returns error message or `null` if valid.

**Validation rules by field type:**

| Field Type | Validation | Error Message |
|------------|------------|---------------|
| `tab`, `section` | Skipped (always valid) | — |
| Any (if `required`) | Value is `undefined`, `null`, or `''` | "This field is required." |
| `icon` (if `required`) | No `iconName` or `iconSvg` | "Please select an icon." |
| `number` | `min` / `max` by numeric value | "Minimum/Maximum value is X." |
| `text`, `textarea` | `min` / `max` by character count | "Minimum/Maximum X characters." |
| `email` | Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | "Invalid email format." |
| Any (if `pattern`) | Custom regex | "Value does not match the expected format." |
| `repeater` | `minItems` / `maxItems` by array length | "Minimum/Maximum of X items." |
| `file`, `image`, `gallery` | `accept` types by file extension | "File type '.X' is not allowed." |

**File extension extraction:** Splits URL by `.`, strips query params (`?`), compares against comma-separated `accept` list.

### flattenMetadata(metaValues) → Record<string, any>

Converts Prisma `MetaValue[]` array to `{ fieldName: value }` object.

- Uses `curr.field?.name` as key (falls back to `curr.fieldId`)
- Returns `{}` for null/undefined/non-array input

### resolveMetaUrls(meta, baseUrl) → Record<string, any>

Converts relative URLs (`/uploads/...`) to absolute URLs (`baseUrl/uploads/...`).

- Handles string values and arrays of strings
- Only converts values starting with `/`
- Non-string values pass through unchanged

## Types

```typescript
type ConditionalRule = {
  field: string;      // Field name to monitor
  operator: string;   // One of 9 operators
  value?: any;        // Comparison target (optional for is_empty/is_not_empty)
};

type FieldConfig = {
  required?: boolean;           // Default: false
  placeholder?: string;
  defaultValue?: any;
  instructions?: string;
  width?: number;               // 0-100%, default: 100
  validation?: {
    min?: number;               // Min value (number) or min chars (text)
    max?: number;               // Max value (number) or max chars (text)
    pattern?: string;           // Custom regex
    accept?: string;            // Comma-separated file extensions
  };
  conditionalLogic?: {
    status?: boolean;           // Enable/disable, default: false
    relation?: 'and' | 'or';   // Default: 'and'
    rules?: ConditionalRule[];
  };
  options?: { label: string; value: string }[];  // For select fields
  repeater?: {
    minItems?: number;
    maxItems?: number;
    layout?: 'table' | 'block'; // Default: 'block'
    buttonLabel?: string;       // Default: 'Adicionar Item'
    fields?: CreateFieldSchema[];
  };
  flexibleContent?: {
    layouts?: {
      name: string;             // snake_case
      label: string;
      fields?: CreateFieldSchema[];
    }[];
    buttonLabel?: string;       // Default: 'Adicionar Layout'
  };
};
```

## Integration Points

- **PostEditor.tsx** — Uses `shouldShowField()` and `validateField()` for client-side rendering and validation
- **FieldGroupEditor.tsx** — Uses conditional logic for field preview
- **PostService.ts** — Uses `validateMetaFields()` (FieldService) which calls `validateField()` for server-side validation
- **ThemeRenderer.tsx** — Uses `flattenMetadata()` and `resolveMetaUrls()` for theme data preparation
