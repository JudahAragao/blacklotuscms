import { z } from 'zod';

export const PluginManifestSchema = z.object({
  name: z.string().min(1, 'Plugin name is required'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semver (x.y.z)'),
  description: z.string().optional(),
  author: z.string().optional(),
  entry: z.string().default('index.js'),
  permissions: z.array(z.string()).optional(),
});

export type PluginManifestInput = z.infer<typeof PluginManifestSchema>;

export const PluginPermissionSchema = z.object({
  requesterPlugin: z.string(),
  providerPlugin: z.string(),
  capability: z.string(),
  status: z.enum(['pending', 'approved', 'denied']),
});

export type PluginPermissionInput = z.infer<typeof PluginPermissionSchema>;
