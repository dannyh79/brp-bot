import { createExecutionContext, createScheduledController, env } from 'cloudflare:test';
import { GetPlanOutput } from '@/readingPlans';
import getPlanThenNotifyLine from '@worker/scheduled/getPlanThenNotifyLine';

const mockUsecase = vi.fn(() => Promise.resolve({} as GetPlanOutput | null));

const mockPushMessage = vi.fn(() => Promise.resolve([]));
const MockNotifier = vi.fn();
MockNotifier.prototype.pushMessage = mockPushMessage;

// ** Mock implementation to aviod logging in test output */
const loggerSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('getPlanThenNotifyLine()', () => {
  afterEach(() => {
    mockUsecase.mockRestore();
    mockPushMessage.mockRestore();
    MockNotifier.mockRestore();
    loggerSpy.mockClear();
  });

  it('pushes the message to target then logs the result', async () => {
    const ctrl = createScheduledController({
      scheduledTime: new Date(Date.UTC(2024, 10, 25, 23)),
      cron: '0 0 * * *',
    });
    const ctx = createExecutionContext();
    const targetReceipientIds = env.LINE_RECEIPIENT_IDS;
    await getPlanThenNotifyLine(mockUsecase)(MockNotifier)(ctrl, env, ctx);

    expect(MockNotifier).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ to: targetReceipientIds }),
    );
    expect(mockPushMessage).toHaveBeenCalledOnce();
    expect(loggerSpy).toHaveBeenCalledOnce();
  });

  describe('when there is NO reading plan', () => {
    it('pushes a message to admin then logs the result', async () => {
      mockUsecase.mockResolvedValue(null);
      const ctrl = createScheduledController({
        scheduledTime: new Date(Date.UTC(2024, 10, 25, 23)),
        cron: '0 0 * * *',
      });
      const ctx = createExecutionContext();
      const adminReceipientId = env.LINE_ADMIN_RECEIPIENT_ID;
      await getPlanThenNotifyLine(mockUsecase)(MockNotifier)(ctrl, env, ctx);

      expect(MockNotifier).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ to: [adminReceipientId] }),
      );
      expect(mockPushMessage).toHaveBeenCalledOnce();
      expect(loggerSpy).toHaveBeenCalledOnce();
    });
  });
});
