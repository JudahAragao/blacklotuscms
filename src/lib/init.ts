import { PluginManager } from "@/core/services/PluginManager";
import { SecretsService } from "./secrets";
import { logger } from "./logger";

/**
 * Global initialization of BlackLotusCMS Core.
 * Ensures plugins, hooks and drivers are ready.
 */
let initialized = false;

export async function initCMS() {
  if (initialized) return;

  // Only start the engine if the system has already gone through installation
  const isInstalled = await SecretsService.isInstalled();
  if (!isInstalled) {
    logger.info('BlackLotusCMS: Waiting for initial installation...');
    return;
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
