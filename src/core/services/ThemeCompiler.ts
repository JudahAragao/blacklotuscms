import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '@/lib/logger';

const execFileAsync = promisify(execFile);
const FORBIDDEN_IMPORTS = [
  'next/',
  '@/core/services',
  '@/app/',
  '@/components/',
];

function getEsbuildBin(): string {
  return path.join(process.cwd(), 'node_modules', '.bin', 'esbuild');
}

export class ThemeCompiler {
  private srcDir: string;

  constructor() {
    this.srcDir = path.join(process.cwd(), 'src');
  }

  /**
   * Compiles a theme's .tsx files to .js in a compiled/ subdirectory.
   * Uses esbuild CLI with --alias to resolve @/ imports and bundle CMS modules.
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

    const esbuild = getEsbuildBin();

    for (const file of tsFiles) {
      const sourceFile = path.join(sourceDir, file);
      const outputFile = path.join(outputDir, file.replace(/\.tsx?$/, '.js'));

      try {
        await this.validateSourceFile(sourceFile);
        const loader = file.endsWith('.tsx') ? 'tsx' : 'ts';

        await execFileAsync(esbuild, [
          sourceFile,
          '--outfile', outputFile,
          '--format=cjs',
          '--loader', `.${loader}=${loader}`,
          '--jsx=automatic',
          '--target=es2020',
          '--bundle',
          // Resolve @/ aliases to actual src/ paths
          `--alias:@=${this.srcDir}`,
          // Keep external packages as require() calls (React, Next.js, Node builtins)
          '--packages=external',
        ]);
      } catch (err) {
        logger.error(`Failed to compile ${file}:`, err);
        throw err;
      }
    }
  }

  private async validateSourceFile(sourceFile: string): Promise<void> {
    const source = await fs.readFile(sourceFile, 'utf-8');

    for (const forbiddenImport of FORBIDDEN_IMPORTS) {
      const importPattern = new RegExp(
        `(?:from\\s+['"]|import\\s*\\(\\s*['"]|require\\s*\\(\\s*['"])${forbiddenImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
      );

      if (importPattern.test(source)) {
        throw new Error(
          `Theme file '${path.basename(sourceFile)}' imports '${forbiddenImport}', which is not allowed in runtime themes. Use '@/lib/lotus-sdk' instead.`
        );
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
