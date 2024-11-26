import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

const stubDomain = 'https://brp-bot.pages.dev';

describe('/plan', () => {
  it('responds 200 with plan for the date', async () => {
    const response = await SELF.fetch(`${stubDomain}/plan?date=2024-11-26`);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      date: '2024-11-26',
      scope: '創世紀 23',
      content: ['1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?'],
    });
  });

  it('responds 404', async () => {
    const response = await SELF.fetch(`${stubDomain}/plan?date=2024-11-32`);
    expect(response.status).toBe(404);
  });
});
