import { createServer } from 'http';
import next from 'next';
import path from 'path';
import fs from 'fs';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

/**
 * Custom Next.js server that provides native require() for theme loading.
 *
 * The standalone Next.js build uses Turbopack which prevents dynamic requires.
 * This custom server bypasses that by running Next.js as a regular Node.js app,
 * where require() works natively for loading theme modules at runtime.
 */

// Make require available globally for theme loading
const module = await import('module');
const createRequire = (module as any).createRequire || ((filename: string) => {
  const { createRequire: cr } = require('module');
  return cr(filename);
});

// Create a require function scoped to this directory
const require = createRequire(import.meta.url);

// Expose require globally for ThemeRenderer
(globalThis as any).__themeRequire = require;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
