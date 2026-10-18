import { createExecutionContext, createScheduledController, env } from 'cloudflare:test';
import worker from '@worker/index';
import * as scheduled from '@worker/scheduled';
import * as lineJob from '@worker/scheduled/getPlanThenNotifyLine';
import * as telegramJob from '@worker/scheduled/getPlanThenNotifyTelegram';

const mocks = vi.hoisted(() => ({
  line: vi.fn(),
  telegram: vi.fn(),
  lineServices: vi.fn(),
  telegramServices: vi.fn(),
}));
let errorSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  vi.resetAllMocks();
  mocks.line.mockResolvedValue(undefined);
  mocks.telegram.mockResolvedValue(undefined);
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new Error('Unexpected network request'))),
  );
  vi.spyOn(scheduled, 'newLineServices', 'get').mockReturnValue(mocks.lineServices);
  vi.spyOn(scheduled, 'newTelegramServices', 'get').mockReturnValue(mocks.telegramServices);
  vi.spyOn(lineJob, 'default', 'get').mockReturnValue(() => mocks.line);
  vi.spyOn(telegramJob, 'default', 'get').mockReturnValue(() => mocks.telegram);
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const run = () => worker.scheduled(createScheduledController(), env, createExecutionContext());

describe('Scheduled channel isolation acceptance', () => {
  it('awaits both jobs on the same scheduled event', async () => {
    let finishTelegram!: () => void;
    mocks.telegram.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishTelegram = resolve;
        }),
    );
    let finished = false;
    const pending = run().then(() => {
      finished = true;
    });
    await Promise.resolve();
    expect(mocks.line).toHaveBeenCalledOnce();
    expect(mocks.telegram).toHaveBeenCalledOnce();
    expect(mocks.line.mock.calls[0]).toEqual(mocks.telegram.mock.calls[0]);
    expect(finished).toBe(false);
    finishTelegram();
    await pending;
  });

  it.each(['line', 'telegram'] as const)(
    'still attempts both channels when %s delivery fails',
    async (channel) => {
      mocks[channel].mockRejectedValue(new Error('delivery failed'));
      await expect(run()).rejects.toThrow('scheduled notification jobs failed');
      expect(mocks.line).toHaveBeenCalledOnce();
      expect(mocks.telegram).toHaveBeenCalledOnce();
      expect(errorSpy).toHaveBeenCalledWith('Scheduled notification job failed', {
        channel: channel.toUpperCase(),
        error: 'delivery failed',
      });
    },
  );

  it('identifies both failed channels in structured error logs', async () => {
    mocks.line.mockRejectedValue(new Error('LINE delivery failed'));
    mocks.telegram.mockRejectedValue(new Error('Telegram delivery failed'));

    await expect(run()).rejects.toThrow('scheduled notification jobs failed');
    expect(errorSpy).toHaveBeenCalledTimes(2);
    expect(errorSpy).toHaveBeenCalledWith('Scheduled notification job failed', {
      channel: 'LINE',
      error: 'LINE delivery failed',
    });
    expect(errorSpy).toHaveBeenCalledWith('Scheduled notification job failed', {
      channel: 'TELEGRAM',
      error: 'Telegram delivery failed',
    });
  });

  it.each([
    ['lineServices', 'telegram'],
    ['telegramServices', 'line'],
  ] as const)(
    'still runs the other channel when %s initialization fails',
    async (factory, otherChannel) => {
      mocks[factory].mockImplementation(() => {
        throw new Error('initialization failed');
      });
      await expect(run()).rejects.toThrow('scheduled notification jobs failed');
      expect(mocks[otherChannel]).toHaveBeenCalledOnce();
    },
  );
});
