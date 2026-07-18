import { pluginService } from "@/core/services/PluginService";
import { SecretsService } from "./secrets";
import { logger } from "./logger";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

let initialized = false;

export async function initCMS() {
  if (initialized) return;

  if (!SecretsService.isConfigured()) {
    logger.warn('BlackLotusCMS: DATABASE_URL not configured. Set it in .env');
    return;
  }

  // NEXTAUTH_SECRET is required — fail if not set
  if (!process.env.NEXTAUTH_SECRET) {
    logger.error('BlackLotusCMS: NEXTAUTH_SECRET is not set. Generate one with: openssl rand -hex 32');
    throw new Error('NEXTAUTH_SECRET is required. Set it in .env');
  }

  // Auto-install: apply schema + create defaults if database is empty
  const userCount = await prisma.user.count().catch(() => 0);
  if (userCount === 0) {
    logger.info('BlackLotusCMS: Empty database detected, running auto-install...');
    await autoInstall();
  }

  logger.info('BlackLotusCMS: Starting Engine...');

  try {
    await pluginService.boot();
    initialized = true;
    logger.info('BlackLotusCMS: Ready.');
  } catch (error) {
    logger.error('Critical failure during initialization:', error);
  }
}

async function autoInstall() {
  try {
    // Schema should already be applied by deploy script (prisma db push).
    // Here we only seed default data.
    logger.info('Seeding default data...');

    // Create default roles
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
      const role = await prisma.role.upsert({
        where: { name: config.name },
        update: { capabilities: config.capabilities },
        create: { name: config.name, capabilities: config.capabilities }
      });
      if (config.name === 'Administrador') adminRoleId = role.id;
    }

    // Create default post types
    await prisma.postType.upsert({ where: { slug: 'post' }, update: {}, create: { slug: 'post', label: 'Posts' } });
    await prisma.postType.upsert({ where: { slug: 'page' }, update: {}, create: { slug: 'page', label: 'Pages', hierarchical: true } });

    // Create default taxonomies for 'post' type (like WordPress: Categories + Tags)
    const postType = await prisma.postType.findUnique({ where: { slug: 'post' } });
    if (postType) {
      await prisma.taxonomy.upsert({ where: { slug: 'category' }, update: {}, create: { slug: 'category', label: 'Categories', postTypeId: postType.id } });
      await prisma.taxonomy.upsert({ where: { slug: 'post_tag' }, update: {}, create: { slug: 'post_tag', label: 'Tags', postTypeId: postType.id } });
    }

    // Create admin user from env vars
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@blacklotuscms.com';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      logger.error('BlackLotusCMS: ADMIN_PASSWORD is not set. Set it in .env');
      throw new Error('ADMIN_PASSWORD is required for initial setup');
    }

    if (adminPassword === 'admin123' && process.env.NODE_ENV === 'production') {
      logger.error('BlackLotusCMS: ADMIN_PASSWORD cannot be "admin123" in production');
      throw new Error('ADMIN_PASSWORD must be changed from default in production');
    }

    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingUser) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await prisma.user.create({
        data: { email: adminEmail, passwordHash, roleId: adminRoleId }
      });
      logger.info(`Admin user created: ${adminEmail}`);
    }

    logger.info('Auto-install completed successfully.');
  } catch (error) {
    logger.error('Auto-install failed:', error);
  }
}
