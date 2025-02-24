import { createExecutionContext, createScheduledController, env } from 'cloudflare:test';
import { GetPlanOutput, ListRecipientsOutput } from '@/readingPlans';
import getPlanThenNotifyLine from '@worker/scheduled/getPlanThenNotifyLine';
import * as helper from 'test/helpers/d1';

// ** Mock implementation to aviod logging in test output */
const loggerSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('getPlanThenNotifyLine()', () => {
  const recipient = helper.recipientRecordFixture;
  const ctrl = createScheduledController({
    scheduledTime: new Date(Date.UTC(2024, 10, 25, 23)),
    cron: '0 0 * * *',
  });
  const ctx = createExecutionContext();

  beforeEach(async () => {
    await helper.insertRecipientRecord(recipient);
  });

  afterEach(() => {
    mockGetPlan.mockRestore();
    mockListRecipients.mockRestore();
    mockPushMessage.mockRestore();
    loggerSpy.mockClear();
  });

  it('pushes the message to target then logs the result', async () => {
    mockListRecipients.mockResolvedValue([recipient]);
    await getPlanThenNotifyLine({ usecases, services })(ctrl, env, ctx);

    expect(mockPushMessage).toHaveBeenNthCalledWith(1, [recipient.id], expect.any(Object));
    expect(loggerSpy).toHaveBeenCalledOnce();
  });

  describe('when there is NO reading plan', () => {
    it('pushes a message to admin then logs the result', async () => {
      mockGetPlan.mockResolvedValue(null);
      await getPlanThenNotifyLine({ usecases, services })(ctrl, env, ctx);

      expect(mockPushMessage).toHaveBeenNthCalledWith(
        1,
        [env.LINE_ADMIN_RECIPIENT_ID],
        expect.any(Object),
      );
      expect(loggerSpy).toHaveBeenCalledOnce();
    });
  });
});

const mockGetPlan = vi.fn(() => Promise.resolve({} as GetPlanOutput | null));
const mockListRecipients = vi.fn(() => Promise.resolve([] as ListRecipientsOutput));
const usecases = {
  getPlan: mockGetPlan,
  listRecipients: mockListRecipients,
};

const mockPushMessage = vi.fn(() => Promise.resolve([]));
const Notifier = vi.fn();
Notifier.prototype.pushMessage = mockPushMessage;
const services = {
  notifier: new Notifier(),
};
