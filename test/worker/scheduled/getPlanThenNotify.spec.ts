import { createExecutionContext, createScheduledController, env } from 'cloudflare:test';
import { GetPlanOutput } from '@/readingPlans';
import getPlanThenNotify from '@worker/scheduled/getPlanThenNotify';

const mockUsecase = vi.fn(() => Promise.resolve({} as GetPlanOutput));

const MockNotifier = vi.fn();
MockNotifier.prototype.pushMessage = vi.fn(() => Promise.resolve([]));

// ** Mock implementation to aviod logging in test output */
const loggerSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

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
    await getPlanThenNotify(mockUsecase)(MockNotifier)(ctrl, env, ctx);
    expect(loggerSpy).toHaveBeenCalledOnce();
  });
});
