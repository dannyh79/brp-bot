import path from 'node:path';
import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config';
import { coverageConfigDefaults } from 'vitest/config';
import tsconfig from './tsconfig.json';

const migrationsPath = path.resolve(__dirname, 'migrations');
const migrations = await readD1Migrations(migrationsPath);

// Create an alias object from the paths in tsconfig.json
const alias = Object.fromEntries(
  Object.entries(tsconfig.compilerOptions.paths).map(([key, [value]]) => [
    // Remove the "/*" from the key and resolve the path
    key.replace('/*', ''),
    // Remove the "/*" from the value Resolve the relative path
    path.resolve(__dirname, value.replace('/*', '')),
  ]),
);

export default defineWorkersConfig({
  resolve: {
    alias,
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

    projects: [
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
