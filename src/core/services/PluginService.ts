import { prisma } from '@/lib/prisma';
import { PluginSandbox } from '../sandbox/PluginSandbox';
import { hookService } from './HookService';
import { pluginDataService } from './PluginDataService';
import { networkService } from './NetworkService';
import { routeService } from './RouteService';
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
        findOne: async (model: string, where: any) => {
          await checkPermission('read', model);
          const result = await (this.db as any)[model].findFirst({ where });
          return this.sanitizeData(result);
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
        },
        update: async (model: string, where: any, data: any) => {
          await checkPermission('write', model);
          let finalData = { ...data };
          if (model === 'User' && finalData.password) {
            finalData.passwordHash = await bcrypt.hash(finalData.password, 12);
            delete finalData.password;
          }
          const result = await (this.db as any)[model].update({ where, data: finalData });
          return this.sanitizeData(result);
        },
        updateMany: async (model: string, where: any, data: any) => {
          await checkPermission('write', model);
          const result = await (this.db as any)[model].updateMany({ where, data });
          return { count: result.count };
        },
        delete: async (model: string, where: any) => {
          await checkPermission('write', model);
          const result = await (this.db as any)[model].delete({ where });
          return this.sanitizeData(result);
        },
        deleteMany: async (model: string, where: any) => {
          await checkPermission('write', model);
          const result = await (this.db as any)[model].deleteMany({ where });
          return { count: result.count };
        },
        upsert: async (model: string, where: any, create: any, update: any) => {
          await checkPermission('write', model);
          let finalCreate = { ...create };
          let finalUpdate = { ...update };
          if (model === 'User') {
            if (finalCreate.password) {
              finalCreate.passwordHash = await bcrypt.hash(finalCreate.password, 12);
              delete finalCreate.password;
            }
            if (finalUpdate.password) {
              finalUpdate.passwordHash = await bcrypt.hash(finalUpdate.password, 12);
              delete finalUpdate.password;
            }
          }
          const result = await (this.db as any)[model].upsert({ where, create: finalCreate, update: finalUpdate });
          return this.sanitizeData(result);
        },
        transaction: async (callback: (tx: any) => Promise<any>) => {
          return this.db.$transaction(async (prismaTx: any) => {
            const tx = {
              read: async (model: string, query: any) => {
                await checkPermission('read', model);
                const results = await prismaTx[model].findMany(query);
                return tx.sanitizeData(results);
              },
              findOne: async (model: string, where: any) => {
                await checkPermission('read', model);
                const result = await prismaTx[model].findFirst({ where });
                return tx.sanitizeData(result);
              },
              create: async (model: string, data: any) => {
                await checkPermission('write', model);
                let finalData = { ...data };
                if (model === 'User' && finalData.password) {
                  finalData.passwordHash = await bcrypt.hash(finalData.password, 12);
                  delete finalData.password;
                }
                const result = await prismaTx[model].create({ data: finalData });
                return tx.sanitizeData(result);
              },
              update: async (model: string, where: any, data: any) => {
                await checkPermission('write', model);
                let finalData = { ...data };
                if (model === 'User' && finalData.password) {
                  finalData.passwordHash = await bcrypt.hash(finalData.password, 12);
                  delete finalData.password;
                }
                const result = await prismaTx[model].update({ where, data: finalData });
                return tx.sanitizeData(result);
              },
              updateMany: async (model: string, where: any, data: any) => {
                await checkPermission('write', model);
                const result = await prismaTx[model].updateMany({ where, data });
                return { count: result.count };
              },
              delete: async (model: string, where: any) => {
                await checkPermission('write', model);
                const result = await prismaTx[model].delete({ where });
                return tx.sanitizeData(result);
              },
              deleteMany: async (model: string, where: any) => {
                await checkPermission('write', model);
                const result = await prismaTx[model].deleteMany({ where });
                return { count: result.count };
              },
              upsert: async (model: string, where: any, createData: any, updateData: any) => {
                await checkPermission('write', model);
                let finalCreate = { ...createData };
                let finalUpdate = { ...updateData };
                if (model === 'User') {
                  if (finalCreate.password) {
                    finalCreate.passwordHash = await bcrypt.hash(finalCreate.password, 12);
                    delete finalCreate.password;
                  }
                  if (finalUpdate.password) {
                    finalUpdate.passwordHash = await bcrypt.hash(finalUpdate.password, 12);
                    delete finalUpdate.password;
                  }
                }
                const result = await prismaTx[model].upsert({ where, create: finalCreate, update: finalUpdate });
                return tx.sanitizeData(result);
              },
              sanitizeData: (data: any): any => {
                if (!data) return data;
                if (Array.isArray(data)) return data.map(item => tx.sanitizeData(item));
                if (typeof data === 'object') {
                  const sanitized = { ...data };
                  for (const field of FORBIDDEN_FIELDS) {
                    delete sanitized[field];
                  }
                  return sanitized;
                }
                return data;
              }
            };
            return callback(tx);
          });
        }
      },
      http: {
        request: async (config: { url: string; method?: string; headers?: Record<string, string>; body?: any; timeout?: number }) => {
          const hasAccess = await pluginDataService.hasPermission(pluginName, 'system', 'http.outbound.request');
          if (!hasAccess) {
            await pluginDataService.requestPermission(pluginName, 'system', 'http.outbound.request');
            throw new BlackLotusCMSError(
              `Plugin '${pluginName}' does not have http.outbound.request permission. Request approved by admin.`,
              403, 'AUTH_FORBIDDEN'
            );
          }
          try {
            return await networkService.makeRequest(pluginId, config);
          } catch (err: any) {
            if (err.code === 'DOMAIN_BLOCKED') {
              const hostname = new URL(config.url).hostname;
              await pluginDataService.requestPermission(pluginName, 'system', `http.domain.${hostname}`);
              throw new BlackLotusCMSError(
                `Domain '${hostname}' is not whitelisted. Permission request sent to admin.`,
                403, 'DOMAIN_BLOCKED'
              );
            }
            throw err;
          }
        }
      },
      webhook: {
        on: async (eventId: string, callback: any) => {
          const hasAccess = await pluginDataService.hasPermission(pluginName, 'system', 'webhook.inbound.register');
          if (!hasAccess) {
            await pluginDataService.requestPermission(pluginName, 'system', 'webhook.inbound.register');
            throw new BlackLotusCMSError(
              `Plugin '${pluginName}' does not have webhook.inbound.register permission. Request approved by admin.`,
              403, 'AUTH_FORBIDDEN'
            );
          }
          const ivmMod = await import('isolated-vm');
          networkService.registerWebhookHandler(pluginId, eventId, async (data) => {
            return await callback.apply(undefined, [new ivmMod.ExternalCopy(data).copyInto()], { result: { copy: true } });
          });
          await networkService.createWebhookEndpoint(pluginId, eventId);
        },
        off: async (eventId: string) => {
          networkService.removeWebhookHandler(pluginId, eventId);
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
        registerAdminNav: async (navItem: { href: string; label: string; icon?: string; priority?: number }) => {
          const hasAccess = await pluginDataService.hasPermission(pluginName, 'system', 'system.ui.register.admin_nav');
          if (!hasAccess) {
            await pluginDataService.requestPermission(pluginName, 'system', 'system.ui.register.admin_nav');
            return;
          }
          hookService.registerComponent('admin.sidebar.plugins', navItem, pluginId, navItem.priority || 10);
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
      },
      routes: {
        register: async (config: { path: string; handler: any; template: string }) => {
          const hasAccess = await pluginDataService.hasPermission(pluginName, 'system', 'system.route.register');
          if (!hasAccess) {
            await pluginDataService.requestPermission(pluginName, 'system', 'system.route.register');
            throw new BlackLotusCMSError(
              `Plugin '${pluginName}' does not have system.route.register permission.`,
              403, 'AUTH_FORBIDDEN'
            );
          }
          const ivmMod = await import('isolated-vm');
          const pluginHandler = config.handler;
          const wrappedHandler = async (ctx: any) => {
            return await pluginHandler.apply(undefined, [
              new ivmMod.ExternalCopy(ctx).copyInto()
            ], { result: { copy: true } });
          };
          routeService.registerPluginRoute(config.path, wrappedHandler, config.template, pluginId);
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

    // Clean up webhook handlers for this plugin
    networkService.removeAllWebhookHandlers(pluginId);

    // Clean up registered routes for this plugin
    routeService.removePluginRoutes(pluginId);

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
