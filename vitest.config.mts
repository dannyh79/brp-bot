import path from 'node:path';
import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config';
import { coverageConfigDefaults } from 'vitest/config';

const migrationsPath = path.resolve(__dirname, 'migrations');
const migrations = await readD1Migrations(migrationsPath);

export default defineWorkersConfig({
  resolve: {
    // NOTE: Ensure alias matches tsconfig.json
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@worker': path.resolve(__dirname, './worker'),
    },
  },

  test: {
    globals: true,
    setupFiles: ['./test/setups/applyMigrations.ts'],
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations,
          },
        },
      },
    },

    coverage: {
      provider: 'istanbul',
      exclude: [
        'worker/index.ts', // entrypoint of Cloudflare Workers
        '**/types.ts', // type definitions
        ...coverageConfigDefaults.exclude,
      ],
    },

    workspace: [
      {
        extends: true,
        test: {
          include: ['./test/**/*.spec.ts'],
          exclude: ['./test/scripts/**/*.spec.ts', './test/worker/**/*.spec.ts'],
          name: 'brp',
        },
      },
      {
        extends: true,
        test: {
          include: ['./test/worker/**/*.spec.ts'],
          name: 'cf', // cloudflare
        },
      },

      // NOTE: Run node tests separately from not extending defineWorkersConfig
      {
        resolve: {
          // NOTE: Ensure alias matches tsconfig.json
          alias: {
            '@root': __dirname,
          },
        },
        test: {
          globals: true,
          include: ['./test/scripts/**/*.spec.ts'],
          name: 'scripts',
          environment: 'node',
        },
      },
    ],
  },
});
