import { z } from 'zod';

export const SetThemeSchema = z.object({
  themeName: z.string().min(1, 'Theme name is required'),
});

export type SetThemeInput = z.infer<typeof SetThemeSchema>;

export const ThemeDataSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.any(),
});

export type ThemeDataInput = z.infer<typeof ThemeDataSchema>;

export const ThemePermissionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['approved', 'denied']),
});

export type ThemePermissionInput = z.infer<typeof ThemePermissionSchema>;
