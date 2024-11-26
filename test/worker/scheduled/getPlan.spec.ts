import { createExecutionContext, createScheduledController, env } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPlan } from '../../../worker/scheduled';

const loggerSpy = vi.spyOn(console, 'log');

describe('getPlan()', () => {
  afterEach(() => {
    loggerSpy.mockClear();
  });

  it('logs the plan for the date', async () => {
    const ctrl = createScheduledController({
      scheduledTime: new Date(Date.UTC(2024, 10, 25, 23)),
      cron: '0 0 * * *',
    });
    const ctx = createExecutionContext();
    await getPlan(ctrl, env, ctx);
    expect(loggerSpy).toHaveBeenNthCalledWith(1, {
      date: '2024-11-26',
      scope: '創世紀 23',
      content: [
        '1. 從亞伯拉罕與赫人和以弗倫的對話中你可以看見他是一位怎麼樣的人呢?為什麼?',
        '2. 亞伯拉罕的品格有什麼值得你學習的地方?',
      ],
    });
  });

  it('logs null', async () => {
    const ctrl = createScheduledController({
      scheduledTime: new Date(0),
      cron: '0 0 * * *',
    });
    const ctx = createExecutionContext();
    await getPlan(ctrl, env, ctx);
    expect(loggerSpy).toHaveBeenNthCalledWith(1, null);
  });
});
