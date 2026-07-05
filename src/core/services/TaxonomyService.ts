import { prisma } from '@/lib/prisma';
import { 
  CreateTaxonomySchema, 
  CreateTaxonomyInput, 
  CreateTermInput, 
  CreateTermSchema 
} from '@/schemas/taxonomy.schema';
import { logger } from '@/lib/logger';
import { revalidateTag, unstable_cache } from 'next/cache';
import { canPerformAction } from '@/lib/auth-utils';
import { BlackLotusCMSError } from '@/lib/errors';
import { TaxonomyDTO, TermDTO } from '@/types/dto';

export class TaxonomyService {
  constructor(
    private readonly db = prisma,
    private readonly log = logger
  ) {}

  async listAll(): Promise<TaxonomyDTO[]> {
    return unstable_cache(
      async () => {
        const taxonomies = await this.db.taxonomy.findMany({
          include: {
            postType: true,
            _count: { select: { terms: true } }
          },
          orderBy: { label: 'asc' }
        });
        return taxonomies as TaxonomyDTO[];
      },
      ['taxonomies-list'],
      { tags: ['taxonomies'], revalidate: 3600 }
    )();
  }

  async create(data: CreateTaxonomyInput, user: any) {
    if (!canPerformAction(user, 'post.manage')) {
      throw new BlackLotusCMSError('No permission to create taxonomies', 403, 'AUTH_FORBIDDEN');
    }

    const validated = CreateTaxonomySchema.parse(data);
    const existing = await this.db.taxonomy.findUnique({ where: { slug: validated.slug } });

    if (existing) throw new BlackLotusCMSError(`Taxonomy with slug '${validated.slug}' already exists.`, 400, 'VALIDATION_ERROR');

    const tax = await this.db.taxonomy.create({ data: validated });
    this.log.info(`Taxonomy created: ${tax.slug}`);
    revalidateTag('taxonomies');
    revalidateTag('posts'); // Taxonomy changes can affect listings
    return tax;
  }

  async getById(id: string): Promise<TaxonomyDTO | null> {
    return unstable_cache(
      async (id: string) => {
        const tax = await this.db.taxonomy.findUnique({
          where: { id },
          include: { 
            postType: true,
            terms: { orderBy: { name: 'asc' } }
          }
        });
        return tax as TaxonomyDTO | null;
      },
      [`taxonomy-${id}`],
      { tags: ['taxonomies', `taxonomy-${id}`], revalidate: 3600 }
    )(id);
  }

  async delete(id: string, user: any) {
    if (!canPerformAction(user, 'post.manage')) {
      throw new BlackLotusCMSError('No permission to delete taxonomies', 403, 'AUTH_FORBIDDEN');
    }

    const tax = await this.db.taxonomy.delete({ where: { id } });
    this.log.warn(`Taxonomy deleted: ${tax.slug}`);
    revalidateTag('taxonomies');
    revalidateTag(`taxonomy-${id}`);
    revalidateTag('posts');
    return tax;
  }

  /** --- TERMS --- **/

  async listTerms(taxonomyId: string): Promise<TermDTO[]> {
    return unstable_cache(
      async (tid: string) => {
        const terms = await this.db.term.findMany({
          where: { taxonomyId: tid },
          orderBy: { name: 'asc' }
        });
        return terms as TermDTO[];
      },
      [`taxonomy-terms-${taxonomyId}`],
      { tags: ['taxonomies', `taxonomy-${taxonomyId}-terms`], revalidate: 3600 }
    )(taxonomyId);
  }

  async createTerm(data: CreateTermInput, user: any) {
    if (!canPerformAction(user, 'post.manage')) {
      throw new BlackLotusCMSError('No permission to create terms', 403, 'AUTH_FORBIDDEN');
    }

    const validated = CreateTermSchema.parse(data);
    const existing = await this.db.term.findUnique({ where: { slug: validated.slug } });

    if (existing) throw new BlackLotusCMSError(`Term with slug '${validated.slug}' already exists.`, 400, 'VALIDATION_ERROR');

    const term = await this.db.term.create({ data: validated });
    this.log.info(`Term created: ${term.slug} in taxonomy ${term.taxonomyId}`);
    revalidateTag('taxonomies');
    revalidateTag(`taxonomy-${term.taxonomyId}-terms`);
    revalidateTag('posts');
    return term;
  }

  async deleteTerm(id: string, user: any) {
    if (!canPerformAction(user, 'post.manage')) {
      throw new BlackLotusCMSError('No permission to delete terms', 403, 'AUTH_FORBIDDEN');
    }

    const term = await this.db.term.delete({ where: { id } });
    this.log.warn(`Term deleted: ${term.slug}`);
    revalidateTag('taxonomies');
    revalidateTag(`taxonomy-${term.taxonomyId}-terms`);
    revalidateTag('posts');
    return term;
  }

  // --- Static Proxy ---
  static async listAll() { return taxonomyService.listAll(); }
  static async create(data: any, user: any) { return taxonomyService.create(data, user); }
  static async getById(id: string) { return taxonomyService.getById(id); }
  static async delete(id: string, user: any) { return taxonomyService.delete(id, user); }
  static async listTerms(taxId: string) { return taxonomyService.listTerms(taxId); }
  static async createTerm(data: any, user: any) { return taxonomyService.createTerm(data, user); }
  static async deleteTerm(id: string, user: any) { return taxonomyService.deleteTerm(id, user); }
}

export const taxonomyService = new TaxonomyService();
