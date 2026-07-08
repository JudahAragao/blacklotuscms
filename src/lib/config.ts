import { z } from 'zod';
import { logger } from './logger';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('Invalid NEXTAUTH_URL').default('http://localhost:3000'),
  STORAGE_DRIVER: z.enum(['local', 's3', 'r2']).default('local'),
  UPLOAD_DIR: z.string().min(1, 'UPLOAD_DIR is required'),
  SANDBOX_MEMORY_LIMIT: z.preprocess((val) => Number(val), z.number().min(128).max(4096)).default(512),
  SANDBOX_TIMEOUT: z.preprocess((val) => Number(val), z.number().min(1).max(300)).default(30),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  const errorMsg = Object.entries(errors)
    .map(([key, val]) => ` - ${key}: ${val}`)
    .join('\n');

  logger.error('Critical error in environment config:\n' + errorMsg);
}

const getFreshConfig = () => {
  const parsed = envSchema.safeParse(process.env);
  return parsed.success ? parsed.data : (process.env as any);
};

export const getDatabaseUrl = () => getFreshConfig().DATABASE_URL;
export const getNextAuthSecret = () => getFreshConfig().NEXTAUTH_SECRET;
export const getNextAuthUrl = () => getFreshConfig().NEXTAUTH_URL;
export const getStorageDriver = () => getFreshConfig().STORAGE_DRIVER;
export const getUploadDir = () => getFreshConfig().UPLOAD_DIR;
export const getSandboxMemoryLimit = () => getFreshConfig().SANDBOX_MEMORY_LIMIT;
export const getSandboxTimeout = () => getFreshConfig().SANDBOX_TIMEOUT;

const initialConfig = getFreshConfig();
export const DATABASE_URL = initialConfig.DATABASE_URL;
export const NEXTAUTH_SECRET = initialConfig.NEXTAUTH_SECRET;
export const NEXTAUTH_URL = initialConfig.NEXTAUTH_URL;
export const STORAGE_DRIVER = initialConfig.STORAGE_DRIVER;
export const UPLOAD_DIR = initialConfig.UPLOAD_DIR;
export const SANDBOX_MEMORY_LIMIT = initialConfig.SANDBOX_MEMORY_LIMIT;
export const SANDBOX_TIMEOUT = initialConfig.SANDBOX_TIMEOUT;
