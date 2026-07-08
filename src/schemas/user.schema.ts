import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleId: z.string().uuid('Invalid role ID'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  roleId: z.string().uuid('Invalid role ID').optional(),
  image: z.string().url('Invalid image URL').optional().nullable(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const UpdateRoleCapabilitiesSchema = z.object({
  capabilities: z.record(z.string(), z.any()),
});

export type UpdateRoleCapabilitiesInput = z.infer<typeof UpdateRoleCapabilitiesSchema>;
