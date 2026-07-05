import { prisma } from '@/lib/prisma';
import { CreatePostSchema, CreatePostInput, UpdatePostInput, UpdatePostSchema } from '@/schemas/post.schema';
import { HookService } from './HookService';
import { ThemeDataService } from './ThemeDataService';
import { FieldService } from './FieldService';
import { BlackLotusCMSError } from '@/lib/errors';
import { canPerformAction } from '@/lib/auth-utils';
import { logger } from '@/lib/logger';
import { unstable_cache, revalidateTag } from 'next/cache';
import { ThemePostDTO } from '@/types/dto';
import { flattenMetadata } from '@/lib/field-utils';

export class PostService {
  constructor(
    private readonly db = prisma,
    private readonly log = logger
  ) {}

  /**
   * Maps a Prisma object to the simplified Theme DTO.
   */
  mapToThemeDTO(post: any): ThemePostDTO {
    const dto: ThemePostDTO = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      status: post.status,
      publishedAt: post.publishedAt,
      postType: {
        id: post.postType.id,
        name: post.postType.label,
        slug: post.postType.slug,
      },
      seo: {
        title: post.seoTitle,
        description: post.seoDescription,
        ogImage: post.ogImage,
        noIndex: post.noIndex || false,
      }
    };

    if (post.metaValues) {
      dto.meta = flattenMetadata(post.metaValues);
    }

