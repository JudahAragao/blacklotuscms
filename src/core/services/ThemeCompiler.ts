import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '@/lib/logger';

const execFileAsync = promisify(execFile);

export class ThemeCompiler {
  private srcDir: string;
  private scriptPath: string;

  constructor() {
    this.srcDir = path.join(process.cwd(), 'src');
    // Script is at scripts/compile-theme.mjs, not traced by Turbopack
    this.scriptPath = path.join(process.cwd(), 'scripts', 'compile-theme.mjs');
  }

  /**
   * Compiles a theme's .tsx files to .js in a compiled/ subdirectory.
   * Uses Vite (via external script) to resolve @/ aliases and bundle CMS modules.
   */
  async compile(themePath: string): Promise<void> {
    const compiledPath = path.join(themePath, 'compiled');
    const layoutsPath = path.join(themePath, 'layouts');
    const componentsPath = path.join(themePath, 'components');

    await fs.mkdir(path.join(compiledPath, 'layouts'), { recursive: true });
    await fs.mkdir(path.join(compiledPath, 'components'), { recursive: true });

    await this.compileDirectory(layoutsPath, path.join(compiledPath, 'layouts'));
    await this.compileDirectory(componentsPath, path.join(compiledPath, 'components'));

    logger.info(`Theme compiled successfully: ${path.basename(themePath)}`);
  }

  private async compileDirectory(sourceDir: string, outputDir: string): Promise<void> {
    let files: string[];
    try {
      files = await fs.readdir(sourceDir);
    } catch {
      return;
    }

    const tsFiles = files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
    if (tsFiles.length === 0) return;

    for (const file of tsFiles) {
      const sourceFile = path.join(sourceDir, file);
      const outputFile = path.join(outputDir, file.replace(/\.tsx?$/, '.js'));

      try {
        await execFileAsync('node', [this.scriptPath, sourceFile, outputFile, this.srcDir]);
      } catch (err: any) {
        logger.error(`Failed to compile ${file}:`, err.message || err);
        await fs.copyFile(sourceFile, outputFile);
      }
    }
  }

  async cleanup(themePath: string): Promise<void> {
    const compiledPath = path.join(themePath, 'compiled');
    try {
      await fs.rm(compiledPath, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  }
}

export const themeCompiler = new ThemeCompiler();
