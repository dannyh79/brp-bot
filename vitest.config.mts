import path from 'node:path';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';
import tsconfig from './tsconfig.json' with { type: 'json' };

const rootDir = import.meta.dirname;
const migrationsPath = path.resolve(rootDir, 'migrations');
const migrations = await readD1Migrations(migrationsPath);

// Create an alias object from the paths in tsconfig.json
const alias = {
  ...Object.fromEntries(
    Object.entries(tsconfig.compilerOptions.paths).map(([key, [value]]) => [
      // Remove the "/*" from the key and resolve the path
      key.replace('/*', ''),
      // Remove the "/*" from the value Resolve the relative path
      path.resolve(rootDir, value.replace('/*', '')),
    ]),
  ),
  test: path.resolve(rootDir, 'test'),
};

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.toml' },
      miniflare: {
        compatibilityFlags: ['nodejs_compat'],
        bindings: {
          TEST_MIGRATIONS: migrations,
        },
      },
    }),
  ],

  resolve: {
    alias,
  },

  test: {
    globals: true,
    setupFiles: ['./test/setups/applyMigrations.ts'],

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
            '@root': rootDir,
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
