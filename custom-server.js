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

// Auto-approve default theme permissions on startup
// This ensures the built-in theme works without manual permission approval
async function approveDefaultThemePermissions() {
  try {
    const { PrismaClient } = require('./node_modules/@prisma/client');
    const prisma = new PrismaClient();

    const defaultCapabilities = [
      'db.read.post',
      'db.read.menu',
      'db.read.comment',
      'system.setting.read',
      'theme.data.read',
      'theme.data.write',
      'system.hook.filter.theme_footer_social',
      'system.hook.filter.theme_after_footer',
      'system.hook.filter.theme_before_header',
      'system.hook.filter.theme_after_header',
    ];

    for (const capability of defaultCapabilities) {
      await prisma.themePermission.upsert({
        where: {
          requesterTheme_providerName_capability: {
            requesterTheme: 'default',
            providerName: 'system',
            capability,
          },
        },
        update: { status: 'approved' },
        create: {
          requesterTheme: 'default',
          providerName: 'system',
          capability,
          status: 'approved',
        },
      });
    }

    console.log('[BlackLotusCMS] Default theme permissions auto-approved.');
    await prisma.$disconnect();
  } catch (err) {
    // Non-fatal: permissions will be requested on first access
    console.warn('[BlackLotusCMS] Could not auto-approve default theme permissions:', err.message);
  }
}

// Run permission approval before starting the server
approveDefaultThemePermissions().then(() => {
  // Load and run the standard Next.js standalone server
  require('./server.js');
}).catch(() => {
  // Even if permission approval fails, start the server
  require('./server.js');
});
