import { createExecutionContext, createScheduledController, env } from 'cloudflare:test';
import { PlanSchema } from '@/readingPlans';
import { toTextMessage } from '@/services/notifiers/telegram/utils';
import { newRepositories, newTelegramServices, newUsecases } from '@worker/scheduled';
import getPlanThenNotifyTelegram from '@worker/scheduled/getPlanThenNotifyTelegram';
import { insertPlanRecord, insertRecipientRecord, planRecordFixture } from 'test/helpers/d1';

const configuredEnv = {
  ...env,
  TELEGRAM_BOT_TOKEN: '123456:secret-token',
  TELEGRAM_CHAT_IDS: '-100123, @devotion_channel, -100123',
  TELEGRAM_ADMIN_CHAT_ID: '987654',
};
const event = createScheduledController({ scheduledTime: new Date('2024-12-31T23:00:00Z') });
const execution = createExecutionContext();
const plan = PlanSchema.parse(planRecordFixture);
const getPlan = vi.fn();
const pushMessage = vi.fn();
const context = { usecases: { getPlan }, services: { notifier: { pushMessage } } };
let logSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  getPlan.mockReset().mockResolvedValue(plan);
  pushMessage.mockReset().mockResolvedValue([{ status: 'fulfilled', value: undefined }]);
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Telegram scheduled delivery acceptance', () => {
  it('uses the scheduled Taipei date and sends only to unique configured destinations', async () => {
    await getPlanThenNotifyTelegram(context)(event, configuredEnv, execution);
    expect(getPlan).toHaveBeenCalledExactlyOnceWith({ date: '2025-01-01' });
    expect(pushMessage).toHaveBeenCalledExactlyOnceWith(
      ['-100123', '@devotion_channel'],
      toTextMessage(plan),
    );
  });

  it('sends a missing-plan notice only to the Telegram admin', async () => {
    getPlan.mockResolvedValue(null);
    await getPlanThenNotifyTelegram(context)(event, configuredEnv, execution);
    expect(pushMessage).toHaveBeenCalledExactlyOnceWith(['987654'], {
      text: 'No Plan Found for 2025-01-01',
      entities: [],
    });
  });

  it('skips Telegram without looking up a plan when all Telegram settings are absent or blank', async () => {
    for (const value of [undefined, '', ' ']) {
      await getPlanThenNotifyTelegram(context)(
        event,
        {
          ...configuredEnv,
          TELEGRAM_BOT_TOKEN: value,
          TELEGRAM_CHAT_IDS: value,
          TELEGRAM_ADMIN_CHAT_ID: value,
        },
        execution,
      );
    }
    expect(getPlan).not.toHaveBeenCalled();
    expect(pushMessage).not.toHaveBeenCalled();
  });

  it.each([
    { TELEGRAM_BOT_TOKEN: '' },
    { TELEGRAM_CHAT_IDS: '' },
    { TELEGRAM_ADMIN_CHAT_ID: '' },
    { TELEGRAM_BOT_TOKEN: 'malformed-secret-token' },
    { TELEGRAM_CHAT_IDS: '-100123,,@devotion_channel' },
    { TELEGRAM_CHAT_IDS: 'C123456-LINE-ID' },
    { TELEGRAM_CHAT_IDS: '0' },
    { TELEGRAM_ADMIN_CHAT_ID: '987654,123456' },
  ])(
    'rejects incomplete or malformed configuration before looking up or sending content: %j',
    async (settings) => {
      await expect(
        getPlanThenNotifyTelegram(context)(event, { ...configuredEnv, ...settings }, execution),
      ).rejects.toThrow('Telegram configuration');
      expect(getPlan).not.toHaveBeenCalled();
      expect(pushMessage).not.toHaveBeenCalled();
    },
  );

  it('reports partial delivery failures to the scheduler', async () => {
    pushMessage.mockResolvedValue([
      { status: 'rejected', reason: new Error('Telegram delivery failed') },
      { status: 'fulfilled', value: undefined },
    ]);
    await expect(
      getPlanThenNotifyTelegram(context)(event, configuredEnv, execution),
    ).rejects.toThrow('Telegram delivery failed for 1 chat(s)');
    expect(logSpy).toHaveBeenCalledWith('Telegram notification completed', {
      delivered: 1,
      failed: 1,
    });
  });

  it('reads the real D1 plan and posts it without using LINE recipients', async () => {
    await insertPlanRecord();
    await insertRecipientRecord();
    const fetch = vi.fn(() =>
      Promise.resolve(Response.json({ ok: true, result: { message_id: 1 } })),
    );
    vi.stubGlobal('fetch', fetch);
    const settings = { ...configuredEnv, TELEGRAM_CHAT_IDS: '-100123' };
    await getPlanThenNotifyTelegram({
      usecases: newUsecases(newRepositories(settings)),
      services: newTelegramServices(settings),
    })(event, settings, execution);
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][0]).toBe(
      'https://api.telegram.org/bot123456:secret-token/sendMessage',
    );
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      chat_id: '-100123',
      ...toTextMessage(plan),
      link_preview_options: { is_disabled: true },
    });
  });
});
