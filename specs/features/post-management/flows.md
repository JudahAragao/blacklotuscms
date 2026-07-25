---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "post-management"
---

# Post Management Flows

## Create Post

1. **User fills out form**
   - Input: title, slug, content, status, metaFields, terms
   - State: Valid form

2. **System validates with Zod**
   - Valid: CreatePostSchema
   - State: Validated data

3. **Hook post.before_validate**
   - Transform: Data can be modified by plugins
   - State: Transformed data

4. **RBAC check**
   - Verify: canPerformAction(user, 'post.create')
   - State: Authorized

5. **Contributor draft lock**
   - If role = Contributor, status = 'draft'
   - State: Status adjusted

6. **Transaction: create post + metaValues + terms**
   - State: Post created in database

7. **Hook post.created + revalidateTag('posts')**
   - State: Cache invalidated, plugins notified

8. **Returns created post (201)**

## Edit Post

1. **System finds existing post**
   - State: Post found

2. **RBAC check with own verification**
   - Verify: canPerformAction(user, 'post.update', existingPost.authorId)
   - State: Authorized

3. **Zod validation + MetaFields validation**
   - State: Validated data

4. **Transaction: update post + upsert metaValues + replace terms**
   - State: Post updated

5. **Hook post.updated + revalidateTag**
   - State: Cache invalidated

## Delete Post

1. **RBAC check with own verification**
   - Verify: canPerformAction(user, 'post.delete', existingPost.authorId)

2. **Transaction: delete metaValues + postTerms + comments + post**
   - State: Post removed

3. **Hook post.deleted + revalidateTag**

## List Public Posts

1. **Theme calls PostService.getLeanPostsByType(slug)**
   - State: Query executed with filter status=published, publishedAt <= now, expiresAt >= now or null

2. **ThemeDataService.validate('db.read.post')**
   - State: Permission validated

3. **Cache via unstable_cache with tag 'posts'**
   - State: Data returned from cache or database
