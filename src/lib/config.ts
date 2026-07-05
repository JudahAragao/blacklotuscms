import { z } from 'zod';
import { SecretsService } from './secrets';
import { logger } from './logger';

const rawSecrets = SecretsService.loadSync();

const secretsSchema = z.object({
  DATABASE_URL: z.string().url('Invalid or missing DATABASE_URL'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('Invalid NEXTAUTH_URL'),
  STORAGE_DRIVER: z.enum(['local', 's3', 'r2']).default('local'),
  UPLOAD_DIR: z.string().min(1, 'UPLOAD_DIR is required'),
  SANDBOX_MEMORY_LIMIT: z.preprocess((val) => Number(val), z.number().min(128).max(4096)).default(512),
  SANDBOX_TIMEOUT: z.preprocess((val) => Number(val), z.number().min(1).max(300)).default(30),
});

const parsed = secretsSchema.safeParse(rawSecrets);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  const errorMsg = Object.entries(errors)
    .map(([key, val]) => ` - ${key}: ${val}`)
    .join('\n');
  
  logger.error('Critical error in system Secrets:\n' + errorMsg);
}

// Helper to get fresh secrets
const getFreshConfig = () => {
  const rawSecrets = SecretsService.loadSync();
  const parsed = secretsSchema.safeParse(rawSecrets);
  return parsed.success ? parsed.data : (rawSecrets as any);
};

// Database
export const getDatabaseUrl = () => getFreshConfig().DATABASE_URL;

// NextAuth
export const getNextAuthSecret = () => getFreshConfig().NEXTAUTH_SECRET;
export const getNextAuthUrl = () => getFreshConfig().NEXTAUTH_URL;

// Storage
export const getStorageDriver = () => getFreshConfig().STORAGE_DRIVER;
export const getUploadDir = () => getFreshConfig().UPLOAD_DIR;

// Sandbox
export const getSandboxMemoryLimit = () => getFreshConfig().SANDBOX_MEMORY_LIMIT;
export const getSandboxTimeout = () => getFreshConfig().SANDBOX_TIMEOUT;

// Legacy constant exports for compatibility (will be updated on first load)
const initialConfig = getFreshConfig();
export const DATABASE_URL = initialConfig.DATABASE_URL;
export const NEXTAUTH_SECRET = initialConfig.NEXTAUTH_SECRET;
export const NEXTAUTH_URL = initialConfig.NEXTAUTH_URL;
export const STORAGE_DRIVER = initialConfig.STORAGE_DRIVER;
export const UPLOAD_DIR = initialConfig.UPLOAD_DIR;
export const SANDBOX_MEMORY_LIMIT = initialConfig.SANDBOX_MEMORY_LIMIT;
export const SANDBOX_TIMEOUT = initialConfig.SANDBOX_TIMEOUT;
