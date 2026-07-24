/**
 * Creates a new compiled plugin scaffold.
 * Usage: bun run create-plugin
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const pluginsDir = path.join(root, 'plugins');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q) => new Promise((r) => rl.question(q, r));

const VALID_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const PERMISSIONS = [
  'db.read.post', 'db.write.post', 'db.read.user', 'db.write.user',
  'db.read.media', 'db.write.media', 'db.read.comment', 'db.write.comment',
  'db.read.setting', 'db.write.setting',
  'system.auth.read', 'http.outbound.request',
  'webhook.inbound.register', 'system.route.register',
  'system.ui.register.admin_nav', 'system.ui.register.public_route',
  'system.hook.filter.route_access',
];

console.log('');
console.log('=== Create Plugin ===');
console.log('');

const name = (await ask('Plugin name (kebab-case): ')).trim();
if (!VALID_ID.test(name)) {
  console.error(`Invalid name "${name}". Use lowercase kebab-case (e.g. my-plugin).`);
  process.exit(1);
}

const pluginDir = path.join(pluginsDir, name);
try {
  await fs.access(pluginDir);
  console.error(`Plugin "${name}" already exists at ${pluginDir}`);
  process.exit(1);
} catch {}

const version = (await ask('Version [1.0.0]: ')).trim() || '1.0.0';
const description = (await ask('Description: ')).trim();

console.log('');
console.log('Available permissions:');
PERMISSIONS.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
console.log('');
const permInput = (await ask('Permissions (comma-separated numbers or names, or empty): ')).trim();

let permissions = [];
if (permInput) {
  permissions = permInput.split(',').map((s) => {
    const t = s.trim();
    const num = parseInt(t);
    if (!isNaN(num) && num >= 1 && num <= PERMISSIONS.length) {
      return PERMISSIONS[num - 1];
    }
    return t;
  });
}

console.log('');
const sandboxInput = (await ask('Use isolated-vm sandbox? (Y/n): ')).trim().toLowerCase();
const sandbox = sandboxInput !== 'n' && sandboxInput !== 'no';

rl.close();

// Create directory
await fs.mkdir(pluginDir, { recursive: true });

// Write plugin.json
const manifest = {
  name,
  version,
  description: description || `${name} plugin`,
  permissions,
  sandbox,
};

await fs.writeFile(
  path.join(pluginDir, 'plugin.json'),
  JSON.stringify(manifest, null, 2) + '\n'
);

// Write index.ts
const indexContent = `/**
 * ${name} plugin
 * ${description || ''}
 *
 * Bridge API docs: see docs/PLUGINS.md
 */
export default async function init(bridge) {
  bridge.log('Plugin "${name}" loaded');

  // Example: register an action
  // bridge.hooks.addAction('post.created', async (post) => {
  //   bridge.log('New post:', post.title);
  // });

  // Example: register a filter
  // bridge.hooks.addFilter('post.before_validate', async (data) => {
  //   return data;
  // });

  // Example: register admin sidebar nav
  // bridge.hooks.registerAdminNav({
  //   href: '/admin/${name}',
  //   label: '${name}',
  // });

  // Example: register a custom route
  // bridge.routes.register({
  //   path: '/${name}/:slug',
  //   template: 'single',
  //   handler: async (ctx) => {
  //     return { title: 'Hello from ${name}', slug: ctx.params.slug };
  //   },
  // });
}
`;

await fs.writeFile(path.join(pluginDir, 'index.ts'), indexContent);

console.log('');
console.log(`Plugin "${name}" created at plugins/${name}/`);
console.log('');
console.log('  plugin.json');
console.log('  index.ts');
console.log('');
if (sandbox) {
  console.log('  Type: sandboxed (isolated-vm)');
  console.log('  The plugin will be auto-registered in the database on next boot.');
} else {
  console.log('  Type: compiled (direct Node.js)');
  console.log('  Run "npm run generate" to add it to the plugin registry.');
}
