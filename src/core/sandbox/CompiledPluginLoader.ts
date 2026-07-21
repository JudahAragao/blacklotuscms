import { prisma } from '@/lib/prisma';
import { pluginDataService } from '../services/PluginDataService';
import { hookService } from '../services/HookService';
import { networkService } from '../services/NetworkService';
import { routeService } from '../services/RouteService';
import { logger } from '@/lib/logger';
import { BlackLotusCMSError } from '@/lib/errors';
import bcrypt from 'bcryptjs';

const FORBIDDEN_FIELDS = ['passwordHash', 'password', 'secret', 'apiKey', 'token'];

function sanitizeData(data: any): any {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(item => sanitizeData(item));
  if (typeof data === 'object') {
    const sanitized = { ...data };
    for (const field of FORBIDDEN_FIELDS) {
      delete sanitized[field];
    }
    return sanitized;
  }
  return data;
}

export class CompiledPluginLoader {

  /**
   * Loads a compiled plugin and executes its init function with a proxied bridge.
   */
  static async load(pluginName: string, pluginId: string, manifest: any): Promise<void> {
    const { pluginRegistry } = await import('@/generated/plugin-registry');
    const entry = pluginRegistry[pluginName];

    if (!entry) {
      throw new BlackLotusCMSError(`Compiled plugin "${pluginName}" not found in registry`, 404, 'RESOURCE_NOT_FOUND');
    }

    const bridge = this.createBridge(pluginName, pluginId, manifest);
    await entry.init(bridge);
    logger.info(`Compiled plugin loaded: ${pluginName}`);
  }

