import { prisma } from "@/lib/prisma";

export class PluginDataService {
  /**
   * Saves data in the plugin's isolated storage.
   */
  async set(pluginId: string, key: string, value: any) {
    return prisma.pluginData.upsert({
      where: {
        pluginId_key: { pluginId, key },
      },
      update: { value },
      create: { pluginId, key, value },
    });
  }

  /**
   * Retrieves data from the plugin itself.
   */
  async get(pluginId: string, key: string) {
    const data = await prisma.pluginData.findUnique({
      where: {
        pluginId_key: { pluginId, key },
      },
    });
    return data?.value || null;
  }

  /**
   * Requests permission to access data from another plugin or system functionality.
   */
  async requestPermission(requesterName: string, providerName: string, capability: string) {
    if (requesterName === providerName) return true;

    return prisma.pluginPermission.upsert({
      where: {
        requesterPlugin_providerPlugin_capability: {
          requesterPlugin: requesterName,
          providerPlugin: providerName,
          capability,
        },
      },
      update: {}, 
      create: {
        requesterPlugin: requesterName,
        providerPlugin: providerName, // 'system' for core, or another plugin's name
        capability,
        status: "pending",
      },
    });
  }

  /**
   * Checks if a specific permission is approved.
   */
  async hasPermission(requesterName: string, providerName: string, capability: string): Promise<boolean> {
    const permission = await prisma.pluginPermission.findUnique({
      where: {
        requesterPlugin_providerPlugin_capability: {
          requesterPlugin: requesterName,
          providerPlugin: providerName,
          capability,
        },
      },
    });

    return permission?.status === "approved";
  }

  /**
   * Attempts to fetch data from another plugin, validating permission.
   */
  async getFromOther(requesterName: string, providerName: string, key: string) {
    const permission = await prisma.pluginPermission.findUnique({
      where: {
        requesterPlugin_providerPlugin_capability: {
          requesterPlugin: requesterName,
          providerPlugin: providerName,
          capability: "read",
        },
      },
    });

    if (!permission || permission.status !== "approved") {
      throw new Error(`Read permission denied for plugin: ${providerName}`);
    }

    const providerPlugin = await prisma.plugin.findUnique({ where: { name: providerName } });
    if (!providerPlugin) throw new Error("Provider plugin not found.");

    return this.get(providerPlugin.id, key);
  }

  /**
   * Admin Management: Approve or Reject permission.
   */
  async updatePermissionStatus(id: string, status: "approved" | "denied") {
    return prisma.pluginPermission.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * List pending permissions for the Admin.
   */
  async getPendingPermissions() {
    return prisma.pluginPermission.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
    });
  }

  // --- Static Proxy ---
  static async set(pluginId: string, key: string, value: any) { return pluginDataService.set(pluginId, key, value); }
  static async get(pluginId: string, key: string) { return pluginDataService.get(pluginId, key); }
  static async requestPermission(req: string, prov: string, cap: string) { return pluginDataService.requestPermission(req, prov, cap); }
  static async hasPermission(req: string, prov: string, cap: string) { return pluginDataService.hasPermission(req, prov, cap); }
  static async getFromOther(req: string, prov: string, key: string) { return pluginDataService.getFromOther(req, prov, key); }
  static async updatePermissionStatus(id: string, status: "approved" | "denied") { return pluginDataService.updatePermissionStatus(id, status); }
  static async getPendingPermissions() { return pluginDataService.getPendingPermissions(); }
}

export const pluginDataService = new PluginDataService();
