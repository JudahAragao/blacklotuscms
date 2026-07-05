import { z } from 'zod';

export const CreatePostTypeSchema = z.object({
  slug: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "O slug deve conter apenas letras minúsculas, números e hífens."),
  label: z.string().min(2).max(100),
  hierarchical: z.boolean().default(false),
  showInRest: z.boolean().default(true),
  showInGraphql: z.boolean().default(true),
  supportsTitle: z.boolean().default(true),
  supportsEditor: z.boolean().default(true),
  supportsPermalink: z.boolean().default(true),
  supportsTaxonomies: z.boolean().default(true),
  settings: z.any().optional(),
});

export type CreatePostTypeInput = z.infer<typeof CreatePostTypeSchema>;

export const UpdatePostTypeSchema = CreatePostTypeSchema.partial();
export type UpdatePostTypeInput = z.infer<typeof UpdatePostTypeSchema>;
