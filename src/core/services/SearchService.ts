import { prisma } from '@/lib/prisma';
import { postService } from './PostService';
import { logger } from '@/lib/logger';

export class SearchService {
  constructor(
    private readonly db = prisma,
    private readonly log = logger
  ) {}

  /**
   * Performs search in Titles, Content, and MetaFields (Custom Fields).
   */
  async globalSearch(query: string, limit: number = 20) {
    if (!query || query.length < 3) return [];

    const posts = await this.db.post.findMany({
      where: {
        status: 'published',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { 
            metaValues: { 
              some: { 
                value: { path: [], array_contains: query } 
              } 
            } 
          }
        ]
      },
      include: {
        postType: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    this.log.debug(`Global search executed: "${query}"`, { results: posts.length });
    return posts.map(post => postService.mapToThemeDTO(post));
  }

  // --- Static Proxy ---
  static async globalSearch(q: string, l?: number) { return searchService.globalSearch(q, l); }
}

export const searchService = new SearchService();
