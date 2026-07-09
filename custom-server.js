const { createServer } = require('http');
const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

/**
 * Custom Next.js server that provides native require() for theme loading.
 *
 * The standalone Next.js build bundles everything internally.
 * This custom server uses the standalone server's internal modules
 * and adds a global require function for theme loading.
 */

// Expose require globally for ThemeRenderer
globalThis.__themeRequire = require;

// Set up Next.js standalone configuration
process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify({
  experimental: {},
  images: {},
});

const NextServer = require('next/dist/server/next-server');

const nextServer = new NextServer({
  dev,
  hostname,
  port,
  httpServer: null,
  dir: __dirname,
  quiet: false,
});

const handle = nextServer.getRequestHandler();

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
