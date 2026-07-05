import { prisma } from '@/lib/prisma';
import { CreatePostTypeSchema, CreatePostTypeInput, UpdatePostTypeInput } from '@/schemas/post-type.schema';
import { logger } from '@/lib/logger';
import { BlackLotusCMSError } from '@/lib/errors';
import { canPerformAction } from '@/lib/auth-utils';
import { unstable_cache, revalidateTag } from 'next/cache';
import { PostTypeDTO } from '@/types/dto';

export class PostTypeService {
  constructor(
    private readonly db = prisma,
    private readonly log = logger
  ) {}

  /**
   * Creates a new Custom Post Type (CPT).
   */
  async create(data: CreatePostTypeInput, user: any) {
    if (!canPerformAction(user, 'post.manage')) {
      throw new BlackLotusCMSError('No permission to create Post Types', 403, 'AUTH_FORBIDDEN');
    }

    const validatedData = CreatePostTypeSchema.parse(data);

    const existing = await this.db.postType.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      throw new BlackLotusCMSError(`The Post Type with slug '${validatedData.slug}' already exists.`, 400, 'VALIDATION_ERROR');
    }

    const pt = await this.db.postType.create({
      data: validatedData,
    });

    this.log.info(`New Post Type created: ${pt.label} (${pt.slug})`);
    revalidateTag('post-types');
    return pt;
  }

  /**
   * Returns all registered post types.
   */
  async listAll(): Promise<PostTypeDTO[]> {
    return unstable_cache(
      async () => {
        const postTypes = await this.db.postType.findMany({
          include: {
            _count: {
              select: { posts: true }
            }
          },
          orderBy: { label: 'asc' }
        });
        return postTypes as PostTypeDTO[];
      },
      ['post-types-list'],
      { tags: ['post-types'], revalidate: 3600 }
    )();
  }

  /**
   * Fetch a Post Type by slug, including field groups (ACF).
   */
  async findBySlug(slug: string) {
    return unstable_cache(
      async (s: string) => {
        return await this.db.postType.findUnique({
          where: { slug: s },
          include: {
            fieldGroups: {
              include: {
                fields: true
              }
            },
            taxonomies: true
          }
        });
      },
      [`post-type-${slug}`],
      { tags: ['post-types', `post-type-${slug}`], revalidate: 3600 }
    )(slug);
  }

  /**
   * Updates the settings of a Post Type.
   */
  async update(slug: string, data: UpdatePostTypeInput, user: any) {
    if (!canPerformAction(user, 'post.manage')) {
      throw new BlackLotusCMSError('No permission to update Post Types', 403, 'AUTH_FORBIDDEN');
    }

    const pt = await this.db.postType.update({
      where: { slug },
      data,
    });
    this.log.info(`Post Type updated: ${pt.slug}`);
    revalidateTag(`post-type-${slug}`);
    revalidateTag('post-types');
    return pt;
  }

  /**
   * Deletes a Post Type. 
   */
  async delete(slug: string, user: any) {
    if (!canPerformAction(user, 'post.manage')) {
      throw new BlackLotusCMSError('No permission to delete Post Types', 403, 'AUTH_FORBIDDEN');
    }

    const postsCount = await this.db.post.count({
      where: { postType: { slug } }
    });

    if (postsCount > 0) {
      throw new BlackLotusCMSError(`Cannot delete a Post Type that has ${postsCount} associated posts.`, 400, 'VALIDATION_ERROR');
    }

    const deleted = await this.db.postType.delete({
      where: { slug },
    });

    this.log.warn(`Post Type deleted: ${slug}`);
    revalidateTag(`post-type-${slug}`);
    revalidateTag('post-types');
    return deleted;
  }

  // --- Static Proxy ---
  static async create(data: any, user: any) { return postTypeService.create(data, user); }
  static async listAll() { return postTypeService.listAll(); }
  static async findBySlug(slug: string) { return postTypeService.findBySlug(slug); }
  static async update(slug: string, data: any, user: any) { return postTypeService.update(slug, data, user); }
  static async delete(slug: string, user: any) { return postTypeService.delete(slug, user); }
}

export const postTypeService = new PostTypeService();
