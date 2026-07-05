import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { canPerformAction } from '@/lib/auth-utils';
import { BlackLotusCMSError } from '@/lib/errors';

export class SettingService {
  constructor(
    private readonly db = prisma,
    private readonly log = logger
  ) {}

  async get(key: string) {
    const setting = await this.db.setting.findUnique({ where: { key } });
    return setting?.value;
  }

  async set(key: string, value: any, user: any) {
    if (!canPerformAction(user, 'setting.manage')) {
      throw new BlackLotusCMSError('No permission to modify settings', 403, 'AUTH_FORBIDDEN');
    }

    const setting = await this.db.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    this.log.info(`Setting updated: ${key}`);
    return setting;
  }

  async getAll() {
    const settings = await this.db.setting.findMany();
    return settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
  }

  // --- Static Proxy ---
  static async get(key: string) { return settingService.get(key); }
  static async set(key: string, value: any, user?: any) { return settingService.set(key, value, user); }
  static async getAll() { return settingService.getAll(); }
}

export const settingService = new SettingService();
