import { prisma, resetPrismaInstance } from '@/lib/prisma';
import { SecretsService, DockerSecrets } from '@/lib/secrets';
import { SettingService } from '@/core/services/SettingService';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { logger } from '@/lib/logger';

export interface InstallFormData {
  // Database
  useConnectionString: boolean;
  connectionString?: string;
  dbHost?: string;
  dbPort?: string;
  dbName?: string;
  dbUser?: string;
  dbPassword?: string;
  useSSL?: boolean;

  // System
  nextAuthUrl: string;
  storageDriver: 'local' | 's3' | 'r2';
  uploadDir: string;
  sandboxMemoryLimit: string;
  sandboxTimeout: string;

  // S3/R2 Config
  s3Endpoint?: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  s3Bucket?: string;
  s3PublicUrl?: string;

  // Admin
  adminEmail: string;
  adminPassword: string;
  adminConfirmPassword: string;
  adminRoleName: string;
}

export class InstallService {
  constructor(
    private readonly db = prisma,
    private readonly log = logger
  ) {}

  async isInstalled(): Promise<boolean> {
    return await SecretsService.isInstalled();
  }

  async validateForm(data: InstallFormData): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate database configuration
    if (data.useConnectionString) {
      if (!data.connectionString) errors.push('Connection string is required');
    } else {
      if (!data.dbHost) errors.push('Database host is required');
      if (!data.dbPort) errors.push('Database port is required');
      if (!data.dbName) errors.push('Database name is required');
      if (!data.dbUser) errors.push('Database user is required');
      if (!data.dbPassword) errors.push('Database password is required');
    }

    // Validate system configuration
    if (!data.nextAuthUrl) errors.push('System URL is required');
    if (!data.storageDriver) errors.push('Storage driver is required');
    if (!data.uploadDir) errors.push('Upload directory is required');

    // Validate cloud storage if selected
    if (data.storageDriver === 's3' || data.storageDriver === 'r2') {
      if (!data.s3Endpoint) errors.push('S3/R2 Endpoint is required');
      if (!data.s3AccessKeyId) errors.push('S3/R2 Access Key is required');
      if (!data.s3SecretAccessKey) errors.push('S3/R2 Secret Key is required');
      if (!data.s3Bucket) errors.push('S3/R2 Bucket is required');
    }

