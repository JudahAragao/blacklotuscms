import { prisma } from '@/lib/prisma';
import { PluginSandbox } from '../sandbox/PluginSandbox';
import { hookService } from './HookService';
import { pluginDataService } from './PluginDataService';
import { logger } from '@/lib/logger';
import { BlackLotusCMSError } from '@/lib/errors';
import { fileService } from './FileService';
import path from 'path';
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canPerformAction } from '@/lib/auth-utils';

const FORBIDDEN_FIELDS = ['passwordHash', 'password', 'secret', 'apiKey', 'token'];
const DB_RATE_LIMIT = 50; 
const RATE_LIMIT_WINDOW = 1000;

export class PluginService {
  private activePlugins: Map<string, PluginSandbox> = new Map();
  private pluginStats: Map<string, { requests: number, lastReset: number }> = new Map();
  private sandboxPool: Map<string, PluginSandbox> = new Map();

  constructor(
    private readonly db = prisma,
    private readonly log = logger,
    private readonly fs = fileService
  ) {}

  private checkRateLimit(pluginId: string) {
    const now = Date.now();
    const stats = this.pluginStats.get(pluginId) || { requests: 0, lastReset: now };

    if (now - stats.lastReset > RATE_LIMIT_WINDOW) {
      stats.requests = 1;
      stats.lastReset = now;
    } else {
      stats.requests++;
    }

    this.pluginStats.set(pluginId, stats);
    if (stats.requests > DB_RATE_LIMIT) {
      throw new BlackLotusCMSError('Database rate limit exceeded by plugin', 429, 'RATE_LIMIT_EXCEEDED');
    }
  }

  private async applyJitter() {
    const delay = Math.floor(Math.random() * 5) + 1;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    if (Array.isArray(data)) return data.map(item => this.sanitizeData(item));
    if (typeof data === 'object') {
      const sanitized = { ...data };
      for (const field of FORBIDDEN_FIELDS) {
        delete sanitized[field];
      }
      return sanitized;
    }
    return data;
  }

  private createBridgeApi(pluginId: string, manifest: any) {
    const pluginName = manifest.name;

    const checkPermission = async (action: string, model: string) => {
      this.checkRateLimit(pluginId);
      await this.applyJitter();

      const capability = `db.${action}.${model.toLowerCase()}`;
      const hasAccess = await pluginDataService.hasPermission(pluginName, 'system', capability);
      
      if (!hasAccess) {
        throw new BlackLotusCMSError(`Access denied for '${capability}'`, 403, 'AUTH_FORBIDDEN');
      }
    };

    return {
      log: (...args: any[]) => this.log.info(`[Plugin:${pluginId}]`, { args }),
      auth: {
        getUser: async () => {
          const hasAccess = await pluginDataService.hasPermission(pluginName, 'system', 'system.auth.read');
          if (!hasAccess) {
            await pluginDataService.requestPermission(pluginName, 'system', 'system.auth.read');
            return null;
          }
          const session = await getServerSession(authOptions);
          return session?.user || null;
        },
        isAuthenticated: async () => {
          const hasAccess = await pluginDataService.hasPermission(pluginName, 'system', 'system.auth.read');
          if (!hasAccess) {
            await pluginDataService.requestPermission(pluginName, 'system', 'system.auth.read');
            return false;
          }
          const session = await getServerSession(authOptions);
          return !!session?.user;
        }
      },
      permissions: {
        request: async (capability: string) => pluginDataService.requestPermission(pluginName, 'system', capability)
      },
      storage: {
        set: async (key: string, value: any) => pluginDataService.set(pluginId, key, value),
        get: async (key: string) => pluginDataService.get(pluginId, key)
      },
      db: {
        read: async (model: string, query: any) => {
          await checkPermission('read', model);
          const results = await (this.db as any)[model].findMany(query);
          return this.sanitizeData(results);
        },
        create: async (model: string, data: any) => {
          await checkPermission('write', model);
          let finalData = { ...data };
          if (model === 'User' && finalData.password) {
            finalData.passwordHash = await bcrypt.hash(finalData.password, 12);
            delete finalData.password;
          }
          const result = await (this.db as any)[model].create({ data: finalData });
          return this.sanitizeData(result);
        }
      },
      hooks: {
        registerComponent: async (slot: string, component: any, priority: number = 10) => {
          if (slot.startsWith('public.route')) {
            const hasAccess = await pluginDataService.hasPermission(pluginName, 'system', 'system.ui.register.public_route');
            if (!hasAccess) {
              await pluginDataService.requestPermission(pluginName, 'system', 'system.ui.register.public_route');
              return;
            }
          }
          hookService.registerComponent(slot, component, pluginId, priority);
        },
        addAction: async (hookName: string, callback: any) => {
          const ivmMod = await import('isolated-vm');
          hookService.addAction(hookName, async (data) => {
            try {
              await callback.apply(undefined, [new ivmMod.ExternalCopy(data).copyInto()]);
            } catch (err) {
              this.log.error(`Error in hook ${hookName} of plugin ${pluginId}`, { err });
            }
          });
        },
        addFilter: async (hookName: string, callback: any) => {
          const ivmMod = await import('isolated-vm');
          hookService.addFilter(hookName, async (data) => {
            try {
              if (hookName === 'route_access') {
                const capability = `system.hook.filter.${hookName}`;
                const hasAccess = await pluginDataService.hasPermission(pluginName, 'system', capability);

                if (!hasAccess) {
                  await pluginDataService.requestPermission(pluginName, 'system', capability);
                  this.log.warn(`Plugin '${pluginName}' attempted to use sensitive hook '${hookName}' without permission.`);
                  return data;
                }
              }
              return await callback.apply(undefined, [new ivmMod.ExternalCopy(data).copyInto()], { result: { copy: true } });
            } catch (err) {
              this.log.error(`Error in filter ${hookName} of plugin ${pluginId}`, { err });
              return data;
            }
          });
        }
      }
    };
  }

