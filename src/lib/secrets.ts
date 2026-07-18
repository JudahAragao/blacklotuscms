import 'dotenv/config';
import { existsSync } from 'fs';
import path from 'path';

export interface DockerSecrets {
  DATABASE_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  STORAGE_DRIVER: string;
  UPLOAD_DIR: string;
  SANDBOX_MEMORY_LIMIT: string;
  SANDBOX_TIMEOUT: string;
}

const isDocker = existsSync('/.dockerenv') || existsSync('/app');
const BASE_PATH = isDocker ? '/app' : process.cwd();

export class SecretsService {
  private static cachedSecrets: DockerSecrets | null = null;

  private static sanitizeDatabaseUrl(url: string): string {
    if (!url) return url;
    return url.replace('sslmode=require', 'sslmode=verify-full');
  }

  private static fromEnv(): DockerSecrets {
    return {
      DATABASE_URL: this.sanitizeDatabaseUrl(process.env.DATABASE_URL || ''),
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      STORAGE_DRIVER: process.env.STORAGE_DRIVER || 'local',
      UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(BASE_PATH, 'uploads'),
      SANDBOX_MEMORY_LIMIT: process.env.SANDBOX_MEMORY_LIMIT || '512',
      SANDBOX_TIMEOUT: process.env.SANDBOX_TIMEOUT || '30',
    };
  }

  static async load(): Promise<DockerSecrets> {
    if (this.cachedSecrets) return this.cachedSecrets;
    this.cachedSecrets = this.fromEnv();
    return this.cachedSecrets;
  }

  static loadSync(): DockerSecrets {
    if (this.cachedSecrets) return this.cachedSecrets;
    this.cachedSecrets = this.fromEnv();
    return this.cachedSecrets;
  }

  static isConfigured(): boolean {
    return !!process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0;
  }

  static async isInstalled(): Promise<boolean> {
    return this.isConfigured();
  }
}

export async function getDatabaseUrl(): Promise<string> {
  return process.env.DATABASE_URL || '';
}

export async function getNextAuthSecret(): Promise<string> {
  return process.env.NEXTAUTH_SECRET || '';
}

export async function getNextAuthUrl(): Promise<string> {
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}
