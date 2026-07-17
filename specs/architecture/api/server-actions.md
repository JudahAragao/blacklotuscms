---
spec_version: "1.0"
last_updated: "2026-07-17"
author: "BlackLotusCMS Team"
status: approved
---

# Server Actions Reference

## Overview

All admin operations use Next.js Server Actions (`'use server'`). Each action verifies the session via `getServerSession()`, delegates to the corresponding service, and revalidates relevant paths via `revalidatePath()`.

## Common Pattern

```typescript
export async function actionName(params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');
    await serviceMethod(params, session.user);
    revalidatePath('/admin/...');
    return { success: true };
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## 1. Comments (`src/app/actions/comments.ts`)

| Function | Parameters | Auth | Description |
|----------|-----------|------|-------------|
| `submitCommentAction(formData)` | postId, author, email, content, parentId? | Public | Creates a public comment. Revalidates catch-all page. |

**FormData fields:** `postId` (UUID), `author` (string), `email` (string), `content` (string), `parentId` (UUID, optional)

---

## 2. Plugin Management (`admin/plugins/actions.ts`)

| Function | Parameters | Auth | RBAC | Description |
|----------|-----------|------|------|-------------|
| `approvePermissionAction(permissionId)` | permissionId: string | Session | — | Approve a plugin permission request |
| `denyPermissionAction(permissionId)` | permissionId: string | Session | — | Deny a plugin permission request |
| `activatePluginAction(pluginId)` | pluginId: string | Session | `plugin.manage` | Activate a plugin (load into sandbox) |
| `deactivatePluginAction(pluginId)` | pluginId: string | Session | `plugin.manage` | Deactivate plugin (dispose sandbox + webhooks) |
| `importPluginAction(formData)` | pluginZip: File | Session | `plugin.manage` | Install plugin from .zip file |

**Revalidates:** `/admin/plugins`

---

## 3. Theme Management (`admin/themes/actions.ts`)

| Function | Parameters | Auth | RBAC | Description |
|----------|-----------|------|------|-------------|
| `approveThemePermissionAction(permissionId)` | permissionId: string | Session | `theme.manage` | Approve theme permission. Also revalidates `posts` tag. |
| `denyThemePermissionAction(permissionId)` | permissionId: string | Session | `theme.manage` | Deny theme permission. Also revalidates `posts` tag. |
| `setActiveThemeAction(themeName)` | themeName: string | Session | `theme.manage` | Set the active theme |

**Revalidates:** `/admin/themes`, `revalidateTag("posts", "max")` for permission actions

---

## 4. User Management (`admin/settings/users/actions.ts`)

| Function | Parameters | Auth | RBAC | Description |
|----------|-----------|------|------|-------------|
| `createUserAction(formData)` | email, password, roleId | Session | `user.manage` | Create a new user with bcrypt-hashed password |
| `updateUserAction(id, formData)` | id, email?, password?, roleId?, image?, currentPassword?, confirmPassword? | Session | `user.manage` or self | Update user. Self-password-change requires current password. Cannot demote last admin. |
| `deleteUserAction(id)` | id: string | Session | `user.manage` | Delete user (cannot delete self) |
| `updateRoleCapabilitiesAction(roleId, capabilities)` | roleId, capabilities object | Session | `user.manage` | Update role permission capabilities |

**Security rules:**
- Self-password-change requires `currentPassword` verification
- `password` must match `confirmPassword`
- Cannot change role of last Administrator
- Password hashed with bcrypt cost 12

**Revalidates:** `/admin/settings/users`, `/admin/settings/users/:id` (for self-edit)

---

## 5. API Key Management (`admin/settings/keys/actions.ts`)

| Function | Parameters | Auth | RBAC | Description |
|----------|-----------|------|------|-------------|
| `createApiKeyAction(formData)` | name, expiresDays?, rateLimit? | Session | — | Generate API key. Returns plain key (shown once). |
| `revokeApiKeyAction(id)` | id: string | Session | — | Delete an API key |
| `getApiKeysAction()` | — | Session | — | List user's API keys (never returns hash) |

**FormData fields:** `name` (string), `expiresDays` (number, 0 = no expiration), `rateLimit` (number, default 60)

**Returns:** `{ plainKey: string }` on create (plain key shown only once)

**Revalidates:** `/admin/settings/keys`

---

## 6. Post Type Management (`admin/settings/post-types/actions.ts`)

| Function | Parameters | Auth | RBAC | Description |
|----------|-----------|------|------|-------------|
| `createPostTypeAction(data)` | slug, label, hierarchical, supportsTitle, supportsEditor, supportsPermalink, supportsTaxonomies | Session | `post.manage` | Create a custom post type |
| `updatePostTypeAction(id, data)` | id, { label, icon } | Session | `post.manage` | Update post type settings (label, icon) |
| `deletePostTypeAction(slug)` | slug: string | Session | `post.manage` | Delete post type (blocked if posts exist) |

**Revalidates:** `/admin/settings/post-types`, `/admin/settings/post-types/[id]`, `/admin` (sidebar update)

---

## 7. Post Type Fields (`admin/settings/post-types/[id]/fields/actions.ts`)

| Function | Parameters | Auth | RBAC | Description |
|----------|-----------|------|------|-------------|
| `saveFieldsAction(postTypeId, data)` | postTypeId, { systemFields, customFields } | Session | `post.manage` | Update post type config + sync custom fields |
| `createFieldGroupAction(postTypeId, data)` | postTypeId, { title, fields } | Session | `post.manage` | Create a new field group for a post type |
| `deleteFieldGroupAction(id, postTypeId)` | id, postTypeId | Session | `post.manage` | Delete a field group |

**saveFieldsAction flow:**
1. Update PostType settings (label, hierarchical, supports*)
2. Find or create FieldGroup for this post type
3. Sync fields via `fieldService.syncFields()`

**Revalidates:** `/admin/settings/post-types/:id/fields`, `/admin/settings/post-types`, `/admin/settings/field-groups`, `/admin`

---

## 8. Field Groups (`admin/settings/field-groups/actions.ts`)

| Function | Parameters | Auth | RBAC | Description |
|----------|-----------|------|------|-------------|
| `listFieldGroupsAction()` | — | Session | — | List all field groups with locations and fields |
| `getFieldGroupAction(id)` | id: string | Session | — | Get a single field group |
| `createFieldGroupAction(data)` | { title, locations, fields } | Session | `post.manage` | Create a new field group |
| `updateFieldGroupAction(id, data)` | id, { title, locations } | Session | `post.manage` | Update field group title and locations |
| `syncFieldsAction(fieldGroupId, fieldData)` | fieldGroupId, Field[] | Session | `post.manage` | Synchronize field definitions (delete/upsert/create) |
| `deleteFieldGroupAction(id)` | id: string | Session | `post.manage` | Delete field group and its fields |
| `searchPostsAction(query, postTypeId?)` | query, postTypeId? | Session | — | Search posts by title/slug for location "post" type |

**Revalidates:** `/admin/settings/field-groups`, `/admin/settings/field-groups/:id`

---

## 9. Taxonomy Management (`admin/settings/taxonomy-types/actions.ts`)

| Function | Parameters | Auth | RBAC | Description |
|----------|-----------|------|------|-------------|
| `createTaxonomyAction(data)` | { label, slug, postTypeId } | Session | `post.manage` | Create a taxonomy type |
| `deleteTaxonomyAction(id)` | id: string | Session | `post.manage` | Delete a taxonomy |

**Revalidates:** `/admin/settings/taxonomy-types`

---

## 10. Term Management (`admin/settings/taxonomy-types/[id]/terms/actions.ts`)

| Function | Parameters | Auth | RBAC | Description |
|----------|-----------|------|------|-------------|
| `createTermAction(data)` | { name, slug, taxonomyId } | Session | `post.manage` | Create a term within a taxonomy |
| `deleteTermAction(id, taxonomyId)` | id, taxonomyId | Session | `post.manage` | Delete a term |

**Revalidates:** `/admin/settings/taxonomy-types/:taxonomyId/terms`

---

## Inline Server Actions

Several pages contain inline `'use server'` actions within the page component:

| Page | Actions | Description |
|------|---------|-------------|
| `admin/posts/new` | `savePostAction` | Create a new post |
| `admin/posts/[id]` | `savePostAction` | Update an existing post |
| `admin/media` | `deleteMedia` | Delete a media item |
| `admin/comments` | `updateStatus` | Update comment status (approve/spam/trash) |
| `admin/menus` | `createMenu`, `addItemToMenu`, `removeItemAction`, `deleteMenuAction` | Full menu CRUD |
| `admin/seo` | `updateSEO` | Update SEO settings |
| `admin/settings` | `updateSettings` | Update general settings |
| `admin/settings/reading` | `updateReadingSettings` | Update reading settings |

---

## Error Handling

All actions use one of two error patterns:

**Pattern 1 — handleApiError:**
```typescript
catch (error) {
  return handleApiError(error);  // Returns { error, code, status, details? }
}
```

**Pattern 2 — direct error:**
```typescript
catch (error: any) {
  return { error: error.message };
}
```

Both return structured error objects that the client-side displays via `toast.error()`.
