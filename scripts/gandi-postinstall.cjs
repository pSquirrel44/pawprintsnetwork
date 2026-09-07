const { spawnSync } = require('node:child_process');

// Gandi installs npm dependencies during git deployment. Build the Vite client
// and Express bundle only in that environment, while leaving ordinary local
// npm installs fast and side-effect free.
if (!process.env.GANDI) {
  process.exit(0);
}

console.log('Gandi environment detected; creating the production bundle.');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npmCommand, ['run', 'build'], {
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit',
});

if (result.error) {
  console.error('Unable to start the Gandi production build:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
