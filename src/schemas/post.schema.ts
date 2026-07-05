import { z } from 'zod';

export const CreatePostSchema = z.object({
  postTypeId: z.string().uuid(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  content: z.string().optional().default(""),
  status: z.enum(['draft', 'published', 'private']).default('draft'),
  authorId: z.string().uuid(),
  publishedAt: z.preprocess((arg) => (arg === "" || arg === null ? null : typeof arg === "string" ? new Date(arg) : arg), z.date().optional().nullable()),
  expiresAt: z.preprocess((arg) => (arg === "" || arg === null ? null : typeof arg === "string" ? new Date(arg) : arg), z.date().optional().nullable()),
  // SEO
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  ogImage: z.string().optional(),
  noIndex: z.boolean().default(false),
  // Dicionário de metadados
  metaFields: z.record(z.string(), z.any()).optional().default({}),
  // Taxonomias (IDs dos termos)
  terms: z.array(z.string()).optional().default([]),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;

export const UpdatePostSchema = CreatePostSchema.partial();
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
