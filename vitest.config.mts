import path from 'node:path';
import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config';

const migrationsPath = path.resolve(__dirname, 'migrations');
const migrations = await readD1Migrations(migrationsPath);

export default defineWorkersConfig({
  test: {
    globals: true,
    setupFiles: ['./test/setups/applyMigrations.ts'],
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations,
          }
        },
      },
    },

    workspace: [
      {
        extends: true,
        test: {
          include: ['./test/**/*.spec.ts'],
          exclude: ['./test/scripts/**/*.spec.ts', './test/worker/**/*.spec.ts'],
          name: 'brp',
        }
      },
      {
        extends: true,
        test: {
          include: ['./test/worker/**/*.spec.ts'],
          name: 'cf', // cloudflare
        }
      },
      {
        extends: true,
        test: {
          include: ['./test/scripts/**/*.spec.ts'],
          name: 'scripts',
          environment: 'node',
        }
      },
    ],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Ensure alias matches tsconfig.json
      '@worker': path.resolve(__dirname, './worker'),
    },
  },
});
