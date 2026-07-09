// Custom server wrapper for theme loading support.
// This runs BEFORE the standard Next.js standalone server,
// injecting a global require function for theme modules.

// Expose require globally for ThemeRenderer
globalThis.__themeRequire = require;

const fs = require('fs');
const path = require('path');

const bundledDefaultTheme = path.join(__dirname, 'bundled-themes', 'default');
const runtimeDefaultTheme = path.join(__dirname, 'themes', 'default');

if (!fs.existsSync(runtimeDefaultTheme) && fs.existsSync(bundledDefaultTheme)) {
  fs.mkdirSync(path.dirname(runtimeDefaultTheme), { recursive: true });
  fs.cpSync(bundledDefaultTheme, runtimeDefaultTheme, { recursive: true });
}

// Load and run the standard Next.js standalone server
require('./server.js');
