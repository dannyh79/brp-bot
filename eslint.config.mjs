// @ts-check

// Ref: https://typescript-eslint.io/getting-started#step-2-configuration
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(eslint.configs.recommended, tseslint.configs.recommended, {
  ignores: ['node_modules/', '.wrangler', 'worker-configuration.d.ts'],
});