    // Validate admin credentials
    if (!data.adminEmail) errors.push('Admin email is required');
    if (!data.adminPassword) {
      errors.push('Admin password is required');
    } else if (data.adminPassword.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    if (data.adminPassword !== data.adminConfirmPassword) {
      errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  }

  async buildDatabaseUrl(data: InstallFormData): Promise<string> {
    if (data.useConnectionString && data.connectionString) {
      let url = data.connectionString;
      if (data.useSSL && !url.includes('sslmode=')) {
        url += (url.includes('?') ? '&' : '?') + 'sslmode=verify-full';
      }
      return url;
    }
    const { dbHost, dbPort, dbName, dbUser, dbPassword, useSSL } = data;
    const ssl = useSSL ? '?sslmode=verify-full' : '';
    return `postgresql://${encodeURIComponent(dbUser || '')}:${encodeURIComponent(dbPassword || '')}@${dbHost}:${dbPort}/${dbName}${ssl}`;
  }

  async generateNextAuthSecret(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
  }

  async completeInstallation(data: InstallFormData): Promise<void> {
    try {
      // 1. Build and Save Secrets
      const dbUrl = await this.buildDatabaseUrl(data);
      const nextAuthSecret = await this.generateNextAuthSecret();
      
      const secrets: DockerSecrets = {
        DATABASE_URL: dbUrl,
        NEXTAUTH_SECRET: nextAuthSecret,
        NEXTAUTH_URL: data.nextAuthUrl,
        STORAGE_DRIVER: data.storageDriver,
        UPLOAD_DIR: data.uploadDir,
        SANDBOX_MEMORY_LIMIT: data.sandboxMemoryLimit,
        SANDBOX_TIMEOUT: data.sandboxTimeout,
      };

      await SecretsService.save(secrets);

      // Apply database schema automatically
      try {
        this.log.info('Applying database schema...');
        execSync('npx prisma db push --accept-data-loss --schema=./prisma/schema.prisma', {
          env: { ...process.env, DATABASE_URL: dbUrl },
          stdio: 'inherit'
        });
      } catch (dbError) {
        this.log.error('Error applying database schema:', dbError);
        throw new Error('Failed to create database tables. Check credentials and permissions.');
      }

      // Reset prisma instance to ensure it uses the new DATABASE_URL
      resetPrismaInstance();

      // 2. Initialize Roles and Post Types
      const adminRoleId = await this.createDefaultRoles();
      await this.createDefaultPostTypes();

      // 3. Create admin user
      await this.createAdminUser(data, adminRoleId);

      // 4. Save Cloud Storage Settings to Database if applicable
      await SettingService.set('storage_driver', data.storageDriver);
      if (data.storageDriver !== 'local') {
        const s3Config = {
          endpoint: data.s3Endpoint,
          accessKeyId: data.s3AccessKeyId,
          secretAccessKey: data.s3SecretAccessKey,
          bucket: data.s3Bucket,
          publicUrl: data.s3PublicUrl,
        };
        await SettingService.set('s3_config', s3Config);
      }

      // 5. Finalize installation status
      await SecretsService.markAsInstalled();
    } catch (error) {
      this.log.error('Error completing installation:', error);
      throw error;
    }
  }

  async setupDatabase(databaseUrl: string): Promise<void> {
    try {
      const pg = await import('pg');
      const pool = new pg.default.Pool({ 
        connectionString: databaseUrl,
        connectionTimeoutMillis: 5000 
      });
      
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      await pool.end();
    } catch (error) {
      throw new Error(`Failed to connect to the database: ${error instanceof Error ? error.message : error}`);
    }
  }

  async createAdminUser(data: InstallFormData, roleId: string): Promise<void> {
    const passwordHash = await bcrypt.hash(data.adminPassword, 12);

    await this.db.user.create({
      data: {
        email: data.adminEmail,
        passwordHash,
        roleId,
      },
    });
  }

  async createDefaultRoles(): Promise<string> {
    const rolesConfig = [
      {
        name: 'Administrador',
        capabilities: {
          post: { create: true, read: true, update: true, delete: true, publish: true, manage: true },
          page: { create: true, read: true, update: true, delete: true, publish: true, manage: true },
          media: { create: true, read: true, update: true, delete: true, manage: true },
          comment: { create: true, read: true, update: true, delete: true, manage: true },
          user: { manage: true },
          theme: { manage: true, edit: true },
          plugin: { install: true, manage: true },
          setting: { manage: true }
        }
      },
      {
        name: 'Editor',
        capabilities: {
          post: { create: true, read: true, update: true, delete: true, publish: true, manage: true },
          page: { create: true, read: true, update: true, delete: true, publish: true, manage: true },
          media: { create: true, read: true, update: true, delete: true, manage: true },
          comment: { create: true, read: true, update: true, delete: true, manage: true }
        }
      },
      {
        name: 'Autor',
        capabilities: {
          post: { create: true, read: true, update: true, delete: true, publish: true, own: true },
          media: { create: true, read: true, update: true, delete: true, own: true }
        }
      },
      {
        name: 'Colaborador',
        capabilities: {
          post: { create: true, read: true, update: true, own: true }
        }
      },
      {
        name: 'Assinante',
        capabilities: {
          profile: { edit: true },
          content: { read: true }
        }
      }
    ];

    let adminRoleId = '';

    for (const config of rolesConfig) {
      const role = await this.db.role.upsert({
        where: { name: config.name },
        update: { capabilities: config.capabilities },
        create: {
          name: config.name,
          capabilities: config.capabilities
        }
      });
      if (config.name === 'Administrador') {
        adminRoleId = role.id;
      }
    }

    return adminRoleId;
  }

  async createDefaultPostTypes(): Promise<void> {
    const defaults = [
      { slug: 'post', label: 'Posts' },
      { slug: 'page', label: 'Pages', hierarchical: true },
    ];

    for (const pt of defaults) {
      await this.db.postType.upsert({
        where: { slug: pt.slug },
        update: {},
        create: pt,
      });
    }
  }

  // --- Static Proxy ---
  static async isInstalled() { return installService.isInstalled(); }
  static async validateForm(data: InstallFormData) { return installService.validateForm(data); }
  static async completeInstallation(data: InstallFormData) { return installService.completeInstallation(data); }
  static async setupDatabase(databaseUrl: string) { return installService.setupDatabase(databaseUrl); }
}

export const installService = new InstallService();
