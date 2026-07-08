import { prisma } from "@/lib/prisma";
import { getActiveThemeName } from "@/lib/theme-context";
import { logger } from "@/lib/logger";
import { BlackLotusCMSError } from "@/lib/errors";
import { canPerformAction } from "@/lib/auth-utils";

const PERMISSION_CACHE_TTL = 10_000; // 10 seconds

interface CacheEntry {
  status: string;
  expiresAt: number;
}

export class ThemeDataService {
  private permissionCache = new Map<string, CacheEntry>();

  constructor(
    private readonly db = prisma,
    private readonly log = logger
  ) {}

  private getCachedPermission(key: string): string | null {
    const entry = this.permissionCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.permissionCache.delete(key);
      return null;
    }
    return entry.status;
  }

  private setCachedPermission(key: string, status: string): void {
    this.permissionCache.set(key, {
      status,
      expiresAt: Date.now() + PERMISSION_CACHE_TTL,
    });
  }

  private clearPermissionCache(themeName: string): void {
    for (const key of this.permissionCache.keys()) {
      if (key.startsWith(`${themeName}:`)) {
        this.permissionCache.delete(key);
      }
    }
  }

  /**
   * Saves settings for a specific theme (used by the Admin).
   */
  async setForTheme(themeName: string, key: string, value: any, user: any) {
    if (!canPerformAction(user, 'theme.manage')) {
      throw new BlackLotusCMSError('No permission to manage themes', 403, 'AUTH_FORBIDDEN');
    }

    return this.db.themeData.upsert({
      where: { themeName_key: { themeName, key } },
      update: { value },
      create: { themeName, key, value },
    });
  }

  /**
   * Saves theme-exclusive settings.
   */
  async set(key: string, value: any) {
    const themeName = getActiveThemeName();
    if (!themeName) throw new BlackLotusCMSError("Storage operation allowed only within a theme.", 403, 'AUTH_FORBIDDEN');

    return this.db.themeData.upsert({
      where: { themeName_key: { themeName, key } },
      update: { value },
      create: { themeName, key, value },
    });
  }

  /**
   * Retrieves theme settings.
   */
  async get(key: string) {
    const themeName = getActiveThemeName();
    if (!themeName) return null;

    const data = await this.db.themeData.findUnique({
      where: { themeName_key: { themeName, key } },
    });
    return data?.value || null;
  }

  /**
   * Retrieves all settings for a theme.
   */
  async listAll(themeName: string) {
    return this.db.themeData.findMany({
      where: { themeName },
      orderBy: { key: 'asc' }
    });
  }

  /**
   * Requests permission for the theme to access system features.
   */
  async requestPermission(capability: string, themeNameOverride?: string) {
    let themeName = themeNameOverride || getActiveThemeName();
    
    if (!themeName) {
      const { themeService } = await import('./ThemeService');
      themeName = await themeService.getActiveTheme();
    }

    if (!themeName) throw new BlackLotusCMSError("Permission request allowed only within a theme.", 403, 'AUTH_FORBIDDEN');

    return this.db.themePermission.upsert({
      where: {
        requesterTheme_providerName_capability: {
          requesterTheme: themeName,
          providerName: 'system',
          capability,
        },
      },
      update: {},
      create: {
        requesterTheme: themeName,
        providerName: 'system',
        capability,
        status: "pending",
      },
    });
  }

  /**
   * Validates if the theme has permission to perform an action.
   */
  async validate(capability: string, themeNameOverride?: string) {
    let themeName = themeNameOverride || getActiveThemeName();

    if (!themeName) {
      const { themeService } = await import('./ThemeService');
      themeName = await themeService.getActiveTheme();
    }

    if (!themeName) return true;

    const cacheKey = `${themeName}:${capability}`;
    const cachedStatus = this.getCachedPermission(cacheKey);

    if (cachedStatus) {
      if (cachedStatus === 'approved') return true;
      await this.requestPermission(capability, themeName);
      throw new BlackLotusCMSError(`[Segurança de Tema] Theme '${themeName}' does not have approved permission for '${capability}'.`, 403, 'AUTH_FORBIDDEN');
    }

    const permission = await this.db.themePermission.findUnique({
      where: {
        requesterTheme_providerName_capability: {
          requesterTheme: themeName,
          providerName: 'system',
          capability,
        },
      },
    });

    const status = permission?.status || 'pending';
    this.setCachedPermission(cacheKey, status);

    if (status !== 'approved') {
      await this.requestPermission(capability, themeName);
      this.log.warn(`Security block: theme '${themeName}' attempted to access '${capability}' without permission.`);
      throw new BlackLotusCMSError(`[Segurança de Tema] Theme '${themeName}' does not have approved permission for '${capability}'.`, 403, 'AUTH_FORBIDDEN');
    }

    return true;
  }

  // Admin Methods
  async getPendingPermissions() {
    return this.db.themePermission.findMany({ where: { status: 'pending' } });
  }

  async getProcessedPermissions() {
    return this.db.themePermission.findMany({ 
      where: { status: { in: ['approved', 'denied'] } },
      orderBy: { requesterTheme: 'asc' }
    });
  }

  async deletePermission(id: string, user: any) {
    if (!canPerformAction(user, 'theme.manage')) {
      throw new BlackLotusCMSError('No permission to delete theme permissions', 403, 'AUTH_FORBIDDEN');
    }
    const permission = await this.db.themePermission.findUnique({ where: { id } });
    if (permission) {
      this.clearPermissionCache(permission.requesterTheme);
    }
    return this.db.themePermission.delete({ where: { id } });
  }

  async updatePermissionStatus(id: string, status: "approved" | "denied", user: any) {
    if (!canPerformAction(user, 'theme.manage')) {
      throw new BlackLotusCMSError('No permission to update theme permission status', 403, 'AUTH_FORBIDDEN');
    }
    const permission = await this.db.themePermission.findUnique({ where: { id } });
    if (permission) {
      this.clearPermissionCache(permission.requesterTheme);
    }
    return this.db.themePermission.update({ where: { id }, data: { status } });
  }

  // --- Static Proxy ---
  static async setForTheme(n: string, k: string, v: any, u: any) { return themeDataService.setForTheme(n, k, v, u); }
  static async set(k: string, v: any) { return themeDataService.set(k, v); }
  static async get(k: string) { return themeDataService.get(k); }
  static async listAll(n: string) { return themeDataService.listAll(n); }
  static async requestPermission(c: string, n?: string) { return themeDataService.requestPermission(c, n); }
  static async validate(c: string, n?: string) { return themeDataService.validate(c, n); }
  static async getPendingPermissions() { return themeDataService.getPendingPermissions(); }
  static async getProcessedPermissions() { return themeDataService.getProcessedPermissions(); }
  static async deletePermission(id: string, u: any) { return themeDataService.deletePermission(id, u); }
  static async updatePermissionStatus(id: string, status: any, u: any) { return themeDataService.updatePermissionStatus(id, status, u); }
}

export const themeDataService = new ThemeDataService();