    return dto;
  }

  /**
   * Creates a post and saves its custom field values (MetaFields).
   */
  async create(data: CreatePostInput, user: any) {
    if (!canPerformAction(user, 'post.create')) {
      throw new BlackLotusCMSError('No permission to create posts', 403, 'AUTH_FORBIDDEN');
    }

    if (user.role.name === 'Contributor') {
      data.status = 'draft';
    }

    let input = await HookService.applyFilters('post.before_validate', data);
    const validated = CreatePostSchema.parse(input);

    if (validated.metaFields) {
      await FieldService.validateMetaFields(validated.postTypeId, validated.metaFields);
    }

    return await this.db.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          postTypeId: validated.postTypeId,
          title: validated.title,
          slug: validated.slug,
          content: validated.content,
          status: validated.status,
          authorId: validated.authorId,
          publishedAt: validated.publishedAt || (validated.status === 'published' ? new Date() : null),
          expiresAt: validated.expiresAt,
          seoTitle: validated.seoTitle,
          seoDescription: validated.seoDescription,
          ogImage: validated.ogImage,
          noIndex: validated.noIndex,
        }
      });

      if (validated.metaFields && Object.keys(validated.metaFields).length > 0) {
        const metaEntries = Object.entries(validated.metaFields).map(([fieldId, value]) => ({
          postId: post.id,
          fieldId,
          value: value as any,
        }));

        await tx.metaValue.createMany({
          data: metaEntries
        });
      }

      if (validated.terms && validated.terms.length > 0) {
        const termEntries = validated.terms.map(termId => ({
          postId: post.id,
          termId,
        }));
        await tx.postTerm.createMany({
          data: termEntries
        });
      }

      this.log.info(`Post created: ${post.slug}`, { id: post.id, authorId: post.authorId });
      revalidateTag('posts');
      await HookService.doAction('post.created', post);

      return post;
    });
  }

  async getLeanPostBySlug(slug: string): Promise<ThemePostDTO | null> {
    return unstable_cache(
      async (s: string) => {
        await ThemeDataService.validate('db.read.post');
        const now = new Date();
        const post = await this.db.post.findUnique({
          where: { 
            slug: s,
            status: 'published',
            publishedAt: { lte: now },
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } }
            ]
          },
          include: {
            postType: true,
          }
        });

        if (!post) return null;
        return this.mapToThemeDTO(post);
      },
      [`post-slug-${slug}`],
      { tags: ['posts', `post-${slug}`], revalidate: 3600 }
    )(slug);
  }

  async getLeanPostById(id: string): Promise<ThemePostDTO | null> {
    return unstable_cache(
      async (postId: string) => {
        await ThemeDataService.validate('db.read.post');
        const post = await this.db.post.findUnique({
          where: { id: postId, status: 'published' },
          include: {
            postType: true,
          }
        });

        if (!post) return null;
        return this.mapToThemeDTO(post);
      },
      [`post-id-${id}`],
      { tags: ['posts', `post-id-${id}`], revalidate: 3600 }
    )(id);
  }

  async getLeanPostsByType(postTypeSlug: string, limit: number = 10) {
    return unstable_cache(
      async (slug: string, l: number) => {
        await ThemeDataService.validate('db.read.post');
        const now = new Date();
        const posts = await this.db.post.findMany({
          where: { 
            postType: { slug },
            status: 'published',
            publishedAt: { lte: now },
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } }
            ]
          },
          take: l,
          orderBy: { createdAt: 'desc' },
          include: {
            postType: true,
          }
        });

        return posts.map(post => this.mapToThemeDTO(post));
      },
      [`posts-type-${postTypeSlug}-${limit}`],
      { tags: ['posts', `type-${postTypeSlug}`], revalidate: 3600 }
    )(postTypeSlug, limit);
  }

  async getLeanPostsByTerm(termSlug: string, limit: number = 10) {
    return unstable_cache(
      async (slug: string, l: number) => {
        await ThemeDataService.validate('db.read.post');
        const now = new Date();
        const posts = await this.db.post.findMany({
          where: { 
            terms: {
              some: {
                term: { slug }
              }
            },
            status: 'published',
            publishedAt: { lte: now },
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } }
            ]
          },
          take: l,
          orderBy: { createdAt: 'desc' },
          include: {
            postType: true,
            metaValues: { include: { field: true } },
          }
        });

        return posts.map(post => this.mapToThemeDTO(post));
      },
      [`posts-term-${termSlug}-${limit}`],
      { tags: ['posts', `term-${termSlug}`], revalidate: 3600 }
    )(termSlug, limit);
  }

  async getPostMeta(postId: string) {
    await ThemeDataService.validate('db.read.post');
    const metaValues = await this.db.metaValue.findMany({
      where: { postId },
      include: { field: true }
    });

    return flattenMetadata(metaValues);
  }

  async getById(id: string) {
    const post = await this.db.post.findUnique({
      where: { id },
      include: {
        postType: true,
        author: { select: { id: true, email: true } },
        metaValues: { include: { field: true } },
        terms: { include: { term: true } }
      }
    });

    if (!post) {
      throw new BlackLotusCMSError('Post not found', 404, 'RESOURCE_NOT_FOUND');
    }

    return post;
  }

  async update(id: string, data: UpdatePostInput, user: any) {
    const existingPost = await this.getById(id);
    if (!canPerformAction(user, 'post.update', existingPost.authorId)) {
      throw new BlackLotusCMSError('No permission to edit this post', 403, 'AUTH_FORBIDDEN');
    }

    const validated = UpdatePostSchema.parse(data);

    if (validated.metaFields) {
      await FieldService.validateMetaFields(existingPost.postTypeId, validated.metaFields);
    }

    return await this.db.$transaction(async (tx) => {
      const post = await tx.post.update({
        where: { id },
        data: {
          title: validated.title,
          slug: validated.slug,
          content: validated.content,
          status: validated.status,
          publishedAt: validated.publishedAt,
          expiresAt: validated.expiresAt,
          seoTitle: validated.seoTitle,
          seoDescription: validated.seoDescription,
          ogImage: validated.ogImage,
          noIndex: validated.noIndex,
        }
      });

      if (validated.metaFields) {
        for (const [fieldId, value] of Object.entries(validated.metaFields)) {
          await tx.metaValue.upsert({
            where: {
              id: (await tx.metaValue.findFirst({ where: { postId: id, fieldId } }))?.id || 'new-id',
            },
            update: { value: value as any },
            create: { postId: id, fieldId, value: value as any }
          });
        }
      }

      if (validated.terms) {
        await tx.postTerm.deleteMany({ where: { postId: id } });
        if (validated.terms.length > 0) {
          const termEntries = validated.terms.map(termId => ({
            postId: id,
            termId,
          }));
          await tx.postTerm.createMany({ data: termEntries });
        }
      }

      this.log.info(`Post atualizado: ${post.slug}`, { id: post.id });
      revalidateTag('posts');
      revalidateTag(`post-${post.slug}`);
      await HookService.doAction('post.updated', post);
      return post;
    });
  }

  async delete(id: string, user: any) {
    const existingPost = await this.getById(id);
    if (!canPerformAction(user, 'post.delete', existingPost.authorId)) {
      throw new BlackLotusCMSError('No permission to delete this post', 403, 'AUTH_FORBIDDEN');
    }

    return await this.db.$transaction(async (tx) => {
      await tx.metaValue.deleteMany({ where: { postId: id } });
      await tx.postTerm.deleteMany({ where: { postId: id } });
      await tx.comment.deleteMany({ where: { postId: id } });
      
      const post = await tx.post.delete({ where: { id } });

      this.log.warn(`Post deleted: ${post.slug}`, { id: post.id });
      revalidateTag('posts');
      revalidateTag(`post-${post.slug}`);
      await HookService.doAction('post.deleted', post);
      return post;
    });
  }

  // --- Static Proxy Methods (Compatibility Layer) ---
  static mapToThemeDTO(post: any) { return postService.mapToThemeDTO(post); }
  static async create(data: any, user: any) { return postService.create(data, user); }
  static async getLeanPostBySlug(slug: string) { return postService.getLeanPostBySlug(slug); }
  static async getLeanPostsByType(type: string, limit?: number) { return postService.getLeanPostsByType(type, limit); }
  static async getLeanPostsByTerm(term: string, limit?: number) { return postService.getLeanPostsByTerm(term, limit); }
  static async getPostMeta(postId: string) { return postService.getPostMeta(postId); }
  static async getById(id: string) { return postService.getById(id); }
  static async update(id: string, data: any, user: any) { return postService.update(id, data, user); }
  static async delete(id: string, user: any) { return postService.delete(id, user); }
}

export const postService = new PostService();
