import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { canPerformAction } from '@/lib/auth-utils';
import { BlackLotusCMSError } from '@/lib/errors';
import { themeCompiler } from './ThemeCompiler';

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
   * Installs a new theme from a buffer file (ZIP).
   */
  async installTheme(buffer: Buffer, originalName: string, user: any) {
    if (!canPerformAction(user, 'theme.manage')) {
      throw new BlackLotusCMSError('No permission to install themes', 403, 'AUTH_FORBIDDEN');
    }

    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(buffer);
    const themesPath = path.join(process.cwd(), 'themes');
    
    // The folder name will be the filename without extension, sanitized
    const themeFolder = originalName.replace(/\.[^/.]+$/, "").replace(/\s+/g, '-').toLowerCase();
    const extractPath = path.join(themesPath, themeFolder);

    // Extracts the content
    zip.extractAllTo(extractPath, true);

    // Validates if the manifest exists
    const manifest = await this.getThemeManifest(themeFolder);
    if (!manifest) {
      // If there is no manifest, delete the created folder to keep the system clean
      await fs.rm(extractPath, { recursive: true, force: true });
      throw new Error("The theme does not have a valid theme.json file.");
    }

    // Compile theme .tsx files to .js for runtime loading
    await themeCompiler.compile(extractPath);

    return { success: true, themeName: themeFolder };
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

  // --- Static Proxy ---
  static async getActiveTheme() { return themeService.getActiveTheme(); }
  static async setActiveTheme(themeName: string, user: any) { return themeService.setActiveTheme(themeName, user); }
  static async listThemes() { return themeService.listThemes(); }
  static async installTheme(buffer: Buffer, originalName: string, user: any) { return themeService.installTheme(buffer, originalName, user); }
  static async getThemeManifest(themeName: string) { return themeService.getThemeManifest(themeName); }
}

export const themeService = new ThemeService();
