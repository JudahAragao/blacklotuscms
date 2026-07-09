const { createServer } = require('http');
const next = require('next');
const path = require('path');
const fs = require('fs');

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
const moduleCreateRequire = require('module').createRequire;
const requireFunc = moduleCreateRequire(__filename);

// Expose require globally for ThemeRenderer
globalThis.__themeRequire = requireFunc;

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
