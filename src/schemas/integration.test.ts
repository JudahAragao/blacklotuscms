import { describe, it, expect } from 'vitest';
import { CreatePostSchema, UpdatePostSchema } from './post.schema';
import { CreateCommentSchema } from './comment.schema';
import { CreateUserSchema, UpdateUserSchema, UpdateRoleCapabilitiesSchema } from './user.schema';
import { MediaQuerySchema } from './media.schema';
import { CreateTaxonomySchema } from './taxonomy.schema';

describe('Schema Integration — Cross-schema validation', () => {
  describe('Post + Comment flow', () => {
    it('should validate a post creation then a comment on that post', () => {
      const postResult = CreatePostSchema.safeParse({
        postTypeId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Integration Test Post',
        slug: 'integration-test-post',
        authorId: '550e8400-e29b-41d4-a716-446655440001',
      });
      expect(postResult.success).toBe(true);

      if (postResult.success) {
        const commentResult = CreateCommentSchema.safeParse({
          postId: postResult.data.postTypeId,
          author: 'Test User',
          email: 'test@example.com',
          content: 'Great integration test!',
        });
        expect(commentResult.success).toBe(true);
      }
    });
  });

  describe('User creation + Post ownership', () => {
    it('should validate user then post with that user as author', () => {
      const userResult = CreateUserSchema.safeParse({
        email: 'author@test.com',
        password: 'secure123',
        roleId: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(userResult.success).toBe(true);

      // Post schema requires authorId as UUID
      const postResult = CreatePostSchema.safeParse({
        postTypeId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'My Post',
        slug: 'my-post',
        authorId: '550e8400-e29b-41d4-a716-446655440002',
      });
      expect(postResult.success).toBe(true);
    });
  });

  describe('Role capabilities update', () => {
    it('should validate capability JSON structure', () => {
      const result = UpdateRoleCapabilitiesSchema.safeParse({
        capabilities: {
          post: { create: true, read: true, update: true, delete: false },
          media: { upload: true },
          plugin: { install: false },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-object capabilities', () => {
      const result = UpdateRoleCapabilitiesSchema.safeParse({
        capabilities: 'not-an-object',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Media query validation', () => {
    it('should validate media query with pagination', () => {
      const result = MediaQuerySchema.safeParse({ page: 1, limit: 20 });
      expect(result.success).toBe(true);
    });

    it('should reject limit over 100', () => {
      const result = MediaQuerySchema.safeParse({ page: 1, limit: 101 });
      expect(result.success).toBe(false);
    });
  });

  describe('Taxonomy validation', () => {
    it('should validate taxonomy with postType link', () => {
      const result = CreateTaxonomySchema.safeParse({
        slug: 'categories',
        label: 'Categories',
        postTypeId: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should reject post with slug containing uppercase', () => {
      const result = CreatePostSchema.safeParse({
        postTypeId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        slug: 'Invalid-Slug',
        authorId: '550e8400-e29b-41d4-a716-446655440001',
      });
      expect(result.success).toBe(false);
    });

    it('should reject comment with content over 5000 chars', () => {
      const result = CreateCommentSchema.safeParse({
        postId: '550e8400-e29b-41d4-a716-446655440000',
        author: 'Test',
        email: 'test@test.com',
        content: 'x'.repeat(5001),
      });
      expect(result.success).toBe(false);
    });

    it('should accept post with all optional fields', () => {
      const result = CreatePostSchema.safeParse({
        postTypeId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Full Post',
        slug: 'full-post',
        content: 'Content here',
        status: 'published',
        authorId: '550e8400-e29b-41d4-a716-446655440001',
        seoTitle: 'SEO Title',
        seoDescription: 'SEO Description',
        ogImage: '/uploads/og.webp',
        noIndex: false,
        metaFields: { phone: '123', address: 'Street 123' },
        terms: ['term-1', 'term-2'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept update with partial fields', () => {
      const result = UpdatePostSchema.safeParse({
        title: 'Updated Title',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty update', () => {
      const result = UpdatePostSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
