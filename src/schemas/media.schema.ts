import { z } from 'zod';

export const UploadMediaSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, 'Must be a File object'),
});

export type UploadMediaInput = z.infer<typeof UploadMediaSchema>;

export const MediaQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type MediaQueryInput = z.infer<typeof MediaQuerySchema>;
