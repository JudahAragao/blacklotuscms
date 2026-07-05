import { z } from 'zod';

export const CreateTaxonomySchema = z.object({
  label: z.string().min(1, 'Label is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase and contain only letters, numbers, and hyphens'),
  postTypeId: z.string().uuid('Invalid Post Type ID'),
});

export const UpdateTaxonomySchema = CreateTaxonomySchema.partial();

export const CreateTermSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase and contain only letters, numbers, and hyphens'),
  taxonomyId: z.string().uuid('Invalid Taxonomy ID'),
});

export const UpdateTermSchema = CreateTermSchema.partial();

export type CreateTaxonomyInput = z.infer<typeof CreateTaxonomySchema>;
export type UpdateTaxonomyInput = z.infer<typeof UpdateTaxonomySchema>;
export type CreateTermInput = z.infer<typeof CreateTermSchema>;
export type UpdateTermInput = z.infer<typeof UpdateTermSchema>;
