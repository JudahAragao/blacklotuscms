import { describe, it, expect } from 'vitest';
import { CreatePostSchema, UpdatePostSchema } from './post.schema';
import { CreateCommentSchema } from './comment.schema';
import { CreateUserSchema, UpdateUserSchema } from './user.schema';

describe('CreatePostSchema', () => {
  const validPost = {
    postTypeId: '550e8400-e29b-41d4-a716-446655440000',
    title: 'My Post',
    slug: 'my-post',
    authorId: '550e8400-e29b-41d4-a716-446655440001',
  };

  it('should accept valid post data', () => {
    const result = CreatePostSchema.safeParse(validPost);
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const result = CreatePostSchema.safeParse({ ...validPost, title: '' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid slug format', () => {
    const result = CreatePostSchema.safeParse({ ...validPost, slug: 'Invalid Slug!' });
    expect(result.success).toBe(false);
  });

  it('should accept valid slug with hyphens', () => {
    const result = CreatePostSchema.safeParse({ ...validPost, slug: 'my-valid-slug-123' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID for postTypeId', () => {
    const result = CreatePostSchema.safeParse({ ...validPost, postTypeId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('should default status to draft', () => {
    const result = CreatePostSchema.safeParse(validPost);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe('draft');
  });

  it('should accept published status', () => {
    const result = CreatePostSchema.safeParse({ ...validPost, status: 'published' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = CreatePostSchema.safeParse({ ...validPost, status: 'archived' });
    expect(result.success).toBe(false);
  });

  it('should enforce seoTitle max 70 chars', () => {
    const result = CreatePostSchema.safeParse({ ...validPost, seoTitle: 'x'.repeat(71) });
    expect(result.success).toBe(false);
  });

  it('should enforce seoDescription max 160 chars', () => {
    const result = CreatePostSchema.safeParse({ ...validPost, seoDescription: 'x'.repeat(161) });
    expect(result.success).toBe(false);
  });

  it('should accept valid metaFields', () => {
    const result = CreatePostSchema.safeParse({ ...validPost, metaFields: { phone: '123' } });
    expect(result.success).toBe(true);
  });

  it('should accept valid terms array', () => {
    const result = CreatePostSchema.safeParse({ ...validPost, terms: ['term-1', 'term-2'] });
    expect(result.success).toBe(true);
  });
});

describe('UpdatePostSchema', () => {
  it('should accept partial updates', () => {
    const result = UpdatePostSchema.safeParse({ title: 'Updated Title' });
    expect(result.success).toBe(true);
  });

  it('should accept empty update', () => {
    const result = UpdatePostSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('CreateCommentSchema', () => {
  const validComment = {
    postId: '550e8400-e29b-41d4-a716-446655440000',
    author: 'John Doe',
    email: 'john@example.com',
    content: 'Great post!',
  };

  it('should accept valid comment', () => {
    const result = CreateCommentSchema.safeParse(validComment);
    expect(result.success).toBe(true);
  });

  it('should reject short author name', () => {
    const result = CreateCommentSchema.safeParse({ ...validComment, author: 'A' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = CreateCommentSchema.safeParse({ ...validComment, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('should reject empty content', () => {
    const result = CreateCommentSchema.safeParse({ ...validComment, content: '' });
    expect(result.success).toBe(false);
  });

  it('should reject content over 5000 chars', () => {
    const result = CreateCommentSchema.safeParse({ ...validComment, content: 'x'.repeat(5001) });
    expect(result.success).toBe(false);
  });

  it('should accept parentId', () => {
    const result = CreateCommentSchema.safeParse({
      ...validComment,
      parentId: '550e8400-e29b-41d4-a716-446655440002',
    });
    expect(result.success).toBe(true);
  });
});

describe('CreateUserSchema', () => {
  const validUser = {
    email: 'admin@example.com',
    password: 'secure123',
    roleId: '550e8400-e29b-41d4-a716-446655440000',
  };

  it('should accept valid user data', () => {
    const result = CreateUserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should reject short password', () => {
    const result = CreateUserSchema.safeParse({ ...validUser, password: '12345' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = CreateUserSchema.safeParse({ ...validUser, email: 'bad' });
    expect(result.success).toBe(false);
  });
});

describe('UpdateUserSchema', () => {
  it('should accept partial updates', () => {
    const result = UpdateUserSchema.safeParse({ email: 'new@example.com' });
    expect(result.success).toBe(true);
  });

  it('should accept empty update', () => {
    const result = UpdateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept nullable image', () => {
    const result = UpdateUserSchema.safeParse({ image: null });
    expect(result.success).toBe(true);
  });
});
