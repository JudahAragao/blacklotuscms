---
spec_version: "1.0"
last_updated: "2026-07-17"
author: "BlackLotusCMS Team"
status: approved
---

# Admin Components — Secondary Components

## 1. MediaPicker (`src/components/admin/MediaPicker.tsx`)

Modal media library picker with upload capability and image properties editor.

### Props

```typescript
interface MediaPickerProps {
  onSelect: (media: any | any[]) => void;  // Callback with selected media
  currentValue?: string | string[];         // Pre-selected value(s)
  disabled?: boolean;                       // Disable interaction
  children?: React.ReactNode;               // Trigger element
  multiple?: boolean;                       // Multi-select mode
  accept?: string;                          // Comma-separated file extensions
}
```

### Features
- **Library Tab:** Browse existing media with grid thumbnails
- **Upload Tab:** Drag-and-drop or click to upload
- **Progress Indicator:** Upload progress bar
- **Multi-Select:** Select multiple items with confirm button
- **Image Preview:** Thumbnail preview for images, file icon for non-images
- **Image Properties Editor:** When selecting an image, shows editable fields:
  - Width (e.g., "800px" or "100%")
  - Alt Text (accessibility)
  - Title (tooltip)
  - Alignment (left, center, right, none)
- **API Integration:** Fetches from `GET /api/v1/media`

### Return Object
```typescript
{
  url: string;
  name: string;
  mimeType: string;
  // Optional image properties
  width?: string;
  alt?: string;
  title?: string;
  align?: 'left' | 'center' | 'right';
}
```

---

## 2. SubFieldEditor (`src/components/admin/SubFieldEditor.tsx`)

Editor for sub-fields within repeater/flexible_content fields.

### Props

```typescript
interface SubFieldEditorProps {
  fields: any[];                           // Current field definitions
  onChange: (fields: any[]) => void;       // Update callback
  readOnly?: boolean;                      // Disable editing
  layout?: 'table' | 'block' | 'row';     // Current layout
  onLayoutChange?: (layout: 'table' | 'block' | 'row') => void;
}
```

### Features
- **Auto-Name Generation:** Generates snake_case name from label (NFD normalization, strip diacritics)
- **Expandable Config Panels:** Per-field tabs (General, Validation, Options)
- **Drag-and-Drop Reordering:** Visual reorder with grip handle
- **Layout Selector:** Table / Block / Row modes
- **Nested Field Configuration:** Recursive field type support
- **Duplicate Name Prevention:** Auto-appends counter if name conflicts

---

## 3. FieldTypeSelector (`src/components/admin/FieldTypeSelector.tsx`)

Dropdown selector for field types with categories and search.

### Props

```typescript
interface FieldTypeSelectorProps {
  value: string;                    // Current field type
  onChange: (type: string) => void; // Type change callback
  compact?: boolean;               // Compact mode (smaller dropdown)
}
```

### Categories
| Category | Types |
|----------|-------|
| Básicos | text, number, textarea, email |
| Conteúdo | wysiwyg, json |
| Seleção | select, boolean |
| Mídia | image, gallery, file |
| Visual | icon |
| Organização | tab, section |
| Estruturais | repeater, flexible_content |

### Features
- Search filtering across all types
- Smart dropdown positioning (opens up if not enough space below)
- Compact and full-width modes

---

## 4. IconPicker (`src/components/admin/IconPicker.tsx`)

Icon selection component with Lucide icons and custom SVG input.

### Props

```typescript
interface IconPickerProps {
  value: string;                              // Selected icon name
  onChange: (iconName: string) => void;       // Selection callback
  source?: 'lucide' | 'custom';              // Icon source
  onSourceChange?: (source: 'lucide' | 'custom') => void;
  customSvg?: string;                         // Custom SVG content
  onCustomSvgChange?: (svg: string) => void;  // SVG update callback
}
```

### Features
- **9 Icon Categories:** Arrows, Business, Communication, Design, Files, Interfaces, Media, Nature, Objects
- **Search Filtering:** Filter across all icons
- **Paginated Grid:** 100 icons per page with infinite scroll
- **Custom SVG Input:** Textarea for raw SVG with live preview
- **Source Toggle:** Switch between Lucide and Custom SVG

---

## 5. RichTextEditor (`src/components/admin/RichTextEditor.tsx`)

TipTap-based rich text editor with toolbar.

### Props

```typescript
interface RichTextEditorProps {
  value: string;                          // HTML content
  onChange: (content: string) => void;    // Content update callback
  readOnly?: boolean;                     // Disable editing
}
```

### Toolbar Buttons
| Button | Extension | Description |
|--------|-----------|-------------|
| Heading 1/2/3 | StarterKit | H1, H2, H3 headings |
| Paragraph | StarterKit | Paragraph block |
| Bold | StarterKit | Bold text |
| Italic | StarterKit | Italic text |
| Underline | Underline | Underlined text |
| Strikethrough | StarterKit | Strikethrough text |
| Highlight | Highlight | Highlighted text |
| Bullet List | StarterKit | Unordered list |
| Ordered List | StarterKit | Ordered list |
| Blockquote | StarterKit | Block quote |
| Link | Link | Hyperlink with custom popover (URL, target) |
| Image | Image + MediaPicker | Insert image with properties (width, alt, title, align) |
| Clear Formatting | — | Remove all marks from selection |
| Undo/Redo | StarterKit | History navigation |