  async activate(pluginId: string, user: any) {
    if (!canPerformAction(user, 'plugin.manage')) {
      throw new BlackLotusCMSError('No permission to activate plugins', 403, 'AUTH_FORBIDDEN');
    }

    const plugin = await this.db.plugin.findUnique({ where: { id: pluginId } });
    if (!plugin) throw new BlackLotusCMSError("Plugin not found", 404, 'RESOURCE_NOT_FOUND');

    const manifest = plugin.manifest as any;
    const pluginDir = path.join(process.cwd(), 'plugins', plugin.name);
    const entryPath = path.join(pluginDir, manifest.entry || 'index.js');
    
    try {
      const content = await this.fs.saveFile ? '' : ''; // Dummy check for fs
      const realFs = fs;
      const fileContent = await realFs.readFile(entryPath, 'utf-8');
      
      // Sandbox Pooling Implementation
      let sandbox = this.sandboxPool.get(pluginId);
      if (!sandbox) {
        sandbox = await PluginSandbox.create();
        this.sandboxPool.set(pluginId, sandbox);
      }

      const bridge = this.createBridgeApi(pluginId, manifest);
      await sandbox.execute(fileContent, bridge);
      
      this.activePlugins.set(pluginId, sandbox);
      await this.db.plugin.update({ where: { id: pluginId }, data: { isActive: true } });

      this.log.info(`Plugin activated: ${plugin.name}`);
    } catch (err: any) {
      this.log.error(`Failed to activate plugin ${plugin.name}`, { err: err.message });
      throw err;
    }
  }

  async deactivate(pluginId: string, user: any) {
    if (!canPerformAction(user, 'plugin.manage')) {
      throw new BlackLotusCMSError('No permission to deactivate plugins', 403, 'AUTH_FORBIDDEN');
    }

    const sandbox = this.activePlugins.get(pluginId);
    if (sandbox) {
      sandbox.dispose();
      this.activePlugins.delete(pluginId);
      this.sandboxPool.delete(pluginId);
    }

    await this.db.plugin.update({ where: { id: pluginId }, data: { isActive: false } });
    this.log.warn(`Plugin deactivated: ${pluginId}`);
  }

  async boot() {
    const plugins = await this.db.plugin.findMany({ where: { isActive: true } });
    for (const plugin of plugins) {
      try {
        const pluginDir = path.join(process.cwd(), 'plugins', plugin.name);
        const manifest = plugin.manifest as any;
        const entryPath = path.join(pluginDir, manifest.entry || 'index.js');
        const realFs = fs;
        const content = await realFs.readFile(entryPath, 'utf-8');

        let sandbox = await PluginSandbox.create();
        const bridge = this.createBridgeApi(plugin.id, manifest);
        await sandbox.execute(content, bridge);
        
        this.activePlugins.set(plugin.id, sandbox);
        this.sandboxPool.set(plugin.id, sandbox);
      } catch (err: any) {
        this.log.error(`Failed to boot plugin ${plugin.name}`, { err: err.message });
      }
    }
  }

  async installPlugin(buffer: Buffer, originalName: string, user: any) {
    if (!canPerformAction(user, 'plugin.manage')) {
      throw new BlackLotusCMSError('No permission to install plugins', 403, 'AUTH_FORBIDDEN');
    }

    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(buffer);
    const pluginsPath = path.join(process.cwd(), 'plugins');
    const pluginFolder = originalName.replace(/\.[^/.]+$/, "").replace(/\s+/g, '-').toLowerCase();
    const extractPath = path.join(pluginsPath, pluginFolder);

    zip.extractAllTo(extractPath, true);

    const manifestPath = path.join(extractPath, 'plugin.json');
    try {
      const manifest = await this.fs.readJson<any>(manifestPath);
      if (!manifest) throw new Error("plugin.json missing");

      const plugin = await this.db.plugin.upsert({
        where: { name: manifest.name },
        update: { version: manifest.version, manifest: manifest as any },
        create: { name: manifest.name, version: manifest.version, manifest: manifest as any, isActive: false }
      });

      return { success: true, plugin };
    } catch (err) {
      const realFs = fs;
      await realFs.rm(extractPath, { recursive: true, force: true });
      throw new BlackLotusCMSError("Invalid or corrupted plugin", 400, 'VALIDATION_ERROR');
    }
  }

  // --- Static Proxy ---
  static async activate(id: string, user: any) { return pluginService.activate(id, user); }
  static async deactivate(id: string, user: any) { return pluginService.deactivate(id, user); }
  static async boot() { return pluginService.boot(); }
  static async installPlugin(b: Buffer, n: string, user: any) { return pluginService.installPlugin(b, n, user); }
}

export const pluginService = new PluginService();