  /**
   * Creates a Proxy-based bridge for a compiled plugin.
   */
  private static createBridge(pluginName: string, pluginId: string, manifest: any): any {
    const dbMethods = ['read', 'findOne', 'create', 'update', 'updateMany', 'delete', 'deleteMany', 'upsert', 'transaction'];

    const checkPermission = async (action: string, model: string) => {
      const capability = `db.${action}.${model.toLowerCase()}`;
      const hasAccess = await pluginDataService.hasPermission(pluginName, 'system', capability);
      if (!hasAccess) {
        await pluginDataService.requestPermission(pluginName, 'system', capability);
        throw new BlackLotusCMSError(
          `Plugin '${pluginName}' does not have permission '${capability}'. Request sent to admin.`,
          403, 'AUTH_FORBIDDEN'
        );
      }
    };

    return {
      log: (...args: any[]) => logger.info(`[CompiledPlugin:${pluginName}]`, { args }),

      db: new Proxy({}, {
        get(_, method: string) {
          if (!dbMethods.includes(method)) {
            throw new BlackLotusCMSError(`bridge.db.${method} not allowed`, 403, 'AUTH_FORBIDDEN');
          }

          if (method === 'read') {
            return async (model: string, query: any) => {
              await checkPermission('read', model);
              const results = await (prisma as any)[model].findMany(query);
              return sanitizeData(results);
            };
          }

          if (method === 'findOne') {
            return async (model: string, where: any) => {
              await checkPermission('read', model);
              const result = await (prisma as any)[model].findFirst({ where });
              return sanitizeData(result);
            };
          }

          if (method === 'create') {
            return async (model: string, data: any) => {
              await checkPermission('write', model);
              let finalData = { ...data };
              if (model === 'User' && finalData.password) {
                finalData.passwordHash = await bcrypt.hash(finalData.password, 12);
                delete finalData.password;
              }
              const result = await (prisma as any)[model].create({ data: finalData });
              return sanitizeData(result);
            };
          }

          if (method === 'update') {
            return async (model: string, where: any, data: any) => {
              await checkPermission('write', model);
              let finalData = { ...data };
              if (model === 'User' && finalData.password) {
                finalData.passwordHash = await bcrypt.hash(finalData.password, 12);
                delete finalData.password;
              }
              const result = await (prisma as any)[model].update({ where, data: finalData });
              return sanitizeData(result);
            };
          }

          if (method === 'updateMany') {
            return async (model: string, where: any, data: any) => {
              await checkPermission('write', model);
              const result = await (prisma as any)[model].updateMany({ where, data });
              return { count: result.count };
            };
          }

          if (method === 'delete') {
            return async (model: string, where: any) => {
              await checkPermission('write', model);
              const result = await (prisma as any)[model].delete({ where });
              return sanitizeData(result);
            };
          }

          if (method === 'deleteMany') {
            return async (model: string, where: any) => {
              await checkPermission('write', model);
              const result = await (prisma as any)[model].deleteMany({ where });
              return { count: result.count };
            };
          }

          if (method === 'upsert') {
            return async (model: string, where: any, createData: any, updateData: any) => {
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
              const result = await (prisma as any)[model].upsert({ where, create: finalCreate, update: finalUpdate });
              return sanitizeData(result);
            };
          }

          if (method === 'transaction') {
            return async (callback: (tx: any) => Promise<any>) => {
              return prisma.$transaction(async (prismaTx: any) => {
                const tx = {
                  read: async (model: string, query: any) => {
                    await checkPermission('read', model);
                    return sanitizeData(await prismaTx[model].findMany(query));
                  },
                  findOne: async (model: string, where: any) => {
                    await checkPermission('read', model);
                    return sanitizeData(await prismaTx[model].findFirst({ where }));
                  },
                  create: async (model: string, data: any) => {
                    await checkPermission('write', model);
                    return sanitizeData(await prismaTx[model].create({ data }));
                  },
                  update: async (model: string, where: any, data: any) => {
                    await checkPermission('write', model);
                    return sanitizeData(await prismaTx[model].update({ where, data }));
                  },
                  updateMany: async (model: string, where: any, data: any) => {
                    await checkPermission('write', model);
                    return { count: (await prismaTx[model].updateMany({ where, data })).count };
                  },
                  delete: async (model: string, where: any) => {
                    await checkPermission('write', model);
                    return sanitizeData(await prismaTx[model].delete({ where }));
                  },
                  deleteMany: async (model: string, where: any) => {
                    await checkPermission('write', model);
                    return { count: (await prismaTx[model].deleteMany({ where })).count };
                  },
                  upsert: async (model: string, where: any, c: any, u: any) => {
                    await checkPermission('write', model);
                    return sanitizeData(await prismaTx[model].upsert({ where, create: c, update: u }));
                  },
                };
                return callback(tx);
              });
            };
          }
        }
      }),

      http: new Proxy({}, {
        get(_, method: string) {
          if (method !== 'request') {
            throw new BlackLotusCMSError(`bridge.http.${method} not allowed`, 403, 'AUTH_FORBIDDEN');
          }
          return async (config: any) => {
            const hasAccess = await pluginDataService.hasPermission(pluginName, 'system', 'http.outbound.request');
            if (!hasAccess) {
              await pluginDataService.requestPermission(pluginName, 'system', 'http.outbound.request');
              throw new BlackLotusCMSError(
                `Plugin '${pluginName}' does not have http.outbound.request permission.`,
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
          };
        }
      }),

      storage: new Proxy({}, {
        get(_, method: string) {
          if (method === 'get') {
            return async (key: string) => pluginDataService.get(pluginId, key);
          }
          if (method === 'set') {
            return async (key: string, value: any) => pluginDataService.set(pluginId, key, value);
          }
          throw new BlackLotusCMSError(`bridge.storage.${method} not allowed`, 403, 'AUTH_FORBIDDEN');
        }
      }),

      hooks: new Proxy({}, {
        get(_, method: string) {
          if (method === 'addAction') {
            return async (hookName: string, callback: any) => {
              hookService.addAction(hookName, async (data: any) => {
                try {
                  await callback(data);
                } catch (err) {
                  logger.error(`Error in hook ${hookName} of compiled plugin ${pluginName}`, { err });
                }
              });
            };
          }
          if (method === 'addFilter') {
            return async (hookName: string, callback: any) => {
              hookService.addFilter(hookName, async (data: any) => {
                try {
                  return await callback(data);
                } catch (err) {
                  logger.error(`Error in filter ${hookName} of compiled plugin ${pluginName}`, { err });
                  return data;
                }
              });
            };
          }
          if (method === 'registerComponent') {
            return async (slot: string, component: any, priority: number = 10) => {
              hookService.registerComponent(slot, component, pluginId, priority);
            };
          }
          if (method === 'registerAdminNav') {
            return async (navItem: any) => {
              const hasAccess = await pluginDataService.hasPermission(pluginName, 'system', 'system.ui.register.admin_nav');
              if (!hasAccess) {
                await pluginDataService.requestPermission(pluginName, 'system', 'system.ui.register.admin_nav');
                return;
              }
              hookService.registerComponent('admin.sidebar.plugins', navItem, pluginId, navItem.priority || 10);
            };
          }
          throw new BlackLotusCMSError(`bridge.hooks.${method} not allowed`, 403, 'AUTH_FORBIDDEN');
        }
      }),

      webhook: new Proxy({}, {
        get(_, method: string) {
          if (method === 'on') {
            return async (eventId: string, callback: any) => {
              const hasAccess = await pluginDataService.hasPermission(pluginName, 'system', 'webhook.inbound.register');
              if (!hasAccess) {
                await pluginDataService.requestPermission(pluginName, 'system', 'webhook.inbound.register');
                throw new BlackLotusCMSError(
                  `Plugin '${pluginName}' does not have webhook.inbound.register permission.`,
                  403, 'AUTH_FORBIDDEN'
                );
              }
              networkService.registerWebhookHandler(pluginId, eventId, callback);
              await networkService.createWebhookEndpoint(pluginId, eventId);
            };
          }
          if (method === 'off') {
            return async (eventId: string) => {
              networkService.removeWebhookHandler(pluginId, eventId);
            };
          }
          throw new BlackLotusCMSError(`bridge.webhook.${method} not allowed`, 403, 'AUTH_FORBIDDEN');
        }
      }),

      routes: new Proxy({}, {
        get(_, method: string) {
          if (method === 'register') {
            return async (config: { path: string; handler: any; template: string }) => {
              const hasAccess = await pluginDataService.hasPermission(pluginName, 'system', 'system.route.register');
              if (!hasAccess) {
                await pluginDataService.requestPermission(pluginName, 'system', 'system.route.register');
                throw new BlackLotusCMSError(
                  `Plugin '${pluginName}' does not have system.route.register permission.`,
                  403, 'AUTH_FORBIDDEN'
                );
              }
              routeService.registerPluginRoute(config.path, config.handler, config.template, pluginId);
            };
          }
          throw new BlackLotusCMSError(`bridge.routes.${method} not allowed`, 403, 'AUTH_FORBIDDEN');
        }
      }),

      permissions: new Proxy({}, {
        get(_, method: string) {
          if (method === 'request') {
            return async (capability: string) => {
              return pluginDataService.requestPermission(pluginName, 'system', capability);
            };
          }
          throw new BlackLotusCMSError(`bridge.permissions.${method} not allowed`, 403, 'AUTH_FORBIDDEN');
        }
      }),
    };
  }
}
