import fs from 'fs/promises';
import { readFileSync, readdirSync, existsSync } from 'fs';
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

// Paths based on environment (Docker vs Local)
const isDocker = existsSync('/.dockerenv') || existsSync('/app');
const BASE_PATH = isDocker ? '/app' : process.cwd();

export const SECRETS_FILE = path.join(BASE_PATH, '.secrets.json');
const INSTALLED_FLAG = path.join(BASE_PATH, '.installed');

export class SecretsService {
  private static cachedSecrets: DockerSecrets | null = null;

  private static sanitizeDatabaseUrl(url: string): string {
    if (!url) return url;
    // Silences pg security warning: treat 'require' as 'verify-full' explicitly
    return url.replace('sslmode=require', 'sslmode=verify-full');
  }

  static async load(): Promise<DockerSecrets> {
    if (this.cachedSecrets) return this.cachedSecrets;

    let secrets: Partial<DockerSecrets> = {};

    // Load from JSON file (local or persistent in Docker)
    try {
      const fileContent = await fs.readFile(SECRETS_FILE, 'utf-8');
      const jsonSecrets = JSON.parse(fileContent);
      secrets = { ...jsonSecrets };
    } catch (e) {}

    // Final construction with safe fallbacks
    const finalSecrets: DockerSecrets = {
      DATABASE_URL: this.sanitizeDatabaseUrl(secrets.DATABASE_URL || ''),
      NEXTAUTH_SECRET: secrets.NEXTAUTH_SECRET || '',
      NEXTAUTH_URL: secrets.NEXTAUTH_URL || 'http://localhost:3000',
      STORAGE_DRIVER: secrets.STORAGE_DRIVER || 'local',
      UPLOAD_DIR: secrets.UPLOAD_DIR || path.join(BASE_PATH, 'uploads'),
      SANDBOX_MEMORY_LIMIT: secrets.SANDBOX_MEMORY_LIMIT || '512',
      SANDBOX_TIMEOUT: secrets.SANDBOX_TIMEOUT || '30',
    };

    // Global Side Effect: Ensure environment variables are set for libraries like NextAuth
    if (finalSecrets.NEXTAUTH_URL) process.env.NEXTAUTH_URL = finalSecrets.NEXTAUTH_URL;
    if (finalSecrets.NEXTAUTH_SECRET) process.env.NEXTAUTH_SECRET = finalSecrets.NEXTAUTH_SECRET;
    if (finalSecrets.DATABASE_URL) process.env.DATABASE_URL = finalSecrets.DATABASE_URL;

    this.cachedSecrets = finalSecrets;
    return finalSecrets;
  }

  static loadSync(): DockerSecrets {
    if (this.cachedSecrets) return this.cachedSecrets;

    let secrets: Partial<DockerSecrets> = {};

    try {
      const fileContent = readFileSync(SECRETS_FILE, 'utf-8');
      const jsonSecrets = JSON.parse(fileContent);
      secrets = { ...jsonSecrets };
    } catch (e) {}
    
    const finalSecrets: DockerSecrets = {
      DATABASE_URL: this.sanitizeDatabaseUrl(secrets.DATABASE_URL || ''),
      NEXTAUTH_SECRET: secrets.NEXTAUTH_SECRET || '',
      NEXTAUTH_URL: secrets.NEXTAUTH_URL || 'http://localhost:3000',
      STORAGE_DRIVER: secrets.STORAGE_DRIVER || 'local',
      UPLOAD_DIR: secrets.UPLOAD_DIR || path.join(BASE_PATH, 'uploads'),
      SANDBOX_MEMORY_LIMIT: secrets.SANDBOX_MEMORY_LIMIT || '512',
      SANDBOX_TIMEOUT: secrets.SANDBOX_TIMEOUT || '30',
    };

    // Global Side Effect
    if (finalSecrets.NEXTAUTH_URL) process.env.NEXTAUTH_URL = finalSecrets.NEXTAUTH_URL;
    if (finalSecrets.NEXTAUTH_SECRET) process.env.NEXTAUTH_SECRET = finalSecrets.NEXTAUTH_SECRET;
    if (finalSecrets.DATABASE_URL) process.env.DATABASE_URL = finalSecrets.DATABASE_URL;

    this.cachedSecrets = finalSecrets;
    return finalSecrets;
  }

  static async save(secrets: DockerSecrets): Promise<void> {
    await fs.writeFile(SECRETS_FILE, JSON.stringify(secrets, null, 2));
    this.cachedSecrets = secrets;
  }

  static async isInstalled(): Promise<boolean> {
    try {
      // 1. The definitive criterion for completed installation is the .installed file
      if (existsSync(INSTALLED_FLAG)) return true;
      
      // 2. If no .installed, we check if the .secrets.json file exists and has content
      // This ignores placeholders from the /secrets/ folder that are loaded via fallback
      if (existsSync(SECRETS_FILE)) {
        const fileContent = await fs.readFile(SECRETS_FILE, 'utf-8');
        const jsonSecrets = JSON.parse(fileContent);
        return !!jsonSecrets.DATABASE_URL && !jsonSecrets.DATABASE_URL.includes('localhost:5432/blacklotuscms');
      }
      
      return false;
    } catch {
      return false;
    }
  }

  static async markAsInstalled(): Promise<void> {
    await fs.writeFile(INSTALLED_FLAG, 'installed');
  }
}

export async function getDatabaseUrl(): Promise<string> {
  const secrets = await SecretsService.load();
  return secrets.DATABASE_URL;
}

export async function getNextAuthSecret(): Promise<string> {
  const secrets = await SecretsService.load();
  return secrets.NEXTAUTH_SECRET;
}

export async function getNextAuthUrl(): Promise<string> {
  const secrets = await SecretsService.load();
  return secrets.NEXTAUTH_URL;
}
