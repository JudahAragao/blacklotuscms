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

// === Network & Webhook Schemas ===

export const PluginNetworkConfigSchema = z.object({
  allowedDomains: z.array(z.string()).default([]),
  httpRateLimit: z.number().min(1).max(100).default(20),
  webhookSecret: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type PluginNetworkConfigInput = z.infer<typeof PluginNetworkConfigSchema>;

export const HttpRequestBodySchema = z.object({
  url: z.string().url('Invalid URL'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
  timeout: z.number().min(1000).max(30000).optional(),
});

export type HttpRequestInput = z.infer<typeof HttpRequestBodySchema>;

export const WebhookPayloadSchema = z.object({
  eventId: z.string(),
  data: z.any(),
  signature: z.string().optional(),
  timestamp: z.string(),
  source: z.string(),
});

export type WebhookPayloadInput = z.infer<typeof WebhookPayloadSchema>;
