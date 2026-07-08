import { PrismaClient } from '../prisma/generated/prisma';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is required');
  process.exit(1);
}

const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });

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

const postTypesConfig = [
  { slug: 'post', label: 'Posts' },
  { slug: 'page', label: 'Pages', hierarchical: true },
];

async function main() {
  // Skip if database already has users (already seeded)
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('✅ Database already seeded. Skipping.');
    return;
  }

  console.log('🌱 Seeding database...');

  // 1. Create roles
  console.log('📝 Creating roles...');
  let adminRoleId = '';
  for (const config of rolesConfig) {
    const role = await prisma.role.upsert({
      where: { name: config.name },
      update: { capabilities: config.capabilities },
      create: { name: config.name, capabilities: config.capabilities }
    });
    if (config.name === 'Administrador') adminRoleId = role.id;
    console.log(`  - ${config.name} OK`);
  }

  // 2. Create post types
  console.log('📄 Creating post types...');
  for (const pt of postTypesConfig) {
    await prisma.postType.upsert({
      where: { slug: pt.slug },
      update: { hierarchical: pt.hierarchical || false },
      create: pt,
    });
    console.log(`  - ${pt.label} OK`);
  }

  // 3. Create admin user from env vars
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@blacklotuscms.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  console.log(`👤 Creating admin user: ${adminEmail}`);
  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingUser) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: { email: adminEmail, passwordHash, roleId: adminRoleId }
    });
    console.log(`  - Admin user created: ${adminEmail}`);
  } else {
    console.log(`  - Admin user already exists: ${adminEmail}`);
  }

  console.log('✅ Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
