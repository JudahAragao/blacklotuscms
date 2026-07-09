/**
 * Theme compilation script using Vite's build API.
 * Called by ThemeCompiler via child_process — Turbopack does not trace this file.
 *
 * Usage: node scripts/compile-theme.mjs <input> <output> <srcDir>
 */
import { build } from 'vite';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

const [,, input, output, srcDir] = process.argv;

if (!input || !output || !srcDir) {
  console.error('Usage: node compile-theme.mjs <input.tsx> <output.js> <srcDir>');
  process.exit(1);
}

const builtins = new Set([
  'assert', 'buffer', 'child_process', 'cluster', 'console', 'constants',
  'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https',
  'module', 'net', 'os', 'path', 'process', 'punycode', 'querystring',
  'readline', 'repl', 'stream', 'string_decoder', 'sys', 'timers', 'tls',
  'tty', 'url', 'util', 'v8', 'vm', 'zlib'
]);

try {
  const result = await build({
    build: {
      write: false,
      minify: false,
      rollupOptions: {
        input: path.resolve(input),
        output: {
          format: 'cjs',
          entryFileNames: path.basename(output),
          exports: 'auto',
        },
        external: (id) => {
          if (id.startsWith('@/')) return false;
          if (id === 'react' || id === 'react-dom' || id.startsWith('react/')) return true;
          if (id === 'react/jsx-runtime' || id === 'react/jsx-dev-runtime') return true;
          if (id.startsWith('next/')) return true;
          if (builtins.has(id)) return true;
          if (id.includes('@prisma') || id.includes('isolated-vm') || id.includes('sharp') || id.includes('bcrypt')) return true;
          return false;
        },
      },
      target: 'es2020',
    },
    resolve: {
      alias: {
        '@': srcDir,
      },
    },
    esbuild: {
      loader: input.endsWith('.tsx') ? 'tsx' : 'ts',
      jsx: 'automatic',
    },
    logLevel: 'error',
  });

  const chunk = result.output[0];
  if (chunk && chunk.code) {
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, chunk.code);
    process.exit(0);
  } else {
    console.error('No output generated');
    process.exit(1);
  }
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
