import { afterEach } from 'vitest';
import { applyD1Migrations, env } from 'cloudflare:test';

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);

afterEach(async () => {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM recipients'),
    env.DB.prepare('DELETE FROM plans'),
  ]);
});
