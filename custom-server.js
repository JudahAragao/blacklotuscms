// Custom server wrapper for theme loading support.
// This runs BEFORE the standard Next.js standalone server,
// injecting a global require function for theme modules.

// Expose require globally for ThemeRenderer
globalThis.__themeRequire = require;

// Load and run the standard Next.js standalone server
require('./server.js');
