import { createExecutionContext, createScheduledController, env } from 'cloudflare:test';
import { GetPlanOutput } from '@/usecases/getPlan';
import { getPlan } from '@worker/scheduled/getPlan';
import { LineMessage, Notifier } from '@worker/scheduled/notifier';

const mockUsecase = vi.fn(() => Promise.resolve({} as GetPlanOutput));

class MockLineNotifier implements Notifier<GetPlanOutput, LineMessage[]> {
  constructor() {}
  pushMessage = vi.fn(() => Promise.resolve([]));
}

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
    await getPlan(mockUsecase)(MockLineNotifier)(ctrl, env, ctx);
    expect(loggerSpy).toHaveBeenCalledOnce();
  });
});
