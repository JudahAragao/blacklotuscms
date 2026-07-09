import { build } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '@/lib/logger';

const builtins = new Set([
  'assert', 'buffer', 'child_process', 'cluster', 'console', 'constants',
  'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https',
  'module', 'net', 'os', 'path', 'process', 'punycode', 'querystring',
  'readline', 'repl', 'stream', 'string_decoder', 'sys', 'timers', 'tls',
  'tty', 'url', 'util', 'v8', 'vm', 'zlib'
]);

export class ThemeCompiler {
  private srcDir: string;

  constructor() {
    this.srcDir = path.join(process.cwd(), 'src');
  }

  /**
   * Compiles a theme's .tsx files to .js in a compiled/ subdirectory.
   * Uses Vite to resolve @/ aliases and bundle CMS modules into the output.
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

  /**
   * Compiles all .tsx/.ts files in a directory to .js files using Vite.
   */
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
        await this.compileFile(sourceFile, outputFile);
      } catch (err) {
        logger.error(`Failed to compile ${file}:`, err);
        await fs.copyFile(sourceFile, outputFile);
      }
    }
  }

  /**
   * Compiles a single file using Vite's build API.
   * - Resolves @/ aliases to actual src/ paths
   * - Bundles CMS modules and their JS dependencies into the output
   * - Externalizes React, Next.js, Node.js builtins, and native modules
   */
  private async compileFile(input: string, output: string): Promise<void> {
    const result = await build({
      build: {
        write: false,
        minify: false,
        rollupOptions: {
          input: input,
          output: {
            format: 'cjs',
            entryFileNames: path.basename(output),
            exports: 'auto',
          },
          external: (id) => {
            // Don't externalize @/ imports — they should be bundled
            if (id.startsWith('@/')) return false;

            // Externalize React and its internals
            if (id === 'react' || id === 'react-dom' || id.startsWith('react/')) return true;
            if (id === 'react/jsx-runtime' || id === 'react/jsx-dev-runtime') return true;

            // Externalize Next.js modules
            if (id.startsWith('next/')) return true;

            // Externalize Node.js built-ins
            if (builtins.has(id)) return true;

            // Externalize native modules that can't be bundled
            if (id.includes('@prisma') || id.includes('isolated-vm') || id.includes('sharp') || id.includes('bcrypt')) return true;

            // Bundle everything else (CMS modules, their JS deps, etc.)
            return false;
          },
        },
      },
      resolve: {
        alias: {
          '@': this.srcDir,
        },
      },
      logLevel: 'error',
    });

    const chunk = result.output[0];
    if (chunk && 'code' in chunk) {
      await fs.writeFile(output, chunk.code);
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
