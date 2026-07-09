import { transform } from 'esbuild';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '@/lib/logger';

export class ThemeCompiler {
  /**
   * Compiles a theme's .tsx files to .js in a compiled/ subdirectory.
   * This allows themes to be loaded at runtime without Turbopack's static analysis.
   */
  async compile(themePath: string): Promise<void> {
    const compiledPath = path.join(themePath, 'compiled');
    const layoutsPath = path.join(themePath, 'layouts');
    const componentsPath = path.join(themePath, 'components');

    // Create compiled directory structure
    await fs.mkdir(path.join(compiledPath, 'layouts'), { recursive: true });
    await fs.mkdir(path.join(compiledPath, 'components'), { recursive: true });

    // Compile layouts
    await this.compileDirectory(layoutsPath, path.join(compiledPath, 'layouts'));

    // Compile components
    await this.compileDirectory(componentsPath, path.join(compiledPath, 'components'));

    logger.info(`Theme compiled successfully: ${path.basename(themePath)}`);
  }

  /**
   * Compiles all .tsx/.ts files in a directory to .js files using esbuild.
   */
  private async compileDirectory(sourceDir: string, outputDir: string): Promise<void> {
    let files: string[];
    try {
      files = await fs.readdir(sourceDir);
    } catch {
      // Directory doesn't exist, nothing to compile
      return;
    }

    const tsFiles = files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

    if (tsFiles.length === 0) return;

    for (const file of tsFiles) {
      const sourceFile = path.join(sourceDir, file);
      const outputFile = path.join(outputDir, file.replace(/\.tsx?$/, '.js'));

      try {
        const content = await fs.readFile(sourceFile, 'utf-8');
        const isTsx = file.endsWith('.tsx');

        const result = await transform(content, {
          loader: isTsx ? 'tsx' : 'ts',
          format: 'cjs',
          target: 'es2020',
          jsx: 'automatic',
          // Preserve 'use client' directives
          preserve: true,
        });

        await fs.writeFile(outputFile, result.code);
      } catch (err) {
        logger.error(`Failed to compile ${file}:`, err);
        // Copy original file as fallback
        await fs.copyFile(sourceFile, outputFile);
      }
    }
  }

  /**
   * Cleans up the compiled directory for a theme.
   */
  async cleanup(themePath: string): Promise<void> {
    const compiledPath = path.join(themePath, 'compiled');
    try {
      await fs.rm(compiledPath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}

export const themeCompiler = new ThemeCompiler();
