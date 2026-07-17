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
    const rawBaseUrl = ((await settingService.get('site_url')) as string) || 'http://localhost:3000';
    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    
    // Inclusion settings
    const includedPostTypes = await settingService.get('sitemap_post_types') as string[] || ['page', 'post'];
    const includedTaxonomies = await settingService.get('sitemap_taxonomies') as string[] || [];

    // Reading settings - handle static pages specially
    const readingSettings = await settingService.get('reading') as any || {};
    const frontPageId = readingSettings.page_on_front || null;
    const postsPageId = readingSettings.page_for_posts || null;

    // Fetch published posts (exclude front page and posts page from normal listing)
    const excludedPostIds: string[] = [];
    if (frontPageId) excludedPostIds.push(frontPageId);
    if (postsPageId) excludedPostIds.push(postsPageId);

    const posts = await this.db.post.findMany({
      where: {
        status: 'published',
        noIndex: false,
        postType: { slug: { in: includedPostTypes } },
        id: excludedPostIds.length > 0 ? { notIn: excludedPostIds } : undefined,
      },
      select: {
        id: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        postType: {
          select: { slug: true }
        }
      }
    });

    // Fetch front page and posts page separately to add with correct URLs
    const specialPages: { id: string; slug: string; createdAt: Date; updatedAt: Date; postType: { slug: string }; isFrontPage?: boolean; isPostsPage?: boolean }[] = [];
    
    if (frontPageId) {
      const frontPage = await this.db.post.findUnique({
        where: { id: frontPageId },
        select: {
          id: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
          status: true,
          noIndex: true,
          postType: { select: { slug: true } }
        }
      });
      if (frontPage && frontPage.status === 'published' && !frontPage.noIndex) {
        specialPages.push({ ...frontPage, isFrontPage: true });
      }
    }

    if (postsPageId) {
      const postsPage = await this.db.post.findUnique({
        where: { id: postsPageId },
        select: {
          id: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
          status: true,
          noIndex: true,
          postType: { select: { slug: true } }
        }
      });
      if (postsPage && postsPage.status === 'published' && !postsPage.noIndex) {
        specialPages.push({ ...postsPage, isPostsPage: true });
      }
    }

    // Fetch taxonomy terms if taxonomies are included
    let terms: { slug: string; name: string; taxonomy: { slug: string; postType: { slug: string } } }[] = [];
    if (includedTaxonomies.length > 0) {
      terms = await this.db.term.findMany({
        where: {
          taxonomy: {
            slug: { in: includedTaxonomies }
          },
          posts: { some: { post: { status: 'published', noIndex: false } } }
        },
        select: {
          slug: true,
          name: true,
          taxonomy: {
            select: {
              slug: true,
              postType: { select: { slug: true } }
            }
          }
        }
      });
    }

    // Generate special page URLs (front page and posts page)
    const specialUrls = specialPages.map(page => {
      let loc: string;
      if (page.isFrontPage) {
        loc = `${baseUrl}/`;
      } else if (page.isPostsPage) {
        loc = `${baseUrl}/${page.slug}`;
      } else {
        loc = `${baseUrl}/${page.slug}`;
      }
      
      return `
      <url>
        <loc>${loc}</loc>
        <lastmod>${page.updatedAt.toISOString()}</lastmod>
        <news:publication_date>${page.createdAt.toISOString()}</news:publication_date>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`;
    }).join('');

    // Generate regular post URLs
    const postUrls = posts.map(post => {
      const postTypeSlug = post.postType.slug;
      const loc = postTypeSlug === 'page' 
        ? `${baseUrl}/${post.slug}` 
        : `${baseUrl}/${postTypeSlug}/${post.slug}`;
      
      return `
      <url>
        <loc>${loc}</loc>
        <lastmod>${post.updatedAt.toISOString()}</lastmod>
        <news:publication_date>${post.createdAt.toISOString()}</news:publication_date>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`;
    }).join('');

    // Generate taxonomy term URLs
    const termUrls = terms.map(term => {
      const postTypeSlug = term.taxonomy.postType.slug;
      const taxonomySlug = term.taxonomy.slug;
      const loc = `${baseUrl}/${postTypeSlug}/${taxonomySlug}/${term.slug}`;
      
      return `
      <url>
        <loc>${loc}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.5</priority>
      </url>`;
    }).join('');

    const totalUrls = specialPages.length + posts.length + terms.length;
    this.log.debug(`Sitemap generated with ${totalUrls} URLs (${specialPages.length} special pages, ${posts.length} posts, ${terms.length} terms).`);

    return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
      ${specialUrls}
      ${postUrls}
      ${termUrls}
    </urlset>`;
  }

  // --- Static Proxy ---
  static async generateXML() { return sitemapService.generateXML(); }
}

export const sitemapService = new SitemapService();