### Features
- **Link Popover:** Custom dropdown with URL input, "Open in new tab" checkbox, Apply/Remove/Close buttons
- **Image Integration:** Uses MediaPicker for image selection with properties editor
- **Image Properties:** Width, Alt Text, Title, Alignment applied to inserted images
- **Clear Formatting:** Removes all marks (bold, italic, etc.) from selected text

### Styling
- Light theme with blue accent (`#2271b1`)
- Active button: blue background
- Toolbar hidden in readOnly mode

---

## 6. BlackLotusCMSSlot (`src/components/admin/BlackLotusCMSSlot.tsx`)

Plugin slot system for UI extensibility.

### Props

```typescript
interface BlackLotusCMSSlotProps {
  name: string;     // Slot identifier (e.g., "admin.header", "admin.sidebar.plugins")
  data?: any;       // Data passed to component functions
}
```

### Features
- Renders components registered via `HookService.registerComponent()`
- Supports function components (called with `data` prop)
- Supports JSX elements and nav item objects
- Each component wrapped in `PluginErrorBoundary` for isolation
- Adds `data-bl-plugin` attribute for identification

---

## 7. PluginSidebarNav (`src/components/admin/PluginSidebarNav.tsx`)

Renders plugin-registered navigation items in admin sidebar.

### Features
- Gets components from `HookService.getComponents('admin.sidebar.plugins')`
- Renders function components, nav item objects (as Link), or JSX directly
- No props required (reads from HookService)

---

## 8. MediaUpload (`src/components/admin/MediaUpload.tsx`)

Standalone media upload component with drag-and-drop.

### Features
- Drag-and-drop zone with visual feedback
- Multiple file upload support
- Progress indicator
- `router.refresh()` after completion

---

## 9. PluginImportButton (`src/components/admin/PluginImportButton.tsx`)

Button to import plugins from .zip files.

### Features
- File input for .zip files
- Calls `importPluginAction()` server action
- Toast notifications for success/error
- Loading state during import

---

## 10. MenuItemForm (`src/components/admin/MenuItemForm.tsx`)

Form to add items to a menu.

### Props

```typescript
interface MenuItemFormProps {
  menuId: string;
  onAdd: (formData: FormData) => Promise<any>;
}
```

### Features
- Toggle open/close
- Fields: label + URL
- Pending state during submission
- Toast notifications
- Form reset on success

---

## 11. MediaPickerInput (`src/components/admin/MediaPickerInput.tsx`)

Hidden input wrapper around MediaPicker for form submissions.

### Props

```typescript
interface MediaPickerInputProps {
  name: string;              // Input name for form
  defaultValue?: string;     // Initial value
}
```

### Features
- Maintains hidden `<input>` with selected media URL value
- Integrates with FormData submissions

---

## 12. ErrorBoundary (`src/components/admin/ErrorBoundary.tsx`)

React error boundary for admin UI.

### Props

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;  // Custom error UI
}
```

### Features
- Catches React rendering errors
- Logs errors via `logger`
- Displays error message with "Try again" button
- Custom fallback support

---

## 13. LoadingSpinner (`src/components/admin/LoadingSpinner.tsx`)

Loading indicator with optional text and fullscreen mode.

### Props

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';    // Default: 'md'
  text?: string;                  // Optional label
  fullScreen?: boolean;           // Overlay mode
}
```

### Sizes
- `sm`: 4x4 (16px)
- `md`: 8x8 (32px)
- `lg`: 12x12 (48px)

---

## 14. Skeleton / PageSkeleton / TableSkeleton

Loading skeleton primitives.

### Skeleton
- Base animated pulse block
- `TableSkeleton` named export with configurable rows/columns

### PageSkeleton
```typescript
interface PageSkeletonProps {
  title?: boolean;              // Show title skeleton
  description?: boolean;        // Show description skeleton
  content?: 'table' | 'form' | 'cards';  // Content layout
}
```

---

## 15. UserControl (`src/components/admin/UserControl.tsx`)

User profile display in sidebar with logout.

### Props

```typescript
interface UserControlProps {
  user: {
    id: string;
    email: string;
    roleName: string;
    image?: string;
  };
}
```

### Features
- Avatar (image or initial letter fallback)
- Email display
- Role name badge
- Profile link
- SignOut via next-auth

---

## 16. UserProfileImageEditor (`src/components/admin/UserProfileImageEditor.tsx`)

Profile image editor using MediaPicker.

### Props

```typescript
interface UserProfileImageEditorProps {
  initialImage: string | null;
  email: string;
}
```

### Features
- Circular avatar preview
- Camera hover overlay
- Fallback to ui-avatars.com
- Hidden input for form submission
