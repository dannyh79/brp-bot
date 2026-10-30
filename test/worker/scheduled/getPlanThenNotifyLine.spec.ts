import { createExecutionContext, createScheduledController, env } from 'cloudflare:test';
import { GetPlanOutput, ListRecipientsOutput } from '@/readingPlans';
import getPlanThenNotifyLine from '@worker/scheduled/getPlanThenNotifyLine';
import * as helper from 'test/helpers/d1';

// ** Mock implementation to aviod logging in test output */
const loggerSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const configuredEnv = {
  ...env,
  LINE_CHANNEL_ACCESS_TOKEN: 'test-line-token',
  LINE_ADMIN_RECIPIENT_ID: 'U12345678901234567890123456789012',
};

describe('getPlanThenNotifyLine()', () => {
  const recipient = helper.recipientRecordFixture;
  const ctrl = createScheduledController({
    scheduledTime: new Date(Date.UTC(2024, 10, 25, 23)),
    cron: '0 0 * * *',
  });
  const ctx = createExecutionContext();

  afterEach(() => {
    mockGetPlan.mockRestore();
    mockListRecipients.mockRestore();
    mockPushMessage.mockRestore();
    loggerSpy.mockClear();
  });

  it.each([undefined, '', ' '])(
    'skips an unconfigured LINE job (%j) before looking up or sending content',
    async (value) => {
      await getPlanThenNotifyLine({ usecases, services })(
        ctrl,
        {
          ...configuredEnv,
          LINE_CHANNEL_ACCESS_TOKEN: value,
          LINE_ADMIN_RECIPIENT_ID: value,
        },
        ctx,
      );
      expect(mockGetPlan).not.toHaveBeenCalled();
      expect(mockListRecipients).not.toHaveBeenCalled();
      expect(mockPushMessage).not.toHaveBeenCalled();
      expect(loggerSpy).not.toHaveBeenCalled();
    },
  );

  it.each([
    { LINE_CHANNEL_ACCESS_TOKEN: undefined },
    { LINE_CHANNEL_ACCESS_TOKEN: '' },
    { LINE_CHANNEL_ACCESS_TOKEN: ' ' },
    { LINE_ADMIN_RECIPIENT_ID: undefined },
    { LINE_ADMIN_RECIPIENT_ID: '' },
    { LINE_ADMIN_RECIPIENT_ID: ' ' },
  ])(
    'rejects partial LINE configuration before looking up or sending content: %j',
    async (settings) => {
      await expect(
        getPlanThenNotifyLine({ usecases, services })(
          ctrl,
          {
            ...configuredEnv,
            ...settings,
          },
          ctx,
        ),
      ).rejects.toThrow(
        'LINE configuration requires LINE_CHANNEL_ACCESS_TOKEN and LINE_ADMIN_RECIPIENT_ID',
      );
      expect(mockGetPlan).not.toHaveBeenCalled();
      expect(mockListRecipients).not.toHaveBeenCalled();
      expect(mockPushMessage).not.toHaveBeenCalled();
    },
  );

  it('pushes the message to target then logs the result', async () => {
    await helper.insertRecipientRecord(recipient);
    mockListRecipients.mockResolvedValue([recipient]);
    await getPlanThenNotifyLine({ usecases, services })(ctrl, configuredEnv, ctx);

    expect(mockPushMessage).toHaveBeenNthCalledWith(1, [recipient.id], expect.any(Object));
    expect(loggerSpy).toHaveBeenCalledOnce();
  });

  describe('when there is NO reading plan', () => {
    it('pushes a message to admin then logs the result', async () => {
      await helper.insertRecipientRecord(recipient);
      mockGetPlan.mockResolvedValue(null);
      await getPlanThenNotifyLine({ usecases, services })(ctrl, configuredEnv, ctx);

      expect(mockPushMessage).toHaveBeenNthCalledWith(
        1,
        [configuredEnv.LINE_ADMIN_RECIPIENT_ID],
        expect.any(Object),
      );
      expect(loggerSpy).toHaveBeenCalledOnce();
    });

    it('trims the configured admin ID before sending an alert', async () => {
      mockGetPlan.mockResolvedValue(null);
      await getPlanThenNotifyLine({ usecases, services })(
        ctrl,
        {
          ...configuredEnv,
          LINE_ADMIN_RECIPIENT_ID: ` ${configuredEnv.LINE_ADMIN_RECIPIENT_ID} `,
        },
        ctx,
      );
      expect(mockPushMessage).toHaveBeenCalledWith(
        [configuredEnv.LINE_ADMIN_RECIPIENT_ID],
        expect.any(Object),
      );
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
