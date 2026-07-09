import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { canPerformAction } from '@/lib/auth-utils';
import { BlackLotusCMSError } from '@/lib/errors';

export class ThemeService {
  /**
   * Returns the name of the active theme in the database.
   * Guaranteed fallback to 'default'.
   */
  async getActiveTheme(): Promise<string> {
    const setting = await prisma.setting.findUnique({ where: { key: 'active_theme' } });
    if (!setting || !setting.value) {
      // Auto-repair: if no active theme is found, set default
      // Note: user context not available during auto-repair, but we skip check here
      await prisma.setting.upsert({
        where: { key: 'active_theme' },
        update: { value: 'default' },
        create: { key: 'active_theme', value: 'default' },
      });
      return 'default';
    }
    return (setting.value as string);
  }

  /**
   * Activates a new theme. Prevents total deactivation.
   */
  async setActiveTheme(themeName: string, user: any) {
    if (!canPerformAction(user, 'theme.manage')) {
      throw new BlackLotusCMSError('No permission to activate themes', 403, 'AUTH_FORBIDDEN');
    }

    const name = themeName || 'default';
    return await prisma.setting.upsert({
      where: { key: 'active_theme' },
      update: { value: name },
      create: { key: 'active_theme', value: name },
    });
  }

  /**
   * Lists all installed themes in the system.
   */
  async listThemes() {
    const themesPath = path.join(process.cwd(), 'themes');
    try {
      const dirs = await fs.readdir(themesPath);
      const themes = [];

      for (const dir of dirs) {
        const manifest = await this.getThemeManifest(dir);
        if (manifest) {
          themes.push({
            ...manifest,
            name: dir, // Folder name is the unique ID
            displayName: manifest.name || dir,
            version: manifest.version || '0.0.0',
            description: manifest.description || '',
            author: manifest.author || 'Unknown',
            screenshot: manifest.screenshot || null,
          });
        }
      }

      return themes;
    } catch {
      return [];
    }
  }

  /**
   * Retrieves the manifest settings of a theme.
   */
  async getThemeManifest(themeName: string) {
    const manifestPath = path.join(process.cwd(), 'themes', themeName, 'theme.json');
    try {
      const content = await fs.readFile(manifestPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Deletes a theme from the filesystem.
   * Cannot delete the active theme - must deactivate first.
   */
  async deleteTheme(themeName: string, user: any) {
    if (!canPerformAction(user, 'theme.manage')) {
      throw new BlackLotusCMSError('No permission to delete themes', 403, 'AUTH_FORBIDDEN');
    }

    // Prevent deleting the active theme
    const activeTheme = await this.getActiveTheme();
    if (themeName === activeTheme) {
      throw new BlackLotusCMSError('Cannot delete the active theme. Deactivate it first.', 400, 'VALIDATION_ERROR');
    }

    // Prevent deleting the default theme
    if (themeName === 'default') {
      throw new BlackLotusCMSError('Cannot delete the default theme', 400, 'VALIDATION_ERROR');
    }

    const themesPath = path.join(process.cwd(), 'themes');
    const themePath = path.join(themesPath, themeName);

    // Check if theme exists
    try {
      await fs.access(themePath);
    } catch {
      throw new BlackLotusCMSError('Theme not found', 404, 'RESOURCE_NOT_FOUND');
    }

    // Delete the theme directory
    await fs.rm(themePath, { recursive: true, force: true });

    return { success: true, themeName };
  }

  // --- Static Proxy ---
  static async getActiveTheme() { return themeService.getActiveTheme(); }
  static async setActiveTheme(themeName: string, user: any) { return themeService.setActiveTheme(themeName, user); }
  static async listThemes() { return themeService.listThemes(); }
  static async getThemeManifest(themeName: string) { return themeService.getThemeManifest(themeName); }
  static async deleteTheme(themeName: string, user: any) { return themeService.deleteTheme(themeName, user); }
}

export const themeService = new ThemeService();
