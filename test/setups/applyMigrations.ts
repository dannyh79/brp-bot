import { afterEach } from 'vitest';
import { applyD1Migrations, env } from 'cloudflare:test';

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
await env.DB.prepare(
  `
    CREATE TABLE IF NOT EXISTS subsection_blocks (
      date VARCHAR(10) NOT NULL,
      section VARCHAR(20) NOT NULL,
      position VARCHAR(20) NOT NULL,
      title TEXT NULL,
      scripture_content TEXT NULL,
      scripture_scope TEXT NULL,
      content TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      PRIMARY KEY (date, section, position, sort_order),
      FOREIGN KEY (date) REFERENCES plans(date)
    )
  `,
).run();

afterEach(async () => {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM subsection_blocks'),
    env.DB.prepare('DELETE FROM recipients'),
    env.DB.prepare('DELETE FROM plans'),
  ]);
});
