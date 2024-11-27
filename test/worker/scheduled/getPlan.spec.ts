import { createExecutionContext, createScheduledController, env } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPlan } from '../../../worker/scheduled';

vi.mock('../../../worker/scheduled/messageClient/line', () => {
  return {
    createClient: vi.fn(() => ({
      pushMessage: vi.fn(() => Promise.resolve('Mocked pushMessage response')),
    })),
    toBubbleMessage: vi.fn((data) => data),
  };
});

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
    expect(loggerSpy).toHaveBeenCalledOnce();
  });
});
