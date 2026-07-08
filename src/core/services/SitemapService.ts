import { prisma } from '@/lib/prisma';
import { settingService } from './SettingService';
import { logger } from '@/lib/logger';

export class SitemapService {
  constructor(
    private readonly db = prisma,
    private readonly log = logger
  ) {}

  /**
   * Generates the complete Sitemap XML based on settings.
   */
  async generateXML(): Promise<string> {
    const baseUrl = (await settingService.get('site_url')) || 'http://localhost:3000';
    
    // Inclusion settings
    const includedPostTypes = await settingService.get('sitemap_post_types') as string[] || ['page', 'post'];

    const posts = await this.db.post.findMany({
      where: {
        status: 'published',
        noIndex: false,
        postType: { slug: { in: includedPostTypes } }
      },
      select: {
        slug: true,
        updatedAt: true,
      }
    });

    const urls = posts.map(post => `
      <url>
        <loc>${baseUrl}/${post.slug}</loc>
        <lastmod>${post.updatedAt.toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
    `).join('');

    this.log.debug(`Sitemap generated with ${posts.length} URLs.`);

    return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>`;
  }

  // --- Static Proxy ---
  static async generateXML() { return sitemapService.generateXML(); }
}

export const sitemapService = new SitemapService();
